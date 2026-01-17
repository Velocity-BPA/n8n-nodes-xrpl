/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { Client, Wallet, xrpToDrops, dropsToXrp } from 'xrpl';
import type { ICredentialDataDecryptedObject } from 'n8n-workflow';

const NETWORK_URLS: { [key: string]: string } = {
  mainnet: 'wss://xrplcluster.com',
  testnet: 'wss://s.altnet.rippletest.net:51233',
  devnet: 'wss://s.devnet.rippletest.net:51233',
  ammdevnet: 'wss://amm.devnet.rippletest.net:51233',
};

export interface XrplCredentials {
  network: string;
  customWsUrl?: string;
  walletSeed?: string;
  accountAddress?: string;
}

export interface XrplClientContext {
  client: Client;
  wallet: Wallet | null;
  accountAddress: string;
}

export function getWebSocketUrl(credentials: XrplCredentials): string {
  if (credentials.network === 'custom' && credentials.customWsUrl) {
    return credentials.customWsUrl;
  }
  return NETWORK_URLS[credentials.network] || NETWORK_URLS.mainnet;
}

export async function createXrplClient(credentials: XrplCredentials): Promise<XrplClientContext> {
  const wsUrl = getWebSocketUrl(credentials);
  const client = new Client(wsUrl);
  await client.connect();
  
  let wallet: Wallet | null = null;
  let accountAddress = credentials.accountAddress || '';
  
  if (credentials.walletSeed) {
    wallet = Wallet.fromSeed(credentials.walletSeed);
    accountAddress = wallet.address;
  }
  
  if (!accountAddress) {
    throw new Error('Either wallet seed or account address must be provided');
  }
  
  return { client, wallet, accountAddress };
}

export async function disconnectXrplClient(client: Client): Promise<void> {
  if (client.isConnected()) {
    await client.disconnect();
  }
}

export async function withXrplClient<T>(
  credentials: ICredentialDataDecryptedObject,
  operation: (context: XrplClientContext) => Promise<T>,
): Promise<T> {
  const xrplCredentials = credentials as unknown as XrplCredentials;
  const context = await createXrplClient(xrplCredentials);
  try {
    return await operation(context);
  } finally {
    await disconnectXrplClient(context.client);
  }
}

export function toDrops(xrp: string | number): string {
  return xrpToDrops(xrp);
}

export function toXrp(drops: string | number): string {
  return String(dropsToXrp(drops));
}

export function isValidAddress(address: string): boolean {
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address);
}

export function isXAddress(address: string): boolean {
  return /^X[1-9A-HJ-NP-Za-km-z]{46}$/.test(address);
}

export function formatCurrencyCode(code: string): string {
  if (code.length === 3) return code;
  if (code.length === 40) {
    const decoded = Buffer.from(code, 'hex').toString('utf8').replace(/\0/g, '');
    return decoded || code;
  }
  return code;
}

export function formatAmount(amount: string | { value: string; currency: string; issuer?: string }): string {
  if (typeof amount === 'string') return `${toXrp(amount)} XRP`;
  return `${amount.value} ${formatCurrencyCode(amount.currency)}`;
}

export function getExplorerUrl(txHash: string, network: string): string {
  const explorers: { [key: string]: string } = {
    mainnet: `https://livenet.xrpl.org/transactions/${txHash}`,
    testnet: `https://testnet.xrpl.org/transactions/${txHash}`,
    devnet: `https://devnet.xrpl.org/transactions/${txHash}`,
    ammdevnet: `https://amm.devnet.xrpl.org/transactions/${txHash}`,
  };
  return explorers[network] || explorers.mainnet;
}

export function getAccountExplorerUrl(address: string, network: string): string {
  const explorers: { [key: string]: string } = {
    mainnet: `https://livenet.xrpl.org/accounts/${address}`,
    testnet: `https://testnet.xrpl.org/accounts/${address}`,
    devnet: `https://devnet.xrpl.org/accounts/${address}`,
    ammdevnet: `https://amm.devnet.xrpl.org/accounts/${address}`,
  };
  return explorers[network] || explorers.mainnet;
}

let licenseNoticeLogged = false;
export function logLicenseNotice(): void {
  if (!licenseNoticeLogged) {
    console.warn(`[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);
    licenseNoticeLogged = true;
  }
}
