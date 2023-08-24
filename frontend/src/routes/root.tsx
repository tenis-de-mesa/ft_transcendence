import { Link, useLoaderData, useOutlet } from "react-router-dom";
import Home from "./home";
import { NavLink } from "react-router-dom";

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
    fontSize: "1.5em",
  };
  return (
    <>
      <header style={headerStyle}>
        <Link to={"/"} style={{ textDecoration: "none" }}>
          🐱 🐱 🐱
        </Link>
        {user && <span>{user.login}</span>}
        {user && <NavLink to={"logout"}>Sair</NavLink>}
        {!user && <NavLink to={"login"}>Entrar</NavLink>}
      </header>
      <main>{outlet || <Home user={user} />}</main>
    </>
  );
}
