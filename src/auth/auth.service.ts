import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../shared/database/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponse, RefreshTokenResponse } from './interfaces/auth-response.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';

/**
 * Authentication service handling user login, registration, and token management.
 * Implements secure authentication with bcrypt password hashing and JWT tokens.
 */
@Injectable()
export class AuthService {
  private readonly saltRounds = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Authenticate a user with email and password.
   *
   * @param loginDto - Login credentials
   * @returns Authentication response with tokens and user info
   * @throws UnauthorizedException if credentials are invalid
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Find user with password
    const userWithPassword = await this.usersService.findByEmailWithPassword(email);

    if (!userWithPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userWithPassword.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate tokens
    const tokens = await this.generateTokens(userWithPassword.user);

    return {
      ...tokens,
      user: userWithPassword.user,
      tokenType: 'Bearer',
    };
  }

  /**
   * Register a new user.
   *
   * @param registerDto - Registration data
   * @returns Authentication response with tokens and user info
   * @throws ConflictException if user already exists
   * @throws BadRequestException if role is invalid
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { username, email, password, role } = registerDto;

    // Check if user already exists
    const existingUserByEmail = await this.usersService.findByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictException('User with this email already exists');
    }

    const existingUserByUsername = await this.usersService.findByUsername(username);
    if (existingUserByUsername) {
      throw new ConflictException('User with this username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    let newUser: User;

    try {
      // Create user based on role
      switch (role) {
        case UserRole.ADMIN:
          const admin = await this.prisma.admin.create({
            data: {
              username,
              email,
              password: hashedPassword,
            },
          });
          newUser = new User(admin, UserRole.ADMIN);
          break;

        case UserRole.INSTRUCTOR:
          const instructor = await this.prisma.instructor.create({
            data: {
              username,
              email,
              password: hashedPassword,
              instructorDescription: '',
              instructorBio: '',
              instructorAddress: '',
              instructorTimezone: 'UTC',
            },
          });
          newUser = new User(instructor, UserRole.INSTRUCTOR);
          break;

        case UserRole.STUDENT:
          // TODO: Implement student creation when Student model is available
          throw new BadRequestException('Student registration not yet implemented');

        default:
          throw new BadRequestException('Invalid role specified');
      }

      // Generate tokens
      const tokens = await this.generateTokens(newUser);

      return {
        ...tokens,
        user: newUser,
        tokenType: 'Bearer',
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('User with this email or username already exists');
      }
      throw error;
    }
  }

  /**
   * Refresh access token using a valid refresh token.
   *
   * @param refreshTokenDto - Refresh token data
   * @returns New access and refresh tokens
   * @throws UnauthorizedException if refresh token is invalid
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponse> {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.secret') || 'your-super-secret-jwt-key-change-in-production',
      }) as JwtPayload;

      // Find user to ensure they still exist
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      return {
        ...tokens,
        tokenType: 'Bearer',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Verify if a token is valid.
   *
   * @param token - JWT token to verify
   * @returns Boolean indicating if token is valid
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret') || 'your-super-secret-jwt-key-change-in-production',
      }) as JwtPayload;

      // Check if user still exists
      const user = await this.usersService.findById(payload.sub);
      return !!user;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current user information.
   *
   * @param userId - The ID of the current user
   * @returns User information
   * @throws UnauthorizedException if user not found
   */
  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  /**
   * Generate access and refresh tokens for a user.
   *
   * @param user - User to generate tokens for
   * @returns Object containing access and refresh tokens with expiration info
   */
  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessTokenExpiresIn = this.configService.get<string>('jwt.accessTokenExpiresIn') || '15m';
    const refreshTokenExpiresIn = this.configService.get<string>('jwt.refreshTokenExpiresIn') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: accessTokenExpiresIn,
        issuer: this.configService.get<string>('jwt.issuer') || 'star-infinity-api',
        audience: this.configService.get<string>('jwt.audience') || 'star-infinity-client',
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: refreshTokenExpiresIn,
        issuer: this.configService.get<string>('jwt.issuer') || 'star-infinity-api',
        audience: this.configService.get<string>('jwt.audience') || 'star-infinity-client',
      }),
    ]);

    // Convert expiration time to seconds (assuming format like "15m", "1h", "7d")
    const expiresIn = this.parseExpirationTime(accessTokenExpiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Parse expiration time string to seconds.
   *
   * @param expirationTime - Time string like "15m", "1h", "7d"
   * @returns Expiration time in seconds
   */
  private parseExpirationTime(expirationTime: string): number {
    const timeValue = parseInt(expirationTime.slice(0, -1));
    const timeUnit = expirationTime.slice(-1);

    switch (timeUnit) {
      case 's':
        return timeValue;
      case 'm':
        return timeValue * 60;
      case 'h':
        return timeValue * 60 * 60;
      case 'd':
        return timeValue * 24 * 60 * 60;
      default:
        return 900; // Default to 15 minutes
    }
  }
}
