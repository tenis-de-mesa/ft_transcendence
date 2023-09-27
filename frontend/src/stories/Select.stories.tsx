import React from "react";
import { Meta } from "@storybook/react";
import StoryLayout from "./StoryLayout";
import { Select, SelectProps } from "../components/Select";
import { IOption } from "../@interfaces";
import { FiCalendar, FiDollarSign } from "react-icons/fi";
import { countries } from "../data/countries";
import { dates } from "../data/dates";
import { prices } from "../data/prices";

const meta: Meta = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
};

export default meta;

interface Props extends SelectProps {
  darkMode: boolean;
}

const StorySelect = (args: Props) => {
  const [selectedCountry, setSelectedCountry] = React.useState<IOption>(
    countries[0],
  );
  const [selectedDate, setSelectedDate] = React.useState<IOption>();
  const [selectedPrice, setSelectedPrice] = React.useState<IOption>();

  const handleSelectCountry = (countryValue: string) => {
    const country = countries.find((p) => p.value === countryValue) as IOption;
    setSelectedCountry(country);
  };

  const handleSelectDate = (dateValue: string) => {
    const date = dates.find((p) => p.value === dateValue) as IOption;
    setSelectedDate(date);
  };

  const handleSelectPrice = (priceValue: string) => {
    const price = prices.find((p) => p.value === priceValue) as IOption;
    setSelectedPrice(price);
  };

  return (
    <StoryLayout darkMode={args.darkMode} className="space-x-3 space-y-3">
      <Select
        options={countries}
        selectedOption={selectedCountry}
        setSelectedOption={handleSelectCountry}
        placeholder="Select a country"
        width="w-50"
      />

      <Select
        options={dates}
        LeadingIcon={<FiCalendar />}
        selectedOption={selectedDate}
        setSelectedOption={handleSelectDate}
        placeholder="Select a date"
        width="w-50"
      />

      <Select
        options={prices}
        LeadingIcon={<FiDollarSign />}
        selectedOption={selectedPrice}
        setSelectedOption={handleSelectPrice}
        placeholder="Select a price"
        width="w-50"
      />
    </StoryLayout>
  );
};

export const Default = StorySelect.bind({});

Default.args = {
  darkMode: false,
};

Default.parameters = {
  controls: {
    exclude: [
      "options",
      "selectedOption",
      "setSelectedOption",
      "LeadingIcon",
      "width",
      "placeholder",
    ],
  },
};
