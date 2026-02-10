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
			displayName: 'Custom Server URL',
			name: 'customServerUrl',
			type: 'string',
			default: '',
			placeholder: 'wss://xrplcluster.com/',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
			description: 'Custom XRPL server URL (WebSocket or JSON-RPC)',
		},
		{
			displayName: 'Wallet Address',
			name: 'walletAddress',
			type: 'string',
			default: '',
			placeholder: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
			description: 'The XRPL wallet address for transactions (read-only operations don\'t require this)',
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'ED74D4036C6591A4BDF9C54CEFA39B996A5DCE5F86D11FDA1874481CE9D5A1CDC1',
			description: 'The private key for signing transactions (required for write operations). Keep this secure!',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Optional API key for hosted XRPL providers with authentication',
		},
		{
			displayName: 'Connection Timeout (ms)',
			name: 'connectionTimeout',
			type: 'number',
			default: 30000,
			description: 'Connection timeout in milliseconds',
		},
		{
			displayName: 'Fee Cushion',
			name: 'feeCushion',
			type: 'number',
			default: 1.2,
			description: 'Multiplier for transaction fees to ensure acceptance (e.g., 1.2 = 20% cushion)',
		},
		{
			displayName: 'Max Fee (XRP)',
			name: 'maxFee',
			type: 'string',
			default: '2',
			description: 'Maximum fee willing to pay for a transaction in XRP',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
				'Content-Type': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.network === "mainnet" ? "https://s1.ripple.com:51234" : $credentials.network === "testnet" ? "https://s.altnet.rippletest.net:51234" : $credentials.customServerUrl}}',
			url: '/',
			method: 'POST',
			body: {
				method: 'server_info',
				params: [{}],
			},
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'result.status',
					value: 'success',
				},
			},
		],
	};
}