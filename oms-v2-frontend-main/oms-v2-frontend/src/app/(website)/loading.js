export default function WebsiteLoading() {
  return (
    <div
      aria-hidden
      style={{ minHeight: "40vh", padding: "48px 20px" }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div
          style={{
            height: 12,
            width: 96,
            borderRadius: 6,
            background: "#F0F1F3",
          }}
        />
        <div
          style={{
            height: 32,
            width: "70%",
            maxWidth: 420,
            marginTop: 16,
            borderRadius: 8,
            background: "#F0F1F3",
          }}
        />
        <div
          style={{
            height: 14,
            width: "100%",
            marginTop: 18,
            borderRadius: 6,
            background: "#F7F8FA",
          }}
        />
        <div
          style={{
            height: 14,
            width: "86%",
            marginTop: 10,
            borderRadius: 6,
            background: "#F7F8FA",
          }}
        />
      </div>
    </div>
  );
}
