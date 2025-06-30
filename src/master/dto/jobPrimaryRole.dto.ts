import { IsEnum } from 'class-validator';
import { PRIMARY_ROLE_DEPARTMENTS } from '../utilities/enum';

export class JobPrimaryRoleDto {
  title: string;

  @IsEnum(PRIMARY_ROLE_DEPARTMENTS)
  department: PRIMARY_ROLE_DEPARTMENTS;
}
