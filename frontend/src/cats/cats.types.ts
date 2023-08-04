export type Cat = {
  id: string;
  name: string;
  age: number;
  breed: string;
  createdAt: string;
};
export type NewCat = Omit<Cat, "id" | "createdAt">;
export type UpdateCat = Partial<NewCat>;