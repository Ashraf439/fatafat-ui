import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MenuItemCard from '../components/MenuItemCard';
import { fetchRestaurantMenu } from '../api/restaurantApi';

const RestaurantMenuPage = () => {
  const { restaurantId } = useParams();
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRestaurantMenu(restaurantId)
      .then(setMenu)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  if (loading) return <p className="text-center text-muted py-16">Loading menu...</p>;
  if (error) return <p className="text-center text-cherry py-16">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold">{menu.restaurantName}</h1>
      {!menu.isOpen && (
        <p className="text-cherry text-sm font-medium mt-2">Currently closed — browsing only</p>
      )}

      {Object.entries(menu.categories).map(([category, items]) => (
        <div key={category} className="mt-8">
          <h2 className="text-lg font-semibold mb-2">{category}</h2>
          {items.map((item) => (
            <MenuItemCard key={item.id} item={item} orderingDisabled={!menu.isOpen} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default RestaurantMenuPage;