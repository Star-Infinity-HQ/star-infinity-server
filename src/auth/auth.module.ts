import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { PrismaService } from '../shared/database/prisma.service';
import jwtConfig from '../shared/config/jwt.config';

/**
 * Authentication module providing JWT-based authentication.
 * Includes login, registration, token refresh, and role-based access control.
 */
@Module({
  imports: [
    // Configuration module for JWT settings
    ConfigModule.forFeature(jwtConfig),

    // Passport module for authentication strategies
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT module with async configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret') || 'your-super-secret-jwt-key-change-in-production',
        signOptions: {
          expiresIn: configService.get<string>('jwt.accessTokenExpiresIn') || '15m',
          issuer: configService.get<string>('jwt.issuer') || 'star-infinity-api',
          audience: configService.get<string>('jwt.audience') || 'star-infinity-client',
        },
      }),
      inject: [ConfigService],
    }),

    // Rate limiting module to prevent brute force attacks
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 3, // 3 requests per second
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 20, // 20 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Users module for user management
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    PrismaService,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    JwtModule,
    PassportModule,
  ],
})
export class AuthModule {}
