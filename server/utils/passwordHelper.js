import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a plain text password — stores as irreversible bcrypt hash
 * Even the database admin cannot read the original password
 */
export async function hashPassword(plainText) {
  return await bcrypt.hash(plainText, SALT_ROUNDS);
}

/**
 * Compare a plain text password against a stored bcrypt hash
 * Returns true if match, false if wrong password
 */
export async function comparePassword(plainText, storedHash) {
  return await bcrypt.compare(plainText, storedHash);
}
