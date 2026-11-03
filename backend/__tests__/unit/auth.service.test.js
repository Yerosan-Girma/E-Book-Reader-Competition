/**
 * Unit tests for auth.service.js
 * Tests business logic with mocked dependencies
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authSVC = require('../../src/services/auth.service');

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../src/repositories/user.repo');

const userRepo = require('../../src/repositories/user.repo');

describe('Auth Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        display_name: 'Test User',
        role: 'reader',
      };

      userRepo.findByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed-password');
      userRepo.create.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mock-jwt-token');

      const result = await authSVC.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      });

      expect(userRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(userRepo.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        displayName: 'Test User',
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: mockUser.id, role: mockUser.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should throw 409 error for duplicate email', async () => {
      const existingUser = { id: 1, email: 'test@example.com' };
      userRepo.findByEmail.mockResolvedValue(existingUser);

      await expect(
        authSVC.register({
          username: 'newuser',
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toMatchObject({
        message: 'Email already registered',
        status: 409,
      });

      expect(userRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(userRepo.create).not.toHaveBeenCalled();
    });

    it('should handle database constraint violation for username', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed-password');
      userRepo.create.mockRejectedValue({
        code: '23505',
        constraint: 'users_username_key',
      });

      await expect(
        authSVC.register({
          username: 'existinguser',
          email: 'new@example.com',
          password: 'password123',
        })
      ).rejects.toMatchObject({
        message: 'Username already registered',
        status: 409,
      });
    });

    it('should handle database constraint violation for email', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed-password');
      userRepo.create.mockRejectedValue({
        code: '23505',
        constraint: 'users_email_key',
      });

      await expect(
        authSVC.register({
          username: 'newuser',
          email: 'existing@example.com',
          password: 'password123',
        })
      ).rejects.toMatchObject({
        message: 'Email already registered',
        status: 409,
      });
    });

    it('should normalize email to lowercase', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed-password');
      userRepo.create.mockResolvedValue({ id: 1 });
      jwt.sign.mockReturnValue('token');

      await authSVC.register({
        username: 'testuser',
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      });

      expect(userRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
        })
      );
    });

    it('should use username as default display name', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed-password');
      userRepo.create.mockResolvedValue({ id: 1, role: 'reader' });
      jwt.sign.mockReturnValue('token');

      await authSVC.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: 'testuser',
        })
      );
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        display_name: 'Test User',
        role: 'reader',
      };

      userRepo.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-jwt-token');

      const result = await authSVC.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(userRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user).not.toHaveProperty('password_hash');
      expect(result.user).not.toHaveProperty('password_hash');
    });

    it('should throw 401 for invalid password', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashed-password',
      };

      userRepo.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        authSVC.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toMatchObject({
        message: 'Invalid email or password',
        status: 401,
      });
    });

    it('should throw 401 for non-existent user', async () => {
      userRepo.findByEmail.mockResolvedValue(null);

      await expect(
        authSVC.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toMatchObject({
        message: 'Invalid email or password',
        status: 401,
      });

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should normalize email to lowercase', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashed-password',
        role: 'reader',
      };

      userRepo.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token');

      await authSVC.login({
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      });

      expect(userRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return safe user object without sensitive data', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        display_name: 'Test User',
        role: 'reader',
        avatar_url: 'avatar.jpg',
      };

      userRepo.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token');

      const result = await authSVC.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user).toEqual({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        display_name: 'Test User',
        role: 'reader',
        avatar_url: 'avatar.jpg',
      });
      expect(result.user).not.toHaveProperty('password_hash');
      expect(result.user).toHaveProperty('avatar_url', 'avatar.jpg');
    });
  });

  describe('me', () => {
    it('should return user by ID', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        display_name: 'Test User',
        role: 'reader',
      };

      userRepo.findById.mockResolvedValue(mockUser);

      const result = await authSVC.me(1);

      expect(userRepo.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('should return null for non-existent user', async () => {
      userRepo.findById.mockResolvedValue(null);

      const result = await authSVC.me(999);

      expect(userRepo.findById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });
});
