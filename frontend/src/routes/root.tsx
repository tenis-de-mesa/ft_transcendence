import { Form, Link, Outlet, redirect, useLoaderData } from "react-router-dom";
import { createCat, getAllCats } from "../cats/cats.service";
import type { Cat } from "../cats/cats.types";

export async function loader() {
  const cats = await getAllCats();
  return { cats };
}

export async function action() {
  const cat = await createCat();
  return redirect(`/cats/${cat.id}/edit`);
}

export default function Root() {
  const { cats } = useLoaderData() as { cats: Cat[] };
  return (
    <>
      <div id="sidebar">
        <h1>🐈 Catitos</h1>
        <div>
          <Form method="post">
            <button type="submit">New</button>
          </Form>
        </div>
        <nav>
          <ul>
            {cats.map((cat) => (
              <li key={cat.id}>
                <Link to={`cats/${cat.id}`}>
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div id="detail">
        <Outlet />
      </div>
    </>
  );
}
