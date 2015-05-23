var vows   = require('vows')
  , path = require('path')
  , fs = require('fs')
  , assert = require('assert')
  , Unmarshaller = require('../lib/unmarshaller')
  , error_gallery = process.env.XMLRPC_ERROR_GALLERY


vows.describe('Unmarshaller').addBatch({

  'unmarshalMethodResponse() called with': {

    'bad input containing': {

      'broken xml': {
        topic: unmarshalMethodResponseFixture('bad_food/broken_xml.xml')
      , 'results in an error': assertError
      }

    , 'non-xmlrpc xml tags': {
        topic: unmarshalMethodResponseFixture('bad_food/unknown_tags.xml')
      , 'results in an error': assertError
      }

    , 'a bare sequence of params': {
        topic: unmarshalMethodResponseFixture('bad_food/just_params.xml')
      , 'results in an error': assertError
      }

    }

  , 'type': {

    'boolean': {
      'set to a true value': {
          topic: unmarshalMethodResponseFixture('good_food/boolean_true_response.xml')
        , 'does not return an error': assertOk
        , 'results in a true value': assertResponse(true)
        }
      , 'set to a false value': {
          topic: unmarshalMethodResponseFixture('good_food/boolean_false_response.xml')
        , 'does not return an error': assertOk
        , 'results in a false value': assertResponse(false)
        }
      , 'containing an illegal value': {
          topic: unmarshalMethodResponseFixture('bad_food/illegal_boolean_response.xml')
        , 'results in an error': assertError
        }
      }

    , 'datetime': {
        'set to valid ISO8601 date': {
          topic: unmarshalMethodResponseFixture('good_food/datetime_response.xml')
        , 'does not return an error': assertOk
        , 'results in a matching Date object': assertResponse(new Date(2012, 5, 8, 11, 35, 10))
        }
      , 'containing an illegal value': {
          topic: unmarshalMethodResponseFixture('bad_food/illegal_datetime_response.xml')
        , 'results in an error': assertError
        }
      }

    , 'base64': {
        topic: unmarshalMethodResponseFixture('good_food/base64_response.xml')
      , 'does not return an error': assertOk
      , 'results in the correct buffer': assertResponse(new Buffer('dGVzdGluZw==', 'base64'))
      }
      // No illegal base64 test. node just skips illegal chars, which is RFC conform.

    , 'double': {
        'set to ~\u03c0': {
          topic: unmarshalMethodResponseFixture('good_food/double_positive_response.xml')
        , 'does not return an error': assertOk
        , 'results in the correct number': assertResponse(3.141592654)
        }
      , 'set to -\u221a2': {
          topic: unmarshalMethodResponseFixture('good_food/double_negative_response.xml')
        , 'does not return an error': assertOk
        , 'results in the correct number': assertResponse(-1.41421)
        }
      , 'set to an illegal value': {
          topic: unmarshalMethodResponseFixture('bad_food/illegal_double_response.xml')
        , 'results in an error': assertError
        }
      }

    , 'int': {
        'set to a positive value': {
          topic: unmarshalMethodResponseFixture('good_food/int_positive_response.xml')
        , 'does not return an error': assertOk
        , 'results in the correct number': assertResponse(4)
        }
      , 'set to a negative value': {
          topic: unmarshalMethodResponseFixture('good_food/int_negative_response.xml')
        , 'does not return an error': assertOk
        , 'results in the correct number': assertResponse(-4)
        }
      , 'set to zero': {
          topic: unmarshalMethodResponseFixture('good_food/int_zero_response.xml')
        , 'does not return an error': assertOk
        , 'results in the correct number': assertResponse(0)
        }
      , 'set to an illegal value': {
          topic: unmarshalMethodResponseFixture('bad_food/illegal_int_response.xml')
        , 'results in an error': assertError
        }
      }

    , 'i4': {
        'set to a positive value': {
          topic: unmarshalMethodResponseFixture('good_food/i4_positive_response.xml')
        , 'does not return an error': assertOk
        , 'results in the correct number': assertResponse(4)
        }
      , 'set to a negative value': {
          topic: unmarshalMethodResponseFixture('good_food/i4_negative_response.xml')
        , 'does not return an error': assertOk
        , 'results in the correct number': assertResponse(-4)
        }
      , 'set to zero': {
          topic: unmarshalMethodResponseFixture('good_food/i4_zero_response.xml')
        , 'does not return an error': assertOk
        , 'results in the correct number': assertResponse(0)
        }
      , 'set to an illegal value': {
          topic: unmarshalMethodResponseFixture('bad_food/illegal_i4_response.xml')
        , 'results in an error': assertError
        }
      }

    , 'i8': {
        'set to a positive value': {
          topic: unmarshalMethodResponseFixture('good_food/i8_positive_response.xml')
        , 'does not return an error': assertOk
        , 'results in the correct string': assertResponse('4611686018427387904')
        }
      , 'set to a negative value': {
          topic: unmarshalMethodResponseFixture('good_food/i8_negative_response.xml')
        , 'does not return an error': assertOk
        , 'results in the correct string': assertResponse('-4611686018427387904')
        }
      , 'set to zero': {
          topic: unmarshalMethodResponseFixture('good_food/i8_zero_response.xml')
        , 'does not return an error': assertOk
        , 'results in the correct string': assertResponse('0')
        }
      , 'set to an illegal value': {
          topic: unmarshalMethodResponseFixture('bad_food/illegal_i8_response.xml')
        , 'results in an error': assertError
        }
      }

    , 'string': {
        'containing characters': {
          topic: unmarshalMethodResponseFixture('good_food/string_response.xml')
        , 'does not return an error': assertOk
        , 'results in the right string': assertResponse('testString')
        }
      , 'without content': {
          topic: unmarshalMethodResponseFixture('good_food/string_empty_response.xml')
        , 'does not return an error': assertOk
        , 'results in an empty string': assertResponse('')
        }
      , 'containing CDATA': {
          topic: unmarshalMethodResponseFixture('good_food/string_cdata_response.xml')
        , 'does not return an error': assertOk
        , 'results in the right string': assertResponse('<RE&UIRES-ESCAPING>')
        }
      }
    }

  , 'a param of unspecified type': {
      topic: unmarshalMethodResponseFixture('good_food/unspecified_type_response.xml')
    , 'does not return an error': assertOk
    , 'results in a string': assertResponse('testString')
    }

  , 'compound': {

      'array': {
        'containing simple values': {
          topic: unmarshalMethodResponseFixture('good_food/array_response.xml')
        , 'does not return an error': assertOk
        , 'results in the correct array': assertResponse([178, 'testString'])
        }
      , 'containing no values': {
          topic: unmarshalMethodResponseFixture('good_food/array_empty_response.xml')
        , 'does not return an error': assertOk
        , 'results in an empty array': assertResponse([])
        }
      , 'that has one nested ARRAY': {
          topic: unmarshalMethodResponseFixture('good_food/array_nested_response.xml')
        , 'does not return an error': assertOk
        , 'results in an array containing another array':
              assertResponse([178, 'testLevel1String', ['testString', 64]])
        }
      , 'that has a nested ARRAY followed by more simple values': {
          topic: unmarshalMethodResponseFixture('good_food/array_nested_with_trailing_values_response.xml')
        , 'does not return an error': assertOk
        , 'results in an array containing another array and the trailing values':
              assertResponse([178, 'testLevel1String', ['testString', 64], 'testLevel1StringAfter'])
        }
      }

    , 'struct': {
        'containing simple values': {
          topic: unmarshalMethodResponseFixture('good_food/struct_response.xml')
        , 'does not return an error': assertOk
        , 'results in a matching object': assertResponse({'the-Name': 'testValue'})
        }
      , 'containing an implicit string': {
          topic: unmarshalMethodResponseFixture('good_food/struct_implicit_string_response.xml')
        , 'does not return an error': assertOk
        , 'results in a matching object': assertResponse({'the-Name': 'testValue'})
        }
      , 'that has whitespace after the name element': {
          topic: unmarshalMethodResponseFixture('good_food/struct_with_whitespace_response.xml')
        , 'does not return an error': assertOk
        , 'results in a matching object': assertResponse({'the-Name': 'testValue'})
        }
      , 'containing another struct': {
          topic: unmarshalMethodResponseFixture('good_food/struct_nested_response.xml')
        , 'does not return an error': assertOk
        , 'results in a matching object':
            assertResponse( { theName: 'testValue'
                            , anotherName: { nestedName: 'nestedValue' }
                            , lastName: 'Smith'
                            })
        }
      }

    , 'fault': {
        'which includes error information': {
          topic: unmarshalMethodResponseFixture('good_food/fault.xml')
        , 'results in an error': assertError
        , 'which has all properties of a proper xmlrpc fault': function(error, r) {
            assert.strictEqual(error.message, 'XML-RPC fault: Too many parameters.')
            assert.strictEqual(error.faultString, 'Too many parameters.')
            assert.strictEqual(error.faultCode, 4)
          }
        }
      , 'which does not include error information': {
          topic: unmarshalMethodResponseFixture('good_food/fault_empty.xml')
        , 'results in an error': assertError
        }
      , 'that contains an empty string': {
          topic: unmarshalMethodResponseFixture('good_food/fault_explicit_empty.xml')
        , 'results in an error': assertError
        }
      }
    , 'a mix of everything': {
        topic: unmarshalMethodResponseFixture('good_food/grinder.xml')
      , 'does not return an error': assertOk
      , 'results in a matching object':
          assertResponse([ { theName: 'testValue'
                            , anotherName: {nestedName: 'nestedValue' }
                            , lastName: 'Smith'
                            }
                          , [ { yetAnotherName: 1999.26} , 'moreNested' ]
                         ])
      }
    , 'a very large response': {
        topic: unmarshalMethodResponseFixture('good_food/very_large_response.xml')
      , 'does not return an error': assertOk
      , 'results in a matching object': function(error, result) {
          var resultsFile = path.join(__dirname, 'fixtures', 'good_food', 'very_large_response_results.json')
          var jsonResult = fs.readFileSync(resultsFile, 'utf8')
          assert.equal(JSON.stringify(result), jsonResult)
        }
      }
    }
  }
}).export(module)

//==============================================================================
// Macros & Utilities
//==============================================================================

function fixtureStream(f) {
  return fs.createReadStream(path.join(__dirname, 'fixtures', f))
}

function unmarshalMethodResponseFixture(f) {
  return function() {
    var unmarshaller = new Unmarshaller()
    unmarshaller.unmarshalMethodResponse(fixtureStream(f), this.callback)
  }
}

function assertError(error, result) {
  assert.instanceOf(error, Error)
  assert.isUndefined(result)
  if (error_gallery) {
    console.log('' + error)
  }
}

function assertOk(error, result) {
  assert.isTrue( ! error)
}

function assertResponse(what) {
  return function(error, result) {
    assert.deepEqual(result, what)
  }
}

