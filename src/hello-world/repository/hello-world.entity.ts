import {
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity()

export class HelloWorld {
  @PrimaryGeneratedColumn("uuid")
  id: string;
}