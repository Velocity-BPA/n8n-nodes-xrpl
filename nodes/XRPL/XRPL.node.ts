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
import { isValidAddress } from 'xrpl';

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
      description: 'Get basic information about an XRPL account',
      action: 'Get account info',
    },
    {
      name: 'Get Account Balances',
      value: 'getAccountBalances',
      description: 'Get all balances for an XRPL account',
      action: 'Get account balances',
    },
    {
      name: 'Get Account NFTs',
      value: 'getAccountNfts',
      description: 'Get all NFTs owned by an XRPL account',
      action: 'Get account nfts',
    },
    {
      name: 'Get Transaction History',
      value: 'getTransactionHistory',
      description: 'Get transaction history for an XRPL account',
      action: 'Get transaction history',
    },
    {
      name: 'Validate Address',
      value: 'validateAddress',
      description: 'Validate if an address is a valid XRPL address',
      action: 'Validate address',
    },
    {
      name: 'Generate Wallet',
      value: 'generateWallet',
      description: 'Generate a new XRPL wallet with address and keys',
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
  description: 'The XRPL account address to get information for',
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
  description: 'The XRPL account address to get balances for',
},
{
  displayName: 'Ledger Index',
  name: 'ledgerIndex',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getAccountBalances'],
    },
  },
  options: [
    {
      name: 'Validated',
      value: 'validated',
    },
    {
      name: 'Current',
      value: 'current',
    },
    {
      name: 'Closed',
      value: 'closed',
    },
  ],
  default: 'validated',
  description: 'Which ledger to use for the request',
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
  description: 'The XRPL account address to get NFTs for',
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
  default: 100,
  description: 'Maximum number of NFTs to return (default: 100)',
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
  description: 'The XRPL account address to get transaction history for',
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
  description: 'Maximum number of transactions to return (default: 20)',
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
  description: 'Whether to return results in forward chronological order',
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
  description: 'The cryptographic algorithm to use for key generation',
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

  // Get credentials
  const credentials = await this.getCredentials('xrpl');
  const network = credentials.network as string;
  
  // Determine server URL based on network
  const serverUrl = network === 'mainnet' ? 'wss://xrplcluster.com' : 'wss://s.altnet.rippletest.net:51233';
  
  // Initialize XRPL client
  const client = new Client(serverUrl);
  
  try {
    await client.connect();
    
    for (let i = 0; i < items.length; i++) {
      try {
        let result: any;
        
        switch (operation) {
          case 'getAccountInfo':
            {
              const account = this.getNodeParameter('account', i) as string;
              
              const accountInfoResponse = await client.request({
                command: 'account_info',
                account: account,
                ledger_index: 'validated',
              });
              
              result = {
                account: account,
                accountData: accountInfoResponse.result.account_data,
                ledgerCurrentIndex: accountInfoResponse.result.ledger_current_index,
                validated: accountInfoResponse.result.validated,
              };
            }
            break;
            
          case 'getAccountBalances':
            {
              const account = this.getNodeParameter('account', i) as string;
              const ledgerIndex = this.getNodeParameter('ledgerIndex', i, 'validated') as string;
              
              const balancesResponse = await client.request({
                command: 'account_lines',
                account: account,
                ledger_index: ledgerIndex,
              });
              
              const accountInfoResponse = await client.request({
                command: 'account_info',
                account: account,
                ledger_index: ledgerIndex,
              });
              
              const xrpBalance = accountInfoResponse.result.account_data.Balance;
              const trustlines = balancesResponse.result.lines;
              
              result = {
                account: account,
                xrpBalance: (parseInt(xrpBalance) / 1000000).toString(), // Convert drops to XRP
                trustlines: trustlines,
                balances: [
                  {
                    currency: 'XRP',
                    value: (parseInt(xrpBalance) / 1000000).toString(),
                  },
                  ...trustlines.map((line: any) => ({
                    currency: line.currency,
                    value: line.balance,
                    issuer: line.account,
                  })),
                ],
              };
            }
            break;
            
          case 'getAccountNfts':
            {
              const account = this.getNodeParameter('account', i) as string;
              const limit = this.getNodeParameter('limit', i, 100) as number;
              
              const nftsResponse = await client.request({
                command: 'account_nfts',
                account: account,
                limit: limit,
              });
              
              result = {
                account: account,
                nfts: nftsResponse.result.account_nfts,
                validated: nftsResponse.result.validated,
              };
            }
            break;
            
          case 'getTransactionHistory':
            {
              const account = this.getNodeParameter('account', i) as string;
              const limit = this.getNodeParameter('limit', i, 20) as number;
              const forward = this.getNodeParameter('forward', i, false) as boolean;
              
              const txResponse = await client.request({
                command: 'account_tx',
                account: account,
                limit: limit,
                forward: forward,
              });
              
              result = {
                account: account,
                transactions: txResponse.result.transactions,
                marker: txResponse.result.marker,
                validated: txResponse.result.validated,
              };
            }
            break;
            
          case 'validateAddress':
            {
              const address = this.getNodeParameter('address', i) as string;
              
              const isValid = isValidAddress(address);
              
              result = {
                address: address,
                isValid: isValid,
                type: isValid ? 'classic' : 'invalid',
              };
            }
            break;
            
          case 'generateWallet':
            {
              const algorithm = this.getNodeParameter('algorithm', i, 'secp256k1') as string;
              
              const wallet = Wallet.generate(algorithm as any);
              
              result = {
                address: wallet.address,
                publicKey: wallet.publicKey,
                privateKey: wallet.privateKey,
                seed: wallet.seed,
                algorithm: algorithm,
              };
            }
            break;
            
          default:
            throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
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
          throw new NodeApiError(this.getNode(), error);
        }
      }
    }
    
  } finally {
    await client.disconnect();
  }
  
  return returnData;
}
