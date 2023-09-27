import React from "react";
import { Meta } from "@storybook/react";
import StoryLayout from "./StoryLayout";
import { Paginate, PaginationProps } from "../components/Paginate";

const meta: Meta = {
  title: "Components/Paginate",
  component: Paginate,
  tags: ["autodocs"],
};

export default meta;

interface Props extends PaginationProps {
  darkMode: boolean;
}

const StoryPagination = (args: Props) => {
  const [page, setPage] = React.useState<number>(args.page);

  React.useEffect(() => {
    if (page >= 0 && page <= 10) {
      setPage(args.page);
    }
  }, [args.page]);

  return (
    <StoryLayout {...args} className="space-y-4">
      <Paginate
        page={page}
        setPage={setPage}
        totalPages={args.totalPages}
        isMobile={args.isMobile}
      />
    </StoryLayout>
  );
};

export const Default = StoryPagination.bind({});

Default.args = {
  darkMode: false,
  page: 0,
  totalPages: 10,
  isMobile: false,
};

Default.parameters = {
  controls: {
    exclude: ["setPage"],
  },
};
