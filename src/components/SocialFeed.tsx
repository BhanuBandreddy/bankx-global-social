
import { Heart, MessageCircle, Share, MapPin, ShoppingBag, Verified } from "lucide-react";

export const SocialFeed = () => {
  const feedItems = [
    {
      id: 1,
      user: {
        name: "Elena Rodriguez",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b900?w=100&h=100&fit=crop&crop=face",
        verified: true,
        trustScore: 96.8,
        location: "Tokyo, Japan"
      },
      content: "Just discovered this incredible ceramic workshop in Shibuya! The artist creates pieces that tell stories of traditional Japanese culture. Available for global shipping through BankX Trust Bridge.",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop",
      product: {
        name: "Handcrafted Ceramic Tea Set",
        price: "$89.99",
        trustVerified: true
      },
      engagement: {
        likes: 247,
        comments: 32,
        shares: 18
      },
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      user: {
        name: "Marcus Thompson",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        verified: true,
        trustScore: 94.2,
        location: "Marrakech, Morocco"
      },
      content: "The souks here are incredible! Found this local artisan who creates beautiful leather goods using centuries-old techniques. His craftsmanship is unmatched.",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop",
      product: {
        name: "Handwoven Berber Leather Bag",
        price: "$124.50",
        trustVerified: true
      },
      engagement: {
        likes: 189,
        comments: 28,
        shares: 15
      },
      timestamp: "4 hours ago"
    },
    {
      id: 3,
      user: {
        name: "Sofia Chen",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        verified: true,
        trustScore: 98.1,
        location: "Tuscany, Italy"
      },
      content: "Stumbled upon this family-owned vineyard that's been producing wine for 400 years. The passion and tradition in every bottle is extraordinary. AI Trust Agent verified authenticity!",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
      product: {
        name: "Vintage Chianti Classico 2019",
        price: "$45.00",
        trustVerified: true
      },
      engagement: {
        likes: 312,
        comments: 45,
        shares: 23
      },
      timestamp: "6 hours ago"
    }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Global Social Commerce Feed</h2>
        <p className="text-white/70">Discover authentic products through traveler experiences worldwide</p>
      </div>

      {feedItems.map((item) => (
        <div key={item.id} className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-300">
          {/* User Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center space-x-4">
              <img
                src={item.user.avatar}
                alt={item.user.name}
                className="w-12 h-12 rounded-full border-2 border-emerald-400"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-white">{item.user.name}</h3>
                  {item.user.verified && (
                    <Verified className="w-5 h-5 text-emerald-400 fill-current" />
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-white/70">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{item.user.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>Trust: {item.user.trustScore}</span>
                  </div>
                </div>
              </div>
              <span className="text-sm text-white/50">{item.timestamp}</span>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-4">
            <p className="text-white/90 leading-relaxed">{item.content}</p>
          </div>

          {/* Image */}
          <div className="relative">
            <img
              src={item.image}
              alt="Travel discovery"
              className="w-full h-64 object-cover"
            />
            
            {/* Product Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/70 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white text-sm">{item.product.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-emerald-400 font-bold">{item.product.price}</span>
                      {item.product.trustVerified && (
                        <div className="flex items-center space-x-1 text-xs text-emerald-400">
                          <Verified className="w-3 h-3 fill-current" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-sm font-semibold transition-colors flex items-center space-x-1">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Buy</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement */}
          <div className="p-6 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button className="flex items-center space-x-2 text-white/70 hover:text-red-400 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.engagement.likes}</span>
                </button>
                <button className="flex items-center space-x-2 text-white/70 hover:text-blue-400 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.engagement.comments}</span>
                </button>
                <button className="flex items-center space-x-2 text-white/70 hover:text-emerald-400 transition-colors">
                  <Share className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.engagement.shares}</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-white/50">
                <span>🤖 AI Verified</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
