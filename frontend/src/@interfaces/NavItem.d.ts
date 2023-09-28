interface IBaseNavitem {
  order: number;
  path?: string;
  label: string;
}

export interface INavitem extends IBaseNavitem {
  icon: JSX.Element;
}
