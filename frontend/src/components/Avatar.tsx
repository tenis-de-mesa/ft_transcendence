import classNames from "classnames";
import { FC } from "react";

export interface AvatarProps {
  src?: string;
  seed?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const Avatar: FC<AvatarProps> = ({
  src,
  seed = "Default",
  size = "md",
  className
}) => {
  return (
    <>
      {src ? 
        <img className={classNames(
            "rounded-full object-cover bg-gray-100", {
              "w-10 h-10": size == "sm",
              "w-24 h-24": size == "md",
              "w-36 h-36": size == "lg",
              "w-52 h-52": size == "xl",
            },
            className
          )} 
          src={src} 
          alt="avatar" 
        /> :
        <img className={classNames(
            "rounded-full object-cover bg-gray-100", {
              "w-10 h-10": size == "sm",
              "w-24 h-24": size == "md",
              "w-36 h-36": size == "lg",
              "w-52 h-52": size == "xl",
            },
            className
          )} 
          src={`https://api.dicebear.com/7.x/croodles/svg?seed=${seed}`} 
          alt="avatar" 
        />
      }
    </>
  )
};
