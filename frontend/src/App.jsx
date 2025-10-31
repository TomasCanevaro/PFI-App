import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, MemoryRouter } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MainApp from "./pages/MainApp";

function App({ initialEntries, RouterComponent = Router }) {
  const [user, setUser] = useState(localStorage.getItem("username"));

  const handleLogin = (username) => {
    setUser(username);
    localStorage.setItem("username", username);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  };

  const routerProps = initialEntries ? { initialEntries } : {};

  return (
    <RouterComponent {...routerProps}>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="page-container">
        <Routes>
          <Route
            path="/"
            element={
              user ? <MainApp /> : <Navigate to="/login" />
            }
          />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </RouterComponent>
  );
}

export default App;
