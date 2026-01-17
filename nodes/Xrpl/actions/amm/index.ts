/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { withXrplClient, toDrops, toXrp, getExplorerUrl } from '../../transport/xrplClient';
import type { XrplClientContext } from '../../transport/xrplClient';
import type { AMMCreate, AMMDeposit, AMMWithdraw, AMMVote, TxResponse } from 'xrpl';

export const description: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['amm'] } },
    options: [
      { name: 'Create', value: 'create', action: 'Create AMM pool' },
      { name: 'Deposit', value: 'deposit', action: 'Deposit to AMM' },
      { name: 'Withdraw', value: 'withdraw', action: 'Withdraw from AMM' },
      { name: 'Vote', value: 'vote', action: 'Vote on AMM fee' },
      { name: 'Get Info', value: 'getInfo', action: 'Get AMM info' },
    ],
    default: 'getInfo',
  },
  { displayName: 'Asset 1 Type', name: 'asset1Type', type: 'options', options: [{ name: 'XRP', value: 'xrp' }, { name: 'Issued Currency', value: 'issued' }], default: 'xrp', displayOptions: { show: { resource: ['amm'] } } },
  { displayName: 'Asset 1 Currency', name: 'asset1Currency', type: 'string', default: '', displayOptions: { show: { resource: ['amm'], asset1Type: ['issued'] } } },
  { displayName: 'Asset 1 Issuer', name: 'asset1Issuer', type: 'string', default: '', displayOptions: { show: { resource: ['amm'], asset1Type: ['issued'] } } },
  { displayName: 'Asset 2 Type', name: 'asset2Type', type: 'options', options: [{ name: 'XRP', value: 'xrp' }, { name: 'Issued Currency', value: 'issued' }], default: 'issued', displayOptions: { show: { resource: ['amm'] } } },
  { displayName: 'Asset 2 Currency', name: 'asset2Currency', type: 'string', default: '', displayOptions: { show: { resource: ['amm'], asset2Type: ['issued'] } } },
  { displayName: 'Asset 2 Issuer', name: 'asset2Issuer', type: 'string', default: '', displayOptions: { show: { resource: ['amm'], asset2Type: ['issued'] } } },
  { displayName: 'Asset 1 Amount', name: 'asset1Amount', type: 'string', default: '', displayOptions: { show: { resource: ['amm'], operation: ['create', 'deposit', 'withdraw'] } } },
  { displayName: 'Asset 2 Amount', name: 'asset2Amount', type: 'string', default: '', displayOptions: { show: { resource: ['amm'], operation: ['create', 'deposit', 'withdraw'] } } },
  { displayName: 'Trading Fee (%)', name: 'tradingFee', type: 'number', default: 0.5, displayOptions: { show: { resource: ['amm'], operation: ['create', 'vote'] } } },
];

function buildAsset(type: string, currency?: string, issuer?: string): any {
  if (type === 'xrp') return { currency: 'XRP' };
  return { currency: currency!, issuer: issuer! };
}

function buildAmount(type: string, amount: string, currency?: string, issuer?: string): any {
  if (type === 'xrp') return toDrops(amount);
  return { currency: currency!, value: amount, issuer: issuer! };
}

export async function execute(this: IExecuteFunctions, index: number, operation: string): Promise<INodeExecutionData[]> {
  const credentials = await this.getCredentials('xrplApi');

  return withXrplClient(credentials, async (context: XrplClientContext) => {
    const network = credentials.network as string;
    const asset1Type = this.getNodeParameter('asset1Type', index) as string;
    const asset2Type = this.getNodeParameter('asset2Type', index) as string;
    const asset1Currency = asset1Type === 'issued' ? this.getNodeParameter('asset1Currency', index) as string : undefined;
    const asset1Issuer = asset1Type === 'issued' ? this.getNodeParameter('asset1Issuer', index) as string : undefined;
    const asset2Currency = asset2Type === 'issued' ? this.getNodeParameter('asset2Currency', index) as string : undefined;
    const asset2Issuer = asset2Type === 'issued' ? this.getNodeParameter('asset2Issuer', index) as string : undefined;
    const asset1 = buildAsset(asset1Type, asset1Currency, asset1Issuer);
    const asset2 = buildAsset(asset2Type, asset2Currency, asset2Issuer);

    switch (operation) {
      case 'create': {
        if (!context.wallet) throw new Error('Wallet seed required');
        const asset1Amount = this.getNodeParameter('asset1Amount', index) as string;
        const asset2Amount = this.getNodeParameter('asset2Amount', index) as string;
        const tradingFee = this.getNodeParameter('tradingFee', index) as number;
        const ammCreate: AMMCreate = { TransactionType: 'AMMCreate', Account: context.wallet.address, Amount: buildAmount(asset1Type, asset1Amount, asset1Currency, asset1Issuer), Amount2: buildAmount(asset2Type, asset2Amount, asset2Currency, asset2Issuer), TradingFee: Math.floor(tradingFee * 1000) };
        const prepared = await context.client.autofill(ammCreate);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);
        return [{ json: { success: result.result.validated, hash: result.result.hash, tradingFee: `${tradingFee}%`, explorerUrl: getExplorerUrl(result.result.hash, network) }, pairedItem: { item: index } }];
      }

      case 'deposit': {
        if (!context.wallet) throw new Error('Wallet seed required');
        const asset1Amount = this.getNodeParameter('asset1Amount', index, '') as string;
        const asset2Amount = this.getNodeParameter('asset2Amount', index, '') as string;
        const ammDeposit: AMMDeposit = { TransactionType: 'AMMDeposit', Account: context.wallet.address, Asset: asset1 as any, Asset2: asset2 as any, Flags: 0x00100000 };
        if (asset1Amount) ammDeposit.Amount = buildAmount(asset1Type, asset1Amount, asset1Currency, asset1Issuer);
        if (asset2Amount) ammDeposit.Amount2 = buildAmount(asset2Type, asset2Amount, asset2Currency, asset2Issuer);
        const prepared = await context.client.autofill(ammDeposit);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);
        return [{ json: { success: result.result.validated, hash: result.result.hash, explorerUrl: getExplorerUrl(result.result.hash, network) }, pairedItem: { item: index } }];
      }

      case 'withdraw': {
        if (!context.wallet) throw new Error('Wallet seed required');
        const asset1Amount = this.getNodeParameter('asset1Amount', index, '') as string;
        const asset2Amount = this.getNodeParameter('asset2Amount', index, '') as string;
        const ammWithdraw: AMMWithdraw = { TransactionType: 'AMMWithdraw', Account: context.wallet.address, Asset: asset1 as any, Asset2: asset2 as any, Flags: 0x00100000 };
        if (asset1Amount) ammWithdraw.Amount = buildAmount(asset1Type, asset1Amount, asset1Currency, asset1Issuer);
        if (asset2Amount) ammWithdraw.Amount2 = buildAmount(asset2Type, asset2Amount, asset2Currency, asset2Issuer);
        const prepared = await context.client.autofill(ammWithdraw);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);
        return [{ json: { success: result.result.validated, hash: result.result.hash, explorerUrl: getExplorerUrl(result.result.hash, network) }, pairedItem: { item: index } }];
      }

      case 'vote': {
        if (!context.wallet) throw new Error('Wallet seed required');
        const tradingFee = this.getNodeParameter('tradingFee', index) as number;
        const ammVote: AMMVote = { TransactionType: 'AMMVote', Account: context.wallet.address, Asset: asset1 as any, Asset2: asset2 as any, TradingFee: Math.floor(tradingFee * 1000) };
        const prepared = await context.client.autofill(ammVote);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);
        return [{ json: { success: result.result.validated, hash: result.result.hash, votedFee: `${tradingFee}%`, explorerUrl: getExplorerUrl(result.result.hash, network) }, pairedItem: { item: index } }];
      }

      case 'getInfo': {
        const response = await context.client.request({ command: 'amm_info', asset: asset1, asset2: asset2 } as any);
        const amm = (response.result as any).amm;
        return [{ json: { ammAccount: amm.account, asset1Balance: typeof amm.amount === 'string' ? toXrp(amm.amount) : amm.amount?.value, asset2Balance: typeof amm.amount2 === 'string' ? toXrp(amm.amount2) : amm.amount2?.value, lpToken: amm.lp_token, tradingFee: `${amm.trading_fee / 1000}%` }, pairedItem: { item: index } }];
      }

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  });
}
