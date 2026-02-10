import {
	IAuthenticateGeneric,
	ICredentialDataDecryptedObject,
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
					name: 'Devnet',
					value: 'devnet',
				},
				{
					name: 'AMM Devnet',
					value: 'amm-devnet',
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
			placeholder: 'wss://xrplcluster.com',
			description: 'Custom XRPL server URL (optional - leave empty to use default network servers)',
		},
		{
			displayName: 'Wallet Seed',
			name: 'walletSeed',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'sXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
			description: 'The wallet seed (private key) for transaction signing. Required for transaction operations. Leave empty for read-only operations.',
		},
		{
			displayName: 'Key Type',
			name: 'keyType',
			type: 'options',
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
			description: 'The cryptographic algorithm used for key generation and signing',
			displayOptions: {
				show: {
					walletSeed: [
						{ _type: 'expression' },
						{ _type: 'string', _value: { $ne: '' } },
					],
				},
			},
		},
		{
			displayName: 'Connection Timeout (ms)',
			name: 'connectionTimeout',
			type: 'number',
			default: 5000,
			description: 'Connection timeout in milliseconds',
		},
		{
			displayName: 'Request Timeout (ms)',
			name: 'requestTimeout',
			type: 'number',
			default: 30000,
			description: 'Request timeout in milliseconds',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			method: 'POST',
			url: '',
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				method: 'server_info',
				params: [{}],
			},
		},
	};

	async preAuthentication(credentials: ICredentialDataDecryptedObject) {
		// Custom authentication logic will be handled in the node execution
		// This method is called before making requests
		return credentials;
	}
}