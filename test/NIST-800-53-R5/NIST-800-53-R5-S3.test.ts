/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import {
  Bucket,
  BucketAccessControl,
  BucketEncryption,
  CfnBucket,
} from '@aws-cdk/aws-s3';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R5Checks } from '../../src';

describe('Amazon Simple Storage Service (S3)', () => {
  test('NIST.800.53.R5-S3BucketLevelPublicAccessProhibited: - S3 Buckets prohibit public access through bucket level settings - (Control IDs: AC-2(6), AC-3, AC-3(7), AC-4(21), AC-6, AC-17b, AC-17(1), AC-17(1), AC-17(4)(a), AC-17(9), AC-17(10), MP-2, SC-7a, SC-7b, SC-7c, SC-7(2), SC-7(3), SC-7(7), SC-7(9)(a), SC-7(11), SC-7(20), SC-7(21), SC-7(24)(b), SC-7(25), SC-7(26), SC-7(27), SC-7(28), SC-25)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new Bucket(nonCompliant, 'rBucket');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-S3BucketLevelPublicAccessProhibited:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new Bucket(nonCompliant2, 'rBucket', {
      blockPublicAccess: {
        blockPublicPolicy: true,
        blockPublicAcls: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-S3BucketLevelPublicAccessProhibited:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new Bucket(compliant, 'rBucket', {
      blockPublicAccess: {
        blockPublicPolicy: true,
        blockPublicAcls: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,
      },
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-S3BucketLevelPublicAccessProhibited:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-S3BucketLoggingEnabled: - S3 Buckets have server access logs enabled - (Control IDs: AC-2(4), AC-3(1), AC-3(10), AC-4(26), AC-6(9), AU-2b, AU-3a, AU-3b, AU-3c, AU-3d, AU-3e, AU-3f, AU-6(3), AU-6(4), AU-6(6), AU-6(9), AU-8b, AU-10, AU-12a, AU-12c, AU-12(1), AU-12(2), AU-12(3), AU-12(4), AU-14a, AU-14b, AU-14b, AU-14(3), CA-7b, CM-5(1)(b), CM-6a, CM-9b, IA-3(3)(b), MA-4(1)(a), PM-14a.1, PM-14b, PM-31, SC-7(9)(b), SI-1(1)(c), SI-3(8)(b), SI-4(2), SI-4(17), SI-4(20), SI-7(8), SI-10(1)(c))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new Bucket(nonCompliant, 'rBucket');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-S3BucketLoggingEnabled:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new Bucket(compliant, 'rBucket', {
      serverAccessLogsBucket: Bucket.fromBucketName(
        compliant,
        'rLogsBucket',
        'foo'
      ),
    });
    new Bucket(compliant, 'rBucket2', {
      serverAccessLogsPrefix: 'foo',
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-S3BucketLoggingEnabled:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-S3BucketPublicReadProhibited: - S3 Buckets prohibit public read access through their Block Public Access configurations and bucket ACLs - (Control IDs: AC-2(6), AC-3, AC-3(7), AC-4(21), AC-6, AC-17b, AC-17(1), AC-17(1), AC-17(4)(a), AC-17(9), AC-17(10), CM-6a, CM-9b, MP-2, SC-7a, SC-7b, SC-7c, SC-7(2), SC-7(3), SC-7(7), SC-7(9)(a), SC-7(11), SC-7(12), SC-7(16), SC-7(20), SC-7(21), SC-7(24)(b), SC-7(25), SC-7(26), SC-7(27), SC-7(28), SC-25)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new Bucket(nonCompliant, 'rBucket');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-S3BucketPublicReadProhibited:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new Bucket(nonCompliant2, 'rBucket', {
      blockPublicAccess: {
        blockPublicPolicy: true,
        blockPublicAcls: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      accessControl: BucketAccessControl.PUBLIC_READ,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-S3BucketPublicReadProhibited:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new Bucket(compliant, 'rBucket', {
      blockPublicAccess: {
        blockPublicPolicy: true,
        blockPublicAcls: true,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      accessControl: BucketAccessControl.PUBLIC_READ,
    });
    new Bucket(compliant, 'rBucket2', {
      blockPublicAccess: {
        blockPublicPolicy: true,
        blockPublicAcls: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      accessControl: BucketAccessControl.PRIVATE,
    });
    new Bucket(compliant, 'rBucket3', {
      blockPublicAccess: {
        blockPublicPolicy: true,
        blockPublicAcls: true,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-S3BucketPublicReadProhibited:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-S3BucketPublicWriteProhibited: - S3 Buckets prohibit public write access through their Block Public Access configurations and bucket ACLs - (Control IDs: AC-2(6), AC-3, AC-3(7), AC-4(21), AC-6, AC-17b, AC-17(1), AC-17(1), AC-17(4)(a), AC-17(9), AC-17(10), CM-6a, CM-9b, MP-2, SC-7a, SC-7b, SC-7c, SC-7(2), SC-7(3), SC-7(7), SC-7(9)(a), SC-7(11), SC-7(12), SC-7(16), SC-7(20), SC-7(21), SC-7(24)(b), SC-7(25), SC-7(26), SC-7(27), SC-7(28), SC-25)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new Bucket(nonCompliant, 'rBucket');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-S3BucketPublicWriteProhibited:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new Bucket(nonCompliant2, 'rBucket', {
      blockPublicAccess: {
        blockPublicPolicy: true,
        blockPublicAcls: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      accessControl: BucketAccessControl.PUBLIC_READ_WRITE,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-S3BucketPublicWriteProhibited:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new Bucket(compliant, 'rBucket', {
      blockPublicAccess: {
        blockPublicPolicy: true,
        blockPublicAcls: true,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      accessControl: BucketAccessControl.PUBLIC_READ_WRITE,
    });
    new Bucket(compliant, 'rBucket2', {
      blockPublicAccess: {
        blockPublicPolicy: true,
        blockPublicAcls: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      accessControl: BucketAccessControl.PRIVATE,
    });
    new Bucket(compliant, 'rBucket3', {
      blockPublicAccess: {
        blockPublicPolicy: true,
        blockPublicAcls: true,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-S3BucketPublicWriteProhibited:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-S3BucketReplicationEnabled: - S3 Buckets have replication enabled - (Control IDs: AU-9(2), CM-6a, CM-9b, CP-1(2), CP-2(5), CP-6a, CP-6(1), CP-6(2), CP-9a, CP-9b, CP-9c, CP-10, CP-10(2), SC-5(2), SI-13(5))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new Bucket(nonCompliant, 'rBucket');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-S3BucketReplicationEnabled:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new CfnBucket(nonCompliant2, 'rBucket', {
      replicationConfiguration: {
        role: new Role(nonCompliant2, 'rReplicationRole', {
          assumedBy: new ServicePrincipal('s3.amazonaws.com'),
        }).roleArn,
        rules: [{ destination: { bucket: 'foo' }, status: 'Disabled' }],
      },
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-S3BucketReplicationEnabled:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new CfnBucket(compliant, 'rBucket', {
      replicationConfiguration: {
        role: new Role(compliant, 'rReplicationRole', {
          assumedBy: new ServicePrincipal('s3.amazonaws.com'),
        }).roleArn,
        rules: [{ destination: { bucket: 'foo' }, status: 'Enabled' }],
      },
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-S3BucketReplicationEnabled:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-S3BucketServerSideEncryptionEnabled: - S3 Buckets have default server-side encryption enabled - (Control IDs: AU-9(3), CM-6a, CM-9b, CP-9d, CP-9(8), PM-11b, SC-8(3), SC-8(4), SC-13a, SC-16(1), SC-28(1), SI-19(4))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new Bucket(nonCompliant, 'rBucket');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-S3BucketServerSideEncryptionEnabled:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new Bucket(compliant, 'rBucket', {
      encryption: BucketEncryption.S3_MANAGED,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-S3BucketServerSideEncryptionEnabled:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-S3BucketVersioningEnabled: - S3 Buckets have versioningConfiguration enabled - (Control IDs: AU-9(2), CP-1(2), CP-2(5), CP-6a, CP-6(1), CP-6(2), CP-9a, CP-9b, CP-9c, CP-10, CP-10(2), PM-11b, PM-17b, SC-5(2), SC-16(1), SI-1a.2, SI-1a.2, SI-1c.2, SI-13(5))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new Bucket(nonCompliant, 'rBucket');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-S3BucketVersioningEnabled:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new CfnBucket(nonCompliant2, 'rBucket', {
      versioningConfiguration: {
        status: 'Suspended',
      },
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-S3BucketVersioningEnabled:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new Bucket(compliant, 'rBucket', { versioned: true });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-S3BucketVersioningEnabled:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-S3DefaultEncryptionKMS: - S3 Buckets are encrypted with a KMS Key by default - (Control IDs: AU-9(3), CP-9d, CP-9(8), SC-8(3), SC-8(4), SC-13a, SC-28(1), SI-19(4))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new Bucket(nonCompliant, 'rBucket');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-S3DefaultEncryptionKMS:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new Bucket(compliant, 'rBucket', { encryption: BucketEncryption.KMS });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-S3DefaultEncryptionKMS:'
          ),
        }),
      })
    );
  });
});
