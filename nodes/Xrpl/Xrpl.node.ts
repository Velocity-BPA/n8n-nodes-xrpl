/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { logLicenseNotice } from './transport/xrplClient';
import * as account from './actions/account';
import * as payment from './actions/payment';
import * as trustline from './actions/trustline';
import * as dex from './actions/dex';
import * as escrow from './actions/escrow';
import * as nft from './actions/nft';
import * as checks from './actions/checks';
import * as paymentChannel from './actions/paymentChannel';
import * as amm from './actions/amm';
import * as utils from './actions/utils';

export class Xrpl implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'XRPL',
    name: 'xrpl',
    icon: 'file:xrpl.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the XRP Ledger',
    defaults: { name: 'XRPL' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'xrplApi', required: true }],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Account', value: 'account', description: 'Get account information, balances, and settings' },
          { name: 'AMM', value: 'amm', description: 'Interact with Automated Market Maker pools' },
          { name: 'Check', value: 'check', description: 'Create, cash, or cancel checks' },
          { name: 'DEX', value: 'dex', description: 'Trade on the decentralized exchange' },
          { name: 'Escrow', value: 'escrow', description: 'Create and manage escrows' },
          { name: 'NFT', value: 'nft', description: 'Mint, trade, and manage NFTs' },
          { name: 'Payment', value: 'payment', description: 'Send XRP and issued currencies' },
          { name: 'Payment Channel', value: 'paymentChannel', description: 'Create and manage payment channels' },
          { name: 'Trust Line', value: 'trustline', description: 'Manage trust lines for issued currencies' },
          { name: 'Utility', value: 'utility', description: 'Helper functions and lookups' },
        ],
        default: 'account',
      },
      ...account.description,
      ...amm.description,
      ...checks.description,
      ...dex.description,
      ...escrow.description,
      ...nft.description,
      ...payment.description,
      ...paymentChannel.description,
      ...trustline.description,
      ...utils.description,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    logLicenseNotice();
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let result: INodeExecutionData[];
        switch (resource) {
          case 'account': result = await account.execute.call(this, i, operation); break;
          case 'amm': result = await amm.execute.call(this, i, operation); break;
          case 'check': result = await checks.execute.call(this, i, operation); break;
          case 'dex': result = await dex.execute.call(this, i, operation); break;
          case 'escrow': result = await escrow.execute.call(this, i, operation); break;
          case 'nft': result = await nft.execute.call(this, i, operation); break;
          case 'payment': result = await payment.execute.call(this, i, operation); break;
          case 'paymentChannel': result = await paymentChannel.execute.call(this, i, operation); break;
          case 'trustline': result = await trustline.execute.call(this, i, operation); break;
          case 'utility': result = await utils.execute.call(this, i, operation); break;
          default: throw new Error(`Unknown resource: ${resource}`);
        }
        returnData.push(...result);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
          continue;
        }
        throw error;
      }
    }
    return [returnData];
  }
}
