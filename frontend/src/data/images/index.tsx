export type CountryISO =
  | "BR"
  | "KR"
  | "AR"
  | "DE"
  | "JP"
  | "BW"
  | "IT"
  | "NO"
  | "GR"
  | "CH"
  | "US"
  | "UY"
  | "BE"
  | "IN"
  | "RU"
  | "ES"
  | "NL"
  | "UA"
  | "CM"
  | "PT"
  | "FR"
  | "CN";

type image = "logoDark" | "logoLight" | "demoAvatar" | CountryISO;

const prodImages: Record<image, string> = {
  logoDark:
    "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695391752/transcendence/logo-dark.svg",
  logoLight:
    "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695391752/transcendence/logo-light.svg",
  demoAvatar:
    "https://res.cloudinary.com/tailwindcss/image/upload/v1634915122/demoAvatar_jooj6y.png",

  BR: "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695390151/transcendence/BR.svg",
  KR: "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695390151/transcendence/KR.svg",
  AR: "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695390151/transcendence/AR.svg",
  DE: "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695390151/transcendence/DE.svg",
  JP: "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695390088/transcendence/JP.svg",
  BW: "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695390088/transcendence/BW.svg",
  IT: "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695390088/transcendence/IT.svg",
  NO: "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695390088/transcendence/NO.svg",
  GR: "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695389893/transcendence/GR.svg",
  CH: "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695389893/transcendence/CH.svg",
  US: "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695389893/transcendence/US.svg",
  UY: "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695389810/transcendence/UY.svg",
  BE: "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695389810/transcendence/BE.svg",
  IN: "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695389810/transcendence/IN.svg",
  RU: "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695389730/transcendence/RU.svg",
  ES: "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695389730/transcendence/ES.svg",
  NL: "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695389730/transcendence/NL.svg",
  UA: "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695389730/transcendence/UA.svg",
  CM: "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695389667/transcendence/CM.svg",
  PT: "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695389667/transcendence/PT.svg",
  FR: "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695389655/transcendence/FR.svg",
  CN: "https://res.cloudinary.com/dgqelq6lb/image/upload/v1695389625/transcendence/CN.svg",
};

export const images = prodImages;
