import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="container">
      <div className="card">
        <center>
          <h2>PONG</h2>
        </center>
        <Link to={"login"}>Login using intra</Link>
      </div>
    </div>
  );
}
