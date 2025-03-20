import { useState, useEffect } from "react";
// import axios from "axios";
import Login from "./components/Login";
import Lists from "./components/Lists";
import Register from "./components/Register";
import "./App.css"

const API = "http://localhost:5000";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const logout = () => {
    setToken(''); 
    setShowLogin(true);
  };

  return (
    <div className = "app max-w-3xl mx-auto p-4">
      {!token ? (
        showLogin? (
        <Login setToken={setToken} api={API} switchToRegister={() => setShowLogin(false)}/>
      ) : (
        <Register api = {API} switchToLogin={() => setShowLogin(true)}/>
      )
     ) : (
        <Lists token={token} api={API} logout={logout} />
      )}
    </div>
  )
}