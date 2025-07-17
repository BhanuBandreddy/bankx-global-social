import { useQuery } from '@tanstack/react-query';

interface RedditFeedPost {
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

interface RedditFeedResponse {
  success: boolean;
  posts: RedditFeedPost[];
  total: number;
  categories: {
    travel: number;
    deals: number;
    electronics: number;
    local: number;
    lifestyle: number;
  };
}

export function useRedditFeed(location?: string, category?: string, limit: number = 20) {
  return useQuery<RedditFeedResponse>({
    queryKey: ['/api/reddit/feed', { location, category, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (category) params.append('category', category);
      params.append('limit', limit.toString());
      
      const response = await fetch(`/api/reddit/feed?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Reddit feed');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSubredditPosts(subreddit: string, limit: number = 25) {
  return useQuery({
    queryKey: ['/api/reddit/subreddit', subreddit, limit],
    queryFn: async () => {
      const response = await fetch(`/api/reddit/subreddit/${subreddit}?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch r/${subreddit}`);
      }
      return response.json();
    },
    enabled: !!subreddit,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLocalSubredditSearch(location: string) {
  return useQuery({
    queryKey: ['/api/reddit/search-local', location],
    queryFn: async () => {
      const response = await fetch(`/api/reddit/search-local/${encodeURIComponent(location)}`);
      if (!response.ok) {
        throw new Error(`Failed to search local subreddit for ${location}`);
      }
      return response.json();
    },
    enabled: !!location,
    staleTime: 60 * 60 * 1000, // 1 hour - local subreddits don't change often
  });
}