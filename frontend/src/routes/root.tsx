import { Link, useLoaderData, useOutlet } from "react-router-dom";

export async function loader() {
  const response: Response = await fetch(`${process.env.BACKEND_HOSTNAME}/users/me`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.ok) {
    const data = await response.json();
    return { user: data.login };
  } else {
    return { user: null };
  }
}

export default function Root() {
  const outlet = useOutlet();
  const { user } = useLoaderData() as { user: string };

  const headerStyle: React.CSSProperties = {
    backgroundColor: "#a161d1",
    color: "white",
    padding: "20px",
    textAlign: "center",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "2em",
  };
  return (
    <>
      <header style={headerStyle}>
        <Link to={"/"}>🐱 🐱 🐱</Link>
        {user && <span>{user}</span>}
        {user && <Link to={"logout"} role="button">Sair</Link>}
        {!user && <Link to={"login"} role="button">Login</Link>}
      </header>
      <div className="container">
        {outlet || <Home name={user} />}
      </div>
    </>
  );
}

function Home({ name }: { name?: string }) {
  const containerStyle: React.CSSProperties = {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100%",
  };

  return (
    <div style={containerStyle}>
      <h1>ft_transcendence {name ? "🔓" : "🔐"}</h1>
    </div>
  );
}
