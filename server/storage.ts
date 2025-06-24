import { db, users, profiles, type User, type InsertUser, type Profile } from "./db";
import { eq } from "drizzle-orm";

// Database storage implementation using Drizzle ORM
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserProfile(userId: string): Promise<Profile | undefined>;
  createUserProfile(profile: any): Promise<Profile>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getUserProfile(userId: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
    return result[0] as Profile;
  }

  async createUserProfile(profile: any): Promise<Profile> {
    const result = await db.insert(profiles).values(profile).returning();
    return result[0] as Profile;
  }
}

export const storage = new DatabaseStorage();
