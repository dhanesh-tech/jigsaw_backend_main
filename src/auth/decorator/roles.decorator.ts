import { SetMetadata } from '@nestjs/common';

export const USER_ROLE_KEY = 'role';
export const UserRole = (...role: string[]) => SetMetadata(USER_ROLE_KEY, role);
