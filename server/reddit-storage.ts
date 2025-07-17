import { db } from './db';
import { redditContent, redditSubreddits } from '../shared/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';

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

interface ProcessedRedditData {
  category?: string;
  extractedProducts?: any[];
  aiTags?: string[];
  trustMetrics?: any;
  agentContext?: any;
}

export class RedditStorage {
  // Store Reddit content for multi-agent workflow processing
  async storeRedditContent(
    post: RedditPost, 
    processedData: ProcessedRedditData
  ) {
    try {
      const existingPost = await db
        .select()
        .from(redditContent)
        .where(eq(redditContent.redditId, post.id))
        .limit(1);

      if (existingPost.length > 0) {
        // Update existing post
        await db
          .update(redditContent)
          .set({
            score: post.score,
            numComments: post.num_comments,
            processedContent: post.selftext || post.title,
            extractedProducts: processedData.extractedProducts,
            aiTags: processedData.aiTags,
            trustMetrics: processedData.trustMetrics,
            agentContext: processedData.agentContext,
            lastUpdated: new Date()
          })
          .where(eq(redditContent.redditId, post.id));

        return existingPost[0];
      } else {
        // Insert new post
        const [newPost] = await db
          .insert(redditContent)
          .values({
            redditId: post.id,
            subreddit: post.subreddit,
            title: post.title,
            content: post.selftext,
            author: post.author,
            score: post.score,
            numComments: post.num_comments,
            permalink: post.permalink,
            url: post.url,
            thumbnail: post.thumbnail,
            isVideo: post.is_video,
            domain: post.domain,
            createdUtc: new Date(post.created_utc * 1000),
            category: processedData.category,
            processedContent: post.selftext || post.title,
            extractedProducts: processedData.extractedProducts,
            aiTags: processedData.aiTags,
            trustMetrics: processedData.trustMetrics,
            agentContext: processedData.agentContext
          })
          .returning();

        return newPost;
      }
    } catch (error) {
      console.error('Error storing Reddit content:', error);
      throw error;
    }
  }

  // Track subreddits for dynamic discovery
  async trackSubreddit(
    name: string, 
    displayName: string, 
    subscribers: number, 
    category?: string, 
    location?: string
  ) {
    try {
      const existingSubreddit = await db
        .select()
        .from(redditSubreddits)
        .where(eq(redditSubreddits.name, name))
        .limit(1);

      if (existingSubreddit.length > 0) {
        // Update existing subreddit
        await db
          .update(redditSubreddits)
          .set({
            subscribers,
            lastFetched: new Date(),
            updatedAt: new Date()
          })
          .where(eq(redditSubreddits.name, name));

        return existingSubreddit[0];
      } else {
        // Insert new subreddit
        const [newSubreddit] = await db
          .insert(redditSubreddits)
          .values({
            name,
            displayName,
            subscribers,
            category,
            location,
            lastFetched: new Date()
          })
          .returning();

        return newSubreddit;
      }
    } catch (error) {
      console.error('Error tracking subreddit:', error);
      throw error;
    }
  }

  // Get stored Reddit content for multi-agent processing
  async getStoredContentByCategory(category: string, limit: number = 50) {
    try {
      return await db
        .select()
        .from(redditContent)
        .where(eq(redditContent.category, category))
        .orderBy(desc(redditContent.score))
        .limit(limit);
    } catch (error) {
      console.error('Error fetching stored Reddit content:', error);
      throw error;
    }
  }

  // Get subreddits for fetching
  async getActiveSubreddits(categories?: string[]) {
    try {
      const query = db
        .select()
        .from(redditSubreddits)
        .where(eq(redditSubreddits.isActive, true));

      if (categories && categories.length > 0) {
        query.where(and(
          eq(redditSubreddits.isActive, true),
          inArray(redditSubreddits.category, categories)
        ));
      }

      return await query;
    } catch (error) {
      console.error('Error fetching active subreddits:', error);
      throw error;
    }
  }

  // Store agent context for future multi-agent workflows
  async updateAgentContext(redditId: string, agentContext: any) {
    try {
      await db
        .update(redditContent)
        .set({
          agentContext,
          lastUpdated: new Date()
        })
        .where(eq(redditContent.redditId, redditId));
    } catch (error) {
      console.error('Error updating agent context:', error);
      throw error;
    }
  }

  // Get Reddit content with agent context for processing
  async getContentForAgentProcessing(limit: number = 100) {
    try {
      return await db
        .select()
        .from(redditContent)
        .where(eq(redditContent.agentContext, null))
        .orderBy(desc(redditContent.score))
        .limit(limit);
    } catch (error) {
      console.error('Error fetching content for agent processing:', error);
      throw error;
    }
  }
}

export const redditStorage = new RedditStorage();