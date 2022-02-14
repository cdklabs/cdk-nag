/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnEnvironment } from '@aws-cdk/aws-elasticbeanstalk';
import { Aspects, Stack } from '@aws-cdk/core';
import {
  ElasticBeanstalkEC2InstanceLogsToS3,
  ElasticBeanstalkEnhancedHealthReportingEnabled,
  ElasticBeanstalkManagedUpdatesEnabled,
  ElasticBeanstalkVPCSpecified,
} from '../../src/rules/elasticbeanstalk';
import { validateStack, TestType, TestPack } from './utils';

const testPack = new TestPack([
  ElasticBeanstalkEC2InstanceLogsToS3,
  ElasticBeanstalkEnhancedHealthReportingEnabled,
  ElasticBeanstalkManagedUpdatesEnabled,
  ElasticBeanstalkVPCSpecified,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('AWS Elastic Beanstalk', () => {
  describe('ElasticBeanstalkEC2InstanceLogsToS3: EC2 instances in Elastic Beanstalk environments upload rotated logs to S3', () => {
    const ruleId = 'ElasticBeanstalkEC2InstanceLogsToS3';
    test('Noncompliance 1', () => {
      new CfnEnvironment(stack, 'rBeanstalk', {
        applicationName: 'foo',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnEnvironment(stack, 'rBeanstalk', {
        applicationName: 'foo',
        optionSettings: [
          {
            namespace: 'aws:elasticbeanstalk:hostmanager',
            optionName: 'LogPublicationControl',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnEnvironment(stack, 'rBeanstalk', {
        applicationName: 'foo',
        optionSettings: [
          {
            namespace: 'aws:elasticbeanstalk:hostmanager',
            optionName: 'LogPublicationControl',
            value: 'true',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('ElasticBeanstalkEnhancedHealthReportingEnabled:  Elastic Beanstalk environments have enhanced health reporting enabled', () => {
    const ruleId = 'ElasticBeanstalkEnhancedHealthReportingEnabled';
    test('Noncompliance 1', () => {
      new CfnEnvironment(stack, 'rBeanstalk', {
        applicationName: 'foo',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnEnvironment(stack, 'rBeanstalk', {
        applicationName: 'foo',
        optionSettings: [
          {
            namespace: 'aws:elasticbeanstalk:healthreporting:system',
            optionName: 'SystemType',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new CfnEnvironment(stack, 'rBeanstalk', {
        applicationName: 'foo',
        optionSettings: [
          {
            namespace: 'aws:elasticbeanstalk:healthreporting:system',
            optionName: 'SystemType',
            value: 'enhanced',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('ElasticBeanstalkManagedUpdatesEnabled:  Elastic Beanstalk environments have managed updates enabled', () => {
    const ruleId = 'ElasticBeanstalkManagedUpdatesEnabled';
    test('Noncompliance 1', () => {
      new CfnEnvironment(stack, 'rBeanstalk', {
        applicationName: 'foo',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnEnvironment(stack, 'rBeanstalk', {
        applicationName: 'foo',
        optionSettings: [
          {
            namespace: 'aws:elasticbeanstalk:managedactions',
            optionName: 'ManagedActionsEnabled',
            value: 'false',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new CfnEnvironment(stack, 'rBeanstalk', {
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
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnEnvironment(stack, 'rBeanstalk', {
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
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('ElasticBeanstalkVPCSpecified: Elastic Beanstalk environments are configured to use a specific VPC', () => {
    const ruleId = 'ElasticBeanstalkVPCSpecified';
    test('Noncompliance 1', () => {
      new CfnEnvironment(stack, 'rBeanstalk', {
        applicationName: 'foo',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 2', () => {
      new CfnEnvironment(stack, 'rBeanstalk', {
        applicationName: 'foo',
        optionSettings: [
          {
            namespace: 'aws:ec2:vpc',
            optionName: 'VPCId',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new CfnEnvironment(stack, 'rBeanstalk', {
        applicationName: 'foo',
        optionSettings: [
          {
            namespace: 'aws:ec2:vpc',
            optionName: 'VPCId',
            value: 'foo',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});
