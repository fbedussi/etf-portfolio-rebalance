# ETF Portfolio Rebalance

A modern web application for managing and rebalancing your ETF portfolio. Track your investments, monitor asset allocation drift, and make informed rebalancing decisions with real-time price data.

## Features

- **Portfolio Management**: Define your target asset class and country allocations
- **Real-time Price Updates**: Automatic price fetching from Borsa Italiana and JustETF APIs
- **Drift Analysis**: Visual indicators showing how your current allocation differs from targets
- **Interactive Charts**: 
  - Portfolio value over time
  - Asset class distribution (pie charts)
  - Country allocation breakdown
- **Transaction Tracking**: Record buy/sell transactions with historical data
- **Rebalancing Recommendations**: Calculate optimal trades to rebalance your portfolio
- **Offline Support**: Cached price data for offline viewing

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **State Management**: Zustand
- **UI Components**: Radix UI primitives with Tailwind CSS
- **Charts**: Recharts
- **Build Tool**: Vite
- **Testing**: Node.js built-in test runner, Playwright for E2E tests
- **Code Quality**: ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd etf-portfolio-rebalance
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (if needed for API configuration)

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

### Creating a Portfolio

Create a YAML file to define your portfolio. See `portfolio-simple.yaml` for an example:

```yaml
name: "My Simple Portfolio"

targetAssetClassAllocation:
  Stocks: 70
  Bonds: 30

targetCountryAllocation:
  US: 50
  others: 50

maxDrift: 10

etfs:
  IE00B4L5Y983:
    name: "iShares Core MSCI World UCITS"
    assetClass:
        name: "US Total Market"
        category: "Stocks"
    transactions:
      - date: "2024-01-15"
        quantity: 10
        price: 100

  LU0478205379:
    name: "Xtrackers II EUR Corporate Bond UCITS ETF 1C"
    assetClass:
        name: "US Aggregate Bonds"
        category: "Bonds"
    transactions:
      - date: "2024-01-15"
        quantity: 20
        price: 200
```



### Portfolio File Structure

- **name**: Portfolio name
- **targetAssetClassAllocation**: Percentage allocation by asset class (e.g., Stocks, Bonds)
- **targetCountryAllocation**: Percentage allocation by country
- **maxDrift**: Maximum acceptable drift percentage before rebalancing is recommended
- **etfs**: Dictionary of ETFs by ISIN
  - **dataSource**: Either "borsaitaliana" or "justetf"
  - **name**: ETF name
  - **assetClass**: Asset class information
  - **countries**: Country allocation percentages
  - **transactions**: List of buy/sell transactions

### Storing Your Portfolio File

> [!IMPORTANT]
> Your portfolio YAML file contains important financial data. We strongly recommend storing it securely with backup and version control.

**Recommended storage options:**

1. **Version Control (Recommended)**: Store your portfolio file in a **private** Git repository
   - GitHub (private repository)
   - GitLab (private repository)
   - Bitbucket (private repository)
   - Benefits: Full version history, easy rollback, automatic backups, access from multiple devices

2. **Cloud Storage**: Store in a cloud service with automatic sync
   - Google Drive
   - Dropbox
   - OneDrive
   - iCloud Drive
   - Benefits: Automatic backups, cross-device access, file versioning

**Security tips:**
- Never commit your portfolio file to a public repository
- Consider encrypting sensitive financial data
- Keep regular backups in multiple locations
- Use `.gitignore` to exclude your personal portfolio file from this repository

### Loading Your Portfolio

1. Click the "Open File" button in the application header
2. Select your portfolio YAML file
3. The application will load your portfolio and fetch current prices

### Understanding the Dashboard

The dashboard displays several key sections:

1. **Portfolio Value Card**: Shows total current value and performance
2. **Value Over Time Chart**: Interactive chart showing portfolio growth
3. **ETF Data Table**: Detailed view of each ETF with current values and performance
4. **Drift Cards**: Shows how far your current allocation drifts from targets
5. **Pie Charts**: Visual representation of asset class and country allocations

### Rebalancing

The drift cards will show:
- **Green**: Within acceptable drift range
- **Yellow/Red**: Exceeds drift threshold, rebalancing recommended
- Suggested amounts to buy/sell for each asset class or country

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run check` - Run typecheck and lint
- `npm run test` - Run unit tests
- `npm run e2e` - Run Playwright E2E tests

## Project Structure

```
├── src/
│   ├── components/        # React components
│   ├── lib/              # Utility functions and business logic
│   │   ├── portfolio.ts  # Portfolio calculations
│   │   ├── file.ts       # File handling
│   │   └── utils.ts      # General utilities
│   ├── services/         # API and cache services
│   ├── hooks/            # Custom React hooks
│   ├── App.tsx           # Main application component
│   ├── store.ts          # Zustand state management
│   └── model.ts          # TypeScript type definitions
├── e2e/                  # Playwright E2E tests
├── public/               # Static assets
└── portfolio-simple.yaml # Example portfolio file
```

## Data Sources

The application fetches real-time ETF prices from:
- **Borsa Italiana API**: For ETFs listed on the Italian stock exchange
- **JustETF API**: For other European ETFs

Price data is cached locally to reduce API calls and enable offline viewing.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting: `npm run check && npm test`
5. Submit a pull request

## License

MIT License

## Support

For issues or questions, please open an issue on the GitHub repository.
