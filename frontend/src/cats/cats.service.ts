import type { Cat } from "./cats.types";

export async function getAllCats(): Promise<Cat[]> {
  const response = await fetch("http://localhost:3001/cats");
  const body = await response.json();
  return body;
}

export async function getCat(id: string): Promise<Cat[]> {
  const response = await fetch(`http://localhost:3001/cats/${id}`);
  const body = await response.json();
  return body;
}

export async function deleteCat(id: number): Promise<boolean> {
  const response = await fetch(`http://localhost:3001/cats/${id}`, {
    method: "DELETE",
  });
  return response.ok;
}

export async function createCat(): Promise<Cat> {
  const response = await fetch(`http://localhost:3001/cats`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({name: "", age: 0}),
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const body = await response.json();
  return body;
}

export async function updateCat(id: number, cat: Partial<Cat>): Promise<Cat> {
  const response = await fetch(`http://localhost:3001/cats/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cat),
  });
  const body = await response.json();
  return body;
}
