/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { withXrplClient, toDrops, toXrp, getExplorerUrl } from '../../transport/xrplClient';
import type { XrplClientContext } from '../../transport/xrplClient';
import type { CheckCreate, CheckCash, CheckCancel, TxResponse } from 'xrpl';

export const description: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['check'] } },
    options: [
      { name: 'Create', value: 'create', action: 'Create check' },
      { name: 'Cash', value: 'cash', action: 'Cash check' },
      { name: 'Cancel', value: 'cancel', action: 'Cancel check' },
      { name: 'Get Checks', value: 'getChecks', action: 'Get checks' },
    ],
    default: 'create',
  },
  { displayName: 'Destination', name: 'destination', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['check'], operation: ['create'] } } },
  { displayName: 'Amount (XRP)', name: 'amount', type: 'number', required: true, default: 0, displayOptions: { show: { resource: ['check'], operation: ['create', 'cash'] } } },
  { displayName: 'Check ID', name: 'checkId', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['check'], operation: ['cash', 'cancel'] } } },
  { displayName: 'Account Address', name: 'accountAddress', type: 'string', default: '', displayOptions: { show: { resource: ['check'], operation: ['getChecks'] } } },
];

export async function execute(this: IExecuteFunctions, index: number, operation: string): Promise<INodeExecutionData[]> {
  const credentials = await this.getCredentials('xrplApi');

  return withXrplClient(credentials, async (context: XrplClientContext) => {
    const network = credentials.network as string;

    switch (operation) {
      case 'create': {
        if (!context.wallet) throw new Error('Wallet seed required');
        const destination = this.getNodeParameter('destination', index) as string;
        const amount = this.getNodeParameter('amount', index) as number;
        const check: CheckCreate = { TransactionType: 'CheckCreate', Account: context.wallet.address, Destination: destination, SendMax: toDrops(amount) };
        const prepared = await context.client.autofill(check);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);
        return [{ json: { success: result.result.validated, hash: result.result.hash, destination, amount, explorerUrl: getExplorerUrl(result.result.hash, network) }, pairedItem: { item: index } }];
      }

      case 'cash': {
        if (!context.wallet) throw new Error('Wallet seed required');
        const checkId = this.getNodeParameter('checkId', index) as string;
        const amount = this.getNodeParameter('amount', index) as number;
        const cash: CheckCash = { TransactionType: 'CheckCash', Account: context.wallet.address, CheckID: checkId, Amount: toDrops(amount) };
        const prepared = await context.client.autofill(cash);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);
        return [{ json: { success: result.result.validated, hash: result.result.hash, checkId, amount, explorerUrl: getExplorerUrl(result.result.hash, network) }, pairedItem: { item: index } }];
      }

      case 'cancel': {
        if (!context.wallet) throw new Error('Wallet seed required');
        const checkId = this.getNodeParameter('checkId', index) as string;
        const cancel: CheckCancel = { TransactionType: 'CheckCancel', Account: context.wallet.address, CheckID: checkId };
        const prepared = await context.client.autofill(cancel);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);
        return [{ json: { success: result.result.validated, hash: result.result.hash, checkId, explorerUrl: getExplorerUrl(result.result.hash, network) }, pairedItem: { item: index } }];
      }

      case 'getChecks': {
        const accountAddress = this.getNodeParameter('accountAddress', index, '') as string;
        const address = accountAddress || context.accountAddress;
        const response = await context.client.request({ command: 'account_objects', account: address, type: 'check' });
        const checks = (response.result.account_objects || []).map((obj: any) => ({
          checkId: obj.index,
          destination: obj.Destination,
          sendMax: typeof obj.SendMax === 'string' ? toXrp(obj.SendMax) + ' XRP' : obj.SendMax,
        }));
        return [{ json: { address, checks, count: checks.length }, pairedItem: { item: index } }];
      }

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  });
}
