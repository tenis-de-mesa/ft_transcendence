import React from "react";
import { Meta } from "@storybook/react";
import StoryLayout from "./StoryLayout";
import { Input, InputProps } from "../components/Input";
import { FiAlertCircle, FiHelpCircle, FiMail } from "react-icons/fi";

const meta: Meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
};

export default meta;

interface Props extends InputProps {
  darkMode: boolean;
}

const StoryInput = (args: Props) => {
  const [text1, setText1] = React.useState<string>(args.value);

  const handleChange = (value: string) => {
    setText1(value);
  };

  return (
    <StoryLayout {...args} className="flex space-x-8">
      <div>
        <Input
          type="text"
          value={text1}
          handleChange={handleChange}
          label="Username"
          placeholder="Frosa-ma"
          disabled={args.disabled}
        />
        <div className="mb-11" />
        <Input
          type="password"
          value={text1}
          handleChange={handleChange}
          label="Password"
          placeholder=""
          disabled={args.disabled}
        />
      </div>
      <div>
        <Input
          type="email"
          value={text1}
          handleChange={handleChange}
          label="Email"
          placeholder="veronica@example.com"
          helperText="This is a hint text to help the user."
          LeadingIcon={<FiMail />}
          TrailingIcon={<FiHelpCircle />}
          disabled={args.disabled}
        />
        <div className="mb-4" />
        <Input
          type="email"
          value={text1}
          handleChange={handleChange}
          label="Email"
          placeholder="veronica@example.com"
          error="This is an error message."
          LeadingIcon={<FiMail />}
          TrailingIcon={<FiAlertCircle />}
          disabled={args.disabled}
        />
      </div>
      <div>
        <Input
          type="text"
          value={text1}
          handleChange={handleChange}
          label="Website"
          placeholder="example.com"
          leadingText="https://"
          helperText="This is a hint text to help the user."
          TrailingIcon={<FiHelpCircle />}
          disabled={args.disabled}
        />
        <div className="mb-4" />
        <Input
          type="text"
          value={text1}
          handleChange={handleChange}
          label="Website"
          placeholder="example.com"
          leadingText="https://"
          error="This is an error message."
          TrailingIcon={<FiAlertCircle />}
          disabled={args.disabled}
        />
      </div>
    </StoryLayout>
  );
};

export const Default = StoryInput.bind({});

Default.args = {
  darkMode: false,
  disabled: false,
};

Default.parameters = {
  controls: {
    exclude: [
      "value",
      "type",
      "handleChange",
      "label",
      "leadingText",
      "placeholder",
      "error",
      "helperText",
      "LeadingIcon",
      "TrailingIcon",
    ],
  },
};
