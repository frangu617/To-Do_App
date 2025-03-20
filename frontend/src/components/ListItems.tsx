import { useState, useEffect } from "react";
import axios from "axios";

interface ListItemProps{
    token: string;
    api: string;
    listId: number;
    logout: () => void;
}

interface ListItem{
    id: number;
    list_id: number;
    content: string;
    created_at: string;
}

interface User {
    id: number;
    username: string;
}

export default function ListItems ({ token, api, listId, logout }: ListItemProps) {
    const [listItems, setListItems] = useState<ListItem[]>([]);
    const [newListItemText, setNewListItemText] = useState("");

    useEffect(() => {
        fetchListItems();
    }, []);

    const fetchListItems = async () => {
        const res = await axios.get(`${api}/lists/${listId}/items`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setListItems(res.data.items);
    };

    const createListItem = async () => {
        try {
            const response = await axios.post(
                `${api}/lists/${listId}/items`,
                { content: newListItemText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("Item created with id:", response.data.id);
            setNewListItemText("");
            fetchListItems();
        } catch (error: any) {
            if (error.response) {
                console.error("Server response error:", error.response.data);
                alert(`Error creating item: ${JSON.stringify(error.response.data)}`);
            } else {
                console.error("Error:", error.message);
                alert(`Error: ${error.message}`);
            }
        }
    };

    const deleteItem = async (itemId: number) => {
      try {
        await axios.delete(`${api}/lists/${listId}/items/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setListItems((prevItems) =>
          prevItems.filter((item) => item.id !== itemId)
        ); // Remove from state
      } catch (error: any) {
        if (error.response) {
          console.error("Server response error:", error.response.data);
          alert(`Error deleting item: ${JSON.stringify(error.response.data)}`);
        } else {
          console.error("Error:", error.message);
          alert(`Error: ${error.message}`);
        }
      }
    };


    return (
        <div className="space-y-4">
            <div className = "ItemsCard">
            <input
                value={newListItemText}
                onChange={(e) => setNewListItemText(e.target.value)}
                className="border p-2 rounded w-full"
                placeholder="New list item"
            />
            <button onClick={createListItem} className="bg-blue-500 text-white p-2 rounded w-full addButton">Create Item</button>
            </div>
            {listItems.map((item) => (
                <div key={item.id} className="bg-gray-200 p-4 rounded-md listItems">
                    {item.content}
                </div>
            ))}
        </div>
    );
}