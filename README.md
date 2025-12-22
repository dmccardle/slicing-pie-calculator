# Slicing Pie Calculator

A web application for tracking startup equity using Mike Moyer's Slicing Pie model. Calculate fair equity distribution based on contributions from each team member.

## Features

- **Equity Dashboard** - Real-time pie chart showing equity distribution
- **Contributor Management** - Add, edit, and remove team members with hourly rates
- **Contribution Logging** - Track time, cash, non-cash, ideas, and relationships
- **Automatic Slice Calculation** - Uses standard Slicing Pie multipliers
- **Contribution History** - Sortable and filterable table of all contributions
- **Data Export** - Export to JSON, Excel, and PDF
- **Local Storage** - All data stored locally in your browser

## Slicing Pie Multipliers

| Contribution Type | Multiplier | Example |
|------------------|------------|---------|
| Time (unpaid) | 2x | 10 hrs @ $100/hr = 2,000 slices |
| Cash | 4x | $1,000 = 4,000 slices |
| Non-Cash | 2x | $500 equipment = 1,000 slices |
| Ideas | 1x | Negotiated value |
| Relationships | 1x | Negotiated value |

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

```bash
# Clone the repository
git clone [your-repo-url]
cd slicing-pie

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Production Build

```bash
npm run build
npm start
```

## Usage

1. **Add Contributors** - Go to Contributors page and add team members with their hourly rates
2. **Log Contributions** - Go to Contributions page to record work, cash, or other contributions
3. **View Equity** - Dashboard shows real-time equity split based on all contributions
4. **Export Data** - Go to Settings to export your data as JSON, Excel, or PDF

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS
- **Recharts** - Charts and visualizations
- **xlsx** - Excel export
- **jsPDF** - PDF export

## Data Storage

All data is stored locally in your browser's localStorage. No server or database is required.

## About Slicing Pie

The Slicing Pie model was created by Mike Moyer as a fair way to split equity in early-stage startups. It's based on the principle that a person's share of equity should equal their share of contributions.

Learn more: [slicingpie.com](https://slicingpie.com)

## License

MIT
