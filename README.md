# n8n-nodes-xrpl

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for interacting with the XRP Ledger (XRPL) blockchain. This node provides 15+ resources covering accounts, payments, DEX trading, NFTs, DeFi operations, and advanced features like AMMs and lending protocols, enabling seamless integration of XRPL functionality into your n8n workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![XRP Ledger](https://img.shields.io/badge/XRP%20Ledger-Compatible-green)
![DeFi](https://img.shields.io/badge/DeFi-Enabled-orange)
![NFT](https://img.shields.io/badge/NFT-Supported-purple)

## Features

- **Complete Account Management** - Create, fund, and manage XRPL accounts with full transaction history
- **DEX Trading Operations** - Place orders, execute trades, and manage order books on the decentralized exchange
- **NFT Minting & Trading** - Create, mint, transfer, and burn NFTs with full metadata support
- **DeFi Protocol Integration** - Interact with AMMs, lending protocols, and liquidity pools
- **Payment Processing** - Send XRP and token payments with path finding and multi-hop routing
- **Advanced Financial Instruments** - Manage escrows, checks, payment channels, and trust lines
- **Vault & Credential Management** - Secure asset storage and identity verification workflows
- **Real-time Simulation** - Test transactions and strategies before execution

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
| Network | XRPL network (mainnet, testnet, devnet) | Yes |
| Server URL | Custom XRPL server URL (optional) | No |
| Account Secret | Wallet secret for transaction signing | Yes |

## Resources & Operations

### 1. Account

| Operation | Description |
|-----------|-------------|
| Get Info | Retrieve account information, balances, and settings |
| Create | Generate new XRPL account with wallet credentials |
| Fund | Add XRP to account (testnet/devnet only) |
| Set Settings | Configure account flags, domain, and email hash |
| Get History | Fetch transaction history and account activity |
| Get Objects | Retrieve account-owned objects (offers, trust lines, etc.) |

### 2. TrustLine

| Operation | Description |
|-----------|-------------|
| Create | Establish trust line for token holdings |
| Modify | Update trust line limit or flags |
| Delete | Remove unused trust line |
| List | Get all trust lines for an account |
| Get Rippling | Check rippling status between accounts |

### 3. Payment

| Operation | Description |
|-----------|-------------|
| Send XRP | Transfer XRP between accounts |
| Send Token | Transfer issued tokens via trust lines |
| Path Find | Discover optimal payment paths |
| Multi-hop | Execute complex cross-currency payments |
| Partial | Handle partial payment scenarios |

### 4. DEX

| Operation | Description |
|-----------|-------------|
| Place Order | Create buy/sell orders on the DEX |
| Cancel Order | Remove existing orders |
| Get Order Book | Retrieve current order book data |
| Get Trades | Fetch recent trade history |
| Market Data | Get ticker and price information |

### 5. NFT

| Operation | Description |
|-----------|-------------|
| Mint | Create new NFT tokens |
| Transfer | Send NFTs between accounts |
| Burn | Destroy NFT tokens |
| Get Info | Retrieve NFT metadata and properties |
| List Collection | Get NFTs owned by account |
| Set Metadata | Update NFT attributes |

### 6. Escrow

| Operation | Description |
|-----------|-------------|
| Create | Set up time or condition-locked escrow |
| Finish | Release escrowed funds |
| Cancel | Cancel escrow and return funds |
| Get Info | Check escrow status and conditions |

### 7. Check

| Operation | Description |
|-----------|-------------|
| Create | Issue a check (like writing a check) |
| Cash | Redeem a check for payment |
| Cancel | Void an unused check |
| Get Info | Retrieve check details and status |

### 8. PaymentChannel

| Operation | Description |
|-----------|-------------|
| Create | Open payment channel between parties |
| Fund | Add XRP to existing channel |
| Close | Close channel and settle final amounts |
| Verify Claim | Validate channel claim signatures |

### 9. AMM

| Operation | Description |
|-----------|-------------|
| Create Pool | Establish new AMM liquidity pool |
| Deposit | Add liquidity to existing pool |
| Withdraw | Remove liquidity and claim fees |
| Vote | Participate in AMM governance |
| Get Info | Retrieve pool statistics and rates |

### 10. PermissionedDomain

| Operation | Description |
|-----------|-------------|
| Register | Register domain for permissioned operations |
| Verify | Validate domain ownership |
| List Permissions | Get domain access rights |
| Grant Access | Allow domain-specific operations |

### 11. Credential

| Operation | Description |
|-----------|-------------|
| Issue | Create verifiable credentials |
| Verify | Validate credential authenticity |
| Revoke | Invalidate existing credentials |
| Get Status | Check credential validity |

### 12. MultiPurposeToken

| Operation | Description |
|-----------|-------------|
| Issue | Create multi-utility token |
| Configure | Set token properties and behaviors |
| Transfer | Move tokens with utility functions |
| Burn | Destroy tokens and update supply |

### 13. Vault

| Operation | Description |
|-----------|-------------|
| Create | Set up secure asset vault |
| Deposit | Store assets in vault |
| Withdraw | Remove assets with authorization |
| Get Balance | Check vault holdings |

### 14. Lending

| Operation | Description |
|-----------|-------------|
| Create Offer | Offer assets for lending |
| Borrow | Take loan against collateral |
| Repay | Pay back loan with interest |
| Liquidate | Force liquidation of undercollateralized loans |

### 15. Simulation

| Operation | Description |
|-----------|-------------|
| Test Transaction | Simulate transaction without execution |
| Path Analysis | Analyze payment path costs |
| Market Impact | Estimate DEX trade effects |
| Gas Estimation | Calculate transaction fees |

### 16. Utility

| Operation | Description |
|-----------|-------------|
| Generate Wallet | Create new wallet credentials |
| Validate Address | Verify XRPL address format |
| Convert Currency | Get exchange rates |
| Network Status | Check XRPL network health |

## Usage Examples

```javascript
// Send XRP payment
{
  "resource": "Payment",
  "operation": "Send XRP",
  "destination": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "amount": "100",
  "destinationTag": 12345,
  "memo": "Invoice payment"
}
```

```javascript
// Create NFT
{
  "resource": "NFT",
  "operation": "Mint",
  "tokenTaxon": 0,
  "uri": "https://example.com/nft/metadata.json",
  "flags": {
    "transferable": true,
    "onlyXRP": false
  }
}
```

```javascript
// Place DEX order
{
  "resource": "DEX",
  "operation": "Place Order",
  "takerGets": {
    "currency": "USD",
    "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
    "value": "100"
  },
  "takerPays": "150000000"
}
```

```javascript
// Create AMM pool
{
  "resource": "AMM",
  "operation": "Create Pool",
  "asset1": {
    "currency": "XRP"
  },
  "asset2": {
    "currency": "USD",
    "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
  },
  "tradingFee": 500
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| `tecUNFUNDED_PAYMENT` | Insufficient XRP balance for transaction | Check account balance and ensure adequate funds |
| `tecNO_LINE_REDUNDANT` | Trust line already exists | Use modify operation instead of create |
| `tefPAST_SEQ` | Transaction sequence number too low | Get current account sequence and increment |
| `tecDST_TAG_NEEDED` | Destination requires tag but none provided | Include destination tag in payment |
| `tecNO_PERMISSION` | Account lacks required permissions | Verify account flags and authorization |
| `tecINVARIANT_FAILED` | Transaction violates ledger invariants | Check transaction parameters and limits |

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
- **XRPL Documentation**: [XRP Ledger Dev Portal](https://xrpl.org/docs.html)
- **XRPL Community**: [XRPL Developer Discord](https://discord.gg/sfX3ERAMjH)