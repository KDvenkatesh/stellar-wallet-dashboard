import { useState } from "react";
import { connectWallet, getBalance, sendPayment } from "../../Services/stellar";
import SendTransaction from "../Transactions/SendTransaction.jsx";
import TransactionStatus from "../Transactions/TransactionStatus.jsx";

const WalletConnect = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txStatus, setTxStatus] = useState({ type: "info", message: "", hash: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const address = await connectWallet();
      setWalletAddress(address);
      setTxStatus({ type: "success", message: "Wallet connected successfully.", hash: "" });

      const walletBalance = await getBalance(address);
      setBalance(walletBalance);
    } catch (error) {
      console.error(error);
      setTxStatus({ type: "error", message: error.message || "Please connect your wallet.", hash: "" });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWalletAddress("");
    setBalance("");
    setRecipient("");
    setAmount("");
    setTxStatus({ type: "info", message: "Wallet disconnected.", hash: "" });
  };

  const shortenAddress = (address = "") =>
    `${address.slice(0, 6)}...${address.slice(-5)}`;

  const refreshBalance = async (address) => {
    const walletBalance = await getBalance(address);
    setBalance(walletBalance);
  };

  const handleSend = async () => {
    if (!walletAddress) {
      setTxStatus({ type: "error", message: "Please connect your wallet.", hash: "" });
      return;
    }

    try {
      setIsSubmitting(true);
      setTxStatus({ type: "info", message: "Preparing your payment request...", hash: "" });

      const result = await sendPayment({
        sourceAddress: walletAddress,
        recipient,
        amount,
      });

      await refreshBalance(walletAddress);
      setRecipient("");
      setAmount("");
      setTxStatus({
        type: "success",
        message: "Payment successful. Your balance has been refreshed.",
        hash: result.hash,
      });
    } catch (error) {
      console.error(error);
      setTxStatus({
        type: "error",
        message: error.message || "Something went wrong. Please try again.",
        hash: "",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div>
            <p style={eyebrowStyle}>Wallet Dashboard</p>
            <h2 style={titleStyle}>Manage your Stellar Testnet funds</h2>
          </div>
          <button
            onClick={walletAddress ? handleDisconnect : handleConnect}
            disabled={isConnecting}
            style={{ ...primaryButtonStyle, opacity: isConnecting ? 0.7 : 1 }}
          >
            {isConnecting ? "Connecting..." : walletAddress ? "Disconnect" : "Connect Wallet"}
          </button>
        </div>

        <div style={statusGridStyle}>
          <div style={infoCardStyle}>
            <p style={cardLabelStyle}>Wallet Status</p>
            <p style={valueStyle}>{walletAddress ? "Connected" : "Disconnected"}</p>
          </div>
          <div style={infoCardStyle}>
            <p style={cardLabelStyle}>Wallet Address</p>
            <p style={valueStyle}>{walletAddress ? shortenAddress(walletAddress) : "—"}</p>
          </div>
          <div style={infoCardStyle}>
            <p style={cardLabelStyle}>Balance</p>
            <p style={valueStyle}>{balance ? `${balance} XLM` : "0 XLM"}</p>
          </div>
        </div>

        {!walletAddress ? (
          <div style={emptyStateStyle}>
            <h3 style={{ margin: "0 0 8px" }}>Connect Freighter to begin</h3>
            <p style={{ margin: 0, color: "#64748b" }}>
              Use the button above to connect your Freighter wallet on Stellar Testnet.
            </p>
          </div>
        ) : (
          <div style={panelStyle}>
            <div style={{ display: "grid", gap: "8px" }}>
              <h3 style={{ margin: 0 }}>Send XLM</h3>
              <p style={{ margin: 0, color: "#64748b" }}>
                Enter a recipient address and amount to start a Stellar payment.
              </p>
            </div>

            <SendTransaction
              recipient={recipient}
              setRecipient={setRecipient}
              amount={amount}
              setAmount={setAmount}
              handleSend={handleSend}
              isSubmitting={isSubmitting}
            />

            <TransactionStatus txStatus={txStatus} />
          </div>
        )}
      </div>
    </div>
  );
};

const pageStyle = {
  minHeight: "100vh",
  padding: "24px",
  background: "linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)",
  fontFamily: "Inter, system-ui, sans-serif",
};

const cardStyle = {
  maxWidth: "960px",
  margin: "0 auto",
  background: "#fff",
  borderRadius: "24px",
  boxShadow: "0 20px 45px rgba(15, 23, 42, 0.09)",
  padding: "24px",
  display: "grid",
  gap: "20px",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
};

const eyebrowStyle = {
  margin: 0,
  fontSize: "0.8rem",
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "#2563eb",
};

const titleStyle = {
  margin: "4px 0 0",
  fontSize: "1.6rem",
  color: "#0f172a",
};

const primaryButtonStyle = {
  border: "none",
  borderRadius: "999px",
  padding: "10px 16px",
  fontWeight: 700,
  color: "#fff",
  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
  cursor: "pointer",
};

const statusGridStyle = {
  display: "grid",
  gap: "12px",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
};

const infoCardStyle = {
  borderRadius: "16px",
  padding: "16px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const cardLabelStyle = {
  margin: 0,
  color: "#64748b",
  fontSize: "0.9rem",
};

const valueStyle = {
  margin: "6px 0 0",
  fontWeight: 700,
  fontSize: "1rem",
  color: "#0f172a",
};

const emptyStateStyle = {
  borderRadius: "18px",
  padding: "24px",
  background: "linear-gradient(135deg, #f8fbff, #eef4ff)",
  border: "1px dashed #bfdbfe",
  textAlign: "center",
};

const panelStyle = {
  borderRadius: "18px",
  padding: "20px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  display: "grid",
  gap: "16px",
};

export default WalletConnect;