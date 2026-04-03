# n8n-nodes-xrpl

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides seamless integration with the XRP Ledger (XRPL) blockchain network. With 8 comprehensive resources including Account, Transaction, Payment, Ledger, OrderBook, NFT, Server, and AMM operations, this node enables developers to build powerful blockchain automation workflows with enterprise-grade reliability and comprehensive XRPL functionality.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![XRPL](https://img.shields.io/badge/XRPL-Blockchain-green)
![Crypto](https://img.shields.io/badge/Crypto-Payments-orange)
![DeFi](https://img.shields.io/badge/DeFi-Compatible-purple)

## Features

- **Complete Account Management** - Query account info, balances, transaction history, and trust lines
- **Transaction Processing** - Submit, validate, and monitor XRPL transactions with full metadata
- **Payment Operations** - Send XRP and issued currencies with path finding and multi-hop support
- **Ledger Data Access** - Retrieve ledger information, close times, and historical data
- **Order Book Integration** - Access real-time trading data and liquidity information
- **NFT Functionality** - Mint, transfer, and manage Non-Fungible Tokens on XRPL
- **Server Information** - Monitor network health, fee levels, and validator status
- **AMM Support** - Interact with Automated Market Makers for DeFi operations

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-xrpl`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-xrpl
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-xrpl.git
cd n8n-nodes-xrpl
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-xrpl
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your XRPL service provider API key | Yes |
| Network | Target network (Mainnet, Testnet, Devnet) | Yes |
| Server URL | Custom XRPL server endpoint (optional) | No |

## Resources & Operations

### 1. Account

| Operation | Description |
|-----------|-------------|
| Get Info | Retrieve account information including balance and settings |
| Get Objects | Fetch account objects like trust lines and offers |
| Get Transactions | Get transaction history for an account |
| Get Balances | Retrieve all currency balances for an account |

### 2. Transaction

| Operation | Description |
|-----------|-------------|
| Submit | Submit a signed transaction to the network |
| Get | Retrieve transaction details by hash |
| Validate | Validate transaction format and signatures |
| Monitor | Track transaction status and confirmations |

### 3. Payment

| Operation | Description |
|-----------|-------------|
| Send XRP | Send XRP payments between accounts |
| Send Currency | Send issued currencies and tokens |
| Find Paths | Discover payment paths for cross-currency transfers |
| Estimate Cost | Calculate transaction fees and exchange rates |

### 4. Ledger

| Operation | Description |
|-----------|-------------|
| Get Current | Retrieve current ledger information |
| Get Historical | Access historical ledger data by index |
| Get Entries | Fetch specific ledger entries and objects |
| Get Stats | Get ledger statistics and metrics |

### 5. OrderBook

| Operation | Description |
|-----------|-------------|
| Get Offers | Retrieve order book data for currency pairs |
| Get Trades | Fetch recent trades and execution history |
| Get Depth | Access market depth and liquidity information |
| Get Ticker | Get price ticker and 24h statistics |

### 6. Nft

| Operation | Description |
|-----------|-------------|
| Mint | Create new NFTs on the XRPL |
| Transfer | Transfer NFT ownership between accounts |
| Get Info | Retrieve NFT metadata and properties |
| Get Collection | Fetch NFTs from a specific collection |

### 7. Server

| Operation | Description |
|-----------|-------------|
| Get Info | Retrieve server status and configuration |
| Get Fees | Get current network fee levels |
| Get Validators | Access validator list and status |
| Health Check | Monitor network health and connectivity |

### 8. Amm

| Operation | Description |
|-----------|-------------|
| Get Info | Retrieve AMM pool information and statistics |
| Add Liquidity | Provide liquidity to AMM pools |
| Remove Liquidity | Withdraw liquidity from AMM pools |
| Swap | Execute token swaps through AMM |

## Usage Examples

```javascript
// Get account balance and info
{
  "account": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "ledger_index": "validated"
}
```

```javascript
// Send XRP payment
{
  "account": "rSenderAccount123...",
  "destination": "rDestAccount456...",
  "amount": "1000000", // 1 XRP in drops
  "destination_tag": 12345
}
```

```javascript
// Get order book for XRP/USD pair
{
  "taker_pays": {
    "currency": "USD",
    "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
  },
  "taker_gets": {
    "currency": "XRP"
  },
  "limit": 20
}
```

```javascript
// Mint NFT
{
  "account": "rNFTIssuer789...",
  "nftoken_taxon": 0,
  "transfer_fee": 1000,
  "flags": {
    "burnable": true,
    "transferable": true
  }
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| InvalidCredentials | API key authentication failed | Verify API key and network settings |
| InsufficientFunds | Account lacks funds for transaction | Check account balance and fee requirements |
| NetworkTimeout | Connection to XRPL network timed out | Retry request or check network status |
| InvalidTransaction | Transaction format or signature invalid | Validate transaction parameters and signing |
| RateLimitExceeded | API rate limit has been exceeded | Implement request throttling or upgrade plan |
| AccountNotFound | Specified account does not exist | Verify account address format and existence |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-xrpl/issues)
- **XRPL Documentation**: [XRPL.org Developer Portal](https://xrpl.org/docs.html)
- **XRPL Community**: [XRPL Developer Discord](https://discord.gg/sfX3ERAMjH)