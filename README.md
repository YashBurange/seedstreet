# SeedStreet

SeedStreet is a browser-local startup investment marketplace. It includes separate investor and founder workspaces, discovery, founder onboarding, structured offers, negotiation, gated meetings, messaging, simulated commitments, and data portability.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production build

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New Project** and import the repository.
3. Keep the detected Next.js defaults.
4. Deploy. No environment variables or external services are required.

All interactive data is stored in versioned browser `localStorage`. It is shared by the demo account switcher in one browser, but it does not synchronize across browsers or devices. Use the account menu to export, import, or reset demo data.

Suggested walkthrough: choose **Investor**, open OrbitalMesh, and submit a `$50,000` offer at a `$4,000,000` pre-money valuation with a meeting request. Return to the role chooser, enter the **Founder** workspace, counter at `$5,000,000`, and approve the meeting. Return to the investor portfolio to accept, book a slot, and record a simulated commitment.

