import Home from "./home";
import { Link, useLoaderData, useOutlet } from "react-router-dom";
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
        <Link to={"/users"}>
          Users
        </Link>
        {user && <NavLink to={"logout"}>Sair</NavLink>}
        {!user && <NavLink to={"login"}>Entrar</NavLink>}
      </header>
      {outlet || <Home user={user} />}
    </>
  );
}
