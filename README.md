# n8n-nodes-xrpl

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for XRP Ledger (XRPL) providing 10 resources and 48+ operations for payments, DEX trading, NFTs, escrows, AMM pools, and more.

![XRPL + n8n](https://img.shields.io/badge/XRPL-n8n-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.10-brightgreen)

## Features

### 🔄 XRPL Node (Action Node)
Execute operations on the XRP Ledger:

| Resource | Operations |
|----------|------------|
| **Account** | Get info, balances, trust lines, NFTs, transaction history |
| **Payment** | Send XRP, send issued currencies, cross-currency pathfinding |
| **Trust Line** | Create, modify, remove trust lines |
| **DEX** | Create/cancel offers, get order books, view account offers |
| **NFT (XLS-20)** | Mint, burn, create/accept/cancel offers, get offers |
| **Escrow** | Create time/conditional escrows, finish, cancel, list escrows |
| **Check** | Create, cash, cancel checks |
| **Payment Channel** | Create, fund, claim, list channels |
| **AMM** | Create pools, deposit, withdraw, swap, vote on fees |
| **Utility** | Convert XRP/drops, validate addresses, lookup transactions, get fees |

### ⚡ XRPL Trigger Node
Real-time event subscriptions:

- **Account Transactions** — Trigger on any transaction affecting an account
- **Payment Received** — Trigger on incoming payments with amount filtering
- **Ledger Closed** — Trigger on each new validated ledger

## Installation

### Community Nodes (Recommended)

1. Go to **Settings** > **Community Nodes**
2. Click **Install a community node**
3. Enter `n8n-nodes-xrpl`
4. Click **Install**

### Manual Installation

```bash
cd ~/.n8n/nodes
pnpm install n8n-nodes-xrpl
```

Then restart n8n.

### Development Installation

```bash
# 1. Extract the zip file
unzip n8n-nodes-xrpl.zip
cd n8n-nodes-xrpl

# 2. Install dependencies
pnpm install

# 3. Build the project
pnpm build

# 4. Start n8n with custom extensions
N8N_CUSTOM_EXTENSIONS=~/Projects/n8n-nodes-xrpl n8n start
```

## Credentials Setup

Create XRPL API credentials with:

| Field | Description |
|-------|-------------|
| **Network** | Mainnet, Testnet, Devnet, AMM Devnet, or Custom |
| **Custom WebSocket URL** | For custom/private nodes |
| **Wallet Seed** | Your secret seed (sXXX...) for signing transactions |
| **Account Address** | Your r-address for read-only operations |

> ⚠️ **Security**: Never share your wallet seed. Use environment variables or n8n's credential encryption for production.

## Resources & Operations

### Account
- **Get Info** - Account information and XRP balance
- **Get Balances** - All balances including trust lines
- **Get Trust Lines** - Trust line details
- **Get NFTs** - NFTs owned by account
- **Get Transactions** - Transaction history

### Payment
- **Send XRP** - Send XRP to another account
- **Send Currency** - Send issued currency
- **Pathfind** - Find cross-currency payment paths

### Trust Line
- **Create/Modify** - Create or modify trust lines
- **Remove** - Remove trust lines

### DEX
- **Create Offer** - Create buy/sell offers
- **Cancel Offer** - Cancel existing offers
- **Get Order Book** - View order book for currency pairs
- **Get Account Offers** - View account's open offers

### NFT
- **Mint** - Create new NFTs
- **Burn** - Destroy NFTs
- **Create Sell/Buy Offer** - List NFTs for sale or make offers
- **Accept Offer** - Accept NFT offers
- **Cancel Offer** - Cancel NFT offers
- **Get Offers** - View offers for an NFT

### Escrow
- **Create** - Create time-based or conditional escrows
- **Finish** - Complete escrows
- **Cancel** - Cancel expired escrows
- **Get Escrows** - List pending escrows

### Check
- **Create** - Create checks
- **Cash** - Cash checks
- **Cancel** - Cancel checks
- **Get Checks** - List checks

### Payment Channel
- **Create** - Create payment channels
- **Fund** - Add funds to channels
- **Claim** - Claim from channels
- **Get Channels** - List channels

### AMM
- **Create** - Create AMM pools
- **Deposit** - Deposit to pools
- **Withdraw** - Withdraw from pools
- **Vote** - Vote on trading fees
- **Get Info** - Pool information

### Utility
- **Convert XRP/Drops** - Unit conversion
- **Validate Address** - Address validation
- **Convert Address** - Classic to X-address conversion
- **Get Transaction** - Lookup by hash
- **Get Ledger** - Ledger information
- **Get Server Info** - Server status
- **Get Fee** - Current fee estimates
- **Generate Wallet** - Create new wallets

## Trigger Node

### Account Transaction
Subscribes to account transactions via WebSocket. Configure:
- Account address to watch
- Automatic reconnection on disconnect

### Payment Received
Filters for incoming payments:
- Minimum amount threshold
- Payment metadata extraction

### Ledger Closed
Triggers on each new validated ledger:
- Ledger index and hash
- Transaction count
- Close time

## Usage Examples

### Send XRP Payment

1. Add an **XRPL** node
2. Select **Payment** > **Send XRP**
3. Enter destination address and amount
4. Execute!

### Monitor Incoming Payments

1. Add an **XRPL Trigger** node
2. Select **Payment Received**
3. Optionally set minimum amount filter
4. Connect to your workflow

### Create NFT and List for Sale

```
[XRPL: Mint NFT] → [XRPL: Create Sell Offer]
```

### DEX Trading

```
[XRPL Trigger: Ledger Closed] → [XRPL: Get Order Book] → [IF: Price Check] → [XRPL: Create Offer]
```

## XRPL Concepts

### Networks

| Network | WebSocket URL | Use Case |
|---------|--------------|----------|
| Mainnet | `wss://xrplcluster.com` | Production |
| Testnet | `wss://s.altnet.rippletest.net:51233` | Testing |
| Devnet | `wss://s.devnet.rippletest.net:51233` | Development |
| AMM Devnet | `wss://amm.devnet.rippletest.net:51233` | AMM testing |

### Units
- **XRP**: Main currency unit
- **Drops**: Smallest unit (1 XRP = 1,000,000 drops)

### Addresses
- **Classic Address**: Starts with 'r' (e.g., rN7n3473SaZBCG...)
- **X-Address**: Includes destination tag (starts with 'X')

## Error Handling

The node provides detailed error messages for common issues:
- **actNotFound**: Account not found on ledger
- **tecUNFUNDED_PAYMENT**: Insufficient balance
- **tecPATH_DRY**: No valid payment path found
- **tefBAD_AUTH**: Invalid credentials

## Security Best Practices

1. **Never hardcode wallet seeds** - Use n8n credentials
2. **Test on testnet first** - Validate workflows before mainnet
3. **Use destination tags** - Prevent lost funds on exchanges
4. **Monitor transactions** - Set up alerts for unusual activity

## Development

### Prerequisites

- Node.js >= 18.10
- pnpm >= 9.1

### Commands

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint

# Fix lint issues
pnpm lint:fix
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
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm lint` and fix any issues
5. Submit a pull request

## Support

- 🐛 [Report Issues](https://github.com/Velocity-BPA/n8n-nodes-xrpl/issues)
- 💬 [Discussions](https://github.com/Velocity-BPA/n8n-nodes-xrpl/discussions)
- 🌐 [Website](https://velobpa.com)

## Acknowledgments

- [XRPL Documentation](https://xrpl.org/docs)
- [xrpl.js Library](https://js.xrpl.org/)
- [n8n Community](https://community.n8n.io/)

---

Built with ❤️ by [Velocity BPA](https://velobpa.com)
