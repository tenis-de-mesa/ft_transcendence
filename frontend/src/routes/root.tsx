import { Link, useLoaderData, useOutlet } from "react-router-dom";
import Home from "./home";

export default function Root() {
  const outlet = useOutlet();
  const user = useLoaderData() as { id: number; login: string };

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
        {user && <span>{user.login}</span>}
        {user && (
          <Link to={"logout"} role="button">
            Sair
          </Link>
        )}
        {!user && (
          <Link to={"login"} role="button">
            Login
          </Link>
        )}
      </header>
      <div className="container">{outlet || <Home user={user} />}</div>
    </>
  );
}
