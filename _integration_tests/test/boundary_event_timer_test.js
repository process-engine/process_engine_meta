'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Timer Boundary Event - ', () => {

  let testFixtureProvider;

  const processModelId = 'boundary_event_timer_test';
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

  it('should interrupt a service task after two seconds', async () => {

    const initialToken = {
      interrupt_task: true,
    };

    const expectedResult = /interrupt successful/i;

    const result = await testFixtureProvider.executeProcess(processModelId, startEventId, useAutoGeneratedCorrelationId, initialToken);

    should(result.currentToken).be.match(expectedResult);
  });

  it('should not interrupt a service task that finishes, before the timespan of the timer boundary event is over', async () => {

    const initialToken = {
      interrupt_task: false,
    };

    const expectedResult = /service task not interrupted/i;

    const result = await testFixtureProvider.executeProcess(processModelId, startEventId, useAutoGeneratedCorrelationId, initialToken);

    should(result.currentToken).be.match(expectedResult);

  });
});
