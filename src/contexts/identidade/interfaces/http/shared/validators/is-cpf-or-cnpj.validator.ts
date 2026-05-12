import { registerDecorator, ValidationOptions } from 'class-validator';
import { DocumentVO } from '../../../../domain/value-objects/document.vo';

export function IsCPFOrCNPJ(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCpfOrCnpj',
      target: object.constructor,
      propertyName,
      options: {
        message: 'Invalid document (CPF or CNPJ expected)',
        ...validationOptions,
      },
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;
          return DocumentVO.isValid(value);
        },
      },
    });
  };
}
