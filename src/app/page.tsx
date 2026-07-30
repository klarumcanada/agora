export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--sans)",
        color: "var(--midnight)",
      }}
    >
      <p style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gray-500)", marginBottom: "16px" }}>
        Coming soon
      </p>
      <h1 style={{ fontFamily: "var(--serif)", fontSize: "3rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
        Agora
      </h1>
    </main>
  );
}
