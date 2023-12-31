import { useContext, useEffect, useState } from "react";
import { useFetcher } from "react-router-dom";
import { Alert, Button, Card, Input, Typography } from "../components";
import { FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts";

const DisableTFA = () => {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const [tfaCode, setTfaCode] = useState("");

  useEffect(() => {
    if (fetcher.data?.status === "success") {
      setCurrentUser({
        ...currentUser,
        tfaEnabled: false,
      });
      navigate("/settings", { state: { success: "TFA Disabled" } });
    }
  }, [currentUser, fetcher.data, navigate, setCurrentUser]);

  return (
    <div className="h-full grid justify-center items-center">
      <div className="max-w-md">
        {fetcher.data && fetcher.data.message && (
          <Alert severity={fetcher.data.status} className="w-full mb-2">
            {fetcher.data.message.toString()}
          </Alert>
        )}
        <Card>
          <Card.Title>
            <Typography variant="h6">Two Factor Authentication</Typography>
          </Card.Title>
          <Card.Body className="!px-10 pb-5">
            <Typography variant="md" className="text-left mb-4">
              This action will <strong>remove</strong> two factor authentication
              for your account.
            </Typography>
            <fetcher.Form method="POST">
              <Input
                type="text"
                LeadingIcon={<FiLock />}
                helperText="Enter the code generated by your authentication app"
                placeholder=""
                name="tfaCode"
                value={tfaCode}
                onChange={(e) => setTfaCode(e.target.value)}
                required={true}
              />
              <div className="flex justify-center mt-4">
                <Button variant="primary" type="submit" className="px-10">
                  Disable
                </Button>
              </div>
            </fetcher.Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default DisableTFA;
