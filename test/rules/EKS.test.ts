/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import {
  CfnCluster,
  Cluster,
  ClusterLoggingTypes,
  EndpointAccess,
  KubernetesVersion,
} from 'aws-cdk-lib/aws-eks';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import { validateStack, TestType, TestPack } from './utils';
import {
  EKSClusterControlPlaneLogs,
  EKSClusterNoEndpointPublicAccess,
} from '../../src/rules/eks';

const testPack = new TestPack([
  EKSClusterControlPlaneLogs,
  EKSClusterNoEndpointPublicAccess,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon Elastic Kubernetes Service (Amazon EKS)', () => {
  describe('EKSClusterNoEndpointPublicAccess: EKS Cluster Kubernetes API server endpoints have public access disabled', () => {
    const ruleId = 'EKSClusterNoEndpointPublicAccess';
    test('Noncompliance 1', () => {
      new Cluster(stack, 'rCustomEKS', {
        version: KubernetesVersion.V1_14,
        endpointAccess: EndpointAccess.PUBLIC,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnCluster(stack, 'rL1EKS', {
        version: 'foo',
        resourcesVpcConfig: {
          securityGroupIds: ['bar'],
          subnetIds: ['baz'],
        },
        roleArn: 'foobar',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Cluster(stack, 'rCustomEKS', {
        version: KubernetesVersion.V1_14,
        endpointAccess: EndpointAccess.PRIVATE,
      });
      new CfnCluster(stack, 'rL1EKS', {
        version: 'foo',
        resourcesVpcConfig: {
          securityGroupIds: ['bar'],
          subnetIds: ['baz'],
          endpointPublicAccess: false,
        },
        roleArn: 'foobar',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
  describe("EKSClusterControlPlaneLogs: EKS Clusters publish 'api', 'audit', 'authenticator, 'controllerManager', and 'scheduler' control plane logs", () => {
    const ruleId = 'EKSClusterControlPlaneLogs';
    test('Noncompliance 1: ', () => {
      new Cluster(stack, 'rCustomEKS', {
        version: KubernetesVersion.V1_14,
        endpointAccess: EndpointAccess.PUBLIC,
      });
      validateStack(
        stack,
        `${ruleId}[LogExport::api]`,
        TestType.NON_COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::audit]`,
        TestType.NON_COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::authenticator]`,
        TestType.NON_COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::controllerManager]`,
        TestType.NON_COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::scheduler]`,
        TestType.NON_COMPLIANCE
      );
    });
    test("Noncompliance 2: expect findings for all logs except 'api' logs", () => {
      new Cluster(stack, 'rCustomEKS', {
        version: KubernetesVersion.V1_14,
        endpointAccess: EndpointAccess.PUBLIC,
        clusterLogging: [ClusterLoggingTypes.API],
      });
      validateStack(
        stack,
        `${ruleId}\\[LogExport::api\\]`,
        TestType.COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::audit]`,
        TestType.NON_COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::authenticator]`,
        TestType.NON_COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::controllerManager]`,
        TestType.NON_COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::scheduler]`,
        TestType.NON_COMPLIANCE
      );
    });
    test('Noncompliance 3: expect findings for all logs', () => {
      new CfnCluster(stack, 'rL1EKS', {
        version: 'foo',
        resourcesVpcConfig: {
          securityGroupIds: ['bar'],
          subnetIds: ['baz'],
        },
        roleArn: 'foobar',
      });
      validateStack(
        stack,
        `${ruleId}[LogExport::api]`,
        TestType.NON_COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::audit]`,
        TestType.NON_COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::authenticator]`,
        TestType.NON_COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::controllerManager]`,
        TestType.NON_COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::scheduler]`,
        TestType.NON_COMPLIANCE
      );
    });
    test("Noncompliance 4: expect findings for all logs except 'api' logs", () => {
      new CfnCluster(stack, 'rL1EKS', {
        version: 'foo',
        resourcesVpcConfig: {
          securityGroupIds: ['bar'],
          subnetIds: ['baz'],
        },
        logging: {
          clusterLogging: {
            enabledTypes: [
              {
                type: 'api',
              },
            ],
          },
        },
        roleArn: 'foobar',
      });
      validateStack(
        stack,
        `${ruleId}\\[LogExport::api\\]`,
        TestType.COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::audit]`,
        TestType.NON_COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::authenticator]`,
        TestType.NON_COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::controllerManager]`,
        TestType.NON_COMPLIANCE
      );
      validateStack(
        stack,
        `${ruleId}[LogExport::scheduler]`,
        TestType.NON_COMPLIANCE
      );
    });
    test('Compliance', () => {
      new Cluster(stack, 'rCustomEKS', {
        version: KubernetesVersion.V1_14,
        endpointAccess: EndpointAccess.PRIVATE,
        clusterLogging: [
          ClusterLoggingTypes.API,
          ClusterLoggingTypes.AUDIT,
          ClusterLoggingTypes.AUTHENTICATOR,
          ClusterLoggingTypes.CONTROLLER_MANAGER,
          ClusterLoggingTypes.SCHEDULER,
        ],
      });
      new CfnCluster(stack, 'rL1EKS', {
        version: 'foo',
        resourcesVpcConfig: {
          securityGroupIds: ['bar'],
          subnetIds: ['baz'],
          endpointPublicAccess: false,
        },
        logging: {
          clusterLogging: {
            enabledTypes: [
              {
                type: 'api',
              },
              { type: 'audit' },
              { type: 'authenticator' },
              { type: 'controllerManager' },
              { type: 'scheduler' },
            ],
          },
        },
        roleArn: 'foobar',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});
