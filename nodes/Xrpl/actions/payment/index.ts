/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { withXrplClient, toDrops, getExplorerUrl } from '../../transport/xrplClient';
import type { XrplClientContext } from '../../transport/xrplClient';
import type { Payment, TxResponse } from 'xrpl';

export const description: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['payment'] } },
    options: [
      { name: 'Send XRP', value: 'sendXrp', description: 'Send XRP to another account', action: 'Send XRP' },
      { name: 'Send Currency', value: 'sendCurrency', description: 'Send an issued currency', action: 'Send currency' },
      { name: 'Pathfind', value: 'pathfind', description: 'Find payment paths', action: 'Pathfind' },
    ],
    default: 'sendXrp',
  },
  { displayName: 'Destination Address', name: 'destination', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['payment'], operation: ['sendXrp', 'sendCurrency'] } } },
  { displayName: 'Amount (XRP)', name: 'amountXrp', type: 'number', required: true, default: 0, displayOptions: { show: { resource: ['payment'], operation: ['sendXrp'] } } },
  { displayName: 'Currency Code', name: 'currencyCode', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['payment'], operation: ['sendCurrency', 'pathfind'] } } },
  { displayName: 'Issuer', name: 'issuer', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['payment'], operation: ['sendCurrency', 'pathfind'] } } },
  { displayName: 'Amount', name: 'amountCurrency', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['payment'], operation: ['sendCurrency', 'pathfind'] } } },
  { displayName: 'Destination Account', name: 'pathDestination', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['payment'], operation: ['pathfind'] } } },
  {
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: { show: { resource: ['payment'], operation: ['sendXrp', 'sendCurrency'] } },
    options: [
      { displayName: 'Destination Tag', name: 'destinationTag', type: 'number', default: 0 },
      { displayName: 'Source Tag', name: 'sourceTag', type: 'number', default: 0 },
      { displayName: 'Memo', name: 'memo', type: 'string', default: '' },
      { displayName: 'Partial Payment', name: 'partialPayment', type: 'boolean', default: false },
    ],
  },
];

export async function execute(this: IExecuteFunctions, index: number, operation: string): Promise<INodeExecutionData[]> {
  const credentials = await this.getCredentials('xrplApi');

  return withXrplClient(credentials, async (context: XrplClientContext) => {
    const network = credentials.network as string;

    switch (operation) {
      case 'sendXrp': {
        if (!context.wallet) throw new Error('Wallet seed is required for sending payments');
        const destination = this.getNodeParameter('destination', index) as string;
        const amountXrp = this.getNodeParameter('amountXrp', index) as number;
        const options = this.getNodeParameter('options', index, {}) as any;

        const payment: Payment = {
          TransactionType: 'Payment',
          Account: context.wallet.address,
          Destination: destination,
          Amount: toDrops(amountXrp),
        };
        if (options.destinationTag) payment.DestinationTag = options.destinationTag;
        if (options.sourceTag) payment.SourceTag = options.sourceTag;
        if (options.memo) payment.Memos = [{ Memo: { MemoData: Buffer.from(options.memo).toString('hex') } }];
        if (options.partialPayment) payment.Flags = 0x00020000;

        const prepared = await context.client.autofill(payment);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);

        return [{
          json: {
            success: result.result.validated,
            hash: result.result.hash,
            ledgerIndex: result.result.ledger_index,
            destination,
            amount: amountXrp,
            fee: prepared.Fee,
            explorerUrl: getExplorerUrl(result.result.hash, network),
          },
          pairedItem: { item: index },
        }];
      }

      case 'sendCurrency': {
        if (!context.wallet) throw new Error('Wallet seed is required');
        const destination = this.getNodeParameter('destination', index) as string;
        const currencyCode = this.getNodeParameter('currencyCode', index) as string;
        const issuer = this.getNodeParameter('issuer', index) as string;
        const amountCurrency = this.getNodeParameter('amountCurrency', index) as string;
        const options = this.getNodeParameter('options', index, {}) as any;

        const payment: Payment = {
          TransactionType: 'Payment',
          Account: context.wallet.address,
          Destination: destination,
          Amount: { currency: currencyCode, issuer, value: amountCurrency },
        };
        if (options.destinationTag) payment.DestinationTag = options.destinationTag;
        if (options.memo) payment.Memos = [{ Memo: { MemoData: Buffer.from(options.memo).toString('hex') } }];

        const prepared = await context.client.autofill(payment);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);

        return [{
          json: {
            success: result.result.validated,
            hash: result.result.hash,
            destination,
            amount: amountCurrency,
            currency: currencyCode,
            explorerUrl: getExplorerUrl(result.result.hash, network),
          },
          pairedItem: { item: index },
        }];
      }

      case 'pathfind': {
        const pathDestination = this.getNodeParameter('pathDestination', index) as string;
        const currencyCode = this.getNodeParameter('currencyCode', index) as string;
        const issuer = this.getNodeParameter('issuer', index) as string;
        const amountCurrency = this.getNodeParameter('amountCurrency', index) as string;

        const response = await context.client.request({
          command: 'ripple_path_find',
          source_account: context.accountAddress,
          destination_account: pathDestination,
          destination_amount: { currency: currencyCode, value: amountCurrency, issuer },
        });

        const paths = response.result.alternatives.map((alt: any) => ({
          sourceAmount: alt.source_amount,
          pathsComputed: alt.paths_computed,
        }));

        return [{
          json: {
            destinationAccount: response.result.destination_account,
            destinationAmount: response.result.destination_amount,
            sourceAccount: response.result.source_account,
            paths,
            pathCount: paths.length,
          },
          pairedItem: { item: index },
        }];
      }

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  });
}
