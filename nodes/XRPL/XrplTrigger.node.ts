/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { ITriggerFunctions, INodeType, INodeTypeDescription, ITriggerResponse } from 'n8n-workflow';
import { Client } from 'xrpl';
import { getWebSocketUrl, toXrp, formatCurrencyCode, getExplorerUrl, logLicenseNotice } from './transport/xrplClient';
import type { XrplCredentials } from './transport/xrplClient';

export class XrplTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'XRPL Trigger',
    name: 'xrplTrigger',
    icon: 'file:xrpl.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: 'Trigger workflows on XRPL events',
    defaults: { name: 'XRPL Trigger' },
    inputs: [],
    outputs: ['main'],
    credentials: [{ name: 'xrplApi', required: true }],
    properties: [
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        options: [
          { name: 'Account Transaction', value: 'accountTransaction', description: 'Trigger on transactions affecting an account' },
          { name: 'Ledger Closed', value: 'ledgerClosed', description: 'Trigger on new validated ledger' },
          { name: 'Payment Received', value: 'paymentReceived', description: 'Trigger on incoming payments' },
        ],
        default: 'accountTransaction',
      },
      { displayName: 'Account Address', name: 'accountAddress', type: 'string', default: '', description: 'Account to watch', displayOptions: { show: { event: ['accountTransaction', 'paymentReceived'] } } },
      { displayName: 'Minimum Amount (XRP)', name: 'minimumAmount', type: 'number', default: 0, displayOptions: { show: { event: ['paymentReceived'] } } },
    ],
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    logLicenseNotice();
    const credentials = await this.getCredentials('xrplApi');
    const xrplCredentials = credentials as unknown as XrplCredentials;
    const event = this.getNodeParameter('event') as string;
    const network = credentials.network as string;
    const wsUrl = getWebSocketUrl(xrplCredentials);
    const client = new Client(wsUrl);

    let accountAddress = '';
    if (event !== 'ledgerClosed') {
      accountAddress = this.getNodeParameter('accountAddress', '') as string;
      if (!accountAddress && xrplCredentials.accountAddress) accountAddress = xrplCredentials.accountAddress;
      if (!accountAddress) throw new Error('Account address is required');
    }

    const startListening = async () => {
      await client.connect();
      switch (event) {
        case 'accountTransaction':
        case 'paymentReceived': {
          const minimumAmount = event === 'paymentReceived' ? this.getNodeParameter('minimumAmount', 0) as number : 0;
          await client.request({ command: 'subscribe', accounts: [accountAddress] });
          client.on('transaction', (tx) => {
            const transaction = tx.transaction;
            const meta = tx.meta;
            if (event === 'paymentReceived') {
              if (transaction.TransactionType !== 'Payment') return;
              if (transaction.Destination !== accountAddress) return;
              if (minimumAmount > 0) {
                const deliveredAmount = typeof meta === 'object' && meta !== null && 'delivered_amount' in meta ? meta.delivered_amount : transaction.Amount;
                if (typeof deliveredAmount === 'string') {
                  const xrpAmount = parseFloat(toXrp(deliveredAmount));
                  if (xrpAmount < minimumAmount) return;
                }
              }
            }
            const output: any = { event, hash: transaction.hash, type: transaction.TransactionType, account: transaction.Account, validated: tx.validated, ledgerIndex: tx.ledger_index, timestamp: new Date().toISOString(), explorerUrl: getExplorerUrl(transaction.hash || '', network), transaction, meta };
            if (transaction.TransactionType === 'Payment') {
              const deliveredAmount = typeof meta === 'object' && meta !== null && 'delivered_amount' in meta ? meta.delivered_amount : transaction.Amount;
              output.destination = transaction.Destination;
              output.amount = deliveredAmount ? (typeof deliveredAmount === 'string' ? toXrp(deliveredAmount) + ' XRP' : `${deliveredAmount.value} ${formatCurrencyCode(deliveredAmount.currency)}`) : 'unknown';
            }
            this.emit([this.helpers.returnJsonArray([output])]);
          });
          break;
        }
        case 'ledgerClosed': {
          await client.request({ command: 'subscribe', streams: ['ledger'] });
          client.on('ledgerClosed', (ledger) => {
            const rippleEpoch = 946684800;
            const output = { event: 'ledgerClosed', ledgerIndex: ledger.ledger_index, ledgerHash: ledger.ledger_hash, ledgerTime: new Date((ledger.ledger_time + rippleEpoch) * 1000).toISOString(), txnCount: ledger.txn_count, timestamp: new Date().toISOString() };
            this.emit([this.helpers.returnJsonArray([output])]);
          });
          break;
        }
      }
    };

    await startListening();
    client.on('disconnected', async (code) => {
      if (code !== 1000) {
        console.log('XRPL WebSocket disconnected, reconnecting...');
        setTimeout(async () => { try { await startListening(); } catch (e) { console.error('Reconnect failed:', e); } }, 5000);
      }
    });

    return { closeFunction: async () => { if (client.isConnected()) await client.disconnect(); } };
  }
}
