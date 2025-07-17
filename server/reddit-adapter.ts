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

    // Electronics detection
    if (combined.match(/\b(phone|laptop|camera|headphones|electronics|gadget|device|tech)\b/)) {
      const priceMatch = combined.match(/\$(\d+)/);
      if (priceMatch) {
        return {
          category: 'electronics',
          product: {
            id: nanoid(),
            name: post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title,
            price: priceMatch[1],
            currency: 'USD',
            trustGuarantee: post.score > 100
          }
        };
      }
    }

    // Fashion/Lifestyle detection
    if (combined.match(/\b(fashion|clothing|shoes|bag|style|wear|outfit)\b/)) {
      const priceMatch = combined.match(/\$(\d+)/);
      if (priceMatch) {
        return {
          category: 'fashion',
          product: {
            id: nanoid(),
            name: post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title,
            price: priceMatch[1],
            currency: 'USD',
            trustGuarantee: post.score > 50
          }
        };
      }
    }

    // Deal detection
    if (combined.match(/\b(deal|sale|discount|offer|cheap|price|buy)\b/)) {
      const priceMatch = combined.match(/\$(\d+)/);
      if (priceMatch) {
        return {
          category: 'deals',
          product: {
            id: nanoid(),
            name: post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title,
            price: priceMatch[1],
            currency: 'USD',
            trustGuarantee: post.score > 200
          }
        };
      }
    }

    return {};
  }

  private static getImageUrl(post: RedditPost): string | undefined {
    // Check if it's an image URL
    if (post.url && post.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return post.url;
    }

    // Check preview images
    if (post.preview?.images?.[0]?.source?.url) {
      return post.preview.images[0].source.url.replace(/&amp;/g, '&');
    }

    // Use thumbnail if it's not default Reddit thumbnail
    if (post.thumbnail && post.thumbnail !== 'self' && post.thumbnail !== 'default' && post.thumbnail.startsWith('http')) {
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