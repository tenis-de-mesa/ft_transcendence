import React from 'react';

import { IColor } from "../@interfaces";
import { Typography } from '../components/Typography';

export const ColorBox = ({ color }: { color: IColor }) => (
  <div
    key={color.bgClass}
    className="flex flex-col rounded-lg shadow-lg w-26 h-39 dark:bg-white"
  >
      <div className={`h-20 ${color.bgClass} rounded-t-lg`} />
      <div className="mx-3 my-3">
        <Typography variant="xs" customWeight="medium" customColor="text-gray-900">
          <span className="font-bold">
            {color.bgClass.substring(3)}
          </span>
        </Typography>

        <Typography variant="md" customColor="text-gray-500">
          {color.hex}
        </Typography>
      </div>
  </div>
);