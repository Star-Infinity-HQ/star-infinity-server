import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/enums/user-role.enum';

/**
 * Decorator to specify required roles for accessing a route or controller.
 * Used in conjunction with the RolesGuard to implement role-based access control.
 * 
 * @param roles - Array of roles that are allowed to access the resource
 * 
 * @example
 * ```typescript
 * @Roles(UserRole.ADMIN)
 * @Get('admin-only')
 * getAdminData() {
 *   return 'This is admin-only data';
 * }
 * 
 * @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
 * @Get('staff-only')
 * getStaffData() {
 *   return 'This is for admins and instructors only';
 * }
 * ```
 */
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

/**
 * Decorator to mark a route as public (no authentication required).
 * Routes marked with this decorator will bypass JWT authentication.
 * 
 * @example
 * ```typescript
 * @Public()
 * @Post('login')
 * login(@Body() loginDto: LoginDto) {
 *   return this.authService.login(loginDto);
 * }
 * ```
 */
export const Public = () => SetMetadata('isPublic', true);

/**
 * Convenience decorators for specific roles
 */

/**
 * Decorator to restrict access to admin users only.
 */
export const AdminOnly = () => Roles(UserRole.ADMIN);

/**
 * Decorator to restrict access to instructor users only.
 */
export const InstructorOnly = () => Roles(UserRole.INSTRUCTOR);

/**
 * Decorator to restrict access to student users only.
 */
export const StudentOnly = () => Roles(UserRole.STUDENT);

/**
 * Decorator to allow access to both admin and instructor users.
 */
export const StaffOnly = () => Roles(UserRole.ADMIN, UserRole.INSTRUCTOR);

/**
 * Decorator to allow access to both instructor and student users.
 */
export const InstructorAndStudentOnly = () => Roles(UserRole.INSTRUCTOR, UserRole.STUDENT);
