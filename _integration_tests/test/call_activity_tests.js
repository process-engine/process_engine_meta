'use strict';

const should = require('should');

const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe.only('Call activity tests', () => {
  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should execute the process, which was specified in the call activity.', async () => {
    const processKey = 'call_activity_base_test';

    // Define the ingoing token object.
    const inToken = {
      operation: 'basic_test',
    };

    // Token, that should be returned from the process.
    const expectedToken = {
      current: 3,
      history: {
        StartEvent_1: inToken,
        XORSplit1: inToken,
        Task1: 1,
        CallActivity1: 2,
        FinalIncrement: 3,
        XORJoin1: 2,
      },
    };

    // Execute the process with the given token.
    const result = await testFixtureProvider.executeProcess(processKey, inToken);

    // Test, if the token result exists and is an object
    should(result).not.be.undefined();
    should(result).be.Object();

    // Compare the resulting token with the expecting token.
    result.should.be.eql(expectedToken);
  });

  it('should exectue one process which executes another process.', async () => {
    const processKey = 'call_activity_base_test';

    // Define the ingoing token
    const inToken = {
      operation: 'nested_test',
    };

    // Expected token object
    const expectedToken = {
      current: 6,
      history: {
        StartEvent1: inToken,
        XORSplit1: inToken,
        Task2: 2,
        CallActivity2: 5,
        FinalIncrement: 6,
      },
    };

    // Execute the process with the defined token
    const result = await testFixtureProvider.executeProcess(processKey, inToken);

    // Check, if the resulting token exists and is an object
    should(result).not.be.undefined();
    should(result).be.Object();

    // Compare the resulting token with the returned one.
    result.should.be.eql(expectedToken);
  });
});
