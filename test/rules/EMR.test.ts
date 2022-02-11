/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Aspects, CfnResource, Stack } from 'aws-cdk-lib';
import { CfnCluster } from 'aws-cdk-lib/aws-emr';
import { IConstruct } from 'constructs';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  EMRAuthEC2KeyPairOrKerberos,
  EMREncryptionInTransit,
  EMRKerberosEnabled,
  EMRLocalDiskEncryption,
  EMRS3AccessLogging,
} from '../../src/rules/emr';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        EMRAuthEC2KeyPairOrKerberos,
        EMREncryptionInTransit,
        EMRKerberosEnabled,
        EMRLocalDiskEncryption,
        EMRS3AccessLogging,
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

describe('Amazon EMR', () => {
  test('EMRAuthEC2KeyPairOrKerberos: EMR clusters implement authentication via an EC2 Key Pair or Kerberos', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCluster(nonCompliant, 'rEmrCluster', {
      instances: {},
      jobFlowRole: ' EMR_EC2_DefaultRole',
      name: 'foo',
      serviceRole: 'bar',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EMRAuthEC2KeyPairOrKerberos:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnCluster(compliant, 'rEmrCluster', {
      instances: {},
      jobFlowRole: ' EMR_EC2_DefaultRole',
      name: 'foo',
      serviceRole: 'bar',
      kerberosAttributes: {
        kdcAdminPassword: 'baz',
        realm: 'qux',
      },
    });
    new CfnCluster(compliant, 'rEmrCluster2', {
      instances: { ec2KeyName: 'baz' },
      jobFlowRole: ' EMR_EC2_DefaultRole',
      name: 'foo',
      serviceRole: 'bar',
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EMRAuthEC2KeyPairOrKerberos:'),
        }),
      })
    );
  });

  test('EMREncryptionInTransit: EMR clusters have encryption in transit enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCluster(nonCompliant, 'rEmrCluster', {
      instances: {},
      jobFlowRole: 'EMR_EC2_DefaultRole',
      name: 'foo',
      serviceRole: 'bar',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EMREncryptionInTransit:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnCluster(nonCompliant2, 'rEmrCluster', {
      instances: {},
      jobFlowRole: 'EMR_EC2_DefaultRole',
      name: 'foo',
      serviceRole: 'bar',
      securityConfiguration: 'baz',
    });
    new CfnSecurityConfiguration(nonCompliant2, 'rEmrSecConfig', {
      name: 'baz',
      securityConfiguration: {
        EnableInTransitEncryption: true,
      },
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EMREncryptionInTransit:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    new CfnCluster(nonCompliant3, 'rEmrCluster', {
      instances: {},
      jobFlowRole: 'EMR_EC2_DefaultRole',
      name: 'foo',
      serviceRole: 'bar',
      securityConfiguration: 'baz',
    });
    new CfnSecurityConfiguration(nonCompliant3, 'rEmrSecConfig', {
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
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EMREncryptionInTransit:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnCluster(compliant, 'rEmrCluster', {
      instances: {},
      jobFlowRole: 'EMR_EC2_DefaultRole',
      name: 'foo',
      serviceRole: 'bar',
      securityConfiguration: 'baz',
    });
    new CfnCluster(compliant, 'rEmrCluster2', {
      instances: {},
      jobFlowRole: 'EMR_EC2_DefaultRole',
      name: 'foo',
      serviceRole: 'bar',
      securityConfiguration: new CfnSecurityConfiguration(
        compliant,
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
    new CfnSecurityConfiguration(compliant, 'rEmrSecConfig', {
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
    const messages4 = SynthUtils.synthesize(compliant).messages;
    expect(messages4).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EMREncryptionInTransit:'),
        }),
      })
    );
  });

  test('EMRKerberosEnabled: EMR clusters have Kerberos enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCluster(nonCompliant, 'rEmrCluster', {
      instances: {},
      jobFlowRole: ' EMR_EC2_DefaultRole',
      name: 'foo',
      serviceRole: 'bar',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EMRKerberosEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnCluster(compliant, 'rEmrCluster', {
      instances: {},
      jobFlowRole: ' EMR_EC2_DefaultRole',
      name: 'foo',
      serviceRole: 'bar',
      kerberosAttributes: {
        kdcAdminPassword: 'baz',
        realm: 'qux',
      },
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EMRKerberosEnabled:'),
        }),
      })
    );
  });

  test('EMRLocalDiskEncryption: EMR clusters have local disk encryption enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCluster(nonCompliant, 'rEmrCluster', {
      instances: {},
      jobFlowRole: 'EMR_EC2_DefaultRole',
      name: 'foo',
      serviceRole: 'bar',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EMRLocalDiskEncryption:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnCluster(nonCompliant2, 'rEmrCluster', {
      instances: {},
      jobFlowRole: 'EMR_EC2_DefaultRole',
      name: 'foo',
      serviceRole: 'bar',
      securityConfiguration: 'baz',
    });
    new CfnSecurityConfiguration(nonCompliant2, 'rEmrSecConfig', {
      name: 'baz',
      securityConfiguration: {
        EnableAtRestEncryption: true,
      },
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EMRLocalDiskEncryption:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    new CfnCluster(nonCompliant3, 'rEmrCluster', {
      instances: {},
      jobFlowRole: 'EMR_EC2_DefaultRole',
      name: 'foo',
      serviceRole: 'bar',
      securityConfiguration: 'baz',
    });
    new CfnSecurityConfiguration(nonCompliant3, 'rEmrSecConfig', {
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
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EMRLocalDiskEncryption:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnCluster(compliant, 'rEmrCluster', {
      instances: {},
      jobFlowRole: 'EMR_EC2_DefaultRole',
      name: 'foo',
      serviceRole: 'bar',
      securityConfiguration: 'baz',
    });
    new CfnCluster(compliant, 'rEmrCluster2', {
      instances: {},
      jobFlowRole: 'EMR_EC2_DefaultRole',
      name: 'foo',
      serviceRole: 'bar',
      securityConfiguration: new CfnSecurityConfiguration(
        compliant,
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
    new CfnSecurityConfiguration(compliant, 'rEmrSecConfig', {
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
    const messages4 = SynthUtils.synthesize(compliant).messages;
    expect(messages4).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EMRLocalDiskEncryption:'),
        }),
      })
    );
  });

  test('EMRS3AccessLogging: EMR clusters have S3 logging enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCluster(nonCompliant, 'rEmrCluster', {
      instances: {},
      jobFlowRole: ' EMR_EC2_DefaultRole',
      name: 'foo',
      serviceRole: 'bar',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EMRS3AccessLogging:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnCluster(compliant, 'rEmrCluster', {
      instances: {},
      jobFlowRole: ' EMR_EC2_DefaultRole',
      name: 'foo',
      serviceRole: 'bar',
      logUri: 'baz',
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('EMRS3AccessLogging:'),
        }),
      })
    );
  });
});
