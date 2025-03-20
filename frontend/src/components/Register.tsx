import { useState } from "react";
import axios from "axios";

interface RegisterProps {
    api: string;
    switchToLogin: () => void;
}

export default function Register ({api, switchToLogin}: RegisterProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const register = async () => {
        try {
            await axios.post(`${api}/register`, { username, password });
            alert('Registration successful! Please log in.');
            switchToLogin();
        } catch (error) {
            alert('Registration failed! Please try again.');
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
          onClick={register}
          className="bg-blue-500 text-white p-2 rounded w-full"
        >
          Register
        </button>
        <br />
        <button
          onClick={switchToLogin}
          className="text-blue-500 underline w-full addButton"
        >
          Already have an account? Log in
        </button>
      </div>
    );
}