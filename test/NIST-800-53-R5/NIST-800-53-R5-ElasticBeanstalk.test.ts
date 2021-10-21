/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { CfnEnvironment } from '@aws-cdk/aws-elasticbeanstalk';
import { Aspects, Stack } from '@aws-cdk/core';
import { HIPAASecurityChecks } from '../../src';

describe('AWS Elastic Beanstalk', () => {
  test('HIPAA.Security-ElasticBeanstalkEnhancedHealthReportingEnabled: - Elastic Beanstalk environments have enhanced health reporting enabled - (Control IDs: AU-12(3), AU-14a, AU-14b, CA-2(2), CA-7, CA-7b, PM-14a.1, PM-14b, PM-31, SC-6, SC-36(1)(a), SI-2a)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new CfnEnvironment(nonCompliant, 'rBeanstalk', {
      applicationName: 'foo',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-ElasticBeanstalkEnhancedHealthReportingEnabled:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-ElasticBeanstalkEnhancedHealthReportingEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-ElasticBeanstalkEnhancedHealthReportingEnabled:'
          ),
        }),
      })
    );
  });

  test('HIPAA.Security-ElasticBeanstalkManagedUpdatesEnabled: - Elastic Beanstalk environments have managed updates enabled - (Control IDs: SI-2c, SI-2d, SI-2(2), SI-2(5))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new CfnEnvironment(nonCompliant, 'rBeanstalk', {
      applicationName: 'foo',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-ElasticBeanstalkManagedUpdatesEnabled:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-ElasticBeanstalkManagedUpdatesEnabled:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-ElasticBeanstalkManagedUpdatesEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-ElasticBeanstalkManagedUpdatesEnabled:'
          ),
        }),
      })
    );
  });
});
