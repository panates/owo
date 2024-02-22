import 'reflect-metadata';
import { ApiOperation, HttpStatusCode, RESOURCE_METADATA } from '@opra/common';


describe('ApiOperation decorator', function () {

  afterAll(() => global.gc && global.gc());

  it('Should define Action operation metadata', async function () {
    class CustomersResource {
      @ApiOperation({description: 'any description'})
      sendMessage() {
      }
    }

    const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomersResource);
    expect(metadata).toStrictEqual({
      endpoints: {
        sendMessage: {
          kind: 'Operation',
          description: 'any description'
        }
      }
    });
  })

  it('Should Parameter() define query parameter', async function () {
    class CustomersResource {
      @ApiOperation()
          .Parameter('message', String)
      sendMessage() {
      }
    }

    const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomersResource);
    expect(metadata).toStrictEqual({
      endpoints: {
        sendMessage: {
          kind: 'Operation',
          parameters: [{
            in: 'query',
            name: 'message',
            type: String
          }]
        }
      }
    });
  })

  it('Should Header() define header parameter', async function () {
    class CustomersResource {
      @ApiOperation()
          .Header('x-id', String)
      sendMessage() {
      }
    }

    const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomersResource);
    expect(metadata).toStrictEqual({
      endpoints: {
        sendMessage: {
          kind: 'Operation',
          parameters: [{
            in: 'header',
            name: 'x-id',
            type: String
          }]
        }
      }
    });
  })

  it('Should Response(Type) define response options', async function () {
    class CustomersResource {
      @ApiOperation()
          .Response(String)
      sendMessage() {
      }
    }

    const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomersResource);
    expect(metadata).toStrictEqual({
      endpoints: {
        sendMessage: {
          kind: 'Operation',
          response: {
            type: String
          }
        }
      }
    });
  })

  it('Should Response({args}) define response options', async function () {
    class CustomersResource {
      @ApiOperation()
          .Response({
            type: String,
            description: 'response description',
            statusCode: HttpStatusCode.OK
          })
      sendMessage() {
      }
    }

    const metadata = Reflect.getMetadata(RESOURCE_METADATA, CustomersResource);
    expect(metadata).toStrictEqual({
      endpoints: {
        sendMessage: {
          kind: 'Operation',
          response: {
            type: String,
            description: 'response description',
            statusCode: HttpStatusCode.OK
          }
        }
      }
    });
  })


  //
  // /* ***************************************************** */
  // describe('@Collection.Create() decorator', function () {
  //   it('Should define Create operation metadata', async function () {
  //     class CountryResource {
  //       @Collection.Create({description: 'operation'})
  //       create() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       create: {description: 'operation', options: {}}
  //     });
  //   })
  //
  //   it('Should InputMaxContentSize() define metadata value', async function () {
  //     class CountryResource {
  //       @Collection.Create()
  //           .InputMaxContentSize(1000)
  //       create() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       create: {options: {inputMaxContentSize: 1000}}
  //     });
  //   })
  //
  //   it('Should InputPickFields() define metadata value', async function () {
  //     class CountryResource {
  //       @Collection.Create()
  //           .InputPickFields('_id', 'givenName')
  //       create() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       create: {options: {inputPickFields: ['_id', 'givenName']}}
  //     });
  //   })
  //
  //   it('Should InputOverwriteFields() define metadata value', async function () {
  //     class CountryResource {
  //       @Collection.Create()
  //           .InputOverwriteFields({
  //             extraField: {type: 'string'}
  //           })
  //       create() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       create: {
  //         options: {
  //           inputOverwriteFields: {
  //             extraField: {type: 'string'}
  //           }
  //         }
  //       }
  //     });
  //   })
  //
  //   it('Should InputOmitFields() define metadata value', async function () {
  //     class CountryResource {
  //       @Collection.Create()
  //           .InputOmitFields('_id', 'givenName')
  //       create() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       create: {options: {inputOmitFields: ['_id', 'givenName']}}
  //     });
  //   })
  //
  //   it('Should OutputPickFields() define metadata value', async function () {
  //     class CountryResource {
  //       @Collection.Create()
  //           .OutputPickFields('_id', 'givenName')
  //       create() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       create: {options: {outputPickFields: ['_id', 'givenName']}}
  //     });
  //   })
  //
  //   it('Should OutputOmitFields() define metadata value', async function () {
  //     class CountryResource {
  //       @Collection.Create()
  //           .OutputOmitFields('_id', 'givenName')
  //       create() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       create: {options: {outputOmitFields: ['_id', 'givenName']}}
  //     });
  //   })
  //
  // })
  //
  //
  // /* ***************************************************** */
  // describe('@Collection.Delete() decorator', function () {
  //   it('Should define Delete operation metadata', async function () {
  //     class CountryResource {
  //       @Collection.Delete({description: 'operation'})
  //       delete() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       delete: {description: 'operation', options: {}}
  //     });
  //   })
  // })
  //
  //
  // /* ***************************************************** */
  // describe('@Collection.DeleteMany() decorator', function () {
  //   it('Should define DeleteMany operation metadata', async function () {
  //     class CountryResource {
  //       @Collection.DeleteMany({description: 'operation'})
  //       deleteMany() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       deleteMany: {description: 'operation', options: {}}
  //     });
  //   })
  //
  //   it('Should Filter() define metadata value', async function () {
  //     class CountryResource {
  //       @Collection.DeleteMany()
  //           .Filter('_id', '=, !=')
  //           .Filter('givenName', ['=', '!=', 'like'])
  //       deleteMany() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       deleteMany: {
  //         options: {
  //           filters: [
  //             {field: '_id', operators: ['=', '!=']},
  //             {field: 'givenName', operators: ['=', '!=', 'like']},
  //           ]
  //         }
  //       }
  //     });
  //   })
  //
  // })
  //
  //
  // /* ***************************************************** */
  // describe('@Collection.Get() decorator', function () {
  //   it('Should define Get operation metadata', async function () {
  //     class CountryResource {
  //       @Collection.Get({description: 'operation'})
  //       get() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       get: {description: 'operation', options: {}}
  //     });
  //   })
  //
  //   it('Should OutputPickFields() define metadata value', async function () {
  //     class CountryResource {
  //       @Collection.Get()
  //           .OutputPickFields('_id', 'givenName')
  //       get() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       get: {options: {outputPickFields: ['_id', 'givenName']}}
  //     });
  //   })
  //
  //   it('Should OutputOmitFields() define metadata value', async function () {
  //     class CountryResource {
  //       @Collection.Get()
  //           .OutputOmitFields('_id', 'givenName')
  //       get() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       get: {options: {outputOmitFields: ['_id', 'givenName']}}
  //     });
  //   })
  //
  // })
  //
  //
  // /* ***************************************************** */
  // describe('@Collection.FindMany() decorator', function () {
  //   it('Should define FindMany operation metadata', async function () {
  //     class CountryResource {
  //       @Collection.FindMany({description: 'operation'})
  //       findMany() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       findMany: {description: 'operation', options: {}}
  //     });
  //   })
  //
  //   it('Should SortFields() define metadata value', async function () {
  //     class CountryResource {
  //       @Collection.FindMany()
  //           .SortFields('_id', 'givenName')
  //       findMany() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       findMany: {options: {sortFields: ['_id', 'givenName']}}
  //     });
  //   })
  //
  //   it('Should DefaultSort() define metadata value', async function () {
  //     class CountryResource {
  //       @Collection.FindMany()
  //           .DefaultSort('_id', 'givenName')
  //       findMany() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       findMany: {options: {defaultSort: ['_id', 'givenName']}}
  //     });
  //   })
  //
  //   it('Should OutputPickFields() define metadata value', async function () {
  //     class CountryResource {
  //       @Collection.FindMany()
  //           .OutputPickFields('_id', 'givenName')
  //       findMany() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       findMany: {options: {outputPickFields: ['_id', 'givenName']}}
  //     });
  //   })
  //
  //   it('Should OutputOmitFields() define metadata value', async function () {
  //     class CountryResource {
  //       @Collection.FindMany()
  //           .OutputOmitFields('_id', 'givenName')
  //       findMany() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       findMany: {options: {outputOmitFields: ['_id', 'givenName']}}
  //     });
  //   })
  //
  // })
  //
  //
  // /* ***************************************************** */
  // describe('@Collection.Update() decorator', function () {
  //   it('Should define Update operation metadata', async function () {
  //     class CountryResource {
  //       @Collection.Update({description: 'operation'})
  //       update() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       update: {description: 'operation', options: {}}
  //     });
  //   })
  //
  //   it('Should InputMaxContentSize() define metadata value', async function () {
  //     class CountryResource {
  //       @Collection.Update()
  //           .InputMaxContentSize(1000)
  //       update() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       update: {options: {inputMaxContentSize: 1000}}
  //     });
  //   })
  //
  //   it('Should InputPickFields() define metadata value', async function () {
  //     class CountryResource {
  //       @Collection.Update()
  //           .InputPickFields('_id', 'givenName')
  //       update() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       update: {options: {inputPickFields: ['_id', 'givenName']}}
  //     });
  //   })
  //
  //   it('Should InputOverwriteFields() define metadata value', async function () {
  //     class CountryResource {
  //       @Collection.Update()
  //           .InputOverwriteFields({
  //             extraField: {type: 'string'}
  //           })
  //       update() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       update: {
  //         options: {
  //           inputOverwriteFields: {
  //             extraField: {type: 'string'}
  //           }
  //         }
  //       }
  //     });
  //   })
  //
  //   it('Should InputOmitFields() define metadata value', async function () {
  //     class CountryResource {
  //       @Collection.Update()
  //           .InputOmitFields('_id', 'givenName')
  //       update() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       update: {options: {inputOmitFields: ['_id', 'givenName']}}
  //     });
  //   })
  //
  //   it('Should OutputPickFields() define metadata value', async function () {
  //     class CountryResource {
  //       @Collection.Update()
  //           .OutputPickFields('_id', 'givenName')
  //       update() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       update: {options: {outputPickFields: ['_id', 'givenName']}}
  //     });
  //   })
  //
  //   it('Should OutputOmitFields() define metadata value', async function () {
  //     class CountryResource {
  //       @Collection.Update()
  //           .OutputOmitFields('_id', 'givenName')
  //       update() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       update: {options: {outputOmitFields: ['_id', 'givenName']}}
  //     });
  //   })
  //
  // })
  //
  //
  // /* ***************************************************** */
  // describe('@Collection.UpdateMany() decorator', function () {
  //   it('Should define UpdateMany operation metadata', async function () {
  //     class CountryResource {
  //       @Collection.UpdateMany({description: 'operation'})
  //       updateMany() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       updateMany: {description: 'operation', options: {}}
  //     });
  //   })
  //
  //   it('Should InputMaxContentSize() define metadata value', async function () {
  //     class CountryResource {
  //       @Collection.UpdateMany()
  //           .InputMaxContentSize(1000)
  //       updateMany() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       updateMany: {options: {inputMaxContentSize: 1000}}
  //     });
  //   })
  //
  //   it('Should InputPickFields() define metadata value', async function () {
  //     class CountryResource {
  //       @Collection.UpdateMany()
  //           .InputPickFields('_id', 'givenName')
  //       updateMany() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       updateMany: {options: {inputPickFields: ['_id', 'givenName']}}
  //     });
  //   })
  //
  //
  //   it('Should InputOmitFields() define metadata value', async function () {
  //     class CountryResource {
  //       @Collection.UpdateMany()
  //           .InputOmitFields('_id', 'givenName')
  //       updateMany() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       updateMany: {options: {inputOmitFields: ['_id', 'givenName']}}
  //     });
  //   })
  //
  //
  //   it('Should Filter() define metadata value', async function () {
  //     class CountryResource {
  //       @Collection.UpdateMany()
  //           .Filter('_id', '=, !=')
  //           .Filter('givenName', ['=', '!=', 'like'])
  //       updateMany() {
  //       }
  //     }
  //
  //     const metadata = Reflect.getMetadata(RESOURCE_METADATA, CountryResource);
  //     expect(metadata.operations).toStrictEqual({
  //       updateMany: {
  //         options: {
  //           filters: [
  //             {field: '_id', operators: ['=', '!=']},
  //             {field: 'givenName', operators: ['=', '!=', 'like']},
  //           ]
  //         }
  //       }
  //     });
  //   })
  //
  //
  // })

});
