Dynamock is a script which facilitates AWS DynamoDB integration tests.

It does 3 things:

1. Starts local DynamoDB instance using [Dynalite](https://github.com/mhart/dynalite)
1. Creates schemas from existing [CloudFormation](http://aws.amazon.com/cloudformation/) stack file 
1. Preload data (fixtures). You can create fixtures using [dynamodump](https://github.com/bchew/dynamodump)

## Setting up Dynamock

It depends on dynalite and aws-sdk.

```
npm install dynalite
npm install aws-sdk
node dynamock.js <path/to/dynamodb.json> <path/to/fixtures.json>
```

## License

Copyright (C) 2014-2015 The Apache Software Foundation
Licensed under the Apache License, Version 2.0