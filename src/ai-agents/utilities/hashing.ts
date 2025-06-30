/**
 * Decodes a base64 encoded URL string back to its original form.
 * @param {string} hashedUrl - The base64 encoded URL string to decode
 * @returns {string} The decoded URL string in UTF-8 format
 */
export function dehashUrl(hashedUrl: string) {
  // Convert from base64 using Buffer
  const decoded = Buffer.from(hashedUrl, 'base64').toString('utf-8');
  return decoded;
}
