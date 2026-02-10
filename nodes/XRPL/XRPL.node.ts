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
import { Wallet } from 'xrpl';

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
            value: 'account',
          }
        ],
        default: 'account',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['account'],
    },
  },
  options: [
    {
      name: 'Get Account Info',
      value: 'getAccountInfo',
      description: 'Get basic account information including sequence number, balance, and flags',
      action: 'Get account info',
    },
    {
      name: 'Get Account Balances',
      value: 'getAccountBalances',
      description: 'Get account balances for XRP and all issued currencies',
      action: 'Get account balances',
    },
    {
      name: 'Get Account NFTs',
      value: 'getAccountNfts',
      description: 'Get all NFTs owned by an account',
      action: 'Get account NFTs',
    },
    {
      name: 'Get Transaction History',
      value: 'getTransactionHistory',
      description: 'Get transaction history for an account',
      action: 'Get transaction history',
    },
    {
      name: 'Validate Address',
      value: 'validateAddress',
      description: 'Validate an XRPL address format and checksum',
      action: 'Validate address',
    },
    {
      name: 'Generate Wallet',
      value: 'generateWallet',
      description: 'Generate a new XRPL wallet with public/private key pair',
      action: 'Generate wallet',
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
      resource: ['account'],
      operation: ['getAccountInfo'],
    },
  },
  default: '',
  description: 'The account address to get information for',
},
{
  displayName: 'Ledger Index',
  name: 'ledger_index',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getAccountInfo'],
    },
  },
  default: 'validated',
  description: 'The ledger index to use (validated, closed, or specific number)',
},
{
  displayName: 'Queue',
  name: 'queue',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getAccountInfo'],
    },
  },
  default: false,
  description: 'Whether to return queue information',
},
{
  displayName: 'Signer Lists',
  name: 'signer_lists',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getAccountInfo'],
    },
  },
  default: false,
  description: 'Whether to return signer lists',
},
{
  displayName: 'Strict',
  name: 'strict',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getAccountInfo'],
    },
  },
  default: false,
  description: 'Whether to return only validated ledger data',
},
{
  displayName: 'Account Address',
  name: 'account',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getAccountBalances'],
    },
  },
  default: '',
  description: 'The account address to get balances for',
},
{
  displayName: 'Ledger Index',
  name: 'ledger_index',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getAccountBalances'],
    },
  },
  default: 'validated',
  description: 'The ledger index to use (validated, closed, or specific number)',
},
{
  displayName: 'Strict',
  name: 'strict',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getAccountBalances'],
    },
  },
  default: false,
  description: 'Whether to return only validated ledger data',
},
{
  displayName: 'Account Address',
  name: 'account',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getAccountNfts'],
    },
  },
  default: '',
  description: 'The account address to get NFTs for',
},
{
  displayName: 'Ledger Index',
  name: 'ledger_index',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getAccountNfts'],
    },
  },
  default: 'validated',
  description: 'The ledger index to use (validated, closed, or specific number)',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['account'],
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
      resource: ['account'],
      operation: ['getAccountNfts'],
    },
  },
  default: '',
  description: 'Pagination marker from a previous response',
},
{
  displayName: 'Account Address',
  name: 'account',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getTransactionHistory'],
    },
  },
  default: '',
  description: 'The account address to get transaction history for',
},
{
  displayName: 'Min Ledger Index',
  name: 'ledger_index_min',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getTransactionHistory'],
    },
  },
  default: -1,
  description: 'Minimum ledger index to search',
},
{
  displayName: 'Max Ledger Index',
  name: 'ledger_index_max',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getTransactionHistory'],
    },
  },
  default: -1,
  description: 'Maximum ledger index to search',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getTransactionHistory'],
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
      resource: ['account'],
      operation: ['getTransactionHistory'],
    },
  },
  default: '',
  description: 'Pagination marker from a previous response',
},
{
  displayName: 'Forward',
  name: 'forward',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getTransactionHistory'],
    },
  },
  default: false,
  description: 'Whether to return transactions in forward chronological order',
},
{
  displayName: 'Binary',
  name: 'binary',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getTransactionHistory'],
    },
  },
  default: false,
  description: 'Whether to return transaction data in binary format',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['validateAddress'],
    },
  },
  default: '',
  description: 'The address to validate',
},
{
  displayName: 'Algorithm',
  name: 'algorithm',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['generateWallet'],
    },
  },
  options: [
    {
      name: 'secp256k1',
      value: 'secp256k1',
    },
    {
      name: 'ed25519',
      value: 'ed25519',
    },
  ],
  default: 'secp256k1',
  description: 'The cryptographic algorithm to use',
},
{
  displayName: 'Entropy',
  name: 'entropy',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['generateWallet'],
    },
  },
  default: '',
  description: 'Optional entropy for wallet generation (hex string)',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'account':
        return [await executeAccountOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeAccountOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  
  const client = new Client('https://xrplcluster.com');
  
  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getAccountInfo':
          const accountInfoAccount = this.getNodeParameter('account', i) as string;
          const ledgerIndex = this.getNodeParameter('ledger_index', i) as string;
          const queue = this.getNodeParameter('queue', i) as boolean;
          const signerLists = this.getNodeParameter('signer_lists', i) as boolean;
          const strict = this.getNodeParameter('strict', i) as boolean;
          
          await client.connect();
          
          const accountInfoRequest: any = {
            command: 'account_info',
            account: accountInfoAccount,
            ledger_index: ledgerIndex,
            queue,
            signer_lists: signerLists,
            strict,
          };
          
          result = await client.request(accountInfoRequest);
          await client.disconnect();
          break;
          
        case 'getAccountBalances':
          const balancesAccount = this.getNodeParameter('account', i) as string;
          const balancesLedgerIndex = this.getNodeParameter('ledger_index', i) as string;
          const balancesStrict = this.getNodeParameter('strict', i) as boolean;
          
          await client.connect();
          
          const balancesRequest: any = {
            command: 'account_lines',
            account: balancesAccount,
            ledger_index: balancesLedgerIndex,
            strict: balancesStrict,
          };
          
          const accountInfoForBalance = await client.request({
            command: 'account_info',
            account: balancesAccount,
            ledger_index: balancesLedgerIndex,
          });
          
          const linesResult = await client.request(balancesRequest);
          
          result = {
            account: balancesAccount,
            balances: [
              {
                currency: 'XRP',
                value: accountInfoForBalance.result.account_data.Balance,
              },
              ...linesResult.result.lines.map((line: any) => ({
                currency: line.currency,
                value: line.balance,
                issuer: line.account,
              })),
            ],
          };
          
          await client.disconnect();
          break;
          
        case 'getAccountNfts':
          const nftsAccount = this.getNodeParameter('account', i) as string;
          const nftsLedgerIndex = this.getNodeParameter('ledger_index', i) as string;
          const nftsLimit = this.getNodeParameter('limit', i) as number;
          const nftsMarker = this.getNodeParameter('marker', i) as string;
          
          await client.connect();
          
          const nftsRequest: any = {
            command: 'account_nfts',
            account: nftsAccount,
            ledger_index: nftsLedgerIndex,
            limit: nftsLimit,
          };
          
          if (nftsMarker) {
            nftsRequest.marker = nftsMarker;
          }
          
          result = await client.request(nftsRequest);
          await client.disconnect();
          break;
          
        case 'getTransactionHistory':
          const historyAccount = this.getNodeParameter('account', i) as string;
          const ledgerIndexMin = this.getNodeParameter('ledger_index_min', i) as number;
          const ledgerIndexMax = this.getNodeParameter('ledger_index_max', i) as number;
          const historyLimit = this.getNodeParameter('limit', i) as number;
          const historyMarker = this.getNodeParameter('marker', i) as string;
          const forward = this.getNodeParameter('forward', i) as boolean;
          const binary = this.getNodeParameter('binary', i) as boolean;
          
          await client.connect();
          
          const historyRequest: any = {
            command: 'account_tx',
            account: historyAccount,
            limit: historyLimit,
            forward,
            binary,
          };
          
          if (ledgerIndexMin !== -1) {
            historyRequest.ledger_index_min = ledgerIndexMin;
          }
          
          if (ledgerIndexMax !== -1) {
            historyRequest.ledger_index_max = ledgerIndexMax;
          }
          
          if (historyMarker) {
            historyRequest.marker = historyMarker;
          }
          
          result = await client.request(historyRequest);
          await client.disconnect();
          break;
          
        case 'validateAddress':
          const address = this.getNodeParameter('address', i) as string;
          
          try {
            const { isValid, xAddress, classicAddress } = require('xrpl').isValidAddress;
            const validation = isValid ? isValid(address) : false;
            
            result = {
              address,
              isValid: validation,
              type: validation ? (address.startsWith('X') ? 'X-Address' : 'Classic') : null,
            };
          } catch (error) {
            result = {
              address,
              isValid: false,
              error: 'Invalid address format',
            };
          }
          break;
          
        case 'generateWallet':
          const algorithm = this.getNodeParameter('algorithm', i) as string;
          const entropy = this.getNodeParameter('entropy', i) as string;
          
          let wallet: any;
          
          if (entropy) {
            wallet = Wallet.fromEntropy(entropy, { algorithm: algorithm as any });
          } else {
            wallet = Wallet.generate(algorithm as any);
          }
          
          result = {
            publicKey: wallet.publicKey,
            privateKey: wallet.privateKey,
            classicAddress: wallet.classicAddress,
            seed: wallet.seed,
          };
          break;
          
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
  
  return returnData;
}
