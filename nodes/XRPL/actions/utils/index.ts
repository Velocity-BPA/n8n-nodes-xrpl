/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { withXrplClient, toDrops, toXrp, isValidAddress, isXAddress, getExplorerUrl, getAccountExplorerUrl } from '../../transport/xrplClient';
import type { XrplClientContext } from '../../transport/xrplClient';
import { classicAddressToXAddress, xAddressToClassicAddress, Wallet } from 'xrpl';

export const description: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['utility'] } },
    options: [
      { name: 'Convert XRP/Drops', value: 'convert', action: 'Convert XRP and drops' },
      { name: 'Validate Address', value: 'validateAddress', action: 'Validate address' },
      { name: 'Convert Address', value: 'convertAddress', action: 'Convert address format' },
      { name: 'Get Transaction', value: 'getTransaction', action: 'Get transaction' },
      { name: 'Get Ledger', value: 'getLedger', action: 'Get ledger' },
      { name: 'Get Server Info', value: 'getServerInfo', action: 'Get server info' },
      { name: 'Get Fee', value: 'getFee', action: 'Get fee' },
      { name: 'Generate Wallet', value: 'generateWallet', action: 'Generate wallet' },
    ],
    default: 'convert',
  },
  { displayName: 'Conversion Direction', name: 'conversionDirection', type: 'options', options: [{ name: 'XRP to Drops', value: 'xrpToDrops' }, { name: 'Drops to XRP', value: 'dropsToXrp' }], default: 'xrpToDrops', displayOptions: { show: { resource: ['utility'], operation: ['convert'] } } },
  { displayName: 'Amount', name: 'amount', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['utility'], operation: ['convert'] } } },
  { displayName: 'Address', name: 'address', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['utility'], operation: ['validateAddress', 'convertAddress'] } } },
  { displayName: 'Tag', name: 'tag', type: 'number', default: 0, displayOptions: { show: { resource: ['utility'], operation: ['convertAddress'] } } },
  { displayName: 'Transaction Hash', name: 'txHash', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['utility'], operation: ['getTransaction'] } } },
  { displayName: 'Ledger Index', name: 'ledgerIndex', type: 'options', options: [{ name: 'Validated', value: 'validated' }, { name: 'Closed', value: 'closed' }, { name: 'Current', value: 'current' }], default: 'validated', displayOptions: { show: { resource: ['utility'], operation: ['getLedger'] } } },
  { displayName: 'Fund on Testnet', name: 'fundOnTestnet', type: 'boolean', default: false, displayOptions: { show: { resource: ['utility'], operation: ['generateWallet'] } } },
];

export async function execute(this: IExecuteFunctions, index: number, operation: string): Promise<INodeExecutionData[]> {
  const credentials = await this.getCredentials('xrplApi');

  switch (operation) {
    case 'convert': {
      const direction = this.getNodeParameter('conversionDirection', index) as string;
      const amount = this.getNodeParameter('amount', index) as string;
      let result: string;
      if (direction === 'xrpToDrops') result = toDrops(amount); else result = toXrp(amount);
      return [{ json: { input: amount, output: result, direction, inputUnit: direction === 'xrpToDrops' ? 'XRP' : 'drops', outputUnit: direction === 'xrpToDrops' ? 'drops' : 'XRP' }, pairedItem: { item: index } }];
    }

    case 'validateAddress': {
      const address = this.getNodeParameter('address', index) as string;
      const isClassic = isValidAddress(address);
      const isX = isXAddress(address);
      return [{ json: { address, valid: isClassic || isX, isClassicAddress: isClassic, isXAddress: isX }, pairedItem: { item: index } }];
    }

    case 'convertAddress': {
      const address = this.getNodeParameter('address', index) as string;
      const tag = this.getNodeParameter('tag', index, 0) as number;
      const network = credentials.network as string;
      let classicAddress: string, xAddress: string, extractedTag: number | false = false;
      if (isXAddress(address)) {
        const decoded = xAddressToClassicAddress(address);
        classicAddress = decoded.classicAddress;
        extractedTag = decoded.tag;
        xAddress = classicAddressToXAddress(classicAddress, extractedTag !== false ? extractedTag : false, network === 'mainnet');
      } else if (isValidAddress(address)) {
        classicAddress = address;
        xAddress = classicAddressToXAddress(address, tag || false, network === 'mainnet');
        extractedTag = tag || false;
      } else throw new Error('Invalid XRPL address');
      return [{ json: { inputAddress: address, classicAddress, xAddress, tag: extractedTag, network }, pairedItem: { item: index } }];
    }

    case 'getTransaction': {
      return withXrplClient(credentials, async (context: XrplClientContext) => {
        const txHash = this.getNodeParameter('txHash', index) as string;
        const network = credentials.network as string;
        const response = await context.client.request({ command: 'tx', transaction: txHash });
        const tx = response.result;
        return [{ json: { hash: tx.hash, type: tx.TransactionType, account: tx.Account, validated: tx.validated, ledgerIndex: tx.ledger_index, explorerUrl: getExplorerUrl(txHash, network), transaction: tx }, pairedItem: { item: index } }];
      });
    }

    case 'getLedger': {
      return withXrplClient(credentials, async (context: XrplClientContext) => {
        const ledgerIndex = this.getNodeParameter('ledgerIndex', index) as string;
        const response = await context.client.request({ command: 'ledger', ledger_index: ledgerIndex as any });
        const result = response.result as any;
        const ledger = result.ledger;
        const rippleEpoch = 946684800;
        return [{ json: { ledgerIndex: ledger.ledger_index, ledgerHash: ledger.ledger_hash, closeTime: new Date((ledger.close_time + rippleEpoch) * 1000).toISOString(), totalCoins: toXrp(ledger.total_coins), closed: result.closed, validated: result.validated }, pairedItem: { item: index } }];
      });
    }

    case 'getServerInfo': {
      return withXrplClient(credentials, async (context: XrplClientContext) => {
        const response = await context.client.request({ command: 'server_info' });
        const info = response.result.info;
        return [{ json: { buildVersion: info.build_version, completeLedgers: info.complete_ledgers, hostId: info.hostid, serverState: info.server_state, validatedLedger: info.validated_ledger, uptime: info.uptime }, pairedItem: { item: index } }];
      });
    }

    case 'getFee': {
      return withXrplClient(credentials, async (context: XrplClientContext) => {
        const response = await context.client.request({ command: 'fee' });
        const drops = response.result.drops;
        return [{ json: { baseFee: toXrp(drops.base_fee), medianFee: toXrp(drops.median_fee), minimumFee: toXrp(drops.minimum_fee), openLedgerFee: toXrp(drops.open_ledger_fee), currentQueueSize: response.result.current_queue_size, maxQueueSize: response.result.max_queue_size }, pairedItem: { item: index } }];
      });
    }

    case 'generateWallet': {
      const fundOnTestnet = this.getNodeParameter('fundOnTestnet', index) as boolean;
      const network = credentials.network as string;
      if (fundOnTestnet && network === 'testnet') {
        return withXrplClient(credentials, async (context: XrplClientContext) => {
          const funded = await context.client.fundWallet();
          return [{ json: { address: funded.wallet.address, seed: funded.wallet.seed, publicKey: funded.wallet.publicKey, balance: funded.balance, funded: true, explorerUrl: getAccountExplorerUrl(funded.wallet.address, network) }, pairedItem: { item: index } }];
        });
      } else {
        const wallet = Wallet.generate();
        return [{ json: { address: wallet.address, seed: wallet.seed, publicKey: wallet.publicKey, funded: false, explorerUrl: getAccountExplorerUrl(wallet.address, network) }, pairedItem: { item: index } }];
      }
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
