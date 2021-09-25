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
import { HIPAASecurityChecks } from '../../src';

describe('Amazon Simple Storage Service (S3)', () => {
  test('HIPAA.Security-S3BucketLevelPublicAccessProhibited: - S3 Buckets prohibit public access through bucket level settings - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new Bucket(nonCompliant, 'rBucket');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-S3BucketLevelPublicAccessProhibited:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-S3BucketLevelPublicAccessProhibited:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-S3BucketLevelPublicAccessProhibited:'
          ),
        }),
      })
    );
  });

  test('HIPAA.Security-S3BucketLoggingEnabled: - S3 Buckets have server access logs enabled - (Control IDs: 164.308(a)(3)(ii)(A), 164.312(b))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new Bucket(nonCompliant, 'rBucket');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-S3BucketLoggingEnabled:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-S3BucketLoggingEnabled:'
          ),
        }),
      })
    );
  });

  test('HIPAA.Security-S3BucketPublicReadProhibited: - S3 Buckets prohibit public read access through their Block Public Access configurations and bucket ACLs - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new Bucket(nonCompliant, 'rBucket');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-S3BucketPublicReadProhibited:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-S3BucketPublicReadProhibited:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-S3BucketPublicReadProhibited:'
          ),
        }),
      })
    );
  });

  test('HIPAA.Security-S3BucketPublicWriteProhibited: - S3 Buckets prohibit public write access through their Block Public Access configurations and bucket ACLs - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new Bucket(nonCompliant, 'rBucket');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-S3BucketPublicWriteProhibited:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-S3BucketPublicWriteProhibited:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-S3BucketPublicWriteProhibited:'
          ),
        }),
      })
    );
  });

  test('HIPAA.Security-S3BucketReplicationEnabled: - S3 Buckets have replication enabled - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new Bucket(nonCompliant, 'rBucket');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-S3BucketReplicationEnabled:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-S3BucketReplicationEnabled:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-S3BucketReplicationEnabled:'
          ),
        }),
      })
    );
  });

  test('HIPAA.Security-S3BucketServerSideEncryptionEnabled: - S3 Buckets have default server-side encryption enabled - (Control IDs: 164.312(a)(2)(iv), 164.312(c)(2), 164.312(e)(2)(ii))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new Bucket(nonCompliant, 'rBucket');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-S3BucketServerSideEncryptionEnabled:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
    new Bucket(compliant, 'rBucket', {
      encryption: BucketEncryption.S3_MANAGED,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-S3BucketServerSideEncryptionEnabled:'
          ),
        }),
      })
    );
  });

  test('HIPAA.Security-S3BucketVersioningEnabled: - S3 Buckets have versioningConfiguration enabled - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B), 164.312(c)(1), 164.312(c)(2))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new Bucket(nonCompliant, 'rBucket');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-S3BucketVersioningEnabled:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-S3BucketVersioningEnabled:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
    new Bucket(compliant, 'rBucket', { versioned: true });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-S3BucketVersioningEnabled:'
          ),
        }),
      })
    );
  });

  test('HIPAA.Security-S3DefaultEncryptionKMS: - S3 Buckets are encrypted with a KMS Key by default - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new Bucket(nonCompliant, 'rBucket');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-S3DefaultEncryptionKMS:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
    new Bucket(compliant, 'rBucket', { encryption: BucketEncryption.KMS });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-S3DefaultEncryptionKMS:'
          ),
        }),
      })
    );
  });
});
