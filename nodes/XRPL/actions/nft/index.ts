/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { withXrplClient, getExplorerUrl, toDrops } from '../../transport/xrplClient';
import type { XrplClientContext } from '../../transport/xrplClient';
import type { NFTokenMint, NFTokenCreateOffer, NFTokenAcceptOffer, NFTokenBurn, NFTokenCancelOffer, TxResponse } from 'xrpl';

export const description: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['nft'] } },
    options: [
      { name: 'Mint', value: 'mint', action: 'Mint NFT' },
      { name: 'Burn', value: 'burn', action: 'Burn NFT' },
      { name: 'Create Sell Offer', value: 'createSellOffer', action: 'Create sell offer' },
      { name: 'Create Buy Offer', value: 'createBuyOffer', action: 'Create buy offer' },
      { name: 'Accept Offer', value: 'acceptOffer', action: 'Accept offer' },
      { name: 'Cancel Offer', value: 'cancelOffer', action: 'Cancel offer' },
      { name: 'Get Offers', value: 'getOffers', action: 'Get offers' },
    ],
    default: 'mint',
  },
  { displayName: 'URI', name: 'uri', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['nft'], operation: ['mint'] } } },
  { displayName: 'Taxon', name: 'taxon', type: 'number', required: true, default: 0, displayOptions: { show: { resource: ['nft'], operation: ['mint'] } } },
  { displayName: 'NFT ID', name: 'nftId', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['nft'], operation: ['burn', 'createSellOffer', 'createBuyOffer', 'getOffers'] } } },
  { displayName: 'Amount (XRP)', name: 'amount', type: 'number', required: true, default: 0, displayOptions: { show: { resource: ['nft'], operation: ['createSellOffer', 'createBuyOffer'] } } },
  { displayName: 'Owner', name: 'owner', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['nft'], operation: ['createBuyOffer'] } } },
  { displayName: 'Offer ID', name: 'offerId', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['nft'], operation: ['acceptOffer', 'cancelOffer'] } } },
  { displayName: 'Offer Type', name: 'offerType', type: 'options', options: [{ name: 'Sell Offer', value: 'sell' }, { name: 'Buy Offer', value: 'buy' }], default: 'sell', displayOptions: { show: { resource: ['nft'], operation: ['acceptOffer'] } } },
  { displayName: 'Options', name: 'options', type: 'collection', placeholder: 'Add Option', default: {}, displayOptions: { show: { resource: ['nft'], operation: ['mint'] } }, options: [
    { displayName: 'Transfer Fee (%)', name: 'transferFee', type: 'number', default: 0 },
    { displayName: 'Burnable', name: 'burnable', type: 'boolean', default: true },
    { displayName: 'Transferable', name: 'transferable', type: 'boolean', default: true },
  ] },
];

export async function execute(this: IExecuteFunctions, index: number, operation: string): Promise<INodeExecutionData[]> {
  const credentials = await this.getCredentials('xrplApi');

  return withXrplClient(credentials, async (context: XrplClientContext) => {
    const network = credentials.network as string;

    switch (operation) {
      case 'mint': {
        if (!context.wallet) throw new Error('Wallet seed required');
        const uri = this.getNodeParameter('uri', index) as string;
        const taxon = this.getNodeParameter('taxon', index) as number;
        const options = this.getNodeParameter('options', index, {}) as any;
        let flags = 0;
        if (options.burnable) flags |= 0x00000001;
        if (options.transferable) flags |= 0x00000008;
        const nftMint: NFTokenMint = { TransactionType: 'NFTokenMint', Account: context.wallet.address, URI: Buffer.from(uri).toString('hex'), NFTokenTaxon: taxon, Flags: flags };
        if (options.transferFee) nftMint.TransferFee = Math.floor(options.transferFee * 1000);
        const prepared = await context.client.autofill(nftMint);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);
        return [{ json: { success: result.result.validated, hash: result.result.hash, uri, taxon, explorerUrl: getExplorerUrl(result.result.hash, network) }, pairedItem: { item: index } }];
      }

      case 'burn': {
        if (!context.wallet) throw new Error('Wallet seed required');
        const nftId = this.getNodeParameter('nftId', index) as string;
        const nftBurn: NFTokenBurn = { TransactionType: 'NFTokenBurn', Account: context.wallet.address, NFTokenID: nftId };
        const prepared = await context.client.autofill(nftBurn);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);
        return [{ json: { success: result.result.validated, hash: result.result.hash, nftId, explorerUrl: getExplorerUrl(result.result.hash, network) }, pairedItem: { item: index } }];
      }

      case 'createSellOffer': {
        if (!context.wallet) throw new Error('Wallet seed required');
        const nftId = this.getNodeParameter('nftId', index) as string;
        const amount = this.getNodeParameter('amount', index) as number;
        const offer: NFTokenCreateOffer = { TransactionType: 'NFTokenCreateOffer', Account: context.wallet.address, NFTokenID: nftId, Amount: toDrops(amount), Flags: 0x00000001 };
        const prepared = await context.client.autofill(offer);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);
        return [{ json: { success: result.result.validated, hash: result.result.hash, nftId, amount, explorerUrl: getExplorerUrl(result.result.hash, network) }, pairedItem: { item: index } }];
      }

      case 'createBuyOffer': {
        if (!context.wallet) throw new Error('Wallet seed required');
        const nftId = this.getNodeParameter('nftId', index) as string;
        const amount = this.getNodeParameter('amount', index) as number;
        const owner = this.getNodeParameter('owner', index) as string;
        const offer: NFTokenCreateOffer = { TransactionType: 'NFTokenCreateOffer', Account: context.wallet.address, NFTokenID: nftId, Amount: toDrops(amount), Owner: owner };
        const prepared = await context.client.autofill(offer);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);
        return [{ json: { success: result.result.validated, hash: result.result.hash, nftId, amount, owner, explorerUrl: getExplorerUrl(result.result.hash, network) }, pairedItem: { item: index } }];
      }

      case 'acceptOffer': {
        if (!context.wallet) throw new Error('Wallet seed required');
        const offerId = this.getNodeParameter('offerId', index) as string;
        const offerType = this.getNodeParameter('offerType', index) as string;
        const accept: NFTokenAcceptOffer = { TransactionType: 'NFTokenAcceptOffer', Account: context.wallet.address };
        if (offerType === 'sell') accept.NFTokenSellOffer = offerId; else accept.NFTokenBuyOffer = offerId;
        const prepared = await context.client.autofill(accept);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);
        return [{ json: { success: result.result.validated, hash: result.result.hash, offerId, offerType, explorerUrl: getExplorerUrl(result.result.hash, network) }, pairedItem: { item: index } }];
      }

      case 'cancelOffer': {
        if (!context.wallet) throw new Error('Wallet seed required');
        const offerId = this.getNodeParameter('offerId', index) as string;
        const cancel: NFTokenCancelOffer = { TransactionType: 'NFTokenCancelOffer', Account: context.wallet.address, NFTokenOffers: [offerId] };
        const prepared = await context.client.autofill(cancel);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);
        return [{ json: { success: result.result.validated, hash: result.result.hash, offerId, explorerUrl: getExplorerUrl(result.result.hash, network) }, pairedItem: { item: index } }];
      }

      case 'getOffers': {
        const nftId = this.getNodeParameter('nftId', index) as string;
        const [sellOffers, buyOffers] = await Promise.all([
          context.client.request({ command: 'nft_sell_offers', nft_id: nftId }).catch(() => ({ result: { offers: [] } })),
          context.client.request({ command: 'nft_buy_offers', nft_id: nftId }).catch(() => ({ result: { offers: [] } })),
        ]);
        return [{ json: { nftId, sellOffers: (sellOffers.result as any).offers || [], buyOffers: (buyOffers.result as any).offers || [] }, pairedItem: { item: index } }];
      }

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  });
}
