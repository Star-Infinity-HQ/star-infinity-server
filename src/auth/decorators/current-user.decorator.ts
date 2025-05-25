import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

/**
 * Custom decorator to extract the current authenticated user from the request.
 * This decorator can be used in controller methods to get the user object.
 * 
 * @example
 * ```typescript
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, context: ExecutionContext): User | any => {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    // If a specific property is requested, return only that property
    if (data) {
      return user?.[data];
    }

    // Return the entire user object
    return user;
  },
);

/**
 * Decorator to extract the user ID from the current authenticated user.
 * 
 * @example
 * ```typescript
 * @Get('my-data')
 * getMyData(@UserId() userId: string) {
 *   return this.service.findByUserId(userId);
 * }
 * ```
 */
export const UserId = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    return user?.id;
  },
);

/**
 * Decorator to extract the user role from the current authenticated user.
 * 
 * @example
 * ```typescript
 * @Get('admin-only')
 * getAdminData(@UserRole() role: UserRole) {
 *   // role will be the current user's role
 * }
 * ```
 */
export const UserRoleDecorator = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    return user?.role;
  },
);
