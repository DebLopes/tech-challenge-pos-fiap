import { UserRole } from '../../../domain/entities/user-role';

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active?: boolean;
};
