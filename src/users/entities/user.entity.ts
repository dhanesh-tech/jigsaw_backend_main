import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LoginMethodConstants, USER_ROLE } from '../utilities/enum';
import { UserSkills } from 'src/user-skills/entities/userSkill.entity';
import { ReferralInvite } from 'src/referral/entities/referralInvites.entity';
import { AssignedAssessmentKit } from 'src/assign-assessment/entities/assignAssessment.entity';
import { generateShortUniqueUUID } from 'src/_jigsaw/helpersFunc';
import { UserTimezoneConstants } from 'src/_jigsaw/enums';
import { Exclude } from 'class-transformer';
import { UserMetaInfo } from './user-meta-info.entity';

/**
 * Represents a user entity in the system.
 *
 * @class User
 * @property {number} id - The primary key of the user.
 * @property {string} password - The password of the user (excluded from JSON responses).
 * @property {USER_ROLE} role - The role of the user.
 * @property {string} email - The email of the user (excluded from JSON responses).
 * @property {string} full_name - The full name of the user.
 * @property {boolean} is_superuser - Indicates if the user is a superuser.
 * @property {boolean} is_active - Indicates if the user is active.
 * @property {boolean} is_verified - Indicates if the user is verified.
 * @property {UserTimezoneConstants} timezone - The timezone of the user.
 * @property {string} hash_id - The unique hash ID of the user.
 * @property {string | null} referral_code - The referral code of the user.
 * @property {Date | null} last_login - The last login date of the user.
 * @property {Date} created_at - The creation date of the user record.
 * @property {Date} updated_at - The last update date of the user record.
 * @property {UserMetaInfo} user_meta_info - The meta information associated with the user.
 * @property {UserSkills[]} skills - The skills associated with the user.
 * @property {ReferralInvite} referral_invite - The referral invite associated with the user.
 * @property {AssignedAssessmentKit[]} assessments - The assessments assigned to the user.
 *
 * @method generateHashId - Generates a unique hash ID before inserting the user record.
 * @method toJSON - Converts the user entity to a JSON object, excluding the password.
 */
@Entity({ name: 'users_customuser' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @Column({ length: 128 })
  password: string;

  @Column({
    enum: USER_ROLE,
    type: 'enum',
  })
  @Index('idx-custom-user-role')
  role: string;

  @Exclude()
  @Column({ unique: true })
  email: string;

  @Column()
  @Index('idx-custom-user-full-name')
  full_name: string;

  @Column({ default: false })
  @Exclude()
  is_superuser: boolean;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_verified: boolean;

  @Column({
    enum: UserTimezoneConstants,
    type: 'enum',
  })
  timezone: string;

  @Column({ length: 20, unique: true })
  @Index('idx-custom-user-hash-id')
  hash_id: string;

  @Column({ length: 20, nullable: true, unique: true })
  @Index('idx-custom-user-referral-code')
  referral_code: string;

  @Column({ type: 'timestamptz', nullable: true })
  @Exclude()
  last_login: Date | null;

  @Column({
    enum: LoginMethodConstants,
    type: 'enum',
    nullable: true,
    default: LoginMethodConstants.email,
  })
  @Exclude()
  login_method: string;

  // Generate hash_id before insert
  @BeforeInsert()
  generateHashId() {
    this.hash_id = generateShortUniqueUUID(20);
  }

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;

  @OneToOne(() => UserMetaInfo, (metaInfo) => metaInfo.user_id)
  user_meta_info: UserMetaInfo;

  @OneToMany(() => UserSkills, (userSkill) => userSkill.user_id)
  skills: UserSkills[];

  @OneToOne(() => ReferralInvite, (refInvite) => refInvite.accepted_by_id)
  referral_invite: ReferralInvite;

  /**
   * A one-to-many relationship between the JobApplication entity and the AssignedAssessmentKit entity.
   */
  @OneToOne(
    () => AssignedAssessmentKit,
    (assignedAssessmentKit) => assignedAssessmentKit.candidate_id,
  )
  assessments: AssignedAssessmentKit;

  toJSON() {
    const otherProperties = { ...this };
    delete otherProperties.password;
    return otherProperties;
  }
}
