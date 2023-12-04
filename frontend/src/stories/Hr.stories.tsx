import { Meta } from "@storybook/react";

import StoryLayout from "./StoryLayout";
import { Hr } from "../components/Hr";

const meta: Meta = {
  title: "Components/Hr",
  component: Hr,
  tags: ["autodocs"],
};

export default meta;

interface Props {
  darkMode: boolean;
  className: string;
}

const StoryHr = (args: Props) => (
  <StoryLayout {...args} className="w-1/2 m-auto space-y-8">
    <Hr className={args.className} />
    <Hr text="Or" className={args.className} />
    <Hr text="Frosa-ma" className={args.className} />
  </StoryLayout>
);

export const Default = StoryHr.bind({});

Default.args = {
  darkMode: false,
  className: "",
};

Default.parameters = {
  controls: {
    exclude: [],
  },
};
