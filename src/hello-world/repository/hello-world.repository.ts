import { Injectable } from '@nestjs/common';
import { HelloWorld } from './hello-world.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HelloWorldRepository {
  constructor(private readonly repository: Repository<HelloWorld>) {}
}
