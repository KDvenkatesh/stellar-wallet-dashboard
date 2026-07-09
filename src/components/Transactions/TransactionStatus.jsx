const TransactionStatus = ({ txStatus }) => {
  if (!txStatus?.message) {
    return null;
  }

  const styles = {
    success: {
      background: "#ecfdf3",
      color: "#047857",
      border: "1px solid #a7f3d0",
    },
    error: {
      background: "#fef2f2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
    },
    info: {
      background: "#eff6ff",
      color: "#1d4ed8",
      border: "1px solid #bfdbfe",
    },
  };

  const style = styles[txStatus.type] || styles.info;

  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "14px",
        marginTop: "8px",
        fontSize: "0.95rem",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700 }}>
        {txStatus.type === "success" ? "✅ Payment Successful" : txStatus.type === "error" ? "⚠️ Error" : "ℹ️ Status"}
      </div>
      <div style={{ marginTop: "8px" }}>{txStatus.message}</div>
      {txStatus.hash ? (
        <div style={{ marginTop: "10px", wordBreak: "break-all" }}>
          <strong>Transaction Hash:</strong> {txStatus.hash}
        </div>
      ) : null}
      {txStatus.type === "success" && txStatus.hash ? (
        <a
          href={`https://stellar.expert/explorer/testnet/tx/${txStatus.hash}`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",
            marginTop: "12px",
            fontWeight: 700,
            color: "#2563eb",
            textDecoration: "none",
          }}
        >
          View on Stellar Expert →
        </a>
      ) : null}
    </div>
  );
};

export default TransactionStatus;