import type { Block, TemplateVariable, Theme } from '@email/core';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Persisted email template. `theme` and `blocks` use the `simple-json` column
 * type so the same schema works on MariaDB (production) and SQLite (tests).
 */
@Entity('templates')
export class TemplateEntity {
  /** Unique identifier (UUID). */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Human-readable template name. */
  @Column({ length: 120 })
  name!: string;

  /** Optional description. */
  @Column({ type: 'text', nullable: true })
  description!: string | null;

  /** The visual theme (palette, typography, layout). */
  @Column({ type: 'simple-json' })
  theme!: Theme;

  /** The ordered list of blocks. */
  @Column({ type: 'simple-json' })
  blocks!: Block[];

  /** Optional personalization variables (merge tags). */
  @Column({ type: 'simple-json', nullable: true })
  variables!: TemplateVariable[] | null;

  /** Opaque key identifying the owning visitor (hashed client id or IP). */
  @Index()
  @Column()
  ownerKey!: string;

  /** Creation timestamp. */
  @CreateDateColumn()
  createdAt!: Date;

  /** Last-update timestamp. */
  @UpdateDateColumn()
  updatedAt!: Date;
}
