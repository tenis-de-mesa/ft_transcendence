import { ChangeEvent, useContext, useState } from "react";
import { useFetcher } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import { ChatContext } from "../../contexts/";
import { Card, Typography, Button, Input, Hr, Alert } from "../../components";

const emptyForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

type ChatChangePasswordCardProps = {
  onBack: () => void;
};

export default function ChatChangePasswordCard({
  onBack,
}: ChatChangePasswordCardProps) {
  const { currentChat } = useContext(ChatContext);
  const { Form, data: result, state } = useFetcher();
  const [passwordForm, setPasswordForm] = useState(emptyForm);
  const { currentPassword, newPassword, confirmPassword } = passwordForm;

  const disableChange =
    newPassword.length === 0 ||
    confirmPassword.length === 0 ||
    newPassword !== confirmPassword ||
    (currentPassword.length === 0 && currentChat.access === "protected");

  const disableRemove = currentPassword.length === 0;

  const handleFormSubmit = () => {
    setPasswordForm(emptyForm);
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;

    setPasswordForm({
      ...passwordForm,
      [name]: value,
    });
  };

  return (
    <>
      <Card
        id="change-password-card"
        className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/3 left-1/2 z-[1001] min-w-[27rem] dark:bg-gray-900"
      >
        <Card.Title className="flex items-center justify-between">
          <Typography variant="h6" customWeight="bold">
            Change channel password
          </Typography>
          <Button
            IconOnly={<FiChevronLeft />}
            size="md"
            variant="info"
            onClick={onBack}
          />
        </Card.Title>
        <Card.Body>
          <Form
            className="flex flex-col gap-3 text-left"
            action={`${currentChat?.id}/manage-password`}
            method="POST"
            onSubmit={handleFormSubmit}
          >
            {currentChat.access === "protected" && (
              <>
                <Input
                  label="Current password"
                  type="password"
                  name="currentPassword"
                  placeholder="Insert current password"
                  helperText="Must be filled to perform any changes to channel password"
                  value={currentPassword}
                  onChange={handleFormChange}
                />

                <Hr />
              </>
            )}

            <Input
              label="New password"
              type="password"
              name="newPassword"
              placeholder="Insert new password"
              value={newPassword}
              error={newPassword !== confirmPassword}
              onChange={handleFormChange}
            />

            <Input
              value={confirmPassword}
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              error={
                newPassword !== confirmPassword ? "Passwords must match" : false
              }
              onChange={handleFormChange}
            />

            <Button
              className="font-bold justify-center"
              variant="info"
              type="submit"
              disabled={disableChange}
              name="intent"
              value={currentChat?.access === "protected" ? "change" : "set"}
            >
              {state !== "idle"
                ? "Loading..."
                : currentChat.access === "protected"
                  ? "Change password"
                  : "Set password"}
            </Button>

            {currentChat.access === "protected" && (
              <>
                <Hr text="Or" />

                <Button
                  className="font-bold justify-center"
                  variant="error"
                  type="submit"
                  disabled={disableRemove}
                  name="intent"
                  value="remove"
                >
                  {state !== "idle"
                    ? "Loading..."
                    : "Remove password (make channel public)"}
                </Button>
              </>
            )}

            {result && state === "idle" && (
              <Alert
                className="w-full"
                severity={result?.status}
                variant="filled"
              >
                {result?.message}
              </Alert>
            )}
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}
