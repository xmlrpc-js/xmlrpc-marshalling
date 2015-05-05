## The What

The xmlrpc-marshalling module is a pure JavaScript XML-RPC marshaller and 
unmarshaller that aims to atomically implement the XML-RPC protocol.

Pure JavaScript means that the [XML parsing](https://github.com/isaacs/sax-js)
and [XML building](https://github.com/robrighter/node-xml) use pure JavaScript
libraries, so no extra C dependencies or build requirements. 

## The How

### To Install

```bash
npm install xmlrpc-marshalling
```

### To Use

### Date/Time Formatting

XML-RPC dates are formatted according to ISO 8601. There are a number of
formatting options within the boundaries of the standard. The decoder detects
those formats and parses them automatically, but for encoding dates to ISO
8601 some options can be specified to match your specific implementation.


The formatting options can be set through
```xmlrpc.dateFormatter.setOpts(options);```, where the ```options```
parameter is an object, with the following (optional) boolean members:

* ```colons``` - enables/disables formatting the time portion with a colon as
separator (default: ```true```)
* ```hyphens``` - enables/disables formatting the date portion with a hyphen
as separator (default: ```false```)
* ```local``` - encode as local time instead of UTC (```true``` = local,
```false``` = utc, default: ```true```)
* ```ms``` - enables/disables output of milliseconds (default: ```false```)
* ```offset``` - enables/disables output of UTC offset in case of local time
(default: ```false```)


Default format: 20140101T11:20:00


UTC Example:
```javascript
xmlrpc.dateFormatter.setOpts({
  colons: true
, hyphens: true
, local: false
, ms: true
}) // encoding output: '2014-01-01T16:20:00.000Z'
```

Local date + offset example:
```javascript
xmlrpc.dateFormatter.setOpts({
  colons: true
, hyphens: true
, local: true
, ms: false
, offset: true
}) // encoding output: '2014-01-01T11:20:00-05:00'
```

### Custom Types
If you need to serialize to a specific format or need to handle custom data types
that are not supported by default, it is possible to extend the serializer
with a user-defined type for your specific needs.

A custom type can be defined as follows:
```javascript
var xmlrpc = require('xmlrpc');
var util = require('util');

// create your custom class
var YourType = function (raw) {
  xmlrpc.CustomType.call(this, raw);
};

// inherit everything
util.inherits(YourType, xmlrpc.CustomType);

// set a custom tagName (defaults to 'customType')
YourType.prototype.tagName = 'yourType';

// optionally, override the serializer
YourType.prototype.serialize = function (xml) {
  var value = somefunction(this.raw);
  return xml.ele(this.tagName).txt(value);
}
```

and then make your method calls, wrapping your variables inside your new type
definition:

```javascript
var client = xmlrpc.createClient('YOUR_ENDPOINT');
client.methodCall('YOUR_METHOD', [new YourType(yourVariable)], yourCallback);
```

### To Test

XML-RPC implementations must be precise so there are an extensive set of test 
cases in the test directory. [Vows](http://vowsjs.org/) is the testing 
framework.

To run the test suite:

`make test`

If submitting a bug fix, please update the appropriate test file too.


## The License (MIT)

Released under the MIT license. See the LICENSE file for the complete wording.


## Contributors

Thank you to all [the
authors](https://github.com/xmlrpc-js/xmlrpc-marshalling/graphs/contributors) and
everyone who has filed an issue to help make xmlrpc better.

