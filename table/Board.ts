import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity() // 테이블이라고 선언해주는 것
export class Board extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") // 기본키 선언 (속성중 increment는 자동으로 1씩 증가하는것, uuid는 각각 unique한 고유값)
  id!: string;

  @Column() // column이라고 선언해주는 것
  writer!: string;

  @Column()
  title!: string;

  @Column()
  contents!: string;

  @Column({ default: false })
  isDeleted!: boolean;
  
}
