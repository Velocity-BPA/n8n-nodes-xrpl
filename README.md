# n8n-nodes-xrpl

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive integration with the XRP Ledger (XRPL) blockchain network, offering 1 primary resource with 6+ operations for account management, wallet operations, NFT handling, and transaction history retrieval.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![XRPL](https://img.shields.io/badge/XRPL-Ledger-green)
![Blockchain](https://img.shields.io/badge/Blockchain-Integration-orange)

## Features

- **Account Management** - Retrieve detailed account information, balances, and configuration settings
- **Wallet Operations** - Generate new XRPL wallets and validate address formats with checksum verification
- **NFT Integration** - Query and manage Non-Fungible Tokens owned by XRPL accounts
- **Transaction History** - Access comprehensive transaction records with flexible filtering and pagination
- **Trust Line Management** - Handle trust lines for issued currencies and token relationships
- **Real-time Data** - Connect to live XRPL network via high-availability cluster endpoints
- **Secure Authentication** - Custom authentication flow supporting multiple wallet connection methods
- **Production Ready** - Built for enterprise workflows with comprehensive error handling

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
| **Wallet Secret** | XRPL wallet secret key for transaction signing | Yes |
| **Network** | XRPL network (Mainnet, Testnet, Devnet) | Yes |
| **Custom RPC URL** | Custom XRPL node endpoint (optional) | No |
| **Connection Timeout** | Request timeout in milliseconds | No |

## Resources & Operations

### 1. Account

| Operation | Description |
|-----------|-------------|
| **Get Account Info** | Retrieve basic account information including sequence number, balance, and account flags |
| **Get Account Balances** | Fetch account balances for XRP and all issued currencies/tokens |
| **Get Account NFTs** | List all Non-Fungible Tokens owned by the specified account |
| **Get Transaction History** | Retrieve paginated transaction history with filtering options |
| **Validate Address** | Verify XRPL address format and checksum validity |
| **Generate Wallet** | Create a new XRPL wallet with public/private key pair |

## Usage Examples

```javascript
// Get account information
{
  "account": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "ledger_index": "validated",
  "strict": true
}
```

```javascript
// Retrieve account NFTs with pagination
{
  "account": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "limit": 100,
  "marker": "previous_page_marker"
}
```

```javascript
// Generate new XRPL wallet
{
  "algorithm": "secp256k1",
  "entropy": "random_entropy_string"
}
```

```javascript
// Get transaction history with date range
{
  "account": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "ledger_index_min": 32570,
  "ledger_index_max": 32572,
  "limit": 50,
  "forward": true
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| **actNotFound** | Account does not exist on the ledger | Verify the account address is correct and funded |
| **invalidParams** | Invalid request parameters provided | Check parameter format and required fields |
| **lgrNotFound** | Specified ledger index not found | Use 'validated', 'current', or valid ledger number |
| **noNetwork** | Network connection failed | Verify internet connection and XRPL node availability |
| **rateLimited** | API rate limit exceeded | Implement request throttling or use multiple endpoints |
| **invalidSecret** | Wallet secret key is invalid | Ensure wallet secret is properly formatted and valid |

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
- **XRPL Community**: [XRPL Developer Discord](https://discord.gg/xrpl)