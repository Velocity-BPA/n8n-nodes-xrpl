# n8n-nodes-xrpl

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive integration with the XRP Ledger (XRPL) blockchain, offering 3 resources with 14 operations for account management, trust line operations, and payment functionality including XRP transfers, issued currency transactions, and NFT operations.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![XRPL](https://img.shields.io/badge/XRPL-Compatible-brightgreen)
![WebSocket](https://img.shields.io/badge/WebSocket-Supported-orange)
![Mainnet](https://img.shields.io/badge/Network-Mainnet%20%7C%20Testnet-blue)

## Features

- **Account Operations** - Retrieve account information, balances, NFTs, and transaction history
- **Wallet Management** - Generate new wallets and validate XRPL addresses
- **Trust Line Control** - Create, modify, remove, and freeze trust lines for issued currencies
- **XRP Payments** - Send native XRP with memo support and fee customization
- **Issued Currency Transfers** - Send custom tokens and issued currencies on XRPL
- **Cross-Currency Pathfinding** - Find optimal payment paths for currency exchanges
- **Multi-Network Support** - Works with XRPL mainnet, testnet, and custom endpoints
- **WebSocket Integration** - Real-time data streaming with fallback to REST API

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
| Network | Choose between Mainnet, Testnet, or Custom endpoint | Yes |
| Custom Endpoint | Custom XRPL server URL (HTTP/HTTPS or WebSocket) | No |
| Secret Key | XRPL account secret key for signing transactions | Yes (for write operations) |
| Account Address | XRPL account address (auto-derived from secret if not provided) | No |
| Connection Type | Preferred connection method: REST API or WebSocket | No |

## Resources & Operations

### 1. Account

| Operation | Description |
|-----------|-------------|
| Get Account Info | Retrieve detailed account information including reserve requirements and flags |
| Get Account Balances | Fetch all balances including XRP and issued currencies |
| Get Account NFTs | List all NFTs owned by the account |
| Get Transaction History | Retrieve paginated transaction history for the account |
| Validate Address | Check if an XRPL address is valid and properly formatted |
| Generate Wallet | Create a new XRPL wallet with address and secret key |

### 2. Trust Line

| Operation | Description |
|-----------|-------------|
| Get Trust Lines | Retrieve all trust lines associated with an account |
| Create Trust Line | Establish a new trust line for an issued currency |
| Modify Trust Line | Update trust line limits and settings |
| Remove Trust Line | Delete an existing trust line (balance must be zero) |
| Deep Freeze Trust Line | Permanently freeze a trust line to prevent future modifications |

### 3. Payment

| Operation | Description |
|-----------|-------------|
| Send XRP | Transfer native XRP between accounts with optional memos |
| Send Issued Currency | Transfer custom tokens and issued currencies |
| Pathfind Cross-Currency | Find payment paths for cross-currency transactions |

## Usage Examples

```javascript
// Get account information
{
  "account": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "ledger_index": "validated"
}

// Send XRP payment
{
  "destination": "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",
  "amount": "1000000", // 1 XRP in drops
  "memo": "Payment for services"
}

// Create trust line for USD
{
  "currency": "USD",
  "issuer": "rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq",
  "limit": "1000",
  "quality_in": 1000000000,
  "quality_out": 1000000000
}

// Send issued currency
{
  "destination": "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",
  "amount": {
    "currency": "USD",
    "value": "100",
    "issuer": "rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq"
  }
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| `tecUNFUNDED_PAYMENT` | Insufficient funds for transaction | Check account balance and ensure adequate XRP for fees |
| `tecNO_DST_INSUF_XRP` | Destination requires XRP reserve | Ensure destination has minimum 10 XRP reserve |
| `temINVALID_FLAG` | Invalid transaction flag | Review transaction flags and use valid XRPL flag values |
| `terNO_ACCOUNT` | Account does not exist | Verify account address and ensure it's activated on the ledger |
| `tecNO_PERMISSION` | Insufficient permissions | Check account settings and required authorization flags |
| `WebSocket Connection Failed` | Cannot connect to XRPL server | Switch to REST API or try alternative endpoint URLs |

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
- **XRPL Community**: [XRPL Developer Discord](https://discord.gg/sfX3ERAMjH)