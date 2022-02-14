/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnWorkGroup } from '@aws-cdk/aws-athena';
import { Aspects, Stack } from '@aws-cdk/core';
import { AthenaWorkgroupEncryptedQueryResults } from '../../src/rules/athena';
import { TestPack, TestType, validateStack } from './utils';

const testPack = new TestPack([AthenaWorkgroupEncryptedQueryResults]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon Athena', () => {
  describe('AthenaWorkgroupEncryptedQueryResults: Athena workgroups encrypt query results', () => {
    const ruleId = 'AthenaWorkgroupEncryptedQueryResults';
    test('Noncompliance 1', () => {
      new CfnWorkGroup(stack, 'rWorkgroup', {
        name: 'foo',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnWorkGroup(stack, 'rWorkgroup', {
        name: 'foo',
        workGroupConfiguration: {
          enforceWorkGroupConfiguration: false,
          resultConfiguration: {
            encryptionConfiguration: {
              encryptionOption: 'SSE_S3',
            },
          },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new CfnWorkGroup(stack, 'rWorkgroup', {
        name: 'foo',
        workGroupConfiguration: {
          enforceWorkGroupConfiguration: true,
          requesterPaysEnabled: true,
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      new CfnWorkGroup(stack, 'rWorkgroup', {
        name: 'foo',
        workGroupConfiguration: {
          enforceWorkGroupConfiguration: true,
          resultConfiguration: {
            outputLocation: 'bar',
          },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 5', () => {
      new CfnWorkGroup(stack, 'rWorkgroup', {
        name: 'foo',
        workGroupConfigurationUpdates: {
          enforceWorkGroupConfiguration: false,
          resultConfigurationUpdates: {
            removeEncryptionConfiguration: true,
          },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 6', () => {
      new CfnWorkGroup(stack, 'rWorkgroup', {
        name: 'foo',
        workGroupConfigurationUpdates: {
          enforceWorkGroupConfiguration: true,
          resultConfigurationUpdates: {
            removeEncryptionConfiguration: true,
          },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 7', () => {
      new CfnWorkGroup(stack, 'rWorkgroup', {
        name: 'foo',
        workGroupConfigurationUpdates: {
          resultConfigurationUpdates: {
            encryptionConfiguration: {
              encryptionOption: 'SSE_S3',
            },
          },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnWorkGroup(stack, 'rWorkgroup', {
        name: 'foo',
        workGroupConfiguration: {
          enforceWorkGroupConfiguration: true,
          resultConfiguration: {
            encryptionConfiguration: {
              encryptionOption: 'SSE_S3',
            },
          },
        },
      });
      new CfnWorkGroup(stack, 'rWorkgroup2', {
        name: 'foo',
        workGroupConfigurationUpdates: {
          enforceWorkGroupConfiguration: true,
          resultConfigurationUpdates: {
            encryptionConfiguration: {
              encryptionOption: 'SSE_S3',
            },
          },
        },
      });
      new CfnWorkGroup(stack, 'rWorkgroup3', {
        name: 'foo',
        workGroupConfigurationUpdates: {
          requesterPaysEnabled: true,
        },
      });
      new CfnWorkGroup(stack, 'rWorkgroup4', {
        name: 'foo',
        workGroupConfigurationUpdates: {
          enforceWorkGroupConfiguration: true,
          requesterPaysEnabled: true,
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});
