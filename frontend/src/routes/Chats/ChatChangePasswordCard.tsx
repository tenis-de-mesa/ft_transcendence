import { ChangeEvent, useContext, useEffect, useState } from "react";
import { useFetcher } from "react-router-dom";
import { FiX } from "react-icons/fi";

import {
  Card,
  Typography,
  Button,
  Input,
  Hr,
  Alert,
  Overlay,
} from "../../components";
import ChatContext from "../../contexts/ChatContext";

const emptyForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

type ChatChangePasswordCardProps = {
  handleClose: () => void;
};

export default function ChatChangePasswordCard({
  handleClose,
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

  // Add event listener to close change password dialog when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Element;

      if (!target.closest("#change-password-card")) {
        setPasswordForm(emptyForm);
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [handleClose]);

  return (
    <>
      <Overlay />

      <Card
        id="change-password-card"
        className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/3 left-1/2 z-[1001] min-w-[27rem] dark:bg-gray-900"
      >
        <Card.Title className="flex items-center justify-between">
          <Typography variant="h6" customWeight="bold">
            Change channel password
          </Typography>
          <Button
            IconOnly={<FiX />}
            size="md"
            variant="info"
            onClick={handleClose}
          />
        </Card.Title>
        <Card.Body>
          <Form
            className="flex flex-col gap-3 text-left"
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
              formAction={
                currentChat.access === "protected"
                  ? "change-password"
                  : "set-password"
              }
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
                  formAction={"remove-password"}
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
