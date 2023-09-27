import React from "react";
import { Meta } from "@storybook/react";
import { FiStar, FiArrowRight } from "react-icons/fi";
import { Button, ButtonProps } from "../components/Button";
import StoryLayout from "./StoryLayout";

const meta: Meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
};

export default meta;

interface Props extends ButtonProps {
  darkMode: boolean;
}

const StoryButton = (args: Props) => (
  <StoryLayout {...args} className="space-y-2">
    <Button {...args}>Button</Button>
    <Button {...args} LeadingIcon={<FiStar />}>
      Button
    </Button>
    <Button {...args} TrailingIcon={<FiArrowRight />}>
      Button
    </Button>
    <Button {...args} IconOnly={<FiArrowRight />} />
  </StoryLayout>
);

export const Default = StoryButton.bind({});

Default.args = {
  darkMode: false,
  variant: "primary",
  size: "md",
  disabled: false,
};

Default.parameters = {
  controls: {
    exclude: ["LeadingIcon", "TrailingIcon", "IconOnly"],
  },
};
