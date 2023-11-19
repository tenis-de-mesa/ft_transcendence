import { useContext } from "react";
import { Typography } from "../components/Typography";
import { AuthContext } from "../contexts";
import { Link } from "react-router-dom";
import { Alert, Button, Card } from "../components";
import { useLocation } from "react-router-dom";

type AlertSeverity = "primary" | "success" | "info" | "warning" | "error";
type SettingsState = {
  [key in AlertSeverity]?: string;
};

const Settings = () => {
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();
  const state = location.state as SettingsState;
  const tfaEnabled = currentUser.tfaEnabled;

  return (
    <div>
      <Typography variant="h4" className="mb-10">
        Settings
      </Typography>

      {state &&
        (Object.keys(state) as Array<keyof SettingsState>).map((severity) => (
          <Alert className="w-full mb-3" severity={severity}>
            {state[severity]}
          </Alert>
        ))}
      <Card>
        <Card.Title>
          <div className="flex items-center justify-between">
            <Typography variant="h6">Two Factor Authentication</Typography>
            {tfaEnabled ? (
              <span className="flex items-center text-success-500 ">
                enabled
              </span>
            ) : (
              <span className="flex items-center gap-1 text-error-500 ">
                <div className="w-2 h-2 rounded-full bg-error-500"></div>
                disabled
              </span>
            )}
          </div>
        </Card.Title>
        <Card.Body position="center">
          {tfaEnabled ? (
            <div className="flex justify-center gap-2">
              <Link to="/tfa/disable">
                <Button variant="info" size="sm">
                  Disable
                </Button>
              </Link>
              <Link to="/tfa/regenerate">
                <Button variant="info" size="sm">
                  Reset recovery codes
                </Button>
              </Link>
            </div>
          ) : (
            <Link to="/tfa/enable" className="inline-block">
              <Button variant="info" size="sm">
                Enable
              </Button>
            </Link>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Settings;
