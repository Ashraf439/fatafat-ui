import React from 'react';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=60';

const RestaurantCard = ({ name, city, isOpen, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="w-72 bg-white border border-ink/10 rounded-lg overflow-hidden cursor-pointer hover:border-cherry/40 transition-colors"
    >
      <div className="relative">
        <img src={PLACEHOLDER_IMG} alt={name} className="w-full aspect-video object-cover" />
        {!isOpen && (
          <span className="absolute top-2 right-2 bg-ink/80 text-white text-xs px-2 py-1 rounded">
            Closed
          </span>
        )}
      </div>
      <div className="p-4">
        <h2 className="font-bold text-lg leading-tight">{name}</h2>
        <p className="text-muted text-sm mt-1">{city || 'Location unavailable'}</p>
        <div className="flex items-center justify-between mt-4">
          <span className={isOpen ? 'text-open text-sm font-medium' : 'text-muted text-sm'}>
            {isOpen ? 'Accepting orders' : 'Not accepting orders'}
          </span>
          <button
            disabled={!isOpen}
            className="bg-ink text-white text-sm font-medium px-4 py-2 rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
          >
            View menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;