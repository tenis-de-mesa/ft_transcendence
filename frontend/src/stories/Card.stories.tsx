import { Meta } from "@storybook/react";

import StoryLayout from "./StoryLayout";
import { Card } from "../components/Card";
import { Typography } from "../components/Typography";

const meta: Meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    position: {
      control: "inline-radio",
      options: ["left", "center", "right"],
    },
  },
};

export default meta;

interface Props {
  darkMode: boolean;
}

const StoryCard = (args: Props) => (
  <StoryLayout {...args} className="w-1/2 m-auto space-y-8">
    <Card {...args}>
      <Card.Title {...args}>
        <Typography variant="h6">Title</Typography>
      </Card.Title>
      <Card.Body {...args}>
        <Typography variant="sm">
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsam quidem
          eaque est? Est laborum vel eius iusto blanditiis pariatur. Quam
          dolorem laborum placeat voluptatibus illum dolores error eius
          inventore corrupti. Lorem ipsum dolor sit amet consectetur adipisicing
          elit. Numquam, maiores dolor iure nobis minima libero omnis mollitia
          fuga perspiciatis, est eius! Perspiciatis natus possimus repellendus
          voluptates est inventore saepe quam, officia odio praesentium.
          Quibusdam, inventore sed nulla doloremque tenetur beatae.
        </Typography>
      </Card.Body>
      <Card.Footer {...args}>
        <Typography variant="lg">Footer</Typography>
      </Card.Footer>
    </Card>
  </StoryLayout>
);

export const Default = StoryCard.bind({});

Default.args = {
  darkMode: false,
  position: "center",
  className: "",
};

Default.parameters = {
  controls: {
    exclude: [],
  },
};
