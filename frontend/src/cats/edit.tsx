import { Form, Params, redirect, useLoaderData } from "react-router-dom";
import type { Cat } from "./cats.types";
import { updateCat } from "./cats.service";

export async function action(
  { request, params }: { request: Request; params: Params },
) {
  const id: number = Number(params.id);
  if (Number.isNaN(id)) {
    throw new Error("Invalid ID");
  }

  const formValues: FormData = await request.formData();
  const updates: Partial<Cat> = {
    name: formValues.get('name') as string,
    age: Number(formValues.get('age')),
    breed: formValues.get('breed') as string,
  };
  await updateCat(id, updates);

  return redirect(`/cats/${params.id}`);
}

export default function Editcat() {
  const { cat } = useLoaderData() as { cat: Cat };

  return (
    <Form method="post" id="contact-form">
      <p>
        <span>name</span>
        <input
          type="text"
          name="name"
          defaultValue={cat.name}
        />
      </p>
      <label>
        <span>breed</span>
        <input
          type="text"
          name="breed"
          defaultValue={cat.breed}
        />
      </label>
      <label>
        <span>age</span>
        <input
          type="number"
          name="age"
          defaultValue={cat.age}
        />
      </label>
      <p>
        <button type="submit">Save</button>
      </p>
    </Form>
  );
}
