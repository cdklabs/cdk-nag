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
import { NIST80053Checks } from '../../src';

describe('Amazon Simple Storage Service (S3)', () => {
  test('NIST.800.53-S3BucketDefaultLockEnabled: S3 Buckets have object lock enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053Checks());
    new Bucket(nonCompliant, 'rBucket');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53-S3BucketDefaultLockEnabled:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053Checks());
    new CfnBucket(nonCompliant2, 'rBucket', { objectLockEnabled: true });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53-S3BucketDefaultLockEnabled:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053Checks());
    new CfnBucket(compliant, 'rBucket', {
      objectLockEnabled: true,
      objectLockConfiguration: {
        objectLockEnabled: 'Enabled',
        rule: {
          defaultRetention: {
            mode: 'GOVERNANCE',
            days: 1,
          },
        },
      },
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53-S3BucketDefaultLockEnabled:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53-S3BucketLoggingEnabled: S3 Buckets have server access logs enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053Checks());
    new Bucket(nonCompliant, 'rBucket');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53-S3BucketLoggingEnabled:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053Checks());
    new Bucket(compliant, 'rBucket', {
      serverAccessLogsBucket: Bucket.fromBucketName(
        compliant,
        'rLogsBucket',
        'foo'
      ),
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53-S3BucketLoggingEnabled:'),
        }),
      })
    );
  });

  test('NIST.800.53-S3BucketPublicReadProhibited: S3 Buckets prohibit public read access through their Block Public Access configurations and bucket ACLs', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053Checks());
    new Bucket(nonCompliant, 'rBucket');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53-S3BucketPublicReadProhibited:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053Checks());
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
            'NIST.800.53-S3BucketPublicReadProhibited:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053Checks());
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
            'NIST.800.53-S3BucketPublicReadProhibited:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53-S3BucketPublicWriteProhibited: S3 Buckets prohibit public write access through their Block Public Access configurations and bucket ACLs', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053Checks());
    new Bucket(nonCompliant, 'rBucket');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53-S3BucketPublicWriteProhibited:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053Checks());
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
            'NIST.800.53-S3BucketPublicWriteProhibited:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053Checks());
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
            'NIST.800.53-S3BucketPublicWriteProhibited:'
          ),
        }),
      })
    );
  });
  test('NIST.800.53-S3BucketReplicationEnabled: S3 Buckets have replication enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053Checks());
    new Bucket(nonCompliant, 'rBucket');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53-S3BucketReplicationEnabled:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053Checks());
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
            'NIST.800.53-S3BucketReplicationEnabled:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053Checks());
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
            'NIST.800.53-S3BucketReplicationEnabled:'
          ),
        }),
      })
    );
  });
  test('NIST.800.53-S3BucketServerSideEncryptionEnabled: S3 Buckets have default server-side encryption enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053Checks());
    new Bucket(nonCompliant, 'rBucket');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53-S3BucketServerSideEncryptionEnabled:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053Checks());
    new Bucket(compliant, 'rBucket', { encryption: BucketEncryption.KMS });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53-S3BucketServerSideEncryptionEnabled:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53-S3BucketVersioningEnabled: S3 Buckets have versioning enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053Checks());
    new Bucket(nonCompliant, 'rBucket');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53-S3BucketVersioningEnabled:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053Checks());
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
            'NIST.800.53-S3BucketVersioningEnabled:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053Checks());
    new Bucket(compliant, 'rBucket', { versioned: true });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53-S3BucketVersioningEnabled:'
          ),
        }),
      })
    );
  });
});
