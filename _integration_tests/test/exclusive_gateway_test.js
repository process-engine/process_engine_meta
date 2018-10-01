'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Exclusive Gateway - ', async () => {

  let testFixtureProvider;

  const startEventId = 'StartEvent_1';
  const useAutoGeneratedCorrelationId = undefined;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    const processDefFileList = [
      'exclusive_gateway_test',
      'exclusive_gateway_nested_test',
    ];

    await testFixtureProvider.importProcessFiles(processDefFileList);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should evaluate the initial token value correct and direct the token the right path', async () => {

    const processModelId = 'exclusive_gateway_test';

    const initialToken = 'right';

    const expectedResult = /right path/i;

    const result = await testFixtureProvider.executeProcess(processModelId, startEventId, useAutoGeneratedCorrelationId, initialToken);

    should(result).have.property('currentToken');
    should(result.currentToken).be.match(expectedResult);
  });

  it('should evaluate the initial token value correct and direct the token the left path', async () => {

    const processModelId = 'exclusive_gateway_test';

    const initialToken = 'left';

    const expectedResult = /left path/i;

    const result = await testFixtureProvider.executeProcess(processModelId, startEventId, useAutoGeneratedCorrelationId, initialToken);

    should(result).have.property('currentToken');
    should(result.currentToken).be.match(expectedResult);
  });

  it('should direct the token through two nested exclusive gateways, taking the nested left path.', async () => {

    const processModelId = 'exclusive_gateway_nested_test';

    const initialToken = 1;

    const expectedResult = /nested left path/i;

    const result = await testFixtureProvider.executeProcess(processModelId, startEventId, useAutoGeneratedCorrelationId, initialToken);

    should(result).have.property('currentToken');
    should(result.currentToken).be.match(expectedResult);

  });

  it('should direct the token through two nested exclusive gateways, taking the nested right path.', async () => {

    const processModelId = 'exclusive_gateway_nested_test';

    const initialToken = 2;

    const expectedResult = /nested right path/i;

    const result = await testFixtureProvider.executeProcess(processModelId, startEventId, useAutoGeneratedCorrelationId, initialToken);

    should(result).have.property('currentToken');
    should(result.currentToken).be.match(expectedResult);

  });

  it('should not take the path through the nested gateways.', async () => {

    const processModelId = 'exclusive_gateway_nested_test';

    const initialToken = 'right';

    const expectedResult = /basic right path/i;

    const result = await testFixtureProvider.executeProcess(processModelId, startEventId, useAutoGeneratedCorrelationId, initialToken);

    should(result).have.property('currentToken');
    should(result.currentToken).be.match(expectedResult);

  });
});
