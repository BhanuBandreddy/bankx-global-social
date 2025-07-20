import { nanoid } from 'nanoid';

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  subreddit: string;
  url: string;
  thumbnail: string;
  score: number;
  num_comments: number;
  created_utc: number;
  permalink: string;
  is_video: boolean;
  domain: string;
  subscribers?: number;
  preview?: {
    images: Array<{
      source: {
        url: string;
        width: number;
        height: number;
      };
    }>;
  };
}

interface GlobalSocialPost {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
    trustScore: number;
    trustLevel: string;
    trustBadge: string;
  };
  location: string;
  content: string;
  productCategory?: string;
  image?: string;
  product?: {
    id: string;
    name: string;
    price: string;
    currency: string;
    originalPrice?: string;
    trustGuarantee: boolean;
  };
  likes: number;
  comments: number;
  shares: number;
  trustBoosts: number;
  tags: string[];
  aiInsight: string;
  trustInsight: string;
  source: 'reddit';
  redditData: {
    subreddit: string;
    permalink: string;
    redditScore: number;
    originalAuthor: string;
  };
}

export class RedditPostAdapter {
  private static getAvatarForUser(username: string): string {
    const avatars = ['🌟', '🎯', '🚀', '🎨', '🌈', '⚡', '🔥', '💎', '🌊', '🎭'];
    const hash = username.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return avatars[Math.abs(hash) % avatars.length];
  }

  private static getTrustLevel(score: number): { level: string; badge: string; trustScore: number } {
    if (score > 1000) return { level: 'Community Oracle', badge: '🏆', trustScore: 92 + Math.random() * 8 };
    if (score > 500) return { level: 'Trusted Contributor', badge: '⭐', trustScore: 85 + Math.random() * 7 };
    if (score > 100) return { level: 'Active Member', badge: '🎯', trustScore: 75 + Math.random() * 10 };
    return { level: 'Community Member', badge: '🌱', trustScore: 65 + Math.random() * 10 };
  }

  private static extractProductInfo(post: RedditPost): { product?: any; category?: string } {
    const title = post.title.toLowerCase();
    const content = post.selftext.toLowerCase();
    const combined = `${title} ${content}`;

    // Enhanced product detection with more patterns
    const productPatterns = {
      electronics: /\b(phone|laptop|camera|headphones|electronics|gadget|device|tech|gaming|console|pc|mac|iphone|android|tablet|smartwatch)\b/,
      fashion: /\b(fashion|clothing|shoes|sneakers|boots|bag|handbag|jacket|dress|shirt|style|wear|outfit|brand|designer)\b/,
      deals: /\b(deal|sale|discount|offer|cheap|price|buy|shopping|store|amazon|ebay|target|walmart)\b/,
      travel: /\b(hotel|flight|travel|trip|vacation|booking|airbnb|hostel|destination|tour)\b/,
      food: /\b(restaurant|food|coffee|menu|dining|recipe|cooking|kitchen|chef)\b/
    };

    // Determine category
    let category = 'general';
    for (const [cat, pattern] of Object.entries(productPatterns)) {
      if (pattern.test(combined)) {
        category = cat;
        break;
      }
    }

    // Enhanced price detection - multiple currencies and formats
    const priceMatches = combined.match(/[\$£€¥₹]\s*(\d+(?:\.\d{2})?)|(\d+(?:\.\d{2})?)\s*(?:usd|eur|gbp|cad|aud)/gi);
    
    if (priceMatches && priceMatches.length > 0) {
      // Extract the first price found
      const priceStr = priceMatches[0];
      const numMatch = priceStr.match(/(\d+(?:\.\d{2})?)/);
      
      if (numMatch) {
        const price = numMatch[1];
        const currency = priceStr.includes('$') ? 'USD' :
                        priceStr.includes('£') ? 'GBP' :
                        priceStr.includes('€') ? 'EUR' :
                        priceStr.includes('¥') ? 'JPY' :
                        priceStr.includes('₹') ? 'INR' : 'USD';

        return {
          category,
          product: {
            id: nanoid(),
            name: post.title.length > 60 ? post.title.substring(0, 60) + '...' : post.title,
            price: price,
            currency,
            trustGuarantee: post.score > 50 // Lower threshold for more products
          }
        };
      }
    }

    // If no price but product-related, still create entry for popular posts
    if (category !== 'general' && post.score > 100) {
      return {
        category,
        product: {
          id: nanoid(),
          name: post.title.length > 60 ? post.title.substring(0, 60) + '...' : post.title,
          price: 'Contact',
          currency: 'USD',
          trustGuarantee: post.score > 500
        }
      };
    }

    return { category: category !== 'general' ? category : undefined };
  }

  private static getImageUrl(post: RedditPost): string | undefined {
    // Check if it's a direct image URL
    if (post.url && post.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return post.url;
    }

    // Check for imgur, Reddit uploads, and other image hosts
    if (post.url) {
      // Imgur gallery/image conversion
      if (post.url.includes('imgur.com') && !post.url.includes('.jpg') && !post.url.includes('.png')) {
        const imgurId = post.url.split('/').pop();
        if (imgurId) {
          return `https://i.imgur.com/${imgurId}.jpg`;
        }
      }
      
      // Reddit media preview
      if (post.url.includes('i.redd.it') || post.url.includes('v.redd.it')) {
        return post.url;
      }
    }

    // Check preview images with proper URL decoding
    if (post.preview?.images?.[0]?.source?.url) {
      return post.preview.images[0].source.url.replace(/&amp;/g, '&');
    }

    // Enhanced thumbnail handling - only use quality thumbnails
    if (post.thumbnail && 
        post.thumbnail !== 'self' && 
        post.thumbnail !== 'default' && 
        post.thumbnail !== 'nsfw' &&
        post.thumbnail !== 'spoiler' &&
        post.thumbnail.startsWith('http') &&
        (post.thumbnail.includes('preview.redd.it') || post.thumbnail.includes('external-preview.redd.it'))) {
      return post.thumbnail;
    }

    return undefined;
  }

  private static generateTags(post: RedditPost): string[] {
    const tags = [`#${post.subreddit}`];
    const title = post.title.toLowerCase();
    
    if (title.includes('deal') || title.includes('sale')) tags.push('#deals');
    if (title.includes('travel') || title.includes('trip')) tags.push('#travel');
    if (title.includes('tech') || title.includes('electronics')) tags.push('#tech');
    if (title.includes('fashion') || title.includes('style')) tags.push('#fashion');
    if (title.includes('food') || title.includes('restaurant')) tags.push('#food');
    
    return tags.slice(0, 3); // Limit to 3 tags
  }

  static convertToGlobalSocialPost(post: RedditPost): GlobalSocialPost {
    const trustData = this.getTrustLevel(post.score);
    const { product, category } = this.extractProductInfo(post);
    const image = this.getImageUrl(post);

    return {
      id: `reddit_${post.id}`,
      userId: `reddit_${post.author}`,
      user: {
        id: `reddit_${post.author}`,
        name: post.author,
        handle: `@${post.author}`,
        avatar: this.getAvatarForUser(post.author),
        verified: post.score > 500,
        trustScore: Math.round(trustData.trustScore * 10) / 10,
        trustLevel: trustData.level,
        trustBadge: trustData.badge
      },
      location: `r/${post.subreddit}`,
      content: post.selftext || post.title,
      productCategory: category,
      image,
      product,
      likes: Math.floor(post.score * 0.8), // Simulate engagement
      comments: post.num_comments,
      shares: Math.floor(post.score * 0.1),
      trustBoosts: Math.floor(post.score * 0.2),
      tags: this.generateTags(post),
      aiInsight: this.generateAiInsight(post),
      trustInsight: this.generateTrustInsight(post),
      source: 'reddit',
      redditData: {
        subreddit: post.subreddit,
        permalink: post.permalink,
        redditScore: post.score,
        originalAuthor: post.author
      }
    };
  }

  private static generateAiInsight(post: RedditPost): string {
    if (post.score > 1000) return "🔥 Trending community favorite";
    if (post.score > 500) return "⭐ Highly recommended by community";
    if (post.score > 100) return "📈 Growing in popularity";
    if (post.num_comments > 50) return "💬 Active community discussion";
    return "🌟 Community shared content";
  }

  private static generateTrustInsight(post: RedditPost): string {
    if (post.score > 1000) return `Verified by ${post.score}+ community members`;
    if (post.score > 500) return `Trusted by ${post.score}+ users`;
    if (post.score > 100) return `Community validated content`;
    return `Shared by r/${post.subreddit} community`;
  }
}