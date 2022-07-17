export class User {
  id: number;
  username: string;
  password: string;
  salt?: string;
  email?: string;
  name?: string;
  role?: UserRole;
}

export type UserInfo = Omit<User, 'password'>;

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}
