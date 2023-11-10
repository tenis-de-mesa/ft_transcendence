import { ChangeEvent, FormEvent, useContext, useEffect, useState } from "react";
import { Form, useRevalidator } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { Chat } from "../../types";
import { makeRequest } from "../../api";
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

type AlertHiddenState = {
  status: "hidden";
};

type AlertErrorState = {
  status: "error";
  message: string;
};

type AlertSuccessState = {
  status: "success";
  message: string;
};

type AlertState = AlertHiddenState | AlertErrorState | AlertSuccessState;

type ChatChangePasswordCardProps = {
  handleClose: () => void;
};

export default function ChatChangePasswordCard({
  handleClose,
}: ChatChangePasswordCardProps) {
  const { currentChat } = useContext(ChatContext);

  // TODO: Remove
  const revalidator = useRevalidator();

  const [alert, setAlert] = useState<AlertState>({
    status: "hidden",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const { currentPassword, newPassword, confirmPassword } = passwordForm;

  const disableChange =
    newPassword.length === 0 ||
    confirmPassword.length === 0 ||
    newPassword !== confirmPassword ||
    (currentPassword.length === 0 && currentChat.access === "protected");

  const disableRemove = currentPassword.length === 0;

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;

    setPasswordForm({
      ...passwordForm,
      [name]: value,
    });

    setAlert({
      status: "hidden",
    });
  };

  const handleSubmit = async (
    e: FormEvent<HTMLButtonElement>,
    body: string
  ) => {
    e.preventDefault();

    const { error } = await makeRequest(
      `/chats/${currentChat.id}/change-password`,
      {
        method: "POST",
        body,
      }
    );

    if (error) {
      return setAlert({
        status: "error",
        message: error.message,
      });
    }

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setAlert({
      status: "success",
      message:
        currentPassword && newPassword && confirmPassword
          ? "Password changed successfully"
          : currentPassword
          ? "Password removed successfully"
          : "Password set successfully",
    });

    // TODO: Find better solution
    revalidator.revalidate();
  };

  const handleRemovePassword = async (e: FormEvent<HTMLButtonElement>) => {
    handleSubmit(
      e,
      JSON.stringify({
        currentPassword,
      })
    );
  };

  const handleChangePassword = async (e: FormEvent<HTMLButtonElement>) => {
    handleSubmit(
      e,
      JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword,
      })
    );
  };

  // Add event listener to close change password dialog when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Element;

      if (!target.closest("#change-password-card")) {
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setAlert({
          status: "hidden",
        });

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
          <Form className="flex flex-col gap-3 text-left">
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
              onClick={handleChangePassword}
            >
              Change password
            </Button>

            {currentChat.access === "protected" && (
              <>
                <Hr text="Or" />

                <Button
                  className="font-bold justify-center"
                  variant="error"
                  type="submit"
                  disabled={disableRemove}
                  onClick={handleRemovePassword}
                >
                  Remove password (make channel public)
                </Button>
              </>
            )}

            {alert.status !== "hidden" && (
              <Alert
                className="w-full"
                severity={alert.status}
                variant="filled"
              >
                {alert.message}
              </Alert>
            )}
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}
