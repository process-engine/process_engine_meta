'use strict';

const Promise = require('bluebird');
const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

const BpmnType = require('@process-engine/process_engine_contracts').BpmnType;

// TODO: There is currently no handler for the terminate end event, so these tests can never work.
// As soon as a handler exists, these tests need to be refactored to the new specs.
describe.skip('Terminate End Event', () => {

  let testFixtureProvider;

  const processModelId = 'terminate_end_event_sample';

  let nodeInstanceEntityTypeService;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    await testFixtureProvider.importProcessFiles([processModelId]);

    nodeInstanceEntityTypeService = await testFixtureProvider.resolveAsync('NodeInstanceEntityTypeService');
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should successfully terminate a process upon reaching a TerminateEndEvent.', async () => {

    // NOTE: We require the process instance ID for later assertions.
    const processInstanceId = await testFixtureProvider.createProcessInstance(processModelId);
    try {
      const result = await testFixtureProvider.executeProcessInstance(processInstanceId);
      should.fail(result, undefined, 'This should have caused an error!');
    } catch (error) {
      const expectedError = /process was terminated.*?TerminateEndEvent_1/i;

      // NOTE: This only shows the Blackbox Result of the test. To verify that the process- and all corresponding nodes
      // were actually terminated, we need to query the database.
      should(error.message).be.match(expectedError);
      await assertActiveNodeInstancesWereTerminated(processInstanceId);
      await assertPendingNodesWereNotCreated(processInstanceId);
    }

  });

  async function assertActiveNodeInstancesWereTerminated(processInstanceId) {

    const expectedTerminatedNodeInstances = [
      {
        key: 'FiveSecondDelayTimerEvent',
        type: BpmnType.intermediateCatchEvent,
      }, {
        key: 'TenSecondTimerDelayEvent',
        type: BpmnType.intermediateCatchEvent,
      }, {
        key: 'TerminateEndEvent_1', type: BpmnType.endEvent,
      },
    ];

    await Promise.mapSeries(expectedTerminatedNodeInstances, async (instanceConfig) => {
      const entity = await queryNodeInstanceByKey(processInstanceId, instanceConfig);
      should.exist(entity);
      should(entity.state).be.equal('terminate');
    });
  }

  async function assertPendingNodesWereNotCreated(processInstanceId) {

    const expectedNonExistingNodeInstances = [
      {
        key: 'UnreachableScriptTask_1',
        type: BpmnType.scriptTask,
      }, {
        key: 'UnreachableScriptTask_2',
        type: BpmnType.scriptTask,
      }, {
        key: 'RegularEndEvent',
        type: BpmnType.endEvent,
      },
    ];

    await Promise.mapSeries(expectedNonExistingNodeInstances, async (instanceConfig) => {
      const entity = await queryNodeInstanceByKey(processInstanceId, instanceConfig);
      should.not.exist(entity);
    });
  }

  async function queryNodeInstanceByKey(processInstanceId, instanceConfig) {

    const entityType = await nodeInstanceEntityTypeService.getEntityTypeFromBpmnType(instanceConfig.type);

    const queryOptions = {
      query: {
        operator: 'and',
        queries: [
          {
            attribute: 'process',
            operator: '=',
            value: processInstanceId,
          },
          {
            attribute: 'key',
            operator: '=',
            value: instanceConfig.key,
          },
        ],
      },
    };

    const result = await entityType.findOne(testFixtureProvider.context, queryOptions);

    return result;
  }
});
