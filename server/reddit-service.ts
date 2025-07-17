// Using built-in fetch in Node.js 18+

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

interface RedditResponse {
  data: {
    children: Array<{
      data: RedditPost;
    }>;
  };
}

class RedditService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const auth = Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64');
    
    console.log('Requesting Reddit access token...');
    console.log('Client ID exists:', !!process.env.REDDIT_CLIENT_ID);
    console.log('Client Secret exists:', !!process.env.REDDIT_CLIENT_SECRET);
    console.log('User Agent:', process.env.REDDIT_USER_AGENT);
    
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': process.env.REDDIT_USER_AGENT || 'GlobalSocial/1.0'
      },
      body: 'grant_type=client_credentials'
    });

    console.log('Reddit auth response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Reddit auth error response:', errorText);
      throw new Error(`Reddit auth failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json() as any;
    
    if (!data.access_token) {
      throw new Error('No access token received from Reddit');
    }
    
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);
    
    console.log('Reddit access token obtained successfully');
    return this.accessToken;
  }

  async searchLocalSubreddit(location: string): Promise<string | null> {
    try {
      // Use predefined city-based subreddits for better reliability
      const citySubreddits = {
        'New York': 'nyc',
        'Tokyo': 'Tokyo', 
        'London': 'london',
        'Berlin': 'berlin',
        'Sydney': 'sydney',
        'Paris': 'paris',
        'Toronto': 'toronto',
        'Mumbai': 'mumbai'
      };

      const citySubreddit = citySubreddits[location as keyof typeof citySubreddits];
      if (citySubreddit) {
        console.log(`Using predefined subreddit for ${location}: r/${citySubreddit}`);
        return citySubreddit;
      }

      // If no predefined subreddit, try search with public API
      try {
        const searchResponse = await fetch(`https://www.reddit.com/subreddits/search.json?q=${encodeURIComponent(location)}&limit=5`, {
          headers: {
            'User-Agent': process.env.REDDIT_USER_AGENT || 'GlobalSocial/1.0'
          }
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json() as RedditResponse;
          if (searchData.data && searchData.data.children) {
            const subreddits = searchData.data.children
              .filter(sub => sub.data.subscribers > 10000)
              .sort((a, b) => b.data.subscribers - a.data.subscribers);
            
            const foundSubreddit = subreddits.length > 0 ? subreddits[0].data.display_name : null;
            if (foundSubreddit) {
              console.log(`Found subreddit for ${location}: r/${foundSubreddit}`);
            }
            return foundSubreddit;
          }
        }
      } catch (searchError) {
        console.log('Subreddit search failed, using default location subreddits');
      }

      return null;
    } catch (error) {
      console.error('Error searching local subreddit:', error);
      return null;
    }
  }

  async getSubredditPosts(subreddit: string, limit: number = 25): Promise<RedditPost[]> {
    try {
      // Try authenticated API first
      if (process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET) {
        try {
          const token = await this.getAccessToken();
          const response = await fetch(`https://oauth.reddit.com/r/${subreddit}/hot?limit=${limit}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'User-Agent': process.env.REDDIT_USER_AGENT || 'GlobalSocial/1.0'
            }
          });

          if (response.ok) {
            const data = await response.json() as RedditResponse;
            if (data.data && data.data.children) {
              console.log(`Successfully fetched ${data.data.children.length} posts from r/${subreddit} via OAuth`);
              return data.data.children.map(child => child.data);
            }
          }
        } catch (authError) {
          console.log(`OAuth failed for r/${subreddit}, trying public JSON...`);
        }
      }

      // Fallback to public JSON API (no authentication required)
      const publicResponse = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`, {
        headers: {
          'User-Agent': process.env.REDDIT_USER_AGENT || 'GlobalSocial/1.0'
        }
      });

      if (!publicResponse.ok) {
        console.error(`Public Reddit API error for r/${subreddit}: ${publicResponse.status} ${publicResponse.statusText}`);
        return [];
      }

      const publicData = await publicResponse.json() as RedditResponse;
      
      if (!publicData.data || !publicData.data.children) {
        console.error(`Invalid public Reddit response for r/${subreddit}`);
        return [];
      }
      
      console.log(`Successfully fetched ${publicData.data.children.length} posts from r/${subreddit} via public JSON`);
      return publicData.data.children.map(child => child.data);
      
    } catch (error) {
      console.error(`Error fetching posts from r/${subreddit}:`, error);
      return [];
    }
  }

  async getCategorizedPosts(location?: string): Promise<{
    travel: RedditPost[];
    deals: RedditPost[];
    electronics: RedditPost[];
    local: RedditPost[];
    lifestyle: RedditPost[];
  }> {
    const subredditCategories = {
      travel: ['travel', 'solotravel', 'AskTravel', 'travelsafety'],
      deals: ['deals', 'BuyItForLife', 'CostcoDeals', 'BeautyDeals'],
      electronics: ['electronics', 'gadgets', 'BuyItForLife', 'deals'],
      lifestyle: ['malefashionadvice', 'SkincareAddiction', 'handmade', 'smallbusiness'],
    };

    const results = {
      travel: [] as RedditPost[],
      deals: [] as RedditPost[],
      electronics: [] as RedditPost[],
      local: [] as RedditPost[],
      lifestyle: [] as RedditPost[]
    };

    // Fetch posts from each category
    for (const [category, subreddits] of Object.entries(subredditCategories)) {
      for (const subreddit of subreddits) {
        const posts = await this.getSubredditPosts(subreddit, 5);
        results[category as keyof typeof results].push(...posts);
      }
    }

    // Try to find local subreddit if location provided
    if (location) {
      const localSubreddit = await this.searchLocalSubreddit(location);
      if (localSubreddit) {
        const localPosts = await this.getSubredditPosts(localSubreddit, 10);
        results.local = localPosts;
      }
    }

    return results;
  }
}

export const redditService = new RedditService();

// Enhanced service with database integration
export class EnhancedRedditService extends RedditService {
  async getCategorizedPostsWithStorage(location?: string) {
    const posts = await this.getCategorizedPosts(location);
    
    // Store posts in database for multi-agent processing
    const { redditStorage } = await import('./reddit-storage');
    
    for (const [category, categoryPosts] of Object.entries(posts)) {
      for (const post of categoryPosts) {
        try {
          // Extract product info and process for storage
          const processedData = {
            category,
            extractedProducts: this.extractProductsFromPost(post),
            aiTags: this.generateAiTags(post),
            trustMetrics: this.calculateTrustMetrics(post),
            agentContext: {
              subreddit: post.subreddit,
              engagement: post.score + post.num_comments,
              contentType: post.is_video ? 'video' : 'text',
              hasProducts: this.hasProducts(post)
            }
          };
          
          await redditStorage.storeRedditContent(post, processedData);
        } catch (error) {
          console.error(`Failed to store Reddit post ${post.id}:`, error);
        }
      }
    }
    
    return posts;
  }

  private extractProductsFromPost(post: any) {
    const combined = `${post.title} ${post.selftext}`.toLowerCase();
    const products = [];
    
    // Extract price patterns
    const priceMatches = combined.match(/\$(\d+(?:\.\d{2})?)/g);
    if (priceMatches) {
      products.push({
        prices: priceMatches,
        title: post.title.substring(0, 100),
        url: post.url
      });
    }
    
    return products;
  }

  private generateAiTags(post: any) {
    const tags = [];
    const combined = `${post.title} ${post.selftext}`.toLowerCase();
    
    if (combined.includes('deal') || combined.includes('sale')) tags.push('deal');
    if (combined.includes('review')) tags.push('review');
    if (combined.includes('recommendation')) tags.push('recommendation');
    if (combined.includes('help') || combined.includes('advice')) tags.push('advice');
    
    return tags;
  }

  private calculateTrustMetrics(post: any) {
    return {
      score: post.score,
      commentRatio: post.num_comments / Math.max(post.score, 1),
      trustLevel: post.score > 100 ? 'high' : post.score > 20 ? 'medium' : 'low'
    };
  }

  private hasProducts(post: any) {
    const combined = `${post.title} ${post.selftext}`.toLowerCase();
    return /\$\d+|\bprice\b|\bbuy\b|\bsell\b|\bstore\b/.test(combined);
  }
}

export const enhancedRedditService = new EnhancedRedditService();