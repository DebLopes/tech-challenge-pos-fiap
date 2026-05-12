import { UserRole } from '../../../domain/entities/user-role';

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
};
