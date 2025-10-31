import React from "react";
import { Link } from "react-router-dom";

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <h2>Políticas Públicas</h2>
      <div className="nav-links">
        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <Link to="/">Inicio</Link>
            <button onClick={onLogout} className="nav-btn">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
