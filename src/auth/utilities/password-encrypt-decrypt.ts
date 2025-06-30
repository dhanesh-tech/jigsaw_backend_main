import { BadRequestException } from '@nestjs/common';
import { pbkdf2Sync, randomBytes } from 'crypto';

/**
 * Validates a plain password against a hashed password.
 *
 * This function checks if the provided plain password, when hashed using the same
 * algorithm, salt, and iterations as the hashed password, matches the hashed password.
 *
 * @param plainPassword - The plain text password to validate.
 * @param hashedPassword - The hashed password to validate against, in the format
 *                         `algorithm$iterations$salt$hash`.
 * @returns `true` if the plain password matches the hashed password, `false` otherwise.
 * @throws {Error} If the hashing algorithm is not supported.
 */
export function validatePassword(
  plainPassword: string,
  hashedPassword: string,
): boolean {
  // Split the hash into its components
  const [algorithm, iterations, salt, storedHash] = hashedPassword.split('$');

  if (algorithm !== 'pbkdf2_sha256') {
    throw new BadRequestException(
      `Unsupported hashing algorithm: ${algorithm}`,
    );
  }

  // Convert iterations to an integer
  const iterationsNum = parseInt(iterations, 10);

  // Hash the plain password using the same salt and iterations
  const derivedKey = pbkdf2Sync(
    plainPassword,
    salt,
    iterationsNum,
    32,
    'sha256',
  ).toString('base64');

  // Compare the derived key with the stored hash
  return derivedKey === storedHash;
}

/**
 * Creates a password hash.
 * @param plainPassword The plain text password to hash.
 * @returns  password hash.
 */
export function createPasswordHash(plainPassword: string): string {
  const algorithm = 'pbkdf2_sha256';
  const iterations = 32000; // Default iterations
  const salt = randomBytes(16).toString('hex'); // Generate a random 16-byte salt

  // Generate the hash using PBKDF2
  const hash = pbkdf2Sync(
    plainPassword,
    salt,
    iterations,
    32,
    'sha256',
  ).toString('base64');

  // Combine to form hash string
  return `${algorithm}$${iterations}$${salt}$${hash}`;
}
