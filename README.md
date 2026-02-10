# n8n-nodes-xrpl

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive integration with the XRP Ledger (XRPL), offering 3 resources with full account management, payment processing, and trust line operations for building powerful blockchain automation workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![XRPL](https://img.shields.io/badge/XRPL-Mainnet%20%26%20Testnet-green)
![Crypto](https://img.shields.io/badge/Crypto-Payments-orange)
![DeFi](https://img.shields.io/badge/DeFi-Integration-purple)

## Features

- **Account Management** - Retrieve account information, balances, transaction history, and validate addresses
- **XRP & Token Payments** - Send XRP and issued currency payments with automatic pathfinding
- **Trust Line Operations** - Manage trust relationships for issued currencies and token holdings
- **Multi-Network Support** - Connect to mainnet, testnet, or custom XRPL nodes
- **Wallet Generation** - Create new XRPL wallets with cryptographic key pairs
- **Transaction History** - Access comprehensive paginated transaction records
- **Address Validation** - Verify XRPL address format and checksums
- **Cross-Currency Paths** - Find optimal payment routes across different currencies

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
| Server URL | XRPL server endpoint (mainnet, testnet, or custom) | Yes |
| Wallet Seed | Secret seed for transaction signing (if sending transactions) | No |
| Network | Network selection (mainnet/testnet/custom) | Yes |
| Connection Timeout | Request timeout in milliseconds | No |

## Resources & Operations

### 1. Accounts

| Operation | Description |
|-----------|-------------|
| Get Account Info | Retrieves comprehensive account information including sequence, balance, and flags |
| Get Account Balances | Gets all currency balances for an account including XRP and issued currencies |
| Get Account Transaction History | Retrieves paginated transaction history for an account |
| Validate Address | Validates XRPL address format and checksum |
| Generate Wallet | Generates a new XRPL wallet with address and keys |

### 2. Payments

| Operation | Description |
|-----------|-------------|
| Send XRP Payment | Sends direct XRP payment between accounts |
| Send Issued Currency Payment | Sends issued currency payment with automatic pathfinding |
| Pathfind Cross Currency | Finds payment paths for cross-currency transactions |

### 3. Trust Lines

| Operation | Description |
|-----------|-------------|
| Get Trust Lines | Retrieves all trust lines for an account |
| Set Trust Line | Creates or modifies a trust line for issued currencies |
| Remove Trust Line | Removes an existing trust line |

## Usage Examples

```javascript
// Get account information
{
  "account": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "ledger_index": "validated"
}

// Send XRP payment
{
  "account": "rSenderAddress123456789",
  "destination": "rRecipientAddress987654321",
  "amount": "1000000", // 1 XRP in drops
  "destination_tag": 12345,
  "memo": "Payment for services"
}

// Get account balances
{
  "account": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "ledger_index": "current"
}

// Set trust line for USD
{
  "account": "rTrustingAccount123456789",
  "currency": "USD",
  "issuer": "rIssuerAddress987654321",
  "limit": "1000"
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| `tecUNFUNDED_PAYMENT` | Insufficient XRP balance for transaction | Ensure account has enough XRP for payment and fees |
| `temINVALID_ACCOUNT_ID` | Invalid account address format | Verify address format and checksum using validate operation |
| `tecNO_LINE` | Trust line does not exist | Create trust line before attempting currency transactions |
| `telINSUF_FEE_P` | Transaction fee too low | Increase transaction fee or use auto-fee calculation |
| `tecPATH_DRY` | No payment path found | Check liquidity or use different source currencies |
| `temDISABLED` | Account or feature disabled | Verify account status and feature availability |

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
- **XRPL Documentation**: [xrpl.org/docs](https://xrpl.org/docs/)
- **XRPL Community**: [XRPLedger.org](https://xrpledger.org/)