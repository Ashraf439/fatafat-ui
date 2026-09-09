import React from 'react';

const MenuItemCard = ({ item, orderingDisabled }) => {
  return (
    <div className="flex items-start justify-between py-4 border-b border-ink/10 last:border-0">
      <div className="pr-4">
        <h3 className="font-semibold">{item.dishName}</h3>
        {item.description && <p className="text-muted text-sm mt-1">{item.description}</p>}
        <span className="text-muted text-xs mt-2 block">
          {item.foodType} • {item.preparationTimeMinutes} mins
        </span>
      </div>
      <div className="flex flex-col items-end shrink-0">
        <p className="font-medium">₹{item.price}</p>
        <button
          disabled={orderingDisabled}
          className="mt-2 border border-cherry text-cherry text-sm font-medium px-3 py-1 rounded-md disabled:opacity-30 disabled:cursor-not-allowed disabled:border-muted disabled:text-muted"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default MenuItemCard;