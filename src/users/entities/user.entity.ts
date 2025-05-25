import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enums/user-role.enum';

/**
 * User entity representing a user in the system.
 * This is a unified representation that can map to Admin, Instructor, or Student.
 */
export class User {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '123',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Username for the user',
    example: 'john_doe',
    required: false,
  })
  username?: string;

  @ApiProperty({
    description: 'User role in the system',
    enum: UserRole,
    example: UserRole.STUDENT,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Date when the user was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the user was last modified',
    example: '2024-01-01T00:00:00.000Z',
  })
  modifiedAt: Date;

  /**
   * Constructor to create a User entity from database records.
   * @param data - Raw data from database (Admin, Instructor, or Student)
   * @param role - The role of the user
   */
  constructor(data: any, role: UserRole) {
    this.id = data.id?.toString();
    this.email = data.email;
    this.username = data.username;
    this.role = role;
    this.createdAt = data.createdAt;
    this.modifiedAt = data.modifiedAt;
  }
}
