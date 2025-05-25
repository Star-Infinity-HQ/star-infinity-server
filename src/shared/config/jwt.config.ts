import { registerAs } from '@nestjs/config';

/**
 * JWT configuration for authentication tokens.
 * Provides secure defaults and environment-based configuration.
 */
export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  issuer: process.env.JWT_ISSUER || 'star-infinity-api',
  audience: process.env.JWT_AUDIENCE || 'star-infinity-client',
}));

/**
 * JWT configuration interface for type safety.
 */
export interface JwtConfig {
  secret: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
  issuer: string;
  audience: string;
}
