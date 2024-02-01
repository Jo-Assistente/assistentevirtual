import Footer from "../Footer/index.tsx";
import "../../../src/index.css";
import Chatbot from "../../pages/Chatbot/index.tsx";
import React, { useContext } from "react";

import Home from "../../pages/Home/index.tsx";

import { Link, Route, Routes } from "react-router-dom";
import { RequireAuth } from "../../contexts/Auth/RequireAuth.tsx";
import { AuthContext } from "../../contexts/Auth/AuthContext.tsx";
import Register from "../../pages/Register/index.tsx";

export default function App() {
  const auth = useContext(AuthContext);

  return (
    <div>
      <section className="main-section">
        <nav>
          <Link to="/" style={{ margin: "15px" }}>
            Home
          </Link>
          <Link to="/private">Chatbot</Link>
          <Link to="/register">Register</Link>
          {auth.user && <button onClick={auth.signOut}>Sair</button>}
        </nav>
      </section>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/private"
          element={
            <RequireAuth>
              <Chatbot />
            </RequireAuth>
          }
        />

        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}
