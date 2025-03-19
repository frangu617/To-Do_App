import { useState, useEffect } from "react";
import axios from "axios";

interface ListProps {
    token: string;
    api: string;
    logout:() => void;
}

interface List{
    id: number;
    name: string;
    created_at: string;
}

export default function Lists({ token, api, logout }: ListProps) {
    const [lists, setLists] = useState<List[]>([]);
    const [newListName, setNewListName] = useState("");

    useEffect(() => {
        fetchLists();
    }, []);

    const fetchLists = async () => {
        const res = await axios.get (`${api}/lists`, { headers: { Authorization: `Bearer ${token}` } });
        setLists(res.data.lists)
    };

    const createList = async () => {
        await axios.post(`${api}/lists`, {name: newListName}, {headers: {Authorization: `Bearer ${token}`}
        });
        setNewListName("");
        fetchLists();
    };

    const deleteList = async (id: number) => {
        await axios.delete(`${api}/lists/${id}`, {headers: {Authorization: `Bearer ${token}`}} );
        fetchLists();
    };

    return (
        <div className="space-y-4">
            <button onClick={logout} className="bg-red-500 text-white p-2 rounded w-full">Logout</button>

            <div className="flex gap-2">
                <input
                value = {newListName}
                placeholder="New List Name"
                className="border p-2 rounded flex grow"
                onChange={(e) => setNewListName(e.target.value)}
                />

                <button onClick={createList} className="bg-green-500 text-white p-2 rounded">Add</button>
            </div>

            <ul>
                {lists.map(list => (
                    <li key = {list.id} className="flex justify-between items center border-b p-2">
                        {list.name} (Created: {new Date( list.created_at).toLocaleString()})
                        <button onClick={() => deleteList(list.id)} className="bg-red-500 text-white p-2 rounded">Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}