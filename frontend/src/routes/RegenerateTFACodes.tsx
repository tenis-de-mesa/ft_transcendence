import { useState } from "react";
import { useFetcher } from "react-router-dom";
import { Alert, Button, Card, Input, Typography } from "../components";
import { FiLock } from "react-icons/fi";
import { RecoveryCodes } from "../components/tfa/RecoveryCodes";

const RegenerateTFACodes = () => {
  const fetcher = useFetcher();
  const [tfaCode, setTfaCode] = useState("");

  if (fetcher.data?.status === "success") {
    return (
      <RecoveryCodes
        recoveryCodes={fetcher.data.recoveryCodes}
        message={fetcher.data.message}
      />
    );
  }

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
            <Typography variant="h6">Regenerate recovery codes</Typography>
          </Card.Title>
          <Card.Body className="!px-10 pb-5">
            <Typography variant="md" className="text-left mb-4">
              In case you lost access to your two factor authentication recovery
              codes, you can regenerate them, but this action will
              <strong> invalidate all your previous recovery codes</strong>.
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
                  Regenerate codes
                </Button>
              </div>
            </fetcher.Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default RegenerateTFACodes;
