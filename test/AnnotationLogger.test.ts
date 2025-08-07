/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { App, Stack, aws_s3 as s3 } from 'aws-cdk-lib';
import { CfnBucket } from 'aws-cdk-lib/aws-s3';
import {
  AnnotationLogger,
  NagLoggerNonComplianceData,
} from '../src/nag-logger';
import { NagMessageLevel } from '../src/nag-rules';

describe('AnnotationLogger', () => {
  let app: App;
  let stack: Stack;
  let resource: s3.Bucket;
  let cfnBucket: CfnBucket;
  let logger: AnnotationLogger;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestStack');
    resource = new s3.Bucket(stack, 'TestBucket');
    cfnBucket = resource.node.defaultChild as CfnBucket;
    logger = new AnnotationLogger({ verbose: true });
  });

  it('should add an error annotation for ERROR level', () => {
    const data: NagLoggerNonComplianceData = {
      nagPackName: 'TestPack',
      resource: cfnBucket,
      ruleId: 'S3BucketError1',
      ruleOriginalName: 'S3BucketError1',
      ruleInfo: 'S3 bucket rule that will throw an error',
      ruleExplanation: 'This rule throws an error for a certain condition.',
      ruleLevel: NagMessageLevel.ERROR,
      findingId: 'ERROR.1',
    };
    logger.onNonCompliance(data);
    const meta = cfnBucket.node.metadata;
    expect(
      meta.some(
        (entry) =>
          entry.type === 'aws:cdk:error' &&
          (entry.data as string).includes('S3BucketError1')
      )
    ).toBe(true);
  });

  it('should add a warning annotation for WARN level', () => {
    const data: NagLoggerNonComplianceData = {
      nagPackName: 'TestPack',
      resource: cfnBucket,
      ruleId: 'S3BucketWarning1',
      ruleOriginalName: 'S3BucketWarning1',
      ruleInfo: 'S3 bucket rule that will throw a warning',
      ruleExplanation: 'This rule throws a warning for a certain condition.',
      ruleLevel: NagMessageLevel.WARN,
      findingId: 'WARNING.1',
    };
    logger.onNonCompliance(data);
    const meta = cfnBucket.node.metadata;
    expect(
      meta.some(
        (entry) =>
          entry.type === 'aws:cdk:warning' &&
          (entry.data as string).includes('S3BucketWarning1')
      )
    ).toBe(true);
  });

  it('should add an info annotation for INFO level', () => {
    const data: NagLoggerNonComplianceData = {
      nagPackName: 'TestPack',
      resource: cfnBucket,
      ruleId: 'S3BucketInfo1',
      ruleOriginalName: 'S3BucketInfo1',
      ruleInfo: 'S3 bucket rule that will throw an info',
      ruleExplanation: 'This rule throws an info for a certain condition.',
      ruleLevel: NagMessageLevel.INFO,
      findingId: 'INFO.1',
    };
    logger.onNonCompliance(data);
    const meta = cfnBucket.node.metadata;
    expect(
      meta.some(
        (entry) =>
          entry.type === 'aws:cdk:info' &&
          (entry.data as string).includes('S3BucketInfo')
      )
    ).toBe(true);
  });

  it('should throw for unknown ruleLevel', () => {
    const data: any = {
      nagPackName: 'TestPack',
      resource: cfnBucket,
      ruleId: 'UnknownRuleLevel',
      ruleOriginalName: 'UnknownRuleLevel',
      ruleInfo: 'This rule level is not recognized',
      ruleExplanation: 'Should throw an error for unknown rule level.',
      ruleLevel: 'UNKNOWN',
      findingId: 'FIND_UNKNOWN',
    };
    expect(() => logger.onNonCompliance(data)).toThrow(
      /Unrecognized message level/
    );
  });
});
