const service = get(UsersService)

for (let i = 1; i <= 10; i++) {
    await service.createUser({ id: i, login: "test" + i })
}

await service.getAllUsers()