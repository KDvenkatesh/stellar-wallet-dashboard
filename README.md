# Stellar Wallet Dashboard

A polished React + Vite dashboard for connecting a Freighter wallet, checking the XLM balance, and sending payments on Stellar Testnet.

## Project Description

This project is a production-ready white belt dashboard for the Stellar network. It lets users connect their Freighter wallet, view their account balance, and send XLM payments on Stellar Testnet with clear feedback, polished UI, and automatic balance refreshing.

## Features

- Connect and disconnect a Freighter wallet
- View wallet address and XLM balance
- Send XLM payments on Stellar Testnet
- Sign transactions with the official Freighter v6 flow
- Show clear success and error messages
- Display the transaction hash with a Stellar Expert link
- Refresh the balance immediately after a successful payment
- Responsive, modern dashboard styling

## Tech Stack

- React 19
- Vite 8
- JavaScript
- @stellar/freighter-api 6.0.1
- @stellar/stellar-sdk 16.0.1

## Folder Structure

```text
src/
  App.jsx
  main.jsx
  components/
    Transactions/
      SendTransaction.jsx
      TransactionStatus.jsx
    Wallet/
      WalletConnect.jsx
  Services/
    stellar.js
```

## Installation

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

## Freighter Setup

1. Install the Freighter browser extension.
2. Create or import a wallet.
3. Switch Freighter to Stellar Testnet.
4. Open the app and click Connect Wallet.

## How to Connect Wallet

The app checks whether Freighter is available, requests access, reads the connected public key, and loads the XLM balance from Horizon Testnet.

## How to Send XLM

1. Connect your Freighter wallet.
2. Enter a recipient address.
3. Enter an amount in XLM.
4. Click Send XLM.
5. Review the success state and transaction hash.

## Screenshots

A preview of the dashboard is available at [public/screenshots/dashboard-preview.svg](public/screenshots/dashboard-preview.svg).

## Deployment Instructions

This project is ready for Vercel deployment.

```bash
npm run build
```

Then deploy the generated Vite build to Vercel.

## GitHub Repository Structure

Keep the project structure above, with the app entry in [src/App.jsx](src/App.jsx) and wallet logic in [src/Services/stellar.js](src/Services/stellar.js).

