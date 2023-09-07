import { useState } from "react";

const updateUser = async (login: string) => {
	await fetch('http://localhost:3001/users/', {
		method: "POST",
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ login }),
		credentials: 'include'
	})
}

export default function Update(props: { user: string }) {

	const [login, setLogin] = useState(props.user ?? '');

	return (
		<form>
			<h1>Update User</h1>
			<label>
				Name:
				<input type="text" name="name" value={login}
					onChange={(e) => setLogin(e.target.value)} />
			</label>
			<br />
			<button onClick={() => { updateUser(login) }}>Update</button>
		</form>
	);
}
