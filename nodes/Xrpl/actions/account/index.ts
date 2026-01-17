/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { withXrplClient, toXrp, formatCurrencyCode, getAccountExplorerUrl } from '../../transport/xrplClient';
import type { XrplClientContext } from '../../transport/xrplClient';
import type { AccountInfoResponse, AccountLinesResponse, AccountNFTsResponse, AccountTxResponse } from 'xrpl';

export const description: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['account'] } },
    options: [
      { name: 'Get Info', value: 'getInfo', description: 'Get account information and XRP balance', action: 'Get account info' },
      { name: 'Get Balances', value: 'getBalances', description: 'Get all balances including trust lines', action: 'Get account balances' },
      { name: 'Get Trust Lines', value: 'getTrustLines', description: 'Get trust lines for the account', action: 'Get trust lines' },
      { name: 'Get NFTs', value: 'getNfts', description: 'Get NFTs owned by the account', action: 'Get NFTs owned' },
      { name: 'Get Transactions', value: 'getTransactions', description: 'Get transaction history for the account', action: 'Get transactions' },
    ],
    default: 'getInfo',
  },
  {
    displayName: 'Account Address',
    name: 'accountAddress',
    type: 'string',
    default: '',
    placeholder: 'rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    description: 'The account address to query. Leave empty to use the credential account.',
    displayOptions: { show: { resource: ['account'] } },
  },
  {
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: { show: { resource: ['account'], operation: ['getTransactions'] } },
    options: [
      { displayName: 'Limit', name: 'limit', type: 'number', default: 20, description: 'Maximum number of transactions to return' },
      { displayName: 'Forward', name: 'forward', type: 'boolean', default: false, description: 'Whether to return results in forward order' },
    ],
  },
];

export async function execute(this: IExecuteFunctions, index: number, operation: string): Promise<INodeExecutionData[]> {
  const credentials = await this.getCredentials('xrplApi');

  return withXrplClient(credentials, async (context: XrplClientContext) => {
    const accountAddress = this.getNodeParameter('accountAddress', index, '') as string;
    const address = accountAddress || context.accountAddress;
    const network = credentials.network as string;

    switch (operation) {
      case 'getInfo': {
        const response: AccountInfoResponse = await context.client.request({
          command: 'account_info',
          account: address,
          ledger_index: 'validated',
        });
        const accountData = response.result.account_data;
        return [{
          json: {
            address: accountData.Account,
            balance: toXrp(accountData.Balance),
            balanceDrops: accountData.Balance,
            sequence: accountData.Sequence,
            ownerCount: accountData.OwnerCount,
            previousTxnID: accountData.PreviousTxnID,
            previousTxnLgrSeq: accountData.PreviousTxnLgrSeq,
            flags: accountData.Flags,
            explorerUrl: getAccountExplorerUrl(address, network),
            raw: accountData,
          },
          pairedItem: { item: index },
        }];
      }

      case 'getBalances': {
        const [accountInfo, accountLines]: [AccountInfoResponse, AccountLinesResponse] = await Promise.all([
          context.client.request({ command: 'account_info', account: address, ledger_index: 'validated' }),
          context.client.request({ command: 'account_lines', account: address, ledger_index: 'validated' }),
        ]);
        const xrpBalance = { currency: 'XRP', value: toXrp(accountInfo.result.account_data.Balance), issuer: null };
        const tokenBalances = accountLines.result.lines.map((line) => ({
          currency: formatCurrencyCode(line.currency),
          value: line.balance,
          issuer: line.account,
          limit: line.limit,
        }));
        return [{
          json: { address, balances: [xrpBalance, ...tokenBalances], xrpBalance: xrpBalance.value, tokenCount: tokenBalances.length },
          pairedItem: { item: index },
        }];
      }

      case 'getTrustLines': {
        const response: AccountLinesResponse = await context.client.request({
          command: 'account_lines',
          account: address,
          ledger_index: 'validated',
        });
        const trustLines = response.result.lines.map((line) => ({
          currency: formatCurrencyCode(line.currency),
          issuer: line.account,
          balance: line.balance,
          limit: line.limit,
          limitPeer: line.limit_peer,
          noRipple: line.no_ripple,
          noRipplePeer: line.no_ripple_peer,
          freeze: line.freeze,
          freezePeer: line.freeze_peer,
        }));
        return [{
          json: { address, trustLines, count: trustLines.length },
          pairedItem: { item: index },
        }];
      }

      case 'getNfts': {
        const response: AccountNFTsResponse = await context.client.request({
          command: 'account_nfts',
          account: address,
          ledger_index: 'validated',
        });
        const nfts = response.result.account_nfts.map((nft) => ({
          nftId: nft.NFTokenID,
          issuer: nft.Issuer,
          taxon: nft.NFTokenTaxon,
          serial: nft.nft_serial,
          uri: nft.URI ? Buffer.from(nft.URI, 'hex').toString('utf8') : null,
          flags: nft.Flags,
          transferFee: (nft as any).TransferFee,
        }));
        return [{
          json: { address, nfts, count: nfts.length },
          pairedItem: { item: index },
        }];
      }

      case 'getTransactions': {
        const options = this.getNodeParameter('options', index, {}) as { limit?: number; forward?: boolean };
        const response: AccountTxResponse = await context.client.request({
          command: 'account_tx',
          account: address,
          ledger_index_min: -1,
          ledger_index_max: -1,
          limit: options.limit || 20,
          forward: options.forward || false,
        });
        const transactions = response.result.transactions.map((tx) => ({
          hash: tx.tx && typeof tx.tx === 'object' && 'hash' in tx.tx ? tx.tx.hash : null,
          type: tx.tx && typeof tx.tx === 'object' && 'TransactionType' in tx.tx ? tx.tx.TransactionType : null,
          ledgerIndex: tx.tx && typeof tx.tx === 'object' && 'ledger_index' in tx.tx ? tx.tx.ledger_index : null,
          validated: tx.validated,
          meta: tx.meta,
          tx: tx.tx,
        }));
        return [{
          json: { address, transactions, count: transactions.length, marker: response.result.marker as string | undefined },
          pairedItem: { item: index },
        }];
      }

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  });
}
