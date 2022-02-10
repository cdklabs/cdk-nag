/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import {
  CfnCluster,
  Cluster,
  ClusterLoggingTypes,
  EndpointAccess,
  KubernetesVersion,
} from '@aws-cdk/aws-eks';
import { Aspects, CfnResource, IConstruct, Stack } from '@aws-cdk/core';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  EKSClusterControlPlaneLogs,
  EKSClusterNoEndpointPublicAccess,
} from '../../src/rules/eks';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        EKSClusterControlPlaneLogs,
        EKSClusterNoEndpointPublicAccess,
      ];
      rules.forEach((rule) => {
        this.applyRule({
          info: 'foo.',
          explanation: 'bar.',
          level: NagMessageLevel.ERROR,
          rule: rule,
          node: node,
        });
      });
    }
  }
}

describe('Amazon Elastic Kubernetes Service (Amazon EKS)', () => {
  test('EKSClusterNoEndpointPublicAccess: EKS Cluster Kubernetes API server endpoints have public access disabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Cluster(nonCompliant, 'rCustomEKS', {
      version: KubernetesVersion.V1_14,
      endpointAccess: EndpointAccess.PUBLIC,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EKSClusterNoEndpointPublicAccess:'),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnCluster(nonCompliant2, 'rL1EKS', {
      version: 'foo',
      resourcesVpcConfig: {
        securityGroupIds: ['bar'],
        subnetIds: ['baz'],
      },
      roleArn: 'foobar',
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EKSClusterNoEndpointPublicAccess:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Cluster(compliant, 'rCustomEKS', {
      version: KubernetesVersion.V1_14,
      endpointAccess: EndpointAccess.PRIVATE,
    });
    new CfnCluster(compliant, 'rL1EKS', {
      version: 'foo',
      resourcesVpcConfig: {
        securityGroupIds: ['bar'],
        subnetIds: ['baz'],
        endpointPublicAccess: false,
      },
      roleArn: 'foobar',
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EKSClusterNoEndpointPublicAccess:'),
        }),
      })
    );
  });
  test("EKSClusterControlPlaneLogs: EKS Clusters publish 'api', 'audit', 'authenticator, 'controllerManager', and 'scheduler' control plane logs", () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Cluster(nonCompliant, 'rCustomEKS', {
      version: KubernetesVersion.V1_14,
      endpointAccess: EndpointAccess.PUBLIC,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EKSClusterControlPlaneLogs:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new Cluster(nonCompliant2, 'rCustomEKS', {
      version: KubernetesVersion.V1_14,
      endpointAccess: EndpointAccess.PUBLIC,
      clusterLogging: [ClusterLoggingTypes.API],
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EKSClusterControlPlaneLogs:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    new CfnCluster(nonCompliant3, 'rL1EKS', {
      version: 'foo',
      resourcesVpcConfig: {
        securityGroupIds: ['bar'],
        subnetIds: ['baz'],
      },
      roleArn: 'foobar',
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EKSClusterControlPlaneLogs:'),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new TestPack());
    new CfnCluster(nonCompliant4, 'rL1EKS', {
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
    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EKSClusterControlPlaneLogs:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Cluster(compliant, 'rCustomEKS', {
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
    new CfnCluster(compliant, 'rL1EKS', {
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
    const messages5 = SynthUtils.synthesize(compliant).messages;
    expect(messages5).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EKSClusterControlPlaneLogs:'),
        }),
      })
    );
  });
});
