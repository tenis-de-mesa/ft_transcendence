import { Params, redirect } from "react-router-dom";
import { deleteCat } from "./cats.service";

export async function action({ params }: { params: Params }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) throw new Error("Invalid ID");
  await deleteCat(id);
  return redirect("/");
}
