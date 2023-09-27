import type { Meta } from '@storybook/react';

import { ColorBox } from './ColorBox';
import React from 'react';

import { colors } from "../data/colors"
import StoryLayout from "./StoryLayout"

const meta = {
  title: 'Styles/Colors',
  component: ColorBox,
} satisfies Meta<typeof ColorBox>;

export default meta;

interface Props {
  darkMode: boolean
}

const ColorsBox = (args: Props) => (
  <StoryLayout {...args} className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11">
    {colors.map(color => <ColorBox color={color} />)}
  </StoryLayout>
);

export const Colors = ColorsBox.bind({});

Colors.args = {
  darkMode: false
}

Colors.parameters = {
  controls: {
    exclude: ["color"]
  },
};
