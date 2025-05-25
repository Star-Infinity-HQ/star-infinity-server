import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma service for database operations.
 * Handles connection lifecycle and provides database client.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  /**
   * Initialize Prisma connection when module starts.
   */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /**
   * Disconnect Prisma when module is destroyed.
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /**
   * Clean disconnect method for graceful shutdown.
   */
  async enableShutdownHooks(app: any): Promise<void> {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
