/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster, CfnSecurityConfiguration } from '@aws-cdk/aws-emr';
import { Aspects, Stack } from '@aws-cdk/core';
import {
  EMRAuthEC2KeyPairOrKerberos,
  EMREncryptionInTransit,
  EMRKerberosEnabled,
  EMRLocalDiskEncryption,
  EMRS3AccessLogging,
} from '../../src/rules/emr';
import { validateStack, TestType, TestPack } from './utils';

const testPack = new TestPack([
  EMRAuthEC2KeyPairOrKerberos,
  EMREncryptionInTransit,
  EMRKerberosEnabled,
  EMRLocalDiskEncryption,
  EMRS3AccessLogging,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon EMR', () => {
  describe('EMRAuthEC2KeyPairOrKerberos: EMR clusters implement authentication via an EC2 Key Pair or Kerberos', () => {
    const ruleId = 'EMRAuthEC2KeyPairOrKerberos';
    test('Noncompliance 1', () => {
      new CfnCluster(stack, 'rEmrCluster', {
        instances: {},
        jobFlowRole: ' EMR_EC2_DefaultRole',
        name: 'foo',
        serviceRole: 'bar',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnCluster(stack, 'rEmrCluster', {
        instances: {},
        jobFlowRole: ' EMR_EC2_DefaultRole',
        name: 'foo',
        serviceRole: 'bar',
        kerberosAttributes: {
          kdcAdminPassword: 'baz',
          realm: 'qux',
        },
      });
      new CfnCluster(stack, 'rEmrCluster2', {
        instances: { ec2KeyName: 'baz' },
        jobFlowRole: ' EMR_EC2_DefaultRole',
        name: 'foo',
        serviceRole: 'bar',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('EMREncryptionInTransit: EMR clusters have encryption in transit enabled', () => {
    const ruleId = 'EMREncryptionInTransit';
    test('Noncompliance 1', () => {
      new CfnCluster(stack, 'rEmrCluster', {
        instances: {},
        jobFlowRole: 'EMR_EC2_DefaultRole',
        name: 'foo',
        serviceRole: 'bar',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnCluster(stack, 'rEmrCluster', {
        instances: {},
        jobFlowRole: 'EMR_EC2_DefaultRole',
        name: 'foo',
        serviceRole: 'bar',
        securityConfiguration: 'baz',
      });
      new CfnSecurityConfiguration(stack, 'rEmrSecConfig', {
        name: 'baz',
        securityConfiguration: {
          EnableInTransitEncryption: true,
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new CfnCluster(stack, 'rEmrCluster', {
        instances: {},
        jobFlowRole: 'EMR_EC2_DefaultRole',
        name: 'foo',
        serviceRole: 'bar',
        securityConfiguration: 'baz',
      });
      new CfnSecurityConfiguration(stack, 'rEmrSecConfig', {
        name: 'notbaz',
        securityConfiguration: {
          EnableInTransitEncryption: true,
          InTransitEncryptionConfiguration: {
            TLSCertificateConfiguration: {
              CertificateProviderType: 'PEM',
              S3Object: 's3://MyConfigStore/artifacts/MyCerts.zip',
            },
          },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnCluster(stack, 'rEmrCluster', {
        instances: {},
        jobFlowRole: 'EMR_EC2_DefaultRole',
        name: 'foo',
        serviceRole: 'bar',
        securityConfiguration: 'baz',
      });
      new CfnCluster(stack, 'rEmrCluster2', {
        instances: {},
        jobFlowRole: 'EMR_EC2_DefaultRole',
        name: 'foo',
        serviceRole: 'bar',
        securityConfiguration: new CfnSecurityConfiguration(
          stack,
          'rEmrSecConfig2',
          {
            securityConfiguration: {
              EnableInTransitEncryption: true,
              InTransitEncryptionConfiguration: {
                TLSCertificateConfiguration: {
                  CertificateProviderType: 'PEM',
                  S3Object: 's3://MyConfigStore/artifacts/MyCerts.zip',
                },
              },
            },
          }
        ).ref,
      });
      new CfnSecurityConfiguration(stack, 'rEmrSecConfig', {
        name: 'baz',
        securityConfiguration: {
          EnableInTransitEncryption: true,
          InTransitEncryptionConfiguration: {
            TLSCertificateConfiguration: {
              CertificateProviderType: 'PEM',
              S3Object: 's3://MyConfigStore/artifacts/MyCerts.zip',
            },
          },
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('EMRKerberosEnabled: EMR clusters have Kerberos enabled', () => {
    const ruleId = 'EMRKerberosEnabled';
    test('Noncompliance 1', () => {
      new CfnCluster(stack, 'rEmrCluster', {
        instances: {},
        jobFlowRole: ' EMR_EC2_DefaultRole',
        name: 'foo',
        serviceRole: 'bar',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnCluster(stack, 'rEmrCluster', {
        instances: {},
        jobFlowRole: ' EMR_EC2_DefaultRole',
        name: 'foo',
        serviceRole: 'bar',
        kerberosAttributes: {
          kdcAdminPassword: 'baz',
          realm: 'qux',
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('EMRLocalDiskEncryption: EMR clusters have local disk encryption enabled', () => {
    const ruleId = 'EMRLocalDiskEncryption';
    test('Noncompliance 1', () => {
      new CfnCluster(stack, 'rEmrCluster', {
        instances: {},
        jobFlowRole: 'EMR_EC2_DefaultRole',
        name: 'foo',
        serviceRole: 'bar',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnCluster(stack, 'rEmrCluster', {
        instances: {},
        jobFlowRole: 'EMR_EC2_DefaultRole',
        name: 'foo',
        serviceRole: 'bar',
        securityConfiguration: 'baz',
      });
      new CfnSecurityConfiguration(stack, 'rEmrSecConfig', {
        name: 'baz',
        securityConfiguration: {
          EnableAtRestEncryption: true,
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new CfnCluster(stack, 'rEmrCluster', {
        instances: {},
        jobFlowRole: 'EMR_EC2_DefaultRole',
        name: 'foo',
        serviceRole: 'bar',
        securityConfiguration: 'baz',
      });
      new CfnSecurityConfiguration(stack, 'rEmrSecConfig', {
        name: 'notbaz',
        securityConfiguration: {
          EnableAtRestEncryption: true,
          AtRestEncryptionConfiguration: {
            LocalDiskEncryptionConfiguration: {
              EncryptionKeyProviderType: 'AwsKms',
              AwsKmsKey:
                'arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012',
            },
          },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnCluster(stack, 'rEmrCluster', {
        instances: {},
        jobFlowRole: 'EMR_EC2_DefaultRole',
        name: 'foo',
        serviceRole: 'bar',
        securityConfiguration: 'baz',
      });
      new CfnCluster(stack, 'rEmrCluster2', {
        instances: {},
        jobFlowRole: 'EMR_EC2_DefaultRole',
        name: 'foo',
        serviceRole: 'bar',
        securityConfiguration: new CfnSecurityConfiguration(
          stack,
          'rEmrSecConfig2',
          {
            securityConfiguration: {
              EnableAtRestEncryption: true,
              AtRestEncryptionConfiguration: {
                LocalDiskEncryptionConfiguration: {
                  EncryptionKeyProviderType: 'AwsKms',
                  AwsKmsKey:
                    'arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012',
                },
              },
            },
          }
        ).ref,
      });
      new CfnSecurityConfiguration(stack, 'rEmrSecConfig', {
        name: 'baz',
        securityConfiguration: {
          EnableAtRestEncryption: true,
          AtRestEncryptionConfiguration: {
            LocalDiskEncryptionConfiguration: {
              EncryptionKeyProviderType: 'AwsKms',
              AwsKmsKey:
                'arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012',
            },
          },
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('EMRS3AccessLogging: EMR clusters have S3 logging enabled', () => {
    const ruleId = 'EMRS3AccessLogging';
    test('Noncompliance 1', () => {
      new CfnCluster(stack, 'rEmrCluster', {
        instances: {},
        jobFlowRole: ' EMR_EC2_DefaultRole',
        name: 'foo',
        serviceRole: 'bar',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnCluster(stack, 'rEmrCluster', {
        instances: {},
        jobFlowRole: ' EMR_EC2_DefaultRole',
        name: 'foo',
        serviceRole: 'bar',
        logUri: 'baz',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});
