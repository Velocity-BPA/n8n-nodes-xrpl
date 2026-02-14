/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { withXrplClient, toDrops, toXrp, getExplorerUrl } from '../../transport/xrplClient';
import type { XrplClientContext } from '../../transport/xrplClient';
import type { PaymentChannelCreate, PaymentChannelFund, PaymentChannelClaim, TxResponse } from 'xrpl';

export const description: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['paymentChannel'] } },
    options: [
      { name: 'Create', value: 'create', action: 'Create channel' },
      { name: 'Fund', value: 'fund', action: 'Fund channel' },
      { name: 'Claim', value: 'claim', action: 'Claim from channel' },
      { name: 'Get Channels', value: 'getChannels', action: 'Get channels' },
    ],
    default: 'create',
  },
  { displayName: 'Destination', name: 'destination', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['paymentChannel'], operation: ['create'] } } },
  { displayName: 'Amount (XRP)', name: 'amount', type: 'number', required: true, default: 0, displayOptions: { show: { resource: ['paymentChannel'], operation: ['create', 'fund', 'claim'] } } },
  { displayName: 'Settle Delay (seconds)', name: 'settleDelay', type: 'number', required: true, default: 86400, displayOptions: { show: { resource: ['paymentChannel'], operation: ['create'] } } },
  { displayName: 'Public Key', name: 'publicKey', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['paymentChannel'], operation: ['create'] } } },
  { displayName: 'Channel ID', name: 'channelId', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['paymentChannel'], operation: ['fund', 'claim'] } } },
  { displayName: 'Account Address', name: 'accountAddress', type: 'string', default: '', displayOptions: { show: { resource: ['paymentChannel'], operation: ['getChannels'] } } },
];

export async function execute(this: IExecuteFunctions, index: number, operation: string): Promise<INodeExecutionData[]> {
  const credentials = await this.getCredentials('xrplApi');

  return withXrplClient(credentials, async (context: XrplClientContext) => {
    const network = credentials.network as string;

    switch (operation) {
      case 'create': {
        if (!context.wallet) throw new Error('Wallet seed required');
        const destination = this.getNodeParameter('destination', index) as string;
        const amount = this.getNodeParameter('amount', index) as number;
        const settleDelay = this.getNodeParameter('settleDelay', index) as number;
        const publicKey = this.getNodeParameter('publicKey', index) as string;
        const channel: PaymentChannelCreate = { TransactionType: 'PaymentChannelCreate', Account: context.wallet.address, Destination: destination, Amount: toDrops(amount), SettleDelay: settleDelay, PublicKey: publicKey };
        const prepared = await context.client.autofill(channel);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);
        return [{ json: { success: result.result.validated, hash: result.result.hash, destination, amount, explorerUrl: getExplorerUrl(result.result.hash, network) }, pairedItem: { item: index } }];
      }

      case 'fund': {
        if (!context.wallet) throw new Error('Wallet seed required');
        const channelId = this.getNodeParameter('channelId', index) as string;
        const amount = this.getNodeParameter('amount', index) as number;
        const fund: PaymentChannelFund = { TransactionType: 'PaymentChannelFund', Account: context.wallet.address, Channel: channelId, Amount: toDrops(amount) };
        const prepared = await context.client.autofill(fund);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);
        return [{ json: { success: result.result.validated, hash: result.result.hash, channelId, amount, explorerUrl: getExplorerUrl(result.result.hash, network) }, pairedItem: { item: index } }];
      }

      case 'claim': {
        if (!context.wallet) throw new Error('Wallet seed required');
        const channelId = this.getNodeParameter('channelId', index) as string;
        const amount = this.getNodeParameter('amount', index) as number;
        const claim: PaymentChannelClaim = { TransactionType: 'PaymentChannelClaim', Account: context.wallet.address, Channel: channelId, Balance: toDrops(amount) };
        const prepared = await context.client.autofill(claim);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);
        return [{ json: { success: result.result.validated, hash: result.result.hash, channelId, amount, explorerUrl: getExplorerUrl(result.result.hash, network) }, pairedItem: { item: index } }];
      }

      case 'getChannels': {
        const accountAddress = this.getNodeParameter('accountAddress', index, '') as string;
        const address = accountAddress || context.accountAddress;
        const response = await context.client.request({ command: 'account_channels', account: address });
        const channels = (response.result.channels || []).map((ch: any) => ({
          channelId: ch.channel_id,
          destination: ch.destination_account,
          amount: toXrp(ch.amount),
          balance: toXrp(ch.balance),
          settleDelay: ch.settle_delay,
        }));
        return [{ json: { address, channels, count: channels.length }, pairedItem: { item: index } }];
      }

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  });
}
