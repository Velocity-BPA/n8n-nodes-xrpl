import {
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
					name: 'Custom',
					value: 'custom',
				},
			],
			default: 'mainnet',
			description: 'XRPL network to connect to',
		},
		{
			displayName: 'Custom Server URL',
			name: 'customServerUrl',
			type: 'string',
			default: '',
			placeholder: 'wss://your-custom-xrpl-node.com',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
			description: 'Custom XRPL server WebSocket URL',
		},
		{
			displayName: 'Account Address',
			name: 'accountAddress',
			type: 'string',
			default: '',
			placeholder: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
			description: 'XRPL account address (wallet address) for transaction signing',
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Private key for transaction signing (keep secure!)',
		},
		{
			displayName: 'Algorithm',
			name: 'algorithm',
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
			description: 'Cryptographic algorithm used for the private key',
		},
		{
			displayName: 'Read Only Mode',
			name: 'readOnlyMode',
			type: 'boolean',
			default: false,
			description: 'Whether to operate in read-only mode (no transaction signing)',
		},
		{
			displayName: 'Max Fee (drops)',
			name: 'maxFee',
			type: 'number',
			default: 10000,
			description: 'Maximum fee in drops willing to pay for transactions (1 XRP = 1,000,000 drops)',
		},
		{
			displayName: 'Connection Timeout (seconds)',
			name: 'connectionTimeout',
			type: 'number',
			default: 30,
			description: 'Connection timeout for XRPL server connections',
		},
	];

	authenticate = async (credentials: any, requestOptions: any): Promise<any> => {
		// XRPL authentication is handled during transaction signing
		// No traditional API key authentication required
		return requestOptions;
	};
}