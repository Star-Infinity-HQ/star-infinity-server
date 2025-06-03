import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaService } from '../shared/database/prisma.service';

/**
 * Admin module for administrative functions and system management.
 * Provides dashboard data, system monitoring, and bulk operations.
 */
@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaService],
  exports: [AdminService],
})
export class AdminModule {}
