import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db, users, profiles } from "./db";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 10;

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: Function) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
    
    if (!user[0]) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = { id: user[0].id, email: user[0].email };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export const signUp = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const newUser = await db.insert(users).values({
      email,
      password: hashedPassword,
      fullName: fullName || "New User",
    }).returning();

    // Create profile
    await db.insert(profiles).values({
      id: newUser[0].id,
      fullName: fullName || "New User",
      username: `user_${newUser[0].id.slice(0, 8)}`,
    });

    // Generate JWT
    const token = jwt.sign(
      { id: newUser[0].id, email: newUser[0].email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        fullName: newUser[0].fullName,
      },
      token,
    });
  } catch (error) {
    console.error("Sign up error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user[0]) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user[0].password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user[0].id, email: user[0].email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      user: {
        id: user[0].id,
        email: user[0].email,
        fullName: user[0].fullName,
      },
      token,
    });
  } catch (error) {
    console.error("Sign in error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
    const profile = await db.select().from(profiles).where(eq(profiles.id, req.user.id)).limit(1);

    res.json({
      user: {
        id: user[0].id,
        email: user[0].email,
        fullName: user[0].fullName,
      },
      profile: profile[0] || null,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};