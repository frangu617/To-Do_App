import { useState } from "react";
import axios from "axios";

interface LoginProps {
  setToken: (token: string) => void;
  api: string;
  switchToRegister: () => void;
}

export default function Login({ setToken, api, switchToRegister }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await axios.post(`${api}/login`, { username, password });
      setToken(res.data.access_token);
    } catch (error) {
      alert("Login Failed!");
    }
  };

  return (
    <div className="space-y-4">
      <input
        value={username}
        placeholder="Username"
        className="border p-2 rounded w-full"
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <input
        value={password}
        placeholder="Password"
        type="password"
        className="border p-2 rounded w-full"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button
        onClick={login}
        className="bg-blue-500 text-white p-2 rounded w-full loginB"
      >
        Login
      </button>
      <br />
      <button
        onClick={switchToRegister}
        className="text-blue-500 underline w-full"
      >
        {" "}
        Don't have an account? Register
      </button>
    </div>
  );
}
