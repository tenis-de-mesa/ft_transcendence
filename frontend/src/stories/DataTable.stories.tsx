import { Meta } from "@storybook/react";

import StoryLayout from "./StoryLayout";
import { DataTable } from "../components/DataTable";
import { tableData } from "../data";

const meta: Meta = {
  title: "Components/DataTable",
  component: DataTable,
  tags: ["autodocs"],
};

export default meta;

interface Props {
  darkMode: boolean;
}

const StoryDataTable = (args: Props) => (
  <StoryLayout {...args} className="inline-flex flex-col space-y-2">
    <DataTable dataset={tableData} />
  </StoryLayout>
);

export const Default = StoryDataTable.bind({});

Default.args = {
  darkMode: false,
};

Default.parameters = {
  controls: {
    exclude: ["dataset"],
  },
};
