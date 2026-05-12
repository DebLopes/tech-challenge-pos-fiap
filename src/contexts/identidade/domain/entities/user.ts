import { randomUUID } from 'crypto';
import { UserRole } from './user-role';

export type UserProps = {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
};

export class User {
  public readonly id: string;
  private props: UserProps;

  private constructor(props: UserProps, id?: string) {
    this.id = id ?? randomUUID();
    this.props = props;
  }

  static create(props: UserProps, id?: string): User {
    return new User(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get active(): boolean {
    return this.props.active;
  }
}
