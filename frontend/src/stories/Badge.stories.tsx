import { Meta } from "@storybook/react";
import { FiStar, FiArrowRight } from "react-icons/fi";
import { Badge, BadgeProps } from "../components/Badge";
import StoryLayout from "./StoryLayout";
import { images } from "../data/images";

const meta: Meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "radio",
      options: ["primary", "success", "info", "warning", "error", "gray"],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;

interface Props extends BadgeProps {
  darkMode: boolean;
}

const StoryBadge = (args: Props) => (
  <StoryLayout {...args} className="inline-flex flex-col space-y-2">
    <Badge {...args} LeadingIcon={<FiStar />}>
      Label
    </Badge>

    <Badge {...args} LeadingIcon={<img src={images.US} className="w-4 h-4" />}>
      Label
    </Badge>

    <Badge {...args} TrailingIcon={<FiArrowRight />}>
      Label
    </Badge>
  </StoryLayout>
);

export const Default = StoryBadge.bind({});

Default.args = {
  darkMode: false,
  variant: "primary",
  size: "md",
};

Default.parameters = {
  controls: {
    exclude: ["LeadingIcon", "TrailingIcon", "className"],
  },
};
