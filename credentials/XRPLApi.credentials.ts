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
			displayName: 'XRPL Server URL',
			name: 'serverUrl',
			type: 'string',
			default: 'https://xrplcluster.com',
			description: 'The XRPL server URL to connect to',
			placeholder: 'https://xrplcluster.com',
		},
		{
			displayName: 'WebSocket Server URL',
			name: 'wsServerUrl',
			type: 'string',
			default: 'wss://xrplcluster.com',
			description: 'The XRPL WebSocket server URL for real-time connections',
			placeholder: 'wss://xrplcluster.com',
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
			displayName: 'Wallet Seed (Optional)',
			name: 'walletSeed',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'The wallet seed for transaction signing. Required for write operations.',
			placeholder: 'sXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
		},
		{
			displayName: 'Private Key (Optional)',
			name: 'privateKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Alternative to wallet seed. The private key for transaction signing.',
			placeholder: '00XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
		},
		{
			displayName: 'Account Address (Optional)',
			name: 'accountAddress',
			type: 'string',
			default: '',
			description: 'The account address associated with the wallet. Required for write operations.',
			placeholder: 'rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
		},
		{
			displayName: 'Default Fee (Drops)',
			name: 'defaultFee',
			type: 'number',
			default: 12,
			description: 'Default transaction fee in drops (1 XRP = 1,000,000 drops)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.serverUrl}}',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
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