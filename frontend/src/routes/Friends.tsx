import { Link, useLoaderData } from "react-router-dom";
import { User } from "../types/types";
import { Avatar } from "../components/Avatar";
import Table from "../components/Table";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useState } from "react";
import { Data } from "../data/tableData";
import { Button } from "../components/Button";
import { FiX } from "react-icons/fi";

export default function Friends() {
  const loaderData = useLoaderData() as User[];
  const [data, setData] = useState(() => [...loaderData]);

  const columnHelper = createColumnHelper<User>();

  const handleRemoveFriend = async (userId: number) => {
    const response = await fetch(
      `http://localhost:3001/users/friends/${userId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    if (response.ok) {
      setData((prevData) => prevData.filter((user) => user.id !== userId));
    } else {
      console.error("Friend not removed");
    }
  };

  const columns = [
    columnHelper.accessor("nickname", {
      cell: (info) => (
        <Link to={`/profile/${info.row.original.id}`}>{info.getValue()}</Link>
      ),
    }),

    columnHelper.display({
      header: "actions",
      cell: (props) => (
        <Button
          variant={"error"}
          TrailingIcon={<FiX />}
          size="sm"
          onClick={() => handleRemoveFriend(props.row.original.id)}
        >
          Remove friend
        </Button>
      ),
    }),
  ];

  return (
    <Table
      columns={columns as unknown as ColumnDef<Data>[]}
      data={data as unknown as Data[]}
    />
  );
}
