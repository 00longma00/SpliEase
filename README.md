# SplitEase - Group Expense Splitter & Settlement

A full-featured, modern web application inspired by Splitwise for managing shared group expenses, calculating exact multi-way splits, simplifying debts using the min-cash-flow algorithm, and settling balances with instant self-join group codes.

---

## Key Features

1. **Group Expense Management**:
   - Organize expenses by custom groups (Trips, Apartment/Home, Couples, Projects, Events).
   - Support for 8 major currencies (USD, EUR, GBP, CAD, AUD, JPY, INR, CHF).
   - Category tagging (Food & Dining, Transportation, Lodging, Groceries, Entertainment, Utilities, General).

2. **Versatile Split Modes**:
   - **Equal Split**: Even division among selected members with penny rounding to ensure exact penny precision.
   - **Exact Amounts**: Specify precise dollar amounts for each member with live balance validation.
   - **Percentages**: Allocate custom percentages with real-time feedback ensuring a 100% total.
   - **Shares/Ratios**: Split by custom ratio weights (e.g. 2 shares : 1 share).

3. **Multi-Payer Support**:
   - One person can pay for the entire bill, or multiple members can contribute varying amounts.

4. **Splitwise Debt Simplification Algorithm**:
   - Built-in greedy min-cash-flow algorithm that automatically eliminates circular or transitive debts.
   - Example: If Alice owes Bob $50, and Bob owes Charlie $50, SplitEase simplifies this so Alice pays Charlie $50 directly (reducing 2 transactions to 1).
   - Includes a toggle between "Simplified Debts" and "Direct Raw Debts".

5. **Self-Join Group System**:
   - Each group generates a unique 6-character Join Code (e.g., `TAHOE8`).
   - Shareable link format: `https://<your-app>/?code=TAHOE8`.
   - Anyone can enter the code or click the invite link to immediately add themselves to the group, pick their avatar, and begin logging expenses.

6. **Settle Up & Payment Logging**:
   - Record payments via Venmo, Cash, PayPal, Zelle, or Bank Transfer.
   - Smart 1-click "Settle this debt" shortcut buttons directly on suggested debt cards.

7. **Audit Trail & Activity Log**:
   - Chronological stream of all group actions (expenses added, edited, deleted, payments recorded, and members joined).

---

## Pushing to Your GitHub as a New Repository

Follow these steps to host this project on your personal GitHub:

### Step 1: Create a new repository on GitHub
1. Go to [https://github.com/new](https://github.com/new).
2. Enter a repository name (e.g. `fairshare-splitwise-app`).
3. Leave **"Add a README file"** and **"Add .gitignore"** unchecked (they already exist in this project).
4. Click **Create repository**.

### Step 2: Push your local files to GitHub
Open your terminal in this project root directory and run:

```bash
# Initialize git if not already initialized
git init

# Stage all files
git add .

# Create the initial commit
git commit -m "feat: complete Splitwise clone with debt simplification, custom splits and self-join"

# Set branch to main
git branch -M main

# Link your GitHub repository (replace with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/fairshare-splitwise-app.git

# Push to GitHub
git push -u origin main
```

---

## Local Development

```bash
# Install dependencies
npm install

# Run unit tests
npm test # or: npx tsx --test src/utils/splitLogic.test.ts

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Free 1-Click Hosting Options

- **GitHub Pages**: Go to your repository settings -> Pages -> Build and deployment -> select GitHub Actions.
- **Vercel / Cloudflare Pages / Netlify**: Connect your GitHub repository for instant automated deployments with global CDN and SSL.
- **Docker / Cloud Run**: Can be built into a container with standard Node.js runtime.

---

## Tech Stack

- **Framework**: React 19 SPA with TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Unit Testing**: Node.js native test runner (`node:test`, `node:assert/strict`) with `tsx`
- **State & Storage**: Persistent browser storage with JSON import/export
