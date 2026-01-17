/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class XrplApi implements ICredentialType {
  name = 'xrplApi';
  displayName = 'XRPL API';
  documentationUrl = 'https://xrpl.org/docs';
  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      options: [
        { name: 'Mainnet', value: 'mainnet' },
        { name: 'Testnet', value: 'testnet' },
        { name: 'Devnet', value: 'devnet' },
        { name: 'AMM Devnet', value: 'ammdevnet' },
        { name: 'Custom', value: 'custom' },
      ],
      default: 'testnet',
      description: 'The XRPL network to connect to',
    },
    {
      displayName: 'Custom WebSocket URL',
      name: 'customWsUrl',
      type: 'string',
      default: '',
      placeholder: 'wss://your-node.example.com:51233',
      description: 'Custom WebSocket URL for private nodes',
      displayOptions: { show: { network: ['custom'] } },
    },
    {
      displayName: 'Wallet Seed',
      name: 'walletSeed',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      placeholder: 'sXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      description: 'Your wallet secret seed for signing transactions. Leave empty for read-only operations.',
    },
    {
      displayName: 'Account Address',
      name: 'accountAddress',
      type: 'string',
      default: '',
      placeholder: 'rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      description: 'Your XRPL account address. Required if wallet seed is not provided.',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {},
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://xrplcluster.com',
      url: '/',
      method: 'POST',
      body: JSON.stringify({ method: 'server_info', params: [{}] }),
      headers: { 'Content-Type': 'application/json' },
    },
  };
}
