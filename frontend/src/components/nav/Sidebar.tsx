import { FC, useCallback, useEffect, useState } from "react";

import { useLocation } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";

import { IoMdMenu } from "react-icons/io";

import { images } from "../../data/images";
import { Typography } from "../Typography";
import { INavitem } from "../../@interfaces";

import classNames from "classnames";
import { LuLogOut } from "react-icons/lu";
import { Navitem } from "./Navitem";

export interface ISidebarProps {
  options: INavitem[];
  username: string;
  email: string;
  darkMode?: boolean;
  className?: string;
}

export const Sidebar: FC<ISidebarProps> = ({
  options,
  username,
  email,
  className,
  darkMode,
}) => {
  const isTab = useMediaQuery({ query: "(max-width: 786px)" });
  const isMob = useMediaQuery({ query: "(max-height: 420px)" });

  const [isOpen, setIsOpen] = useState<boolean>(isTab ? false : true);
  const [activeNavitem, setActiveNavitem] = useState<string>("");

  const { pathname } = useLocation();

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
    <div>
      <div
        onClick={() => setIsOpen(false)}
        className={classNames(
          "md:hidden fixed inset-0 max-h-screen z-[998] bg-gray-900/50",
          {
            block: isOpen,
            hidden: !isOpen,
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
          "z-[999] w-[16rem] max-w-[16rem] h-screen overflow-hidden md:relative fixed",
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
          <img
            src={images.demoAvatar}
            className="w-10 h-10 rounded-full cursor-pointer select-none"
          />
          {isOpen ? (
            <div className="duration-100 ease-in transform">
              <Typography
                variant="sm"
                customWeight="medium"
                customColor="text-gray-700 dark:text-white"
                className="transition ease-in delay-150 opacity-100"
              >
                {username}
              </Typography>
              <Typography
                variant="xs"
                customColor="text-gray-500 dark:text-gray-400"
                className="transition ease-in delay-300 opacity-100 whitespace-nowrap"
              >
                {email}
              </Typography>
              <LuLogOut
                size={20}
                className="absolute top-0 text-gray-400 transition ease-in delay-300 opacity-100 cursor-pointer -right-1"
              />
            </div>
          ) : (
            <div>
              <Typography
                variant="sm"
                customWeight="medium"
                customColor="text-gray-700 dark:text-white"
                className="opacity-0"
              >
                {username}
              </Typography>
              <Typography
                variant="xs"
                customColor="text-gray-500"
                className="opacity-0 whitespace-nowrap"
              >
                {email}
              </Typography>
              <LuLogOut
                size={20}
                className="absolute top-0 right-0 opacity-0"
              />
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
