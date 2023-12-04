import { Link } from "react-router-dom";
import { Alert, Button, Card, Typography } from "..";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../contexts";

export interface RecoveryCodesProps {
  recoveryCodes: string[];
  message: string;
}

export const RecoveryCodes = ({
  recoveryCodes,
  message,
}: RecoveryCodesProps) => {
  const { currentUser, setCurrentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser && !currentUser.tfaEnabled) {
      setCurrentUser({
        ...currentUser,
        tfaEnabled: true,
      });
    }
  }, [currentUser, setCurrentUser]);

  return (
    <div className="h-full grid justify-center items-center">
      <div className="max-w-md">
        <Alert severity="success" className="w-full mb-2">
          {message}
        </Alert>
        <Card>
          <Card.Title>
            <Typography variant="h6">Two Factor Authentication</Typography>
          </Card.Title>
          <Card.Body position="left">
            <Typography variant="md">
              These are recovery codes in case you lose access to your
              authentication app:
            </Typography>
            <Typography variant="md" className="list-disc list-inside">
              {recoveryCodes.map((code) => (
                <li key={code}>{code}</li>
              ))}
            </Typography>
            <Typography variant="md" customWeight="bold" className="mt-4">
              Store them safely, as they won't be displayed again.
            </Typography>
            <div className="flex justify-center mt-4">
              <Link to="/settings">
                <Button variant="info" className="px-10">
                  Return to settings
                </Button>
              </Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};
