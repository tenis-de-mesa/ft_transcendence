import Home from "./Home";
import { useLoaderData, useOutlet } from "react-router-dom";
import { User } from "../types/types";
import Login from "./Login";
import Header from "./Header";

export default function Root() {
  const outlet = useOutlet();
  const user = useLoaderData() as User;
  if (!user) {
    return <Login />;
  }

  return (
    <>
      <Header user={user}></Header>
      <div className="container">{outlet || <Home user={user} />}</div>
    </>
  );
}
