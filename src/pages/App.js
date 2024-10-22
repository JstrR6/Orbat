import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Units from './pages/Units';
import Forms from './pages/Forms';

const App = () => {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/units" element={<Units />} />
        <Route path="/forms" element={<Forms />} />
      </Routes>
    </Router>
  );
};

export default App;
