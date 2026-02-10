import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class XRPLApi implements ICredentialType {
	name = 'xrplApi';
	displayName = 'XRPL API';
	documentationUrl = 'https://xrpl.org/';
	properties: INodeProperties[] = [
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
					name: 'Custom',
					value: 'custom',
				},
			],
			default: 'mainnet',
			description: 'The XRPL network to connect to',
		},
		{
			displayName: 'Server URL',
			name: 'serverUrl',
			type: 'string',
			default: '',
			placeholder: 'wss://s1.ripple.com',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
			description: 'Custom XRPL server URL (WebSocket or HTTP JSON-RPC)',
		},
		{
			displayName: 'Wallet Secret/Seed',
			name: 'walletSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'sXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
			description: 'XRPL wallet secret (seed) for transaction signing. Required for write operations.',
		},
		{
			displayName: 'Account Address',
			name: 'accountAddress',
			type: 'string',
			default: '',
			placeholder: 'rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
			description: 'XRPL account address. Will be derived from wallet secret if not provided.',
		},
		{
			displayName: 'Rate Limit',
			name: 'rateLimit',
			type: 'number',
			default: 200,
			description: 'Requests per minute limit (default: 200 for public servers)',
		},
		{
			displayName: 'Connection Timeout',
			name: 'timeout',
			type: 'number',
			default: 30000,
			description: 'Connection timeout in milliseconds',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.network === "mainnet" ? "https://xrplcluster.com" : $credentials.network === "testnet" ? "https://s.altnet.rippletest.net:51234" : $credentials.serverUrl}}',
			url: '/',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				method: 'server_info',
				params: [{}],
			},
		},
	};
}