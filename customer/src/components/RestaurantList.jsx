import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantCard from './RestaurantCard';
import { fetchRestaurants } from '../api';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants()
      .then(setRestaurants)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading restaurants...</p>;
  if (error) return <p>{error}</p>;
  if (restaurants.length === 0) return <p>No restaurants available.</p>;

  return (
    <div className="parent">
      {restaurants.map((r) => (
        <RestaurantCard
          key={r.id}
          name={r.name}
          city={r.city}
          isOpen={r.isOpen}
          onClick={() => navigate(`/restaurant/${r.id}/menu`)}
        />
      ))}
    </div>
  );
};

export default RestaurantList;