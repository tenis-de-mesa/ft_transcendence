import { Link, useLoaderData, useOutlet } from "react-router-dom";

export async function loader() {
  const bearer = document.cookie.replace(
    /(?:(?:^|.*;\s*)Bearer\s*\=\s*([^;]*).*$)|^.*$/,
    "$1",
  );
  if (!bearer) return ({user: null});
  const response = await fetch(`${process.env.BACKEND_HOSTNAME}/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearer}`,
    },
  }).then((res) => res.json());
  return ({user: response.intra_login});
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
        {user && <Link to={"logout"} role="button">Sair</Link>}
        {!user && <Link to={"login"} role="button">Login</Link>}
      </header>
      <div className="container">
        {outlet || <Welcome name={user} />}
      </div>
    </>
  );
}

function Welcome({ name }: { name?: string }) {
  const containerStyle: React.CSSProperties = {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  };

  return (
    <div style={containerStyle}>
      <div>
      <h1>ft_transcendence!</h1>
      {name && <p>Welcome, {name}</p>}
      </div>
    </div>
  );
}
