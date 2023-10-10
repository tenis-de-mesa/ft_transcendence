import { Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  return (
    <div className="main-content closed">
      <div className="login">
        <center>
          <h2>PONG</h2>
        </center>
        <div className="card">
          <Link to={"/login/intra"}>Login using intra</Link>
          <hr />
          <Link to={"/login/guest"}>Login as guest</Link>
        </div>
      </div>
    </div>
  );
}
