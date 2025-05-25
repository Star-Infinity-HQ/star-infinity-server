import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';

/**
 * JWT authentication strategy for Passport.
 * Validates JWT tokens and extracts user information.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'your-super-secret-jwt-key-change-in-production',
      issuer: configService.get<string>('jwt.issuer') || 'star-infinity-api',
      audience: configService.get<string>('jwt.audience') || 'star-infinity-client',
    });
  }

  /**
   * Validates the JWT payload and returns the user.
   * This method is called automatically by Passport when a valid JWT is provided.
   *
   * @param payload - The decoded JWT payload
   * @returns The user object if validation succeeds
   * @throws UnauthorizedException if user is not found or invalid
   */
  async validate(payload: JwtPayload): Promise<User> {
    try {
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Verify that the role in the token matches the user's current role
      if (user.role !== payload.role) {
        throw new UnauthorizedException('Invalid token: role mismatch');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
