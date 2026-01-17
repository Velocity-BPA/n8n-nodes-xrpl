/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { withXrplClient, getExplorerUrl } from '../../transport/xrplClient';
import type { XrplClientContext } from '../../transport/xrplClient';
import type { TrustSet, TxResponse } from 'xrpl';

export const description: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['trustline'] } },
    options: [
      { name: 'Create/Modify', value: 'create', description: 'Create or modify a trust line', action: 'Create trust line' },
      { name: 'Remove', value: 'remove', description: 'Remove a trust line', action: 'Remove trust line' },
    ],
    default: 'create',
  },
  { displayName: 'Currency Code', name: 'currencyCode', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['trustline'] } } },
  { displayName: 'Issuer', name: 'issuer', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['trustline'] } } },
  { displayName: 'Limit', name: 'limit', type: 'string', required: true, default: '1000000000', displayOptions: { show: { resource: ['trustline'], operation: ['create'] } } },
  {
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: { show: { resource: ['trustline'], operation: ['create'] } },
    options: [
      { displayName: 'No Ripple', name: 'noRipple', type: 'boolean', default: true },
      { displayName: 'Freeze', name: 'freeze', type: 'boolean', default: false },
    ],
  },
];

export async function execute(this: IExecuteFunctions, index: number, operation: string): Promise<INodeExecutionData[]> {
  const credentials = await this.getCredentials('xrplApi');

  return withXrplClient(credentials, async (context: XrplClientContext) => {
    if (!context.wallet) throw new Error('Wallet seed is required');
    const network = credentials.network as string;
    const currencyCode = this.getNodeParameter('currencyCode', index) as string;
    const issuer = this.getNodeParameter('issuer', index) as string;

    switch (operation) {
      case 'create': {
        const limit = String(this.getNodeParameter('limit', index));
        const options = this.getNodeParameter('options', index, {}) as any;

        const trustSet: TrustSet = {
          TransactionType: 'TrustSet',
          Account: context.wallet.address,
          LimitAmount: { currency: currencyCode, issuer, value: limit },
        };

        let flags = 0;
        if (options.noRipple) flags |= 0x00020000;
        if (options.freeze) flags |= 0x00100000;
        if (flags > 0) trustSet.Flags = flags;

        const prepared = await context.client.autofill(trustSet);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);

        return [{
          json: { success: result.result.validated, hash: result.result.hash, currency: currencyCode, issuer, limit, explorerUrl: getExplorerUrl(result.result.hash, network) },
          pairedItem: { item: index },
        }];
      }

      case 'remove': {
        const trustSet: TrustSet = {
          TransactionType: 'TrustSet',
          Account: context.wallet.address,
          LimitAmount: { currency: currencyCode, issuer, value: '0' },
        };

        const prepared = await context.client.autofill(trustSet);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);

        return [{
          json: { success: result.result.validated, hash: result.result.hash, currency: currencyCode, issuer, removed: true, explorerUrl: getExplorerUrl(result.result.hash, network) },
          pairedItem: { item: index },
        }];
      }

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  });
}
