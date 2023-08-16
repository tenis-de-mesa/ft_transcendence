export default function Home({
  user,
}: {
  user?: { id: number; login: string };
}) {
  const containerStyle: React.CSSProperties = {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100%",
  };

  return (
    <div style={containerStyle}>
      <h1>ft_transcendence {user ? "🔓" : "🔐"}</h1>
    </div>
  );
}
