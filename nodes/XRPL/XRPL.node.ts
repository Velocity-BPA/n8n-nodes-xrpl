/**
 * Copyright (c) 2024 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-xrpl/blob/main/LICENSE
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
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

import { Client, isValidAddress } from 'xrpl';
import { BigNumber } from 'bignumber.js';

interface XRPLResponse {
	result?: any;
	error?: string;
	error_message?: string;
	error_code?: number;
}

export class XRPL implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'XRPL',
		name: 'xrpl',
		icon: 'file:xrpl.svg',
		group: ['blockchain'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the XRPL (XRP Ledger) blockchain',
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
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account',
						value: 'account',
					},
					{
						name: 'Payments',
						value: 'payments',
					},
					{
						name: 'Trust Lines',
						value: 'trustLines',
					},
					{
						name: 'DEX',
						value: 'dex',
					},
					{
						name: 'NFT',
						value: 'nft',
					},
					{
						name: 'Escrow',
						value: 'escrow',
					},
					{
						name: 'Check',
						value: 'check',
					},
					{
						name: 'Payment Channel',
						value: 'paymentChannel',
					},
					{
						name: 'AMM',
						value: 'amm',
					},
					{
						name: 'Permissioned Domains',
						value: 'permissionedDomains',
					},
					{
						name: 'Credentials',
						value: 'credentials',
					},
					{
						name: 'Multi-Purpose Tokens',
						value: 'multiPurposeTokens',
					},
					{
						name: 'Single Asset Vaults',
						value: 'singleAssetVaults',
					},
					{
						name: 'Lending Protocol',
						value: 'lendingProtocol',
					},
					{
						name: 'Simulation',
						value: 'simulation',
					},
					{
						name: 'Utilities',
						value: 'utilities',
					},
				],
				default: 'account',
			},

			// Account Operations
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
						description: 'Get account information including reserve, flags, and settings',
					},
					{
						name: 'Get Account Lines',
						value: 'getAccountLines',
						description: 'Get trust lines (IOUs) for an account',
					},
					{
						name: 'Get Account Objects',
						value: 'getAccountObjects',
						description: 'Get account objects including NFTs and other owned objects',
					},
					{
						name: 'Get Account Transactions',
						value: 'getAccountTx',
						description: 'Get transaction history for an account',
					},
					{
						name: 'Validate Address',
						value: 'validateAddress',
						description: 'Validate XRPL address format',
					},
				],
				default: 'getAccountInfo',
			},

			// Account operation parameters
			{
				displayName: 'Account Address',
				name: 'account',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['getAccountInfo', 'getAccountLines', 'getAccountObjects', 'getAccountTx'],
					},
				},
				default: '',
				description: 'XRPL account address',
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
				description: 'Address to validate',
			},
			{
				displayName: 'Include Flags',
				name: 'includeFlags',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['getAccountInfo'],
					},
				},
				default: false,
				description: 'Whether to include detailed flag information',
			},
			{
				displayName: 'Ledger',
				name: 'ledger',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['getAccountInfo', 'getAccountLines', 'getAccountObjects'],
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
				description: 'Which ledger to query',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['getAccountLines', 'getAccountObjects', 'getAccountTx'],
					},
				},
				typeOptions: {
					minValue: 1,
					maxValue: 400,
				},
				default: 200,
				description: 'Maximum number of results to return',
			},
			{
				displayName: 'Peer',
				name: 'peer',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['getAccountLines'],
					},
				},
				default: '',
				description: 'Filter trust lines by peer account address',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['getAccountObjects'],
					},
				},
				options: [
					{
						name: 'All',
						value: '',
					},
					{
						name: 'Check',
						value: 'check',
					},
					{
						name: 'Deposit Preauth',
						value: 'deposit_preauth',
					},
					{
						name: 'Escrow',
						value: 'escrow',
					},
					{
						name: 'NFT Offer',
						value: 'nft_offer',
					},
					{
						name: 'NFT Page',
						value: 'nft_page',
					},
					{
						name: 'Offer',
						value: 'offer',
					},
					{
						name: 'Payment Channel',
						value: 'payment_channel',
					},
					{
						name: 'Signer List',
						value: 'signer_list',
					},
					{
						name: 'State',
						value: 'state',
					},
					{
						name: 'Ticket',
						value: 'ticket',
					},
				],
				default: '',
				description: 'Filter objects by type',
			},
			{
				displayName: 'Transaction Type',
				name: 'transactionType',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['getAccountTx'],
					},
				},
				options: [
					{
						name: 'All',
						value: '',
					},
					{
						name: 'Payment',
						value: 'Payment',
					},
					{
						name: 'Offer Create',
						value: 'OfferCreate',
					},
					{
						name: 'Offer Cancel',
						value: 'OfferCancel',
					},
					{
						name: 'Trust Set',
						value: 'TrustSet',
					},
					{
						name: 'Account Set',
						value: 'AccountSet',
					},
					{
						name: 'Set Regular Key',
						value: 'SetRegularKey',
					},
					{
						name: 'Signer List Set',
						value: 'SignerListSet',
					},
					{
						name: 'Escrow Create',
						value: 'EscrowCreate',
					},
					{
						name: 'Escrow Finish',
						value: 'EscrowFinish',
					},
					{
						name: 'Escrow Cancel',
						value: 'EscrowCancel',
					},
					{
						name: 'Payment Channel Create',
						value: 'PaymentChannelCreate',
					},
					{
						name: 'Payment Channel Fund',
						value: 'PaymentChannelFund',
					},
					{
						name: 'Payment Channel Claim',
						value: 'PaymentChannelClaim',
					},
					{
						name: 'Check Create',
						value: 'CheckCreate',
					},
					{
						name: 'Check Cash',
						value: 'CheckCash',
					},
					{
						name: 'Check Cancel',
						value: 'CheckCancel',
					},
					{
						name: 'Deposit Preauth',
						value: 'DepositPreauth',
					},
					{
						name: 'NFToken Mint',
						value: 'NFTokenMint',
					},
					{
						name: 'NFToken Burn',
						value: 'NFTokenBurn',
					},
					{
						name: 'NFToken Create Offer',
						value: 'NFTokenCreateOffer',
					},
					{
						name: 'NFToken Accept Offer',
						value: 'NFTokenAcceptOffer',
					},
					{
						name: 'NFToken Cancel Offer',
						value: 'NFTokenCancelOffer',
					},
				],
				default: '',
				description: 'Filter transactions by type',
			},
			{
				displayName: 'Forward',
				name: 'forward',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['getAccountTx'],
					},
				},
				default: false,
				description: 'Whether to return results in ascending chronological order',
			},
			{
				displayName: 'Ledger Index Min',
				name: 'ledgerIndexMin',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['getAccountTx'],
					},
				},
				default: -1,
				description: 'Earliest ledger to include transactions from (-1 for earliest available)',
			},
			{
				displayName: 'Ledger Index Max',
				name: 'ledgerIndexMax',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['getAccountTx'],
					},
				},
				default: -1,
				description: 'Latest ledger to include transactions from (-1 for latest available)',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;

		try {
			switch (resource) {
				case 'account':
					return [await executeAccountOperations.call(this, items)];
				default:
					throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not known!`);
			}
		} catch (error) {
			throw new NodeOperationError(this.getNode(), `Error executing XRPL operation: ${error.message}`);
		}
	}
}

async function executeAccountOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;
	const credentials = await this.getCredentials('xrplApi');
	
	const client = new Client(credentials.server as string);
	
	try {
		await client.connect();
		
		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: any;
				
				switch (operation) {
					case 'getAccountInfo':
						responseData = await getAccountInfo.call(this, client, i);
						break;
					case 'getAccountLines':
						responseData = await getAccountLines.call(this, client, i);
						break;
					case 'getAccountObjects':
						responseData = await getAccountObjects.call(this, client, i);
						break;
					case 'getAccountTx':
						responseData = await getAccountTx.call(this, client, i);
						break;
					case 'validateAddress':
						responseData = await validateAddress.call(this, i);
						break;
					default:
						throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not known!`);
				}
				
				returnData.push({
					json: responseData,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: { item: i },
					});
				} else {
					throw error;
				}
			}
		}
	} finally {
		await client.disconnect();
	}
	
	return returnData;
}

async function getAccountInfo(this: IExecuteFunctions, client: Client, index: number): Promise<any> {
	const account = this.getNodeParameter('account', index) as string;
	const includeFlags = this.getNodeParameter('includeFlags', index, false) as boolean;
	const ledger = this.getNodeParameter('ledger', index, 'validated') as string;
	
	if (!isValidAddress(account)) {
		throw new NodeOperationError(this.getNode(), 'Invalid account address format');
	}
	
	try {
		const request: any = {
			command: 'account_info',
			account: account,
			ledger_index: ledger,
		};
		
		const response = await client.request(request);
		
		if (response.result?.error) {
			throw new NodeApiError(this.getNode(), response.result);
		}
		
		const accountData = response.result.account_data;
		
		// Convert balance from drops to XRP
		if (accountData.Balance) {
			accountData.BalanceXRP = new BigNumber(accountData.Balance).dividedBy('1000000').toString();
		}
		
		// Include detailed flag information if requested
		if (includeFlags && accountData.Flags) {
			accountData.FlagsDecoded = decodeAccountFlags(accountData.Flags);
		}
		
		return {
			account_data: accountData,
			ledger_current_index: response.result.ledger_current_index,
			ledger_index: response.result.ledger_index,
			validated: response.result.validated,
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

async function getAccountLines(this: IExecuteFunctions, client: Client, index: number): Promise<any> {
	const account = this.getNodeParameter('account', index) as string;
	const limit = this.getNodeParameter('limit', index, 200) as number;
	const peer = this.getNodeParameter('peer', index, '') as string;
	const ledger = this.getNodeParameter('ledger', index, 'validated') as string;
	
	if (!isValidAddress(account)) {
		throw new NodeOperationError(this.getNode(), 'Invalid account address format');
	}
	
	if (peer && !isValidAddress(peer)) {
		throw new NodeOperationError(this.getNode(), 'Invalid peer address format');
	}
	
	try {
		const request: any = {
			command: 'account_lines',
			account: account,
			limit: limit,
			ledger_index: ledger,
		};
		
		if (peer) {
			request.peer = peer;
		}
		
		const response = await client.request(request);
		
		if (response.result?.error) {
			throw new NodeApiError(this.getNode(), response.result);
		}
		
		return {
			account: response.result.account,
			lines: response.result.lines,
			ledger_current_index: response.result.ledger_current_index,
			ledger_index: response.result.ledger_index,
			validated: response.result.validated,
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

async function getAccountObjects(this: IExecuteFunctions, client: Client, index: number): Promise<any> {
	const account = this.getNodeParameter('account', index) as string;
	const limit = this.getNodeParameter('limit', index, 200) as number;
	const type = this.getNodeParameter('type', index, '') as string;
	const ledger = this.getNodeParameter('ledger', index, 'validated') as string;
	
	if (!isValidAddress(account)) {
		throw new NodeOperationError(this.getNode(), 'Invalid account address format');
	}
	
	try {
		const request: any = {
			command: 'account_objects',
			account: account,
			limit: limit,
			ledger_index: ledger,
		};
		
		if (type) {
			request.type = type;
		}
		
		const response = await client.request(request);
		
		if (response.result?.error) {
			throw new NodeApiError(this.getNode(), response.result);
		}
		
		return {
			account: response.result.account,
			account_objects: response.result.account_objects,
			ledger_current_index: response.result.ledger_current_index,
			ledger_index: response.result.ledger_index,
			validated: response.result.validated,
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

async function getAccountTx(this: IExecuteFunctions, client: Client, index: number): Promise<any> {
	const account = this.getNodeParameter('account', index) as string;
	const limit = this.getNodeParameter('limit', index, 200) as number;
	const transactionType = this.getNodeParameter('transactionType', index, '') as string;
	const forward = this.getNodeParameter('forward', index, false) as boolean;
	const ledgerIndexMin = this.getNodeParameter('ledgerIndexMin', index, -1) as number;
	const ledgerIndexMax = this.getNodeParameter('ledgerIndexMax', index, -1) as number;
	
	if (!isValidAddress(account)) {
		throw new NodeOperationError(this.getNode(), 'Invalid account address format');
	}
	
	try {
		const request: any = {
			command: 'account_tx',
			account: account,
			limit: limit,
			forward: forward,
		};
		
		if (transactionType) {
			request.transaction_type = transactionType;
		}
		
		if (ledgerIndexMin !== -1) {
			request.ledger_index_min = ledgerIndexMin;
		}
		
		if (ledgerIndexMax !== -1) {
			request.ledger_index_max = ledgerIndexMax;
		}
		
		const response = await client.request(request);
		
		if (response.result?.error) {
			throw new NodeApiError(this.getNode(), response.result);
		}
		
		return {
			account: response.result.account,
			transactions: response.result.transactions,
			ledger_index_min: response.result.ledger_index_min,
			ledger_index_max: response.result.ledger_index_max,
			validated: response.result.validated,
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

async function validateAddress(this: IExecuteFunctions, index: number): Promise<any> {
	const address = this.getNodeParameter('address', index) as string;
	
	const isValid = isValidAddress(address);
	
	return {
		address: address,
		valid: isValid,
		...(isValid ? { type: 'classic' } : { error: 'Invalid address format' }),
	};
}

function decodeAccountFlags(flags: number): any {
	const flagsDecoded: any = {};
	
	// Account flags as defined in XRPL documentation
	const flagDefinitions = {
		lsfPasswordSpent: 0x00010000,
		lsfRequireDestTag: 0x00020000,
		lsfRequireAuth: 0x00040000,
		lsfDisallowXRP: 0x00080000,
		lsfDisableMaster: 0x00100000,
		lsfAccountTxnID: 0x00200000,
		lsfNoFreeze: 0x00400000,
		lsfGlobalFreeze: 0x00800000,
		lsfDefaultRipple: 0x01000000,
		lsfDepositAuth: 0x02000000,
		lsfAuthorizedNFTokenMinter: 0x04000000,
		lsfMintingBurning: 0x08000000,
		lsfAMMNode: 0x10000000,
	};
	
	for (const [flagName, flagValue] of Object.entries(flagDefinitions)) {
		flagsDecoded[flagName] = (flags & flagValue) !== 0;
	}
	
	return flagsDecoded;
}