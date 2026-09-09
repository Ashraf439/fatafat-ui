import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import { fetchRestaurants } from '../api/restaurantApi';

const HomePage = () => {
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

  if (loading) return <p className="text-center text-muted py-16">Loading restaurants...</p>;
  if (error) return <p className="text-center text-cherry py-16">{error}</p>;
  if (restaurants.length === 0) return <p className="text-center text-muted py-16">No restaurants available right now.</p>;

  return (
    <div className="flex flex-wrap justify-center gap-5 p-8">
      {restaurants.map((r) => (
        <RestaurantCard
          key={r.id}
          name={r.name}
          city={r.city}
          isOpen={r.isOpen}
          onClick={() => navigate(`/restaurant/${r.id}`)}
        />
      ))}
    </div>
  );
};

export default HomePage;