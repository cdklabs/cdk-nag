/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import {
  AnyPrincipal,
  ArnPrincipal,
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
  StarPrincipal,
} from 'aws-cdk-lib/aws-iam';
import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
  BucketEncryption,
  BucketPolicy,
  CfnBucket,
  CfnBucketPolicy,
} from 'aws-cdk-lib/aws-s3';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import { TestPack, TestType, validateStack } from './utils';
import {
  S3BucketDefaultLockEnabled,
  S3BucketLevelPublicAccessProhibited,
  S3BucketLoggingEnabled,
  S3BucketPublicReadProhibited,
  S3BucketPublicWriteProhibited,
  S3BucketReplicationEnabled,
  S3BucketSSLRequestsOnly,
  S3BucketVersioningEnabled,
  S3DefaultEncryptionKMS,
  S3WebBucketOAIAccess,
} from '../../src/rules/s3';

const testPack = new TestPack([
  S3BucketDefaultLockEnabled,
  S3BucketLevelPublicAccessProhibited,
  S3BucketLoggingEnabled,
  S3BucketPublicReadProhibited,
  S3BucketPublicWriteProhibited,
  S3BucketReplicationEnabled,
  S3BucketSSLRequestsOnly,
  S3BucketVersioningEnabled,
  S3DefaultEncryptionKMS,
  S3WebBucketOAIAccess,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon Simple Storage Service (S3)', () => {
  describe('S3BucketDefaultLockEnabled: S3 Buckets have object lock enabled', () => {
    const ruleId = 'S3BucketDefaultLockEnabled';
    test('Noncompliance 1', () => {
      new Bucket(stack, 'rBucket');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnBucket(stack, 'rBucket', { objectLockEnabled: true });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnBucket(stack, 'rBucket', {
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
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('S3BucketLevelPublicAccessProhibited: S3 Buckets prohibit public access through bucket level settings', () => {
    const ruleId = 'S3BucketLevelPublicAccessProhibited';
    test('Noncompliance 1', () => {
      new Bucket(stack, 'rBucket', {
        blockPublicAccess: {
          blockPublicPolicy: true,
          blockPublicAcls: false,
          ignorePublicAcls: false,
          restrictPublicBuckets: false,
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Bucket(stack, 'rBucket', {
        blockPublicAccess: new BlockPublicAccess({ blockPublicAcls: true }),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new CfnBucket(stack, 'Bucket', {
        publicAccessBlockConfiguration: { blockPublicAcls: true },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Bucket(stack, 'rBucket');
      new Bucket(stack, 'rBucket2', {
        blockPublicAccess: {
          blockPublicPolicy: true,
          blockPublicAcls: true,
          ignorePublicAcls: true,
          restrictPublicBuckets: true,
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('S3BucketLoggingEnabled: S3 Buckets have server access logs enabled', () => {
    const ruleId = 'S3BucketLoggingEnabled';
    test('Noncompliance 1', () => {
      new Bucket(stack, 'Bucket');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Bucket(stack, 'LogsBucket', { bucketName: 'foo' });
      new Bucket(stack, 'Bucket', {
        serverAccessLogsBucket: Bucket.fromBucketName(
          stack,
          'LogsBucketFromName',
          'foobar'
        ),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3: specified but empty loggingConfiguration', () => {
      new CfnBucket(stack, 'Bucket', { loggingConfiguration: {} });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Bucket(stack, 'LogsBucket', { bucketName: 'bar' });
      new Bucket(stack, 'Bucket', {
        serverAccessLogsBucket: Bucket.fromBucketName(
          stack,
          'LogsBucketFromName',
          'bar'
        ),
      });
      new Bucket(stack, 'Bucket2', {
        serverAccessLogsBucket: new Bucket(stack, 'LogsBucket2'),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('S3BucketPublicReadProhibited: S3 Buckets prohibit public read access through their Block Public Access configurations and bucket ACLs', () => {
    const ruleId = 'S3BucketPublicReadProhibited';
    test('Noncompliance 1', () => {
      new Bucket(stack, 'rBucket');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Bucket(stack, 'rBucket', {
        blockPublicAccess: {
          blockPublicPolicy: true,
          blockPublicAcls: false,
          ignorePublicAcls: false,
          restrictPublicBuckets: false,
        },
        accessControl: BucketAccessControl.PUBLIC_READ,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Bucket(stack, 'rBucket', {
        blockPublicAccess: {
          blockPublicPolicy: true,
          blockPublicAcls: true,
          ignorePublicAcls: false,
          restrictPublicBuckets: false,
        },
        accessControl: BucketAccessControl.PUBLIC_READ,
      });
      new Bucket(stack, 'rBucket2', {
        blockPublicAccess: {
          blockPublicPolicy: true,
          blockPublicAcls: false,
          ignorePublicAcls: false,
          restrictPublicBuckets: false,
        },
        accessControl: BucketAccessControl.PRIVATE,
      });
      new Bucket(stack, 'rBucket3', {
        blockPublicAccess: {
          blockPublicPolicy: true,
          blockPublicAcls: true,
          ignorePublicAcls: false,
          restrictPublicBuckets: false,
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('S3BucketPublicWriteProhibited: S3 Buckets prohibit public write access through their Block Public Access configurations and bucket ACLs', () => {
    const ruleId = 'S3BucketPublicWriteProhibited';
    test('Noncompliance 1', () => {
      new Bucket(stack, 'rBucket');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Bucket(stack, 'rBucket', {
        blockPublicAccess: {
          blockPublicPolicy: true,
          blockPublicAcls: false,
          ignorePublicAcls: false,
          restrictPublicBuckets: false,
        },
        accessControl: BucketAccessControl.PUBLIC_READ_WRITE,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Bucket(stack, 'rBucket', {
        blockPublicAccess: {
          blockPublicPolicy: true,
          blockPublicAcls: true,
          ignorePublicAcls: false,
          restrictPublicBuckets: false,
        },
        accessControl: BucketAccessControl.PUBLIC_READ_WRITE,
      });
      new Bucket(stack, 'rBucket2', {
        blockPublicAccess: {
          blockPublicPolicy: true,
          blockPublicAcls: false,
          ignorePublicAcls: false,
          restrictPublicBuckets: false,
        },
        accessControl: BucketAccessControl.PRIVATE,
      });
      new Bucket(stack, 'rBucket3', {
        blockPublicAccess: {
          blockPublicPolicy: true,
          blockPublicAcls: true,
          ignorePublicAcls: false,
          restrictPublicBuckets: false,
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('S3BucketReplicationEnabled: S3 Buckets have replication enabled', () => {
    const ruleId = 'S3BucketReplicationEnabled';
    test('Noncompliance 1', () => {
      new Bucket(stack, 'rBucket');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnBucket(stack, 'rBucket', {
        replicationConfiguration: {
          role: new Role(stack, 'rReplicationRole', {
            assumedBy: new ServicePrincipal('s3.amazonaws.com'),
          }).roleArn,
          rules: [{ destination: { bucket: 'foo' }, status: 'Disabled' }],
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnBucket(stack, 'rBucket', {
        replicationConfiguration: {
          role: new Role(stack, 'rReplicationRole', {
            assumedBy: new ServicePrincipal('s3.amazonaws.com'),
          }).roleArn,
          rules: [{ destination: { bucket: 'foo' }, status: 'Enabled' }],
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('S3BucketSSLRequestsOnly: S3 Buckets and bucket policies require requests to use SSL', () => {
    const ruleId = 'S3BucketSSLRequestsOnly';
    test('Noncompliance 1', () => {
      new CfnBucket(stack, 'rBucket');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnBucket(stack, 'rBucket', { bucketName: 'foo' });
      new CfnBucketPolicy(stack, 'rPolicy', {
        bucket: 'foo',
        policyDocument: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['nots3:*'],
              effect: Effect.DENY,
              principals: [new AnyPrincipal()],
              conditions: { Bool: { 'aws:SecureTransport': 'false' } },
              resources: ['arn:aws:s3:::foo', 'arn:aws:s3:::foo/*'],
            }),
          ],
        }),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new CfnBucket(stack, 'rBucket', { bucketName: 'foo' });
      new CfnBucketPolicy(stack, 'rPolicy', {
        bucket: 'foo',
        policyDocument: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['s3:*'],
              effect: Effect.DENY,
              principals: [new AnyPrincipal()],
              conditions: { Bool: { 'aws:SecureTransport': 'false' } },
              resources: ['arn:aws:s3:::foo', 'arn:aws:s3:::food/*'],
            }),
          ],
        }),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      new CfnBucket(stack, 'rBucket', { bucketName: 'foo' });
      new CfnBucketPolicy(stack, 'rPolicy', {
        bucket: 'foo',
        policyDocument: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['s3:*'],
              effect: Effect.DENY,
              principals: [new AnyPrincipal()],
              conditions: { Bool: { 'aws:SecureTransport': 'false' } },
              resources: ['arn:aws:s3:::foo', 'arn:aws:s3:::foo/s/*'],
            }),
          ],
        }),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 5', () => {
      new CfnBucketPolicy(stack, 'rPolicy', {
        bucket: 'foo',
        policyDocument: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['s3:*'],
              effect: Effect.DENY,
              principals: [new AnyPrincipal()],
              conditions: { Bool: { 'aws:SecureTransport': 'false' } },
              resources: [
                'arn:aws:s3:::foo',
                new Bucket(stack, 'rBucket', { bucketName: 'foo' }).bucketArn +
                  '/path' +
                  '/*',
              ],
            }),
          ],
        }),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 6', () => {
      new CfnBucket(stack, 'rBucket', { bucketName: 'food' });
      new CfnBucketPolicy(stack, 'rPolicy', {
        bucket: 'foo',
        policyDocument: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['s3:*'],
              effect: Effect.DENY,
              principals: [new AnyPrincipal()],
              conditions: { Bool: { 'aws:SecureTransport': 'false' } },
              resources: ['arn:aws:s3:::foo', 'arn:aws:s3:::foo/*'],
            }),
          ],
        }),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 7', () => {
      new CfnBucketPolicy(stack, 'rPolicy', {
        bucket: 'foo',
        policyDocument: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['nots3:*'],
              effect: Effect.DENY,
              principals: [new AnyPrincipal()],
              conditions: { Bool: { 'aws:SecureTransport': 'false' } },
              resources: ['arn:aws:s3:::foo', 'arn:aws:s3:::foo/*'],
            }),
          ],
        }),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 8', () => {
      new CfnBucketPolicy(stack, 'rPolicy', {
        bucket: 'foo',
        policyDocument: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['s3:*'],
              effect: Effect.DENY,
              principals: [new AnyPrincipal()],
              conditions: { Bool: { 'aws:SecureTransport': 'false' } },
              resources: ['arn:aws:s3:::foo', 'arn:aws:s3:::foobar/*'],
            }),
          ],
        }),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 9', () => {
      const bucket = new Bucket(stack, 'rBucket', {
        enforceSSL: true,
      });
      const newPolicy = new BucketPolicy(stack, 'rBucketPolicy2', {
        bucket: bucket,
      });
      newPolicy.document.addStatements(
        new PolicyStatement({
          effect: Effect.DENY,
          principals: [new AnyPrincipal()],
          actions: ['s3:PutObject'],
          resources: [bucket.arnForObjects('*')],
          conditions: {
            StringNotLikeIfExists: {
              's3:x-amz-server-side-encryption-aws-kms-key-id': 'foo',
            },
          },
        }),
        new PolicyStatement({
          effect: Effect.DENY,
          principals: [new AnyPrincipal()],
          actions: ['s3:PutObject'],
          resources: [bucket.arnForObjects('*')],
          conditions: {
            StringEquals: {
              's3:x-amz-server-side-encryption': 'AES256',
            },
          },
        })
      );
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 10: non-wildcard principal', () => {
      new CfnBucket(stack, 'Bucket', { bucketName: 'bucket' });
      new CfnBucketPolicy(stack, 'Policy', {
        bucket: 'bucket',
        policyDocument: {
          Statement: [
            {
              Action: 's3:*',
              Effect: 'Deny',
              Principal: { AWS: 'arn:aws:iam::123456789012:user/Alice' },
              Resource: ['arn:aws:s3:::bucket', 'arn:aws:s3:::bucket/*'],
              Condition: {
                Bool: { 'aws:SecureTransport': 'false' },
              },
            },
          ],
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 11: non-array resource', () => {
      new CfnBucket(stack, 'Bucket', { bucketName: 'bucket' });
      new CfnBucketPolicy(stack, 'Policy', {
        bucket: 'bucket',
        policyDocument: {
          Statement: [
            {
              Action: 's3:*',
              Effect: 'Deny',
              Principal: {
                AWS: ['*'],
              },
              Resource: 'arn:aws:s3:::bucket/*',
              Condition: {
                Bool: { 'aws:SecureTransport': 'false' },
              },
            },
          ],
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const compliantBucket = new Bucket(stack, 'rBucket');
      new CfnBucketPolicy(stack, 'rPolicy', {
        bucket: compliantBucket.bucketName,
        policyDocument: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['s3:getObject', 's3:*'],
              effect: Effect.DENY,
              principals: [new StarPrincipal()],
              conditions: { Bool: { 'aws:SecureTransport': 'false' } },
              resources: [
                compliantBucket.bucketArn,
                compliantBucket.bucketArn + '/*',
              ],
            }),
          ],
        }),
      });
      new CfnBucket(stack, 'rBucket2', { bucketName: 'foo' });
      new CfnBucketPolicy(stack, 'rPolicy2', {
        bucket: 'foo',
        policyDocument: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['*', 's3:getObject'],
              effect: Effect.DENY,
              principals: [new AnyPrincipal()],
              conditions: { Bool: { 'aws:SecureTransport': false } },
              resources: [
                'arn:aws:s3:::foo',
                'arn:aws:s3:::foo/*',
                'arn:aws:s3:::foo/path/*',
              ],
            }),
          ],
        }),
      });
      new CfnBucket(stack, 'rBucket3', { bucketName: 'bar' });
      new CfnBucketPolicy(stack, 'rPolicy3', {
        bucket: 'bar',
        policyDocument: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['*', 's3:getObject'],
              effect: Effect.DENY,
              principals: [new AnyPrincipal()],
              conditions: { Bool: { 'aws:SecureTransport': 'false' } },
              resources: ['arn:aws:s3:::bar/*', 'arn:aws:s3:::bar'],
            }),
          ],
        }),
      });
      const importedBucket = Bucket.fromBucketName(
        stack,
        'rImportedBucket',
        'baz'
      );
      new CfnBucketPolicy(stack, 'rPolicy4', {
        bucket: importedBucket.bucketName,
        policyDocument: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['s3:*'],
              effect: Effect.DENY,
              principals: [new AnyPrincipal()],
              conditions: { Bool: { 'aws:SecureTransport': 'false' } },
              resources: [
                importedBucket.bucketArn,
                importedBucket.arnForObjects('*'),
              ],
            }),
          ],
        }),
      });
      new CfnBucket(stack, 'Bucket5', { bucketName: 'bucket5' });
      new CfnBucketPolicy(stack, 'Policy5', {
        bucket: 'bucket5',
        policyDocument: {
          Statement: [
            {
              Action: 's3:*',
              Effect: 'Deny',
              Principal: {
                AWS: ['*'],
              },
              Resource: ['arn:aws:s3:::bucket5', 'arn:aws:s3:::bucket5/*'],
              Condition: {
                Bool: { 'aws:SecureTransport': 'false' },
              },
            },
          ],
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('S3BucketVersioningEnabled: S3 Buckets have versioningConfiguration enabled', () => {
    const ruleId = 'S3BucketVersioningEnabled';
    test('Noncompliance 1', () => {
      new Bucket(stack, 'rBucket');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnBucket(stack, 'rBucket', {
        versioningConfiguration: {
          status: 'Suspended',
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Bucket(stack, 'rBucket', { versioned: true });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('S3DefaultEncryptionKMS: S3 Buckets are encrypted with a KMS Key by default', () => {
    const ruleId = 'S3DefaultEncryptionKMS';
    test('Noncompliance 1', () => {
      new Bucket(stack, 'rBucket');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2: serverSideEncryptionConfiguration without serverSideEncryptionByDefault rule', () => {
      new CfnBucket(stack, 'Bucket', {
        bucketEncryption: {
          serverSideEncryptionConfiguration: [{}],
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3: sseAlgorithm is not aws:kms', () => {
      new CfnBucket(stack, 'Bucket', {
        bucketEncryption: {
          serverSideEncryptionConfiguration: [
            {
              serverSideEncryptionByDefault: {
                sseAlgorithm: 'AES256',
              },
            },
          ],
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Bucket(stack, 'rBucket', { encryption: BucketEncryption.KMS });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('S3WebBucketOAIAccess: S3 static website buckets do not have an open world bucket policy and use CloudFront Origin Access Identities in the bucket policy for limited getObject and/or putObject permissions', () => {
    const ruleId = 'S3WebBucketOAIAccess';
    test('Noncompliance 1', () => {
      new CfnBucket(stack, 'rBucket', {
        websiteConfiguration: {
          indexDocument: 'index.html',
          errorDocument: 'error.html',
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnBucket(stack, 'rBucket', {
        bucketName: 'foo',
        websiteConfiguration: {
          indexDocument: 'index.html',
          errorDocument: 'error.html',
        },
      });
      new CfnBucketPolicy(stack, 'rPolicy', {
        bucket: 'foo',
        policyDocument: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['*'],
              effect: Effect.ALLOW,
              principals: [new AnyPrincipal()],
              resources: ['arn:aws:s3:::foo', 'arn:aws:s3:::foo/*'],
            }),
            new PolicyStatement({
              actions: ['s3:getobject'],
              effect: Effect.ALLOW,
              principals: [
                new OriginAccessIdentity(stack, 'rOAI').grantPrincipal,
              ],
              resources: ['arn:aws:s3:::foo', 'arn:aws:s3:::foo/*'],
            }),
          ],
        }),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new CfnBucket(stack, 'rBucket', {
        bucketName: 'foo',
        websiteConfiguration: {
          indexDocument: 'index.html',
          errorDocument: 'error.html',
        },
      });
      new CfnBucketPolicy(stack, 'rPolicy', {
        bucket: 'foo',
        policyDocument: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['s3:getobject', 's3:*'],
              effect: Effect.ALLOW,
              principals: [
                new OriginAccessIdentity(stack, 'rOAI').grantPrincipal,
              ],
              resources: ['arn:aws:s3:::foo', 'arn:aws:s3:::foo/*'],
            }),
          ],
        }),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Bucket(stack, 'rBucket');
      new CfnBucket(stack, 'rBucket2', {
        bucketName: 'foo',
        websiteConfiguration: {
          indexDocument: 'index.html',
          errorDocument: 'error.html',
        },
      });
      new CfnBucketPolicy(stack, 'rPolicy2', {
        bucket: 'foo',
        policyDocument: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['s3:getobject'],
              effect: Effect.ALLOW,
              principals: [
                new OriginAccessIdentity(stack, 'rOAI2').grantPrincipal,
              ],
              resources: ['arn:aws:s3:::foo', 'arn:aws:s3:::foo/*'],
            }),
          ],
        }),
      });
      const compliantBucket = new Bucket(stack, 'rBucket3', {
        websiteIndexDocument: 'index.html',
      });
      compliantBucket.addToResourcePolicy(
        new PolicyStatement({
          actions: ['s3:getobject', 's3:putobject'],
          effect: Effect.ALLOW,
          principals: [
            new ArnPrincipal(
              'arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity EH1HDMB1FH2TC'
            ),
          ],
          resources: [
            compliantBucket.bucketArn,
            compliantBucket.arnForObjects('*'),
          ],
        })
      );
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});
