import React from 'react';
import { Link } from 'react-router-dom';

function CategoryCard({ category }) {
  return (
    <Link 
      to={`/games?category=${category.slug}`} 
      className="group"
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl">
        <div className="aspect-square overflow-hidden bg-gradient-to-br from-indigo-100 to-indigo-50 relative">
          <img 
            src={category.image} 
            alt={category.name} 
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-80"></div>
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <h3 className="font-bold text-center">{category.name}</h3>
            <p className="text-xs text-center text-gray-200">{category.gameCount} games</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default CategoryCard;