export const blockUser = async (userBlockId) => {
  return fetch(`http://localhost:3001/users/block/${userBlockId}`, {
    credentials: "include",
  });
};

export const unblockUser = async (userBlockId) => {
  return fetch(`http://localhost:3001/users/unblock/${userBlockId}`, {
    credentials: "include",
  });
};
