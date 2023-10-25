import { Meta } from "@storybook/react";
import { FiArrowRight } from "react-icons/fi";
import { Alert, AlertProps } from "../components/Alert";
import StoryLayout from "./StoryLayout";

const meta: Meta = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
};

export default meta;

interface Props extends AlertProps {
  darkMode: boolean;
}

const StoryAlert = (args: Props) => (
  <StoryLayout {...args} className="space-y-2">
    <Alert {...args} severity="primary">
      Standard
    </Alert>

    <Alert {...args} severity="success">
      Success
    </Alert>

    <Alert {...args} severity="info">
      Info
    </Alert>

    <Alert {...args} severity="warning">
      Warning
    </Alert>

    <Alert {...args} severity="error">
      Error
    </Alert>

    <Alert {...args}>Default</Alert>

    <Alert {...args} TrailingIcon={<FiArrowRight />}>
      Trailing Icon
    </Alert>
  </StoryLayout>
);

export const Default = StoryAlert.bind({});

Default.args = {
  darkMode: false,
  severity: "primary",
  variant: "filled",
  size: "md",
  className: "",
};

Default.parameters = {
  controls: {
    exclude: ["TrailingIcon", "LeadingIcon"],
  },
};
