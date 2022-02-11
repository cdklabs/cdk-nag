/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Aspects, CfnResource, Stack } from 'aws-cdk-lib';
import {
  PolicyDocument,
  PolicyStatement,
  Effect,
  AnyPrincipal,
  AccountRootPrincipal,
  AccountPrincipal,
} from 'aws-cdk-lib/aws-iam';
import { CfnContainer } from 'aws-cdk-lib/aws-mediastore';
import { IConstruct } from 'constructs';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  MediaStoreCloudWatchMetricPolicy,
  MediaStoreContainerAccessLogging,
  MediaStoreContainerCORSPolicy,
  MediaStoreContainerHasContainerPolicy,
  MediaStoreContainerLifecyclePolicy,
  MediaStoreContainerSSLRequestsOnly,
} from '../../src/rules/mediastore';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        MediaStoreCloudWatchMetricPolicy,
        MediaStoreContainerAccessLogging,
        MediaStoreContainerCORSPolicy,
        MediaStoreContainerHasContainerPolicy,
        MediaStoreContainerLifecyclePolicy,
        MediaStoreContainerSSLRequestsOnly,
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

describe('AWS Elemental MediaStore', () => {
  test('MediaStoreCloudWatchMetricPolicy: Media Store containers define metric policies to send metrics to CloudWatch', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnContainer(nonCompliant, 'rMsContainer', {
      containerName: 'foo',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('MediaStoreCloudWatchMetricPolicy:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnContainer(compliant, 'rMsContainer', {
      containerName: 'foo',
      metricPolicy: {
        containerLevelMetrics: 'ENABLED',
      },
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('MediaStoreCloudWatchMetricPolicy:'),
        }),
      })
    );
  });

  test('MediaStoreContainerAccessLogging: Media Store containers have container access logging enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnContainer(nonCompliant, 'rMsContainer', {
      containerName: 'foo',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('MediaStoreContainerAccessLogging:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnContainer(compliant, 'rMsContainer', {
      containerName: 'foo',
      accessLoggingEnabled: true,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('MediaStoreContainerAccessLogging:'),
        }),
      })
    );
  });

  test('MediaStoreContainerCORSPolicy: Media Store containers define CORS policies', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnContainer(nonCompliant, 'rMsContainer', {
      containerName: 'foo',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('MediaStoreContainerCORSPolicy:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnContainer(compliant, 'rMsContainer', {
      containerName: 'foo',
      corsPolicy: [
        {
          allowedHeaders: ['foo'],
          allowedMethods: ['bar'],
          allowedOrigins: ['baz'],
          exposeHeaders: ['qux'],
        },
      ],
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('MediaStoreContainerCORSPolicy:'),
        }),
      })
    );
  });

  test('MediaStoreContainerHasContainerPolicy: Media Store containers define container policies', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnContainer(nonCompliant, 'rMsContainer', {
      containerName: 'foo',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'MediaStoreContainerHasContainerPolicy:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnContainer(compliant, 'rMsContainer', {
      containerName: 'foo',
      policy: '{"Version":"2012-10-17","Statement":...}"',
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'MediaStoreContainerHasContainerPolicy:'
          ),
        }),
      })
    );
  });

  test('MediaStoreContainerLifecyclePolicy: Media Store containers define lifecycle policies', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnContainer(nonCompliant, 'rMsContainer', {
      containerName: 'foo',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('MediaStoreContainerLifecyclePolicy:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnContainer(compliant, 'rMsContainer', {
      containerName: 'foo',
      lifecyclePolicy:
        '{"rules":[{"definition":{"path":[{"wildcard":"stream/*.ts"}],"seconds_since_create":[{"numeric":[">",300]}]},"action":"EXPIRE"}]}',
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('MediaStoreContainerLifecyclePolicy:'),
        }),
      })
    );
  });

  test('MediaStoreContainerSSLRequestsOnly: Media Store containers require requests to use SSL', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnContainer(nonCompliant, 'rMsContainer', {
      containerName: 'foo',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('MediaStoreContainerSSLRequestsOnly:'),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnContainer(nonCompliant2, 'rMsContainer', {
      containerName: 'foo',
      policy: JSON.stringify(
        new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['mediastore:putObject'],
              effect: Effect.DENY,
              principals: [new AnyPrincipal()],
              conditions: { Bool: { 'aws:SecureTransport': 'false' } },
              resources: [
                'arn:aws:mediastore:us-east-1:111222333444:container/foo/*',
              ],
            }),
          ],
        }).toJSON()
      ),
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('MediaStoreContainerSSLRequestsOnly:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnContainer(compliant, 'rMsContainer', {
      containerName: 'foo',
      policy: JSON.stringify(
        new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['mediastore:*'],
              effect: Effect.DENY,
              principals: [new AccountRootPrincipal()],
              conditions: { Bool: { 'aws:SecureTransport': 'false' } },
              resources: [
                'arn:aws:mediastore:us-east-1:111222333444:container/foo/*',
              ],
            }),
          ],
        }).toJSON()
      ),
    });
    new CfnContainer(compliant, 'rMsContainer2', {
      containerName: 'bar',
      policy: JSON.stringify(
        new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['mediastore:putObject'],
              effect: Effect.ALLOW,
              principals: [new AccountPrincipal(123456789012)],
              resources: [
                'arn:aws:mediastore:us-east-1:111222333444:container/foo/*',
              ],
            }),
            new PolicyStatement({
              actions: ['mediastore:PutObject', '*'],
              effect: Effect.DENY,
              principals: [new AnyPrincipal()],
              conditions: { Bool: { 'aws:SecureTransport': false } },
              resources: [
                'arn:aws:mediastore:us-east-1:111222333444:container/foo/*',
              ],
            }),
          ],
        }).toJSON()
      ),
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('MediaStoreContainerSSLRequestsOnly:'),
        }),
      })
    );
  });
});
