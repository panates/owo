import { ApiProperty, DATATYPE_PROPERTIES } from '../src/index.js';

describe('Property() decorator', function () {

  it('Should define property metadata', async () => {
    class Animal {
      @ApiProperty({
        description: 'description',
        enum: ['a', 'b']
      })
      id: number;
    }

    const properties = Reflect.getMetadata(DATATYPE_PROPERTIES, Animal.prototype);
    expect(properties).toBeDefined();
    expect(properties).toStrictEqual({
      id: {
        name: 'id',
        type: Number,
        description: 'description',
        enum: ['a', 'b']
      }
    });
  })

  it('Should set design type if "type" is not defined', async () => {
    class Country {
      @ApiProperty()
      id: number;
      @ApiProperty()
      name: string;
    }

    class Person {
      @ApiProperty()
      country: Country;
    }

    const properties = Reflect.getMetadata(DATATYPE_PROPERTIES, Person.prototype);
    expect(properties).toBeDefined();
    expect(properties).toStrictEqual({
      country: {
        name: 'country',
        type: Country
      }
    });
  })

  it('Should validate if property name is string', async () => {
    const sym = Symbol('sym');

    class Person {
    }

    expect(() => ApiProperty({})(Person.prototype, sym)).toThrow('can\'t be used')

  })

});
