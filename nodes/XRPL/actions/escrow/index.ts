/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { withXrplClient, toDrops, toXrp, getExplorerUrl } from '../../transport/xrplClient';
import type { XrplClientContext } from '../../transport/xrplClient';
import type { EscrowCreate, EscrowFinish, EscrowCancel, TxResponse } from 'xrpl';

export const description: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['escrow'] } },
    options: [
      { name: 'Create', value: 'create', action: 'Create escrow' },
      { name: 'Finish', value: 'finish', action: 'Finish escrow' },
      { name: 'Cancel', value: 'cancel', action: 'Cancel escrow' },
      { name: 'Get Escrows', value: 'getEscrows', action: 'Get escrows' },
    ],
    default: 'create',
  },
  { displayName: 'Destination', name: 'destination', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['escrow'], operation: ['create'] } } },
  { displayName: 'Amount (XRP)', name: 'amount', type: 'number', required: true, default: 0, displayOptions: { show: { resource: ['escrow'], operation: ['create'] } } },
  { displayName: 'Finish After', name: 'finishAfter', type: 'dateTime', default: '', displayOptions: { show: { resource: ['escrow'], operation: ['create'] } } },
  { displayName: 'Cancel After', name: 'cancelAfter', type: 'dateTime', default: '', displayOptions: { show: { resource: ['escrow'], operation: ['create'] } } },
  { displayName: 'Owner', name: 'owner', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['escrow'], operation: ['finish', 'cancel'] } } },
  { displayName: 'Offer Sequence', name: 'offerSequence', type: 'number', required: true, default: 0, displayOptions: { show: { resource: ['escrow'], operation: ['finish', 'cancel'] } } },
  { displayName: 'Account Address', name: 'accountAddress', type: 'string', default: '', displayOptions: { show: { resource: ['escrow'], operation: ['getEscrows'] } } },
];

export async function execute(this: IExecuteFunctions, index: number, operation: string): Promise<INodeExecutionData[]> {
  const credentials = await this.getCredentials('xrplApi');
  const rippleEpoch = 946684800;

  return withXrplClient(credentials, async (context: XrplClientContext) => {
    const network = credentials.network as string;

    switch (operation) {
      case 'create': {
        if (!context.wallet) throw new Error('Wallet seed required');
        const destination = this.getNodeParameter('destination', index) as string;
        const amount = this.getNodeParameter('amount', index) as number;
        const finishAfter = this.getNodeParameter('finishAfter', index) as string;
        const cancelAfter = this.getNodeParameter('cancelAfter', index) as string;
        const escrow: EscrowCreate = { TransactionType: 'EscrowCreate', Account: context.wallet.address, Destination: destination, Amount: toDrops(amount) };
        if (finishAfter) escrow.FinishAfter = Math.floor(new Date(finishAfter).getTime() / 1000) - rippleEpoch;
        if (cancelAfter) escrow.CancelAfter = Math.floor(new Date(cancelAfter).getTime() / 1000) - rippleEpoch;
        const prepared = await context.client.autofill(escrow);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);
        return [{ json: { success: result.result.validated, hash: result.result.hash, destination, amount, explorerUrl: getExplorerUrl(result.result.hash, network) }, pairedItem: { item: index } }];
      }

      case 'finish': {
        if (!context.wallet) throw new Error('Wallet seed required');
        const owner = this.getNodeParameter('owner', index) as string;
        const offerSequence = this.getNodeParameter('offerSequence', index) as number;
        const finish: EscrowFinish = { TransactionType: 'EscrowFinish', Account: context.wallet.address, Owner: owner, OfferSequence: offerSequence };
        const prepared = await context.client.autofill(finish);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);
        return [{ json: { success: result.result.validated, hash: result.result.hash, owner, offerSequence, explorerUrl: getExplorerUrl(result.result.hash, network) }, pairedItem: { item: index } }];
      }

      case 'cancel': {
        if (!context.wallet) throw new Error('Wallet seed required');
        const owner = this.getNodeParameter('owner', index) as string;
        const offerSequence = this.getNodeParameter('offerSequence', index) as number;
        const cancel: EscrowCancel = { TransactionType: 'EscrowCancel', Account: context.wallet.address, Owner: owner, OfferSequence: offerSequence };
        const prepared = await context.client.autofill(cancel);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);
        return [{ json: { success: result.result.validated, hash: result.result.hash, owner, offerSequence, explorerUrl: getExplorerUrl(result.result.hash, network) }, pairedItem: { item: index } }];
      }

      case 'getEscrows': {
        const accountAddress = this.getNodeParameter('accountAddress', index, '') as string;
        const address = accountAddress || context.accountAddress;
        const response = await context.client.request({ command: 'account_objects', account: address, type: 'escrow' });
        const escrows = (response.result.account_objects || []).map((obj: any) => ({
          destination: obj.Destination,
          amount: toXrp(obj.Amount),
          finishAfter: obj.FinishAfter ? new Date((obj.FinishAfter + rippleEpoch) * 1000).toISOString() : null,
          cancelAfter: obj.CancelAfter ? new Date((obj.CancelAfter + rippleEpoch) * 1000).toISOString() : null,
        }));
        return [{ json: { address, escrows, count: escrows.length }, pairedItem: { item: index } }];
      }

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  });
}
