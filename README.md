# n8n-nodes-xrpl

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for the XRP Ledger (XRPL) blockchain network. This node provides account management, payment operations, NFT handling, and trust line management capabilities, enabling seamless integration of XRPL functionality into your n8n workflows with support for both XRP and issued currency transactions.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![XRPL](https://img.shields.io/badge/XRPL-Mainnet-green)
![WebSocket](https://img.shields.io/badge/WebSocket-Supported-orange)

## Features

- **Account Management** - Retrieve account information, balances, transaction history, and validate addresses
- **XRP Payments** - Send XRP payments with destination tags and fee customization
- **Issued Currency Support** - Handle payments and balances for custom tokens and stablecoins
- **NFT Operations** - Query and manage Non-Fungible Tokens on the XRPL
- **Trust Lines** - Manage trust relationships between accounts for issued currencies
- **Payment Pathfinding** - Find optimal paths for cross-currency transactions
- **Multiple Network Support** - Connect to mainnet, testnet, or custom XRPL servers
- **Real-time Updates** - WebSocket support for live data streaming

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
| Server URL | XRPL server endpoint (JSON-RPC or WebSocket) | Yes |
| Private Key | Account private key for transaction signing (if sending transactions) | No |
| Connection Type | Choose between JSON-RPC (HTTP) or WebSocket | Yes |
| Network | Select mainnet, testnet, or custom network | Yes |

## Resources & Operations

### 1. Account

| Operation | Description |
|-----------|-------------|
| Get Account Info | Retrieve account information including sequence number, balance, and flags |
| Get Account Balances | Get all balances for an account including XRP and issued currencies |
| Get Account Lines | Retrieve trust lines established by an account |
| Get Account NFTs | List all NFTs owned by an account |
| Get Account Transactions | Fetch transaction history for an account with pagination |
| Validate Address | Verify if an address is a valid XRPL address format |

### 2. Payments

| Operation | Description |
|-----------|-------------|
| Send XRP | Send XRP payment between accounts with optional destination tag |
| Send Issued Currency | Send custom token or stablecoin payments |
| Find Payment Paths | Discover optimal paths for cross-currency transactions |
| Estimate Transaction Fee | Calculate current network fees for transactions |

### 3. Trust Lines

| Operation | Description |
|-----------|-------------|
| Set Trust Line | Establish or modify trust relationship for issued currencies |
| Remove Trust Line | Remove trust line by setting limit to zero |
| Get Trust Line Info | Retrieve specific trust line details between accounts |

### 4. NFTs

| Operation | Description |
|-----------|-------------|
| Get NFT Details | Retrieve metadata and ownership information for specific NFT |
| Transfer NFT | Transfer NFT ownership between accounts |
| Burn NFT | Permanently destroy an NFT token |

## Usage Examples

```javascript
// Get account information
const accountInfo = await xrpl.account.getAccountInfo({
  account: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  ledger_index: "validated"
});

// Send XRP payment
const payment = await xrpl.payments.sendXrp({
  account: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  destination: "rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w",
  amount: "1000000", // 1 XRP in drops
  destination_tag: 12345
});

// Get account balances including issued currencies
const balances = await xrpl.account.getAccountBalances({
  account: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  ledger_index: "current"
});

// Send issued currency payment
const issuedCurrencyPayment = await xrpl.payments.sendIssuedCurrency({
  account: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  destination: "rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w",
  amount: "100",
  currency: "USD",
  issuer: "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
});
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| `tecNO_DST_INSUF_XRP` | Destination account doesn't have enough XRP | Ensure destination has minimum 10 XRP reserve |
| `tecUNFUNDED_PAYMENT` | Insufficient funds for payment | Check account balance and reserve requirements |
| `temINVALID_ACCOUNT_ID` | Invalid account address format | Validate address using validateAddress operation |
| `telINSUF_FEE_P` | Fee too low for current network load | Use estimateTransactionFee to get current rates |
| `tecNO_LINE` | Trust line doesn't exist | Establish trust line before sending issued currency |
| `tecPATH_DRY` | No payment path found | Use findPaymentPaths to discover available routes |

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
- **XRPL Documentation**: [XRPL Developer Documentation](https://xrpl.org/docs.html)
- **XRPL Community**: [XRPL Developer Discord](https://discord.gg/sfX3ERAMjH)