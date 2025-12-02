import { ImageWithFallback } from './figma/ImageWithFallback';

interface CategoryCardProps {
  name: string;
  image: string;
  count: number;
}

export function CategoryCard({ name, image, count }: CategoryCardProps) {
  return (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-xl bg-gray-100 aspect-square">
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="p-4 text-white w-full">
            <h3 className="text-white">{name}</h3>
            <p className="text-white/80">{count} items</p>
          </div>
        </div>
      </div>
    </div>
  );
}
