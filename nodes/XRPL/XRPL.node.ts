/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-xrpl/blob/main/LICENSE
 * 
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

import { Client, Wallet, dropsToXrp, isValidAddress } from 'xrpl';
import { Client, TrustSet, TrustSetFlagsInterface, AccountLinesRequest, AccountLinesResponse } from 'xrpl';
import { Client, Payment as XrplPayment, xrpToDrops, dropsToXrp, PathFind } from 'xrpl';
import * as crypto from 'crypto';
import { Client, dropsToXrp, xrpToDrops, OfferCreate, OfferCancel } from 'xrpl';
import { Wallet } from 'xrpl';
import { Client, Wallet, xrpToDrops } from 'xrpl';
import { Client, EscrowCreate, EscrowFinish, EscrowCancel, AccountObjectsRequest, Wallet } from 'xrpl';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import { Client, Wallet, dropsToXrp, xrpToDrops } from 'xrpl';
import { Client, PaymentChannelCreate, PaymentChannelFund, PaymentChannelClaim, Wallet } from 'xrpl';
import { AMMCreate, AMMDeposit, AMMWithdraw, AMMVote } from 'xrpl/dist/npm/models/transactions';
import { Client, xrplToDrops } from 'xrpl';
import { Client, CredentialCreate, CredentialAccept, CredentialDelete } from 'xrpl';
import { createHash } from 'crypto';
import { Client, Wallet, xrpToDrops, dropsToXrp } from 'xrpl';
import { Client, xrpToDrops, dropsToXrp } from 'xrpl';
import { Client, xrpToDrops } from 'xrpl';
import { Client, dropsToXrp, xrpToDrops } from 'xrpl';

export class XRPL implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'XRPL',
    name: 'xrpl',
    icon: 'file:xrpl.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the XRPL API',
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
      // Resource selector
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
            name: 'Transaction',
            value: 'transaction',
          },
          {
            name: 'TrustLine',
            value: 'trustLine',
          },
          {
            name: 'Payment',
            value: 'payment',
          },
          {
            name: 'Ledger',
            value: 'ledger',
          },
          {
            name: 'OrderBook',
            value: 'orderBook',
          },
          {
            name: 'DEX',
            value: 'dEX',
          },
          {
            name: 'Nft',
            value: 'nft',
          },
          {
            name: 'NFT',
            value: 'nFT',
          },
          {
            name: 'Server',
            value: 'server',
          },
          {
            name: 'Amm',
            value: 'amm',
          },
          {
            name: 'AMM',
            value: 'aMM',
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
            name: 'PaymentChannel',
            value: 'paymentChannel',
          },
          {
            name: 'PermissionedDomain',
            value: 'permissionedDomain',
          },
          {
            name: 'Credential',
            value: 'credential',
          },
          {
            name: 'MultiPurposeToken',
            value: 'multiPurposeToken',
          },
          {
            name: 'Vault',
            value: 'vault',
          },
          {
            name: 'Lending',
            value: 'lending',
          },
          {
            name: 'Simulation',
            value: 'simulation',
          },
          {
            name: 'Utility',
            value: 'utility',
          }
        ],
        default: 'account',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['account'] } },
  options: [
    { name: 'Get Account Info', value: 'accountInfo', description: 'Get account information and balances', action: 'Get account info' },
    { name: 'Get Account Lines', value: 'accountLines', description: 'Get account trust lines', action: 'Get account lines' },
    { name: 'Get Account Objects', value: 'accountObjects', description: 'Get objects owned by account', action: 'Get account objects' },
    { name: 'Get Account Offers', value: 'accountOffers', description: 'Get offers made by account', action: 'Get account offers' },
    { name: 'Get Account Transactions', value: 'accountTx', description: 'Get account transaction history', action: 'Get account transactions' },
    {
      name: 'Get Account Balances',
      value: 'getAccountBalances',
      description: 'Get all token balances for an account',
      action: 'Get account balances',
    },
    {
      name: 'Get Account NFTs',
      value: 'getAccountNfts',
      description: 'Get all NFTs owned by an account',
      action: 'Get account nfts',
    },
    {
      name: 'Get Transaction History',
      value: 'getTransactionHistory',
      description: 'Get transaction history for an account',
      action: 'Get transaction history',
    },
    {
      name: 'Validate Address',
      value: 'validateAddress',
      description: 'Validate if an address is a valid XRPL address',
      action: 'Validate address',
    },
    {
      name: 'Generate Wallet',
      value: 'generateWallet',
      description: 'Generate a new XRPL wallet with address and keys',
      action: 'Generate wallet',
    },
  ],
  default: 'accountInfo',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['transaction'] } },
	options: [
		{ name: 'Submit Transaction', value: 'submit', description: 'Submit a signed transaction to the ledger', action: 'Submit a signed transaction' },
		{ name: 'Submit Multisigned Transaction', value: 'submitMultisigned', description: 'Submit a multi-signed transaction to the ledger', action: 'Submit a multi-signed transaction' },
		{ name: 'Get Transaction Details', value: 'getTransaction', description: 'Retrieve details of a specific transaction', action: 'Get transaction details' },
		{ name: 'Get Transaction Entry', value: 'getTransactionEntry', description: 'Get transaction from a specific ledger', action: 'Get transaction from ledger' },
		{ name: 'Sign Transaction', value: 'sign', description: 'Sign a transaction (admin only)', action: 'Sign a transaction' },
	],
	default: 'submit',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['trustLine'],
    },
  },
  options: [
    {
      name: 'Get Trust Lines',
      value: 'getTrustLines',
      description: 'Retrieve trust lines for an account',
      action: 'Get trust lines',
    },
    {
      name: 'Create Trust Line',
      value: 'createTrustLine',
      description: 'Create a new trust line',
      action: 'Create trust line',
    },
    {
      name: 'Modify Trust Line',
      value: 'modifyTrustLine',
      description: 'Modify an existing trust line',
      action: 'Modify trust line',
    },
    {
      name: 'Remove Trust Line',
      value: 'removeTrustLine',
      description: 'Remove a trust line by setting limit to 0',
      action: 'Remove trust line',
    },
    {
      name: 'Deep Freeze Trust Line',
      value: 'deepFreezeTrustLine',
      description: 'Deep freeze a trust line to prevent all transactions',
      action: 'Deep freeze trust line',
    },
  ],
  default: 'getTrustLines',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['payment'],
		},
	},
	options: [
		{
			name: 'Find Payment Path',
			value: 'findPath',
			description: 'Find payment paths between accounts',
			action: 'Find payment path',
		},
		{
			name: 'Find Payment Path with Source Currencies',
			value: 'findPathWithSource',
			description: 'Find payment paths with specific source currencies',
			action: 'Find payment path with source currencies',
		},
		{
			name: 'Verify Payment Channel',
			value: 'verifyChannel',
			description: 'Verify payment channel claim signature',
			action: 'Verify payment channel',
		},
    {
      name: 'Send XRP',
      value: 'sendXrp',
      description: 'Send XRP to another account',
      action: 'Send XRP',
    },
    {
      name: 'Send Issued Currency',
      value: 'sendIssuedCurrency',
      description: 'Send issued currency tokens',
      action: 'Send issued currency',
    },
    {
      name: 'Pathfind Cross-Currency',
      value: 'pathfindCrosscurrency',
      description: 'Find payment paths for cross-currency transactions',
      action: 'Find cross-currency paths',
    },
	],
	default: 'findPath',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['ledger'] } },
  options: [
    { name: 'Get Ledger', value: 'getLedger', description: 'Get ledger information', action: 'Get ledger information' },
    { name: 'Get Closed Ledger', value: 'getClosedLedger', description: 'Get last closed ledger', action: 'Get last closed ledger' },
    { name: 'Get Current Ledger', value: 'getCurrentLedger', description: 'Get current working ledger', action: 'Get current working ledger' },
    { name: 'Get Ledger Data', value: 'getLedgerData', description: 'Get ledger objects', action: 'Get ledger objects' },
    { name: 'Get Ledger Entry', value: 'getLedgerEntry', description: 'Get specific ledger object', action: 'Get specific ledger object' }
  ],
  default: 'getLedger',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['orderBook'] } },
  options: [
    { name: 'Get Order Book Offers', value: 'getOffers', description: 'Retrieve order book offers for a trading pair', action: 'Get order book offers' },
    { name: 'Check Deposit Authorization', value: 'checkDepositAuth', description: 'Check if a deposit is authorized between accounts', action: 'Check deposit authorization' }
  ],
  default: 'getOffers',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['dEX'],
    },
  },
  options: [
    {
      name: 'Create DEX Offer',
      value: 'createDexOffer',
      description: 'Create a new offer on the DEX',
      action: 'Create DEX offer',
    },
    {
      name: 'Cancel DEX Offer',
      value: 'cancelDexOffer',
      description: 'Cancel an existing DEX offer',
      action: 'Cancel DEX offer',
    },
    {
      name: 'Get Order Book',
      value: 'getOrderBook',
      description: 'Retrieve order book for a currency pair',
      action: 'Get order book',
    },
    {
      name: 'Get Account Offers',
      value: 'getAccountOffers',
      description: 'Get all offers for an account',
      action: 'Get account offers',
    },
  ],
  default: 'createDexOffer',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['nft'],
		},
	},
	options: [
		{
			name: 'Get Account NFTs',
			value: 'getAccountNfts',
			description: 'Get NFTs owned by an account',
			action: 'Get account NFTs',
		},
		{
			name: 'Get NFT Info',
			value: 'getNftInfo',
			description: 'Get information about a specific NFT',
			action: 'Get NFT info',
		},
		{
			name: 'Get NFT Sell Offers',
			value: 'getNftSellOffers',
			description: 'Get sell offers for a specific NFT',
			action: 'Get NFT sell offers',
		},
		{
			name: 'Get NFT Buy Offers',
			value: 'getNftBuyOffers',
			description: 'Get buy offers for a specific NFT',
			action: 'Get NFT buy offers',
		},
	],
	default: 'getAccountNfts',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['nFT'],
    },
  },
  options: [
    {
      name: 'Mint NFT',
      value: 'mintNft',
      description: 'Mint a new NFT on XRPL',
      action: 'Mint NFT',
    },
    {
      name: 'Burn NFT',
      value: 'burnNft',
      description: 'Burn an existing NFT',
      action: 'Burn NFT',
    },
    {
      name: 'Create NFT Sell Offer',
      value: 'createNftSellOffer',
      description: 'Create a sell offer for an NFT',
      action: 'Create NFT sell offer',
    },
    {
      name: 'Create NFT Buy Offer',
      value: 'createNftBuyOffer',
      description: 'Create a buy offer for an NFT',
      action: 'Create NFT buy offer',
    },
    {
      name: 'Accept NFT Offer',
      value: 'acceptNftOffer',
      description: 'Accept an NFT buy or sell offer',
      action: 'Accept NFT offer',
    },
    {
      name: 'Cancel NFT Offer',
      value: 'cancelNftOffer',
      description: 'Cancel an NFT offer',
      action: 'Cancel NFT offer',
    },
    {
      name: 'Get NFT Offers',
      value: 'getNftOffers',
      description: 'Get offers for an NFT',
      action: 'Get NFT offers',
    },
    {
      name: 'Update Dynamic NFT URI',
      value: 'updateDynamicNftUri',
      description: 'Update the URI of a dynamic NFT',
      action: 'Update dynamic NFT URI',
    },
  ],
  default: 'mintNft',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['server'] } },
	options: [
		{ name: 'Get Server Information', value: 'serverInfo', description: 'Get detailed information about the server', action: 'Get server information' },
		{ name: 'Get Server State', value: 'serverState', description: 'Get current state of the server', action: 'Get server state' },
		{ name: 'Ping Server', value: 'ping', description: 'Ping the server to check connectivity', action: 'Ping server' },
		{ name: 'Get Random Number', value: 'random', description: 'Get a random number from the server', action: 'Get random number' },
		{ name: 'Get Fee Information', value: 'fee', description: 'Get current base and reserve fees', action: 'Get fee information' },
	],
	default: 'serverInfo',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['amm'],
    },
  },
  options: [
    {
      name: 'Get AMM Info',
      value: 'getAmmInfo',
      description: 'Get Automated Market Maker pool information',
      action: 'Get AMM information',
    },
    {
      name: 'Get Aggregate Price',
      value: 'getAggregatePrice',
      description: 'Get aggregate price information from AMM pools',
      action: 'Get aggregate price information',
    },
  ],
  default: 'getAmmInfo',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['aMM'],
    },
  },
  options: [
    {
      name: 'Create AMM Pool',
      value: 'createAmmPool',
      description: 'Create a new AMM pool with specified assets',
      action: 'Create AMM pool',
    },
    {
      name: 'Deposit to AMM',
      value: 'depositToAmm',
      description: 'Deposit assets into an existing AMM pool',
      action: 'Deposit to AMM pool',
    },
    {
      name: 'Withdraw from AMM',
      value: 'withdrawFromAmm',
      description: 'Withdraw assets from an AMM pool',
      action: 'Withdraw from AMM pool',
    },
    {
      name: 'Vote on AMM Fees',
      value: 'ammVoteOnFees',
      description: 'Vote on the trading fees for an AMM pool',
      action: 'Vote on AMM fees',
    },
    {
      name: 'Get AMM Info',
      value: 'getAmmInfo',
      description: 'Get information about an AMM pool',
      action: 'Get AMM information',
    },
  ],
  default: 'createAmmPool',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['escrow'],
    },
  },
  options: [
    {
      name: 'Create Escrow',
      value: 'createEscrow',
      description: 'Create a new escrow transaction',
      action: 'Create escrow',
    },
    {
      name: 'Finish Escrow',
      value: 'finishEscrow',
      description: 'Complete an existing escrow transaction',
      action: 'Finish escrow',
    },
    {
      name: 'Cancel Escrow',
      value: 'cancelEscrow',
      description: 'Cancel an existing escrow transaction',
      action: 'Cancel escrow',
    },
    {
      name: 'Get Escrows',
      value: 'getEscrows',
      description: 'Retrieve escrow objects for an account',
      action: 'Get escrows',
    },
  ],
  default: 'createEscrow',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['check'],
    },
  },
  options: [
    {
      name: 'Create Check',
      value: 'createCheck',
      description: 'Create a Check object to send value later',
      action: 'Create check',
    },
    {
      name: 'Cash Check',
      value: 'cashCheck',
      description: 'Cash a Check to receive the promised amount',
      action: 'Cash check',
    },
    {
      name: 'Cancel Check',
      value: 'cancelCheck',
      description: 'Cancel a Check before it expires or is cashed',
      action: 'Cancel check',
    },
    {
      name: 'Get Checks',
      value: 'getChecks',
      description: 'Get all Checks for an account',
      action: 'Get checks',
    },
  ],
  default: 'createCheck',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['paymentChannel'],
    },
  },
  options: [
    {
      name: 'Create Payment Channel',
      value: 'createPaymentChannel',
      description: 'Create a new payment channel between accounts',
      action: 'Create payment channel',
    },
    {
      name: 'Fund Payment Channel',
      value: 'fundPaymentChannel',
      description: 'Add more XRP to an existing payment channel',
      action: 'Fund payment channel',
    },
    {
      name: 'Claim Payment Channel',
      value: 'claimPaymentChannel',
      description: 'Claim or close a payment channel',
      action: 'Claim payment channel',
    },
    {
      name: 'Get Payment Channels',
      value: 'getPaymentChannels',
      description: 'Retrieve payment channels for an account',
      action: 'Get payment channels',
    },
  ],
  default: 'createPaymentChannel',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['permissionedDomain'],
    },
  },
  options: [
    {
      name: 'Create Permissioned Domain',
      value: 'createPermissionedDomain',
      description: 'Create a new permissioned domain on XRPL',
      action: 'Create permissioned domain',
    },
    {
      name: 'Update Permissioned Domain',
      value: 'updatePermissionedDomain',
      description: 'Update an existing permissioned domain',
      action: 'Update permissioned domain',
    },
    {
      name: 'Delete Permissioned Domain',
      value: 'deletePermissionedDomain',
      description: 'Delete a permissioned domain',
      action: 'Delete permissioned domain',
    },
    {
      name: 'Get Permissioned Domains',
      value: 'getPermissionedDomains',
      description: 'Retrieve permissioned domains information',
      action: 'Get permissioned domains',
    },
  ],
  default: 'createPermissionedDomain',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['credential'],
    },
  },
  options: [
    {
      name: 'Create Credential',
      value: 'createCredential',
      description: 'Create a new credential on the XRPL',
      action: 'Create credential',
    },
    {
      name: 'Accept Credential',
      value: 'acceptCredential',
      description: 'Accept an existing credential',
      action: 'Accept credential',
    },
    {
      name: 'Delete Credential',
      value: 'deleteCredential',
      description: 'Delete a credential from the XRPL',
      action: 'Delete credential',
    },
    {
      name: 'Get Credentials',
      value: 'getCredentials',
      description: 'Retrieve credentials from the XRPL',
      action: 'Get credentials',
    },
  ],
  default: 'createCredential',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['multiPurposeToken'],
    },
  },
  options: [
    {
      name: 'Issue MPT',
      value: 'issueMpt',
      description: 'Issue a Multi Purpose Token',
      action: 'Issue MPT',
    },
    {
      name: 'Transfer MPT',
      value: 'transferMpt',
      description: 'Transfer Multi Purpose Token to another account',
      action: 'Transfer MPT',
    },
    {
      name: 'Get MPT Info',
      value: 'getMptInfo',
      description: 'Get information about a Multi Purpose Token',
      action: 'Get MPT info',
    },
    {
      name: 'Get MPT Holders',
      value: 'getMptHolders',
      description: 'Get list of holders for a Multi Purpose Token',
      action: 'Get MPT holders',
    },
  ],
  default: 'issueMpt',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['vault'],
    },
  },
  options: [
    {
      name: 'Create Vault',
      value: 'createVault',
      description: 'Create a new vault on XRPL',
      action: 'Create vault',
    },
    {
      name: 'Deposit To Vault',
      value: 'depositToVault',
      description: 'Deposit funds to an existing vault',
      action: 'Deposit to vault',
    },
    {
      name: 'Withdraw From Vault',
      value: 'withdrawFromVault',
      description: 'Withdraw funds from an existing vault',
      action: 'Withdraw from vault',
    },
    {
      name: 'Get Vault Info',
      value: 'getVaultInfo',
      description: 'Get information about a vault',
      action: 'Get vault info',
    },
  ],
  default: 'createVault',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['lending'],
    },
  },
  options: [
    {
      name: 'Create Lending Pool',
      value: 'createLendingPool',
      description: 'Create a new lending pool on XRPL',
      action: 'Create lending pool',
    },
    {
      name: 'Borrow from Pool',
      value: 'borrowFromPool',
      description: 'Borrow assets from an existing lending pool',
      action: 'Borrow from pool',
    },
    {
      name: 'Repay Loan',
      value: 'repayLoan',
      description: 'Repay an outstanding loan',
      action: 'Repay loan',
    },
    {
      name: 'Get Lending Pool Info',
      value: 'getLendingPoolInfo',
      description: 'Get information about a lending pool',
      action: 'Get lending pool info',
    },
  ],
  default: 'createLendingPool',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['simulation'],
    },
  },
  options: [
    {
      name: 'Simulate Transaction',
      value: 'simulateTransaction',
      description: 'Simulate a transaction without submitting it to the ledger',
      action: 'Simulate transaction',
    },
  ],
  default: 'simulateTransaction',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['utility'],
    },
  },
  options: [
    {
      name: 'Convert XRP Drops',
      value: 'convertXrpDrops',
      description: 'Convert between XRP and drops',
      action: 'Convert XRP drops',
    },
    {
      name: 'Get Transaction',
      value: 'getTransaction',
      description: 'Get a transaction by hash',
      action: 'Get transaction',
    },
    {
      name: 'Get Ledger Info',
      value: 'getLedgerInfo',
      description: 'Get information about a ledger',
      action: 'Get ledger info',
    },
    {
      name: 'Get Server Info',
      value: 'getServerInfo',
      description: 'Get server information',
      action: 'Get server info',
    },
    {
      name: 'Get Fee Estimates',
      value: 'getFeeEstimates',
      description: 'Get current fee estimates',
      action: 'Get fee estimates',
    },
  ],
  default: 'convertXrpDrops',
},
      // Parameter definitions
{
  displayName: 'Account Address',
  name: 'account',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['account'], operation: ['accountInfo', 'accountLines', 'accountObjects', 'accountOffers', 'accountTx'] } },
  default: '',
  placeholder: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
  description: 'The XRPL account address to query',
},
{
  displayName: 'Account Address',
  name: 'account',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getAccountBalances'],
    },
  },
  default: '',
  description: 'The XRPL account address to get balances for',
  placeholder: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
},
{
  displayName: 'Account Address',
  name: 'account',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getAccountNfts'],
    },
  },
  default: '',
  description: 'The XRPL account address to get NFTs for',
  placeholder: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
},
{
  displayName: 'Account Address',
  name: 'account',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getTransactionHistory'],
    },
  },
  default: '',
  description: 'The XRPL account address to get transaction history for',
  placeholder: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
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
  description: 'The address to validate',
  placeholder: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
},
{
  displayName: 'Entropy',
  name: 'entropy',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['generateWallet'],
    },
  },
  default: '',
  description: 'Optional entropy for wallet generation. If not provided, random entropy will be used.',
},
{
  displayName: 'Ledger Index',
  name: 'ledgerIndex',
  type: 'string',
  displayOptions: { show: { resource: ['account'], operation: ['accountInfo', 'accountLines', 'accountObjects', 'accountOffers'] } },
  default: 'validated',
  placeholder: 'validated',
  description: 'The ledger index to use (validated, closed, current, or specific number)',
},
{
  displayName: 'Peer',
  name: 'peer',
  type: 'string',
  displayOptions: { show: { resource: ['account'], operation: ['accountLines'] } },
  default: '',
  placeholder: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
  description: 'Only return trust lines to this peer account',
},
{
  displayName: 'Object Type',
  name: 'type',
  type: 'options',
  displayOptions: { show: { resource: ['account'], operation: ['accountObjects'] } },
  options: [
    { name: 'All', value: '', description: 'All object types' },
    { name: 'Check', value: 'check', description: 'Check objects' },
    { name: 'Deposit Preauth', value: 'deposit_preauth', description: 'Deposit preauth objects' },
    { name: 'Escrow', value: 'escrow', description: 'Escrow objects' },
    { name: 'Offer', value: 'offer', description: 'Offer objects' },
    { name: 'Payment Channel', value: 'payment_channel', description: 'Payment channel objects' },
    { name: 'Signer List', value: 'signer_list', description: 'Signer list objects' },
    { name: 'State', value: 'state', description: 'State objects' },
    { name: 'Ticket', value: 'ticket', description: 'Ticket objects' }
  ],
  default: '',
  description: 'Filter by object type',
},
{
  displayName: 'Minimum Ledger Index',
  name: 'ledgerIndexMin',
  type: 'number',
  displayOptions: { show: { resource: ['account'], operation: ['accountTx'] } },
  default: -1,
  description: 'Earliest ledger to include in search (-1 for earliest available)',
},
{
  displayName: 'Maximum Ledger Index',
  name: 'ledgerIndexMax',
  type: 'number',
  displayOptions: { show: { resource: ['account'], operation: ['accountTx'] } },
  default: -1,
  description: 'Latest ledger to include in search (-1 for latest available)',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: { show: { resource: ['account'], operation: ['accountLines', 'accountObjects', 'accountOffers', 'accountTx'] } },
  default: 200,
  description: 'Maximum number of results to return',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getAccountNfts'],
    },
  },
  default: 100,
  description: 'Maximum number of NFTs to return',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getTransactionHistory'],
    },
  },
  default: 50,
  description: 'Maximum number of transactions to return',
},
{
  displayName: 'Forward',
  name: 'forward',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['account'],
      operation: ['getTransactionHistory'],
    },
  },
  default: false,
  description: 'If true, return transactions in ascending order',
},
{
	displayName: 'Transaction Blob',
	name: 'txBlob',
	type: 'string',
	required: true,
	displayOptions: { show: { resource: ['transaction'], operation: ['submit'] } },
	default: '',
	description: 'Hex-encoded signed transaction data',
},
{
	displayName: 'Transaction JSON',
	name: 'txJson',
	type: 'json',
	required: true,
	displayOptions: { show: { resource: ['transaction'], operation: ['submitMultisigned'] } },
	default: '{}',
	description: 'Multi-signed transaction object in JSON format',
},
{
	displayName: 'Transaction Hash',
	name: 'transaction',
	type: 'string',
	required: true,
	displayOptions: { show: { resource: ['transaction'], operation: ['getTransaction'] } },
	default: '',
	description: 'Hash of the transaction to retrieve',
},
{
	displayName: 'Binary',
	name: 'binary',
	type: 'boolean',
	displayOptions: { show: { resource: ['transaction'], operation: ['getTransaction'] } },
	default: false,
	description: 'Whether to return transaction data in binary format',
},
{
	displayName: 'Transaction Hash',
	name: 'txHash',
	type: 'string',
	required: true,
	displayOptions: { show: { resource: ['transaction'], operation: ['getTransactionEntry'] } },
	default: '',
	description: 'Hash of the transaction to retrieve',
},
{
	displayName: 'Ledger Index',
	name: 'ledgerIndex',
	type: 'number',
	required: true,
	displayOptions: { show: { resource: ['transaction'], operation: ['getTransactionEntry'] } },
	default: 0,
	description: 'Ledger index to search for the transaction',
},
{
	displayName: 'Transaction JSON',
	name: 'txJson',
	type: 'json',
	required: true,
	displayOptions: { show: { resource: ['transaction'], operation: ['sign'] } },
	default: '{}',
	description: 'Transaction object to sign in JSON format',
},
{
	displayName: 'Secret',
	name: 'secret',
	type: 'string',
	required: true,
	displayOptions: { show: { resource: ['transaction'], operation: ['sign'] } },
	default: '',
	description: 'Secret key to use for signing the transaction',
},
{
  displayName: 'Account Address',
  name: 'account',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['trustLine'],
      operation: ['getTrustLines'],
    },
  },
  default: '',
  description: 'The account address to get trust lines for',
},
{
  displayName: 'Peer Address',
  name: 'peer',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['trustLine'],
      operation: ['getTrustLines'],
    },
  },
  default: '',
  description: 'Filter trust lines by peer address',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['trustLine'],
      operation: ['getTrustLines'],
    },
  },
  default: 200,
  description: 'Maximum number of trust lines to return',
},
{
  displayName: 'Account Seed/Private Key',
  name: 'seed',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['trustLine'],
      operation: ['createTrustLine', 'modifyTrustLine', 'removeTrustLine', 'deepFreezeTrustLine'],
    },
  },
  default: '',
  description: 'The seed or private key of the account creating/modifying the trust line',
},
{
  displayName: 'Currency Code',
  name: 'currency',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['trustLine'],
      operation: ['createTrustLine', 'modifyTrustLine', 'removeTrustLine', 'deepFreezeTrustLine'],
    },
  },
  default: '',
  description: 'The currency code for the trust line (e.g., USD, EUR)',
},
{
  displayName: 'Issuer Address',
  name: 'issuer',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['trustLine'],
      operation: ['createTrustLine', 'modifyTrustLine', 'removeTrustLine', 'deepFreezeTrustLine'],
    },
  },
  default: '',
  description: 'The address of the currency issuer',
},
{
  displayName: 'Limit Amount',
  name: 'limitAmount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['trustLine'],
      operation: ['createTrustLine', 'modifyTrustLine'],
    },
  },
  default: '0',
  description: 'The maximum amount of currency this account can hold',
},
{
  displayName: 'Quality In',
  name: 'qualityIn',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['trustLine'],
      operation: ['createTrustLine', 'modifyTrustLine'],
    },
  },
  default: 0,
  description: 'Quality factor for incoming balances',
},
{
  displayName: 'Quality Out',
  name: 'qualityOut',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['trustLine'],
      operation: ['createTrustLine', 'modifyTrustLine'],
    },
  },
  default: 0,
  description: 'Quality factor for outgoing balances',
},
{
  displayName: 'Fee',
  name: 'fee',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['trustLine'],
      operation: ['createTrustLine', 'modifyTrustLine', 'removeTrustLine', 'deepFreezeTrustLine'],
    },
  },
  default: '12',
  description: 'Transaction fee in drops (1 XRP = 1,000,000 drops)',
},
{
  displayName: 'Flags',
  name: 'flags',
  type: 'collection',
  placeholder: 'Add Flag',
  default: {},
  displayOptions: {
    show: {
      resource: ['trustLine'],
      operation: ['createTrustLine', 'modifyTrustLine', 'deepFreezeTrustLine'],
    },
  },
  options: [
    {
      displayName: 'Set No Ripple',
      name: 'setNoRipple',
      type: 'boolean',
      default: false,
      description: 'Enable the NoRipple flag',
    },
    {
      displayName: 'Clear No Ripple',
      name: 'clearNoRipple',
      type: 'boolean',
      default: false,
      description: 'Disable the NoRipple flag',
    },
    {
      displayName: 'Set Freeze',
      name: 'setFreeze',
      type: 'boolean',
      default: false,
      description: 'Freeze the trust line',
    },
    {
      displayName: 'Clear Freeze',
      name: 'clearFreeze',
      type: 'boolean',
      default: false,
      description: 'Unfreeze the trust line',
    },
  ],
  description: 'Additional flags for the trust line',
},
{
	displayName: 'Source Account',
	name: 'sourceAccount',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['payment'],
			operation: ['findPath', 'findPathWithSource'],
		},
	},
	default: '',
	description: 'The source account address',
},
{
	displayName: 'Destination Account',
	name: 'destinationAccount',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['payment'],
			operation: ['findPath', 'findPathWithSource'],
		},
	},
	default: '',
	description: 'The destination account address',
},
{
	displayName: 'Destination Amount',
	name: 'destinationAmount',
	type: 'json',
	required: true,
	displayOptions: {
		show: {
			resource: ['payment'],
			operation: ['findPath', 'findPathWithSource'],
		},
	},
	default: '{}',
	description: 'The amount to be delivered. Use {"currency": "XRP", "value": "1000000"} for XRP in drops or {"currency": "USD", "value": "100", "issuer": "account"} for tokens',
},
{
	displayName: 'Source Currencies',
	name: 'sourceCurrencies',
	type: 'json',
	required: true,
	displayOptions: {
		show: {
			resource: ['payment'],
			operation: ['findPathWithSource'],
		},
	},
	default: '[]',
	description: 'Array of currencies that can be used as source funds. Example: [{"currency": "XRP"}, {"currency": "USD", "issuer": "account"}]',
},
{
	displayName: 'Channel',
	name: 'channel',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['payment'],
			operation: ['verifyChannel'],
		},
	},
	default: '',
	description: 'The payment channel identifier',
},
{
	displayName: 'Signature',
	name: 'signature',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['payment'],
			operation: ['verifyChannel'],
		},
	},
	default: '',
	description: 'The signature to verify',
},
{
	displayName: 'Public Key',
	name: 'publicKey',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['payment'],
			operation: ['verifyChannel'],
		},
	},
	default: '',
	description: 'The public key used to sign the claim',
},
{
	displayName: 'Amount',
	name: 'amount',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['payment'],
			operation: ['verifyChannel'],
		},
	},
	default: '',
	description: 'The amount being claimed in drops',
},
{
  displayName: 'Destination Account',
  name: 'destination',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['payment'],
      operation: ['sendXrp', 'sendIssuedCurrency'],
    },
  },
  default: '',
  description: 'The destination account address',
},
{
  displayName: 'Amount (XRP)',
  name: 'amount',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['payment'],
      operation: ['sendXrp'],
    },
  },
  default: 0,
  description: 'Amount of XRP to send',
},
{
  displayName: 'Currency Code',
  name: 'currencyCode',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['payment'],
      operation: ['sendIssuedCurrency', 'pathfindCrosscurrency'],
    },
  },
  default: '',
  description: 'The currency code (e.g., USD, EUR)',
},
{
  displayName: 'Currency Amount',
  name: 'currencyAmount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['payment'],
      operation: ['sendIssuedCurrency'],
    },
  },
  default: '',
  description: 'Amount of currency to send',
},
{
  displayName: 'Currency Issuer',
  name: 'currencyIssuer',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['payment'],
      operation: ['sendIssuedCurrency', 'pathfindCrosscurrency'],
    },
  },
  default: '',
  description: 'The issuer address for the currency',
},
{
  displayName: 'Source Account',
  name: 'sourceAccount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['payment'],
      operation: ['pathfindCrosscurrency'],
    },
  },
  default: '',
  description: 'The source account for pathfinding',
},
{
  displayName: 'Destination Account',
  name: 'destinationAccount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['payment'],
      operation: ['pathfindCrosscurrency'],
    },
  },
  default: '',
  description: 'The destination account for pathfinding',
},
{
  displayName: 'Destination Amount',
  name: 'destinationAmount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['payment'],
      operation: ['pathfindCrosscurrency'],
    },
  },
  default: '',
  description: 'The amount to deliver at destination',
},
{
  displayName: 'Source Currency Code',
  name: 'sourceCurrencyCode',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['payment'],
      operation: ['pathfindCrosscurrency'],
    },
  },
  default: 'XRP',
  description: 'Source currency code (defaults to XRP)',
},
{
  displayName: 'Source Currency Issuer',
  name: 'sourceCurrencyIssuer',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['payment'],
      operation: ['pathfindCrosscurrency'],
    },
  },
  default: '',
  description: 'Source currency issuer (if not XRP)',
},
{
  displayName: 'Destination Tag',
  name: 'destinationTag',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['payment'],
      operation: ['sendXrp', 'sendIssuedCurrency'],
    },
  },
  default: undefined,
  description: 'Optional destination tag',
},
{
  displayName: 'Memo',
  name: 'memo',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['payment'],
      operation: ['sendXrp', 'sendIssuedCurrency'],
    },
  },
  default: '',
  description: 'Optional memo for the payment',
},
{
  displayName: 'Ledger Index',
  name: 'ledgerIndex',
  type: 'string',
  default: '',
  placeholder: 'validated',
  description: 'Ledger index or identifier (validated, closed, current, or number)',
  displayOptions: {
    show: {
      resource: ['ledger'],
      operation: ['getLedger', 'getLedgerData', 'getLedgerEntry']
    }
  }
},
{
  displayName: 'Include Transactions',
  name: 'transactions',
  type: 'boolean',
  default: false,
  description: 'Whether to include transaction data in the ledger',
  displayOptions: {
    show: {
      resource: ['ledger'],
      operation: ['getLedger']
    }
  }
},
{
  displayName: 'Expand Transactions',
  name: 'expand',
  type: 'boolean',
  default: false,
  description: 'Whether to expand transaction data',
  displayOptions: {
    show: {
      resource: ['ledger'],
      operation: ['getLedger']
    }
  }
},
{
  displayName: 'Marker',
  name: 'marker',
  type: 'string',
  default: '',
  description: 'Server-provided value to resume pagination from a previous response',
  displayOptions: {
    show: {
      resource: ['ledger'],
      operation: ['getLedgerData']
    }
  }
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  default: 200,
  description: 'Maximum number of ledger objects to return (1-2048)',
  displayOptions: {
    show: {
      resource: ['ledger'],
      operation: ['getLedgerData']
    }
  }
},
{
  displayName: 'Index',
  name: 'index',
  type: 'string',
  default: '',
  required: true,
  description: 'Hash of the ledger object to retrieve',
  displayOptions: {
    show: {
      resource: ['ledger'],
      operation: ['getLedgerEntry']
    }
  }
},
{
  displayName: 'Taker Gets Currency',
  name: 'takerGetsCurrency',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['orderBook'], operation: ['getOffers'] } },
  default: 'XRP',
  description: 'The currency code that the taker will receive',
},
{
  displayName: 'Taker Gets Issuer',
  name: 'takerGetsIssuer',
  type: 'string',
  displayOptions: { show: { resource: ['orderBook'], operation: ['getOffers'] } },
  default: '',
  description: 'The issuer of the currency (required for non-XRP currencies)',
},
{
  displayName: 'Taker Pays Currency',
  name: 'takerPaysCurrency',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['orderBook'], operation: ['getOffers'] } },
  default: 'USD',
  description: 'The currency code that the taker will pay',
},
{
  displayName: 'Taker Pays Issuer',
  name: 'takerPaysIssuer',
  type: 'string',
  displayOptions: { show: { resource: ['orderBook'], operation: ['getOffers'] } },
  default: '',
  description: 'The issuer of the currency (required for non-XRP currencies)',
},
{
  displayName: 'Ledger Index',
  name: 'ledgerIndex',
  type: 'string',
  displayOptions: { show: { resource: ['orderBook'], operation: ['getOffers', 'checkDepositAuth'] } },
  default: 'current',
  description: 'The ledger index to use (current, validated, closed, or specific number)',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: { show: { resource: ['orderBook'], operation: ['getOffers'] } },
  default: 20,
  description: 'Maximum number of offers to return',
},
{
  displayName: 'Source Account',
  name: 'sourceAccount',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['orderBook'], operation: ['checkDepositAuth'] } },
  default: '',
  description: 'The account address that would send the deposit',
},
{
  displayName: 'Destination Account',
  name: 'destinationAccount',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['orderBook'], operation: ['checkDepositAuth'] } },
  default: '',
  description: 'The account address that would receive the deposit',
},
{
  displayName: 'Account Address',
  name: 'account',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['dEX'],
      operation: ['createDexOffer', 'cancelDexOffer'],
    },
  },
  default: '',
  description: 'The account address creating or canceling the offer',
},
{
  displayName: 'Private Key',
  name: 'privateKey',
  type: 'string',
  typeOptions: {
    password: true,
  },
  required: true,
  displayOptions: {
    show: {
      resource: ['dEX'],
      operation: ['createDexOffer', 'cancelDexOffer'],
    },
  },
  default: '',
  description: 'The private key for signing the transaction',
},
{
  displayName: 'Taker Gets Currency',
  name: 'takerGetsCurrency',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['dEX'],
      operation: ['createDexOffer'],
    },
  },
  default: 'XRP',
  description: 'Currency code for what the taker will receive',
},
{
  displayName: 'Taker Gets Amount',
  name: 'takerGetsAmount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['dEX'],
      operation: ['createDexOffer'],
    },
  },
  default: '',
  description: 'Amount the taker will receive',
},
{
  displayName: 'Taker Gets Issuer',
  name: 'takerGetsIssuer',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['dEX'],
      operation: ['createDexOffer'],
    },
  },
  default: '',
  description: 'Issuer address for non-XRP currencies (leave empty for XRP)',
},
{
  displayName: 'Taker Pays Currency',
  name: 'takerPaysCurrency',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['dEX'],
      operation: ['createDexOffer'],
    },
  },
  default: 'USD',
  description: 'Currency code for what the taker will pay',
},
{
  displayName