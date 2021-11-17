/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { CfnEnvironment } from '@aws-cdk/aws-elasticbeanstalk';
import { Aspects, CfnResource, IConstruct, Stack } from '@aws-cdk/core';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  ElasticBeanstalkEC2InstanceLogsToS3,
  ElasticBeanstalkEnhancedHealthReportingEnabled,
  ElasticBeanstalkManagedUpdatesEnabled,
  ElasticBeanstalkVPCSpecified,
} from '../../src/rules/elasticbeanstalk';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        ElasticBeanstalkEC2InstanceLogsToS3,
        ElasticBeanstalkEnhancedHealthReportingEnabled,
        ElasticBeanstalkManagedUpdatesEnabled,
        ElasticBeanstalkVPCSpecified,
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

describe('AWS Elastic Beanstalk', () => {
  test('ElasticBeanstalkEC2InstanceLogsToS3: EC2 instances in Elastic Beanstalk environments upload rotated logs to S3', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnEnvironment(nonCompliant, 'rBeanstalk', {
      applicationName: 'foo',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ElasticBeanstalkEC2InstanceLogsToS3:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnEnvironment(nonCompliant2, 'rBeanstalk', {
      applicationName: 'foo',
      optionSettings: [
        {
          namespace: 'aws:elasticbeanstalk:hostmanager',
          optionName: 'LogPublicationControl',
        },
      ],
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ElasticBeanstalkEC2InstanceLogsToS3:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnEnvironment(compliant, 'rBeanstalk', {
      applicationName: 'foo',
      optionSettings: [
        {
          namespace: 'aws:elasticbeanstalk:hostmanager',
          optionName: 'LogPublicationControl',
          value: 'true',
        },
      ],
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ElasticBeanstalkEC2InstanceLogsToS3:'),
        }),
      })
    );
  });

  test('ElasticBeanstalkEnhancedHealthReportingEnabled:  Elastic Beanstalk environments have enhanced health reporting enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnEnvironment(nonCompliant, 'rBeanstalk', {
      applicationName: 'foo',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'ElasticBeanstalkEnhancedHealthReportingEnabled:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnEnvironment(nonCompliant2, 'rBeanstalk', {
      applicationName: 'foo',
      optionSettings: [
        {
          namespace: 'aws:elasticbeanstalk:healthreporting:system',
          optionName: 'SystemType',
        },
      ],
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'ElasticBeanstalkEnhancedHealthReportingEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnEnvironment(compliant, 'rBeanstalk', {
      applicationName: 'foo',
      optionSettings: [
        {
          namespace: 'aws:elasticbeanstalk:healthreporting:system',
          optionName: 'SystemType',
          value: 'enhanced',
        },
      ],
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'ElasticBeanstalkEnhancedHealthReportingEnabled:'
          ),
        }),
      })
    );
  });

  test('ElasticBeanstalkManagedUpdatesEnabled:  Elastic Beanstalk environments have managed updates enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnEnvironment(nonCompliant, 'rBeanstalk', {
      applicationName: 'foo',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'ElasticBeanstalkManagedUpdatesEnabled:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnEnvironment(nonCompliant2, 'rBeanstalk', {
      applicationName: 'foo',
      optionSettings: [
        {
          namespace: 'aws:elasticbeanstalk:managedactions',
          optionName: 'ManagedActionsEnabled',
          value: 'false',
        },
      ],
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'ElasticBeanstalkManagedUpdatesEnabled:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    new CfnEnvironment(nonCompliant3, 'rBeanstalk', {
      applicationName: 'foo',
      optionSettings: [
        {
          namespace: 'aws:elasticbeanstalk:managedactions',
          optionName: 'ManagedActionsEnabled',
        },
        {
          namespace: 'aws:elasticbeanstalk:managedactions',
          optionName: 'PreferredStartTime',
          value: 'Tue:09:00',
        },
        {
          namespace: 'aws:elasticbeanstalk:managedactions:platformupdate',
          optionName: 'UpdateLevel',
        },
      ],
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'ElasticBeanstalkManagedUpdatesEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnEnvironment(compliant, 'rBeanstalk', {
      applicationName: 'foo',
      optionSettings: [
        {
          namespace: 'aws:elasticbeanstalk:managedactions',
          optionName: 'ManagedActionsEnabled',
        },
        {
          namespace: 'aws:elasticbeanstalk:managedactions',
          optionName: 'PreferredStartTime',
          value: 'Tue:09:00',
        },
        {
          namespace: 'aws:elasticbeanstalk:managedactions:platformupdate',
          optionName: 'UpdateLevel',
          value: 'minor',
        },
      ],
    });
    const messages4 = SynthUtils.synthesize(compliant).messages;
    expect(messages4).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'ElasticBeanstalkManagedUpdatesEnabled:'
          ),
        }),
      })
    );
  });

  test('ElasticBeanstalkVPCSpecified: Elastic Beanstalk environments are configured to use a specific VPC', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnEnvironment(nonCompliant, 'rBeanstalk', {
      applicationName: 'foo',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ElasticBeanstalkVPCSpecified:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnEnvironment(nonCompliant2, 'rBeanstalk', {
      applicationName: 'foo',
      optionSettings: [
        {
          namespace: 'aws:ec2:vpc',
          optionName: 'VPCId',
        },
      ],
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ElasticBeanstalkVPCSpecified:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnEnvironment(compliant, 'rBeanstalk', {
      applicationName: 'foo',
      optionSettings: [
        {
          namespace: 'aws:ec2:vpc',
          optionName: 'VPCId',
          value: 'foo',
        },
      ],
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ElasticBeanstalkVPCSpecified:'),
        }),
      })
    );
  });
});
