import { Module } from '@nestjs/common';
import { createConnection } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async () =>
        await createConnection({
          type: 'mysql',
          host: process.env.DATABASE_HOSTNAME || 'localhost',
          port: +process.env.DATABASE_PORT || 3306,
          username: process.env.DATABASE_USERNAME || 'root',
          password: process.env.DATABASE_PASSWORD,
          database: process.env.DATABASE_DATABASE,
          entities: [
            __dirname + '/../**/*.entity{.ts,.js}',
            //__dirname + '/models.ts',
          ],
          synchronize: true,
          namingStrategy: new SnakeNamingStrategy(),
        }),
    },
  ],
  exports: ['DATABASE_CONNECTION'],
})
export class DatabaseModule {}
