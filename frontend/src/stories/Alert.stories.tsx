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
  {/* TODO: Better solution than <br/> */}

    <Alert {...args} severity="primary">
      Standard
    </Alert>

    <br />

    <Alert {...args} severity="success">
      Success
    </Alert>

    <br />

    <Alert {...args} severity="info">
      Info
    </Alert>

    <br />

    <Alert {...args} severity="warning">
      Warning
    </Alert>

    <br />

    <Alert {...args} severity="error">
      Error
    </Alert>

    <br />

    <Alert {...args}>Default</Alert>

    <br />

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
