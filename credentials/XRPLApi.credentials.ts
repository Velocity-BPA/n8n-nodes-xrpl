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
			displayName: 'Server URL',
			name: 'serverUrl',
			type: 'string',
			default: 'https://xrplcluster.com',
			placeholder: 'https://xrplcluster.com',
			description: 'XRPL server URL (mainnet, testnet, or custom server)',
		},
		{
			displayName: 'Network ID',
			name: 'networkId',
			type: 'options',
			options: [
				{
					name: 'Mainnet',
					value: 0,
				},
				{
					name: 'Testnet',
					value: 1,
				},
				{
					name: 'Devnet',
					value: 2,
				},
			],
			default: 0,
			description: 'XRPL Network ID for transaction signing',
		},
		{
			displayName: 'Account Address',
			name: 'accountAddress',
			type: 'string',
			default: '',
			placeholder: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe',
			description: 'Your XRPL account address (for read operations and as default sender)',
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'Your private key (secp256k1 format)',
			description: 'Private key for signing transactions (required for write operations). Keep this secure!',
		},
		{
			displayName: 'Use WebSocket',
			name: 'useWebSocket',
			type: 'boolean',
			default: false,
			description: 'Whether to use WebSocket connection instead of HTTP for API calls',
		},
		{
			displayName: 'WebSocket URL',
			name: 'webSocketUrl',
			type: 'string',
			default: 'wss://xrplcluster.com',
			placeholder: 'wss://xrplcluster.com',
			displayOptions: {
				show: {
					useWebSocket: [true],
				},
			},
			description: 'WebSocket URL for real-time XRPL connections',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': 'n8n-nodes-xrpl/1.0.0',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.serverUrl}}',
			url: '/',
			method: 'POST',
			body: {
				method: 'server_info',
				params: [{}],
			},
		},
	};
}