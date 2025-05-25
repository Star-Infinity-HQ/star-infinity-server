/**
 * User role enumeration for role-based access control.
 * Defines the three main user types in the Star Infinity system.
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
}

/**
 * Helper function to check if a role is valid.
 * @param role - The role to validate
 * @returns True if the role is valid, false otherwise
 */
export function isValidUserRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

/**
 * Helper function to get all available roles.
 * @returns Array of all user roles
 */
export function getAllUserRoles(): UserRole[] {
  return Object.values(UserRole);
}
