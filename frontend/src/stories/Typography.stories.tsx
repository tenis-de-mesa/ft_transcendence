import type { Meta } from "@storybook/react";

import React from "react";

import StoryLayout from "./StoryLayout";
import { Typography, TypographyProps } from "../components/Typography";

const meta = {
  title: "Styles/Typography",
  component: Typography,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "xl",
        "lg",
        "md",
        "sm",
        "xs",
      ],
    },
    customWeight: {
      control: "inline-radio",
      options: ["light", "regular", "medium", "semibold", "bold"],
    },
    className: {
      control: "text",
    },
  },
} satisfies Meta<typeof Typography>;

export default meta;

interface Props extends TypographyProps {
  darkMode: boolean;
}

const TypographyHeadings = (args: Props) => {
  return (
    <StoryLayout {...args} className="space-y-2">
      <Typography {...args} variant="h1">
        Display h1
      </Typography>
      <Typography {...args} variant="h2">
        Display h2
      </Typography>
      <Typography {...args} variant="h3">
        Display h3
      </Typography>
      <Typography {...args} variant="h4">
        Display h4
      </Typography>
      <Typography {...args} variant="h5">
        Display h5
      </Typography>
      <Typography {...args} variant="h6">
        Display h6
      </Typography>
    </StoryLayout>
  );
};

export const Heading = TypographyHeadings.bind({});

Heading.args = {
  darkMode: false,
  customWeight: "regular",
};

Heading.parameters = {
  controls: {
    exclude: ["as", "variant", "customColor", "className"],
  },
};

const TypographyText = (args: Props) => {
  return (
    <StoryLayout {...args} className="space-y-2">
      <Typography {...args} variant="xl">
        Text xl
      </Typography>
      <Typography {...args} variant="lg">
        Text lg
      </Typography>
      <Typography {...args} variant="md">
        Text md
      </Typography>
      <Typography {...args} variant="sm">
        Text sm
      </Typography>
      <Typography {...args} variant="xs">
        Text xs
      </Typography>
    </StoryLayout>
  );
};

export const Text = TypographyText.bind({});

Text.args = {
  darkMode: false,
  customWeight: "regular",
};

Text.parameters = {
  controls: {
    exclude: ["as", "variant", "customColor", "className"],
  },
};

const TypographyDynamic = (args: Props) => {
  const isHeading = args.variant.startsWith("h");

  return (
    <StoryLayout {...args} className="space-y-2">
      <Typography {...args}>
        {isHeading ? "Display" : "Text"} {args.variant}
        <br />
        {args.customWeight}
      </Typography>
    </StoryLayout>
  );
};
export const Dynamic = TypographyDynamic.bind({});

Dynamic.args = {
  darkMode: false,
  variant: "h1",
  customWeight: "regular",
  className: "",
  customColor: "",
};

Dynamic.parameters = {
  controls: {
    exclude: ["as"],
  },
};

const TypographyLabel = (args: Props) => {
  return (
    <StoryLayout {...args} className="space-y-2">
      <Typography {...args}>Label 1</Typography>
      <Typography {...args}>Label 2</Typography>
      <Typography {...args}>Label 3</Typography>
    </StoryLayout>
  );
};
export const Label = TypographyLabel.bind({});

Label.args = {
  darkMode: false,
  variant: "h1",
  customWeight: "regular",
  as: "label",
};

Label.parameters = {
  controls: {
    exclude: ["as", "variant", "customColor", "className"],
  },
};
