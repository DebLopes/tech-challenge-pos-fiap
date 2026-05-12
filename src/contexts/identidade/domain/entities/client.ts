import { randomUUID } from 'crypto';
import { DocumentVO } from '../value-objects/document.vo';
import { EmailVO } from '../value-objects/email.vo';

export type ClientProps = {
  name: string;
  document: DocumentVO;
  email: EmailVO;
};

export class Client {
  public readonly id: string;
  private props: ClientProps;

  private constructor(props: ClientProps, id?: string) {
    this.id = id || randomUUID();
    this.props = props;
  }

  static create(
    input: { name: string; document: string; email: string },
    id?: string,
  ): Client {
    return new Client(
      {
        name: input.name,
        document: DocumentVO.parse(input.document),
        email: EmailVO.parse(input.email),
      },
      id,
    );
  }

  get name() {
    return this.props.name;
  }

  get document() {
    return this.props.document.value;
  }

  get email() {
    return this.props.email.value;
  }

  updateEmail(email: string) {
    this.props.email = EmailVO.parse(email);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.props.name,
      document: this.props.document.value,
      email: this.props.email.value,
    };
  }
}
