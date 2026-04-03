import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class XRPLApi implements ICredentialType {
	name = 'xrplApi';
	displayName = 'XRPL API';
	documentationUrl = 'https://xrpl.org/public-api-methods.html';
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
			name: 'serverUrl',
			type: 'string',
			default: '',
			placeholder: 'https://your-xrpl-server:51234',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
			description: 'Custom XRPL server URL',
		},
		{
			displayName: 'Request Timeout (seconds)',
			name: 'timeout',
			type: 'number',
			default: 30,
			description: 'Timeout for API requests in seconds',
		},
	];
}