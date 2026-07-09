const SendTransaction = ({
  recipient,
  setRecipient,
  amount,
  setAmount,
  handleSend,
  isSubmitting,
}) => {
  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <label style={{ display: "grid", gap: "8px", fontWeight: 600, color: "#0f172a" }}>
        Recipient Address
        <input
          type="text"
          placeholder="G..."
          value={recipient}
          onChange={(event) => setRecipient(event.target.value)}
          disabled={isSubmitting}
          style={{ ...inputStyle, opacity: isSubmitting ? 0.7 : 1 }}
        />
      </label>

      <label style={{ display: "grid", gap: "8px", fontWeight: 600, color: "#0f172a" }}>
        Amount (XLM)
        <input
          type="number"
          min="0.0000001"
          step="0.0000001"
          placeholder="1.5"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          disabled={isSubmitting}
          style={{ ...inputStyle, opacity: isSubmitting ? 0.7 : 1 }}
        />
      </label>

      <button
        onClick={handleSend}
        disabled={isSubmitting}
        style={{
          ...buttonStyle,
          opacity: isSubmitting ? 0.7 : 1,
          cursor: isSubmitting ? "wait" : "pointer",
        }}
      >
        {isSubmitting ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <span style={spinnerStyle} />
            Sending...
          </span>
        ) : (
          "Send XLM"
        )}
      </button>

      <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
        Payments are sent on Stellar Testnet through Freighter.
      </p>
    </div>
  );
};

const inputStyle = {
  border: "1px solid #dbe2f0",
  borderRadius: "10px",
  padding: "12px 14px",
  fontSize: "1rem",
  outline: "none",
  backgroundColor: "#fff",
};

const buttonStyle = {
  border: "none",
  borderRadius: "10px",
  padding: "12px 16px",
  fontSize: "1rem",
  fontWeight: 700,
  color: "#fff",
  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
};

const spinnerStyle = {
  width: "14px",
  height: "14px",
  border: "2px solid rgba(255,255,255,0.4)",
  borderTopColor: "#fff",
  borderRadius: "50%",
  display: "inline-block",
  animation: "spin 0.8s linear infinite",
};

export default SendTransaction;