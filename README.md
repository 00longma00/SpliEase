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

# Ensure firebase-applet-config.json and sensitive files are ignored (already in .gitignore)
git status

# Stage files (.gitignore ensures firebase-applet-config.json is not tracked)
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

## 🔒 Resolving Secret Exposure & GitHub Security Alerts

If GitHub Secret Scanning or GitGuardian reported an alert such as:
> *"Review secret detected in firebase-applet-config.json#L4 • commit 0d4e67d"*
> *"Anyone with read access can view exposed secrets. Consider rotating and revoking each valid secret."*

Follow these steps to completely resolve and secure your repository:

### 1. Remove the tracked config file from Git repository
If `firebase-applet-config.json` was committed to git in an earlier commit, untrack it while keeping the local file for development:

```bash
# Untrack firebase-applet-config.json from git index
git rm --cached firebase-applet-config.json

# Commit the removal
git commit -m "fix(security): untrack firebase-applet-config.json and rely on .env"

# Push changes to your GitHub remote
git push origin main
```

*(Note: `.gitignore` has now been updated so `firebase-applet-config.json` and `*.local` will never be staged or committed again).*

### 2. Purge the secret from Git history (Optional for Public Repos)
If your repository is public and you want to scrub commit `0d4e67d` from git history completely, use `git-filter-repo` or BFG:

```bash
# Using git-filter-repo (recommended)
pip install git-filter-repo
git filter-repo --path firebase-applet-config.json --invert-paths
git push origin --force --all
```

### 3. Rotate & Revoke the Exposed Google API Key
1. Go to the [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials) for your project.
2. Under **API Keys**, locate the key flagged in the alert (`AIzaSy...`).
3. Click **Regenerate key** (or create a new API key).
4. **Revoke/Delete** the old key after replacing it with the new key.
5. In your project, create a `.env.local` file (which is gitignored) with your new key:
   ```bash
   VITE_FIREBASE_API_KEY="YOUR_NEW_ROTATED_KEY"
   ```

### 4. Apply API Key Restrictions (Critical Defense-in-Depth)
Firebase web API keys are client-facing identifiers. To protect them against unauthorized usage:
1. In [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials), click edit on your API Key.
2. Under **Application restrictions**, select **Websites** (HTTP referrers) and restrict to your domains (e.g. `https://your-username.github.io/*`, `http://localhost:*`, etc.).
3. Under **API restrictions**, select **Restrict key** and select only the APIs your app needs:
   - **Cloud Firestore API**
   - **Identity Toolkit API** (Firebase Auth)
   - **Token Service API**
4. Save the restrictions. Now, even if the key is scanned in client bundles, it cannot be abused for unauthorized Google Cloud services.

### 5. Close the GitHub Secret Scanning Alert
1. In your GitHub repository, click on the **Security** tab.
2. Under **Vulnerability alerts**, select **Secret scanning**.
3. Click on the alert for the Google API Key.
4. Click **Close as** -> select **Revoked** (if you rotated/deleted the key in GCP) or **False positive** / **Used in tests** (if restricted to client Firebase SDK).


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
