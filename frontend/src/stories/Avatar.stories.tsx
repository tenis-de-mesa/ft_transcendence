import { Meta } from "@storybook/react";

import StoryLayout from "./StoryLayout";
import { Avatar, AvatarProps } from "../components/Avatar";
import { images } from "../data/images";

const meta: Meta = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg", "xl"],
    },
  },
};

export default meta;

interface Props extends AvatarProps {
  darkMode: boolean;
}

const StoryAvatar = (args: Props) => (
  <StoryLayout {...args} className="space-y-8">
    <Avatar {...args} />
    <Avatar {...args} src={images.demoAvatar} />
    <Avatar {...args} src="https://t4.ftcdn.net/jpg/02/66/72/41/360_F_266724172_Iy8gdKgMa7XmrhYYxLCxyhx6J7070Pr8.jpg" />
    <Avatar 
      {...args}
      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3jeX370h0OcVaRn7sWqN_x9sgYe2iAyNJgw&usqp=CAU" 
      className="p-0.5 !bg-transparent border-2 border-success-500"
    />
  </StoryLayout>
);

export const Default = StoryAvatar.bind({});

Default.args = {
  darkMode: false,
  className: "",
  seed: "Default",
  src: "",
  size: "md",
};

Default.parameters = {
  controls: {
    exclude: [],
  },
};
