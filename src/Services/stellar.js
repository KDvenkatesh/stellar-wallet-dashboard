import {
  isConnected,
  requestAccess,
  getAddress,
  signTransaction,
} from "@stellar/freighter-api";

import {
  Horizon,
  TransactionBuilder,
  Operation,
  Asset,
  Networks,
  StrKey,
  BASE_FEE,
} from "@stellar/stellar-sdk";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");
const networkPassphrase = Networks.TESTNET;

export async function connectWallet() {
  try {
    const connection = await isConnected();

    if (!connection.isConnected) {
      throw new Error("Please connect your wallet.");
    }

    const access = await requestAccess();

    if (access.error) {
      throw new Error("Please connect your wallet.");
    }

    const address = await getAddress();

    if (address.error) {
      throw new Error("Please connect your wallet.");
    }

    return address.address;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function fundAccountWithFriendbot(address) {
  const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`);

  if (!response.ok) {
    throw new Error("The wallet could not be funded on Stellar Testnet.");
  }

  return response.json();
}

async function loadAccountWithFunding(address) {
  try {
    return await server.loadAccount(address);
  } catch (error) {
    const status = error?.response?.status;

    if (status === 404) {
      await fundAccountWithFriendbot(address);
      return server.loadAccount(address);
    }

    throw error;
  }
}

export async function getBalance(address) {
  const account = await loadAccountWithFunding(address);
  const xlm = account.balances.find((asset) => asset.asset_type === "native");

  return xlm ? xlm.balance : "0";
}

function mapPaymentError(error) {
  const message = error?.message || "";
  const normalized = message.toLowerCase();

  if (normalized.includes("recipient address is required")) {
    return "Recipient address is required.";
  }

  if (normalized.includes("invalid stellar") || normalized.includes("address is invalid") || normalized.includes("invalid wallet address")) {
    return "Invalid Stellar wallet address.";
  }

  if (normalized.includes("amount is required") || normalized.includes("please enter an amount")) {
    return "Please enter an amount.";
  }

  if (normalized.includes("greater than zero") || normalized.includes("positive number") || normalized.includes("must be greater than zero")) {
    return "Amount must be greater than zero.";
  }

  if (normalized.includes("insufficient")) {
    return "Insufficient XLM balance.";
  }

  if (normalized.includes("rejected") || normalized.includes("cancel") || normalized.includes("user rejected")) {
    return "Transaction cancelled by user.";
  }

  if (normalized.includes("connect your wallet") || normalized.includes("not connected") || normalized.includes("not installed") || normalized.includes("wallet")) {
    return "Please connect your wallet.";
  }

  if (normalized.includes("network") || normalized.includes("fetch failed") || normalized.includes("failed to fetch")) {
    return "Network error. Please try again.";
  }

  return "Something went wrong. Please try again.";
}

export function validatePaymentInput(recipient, amount) {
  const normalizedRecipient = recipient.trim();

  if (!normalizedRecipient) {
    throw new Error("Recipient address is required.");
  }

  if (!StrKey.isValidEd25519PublicKey(normalizedRecipient)) {
    throw new Error("Invalid Stellar wallet address.");
  }

  const normalizedAmount = `${amount}`.trim();

  if (!normalizedAmount) {
    throw new Error("Please enter an amount.");
  }

  const numericAmount = Number(normalizedAmount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Amount must be greater than zero.");
  }

  return {
    recipient: normalizedRecipient,
    amount: numericAmount.toFixed(7).replace(/\.?0+$/, ""),
  };
}

export async function sendPayment({ sourceAddress, recipient, amount }) {
  try {
    const { recipient: validRecipient, amount: normalizedAmount } = validatePaymentInput(recipient, amount);
    const sourceAccount = await loadAccountWithFunding(sourceAddress);
    const nativeBalance = sourceAccount.balances.find((asset) => asset.asset_type === "native");
    const currentBalance = Number(nativeBalance?.balance || 0);
    const feeAmount = Number(BASE_FEE) / 10000000;

    if (currentBalance < Number(normalizedAmount) + feeAmount) {
      throw new Error("Insufficient XLM balance.");
    }

    const transaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        Operation.payment({
          destination: validRecipient,
          asset: Asset.native(),
          amount: normalizedAmount,
        })
      )
      .setTimeout(60)
      .build();

    const txXdr = transaction.toEnvelope().toXDR("base64");
    const signedResponse = await signTransaction(txXdr, {
      networkPassphrase,
      address: sourceAddress,
    });

    if (signedResponse.error) {
      throw new Error(signedResponse.error.message || "Transaction signing was rejected.");
    }

    const submissionResponse = await fetch("https://horizon-testnet.stellar.org/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ tx: signedResponse.signedTxXdr }),
    });

    const submissionResult = await submissionResponse.json();
    const isSuccessful = submissionResult?.successful === true || submissionResult?.status === "SUCCESS";

    if (!submissionResponse.ok || !isSuccessful) {
      const resultCode = submissionResult?.extras?.result_codes?.transaction_result_code;
      const operationCode = submissionResult?.extras?.result_codes?.operations?.[0];
      const errorMessage = [resultCode, operationCode].filter(Boolean).join(" / ");

      throw new Error(errorMessage || submissionResult?.detail || "Transaction submission failed.");
    }

    return {
      hash: submissionResult.hash || submissionResult.id,
      status: submissionResult.status || "SUCCESS",
    };
  } catch (error) {
    throw new Error(mapPaymentError(error));
  }
}