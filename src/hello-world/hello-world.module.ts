import { Module } from '@nestjs/common';
import { databaseProviders } from '../database/database.providers';
import { HelloWorldController } from './hello-world.controller';
import { HelloWorldService } from './hello-world.service';
import { HelloWorld } from './repository/hello-world.entity';
import { Connection } from 'typeorm';
import { HelloWorldRepository } from './repository/hello-world.repository';

@Module({
  imports: [],
  controllers: [HelloWorldController],
  providers: [
    HelloWorldService,
    ...databaseProviders,
    {
      provide: HelloWorldRepository,
      useFactory: (connection: Connection) =>
        connection.getRepository(HelloWorld),
      inject: ['DATABASE_CONNECTION'],
    },
  ],
})
export class HelloWorldModule {}
