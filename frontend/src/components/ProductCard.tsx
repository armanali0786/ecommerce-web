import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  category: string;
}

export function ProductCard({
  name,
  price,
  originalPrice,
  image,
  rating,
  category,
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
      <div className="relative overflow-hidden bg-gray-100 aspect-square">
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-110 transition-transform"
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorite ? 'fill-pink-600 text-pink-600' : 'text-gray-600'
            }`}
          />
        </button>
        <div className="absolute top-3 left-3 bg-pink-600 text-white px-3 py-1 rounded-full">
          {category}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-gray-900 mb-2">{name}</h3>
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-gray-500 ml-2">({rating}.0)</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-pink-600">{price}</span>
            {originalPrice && (
              <span className="text-gray-400 line-through ml-2">{originalPrice}</span>
            )}
          </div>
          <button className="bg-pink-600 text-white p-2 rounded-lg hover:bg-pink-700 transition-colors">
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
