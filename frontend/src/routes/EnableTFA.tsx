import { useState } from "react";
import { useFetcher, useLoaderData } from "react-router-dom";
import { Alert, Button, Card, Input, Typography } from "../components";
import { FiLock } from "react-icons/fi";
import { RecoveryCodes } from "../components/tfa/RecoveryCodes";

type EnableTfaLoaderData = {
  secret: string;
  qrCode: string;
};

const EnableTFA = () => {
  const fetcher = useFetcher();
  const { secret, qrCode } = useLoaderData() as EnableTfaLoaderData;
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
            <Typography variant="h6">Two Factor Authentication</Typography>
          </Card.Title>
          <Card.Body className="!px-10 pb-5">
            <div className="inline-block">
              <img
                src={`data:image/png;base64,${qrCode}`}
                alt="QR Code"
                style={{}}
              />
            </div>
            <Typography variant="md" className="text-left mb-4">
              Use your authentication app to scan the QR code above, or enter
              the code manually:
              <strong>
                <code> {secret}</code>
              </strong>
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
                <Button
                  variant="primary"
                  type="submit"
                  className="flex justify-center w-full mb-3"
                >
                  Enable
                </Button>
              </div>
            </fetcher.Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default EnableTFA;
