/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-xrpl/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

import { dropsToXrp, xrpToDrops } from 'xrpl';

export class XRPL implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'XRPL',
    name: 'xrpl',
    icon: 'file:xrpl.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the XRPL API',
    defaults: {
      name: 'XRPL',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'xrplApi',
        required: true,
      },
    ],
    properties: [
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Utility',
            value: 'utility',
          }
        ],
        default: 'utility',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['utility'],
    },
  },
  options: [
    {
      name: 'Convert XRP Drops',
      value: 'convertXrpDrops',
      description: 'Convert between XRP and drops (1 XRP = 1,000,000 drops)',
      action: 'Convert XRP drops',
    },
    {
      name: 'Get Transaction',
      value: 'getTransaction',
      description: 'Get transaction information by transaction hash',
      action: 'Get transaction',
    },
    {
      name: 'Get Ledger Info',
      value: 'getLedgerInfo',
      description: 'Get information about a specific ledger',
      action: 'Get ledger info',
    },
    {
      name: 'Get Server Info',
      value: 'getServerInfo',
      description: 'Get information about the XRPL server',
      action: 'Get server info',
    },
    {
      name: 'Get Fee Estimates',
      value: 'getFeeEstimates',
      description: 'Get current transaction fee estimates',
      action: 'Get fee estimates',
    },
  ],
  default: 'convertXrpDrops',
},
      // Parameter definitions
{
  displayName: 'Conversion Type',
  name: 'conversionType',
  type: 'options',
  required: true,
  displayOptions: {
    show: {
      resource: ['utility'],
      operation: ['convertXrpDrops'],
    },
  },
  options: [
    {
      name: 'XRP to Drops',
      value: 'xrpToDrops',
      description: 'Convert XRP amount to drops',
    },
    {
      name: 'Drops to XRP',
      value: 'dropsToXrp',
      description: 'Convert drops amount to XRP',
    },
  ],
  default: 'xrpToDrops',
  description: 'Type of conversion to perform',
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['utility'],
      operation: ['convertXrpDrops'],
    },
  },
  default: '',
  description: 'Amount to convert (XRP or drops)',
},
{
  displayName: 'Transaction Hash',
  name: 'transactionHash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['utility'],
      operation: ['getTransaction'],
    },
  },
  default: '',
  description: 'The hash of the transaction to retrieve',
},
{
  displayName: 'Ledger Index',
  name: 'ledgerIndex',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['utility'],
      operation: ['getLedgerInfo'],
    },
  },
  default: 'validated',
  description: 'The ledger index or identifier (validated, closed, current, or specific number)',
},
{
  displayName: 'Include Transactions',
  name: 'includeTransactions',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['utility'],
      operation: ['getLedgerInfo'],
    },
  },
  default: false,
  description: 'Whether to include transaction data in the response',
},
{
  displayName: 'Include Accounts',
  name: 'includeAccounts',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['utility'],
      operation: ['getLedgerInfo'],
    },
  },
  default: false,
  description: 'Whether to include account state data in the response',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'utility':
        return [await executeUtilityOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeUtilityOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;

  // Get credentials and setup
  const credentials = await this.getCredentials('xrplApi');
  const network = credentials.network as string;
  
  const baseUrl = network === 'testnet' 
    ? 'https://s.altnet.rippletest.net:51234/'
    : 'https://s1.ripple.com:51234/';

  const makeRpcRequest = async (method: string, params?: any) => {
    const requestBody = {
      method,
      params: params ? [params] : [],
      id: Date.now(),
      jsonrpc: '2.0',
    };

    const response = await this.helpers.request({
      method: 'POST',
      url: baseUrl,
      body: requestBody,
      headers: {
        'Content-Type': 'application/json',
      },
      json: true,
    });

    if (response.error) {
      throw new NodeApiError(this.getNode(), response.error, {
        message: `XRPL RPC Error: ${response.error.message}`,
        description: response.error.error_message || '',
      });
    }

    return response.result;
  };

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'convertXrpDrops':
          const conversionType = this.getNodeParameter('conversionType', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;

          if (conversionType === 'xrpToDrops') {
            const drops = xrpToDrops(amount);
            result = {
              conversionType: 'XRP to Drops',
              input: amount,
              inputUnit: 'XRP',
              output: drops,
              outputUnit: 'drops',
            };
          } else {
            const xrp = dropsToXrp(amount);
            result = {
              conversionType: 'Drops to XRP',
              input: amount,
              inputUnit: 'drops',
              output: xrp,
              outputUnit: 'XRP',
            };
          }
          break;

        case 'getTransaction':
          const transactionHash = this.getNodeParameter('transactionHash', i) as string;
          result = await makeRpcRequest('tx', {
            transaction: transactionHash,
          });
          break;

        case 'getLedgerInfo':
          const ledgerIndex = this.getNodeParameter('ledgerIndex', i) as string;
          const includeTransactions = this.getNodeParameter('includeTransactions', i) as boolean;
          const includeAccounts = this.getNodeParameter('includeAccounts', i) as boolean;

          const ledgerParams: any = {
            ledger_index: ledgerIndex,
            transactions: includeTransactions,
            accounts: includeAccounts,
          };

          result = await makeRpcRequest('ledger', ledgerParams);
          break;

        case 'getServerInfo':
          result = await makeRpcRequest('server_info');
          break;

        case 'getFeeEstimates':
          result = await makeRpcRequest('fee');
          break;

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
            itemIndex: i,
          });
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { 
            error: error.message,
            operation,
            itemIndex: i,
          },
          pairedItem: { item: i },
        });
      } else {
        throw error;
      }
    }
  }

  return returnData;
}
