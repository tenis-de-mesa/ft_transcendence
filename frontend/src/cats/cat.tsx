import { Form, Params, useLoaderData } from "react-router-dom";
import { getCat } from "./cats.service";
import type { Cat } from "./cats.types";

export const loader = async ({ params }: { params: Params }) => {
  const cat = await getCat(params.id as string);
  return { cat };
};

export default function Cat() {
  const { cat } = useLoaderData() as { cat: Cat };
  if (!cat) {
    return <div>Cat not found</div>;
  }

  return (
    <div id="cat">
      <div>
        <img src="https://cataas.com/cat" style={{ height: "200px", width: "200px", objectFit: "cover" }} />
      </div>
      <div>
        <h1>
          {cat.name
            ? (
              <>
                {cat.name}
              </>
            )
            : <i>No Name</i>}
          {" "}
        </h1>

        {cat.breed && <p><strong>breed: </strong>{cat.breed}</p>}
        {cat.age && <p><strong>age: </strong>{cat.age}</p>}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>
          <Form method="post" action="destroy">
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}
