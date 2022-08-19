export class User {
  userId: number;
  email: string;
  password?: string;
  salt?: string;
}

export type UserInfo = Omit<User, 'password'>;

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}
