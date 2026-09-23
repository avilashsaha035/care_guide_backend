import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secure_jwt_secret_key_2026_note_taking_app';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  interests?: string[];
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: {
    _id: any;
    name: string;
    email: string;
    role: UserRole;
    interests: string[];
    createdAt: Date;
    updatedAt: Date;
  };
}

export class AuthService {
  private generateToken(userId: string, email: string, role: UserRole): string {
    return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
  }

  async register(dto: RegisterDTO): Promise<AuthResult> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    // Query supported by userSchema.index({ email: 1 }, { unique: true })
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      const error: any = new Error('A user with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const user = await User.create({
      name: dto.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: dto.role === 'admin' ? 'admin' : 'user',
      interests: Array.isArray(dto.interests) ? dto.interests : [],
    });

    const token = this.generateToken(user._id.toString(), user.email, user.role);

    return {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        interests: user.interests,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async login(dto: LoginDTO): Promise<AuthResult> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    // Query supported by userSchema.index({ email: 1 }, { unique: true })
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      const error: any = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const token = this.generateToken(user._id.toString(), user.email, user.role);

    return {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        interests: user.interests,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async getProfile(userId: string) {
    // Read operation supported by default _id index
    const user = await User.findById(userId).select('-password');
    if (!user) {
      const error: any = new Error('User profile not found.');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }
}

export const authService = new AuthService();
