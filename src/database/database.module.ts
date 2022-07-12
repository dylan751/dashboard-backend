import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

const databasePoolFactory = async (configService: ConfigService) => {
  return new Pool({
    user: configService.get('POSTGRES_USER'),
    host: configService.get('POSTGRES_HOST'),
    database: configService.get('POSTGRES_DB'),
    password: configService.get('POSTGRES_PASSWORD'),
    port: configService.get('POSTGRES_PORT'),
  });
};

const dbProvider = {
  provide: 'DATABASE_POOL',
  inject: [ConfigService],
  useFactory: databasePoolFactory,
};

@Module({
  imports: [ConfigModule],
  providers: [dbProvider],
  exports: [dbProvider],
})
export class DatabaseModule {}
