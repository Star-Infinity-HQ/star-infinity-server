import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

/**
 * JWT Authentication Guard.
 * Extends the default Passport JWT guard with custom logic.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * Determines if the request can be activated.
   * Checks for public routes and validates JWT tokens.
   * 
   * @param context - The execution context
   * @returns Boolean indicating if the request can proceed
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  /**
   * Handles authentication errors.
   * Provides custom error messages for different authentication failures.
   * 
   * @param err - The error that occurred
   * @param user - The user object (if any)
   * @param info - Additional information about the error
   * @returns The user if authentication succeeds
   * @throws UnauthorizedException with appropriate message
   */
  handleRequest(err: any, user: any, info: any): any {
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      if (info?.name === 'NotBeforeError') {
        throw new UnauthorizedException('Token not active');
      }
      
      throw new UnauthorizedException('Authentication failed');
    }

    return user;
  }
}
