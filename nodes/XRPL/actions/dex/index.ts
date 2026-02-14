/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { withXrplClient, toDrops, toXrp, formatCurrencyCode, getExplorerUrl } from '../../transport/xrplClient';
import type { XrplClientContext } from '../../transport/xrplClient';
import type { OfferCreate, OfferCancel, TxResponse, BookOffersResponse } from 'xrpl';

export const description: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['dex'] } },
    options: [
      { name: 'Create Offer', value: 'createOffer', action: 'Create offer' },
      { name: 'Cancel Offer', value: 'cancelOffer', action: 'Cancel offer' },
      { name: 'Get Order Book', value: 'getOrderBook', action: 'Get order book' },
      { name: 'Get Account Offers', value: 'getAccountOffers', action: 'Get account offers' },
    ],
    default: 'createOffer',
  },
  { displayName: 'Offer Type', name: 'offerType', type: 'options', options: [{ name: 'Sell XRP', value: 'sellXrp' }, { name: 'Buy XRP', value: 'buyXrp' }], default: 'sellXrp', displayOptions: { show: { resource: ['dex'], operation: ['createOffer'] } } },
  { displayName: 'XRP Amount', name: 'xrpAmount', type: 'number', required: true, default: 0, displayOptions: { show: { resource: ['dex'], operation: ['createOffer'] } } },
  { displayName: 'Currency Code', name: 'currencyCode', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['dex'], operation: ['createOffer', 'getOrderBook'] } } },
  { displayName: 'Issuer', name: 'issuer', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['dex'], operation: ['createOffer', 'getOrderBook'] } } },
  { displayName: 'Currency Amount', name: 'currencyAmount', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['dex'], operation: ['createOffer'] } } },
  { displayName: 'Offer Sequence', name: 'offerSequence', type: 'number', required: true, default: 0, displayOptions: { show: { resource: ['dex'], operation: ['cancelOffer'] } } },
  { displayName: 'Base Currency Is XRP', name: 'baseIsXrp', type: 'boolean', default: true, displayOptions: { show: { resource: ['dex'], operation: ['getOrderBook'] } } },
  { displayName: 'Account Address', name: 'accountAddress', type: 'string', default: '', displayOptions: { show: { resource: ['dex'], operation: ['getAccountOffers'] } } },
];

export async function execute(this: IExecuteFunctions, index: number, operation: string): Promise<INodeExecutionData[]> {
  const credentials = await this.getCredentials('xrplApi');

  return withXrplClient(credentials, async (context: XrplClientContext) => {
    const network = credentials.network as string;

    switch (operation) {
      case 'createOffer': {
        if (!context.wallet) throw new Error('Wallet seed required');
        const offerType = this.getNodeParameter('offerType', index) as string;
        const xrpAmount = this.getNodeParameter('xrpAmount', index) as number;
        const currencyCode = this.getNodeParameter('currencyCode', index) as string;
        const issuer = this.getNodeParameter('issuer', index) as string;
        const currencyAmount = this.getNodeParameter('currencyAmount', index) as string;

        let takerGets: any, takerPays: any;
        if (offerType === 'sellXrp') {
          takerGets = toDrops(xrpAmount);
          takerPays = { currency: currencyCode, issuer, value: currencyAmount };
        } else {
          takerGets = { currency: currencyCode, issuer, value: currencyAmount };
          takerPays = toDrops(xrpAmount);
        }

        const offerCreate: OfferCreate = { TransactionType: 'OfferCreate', Account: context.wallet.address, TakerGets: takerGets, TakerPays: takerPays };
        const prepared = await context.client.autofill(offerCreate);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);

        return [{ json: { success: result.result.validated, hash: result.result.hash, offerType, explorerUrl: getExplorerUrl(result.result.hash, network) }, pairedItem: { item: index } }];
      }

      case 'cancelOffer': {
        if (!context.wallet) throw new Error('Wallet seed required');
        const offerSequence = this.getNodeParameter('offerSequence', index) as number;
        const offerCancel: OfferCancel = { TransactionType: 'OfferCancel', Account: context.wallet.address, OfferSequence: offerSequence };
        const prepared = await context.client.autofill(offerCancel);
        const signed = context.wallet.sign(prepared);
        const result: TxResponse = await context.client.submitAndWait(signed.tx_blob);
        return [{ json: { success: result.result.validated, hash: result.result.hash, canceledSequence: offerSequence, explorerUrl: getExplorerUrl(result.result.hash, network) }, pairedItem: { item: index } }];
      }

      case 'getOrderBook': {
        const currencyCode = this.getNodeParameter('currencyCode', index) as string;
        const issuer = this.getNodeParameter('issuer', index) as string;
        const baseIsXrp = this.getNodeParameter('baseIsXrp', index) as boolean;
        const takerGets = baseIsXrp ? { currency: 'XRP' } : { currency: currencyCode, issuer };
        const takerPays = baseIsXrp ? { currency: currencyCode, issuer } : { currency: 'XRP' };
        const response: BookOffersResponse = await context.client.request({ command: 'book_offers', taker_gets: takerGets, taker_pays: takerPays, ledger_index: 'validated' });
        const offers = response.result.offers.map((offer) => ({
          account: offer.Account,
          sequence: offer.Sequence,
          takerGets: typeof offer.TakerGets === 'string' ? toXrp(offer.TakerGets) + ' XRP' : `${offer.TakerGets.value} ${formatCurrencyCode(offer.TakerGets.currency)}`,
          takerPays: typeof offer.TakerPays === 'string' ? toXrp(offer.TakerPays) + ' XRP' : `${offer.TakerPays.value} ${formatCurrencyCode(offer.TakerPays.currency)}`,
          quality: offer.quality,
        }));
        return [{ json: { base: baseIsXrp ? 'XRP' : currencyCode, quote: baseIsXrp ? currencyCode : 'XRP', offers, count: offers.length }, pairedItem: { item: index } }];
      }

      case 'getAccountOffers': {
        const accountAddress = this.getNodeParameter('accountAddress', index, '') as string;
        const address = accountAddress || context.accountAddress;
        const response = await context.client.request({ command: 'account_offers', account: address, ledger_index: 'validated' });
        const offers = (response.result.offers || []).map((offer: any) => ({
          sequence: offer.seq,
          takerGets: typeof offer.taker_gets === 'string' ? toXrp(offer.taker_gets) + ' XRP' : `${offer.taker_gets.value} ${formatCurrencyCode(offer.taker_gets.currency)}`,
          takerPays: typeof offer.taker_pays === 'string' ? toXrp(offer.taker_pays) + ' XRP' : `${offer.taker_pays.value} ${formatCurrencyCode(offer.taker_pays.currency)}`,
        }));
        return [{ json: { address, offers, count: offers.length }, pairedItem: { item: index } }];
      }

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  });
}
