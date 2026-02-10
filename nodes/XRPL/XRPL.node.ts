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

import { Client, Wallet, isValidAddress } from 'xrpl';
import crypto from 'crypto';

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
            name: 'Accounts',
            value: 'accounts',
          }
        ],
        default: 'accounts',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
    },
  },
  options: [
    {
      name: 'Get Account Info',
      value: 'getAccountInfo',
      description: 'Retrieves comprehensive account information including sequence, balance, and flags',
      action: 'Get account info',
    },
    {
      name: 'Get Account Balances',
      value: 'getAccountBalances',
      description: 'Gets all currency balances for an account including XRP and issued currencies',
      action: 'Get account balances',
    },
    {
      name: 'Get Account Transaction History',
      value: 'getAccountTransactionHistory',
      description: 'Retrieves paginated transaction history for an account',
      action: 'Get account transaction history',
    },
    {
      name: 'Validate Address',
      value: 'validateAddress',
      description: 'Validates XRPL address format and checksum',
      action: 'Validate address',
    },
    {
      name: 'Generate Wallet',
      value: 'generateWallet',
      description: 'Generates a new XRPL wallet with address and keys',
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
      resource: ['accounts'],
      operation: ['getAccountInfo', 'getAccountBalances', 'getAccountTransactionHistory'],
    },
  },
  default: '',
  description: 'The XRPL account address',
},
{
  displayName: 'Ledger Index',
  name: 'ledger_index',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountInfo', 'getAccountBalances'],
    },
  },
  default: 'validated',
  description: 'The ledger index to query. Use "validated", "closed", "current", or a specific ledger number',
},
{
  displayName: 'Queue',
  name: 'queue',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountInfo'],
    },
  },
  default: false,
  description: 'Whether to include queued transactions in the response',
},
{
  displayName: 'Minimum Ledger Index',
  name: 'ledger_index_min',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountTransactionHistory'],
    },
  },
  default: -1,
  description: 'Minimum ledger index to search (-1 for earliest available)',
},
{
  displayName: 'Maximum Ledger Index',
  name: 'ledger_index_max',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountTransactionHistory'],
    },
  },
  default: -1,
  description: 'Maximum ledger index to search (-1 for latest available)',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountTransactionHistory'],
    },
  },
  default: 200,
  description: 'Maximum number of transactions to return (1-400)',
},
{
  displayName: 'Marker',
  name: 'marker',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountTransactionHistory'],
    },
  },
  default: '',
  description: 'Pagination marker from previous request',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
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
      resource: ['accounts'],
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
  description: 'The cryptographic algorithm to use for key generation',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'accounts':
        return [await executeAccountsOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeAccountsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  
  // Get credentials and setup client
  const credentials = await this.getCredentials('xrplApi');
  const serverUrl = credentials.serverUrl as string || 'https://xrplcluster.com/';
  const client = new Client(serverUrl);
  
  // Connect to client for operations that need it
  const needsConnection = ['getAccountInfo', 'getAccountBalances', 'getAccountTransactionHistory'];
  if (needsConnection.includes(operation)) {
    await client.connect();
  }

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getAccountInfo':
          const account = this.getNodeParameter('account', i) as string;
          const ledgerIndex = this.getNodeParameter('ledger_index', i) as string;
          const queue = this.getNodeParameter('queue', i) as boolean;
          
          const accountInfoRequest: any = {
            command: 'account_info',
            account,
            ledger_index: ledgerIndex || 'validated',
          };
          
          if (queue) {
            accountInfoRequest.queue = true;
          }
          
          result = await client.request(accountInfoRequest);
          break;
          
        case 'getAccountBalances':
          const balanceAccount = this.getNodeParameter('account', i) as string;
          const balanceLedgerIndex = this.getNodeParameter('ledger_index', i) as string;
          
          // Get account lines (trust lines) for issued currencies
          const linesRequest = {
            command: 'account_lines',
            account: balanceAccount,
            ledger_index: balanceLedgerIndex || 'validated',
          };
          
          const linesResponse = await client.request(linesRequest);
          
          // Get XRP balance from account info
          const infoRequest = {
            command: 'account_info',
            account: balanceAccount,
            ledger_index: balanceLedgerIndex || 'validated',
          };
          
          const infoResponse = await client.request(infoRequest);
          
          const balances = [
            {
              currency: 'XRP',
              value: (parseInt(infoResponse.result.account_data.Balance) / 1000000).toString(),
              issuer: null,
            },
          ];
          
          if (linesResponse.result.lines) {
            for (const line of linesResponse.result.lines) {
              balances.push({
                currency: line.currency,
                value: line.balance,
                issuer: line.account,
              });
            }
          }
          
          result = { balances };
          break;
          
        case 'getAccountTransactionHistory':
          const historyAccount = this.getNodeParameter('account', i) as string;
          const ledgerMin = this.getNodeParameter('ledger_index_min', i) as number;
          const ledgerMax = this.getNodeParameter('ledger_index_max', i) as number;
          const limit = this.getNodeParameter('limit', i) as number;
          const marker = this.getNodeParameter('marker', i) as string;
          
          const txHistoryRequest: any = {
            command: 'account_tx',
            account: historyAccount,
            limit: Math.min(Math.max(limit || 200, 1), 400),
          };
          
          if (ledgerMin >= 0) {
            txHistoryRequest.ledger_index_min = ledgerMin;
          }
          
          if (ledgerMax >= 0) {
            txHistoryRequest.ledger_index_max = ledgerMax;
          }
          
          if (marker) {
            txHistoryRequest.marker = marker;
          }
          
          result = await client.request(txHistoryRequest);
          break;
          
        case 'validateAddress':
          const addressToValidate = this.getNodeParameter('address', i) as string;
          
          try {
            const isValid = isValidAddress(addressToValidate);
            result = {
              address: addressToValidate,
              isValid,
              type: isValid ? 'account' : 'invalid',
            };
          } catch (error) {
            result = {
              address: addressToValidate,
              isValid: false,
              type: 'invalid',
              error: error.message,
            };
          }
          break;
          
        case 'generateWallet':
          const algorithm = this.getNodeParameter('algorithm', i) as 'secp256k1' | 'ed25519';
          
          let wallet: Wallet;
          if (algorithm === 'ed25519') {
            // Generate ed25519 wallet
            const seed = crypto.randomBytes(16);
            wallet = Wallet.fromSeed(seed.toString('hex'), { algorithm: 'ed25519' });
          } else {
            // Generate secp256k1 wallet (default)
            wallet = Wallet.generate();
          }
          
          result = {
            address: wallet.address,
            publicKey: wallet.publicKey,
            privateKey: wallet.privateKey,
            seed: wallet.seed,
            algorithm: algorithm,
            warning: 'Store these credentials securely. Never share your private key or seed.',
          };
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
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        if (error.name === 'RippledError') {
          throw new NodeApiError(this.getNode(), error, { itemIndex: i });
        }
        throw new NodeOperationError(this.getNode(), error.message, { itemIndex: i });
      }
    }
  }
  
  // Disconnect client if it was connected
  if (needsConnection.includes(operation)) {
    await client.disconnect();
  }
  
  return returnData;
}
