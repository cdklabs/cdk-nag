/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { CfnEnvironment } from '@aws-cdk/aws-elasticbeanstalk';
import { Aspects, Stack } from '@aws-cdk/core';
import { HIPAASecurityChecks } from '../../src';

describe('AWS Elastic Beanstalk', () => {
  test('HIPAA.Security-ElasticBeanstalkEnhancedHealthReportingEnabled: -  Elastic Beanstalk environments have enhanced health reporting enabled - (Control ID: 164.312(b))', () => {
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

  test('HIPAA.Security-ElasticBeanstalkManagedUpdatesEnabled: -  Elastic Beanstalk environments have managed updates enabled - (Control ID: 164.308(a)(5)(ii)(A))', () => {
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
