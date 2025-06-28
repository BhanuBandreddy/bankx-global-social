import { useState, useEffect } from "react";
import { Verified, TrendingUp, Shield, Zap, ShoppingCart, Loader2 } from "lucide-react";
import { CustomIcons } from "./CustomIcons";
import { FeedActionTrigger } from "./FeedActionTrigger";
import { BlinkNotifications } from "./BlinkNotifications";
import { InlinePurchaseFlow } from "./InlinePurchaseFlow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";

interface CrowdHeatData {
  city: string;
  product_tag: string;
  demand_score: number;
  trend: 'rising' | 'falling' | 'stable';
  confidence: number;
  timestamp: string;
}

// Crowd Heat Badge Component
const CrowdHeatBadge = ({ location, productCategory }: { location: string, productCategory?: string }) => {
  const [heatData, setHeatData] = useState<CrowdHeatData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!location) return;
    
    const fetchHeatData = async () => {
      setIsLoading(true);
      try {
        const city = location.split(',')[0].trim(); // Extract city from "Paris, France"
        const response = await apiClient.get(`/api/crowd-heat/trending/${city}`);
        if (response.success && response.trending?.length > 0) {
          // Find matching product category or use top trending
          let targetData = response.trending[0];
          if (productCategory) {
            const match = response.trending.find((item: CrowdHeatData) => 
              item.product_tag.toLowerCase().includes(productCategory.toLowerCase())
            );
            if (match) targetData = match;
          }
          setHeatData(targetData);
        }
      } catch (error) {
        console.log('Crowd heat data not available');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeatData();
  }, [location, productCategory]);

  if (isLoading) {
    return (
      <Badge variant="outline" className="border-blue-200 bg-blue-50">
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        <span className="text-xs">Loading...</span>
      </Badge>
    );
  }

  if (!heatData) return null;

  const trendIcon = heatData.trend === 'rising' ? '↑' : heatData.trend === 'falling' ? '↓' : '→';
  const percentage = Math.round(heatData.demand_score * 100);
  const isHot = heatData.demand_score > 0.7;

  return (
    <Badge 
      variant="outline" 
      className={`${isHot ? 'bg-red-50 border-red-300 text-red-700' : 'bg-blue-50 border-blue-300 text-blue-700'} font-medium`}
      title={`Crowd intelligence: ${Math.round(heatData.confidence * 100)}% confidence`}
    >
      <span className="mr-1">🧭</span>
      <span className="text-xs font-medium">
        {heatData.product_tag.replace('-', ' ')} {trendIcon}{percentage}%
      </span>
    </Badge>
  );
};

export const SocialFeed = () => {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [trustBoosts, setTrustBoosts] = useState<Set<string>>(new Set());
  const [activePurchasePost, setActivePurchasePost] = useState<any>(null);

  const handleLike = (postId: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
    } else {
      newLiked.add(postId);
    }
    setLikedPosts(newLiked);
  };

  const handleTrustBoost = (postId: string) => {
    const newTrustBoosts = new Set(trustBoosts);
    if (newTrustBoosts.has(postId)) {
      newTrustBoosts.delete(postId);
    } else {
      newTrustBoosts.add(postId);
    }
    setTrustBoosts(newTrustBoosts);
  };

  const feedPosts = [
    {
      id: "1",
      userId: "550e8400-e29b-41d4-a716-446655440001",
      user: { 
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "Maya Chen", 
        handle: "@mayatech", 
        avatar: "🦋", 
        verified: true, 
        trustScore: 96.8, 
        trustLevel: "Oracle Master", 
        trustBadge: "🔮" 
      },
      location: "Tokyo, Japan",
      content: "Found this incredible vintage camera at a local market! The seller's story behind it is amazing - it belonged to a street photographer from the 80s 📸",
      productCategory: "electronics",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop",
      product: { 
        id: "650e8400-e29b-41d4-a716-446655440001",
        name: "Vintage Pentax K1000", 
        price: "180", 
        currency: "USD",
        originalPrice: "$250", 
        trustGuarantee: true 
      },
      likes: 2847,
      comments: 94,
      shares: 67,
      trustBoosts: 156,
      tags: ["#vintage", "#photography", "#tokyo"],
      aiInsight: "87% match for your interests",
      trustInsight: "Seller verified by 23 Oracle members"
    },
    {
      id: "2",
      userId: "550e8400-e29b-41d4-a716-446655440002", 
      user: { 
        id: "550e8400-e29b-41d4-a716-446655440002",
        name: "Alex Rivers", 
        handle: "@alexcodes", 
        avatar: "⚡", 
        verified: false, 
        trustScore: 82.3, 
        trustLevel: "Trust Warrior", 
        trustBadge: "⚔️" 
      },
      location: "São Paulo, Brazil",
      content: "My grandmother's recipe for brigadeiros! She taught me this when I was 8. Now I'm shipping these worldwide and sharing her legacy 🍫",
      productCategory: "food-specialties",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop",
      product: { 
        id: "650e8400-e29b-41d4-a716-446655440002",
        name: "Authentic Brigadeiros (12-pack)", 
        price: "24", 
        currency: "USD",
        originalPrice: null, 
        trustGuarantee: false 
      },
      likes: 1203,
      comments: 156,
      shares: 89,
      trustBoosts: 89,
      tags: ["#food", "#family", "#tradition"],
      aiInsight: "New seller with growing trust",
      trustInsight: "Building trust through authentic stories"
    },
    {
      id: "3",
      userId: "550e8400-e29b-41d4-a716-446655440003",
      user: { 
        id: "550e8400-e29b-41d4-a716-446655440003",
        name: "Zara Okafor", 
        handle: "@zarafashion", 
        avatar: "👑", 
        verified: true, 
        trustScore: 94.1, 
        trustLevel: "Eco Oracle", 
        trustBadge: "🌱" 
      },
      location: "Lagos, Nigeria", 
      content: "Sustainable fashion shouldn't be expensive. These earrings are made from recycled ocean plastic - every purchase removes 5 bottles from the sea 🌊",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop",
      product: { 
        id: "650e8400-e29b-41d4-a716-446655440003",
        name: "Ocean Plastic Earrings", 
        price: "32", 
        currency: "USD",
        originalPrice: "$45", 
        trustGuarantee: true 
      },
      likes: 5621,
      comments: 287,
      shares: 234,
      trustBoosts: 234,
      tags: ["#sustainable", "#fashion", "#ocean"],
      aiInsight: "Trending in your network",
      trustInsight: "Impact verified by environmental oracles"
    },
    {
      id: "4",
      userId: "550e8400-e29b-41d4-a716-446655440004",
      user: { 
        id: "550e8400-e29b-41d4-a716-446655440004",
        name: "Kai Nakamura", 
        handle: "@kaivibes", 
        avatar: "🎨", 
        verified: false, 
        trustScore: 89.2, 
        trustLevel: "Art Seeker", 
        trustBadge: "🎭" 
      },
      location: "Kyoto, Japan",
      content: "Street art from my morning walk. This piece speaks to me - it's about connection across cultures 🎭",
      productCategory: "local-crafts",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
      product: { 
        id: "650e8400-e29b-41d4-a716-446655440004",
        name: "Limited Print Collection", 
        price: "45", 
        currency: "USD",
        originalPrice: "$65", 
        trustGuarantee: false 
      },
      likes: 892,
      comments: 67,
      shares: 34,
      trustBoosts: 67,
      tags: ["#streetart", "#culture", "#kyoto"],
      aiInsight: "Rising creator in your area",
      trustInsight: "Authentic art backed by cultural oracles"
    },
    {
      id: "5",
      userId: "550e8400-e29b-41d4-a716-446655440005",
      user: { 
        id: "550e8400-e29b-41d4-a716-446655440005",
        name: "Luna Park", 
        handle: "@lunabeats", 
        avatar: "🎵", 
        verified: true, 
        trustScore: 93.5, 
        trustLevel: "Sound Oracle", 
        trustBadge: "🎧" 
      },
      location: "Seoul, South Korea", 
      content: "Late night studio session. This track is going to change everything. First 100 people get exclusive access 🎧",
      productCategory: "electronics",
      image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop",
      product: { 
        id: "650e8400-e29b-41d4-a716-446655440005",
        name: "Exclusive Track Access", 
        price: "12", 
        currency: "USD",
        originalPrice: "$20", 
        trustGuarantee: true 
      },
      likes: 3456,
      comments: 234,
      shares: 156,
      trustBoosts: 445,
      tags: ["#music", "#exclusive", "#seoul"],
      aiInsight: "Perfect for your playlist",
      trustInsight: "Quality guaranteed by music oracles"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Global Feed - Clean Mobile-First Design */}
      <div className="max-w-md mx-auto bg-white border-4 border-black">
        {/* Feed Header */}
        <div className="p-4 border-b-4 border-black bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-black uppercase tracking-tight">Global Feed</h2>
            <div className="flex items-center space-x-1 text-sm">
              <div className="w-2 h-2 bg-green-400 border border-black rounded-full animate-pulse"></div>
              <span className="text-green-600 font-bold">LIVE</span>
            </div>
          </div>
        </div>

        {/* Vertical Feed */}
        <div className="space-y-0">
          {feedPosts.map((post) => (
            <div key={post.id} className="border-b-4 border-black bg-white">
              {/* User Header with Trust Level */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 border-4 border-black flex items-center justify-center text-xl relative">
                    {post.user.avatar}
                    <div className="absolute -bottom-1 -right-1 text-xs">{post.user.trustBadge}</div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-black">{post.user.name}</span>
                      {post.user.verified && <Verified className="w-4 h-4 text-blue-500 fill-current" />}
                      <span className="px-2 py-1 bg-lime-200 border-2 border-black text-xs font-bold rounded">
                        {post.user.trustLevel}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{post.user.handle}</span>
                      <span>•</span>
                      <CustomIcons.Location className="w-3 h-3" />
                      <span>{post.location}</span>
                    </div>
                    {/* AgentTorch Crowd Heat Badge - Separate line for visibility */}
                    <div className="mt-1">
                      <CrowdHeatBadge 
                        location={post.location} 
                        productCategory={post.productCategory}
                      />
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
                <div className="mb-4 relative">
                  <img 
                    src={post.image} 
                    alt="Post content" 
                    className="w-full h-48 object-cover border-4 border-black"
                  />
                  {post.product.trustGuarantee && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-400 border-2 border-black text-xs font-bold flex items-center">
                      <Shield className="w-3 h-3 mr-1" />
                      TRUST GUARANTEED
                    </div>
                  )}
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
                <div className="flex items-center space-x-2 mb-2 p-2 bg-lime-50 border-2 border-lime-400">
                  <TrendingUp className="w-4 h-4 text-lime-600" />
                  <span className="text-sm font-medium text-lime-800">{post.aiInsight}</span>
                </div>

                {/* Trust Insight */}
                <div className="flex items-center space-x-2 mb-4 p-2 bg-blue-50 border-2 border-blue-400">
                  <CustomIcons.Trust className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">{post.trustInsight}</span>
                </div>
              </div>

              {/* Product Card with Contextual Blink Integration */}
              <div className="mx-4 mb-4 p-4 bg-gray-50 border-4 border-black">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-black">{post.product.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xl font-bold text-black">{post.product.price}</span>
                      {post.product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">{post.product.originalPrice}</span>
                      )}
                      {post.product.trustGuarantee && (
                        <span className="px-2 py-1 bg-green-200 border-2 border-black text-xs font-bold">
                          🛡️ PROTECTED
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={() => setActivePurchasePost(post)}
                      className="px-3 py-2 bg-black text-white font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] transition-all duration-200 transform hover:translate-x-[-1px] hover:translate-y-[-1px] text-sm"
                    >
                      Buy Now
                    </Button>
                    <FeedActionTrigger
                      action="inquire"
                      postId={post.id}
                      productData={post.product}
                      label="Ask Blink"
                      className="px-3 py-2 bg-purple-500 text-white font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] transition-all duration-200 transform hover:translate-x-[-1px] hover:translate-y-[-1px] text-sm"
                    />
                  </div>
                </div>
                
                {/* Trust Score for Product */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Trust Oracle Score</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-16 bg-gray-200 border border-black h-2">
                      <div className="bg-green-400 h-full" style={{width: `${post.user.trustScore}%`}}></div>
                    </div>
                    <span className="font-bold text-green-600">{post.user.trustScore}%</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Interaction Bar */}
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

                  <button 
                    onClick={() => handleTrustBoost(post.id)}
                    className="flex items-center space-x-2 group"
                  >
                    <Zap 
                      className={`w-6 h-6 transition-colors ${
                        trustBoosts.has(post.id) 
                          ? 'text-yellow-500 fill-current' 
                          : 'text-black group-hover:text-yellow-500'
                      }`} 
                    />
                    <span className="font-medium text-black">{post.trustBoosts}</span>
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

      {/* Inline Purchase Flow Drawer */}
      {activePurchasePost && (
        <InlinePurchaseFlow
          post={activePurchasePost}
          isOpen={!!activePurchasePost}
          onClose={() => setActivePurchasePost(null)}
        />
      )}
    </div>
  );
};
