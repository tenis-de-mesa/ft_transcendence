import { FC, useCallback, useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";

import { IoMdMenu } from "react-icons/io";

import { images } from "../../data/images";
import { Typography } from "../Typography";
import { INavitem } from "../../@interfaces";

import classNames from "classnames";
import { LuLogOut } from "react-icons/lu";
import { Navitem } from "./Navitem";
import { Avatar } from "../Avatar";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { AuthContext } from "../../contexts";

export interface ISidebarProps {
  options: INavitem[];
  darkMode?: boolean;
  className?: string;
}

export const Sidebar: FC<ISidebarProps> = ({
  options,
  className,
  darkMode,
}) => {
  const isTab = useMediaQuery({ query: "(max-width: 786px)" });
  const isMob = useMediaQuery({ query: "(max-height: 420px)" });

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeNavitem, setActiveNavitem] = useState<string>("");
  const { currentUser } = useContext(AuthContext);
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
            block: isOpen,
            hidden: !isOpen,
          }
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
          "z-[999] w-[16rem] max-w-[16rem] h-full top-0 left-0 md:relative fixed",
          "border-r border-gray-100 dark:border-opacity-10",
          className
        )}
      >
        <div
          className={classNames(
            "flex ml-3 py-2 mt-5 mb-4 transform ease-out duration-100",
            {
              "px-5": isOpen,
            }
          )}
        >
          <img
            src={darkMode ? images.logoLight : images.logoDark}
            width={36}
            className="select-none"
          />

          <Typography
            variant="xl"
            className={classNames(
              "ml-2.5 whitespace-nowrap select-none",
              "transition ease-in-out",
              {
                "opacity-100 delay-150": isOpen,
                "opacity-0 delay-0": !isOpen,
              }
            )}
            customWeight="medium"
          >
            Transcendence
          </Typography>
        </div>

        {!isTab && (
          <div className="relative h-10">
            <div
              className={classNames(
                "absolute top-0 flex items-center justify-center",
                "w-8 h-8",
                "bg-gray-800 rounded-full cursor-pointer -right-3"
              )}
              onClick={() => !isTab && setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <FaArrowLeft className="text-white" size={17} />
              ) : (
                <FaArrowRight className="text-white" size={17} />
              )}
            </div>
          </div>
        )}

        <div className={classNames("h-full")}>
          <ul
            className={classNames(
              "whitespace-nowrap px-2.5 py-5 overflow-x-hidden no-scrollbar",
              {
                "h-[60%]": isMob,
              }
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
                seed={currentUser.login}
                src={currentUser.avatarUrl}
                className="fixed w-0 h-0 transition duration-150 ease-out opacity-0 bottom-1"
              />
              <div className="flex items-center justify-between py-1">
                <Typography
                  variant="sm"
                  customWeight="medium"
                  customColor="text-gray-700 dark:text-white"
                  className="transition ease-in delay-150 opacity-100"
                >
                  {currentUser.nickname}
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
                {currentUser.email}
              </Typography>
            </div>
          ) : (
            <div>
              <Avatar
                size="sm"
                seed={currentUser.login}
                src={currentUser.avatarUrl}
                className="fixed transition ease-in delay-300 opacity-100 cursor-pointer select-none bottom-4"
              />
              <div className="flex items-center justify-between">
                <Typography
                  variant="sm"
                  customWeight="medium"
                  customColor="text-gray-700 dark:text-white"
                  className="opacity-0"
                >
                  {currentUser.nickname}
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
                {currentUser.nickname}
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
