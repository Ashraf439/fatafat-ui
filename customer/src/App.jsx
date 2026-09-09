// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import RestaurantMenuPage from './pages/RestaurantMenuPage';
import NotFoundPage from './pages/NotFoundPage';

const App = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/restaurant/:restaurantId" element={<RestaurantMenuPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </>
);

export default App;