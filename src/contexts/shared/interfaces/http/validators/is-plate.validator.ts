import { registerDecorator, ValidationOptions } from 'class-validator';
import { PlateVO } from '../../../domain/value-objects/plate.vo';

export function IsPlate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPlate',
      target: object.constructor,
      propertyName,
      options: {
        message: 'Invalid plate',
        ...validationOptions,
      },
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;
          return PlateVO.isValid(value);
        },
      },
    });
  };
}
