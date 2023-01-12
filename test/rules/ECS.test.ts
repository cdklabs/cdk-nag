/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import {
  TaskDefinition,
  Compatibility,
  NetworkMode,
  EcsOptimizedImage,
  Cluster,
  LogDriver,
} from 'aws-cdk-lib/aws-ecs';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import { validateStack, TestType, TestPack } from './utils';
import {
  ECSClusterCloudWatchContainerInsights,
  ECSTaskDefinitionContainerLogging,
  ECSTaskDefinitionNoEnvironmentVariables,
  ECSTaskDefinitionUserForHostMode,
} from '../../src/rules/ecs';

const testPack = new TestPack([
  ECSClusterCloudWatchContainerInsights,
  ECSTaskDefinitionContainerLogging,
  ECSTaskDefinitionNoEnvironmentVariables,
  ECSTaskDefinitionUserForHostMode,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon Elastic Container Service (Amazon ECS)', () => {
  describe('ECSClusterCloudWatchContainerInsights: ECS Clusters have CloudWatch Container Insights Enabled', () => {
    const ruleId = 'ECSClusterCloudWatchContainerInsights';
    test('Noncompliance 1', () => {
      new Cluster(stack, 'rCluster', { containerInsights: false });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new Cluster(stack, 'rCluster', { containerInsights: true });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('ECSTaskDefinitionContainerLogging: Containers in ECS Task Definitions have logging enabled', () => {
    const ruleId = 'ECSTaskDefinitionContainerLogging';
    test('Noncompliance 1', () => {
      new TaskDefinition(stack, 'rTaskDef', {
        compatibility: Compatibility.EC2,
      }).addContainer('rContainer', {
        image: EcsOptimizedImage,
        memoryReservationMiB: 42,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      const taskDef = new TaskDefinition(stack, 'rTaskDef', {
        compatibility: Compatibility.EC2,
      });
      taskDef.addContainer('rContainer', {
        image: EcsOptimizedImage,
        memoryReservationMiB: 42,
        logging: LogDriver.awsLogs({ streamPrefix: 'foo' }),
      });
      taskDef.addContainer('rContainer2', {
        image: EcsOptimizedImage,
        memoryReservationMiB: 42,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const taskDef = new TaskDefinition(stack, 'rTaskDef', {
        compatibility: Compatibility.EC2,
      });
      taskDef.addContainer('rContainer', {
        image: EcsOptimizedImage,
        memoryReservationMiB: 42,
        logging: LogDriver.awsLogs({ streamPrefix: 'foo' }),
      });
      taskDef.addContainer('rContainer2', {
        image: EcsOptimizedImage,
        memoryReservationMiB: 42,
        logging: LogDriver.awsLogs({ streamPrefix: 'bar' }),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('ECSTaskDefinitionNoEnvironmentVariables: Containers in ECS task definitions do not directly specify environment variables', () => {
    const ruleId = 'ECSTaskDefinitionNoEnvironmentVariables';
    test('Noncompliance 1', () => {
      new TaskDefinition(stack, 'rTaskDef', {
        compatibility: Compatibility.EC2,
      }).addContainer('rContainer', {
        image: EcsOptimizedImage,
        memoryReservationMiB: 42,
        environment: { foo: 'bar' },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new TaskDefinition(stack, 'rTaskDef', {
        compatibility: Compatibility.EC2,
      }).addContainer('rContainer', {
        image: EcsOptimizedImage,
        memoryReservationMiB: 42,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe("ECSTaskDefinitionUserForHostMode: Containers in ECS task definitions configured for host networking have 'privileged' set to true and a non-empty non-root 'user' - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(A), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1)).", () => {
    const ruleId = 'ECSTaskDefinitionUserForHostMode';
    test('Noncompliance 1', () => {
      new TaskDefinition(stack, 'rTaskDef', {
        compatibility: Compatibility.EC2,
        networkMode: NetworkMode.HOST,
      }).addContainer('rContainer', {
        image: EcsOptimizedImage,
        memoryReservationMiB: 42,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new TaskDefinition(stack, 'rTaskDef', {
        compatibility: Compatibility.EC2,
        networkMode: NetworkMode.HOST,
      }).addContainer('rContainer', {
        image: EcsOptimizedImage,
        memoryReservationMiB: 42,
        user: 'ec2-user',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new TaskDefinition(stack, 'rTaskDef', {
        compatibility: Compatibility.EC2,
        networkMode: NetworkMode.HOST,
      }).addContainer('rContainer', {
        image: EcsOptimizedImage,
        memoryReservationMiB: 42,
        privileged: true,
        user: '0',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      new TaskDefinition(stack, 'rTaskDef', {
        compatibility: Compatibility.EC2,
        networkMode: NetworkMode.HOST,
      }).addContainer('rContainer', {
        image: EcsOptimizedImage,
        memoryReservationMiB: 42,
        privileged: true,
        user: '0:root',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 5', () => {
      const taskDef = new TaskDefinition(stack, 'rTaskDef', {
        compatibility: Compatibility.EC2,
        networkMode: NetworkMode.HOST,
      });
      taskDef.addContainer('rContainer', {
        image: EcsOptimizedImage,
        memoryReservationMiB: 42,
        privileged: true,
        user: 'not-root',
      });
      taskDef.addContainer('rContainer2', {
        image: EcsOptimizedImage,
        memoryReservationMiB: 42,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new TaskDefinition(stack, 'rTaskDef', {
        compatibility: Compatibility.EC2,
        networkMode: NetworkMode.HOST,
      });
      new TaskDefinition(stack, 'rTaskDef2', {
        compatibility: Compatibility.EC2,
        networkMode: NetworkMode.HOST,
      }).addContainer('rContainer2', {
        image: EcsOptimizedImage,
        memoryReservationMiB: 42,
        privileged: true,
        user: 'not-root',
      });
      new TaskDefinition(stack, 'rTaskDef3', {
        compatibility: Compatibility.EC2,
        networkMode: NetworkMode.BRIDGE,
      }).addContainer('rContainer3', {
        image: EcsOptimizedImage,
        memoryReservationMiB: 42,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});
