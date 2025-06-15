
import { useState } from "react";
import { Verified, TrendingUp } from "lucide-react";
import { CustomIcons } from "./CustomIcons";

export const SocialFeed = () => {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const handleLike = (postId: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
    } else {
      newLiked.add(postId);
    }
    setLikedPosts(newLiked);
  };

  const feedPosts = [
    {
      id: "1",
      user: { name: "Maya Chen", handle: "@mayatech", avatar: "🦋", verified: true, trustScore: 96.8 },
      location: "Tokyo, Japan",
      content: "Found this incredible vintage camera at a local market! The seller's story behind it is amazing - it belonged to a street photographer from the 80s 📸",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop",
      product: { name: "Vintage Pentax K1000", price: "$180", originalPrice: "$250" },
      likes: 2847,
      comments: 94,
      shares: 67,
      tags: ["#vintage", "#photography", "#tokyo"],
      aiInsight: "87% match for your interests"
    },
    {
      id: "2", 
      user: { name: "Alex Rivers", handle: "@alexcodes", avatar: "⚡", verified: false, trustScore: 82.3 },
      location: "São Paulo, Brazil",
      content: "My grandmother's recipe for brigadeiros! She taught me this when I was 8. Now I'm shipping these worldwide and sharing her legacy 🍫",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop",
      product: { name: "Authentic Brigadeiros (12-pack)", price: "$24", originalPrice: null },
      likes: 1203,
      comments: 156,
      shares: 89,
      tags: ["#food", "#family", "#tradition"],
      aiInsight: "New seller with growing trust"
    },
    {
      id: "3",
      user: { name: "Zara Okafor", handle: "@zarafashion", avatar: "👑", verified: true, trustScore: 94.1 },
      location: "Lagos, Nigeria", 
      content: "Sustainable fashion shouldn't be expensive. These earrings are made from recycled ocean plastic - every purchase removes 5 bottles from the sea 🌊",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop",
      product: { name: "Ocean Plastic Earrings", price: "$32", originalPrice: "$45" },
      likes: 5621,
      comments: 287,
      shares: 234,
      tags: ["#sustainable", "#fashion", "#ocean"],
      aiInsight: "Trending in your network"
    },
    {
      id: "4",
      user: { name: "Kai Nakamura", handle: "@kaivibes", avatar: "🎨", verified: false, trustScore: 89.2 },
      location: "Kyoto, Japan",
      content: "Street art from my morning walk. This piece speaks to me - it's about connection across cultures 🎭",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
      product: { name: "Limited Print Collection", price: "$45", originalPrice: "$65" },
      likes: 892,
      comments: 67,
      shares: 34,
      tags: ["#streetart", "#culture", "#kyoto"],
      aiInsight: "Rising creator in your area"
    },
    {
      id: "5",
      user: { name: "Luna Park", handle: "@lunabeats", avatar: "🎵", verified: true, trustScore: 93.5 },
      location: "Seoul, South Korea",
      content: "Late night studio session. This track is going to change everything. First 100 people get exclusive access 🎧",
      image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop",
      product: { name: "Exclusive Track Access", price: "$12", originalPrice: "$20" },
      likes: 3456,
      comments: 234,
      shares: 156,
      tags: ["#music", "#exclusive", "#seoul"],
      aiInsight: "Perfect for your playlist"
    }
  ];

  return (
    <div className="max-w-md mx-auto bg-white border-4 border-black">
      {/* Feed Header */}
      <div className="p-4 border-b-4 border-black bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-black uppercase tracking-tight">Global Feed</h2>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-lime-400 border-2 border-black rounded-full"></div>
            <span className="text-sm font-medium text-black">LIVE</span>
          </div>
        </div>
      </div>

      {/* Vertical Feed */}
      <div className="space-y-0">
        {feedPosts.map((post) => (
          <div key={post.id} className="border-b-4 border-black bg-white">
            {/* User Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 border-4 border-black flex items-center justify-center text-xl">
                  {post.user.avatar}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-black">{post.user.name}</span>
                    {post.user.verified && <Verified className="w-4 h-4 text-blue-500 fill-current" />}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{post.user.handle}</span>
                    <span>•</span>
                    <CustomIcons.Location className="w-3 h-3" />
                    <span>{post.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="px-2 py-1 bg-white border-2 border-black text-xs font-bold">
                  <CustomIcons.Trust className="w-3 h-3 inline mr-1" />
                  {post.user.trustScore}%
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
              <p className="text-black leading-relaxed mb-3">{post.content}</p>
              
              {/* Image */}
              <div className="mb-4">
                <img 
                  src={post.image} 
                  alt="Post content" 
                  className="w-full h-48 object-cover border-4 border-black"
                />
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 border-2 border-black text-xs font-medium text-black">
                    {tag}
                  </span>
                ))}
              </div>

              {/* AI Insight */}
              <div className="flex items-center space-x-2 mb-4 p-2 bg-lime-50 border-2 border-lime-400">
                <TrendingUp className="w-4 h-4 text-lime-600" />
                <span className="text-sm font-medium text-lime-800">{post.aiInsight}</span>
              </div>
            </div>

            {/* Product Card */}
            <div className="mx-4 mb-4 p-4 bg-gray-50 border-4 border-black">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-black">{post.product.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xl font-bold text-black">{post.product.price}</span>
                    {post.product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">{post.product.originalPrice}</span>
                    )}
                  </div>
                </div>
                <button className="px-4 py-2 bg-black text-white font-bold border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] transition-all duration-200 transform hover:translate-x-[-2px] hover:translate-y-[-2px] flex items-center space-x-2">
                  <CustomIcons.Shop className="w-4 h-4" />
                  <span>BUY NOW</span>
                </button>
              </div>
            </div>

            {/* Interaction Bar */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border-t-4 border-black">
              <div className="flex items-center space-x-6">
                <button 
                  onClick={() => handleLike(post.id)}
                  className="flex items-center space-x-2 group"
                >
                  <CustomIcons.Heart 
                    className={`w-6 h-6 transition-colors ${
                      likedPosts.has(post.id) 
                        ? 'text-red-500 fill-current' 
                        : 'text-black group-hover:text-red-500'
                    }`} 
                  />
                  <span className="font-medium text-black">{post.likes}</span>
                </button>
                
                <button className="flex items-center space-x-2 group">
                  <CustomIcons.Comment className="w-6 h-6 text-black group-hover:text-blue-500 transition-colors" />
                  <span className="font-medium text-black">{post.comments}</span>
                </button>
                
                <button className="flex items-center space-x-2 group">
                  <CustomIcons.Share className="w-6 h-6 text-black group-hover:text-green-500 transition-colors" />
                  <span className="font-medium text-black">{post.shares}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Indicator */}
      <div className="p-4 text-center bg-gray-50 border-t-4 border-black">
        <p className="text-sm text-gray-600 font-medium">Pull to refresh • Swipe for more</p>
      </div>
    </div>
  );
};
