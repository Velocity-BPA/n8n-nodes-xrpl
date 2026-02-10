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

import { Client } from 'xrpl';

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
            name: 'Account',
            value: 'rESOURCEAccount',
          }
        ],
        default: 'rESOURCEAccount',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
    },
  },
  options: [
    {
      name: 'Get Account Info',
      value: 'getAccountInfo',
      description: 'Get account information including sequence number, balance, and flags',
      action: 'Get account info',
    },
    {
      name: 'Get Account Balances',
      value: 'getAccountBalances',
      description: 'Get all balances for an account including XRP and issued currencies',
      action: 'Get account balances',
    },
    {
      name: 'Get Account Lines',
      value: 'getAccountLines',
      description: 'Get trust lines for an account',
      action: 'Get account lines',
    },
    {
      name: 'Get Account NFTs',
      value: 'getAccountNfts',
      description: 'Get NFTs owned by an account',
      action: 'Get account NFTs',
    },
    {
      name: 'Get Account Transactions',
      value: 'getAccountTransactions',
      description: 'Get transaction history for an account',
      action: 'Get account transactions',
    },
    {
      name: 'Validate Address',
      value: 'validateAddress',
      description: 'Validate XRP Ledger address format',
      action: 'Validate address',
    },
  ],
  default: 'getAccountInfo',
},
      // Parameter definitions
{
  displayName: 'Account Address',
  name: 'account',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['getAccountInfo'],
    },
  },
  default: '',
  description: 'The account address to get information for',
},
{
  displayName: 'Ledger Index',
  name: 'ledgerIndex',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['getAccountInfo'],
    },
  },
  default: 'validated',
  description: 'The ledger index to use (validated, closed, current, or specific ledger number)',
},
{
  displayName: 'Queue',
  name: 'queue',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['getAccountInfo'],
    },
  },
  default: false,
  description: 'Whether to include queued transactions',
},
{
  displayName: 'Signer Lists',
  name: 'signerLists',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['getAccountInfo'],
    },
  },
  default: false,
  description: 'Whether to include signer list objects',
},
{
  displayName: 'Strict',
  name: 'strict',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['getAccountInfo'],
    },
  },
  default: true,
  description: 'Whether to only return validated ledger data',
},
{
  displayName: 'Account Address',
  name: 'account',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['getAccountBalances'],
    },
  },
  default: '',
  description: 'The account address to get balances for',
},
{
  displayName: 'Ledger Index',
  name: 'ledgerIndex',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['getAccountBalances'],
    },
  },
  default: 'validated',
  description: 'The ledger index to use (validated, closed, current, or specific ledger number)',
},
{
  displayName: 'Strict',
  name: 'strict',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['getAccountBalances'],
    },
  },
  default: true,
  description: 'Whether to only return validated ledger data',
},
{
  displayName: 'Account Address',
  name: 'account',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['getAccountLines'],
    },
  },
  default: '',
  description: 'The account address to get trust lines for',
},
{
  displayName: 'Ledger Index',
  name: 'ledgerIndex',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['getAccountLines'],
    },
  },
  default: 'validated',
  description: 'The ledger index to use (validated, closed, current, or specific ledger number)',
},
{
  displayName: 'Peer',
  name: 'peer',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['getAccountLines'],
    },
  },
  default: '',
  description: 'Only return trust lines to this peer account',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['getAccountLines'],
    },
  },
  default: 200,
  description: 'Maximum number of trust lines to return',
},
{
  displayName: 'Marker',
  name: 'marker',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['getAccountLines'],
    },
  },
  default: '',
  description: 'Pagination marker from previous response',
},
{
  displayName: 'Account Address',
  name: 'account',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['getAccountNfts'],
    },
  },
  default: '',
  description: 'The account address to get NFTs for',
},
{
  displayName: 'Ledger Index',
  name: 'ledgerIndex',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['getAccountNfts'],
    },
  },
  default: 'validated',
  description: 'The ledger index to use (validated, closed, current, or specific ledger number)',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['getAccountNfts'],
    },
  },
  default: 400,
  description: 'Maximum number of NFTs to return',
},
{
  displayName: 'Marker',
  name: 'marker',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['getAccountNfts'],
    },
  },
  default: '',
  description: 'Pagination marker from previous response',
},
{
  displayName: 'Account Address',
  name: 'account',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['getAccountTransactions'],
    },
  },
  default: '',
  description: 'The account address to get transactions for',
},
{
  displayName: 'Ledger Index Min',
  name: 'ledgerIndexMin',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['getAccountTransactions'],
    },
  },
  default: -1,
  description: 'Earliest ledger to include transactions from',
},
{
  displayName: 'Ledger Index Max',
  name: 'ledgerIndexMax',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['getAccountTransactions'],
    },
  },
  default: -1,
  description: 'Latest ledger to include transactions from',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['getAccountTransactions'],
    },
  },
  default: 20,
  description: 'Maximum number of transactions to return',
},
{
  displayName: 'Marker',
  name: 'marker',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['getAccountTransactions'],
    },
  },
  default: '',
  description: 'Pagination marker from previous response',
},
{
  displayName: 'Forward',
  name: 'forward',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['getAccountTransactions'],
    },
  },
  default: true,
  description: 'Whether to return transactions in forward chronological order',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['rESOURCEAccount'],
      operation: ['validateAddress'],
    },
  },
  default: '',
  description: 'The address to validate',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'rESOURCEAccount':
        return [await executeAccountOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeRESOURCEAccountOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;

  const credentials = await this.getCredentials('xrplApi');
  const serverUrl = credentials.serverUrl as string || 'https://xrplcluster.com';
  
  const client = new Client(serverUrl);
  
  try {
    await client.connect();
    
    for (let i = 0; i < items.length; i++) {
      try {
        let result: any;
        
        switch (operation) {
          case 'getAccountInfo': {
            const account = this.getNodeParameter('account', i) as string;
            const ledgerIndex = this.getNodeParameter('ledgerIndex', i) as string;
            const queue = this.getNodeParameter('queue', i) as boolean;
            const signerLists = this.getNodeParameter('signerLists', i) as boolean;
            const strict = this.getNodeParameter('strict', i) as boolean;
            
            const request: any = {
              command: 'account_info',
              account,
              ledger_index: ledgerIndex,
              queue,
              signer_lists: signerLists,
              strict,
            };
            
            result = await client.request(request);
            break;
          }
          
          case 'getAccountBalances': {
            const account = this.getNodeParameter('account', i) as string;
            const ledgerIndex = this.getNodeParameter('ledgerIndex', i) as string;
            const strict = this.getNodeParameter('strict', i) as boolean;
            
            const balances = await client.getBalances(account, {
              ledger_index: ledgerIndex,
            });
            
            result = { balances };
            break;
          }
          
          case 'getAccountLines': {
            const account = this.getNodeParameter('account', i) as string;
            const ledgerIndex = this.getNodeParameter('ledgerIndex', i) as string;
            const peer = this.getNodeParameter('peer', i) as string;
            const limit = this.getNodeParameter('limit', i) as number;
            const marker = this.getNodeParameter('marker', i) as string;
            
            const request: any = {
              command: 'account_lines',
              account,
              ledger_index: ledgerIndex,
            };
            
            if (peer) request.peer = peer;
            if (limit) request.limit = limit;
            if (marker) request.marker = marker;
            
            result = await client.request(request);
            break;
          }
          
          case 'getAccountNfts': {
            const account = this.getNodeParameter('account', i) as string;
            const ledgerIndex = this.getNodeParameter('ledgerIndex', i) as string;
            const limit = this.getNodeParameter('limit', i) as number;
            const marker = this.getNodeParameter('marker', i) as string;
            
            const request: any = {
              command: 'account_nfts',
              account,
              ledger_index: ledgerIndex,
            };
            
            if (limit) request.limit = limit;
            if (marker) request.marker = marker;
            
            result = await client.request(request);
            break;
          }
          
          case 'getAccountTransactions': {
            const account = this.getNodeParameter('account', i) as string;
            const ledgerIndexMin = this.getNodeParameter('ledgerIndexMin', i) as number;
            const ledgerIndexMax = this.getNodeParameter('ledgerIndexMax', i) as number;
            const limit = this.getNodeParameter('limit', i) as number;
            const marker = this.getNodeParameter('marker', i) as string;
            const forward = this.getNodeParameter('forward', i) as boolean;
            
            const request: any = {
              command: 'account_tx',
              account,
              forward,
            };
            
            if (ledgerIndexMin >= 0) request.ledger_index_min = ledgerIndexMin;
            if (ledgerIndexMax >= 0) request.ledger_index_max = ledgerIndexMax;
            if (limit) request.limit = limit;
            if (marker) request.marker = marker;
            
            result = await client.request(request);
            break;
          }
          
          case 'validateAddress': {
            const address = this.getNodeParameter('address', i) as string;
            
            const validation = client.isValidAddress(address);
            result = {
              address,
              isValid: validation,
            };
            break;
          }
          
          default:
            throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
        }
        
        returnData.push({ json: result, pairedItem: { item: i } });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ 
            json: { error: error.message }, 
            pairedItem: { item: i } 
          });
        } else {
          throw new NodeApiError(this.getNode(), error);
        }
      }
    }
  } finally {
    await client.disconnect();
  }
  
  return returnData;
}
