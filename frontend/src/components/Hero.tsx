import { ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Hero() {
  return (
    <div className="relative bg-gradient-to-r from-pink-50 to-purple-50 overflow-hidden" id="home">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <div className="inline-block bg-pink-100 text-pink-600 px-4 py-2 rounded-full">
              New Collection 2026
            </div>
            <h1 className="text-gray-900">
              Discover Your Unique Style
            </h1>
            <p className="text-gray-600">
              Explore our exclusive collection of clothing, shoes, accessories, and beauty products designed for the modern woman. Express yourself with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#products"
                className="inline-flex items-center justify-center gap-2 bg-pink-600 text-white px-8 py-3 rounded-lg hover:bg-pink-700 transition-colors"
              >
                Shop Now
                <ChevronRight className="w-5 h-5" />
              </a>
              <a
                href="#categories"
                className="inline-flex items-center justify-center gap-2 bg-white text-pink-600 px-8 py-3 rounded-lg border-2 border-pink-600 hover:bg-pink-50 transition-colors"
              >
                Browse Categories
              </a>
            </div>
            <div className="flex gap-8 pt-6">
              <div>
                <div className="text-gray-900">500+</div>
                <div className="text-gray-500">Products</div>
              </div>
              <div>
                <div className="text-gray-900">50K+</div>
                <div className="text-gray-500">Happy Customers</div>
              </div>
              <div>
                <div className="text-gray-900">4.9★</div>
                <div className="text-gray-500">Rating</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1655026950620-b39ab24e9b4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjB3b21hbnxlbnwxfHx8fDE3NjQ1NzYwNDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Fashion Model"
                className="w-full h-[400px] lg:h-[600px] object-cover"
              />
            </div>
            {/* Floating Cards */}
            <div className="absolute -left-4 top-1/4 bg-white p-4 rounded-lg shadow-lg hidden lg:block">
              <div className="text-pink-600">Free Shipping</div>
              <div className="text-gray-500">On orders above 2590</div>
            </div>
            <div className="absolute -right-4 bottom-1/4 bg-white p-4 rounded-lg shadow-lg hidden lg:block">
              <div className="text-pink-600">Easy Returns</div>
              <div className="text-gray-500">30-day return policy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
