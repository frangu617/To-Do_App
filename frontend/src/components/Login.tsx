import { useState } from "react";
import axios from "axios";

interface LoginProps {
    setToken: (token: string) => void;
    api: string;
}

export default function Login({ setToken, api }: LoginProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const login = async () => {
        try{
            const res = await axios.post(`${api}/login`, { username, password });
            setToken(res.data.access_token);

        } catch (error) {
            alert('Login Failed!');
        }
    };

    return (
        <div className = "space-y-4">
            <input value = {username} placeholder="Username"
            className="border p-2 rounded w-full" 
            onChange={(e) => setUsername(e.target.value)}
            />
            <input value = {password} placeholder="Password" type = "password"
            className="border p-2 rounded w-full" 
            onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick = {login} className="bg-blue-500 text-white p-2 rounded w-full">Login</button>
        </div>
    );
}