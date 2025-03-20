import { useState, useEffect } from "react";
import axios from "axios";
import ListItems from "./ListItems";

interface ListProps {
  token: string;
  api: string;
  logout: () => void;
}

interface List {
  id: number;
  name: string;
  created_at: string;
}

interface ListItem {
  id: number;
  list_id: number;
  text: string;
  created_at: string;
}

interface User {
  id: number;
  username: string;
}

export default function Lists({ token, api, logout }: ListProps) {
  const [lists, setLists] = useState<List[]>([]);
  const [newListName, setNewListName] = useState("");

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    const res = await axios.get(`${api}/lists`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLists(res.data.lists);
  };

  const createList = async () => {
    try {
      const response = await axios.post(
        `${api}/lists`,
        { name: newListName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("List created with id:", response.data.id);
      setNewListName("");
      fetchLists();
    } catch (error: any) {
      if (error.response) {
        console.error("Server response error:", error.response.data);
        alert(`Error creating list: ${JSON.stringify(error.response.data)}`);
      } else {
        console.error("Error:", error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const deleteList = async (id: number) => {
    await axios.delete(`${api}/lists/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchLists();
  };

  return (
    <div className="space-y-4 card">
      <div className="flex gap-2 listCard">
        <input
          value={newListName}
          placeholder="New List Name"
          className="border p-2 rounded flex grow"
          onChange={(e) => setNewListName(e.target.value)}
        />

        <button
          onClick={createList}
          className="bg-green-500 text-white p-2 rounded w-full flex-1 addButton"
        >
          Add
        </button>
      </div>

      <ul className="card">
        {lists.map((list, index) => (
          <>
            <li key={list.id || index} className="border-b p-2 listI">
              {list.name}
              <button
                onClick={() => deleteList(list.id)}
                className="bg-red-500 text-white p-2 rounded"
              >
                Delete
              </button>
              <div></div>
            </li>
            <ListItems
              token={token}
              api={api}
              listId={list.id}
              logout={logout}
            />
          </>
        ))}
      </ul>
      <button
        onClick={logout}
        className="bg-red-500 text-white p-2 rounded w-full"
      >
        Logout
      </button>
    </div>
  );
}
