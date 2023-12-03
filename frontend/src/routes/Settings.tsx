import { useContext } from "react";
import { Typography } from "../components/Typography";
import { AuthContext } from "../contexts";
import { Link } from "react-router-dom";
import { Button, Card, StateAlerts } from "../components";

const Settings = () => {
  const { currentUser } = useContext(AuthContext);

  const tfaEnabled = currentUser.tfaEnabled;

  return (
    <div>
      <Typography variant="h5">Settings</Typography>

      <StateAlerts />

      <div className="center">
        <Card className="w-2/6">
          <Card.Title>
            <div className="flex items-baseline justify-between">
              <Typography variant="h6">
                Two Factor Authentication (2FA)
              </Typography>
              {tfaEnabled ? (
                <Typography variant="md">
                  <span className="text-success-500 ">ENABLED</span>
                </Typography>
              ) : (
                <Typography variant="md">
                  <span className="text-error-500 ">DISABLED</span>
                </Typography>
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
                <Link to="/tfa/regenerate-codes">
                  <Button
                    variant="info"
                    size="sm"
                    className="flex justify-center w-full mb-3"
                  >
                    Reset recovery codes
                  </Button>
                </Link>
              </div>
            ) : (
              <Link to="/tfa/enable">
                <Button
                  variant="info"
                  size="sm"
                  className="flex justify-center w-full mb-3"
                >
                  Enable
                </Button>
              </Link>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
