import classNames from "classnames";
import { FC } from "react";

export interface HrProps {
  text?: string;
  className?: string;
}

export const Hr: FC<HrProps> = ({ text, className }) => {
  return (
    <>
      {text != null ? (
        <div className="inline-flex items-center justify-center w-full">
          <hr className={classNames("w-4/5 h-[2px] stroke", className)} />
          <span className="absolute px-3 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-900">
            {text}
          </span>
        </div>
      ) : (
        <hr className={classNames("w-4/5 h-[2px] stroke", className)} />
      )}
    </>
  );
};
