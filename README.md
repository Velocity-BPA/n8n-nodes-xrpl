# n8n-nodes-xrpl

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for interacting with the XRP Ledger (XRPL) blockchain. This node provides 3 core resources covering account management, payment operations, and trust line configuration, enabling automated workflows for XRP and issued currency transactions, account monitoring, and cross-currency pathfinding.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![XRPL](https://img.shields.io/badge/XRPL-Compatible-green)
![JSON-RPC](https://img.shields.io/badge/JSON--RPC-2.0-orange)

## Features

- **Account Management** - Retrieve account information, balances, transaction history, and validate XRPL addresses
- **Payment Processing** - Send XRP and issued currency payments with automatic fee calculation and transaction signing
- **Trust Line Operations** - Manage trust lines for issued currencies and retrieve account objects including NFTs
- **Cross-Currency Pathfinding** - Find optimal payment paths for multi-hop transactions across different currencies
- **Multi-Network Support** - Connect to XRPL Mainnet, Testnet, or custom nodes with automatic failover
- **Transaction History** - Query and filter account transaction history with pagination support
- **Real-Time Data** - Access live ledger data with ledger index specifications for historical queries
- **Address Validation** - Verify XRPL address format and checksum validation before transactions

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
| **Network** | Select XRPL network (Mainnet/Testnet) or custom node URL | ✅ |
| **Account Address** | Your XRPL account address (rXXXXXX format) | ✅ |
| **Secret Key** | Account secret key for transaction signing | ✅* |
| **Custom Node URL** | Custom XRPL node endpoint (if not using default networks) | ❌ |

*Required only for operations that modify ledger state (payments, trust lines)

## Resources & Operations

### 1. Account

| Operation | Description |
|-----------|-------------|
| **Get Account Info** | Retrieve account information including reserve, flags, and settings |
| **Get Account Lines** | Get trust lines (IOUs) for an account with optional peer filtering |
| **Get Account Objects** | Get account objects including NFTs and other owned objects |
| **Get Account Transactions** | Get transaction history for an account with date range filtering |
| **Validate Address** | Validate XRPL address format and checksum |

### 2. Payments

| Operation | Description |
|-----------|-------------|
| **Send Payment** | Send XRP or issued currency payment with optional destination tag |
| **Path Find** | Find payment paths for cross-currency transactions |
| **Ripple Path Find** | Advanced pathfinding with real-time liquidity data |

### 3. Trust Lines

| Operation | Description |
|-----------|-------------|
| **Set Trust Line** | Create or modify trust line for issued currencies |
| **Delete Trust Line** | Remove trust line (requires zero balance) |
| **Get Trust Lines** | Retrieve all trust lines for an account |

## Usage Examples

**Get Account Balance and Info:**
```javascript
{
  "account": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "ledger_index": "validated",
  "queue": true,
  "signer_lists": false
}
```

**Send XRP Payment:**
```javascript
{
  "account": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "destination": "rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w",
  "amount": "1000000", // 1 XRP in drops
  "destination_tag": 12345,
  "fee": "12"
}
```

**Find Payment Path:**
```javascript
{
  "source_account": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "destination_account": "rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w",
  "destination_amount": {
    "currency": "USD",
    "value": "100",
    "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
  }
}
```

**Get Transaction History:**
```javascript
{
  "account": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "ledger_index_min": -1,
  "ledger_index_max": -1,
  "limit": 50,
  "forward": false
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| **invalidParams** | Invalid or missing required parameters | Check parameter format and required fields |
| **actNotFound** | Account not found or doesn't exist | Verify account address format and activation status |
| **tecUNFUNDED_PAYMENT** | Insufficient balance for payment | Check account balance and reserve requirements |
| **temBAD_CURRENCY** | Invalid currency code format | Use 3-letter ISO codes or 40-character hex for custom currencies |
| **tecNO_LINE_INSUF_RESERVE** | Insufficient reserve for trust line creation | Ensure account has required XRP reserve for new trust line |
| **tecPATH_DRY** | No liquidity available for payment path | Try different amount or check available liquidity |

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
- **XRPL Documentation**: [xrpl.org/docs](https://xrpl.org/docs)
- **XRPL Community**: [xrplcommunity.blog](https://xrplcommunity.blog)