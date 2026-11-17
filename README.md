# Budjet 💸

A personal budgeting app I built for myself and use every day on my phone.

Budjet keeps all my accounts, cards, bills and spending in one place, so I can see at a glance how much I actually have free to spend this month.

**🔗 Live app:** [budjet-brown.vercel.app](https://budjet-brown.vercel.app)
*(On iPhone: open in Safari → Share → Add to Home Screen)*

---

## ✨ Features

- **Accounts:** checking, savings and credit cards (with credit limits), all in one view
- **Entries:** log income, expenses, transfers between accounts and credit card payments
- **"Free to spend":** shows how much checking money is above a safety cushion you set
- **Monthly spending limit:** a progress bar showing how close you are to this month's limit
- **Bills:** monthly bill reminders that turn into an expense with one tap when you pay them
- **Categories:** custom spending categories with icons
- **Summary:** spending broken down by category, month by month
- **History:** every entry, newest first, browsable by month
- **Backup and restore:** export everything to a file and import it back
- **Works offline:** installable as a home-screen app that keeps working without internet
- **Dark mode:** follows your phone's setting

## 🔒 Privacy

Everything stays **on your device**: no accounts, no servers, no bank logins. Entries are typed in by hand, on purpose.

## 🧰 Built with

- [Expo](https://expo.dev) + [React Native](https://reactnative.dev), one codebase for web, iOS and Android
- TypeScript
- Expo Router for navigation
- AsyncStorage for on-device storage
- A service worker for offline support
- Deployed on [Vercel](https://vercel.com)

## 🚀 Run it locally

```bash
npm install
npm run web      # open in the browser
npm start        # or run with Expo Go on your phone
npm test         # run the money math tests
```

To build the web version: `npm run build:web` (output goes to `dist/`).

## 🗺️ Ideas for later

- Separate accounts so friends can each keep their own budget
- App Store release
