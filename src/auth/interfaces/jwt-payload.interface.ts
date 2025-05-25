import { UserRole } from '../../users/enums/user-role.enum';

/**
 * JWT payload interface defining the structure of JWT token claims.
 * Contains essential user information for authentication and authorization.
 */
export interface JwtPayload {
  /**
   * User's unique identifier
   */
  sub: string;

  /**
   * User's email address
   */
  email: string;

  /**
   * User's role in the system
   */
  role: UserRole;

  /**
   * Token issued at timestamp
   */
  iat?: number;

  /**
   * Token expiration timestamp
   */
  exp?: number;

  /**
   * Token issuer
   */
  iss?: string;

  /**
   * Token audience
   */
  aud?: string;
}
