'use strict';
const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Script Tasks - ', () => {

  let testFixtureProvider;

  const processModelId = 'script_task_test';
  const startEventId = 'StartEvent_1';
  const useAutoGeneratedCorrelationId = undefined;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    await testFixtureProvider.importProcessFiles([processModelId]);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should execute different script tasks that access the token history and return different values', async () => {

    const initialToken = {
      test_type: 'basic_test',
    };

    const expectedResult = {
      prop1: 1337,
      prop2: 'Hello',
    };

    const result = await testFixtureProvider.executeProcess(processModelId, startEventId, useAutoGeneratedCorrelationId, initialToken);

    should(result).have.property('currentToken');
    should(result.currentToken).be.eql(expectedResult);
  });

  it('should throw an error when trying to execute a faulty script task', async () => {

    const initialToken = {
      test_type: 'faulty_task',
    };

    const expectedMessage = /a.*?not.*?defined/i;

    try {
      await testFixtureProvider.executeProcess(processModelId, startEventId, useAutoGeneratedCorrelationId, initialToken);
    } catch (error) {
      should(error.message).be.match(expectedMessage);
    }
  });
});
