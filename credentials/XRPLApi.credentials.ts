import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class XRPLApi implements ICredentialType {
	name = 'xrplApi';
	displayName = 'XRPL API';
	properties: INodeProperties[] = [
		{
			displayName: 'Server URL',
			name: 'serverUrl',
			type: 'string',
			default: 'https://xrplcluster.com',
			description: 'The XRPL server endpoint URL',
			required: true,
		},
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			options: [
				{
					name: 'Mainnet',
					value: 'mainnet',
				},
				{
					name: 'Testnet',
					value: 'testnet',
				},
				{
					name: 'Devnet',
					value: 'devnet',
				},
			],
			default: 'mainnet',
			description: 'The XRPL network to connect to',
		},
		{
			displayName: 'Wallet Seed/Secret',
			name: 'walletSeed',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'The wallet seed or secret for signing transactions (required for write operations)',
			displayOptions: {
				show: {
					'@version': [1],
				},
			},
		},
		{
			displayName: 'Account Address',
			name: 'accountAddress',
			type: 'string',
			default: '',
			description: 'The XRPL account address (optional, can be derived from seed)',
			displayOptions: {
				show: {
					'@version': [1],
				},
			},
		},
		{
			displayName: 'Use WebSocket',
			name: 'useWebSocket',
			type: 'boolean',
			default: false,
			description: 'Whether to use WebSocket connection for real-time data',
		},
		{
			displayName: 'Connection Timeout',
			name: 'connectionTimeout',
			type: 'number',
			default: 30000,
			description: 'Connection timeout in milliseconds',
		},
		{
			displayName: 'Request Timeout',
			name: 'requestTimeout',
			type: 'number',
			default: 20000,
			description: 'Request timeout in milliseconds',
		},
	];
}