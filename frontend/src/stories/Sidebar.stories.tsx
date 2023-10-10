import { Meta } from "@storybook/react";
import StoryLayout from "./StoryLayout";

import { navitems } from "../data/navItems";
import { Sidebar, ISidebarProps } from "../components/nav/Sidebar";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Typography } from "../components/Typography";
import { User } from "../types/types";

const meta: Meta = {
  title: "Components/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
};

export default meta;

interface Props extends ISidebarProps {
  darkMode: boolean;
}

const StorySidebar = (args: Props) => {
  const user: User = {
    id: 1,
    login: "frosa-ma",
    nickname: "frosa-ma",
    status: "",
    avatarUrl: ""
  };

  return (
    <StoryLayout {...args} className="flex flex-col h-screen" noPadding>
      <BrowserRouter>
        <div className="flex gap-5">
          <Sidebar
            {...args}
            options={navitems}
            user={user}
            className={args.className}
          />
          <main className="flex-1 py-4 mx-auto">
            <Routes>
              {navitems.map((item) => (
                <Route
                  key={item.label}
                  path={item.path}
                  element={<Typography variant="h3">{item.label}</Typography>}
                />
              ))}
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </StoryLayout>
  );
};

export const Default = StorySidebar.bind({});

Default.args = {
  darkMode: false,
  className: "",
};

Default.parameters = {
  controls: {
    exclude: ["options", "username", "email"],
  },
};
