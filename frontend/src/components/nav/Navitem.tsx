import React, { FC } from "react";
import classNames from "classnames";

import { NavLink } from "react-router-dom";

import { Typography } from "../Typography";
import { INavitem } from "../../@interfaces";

interface INavitemProps {
  isOpen: boolean;
  item: INavitem;
  isActive: boolean;
  onClick: (item: string) => void;
}

export const Navitem: FC<INavitemProps> = ({
  isOpen,
  item,
  onClick,
  isActive,
}) => {
  return (
    <>
      <li onClick={() => onClick(item.label)}>
        <NavLink to={item.path!} className="link">
          <item.icon.type
            size={23}
            className={classNames("text-gray-900 min-w-max dark:text-white", {
              "text-primary-400": isActive,
            })}
          />
          <Typography
            variant="lg"
            className={classNames({
              "opacity-0 transition ease-in-out delay-75": !isOpen,
            })}
            customWeight="medium"
          >
            {item.label}
          </Typography>
        </NavLink>
      </li>
    </>
  );
};
