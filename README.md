# n8n-nodes-xrpl

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive integration with the XRP Ledger (XRPL) blockchain network. With 3 main resources and 17+ operations, it enables seamless account management, payment processing, trust line operations, and NFT interactions within your n8n workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![XRPL](https://img.shields.io/badge/XRPL-Mainnet%20%26%20Testnet-green)
![Blockchain](https://img.shields.io/badge/Blockchain-XRP%20Ledger-orange)

## Features

- **Account Operations** - Retrieve account information, balances, NFTs, transaction history, and generate new wallets
- **Payment Processing** - Send XRP and issued currencies with cross-currency pathfinding capabilities
- **Trust Line Management** - Create, modify, remove, and freeze trust lines for token relationships
- **Multi-Network Support** - Connect to both XRPL Mainnet and Testnet environments
- **Comprehensive Validation** - Built-in address validation and transaction verification
- **Real-time Data** - Access live blockchain data through JSON-RPC endpoints
- **Developer Friendly** - Full TypeScript support with detailed error handling
- **Secure Authentication** - Custom credential management for wallet integration

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
| Network | Select Mainnet or Testnet | Yes |
| Wallet Address | Your XRPL wallet address (classic format) | Yes |
| Private Key | Your wallet's private key (keep secure) | Yes |
| JSON-RPC URL | Custom endpoint (optional, defaults provided) | No |

## Resources & Operations

### 1. Account

| Operation | Description |
|-----------|-------------|
| Get Account Info | Retrieve basic account information including sequence numbers and flags |
| Get Account Balances | Fetch XRP balance and all issued currency balances |
| Get Account NFTs | List all NFTs owned by the account |
| Get Transaction History | Retrieve account transaction history with pagination |
| Validate Address | Verify if an XRPL address is valid and properly formatted |
| Generate Wallet | Create a new XRPL wallet with address and keys |

### 2. TrustLine

| Operation | Description |
|-----------|-------------|
| Get Trust Lines | Retrieve all trust lines for an account |
| Create Trust Line | Establish a new trust line to hold issued currencies |
| Modify Trust Line | Update trust line limits and settings |
| Remove Trust Line | Delete an existing trust line (balance must be zero) |
| Deep Freeze Trust Line | Permanently freeze a trust line (irreversible) |

### 3. Payment

| Operation | Description |
|-----------|-------------|
| Send XRP | Transfer XRP between accounts |
| Send Issued Currency | Transfer tokens/currencies via established trust lines |
| Pathfind Cross-currency | Find optimal payment paths for currency conversions |

## Usage Examples

```javascript
// Get account information
{
  "account": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "network": "mainnet"
}

// Send XRP payment
{
  "fromAddress": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "toAddress": "rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w",
  "amount": "1000000",
  "destinationTag": 12345
}

// Create trust line for USD
{
  "account": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "currency": "USD",
  "issuer": "rVnYNK9yuxBz4uP8zC8LEFokM2GqAEgLBh",
  "limit": "1000"
}

// Send issued currency
{
  "fromAddress": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "toAddress": "rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w",
  "currency": "USD",
  "issuer": "rVnYNK9yuxBz4uP8zC8LEFokM2GqAEgLBh",
  "amount": "100"
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid Address | Provided XRPL address format is incorrect | Use classic format (starts with 'r') and validate with the validate address operation |
| Insufficient Balance | Account lacks funds for transaction | Check account balances and ensure adequate XRP for fees |
| Trust Line Required | Cannot hold issued currency without trust line | Create trust line to issuer before receiving tokens |
| Network Timeout | Connection to XRPL network failed | Check network connectivity and try switching between mainnet/testnet |
| Invalid Signature | Transaction signing failed with provided private key | Verify private key matches the specified account address |
| Sequence Number Error | Transaction sequence is out of order | Refresh account info to get current sequence number |

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
- **XRPL Documentation**: [XRPL.org Developer Docs](https://xrpl.org/docs.html)
- **XRPL Community**: [XRPLedger.org](https://xrpledger.org/)