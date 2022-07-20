import * as bcrypt from 'bcrypt';

export function hashPassword(password: string, salt) {
  return bcrypt.hashSync(password, salt);
}

// export function comparePassword(password: string, hashedPassword: string) {
//   return bcrypt.compareSync(password, hashedPassword);
// }

export function comparePassword(
  password: string,
  salt: string,
  hashedPassword: string,
) {
  const encodedPassword = bcrypt.hashSync(password, salt);
  return encodedPassword.trim() === hashedPassword.trim();
}
