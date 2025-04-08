import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PollPage from './pages/PollPage';
import CreatePollPage from './pages/CreatePollPage';

function App() {
  return (
    <>
      <nav>
        <NavLink to="/" style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })}>
          Home (All Polls)
        </NavLink>
        <NavLink to="/create" style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal' })}>
          Create Poll
        </NavLink>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/poll/:id" element={<PollPage />} />
          <Route path="/create" element={<CreatePollPage />} />
          {/* Add a 404 route */}
           <Route path="*" element={<h2>404 Not Found</h2>} />
        </Routes>
      </main>
    </>
  );
}

export default App;