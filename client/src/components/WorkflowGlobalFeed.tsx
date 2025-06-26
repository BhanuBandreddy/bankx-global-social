import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Verified, Heart, MessageCircle, Share, Shield, Zap, ShoppingCart, Truck, Store, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  trustGuarantee: boolean;
}

interface User {
  id: string;
  name: string;
  trustScore: number;
  level: string;
  location: string;
}

interface FeedPost {
  id: string;
  userId: string;
  content: string;
  imageUrl: string;
  location: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  trustBoosts: number;
  aiInsight: string;
  trustInsight: string;
  createdAt: string;
  user: User;
  product: Product;
}

interface DeliveryOption {
  type: 'instore' | 'merchant-ship' | 'peer-delivery';
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  available: boolean;
}

export const WorkflowGlobalFeed = () => {
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [currentStep, setCurrentStep] = useState<'feed' | 'product' | 'escrow' | 'delivery'>('feed');
  const [escrowId, setEscrowId] = useState<string>('');
  const [selectedDelivery, setSelectedDelivery] = useState<string>('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [trustBoosts, setTrustBoosts] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const deliveryOptions: DeliveryOption[] = [
    {
      type: 'instore',
      label: 'Pick up in store',
      description: 'Visit the merchant location and collect your item personally',
      icon: Store,
      available: true
    },
    {
      type: 'merchant-ship',
      label: 'Merchant shipping',
      description: 'Chat with merchant to arrange shipping details',
      icon: Truck,
      available: true
    },
    {
      type: 'peer-delivery',
      label: 'Traveler delivery',
      description: 'Connect with verified travelers going to your location',
      icon: Users,
      available: true
    }
  ];

  useEffect(() => {
    fetchFeedPosts();
  }, []);

  const fetchFeedPosts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.request('/api/feed');
      setFeedPosts(response.posts || []);
    } catch (error) {
      console.error('Error fetching feed:', error);
      toast({
        title: "Feed Error",
        description: "Failed to load global feed posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleProductSelect = async (post: FeedPost) => {
    setSelectedPost(post);
    setCurrentStep('product');
    
    toast({
      title: "Product Selected",
      description: `${post.product.name} - Proceeding to secure payment`,
    });
  };

  const handleEscrowInitiate = async () => {
    if (!selectedPost?.product) return;

    try {
      const response = await apiClient.initiateEscrow({
        productId: selectedPost.product.id,
        feedPostId: selectedPost.id,
        amount: selectedPost.product.price,
        currency: selectedPost.product.currency
      });

      if (response.success) {
        setEscrowId(response.transaction.id);
        setCurrentStep('delivery');
        
        toast({
          title: "Escrow Created",
          description: `${selectedPost.product.currency} ${selectedPost.product.price} secured in escrow`,
        });
      }
    } catch (error) {
      console.error('Escrow error:', error);
      toast({
        title: "Escrow Error",
        description: "Failed to create escrow transaction",
        variant: "destructive"
      });
    }
  };

  const handleDeliverySelect = (deliveryType: string) => {
    setSelectedDelivery(deliveryType);
    
    toast({
      title: "Delivery Option Selected",
      description: `${deliveryType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} delivery method chosen`,
    });

    // Simulate workflow completion
    setTimeout(() => {
      setCurrentStep('feed');
      setSelectedPost(null);
      setEscrowId('');
      setSelectedDelivery('');
      
      toast({
        title: "Workflow Complete",
        description: "Transaction initiated successfully! You'll receive updates as it progresses.",
      });
    }, 2000);
  };

  const resetWorkflow = () => {
    setCurrentStep('feed');
    setSelectedPost(null);
    setEscrowId('');
    setSelectedDelivery('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 animate-spin" />
          <span>Loading global feed...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Workflow Progress Header */}
      {currentStep !== 'feed' && (
        <Card className="border-4 border-black">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Workflow Progress</span>
              <Button onClick={resetWorkflow} variant="outline" size="sm">
                Back to Feed
              </Button>
            </CardTitle>
            <div className="flex items-center space-x-4">
              <Badge variant={currentStep === 'product' ? 'default' : 'secondary'}>
                1. Product Selection
              </Badge>
              <Badge variant={currentStep === 'escrow' ? 'default' : 'secondary'}>
                2. Escrow Payment
              </Badge>
              <Badge variant={currentStep === 'delivery' ? 'default' : 'secondary'}>
                3. Delivery Options
              </Badge>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Feed View */}
      {currentStep === 'feed' && (
        <div className="space-y-6">
          <Card className="border-4 border-black">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Global Social Feed</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 border-2 border-black rounded-full animate-pulse" />
                  <span className="text-sm font-medium">LIVE</span>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {feedPosts.map((post) => (
            <Card key={post.id} className="border-4 border-black shadow-[4px_4px_0px_0px_#000]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-black rounded-full flex items-center justify-center text-white font-bold">
                      {post.user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">{post.user.name || 'User'}</span>
                        <Verified className="w-4 h-4 text-blue-500" />
                        <Badge variant="outline" className="text-xs">
                          Trust: {post.user.trustScore}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{post.location}</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-400 text-black border-2 border-black">
                    {post.user.level}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-gray-800">{post.content}</p>
                
                {post.imageUrl && (
                  <img 
                    src={post.imageUrl} 
                    alt="Post image"
                    className="w-full h-64 object-cover border-4 border-black"
                  />
                )}

                {/* Product Card */}
                {post.product && (
                  <Card className="border-2 border-gray-300 bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">{post.product.name}</h4>
                          <p className="text-lg font-bold text-green-600">
                            {post.product.currency} {post.product.price}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {post.product.trustGuarantee && (
                            <Badge className="bg-green-100 text-green-800 border border-green-300">
                              <Shield className="w-3 h-3 mr-1" />
                              Trust Guaranteed
                            </Badge>
                          )}
                          <Button
                            onClick={() => handleProductSelect(post)}
                            className="bg-blue-500 text-white border-2 border-black hover:bg-blue-600"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Buy Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI Insights */}
                <div className="space-y-2">
                  <Badge className="bg-purple-100 text-purple-800 border border-purple-300">
                    <Zap className="w-3 h-3 mr-1" />
                    {post.aiInsight}
                  </Badge>
                  <Badge className="bg-orange-100 text-orange-800 border border-orange-300">
                    <Shield className="w-3 h-3 mr-1" />
                    {post.trustInsight}
                  </Badge>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Separator />

                {/* Engagement Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={likedPosts.has(post.id) ? "text-red-500" : ""}
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="w-4 h-4 mr-1" />
                      {post.shares}
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTrustBoost(post.id)}
                    className={trustBoosts.has(post.id) ? "text-yellow-500" : ""}
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Trust Boost ({post.trustBoosts})
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Product Selection View */}
      {currentStep === 'product' && selectedPost && (
        <Card className="border-4 border-black">
          <CardHeader>
            <CardTitle>Confirm Product Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <img 
                src={selectedPost.imageUrl} 
                alt="Product"
                className="w-24 h-24 object-cover border-2 border-black"
              />
              <div>
                <h3 className="text-xl font-bold">{selectedPost.product.name}</h3>
                <p className="text-2xl font-bold text-green-600">
                  {selectedPost.product.currency} {selectedPost.product.price}
                </p>
                <p className="text-sm text-gray-600">Seller: {selectedPost.user.name}</p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Button 
                onClick={handleEscrowInitiate}
                className="flex-1 bg-green-500 text-white border-2 border-black hover:bg-green-600"
              >
                Secure Payment with Escrow
              </Button>
              <Button 
                onClick={resetWorkflow}
                variant="outline"
                className="border-2 border-black"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Options View */}
      {currentStep === 'delivery' && selectedPost && (
        <Card className="border-4 border-black">
          <CardHeader>
            <CardTitle>Choose Delivery Method</CardTitle>
            <p className="text-sm text-gray-600">
              Escrow ID: {escrowId} | Amount Secured: {selectedPost.product.currency} {selectedPost.product.price}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {deliveryOptions.map((option) => (
              <Card 
                key={option.type}
                className={`border-2 cursor-pointer transition-all ${
                  selectedDelivery === option.type 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handleDeliverySelect(option.type)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <option.icon className="w-6 h-6 text-blue-600" />
                    <div className="flex-1">
                      <h4 className="font-bold">{option.label}</h4>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                    {option.available && (
                      <Badge className="bg-green-100 text-green-800">Available</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};