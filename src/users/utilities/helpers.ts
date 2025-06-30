import { v4 as uuidv4 } from 'uuid';

export function generateUserHashId(): string {
  return uuidv4();
}
