// Jest setup for NANDA integration tests
import { config } from 'dotenv';

// Load environment variables for testing
config();

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

// Global test timeout
jest.setTimeout(30000);