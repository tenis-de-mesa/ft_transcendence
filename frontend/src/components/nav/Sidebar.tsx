import { FC, useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";

import { IoMdMenu } from "react-icons/io";

import { images } from "../../data/images";
import { Typography } from "../Typography";
import { INavitem } from "../../@interfaces";

import classNames from "classnames";
import { LuLogOut } from "react-icons/lu";
import { Navitem } from "./Navitem";
import { User } from "../../types/types";
import { Avatar } from "../Avatar";

export interface ISidebarProps {
  options: INavitem[];
  user: User;
  darkMode?: boolean;
  className?: string;
}

export const Sidebar: FC<ISidebarProps> = ({
  options,
  user,
  className,
  darkMode,
}) => {
  const isTab = useMediaQuery({ query: "(max-width: 786px)" });
  const isMob = useMediaQuery({ query: "(max-height: 420px)" });

  const [isOpen, setIsOpen] = useState<boolean>(isTab ? false : true);
  const [activeNavitem, setActiveNavitem] = useState<string>("");

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const SidebarAnimation = isTab
    ? {
        open: {
          x: 0,
          width: "16rem",
          transition: {
            damping: 40,
          },
        },
        closed: {
          x: -250,
          width: 0,
          transition: {
            damping: 40,
            delay: 0.15,
          },
        },
      }
    : {
        open: {
          width: "16rem",
          transition: {
            damping: 40,
          },
        },
        closed: {
          width: "4rem",
          transition: {
            damping: 40,
          },
        },
      };

  useEffect(() => {
    if (isTab) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [isTab]);

  const closeMobileMenu = useCallback((isTab: boolean) => {
    isTab && setIsOpen(false);
  }, []);

  useEffect(() => {
    closeMobileMenu(isTab);
  }, [pathname, isTab, closeMobileMenu]);

  return (
    <div className="h-full">
      <div
        onClick={() => setIsOpen(false)}
        className={classNames(
          "md:hidden fixed inset-0 max-h-screen z-[998] bg-gray-900/50",
          {
            "block": isOpen,
            "hidden": !isOpen,
          },
        )}
      ></div>

      <motion.div
        variants={SidebarAnimation}
        initial={{ x: isTab ? -250 : 0 }}
        animate={isOpen ? "open" : "closed"}
        className={classNames(
          "flex flex-col justify-between",
          "bg-white dark:bg-gray-800 text-gray-900",
          "shadow-xl",
          "z-[999] w-[16rem] max-w-[16rem] h-full top-0 left-0 overflow-hidden md:relative fixed",
          "border-r border-gray-100 dark:border-opacity-10",
          className,
        )}
        onHoverStart={() => !isTab && setIsOpen(true)}
        onHoverEnd={() => !isTab && setIsOpen(false)}
      >
        <div
          className={classNames(
            "flex flex-row w-full py-3 mx-2 mb-8 transform ease-out duration-100",
            {
              "px-5": isOpen,
            },
          )}
        >
          <img
            src={darkMode ? images.logoLight : images.logoDark}
            width={45}
            className="select-none"
          />

          <Typography
            variant="xl"
            className={classNames("ml-2.5 whitespace-nowrap select-none", {
              "opacity-0 transition ease-in-out delay-75": !isOpen,
            })}
            customWeight="medium"
          >
            Transcendence
          </Typography>
        </div>

        <div className={classNames("h-full")}>
          <ul
            className={classNames(
              "whitespace-nowrap px-2.5 py-5 overflow-x-hidden no-scrollbar",
              {
                "h-[60%]": isMob,
              },
            )}
          >
            {options.map((item) => (
              <Navitem
                onClick={setActiveNavitem}
                key={item.label}
                item={item}
                isOpen={isOpen}
                isActive={activeNavitem === item.label}
              />
            ))}
          </ul>
        </div>

        <div
          className={classNames("h-1/12 link", {
            "h-screen": isMob,
          })}
        >
          {isOpen ? (
            <div className="w-full duration-100 ease-in transform">
              <Avatar  
                size="sm"
                src={images.demoAvatar}
                className="fixed w-0 h-0 transition duration-150 ease-out opacity-0 bottom-1"
              />
              <div className="flex items-center justify-between py-1">
                <Typography
                  variant="sm"
                  customWeight="medium"
                  customColor="text-gray-700 dark:text-white"
                  className="transition ease-in delay-150 opacity-100"
                >
                  {user.nickname}
                </Typography>
                <LuLogOut
                  size={20}
                  className="text-gray-400 transition ease-in delay-300 opacity-100 cursor-pointer hover:text-primary-400"
                  onClick={() => navigate("/logout", { replace: true })}
                />
              </div>
              <Typography
                variant="xs"
                customColor="text-gray-500 dark:text-gray-400"
                className="transition ease-in delay-300 opacity-100 whitespace-nowrap"
              >
                {"frosa-ma@student.42sp.org.br"}
              </Typography>
            </div>
          ) : (
            <div>
              <Avatar  
                size="sm"
                src={images.demoAvatar}
                className="fixed transition ease-in delay-300 opacity-100 cursor-pointer select-none bottom-4"
              />
              <div className="flex items-center justify-between">
                <Typography
                  variant="sm"
                  customWeight="medium"
                  customColor="text-gray-700 dark:text-white"
                  className="opacity-0"
                >
                  {user.nickname}
                </Typography>
                <LuLogOut
                  size={20}
                  className="absolute top-0 right-0 opacity-0"
                />
              </div>
              <Typography
                variant="xs"
                customColor="text-gray-500"
                className="opacity-0 whitespace-nowrap"
              >
                {user.nickname}
              </Typography>
            </div>
          )}
        </div>
      </motion.div>

      <div className="m-3 md:hidden" onClick={() => setIsOpen(true)}>
        <IoMdMenu size={25} className="text-gray-900 dark:text-white" />
      </div>
    </div>
  );
};
