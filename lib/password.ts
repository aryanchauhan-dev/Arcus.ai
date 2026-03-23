import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashedPassword(password : string){
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string){
    return bcrypt.compare(password, hash);
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Must contain an uppercase letter";
  if (!/[0-9]/.test(password)) return "Must contain a number";
  if (!/[^A-Za-z0-9]/.test(password)) return "Must contain a special character";
  return null;
}
