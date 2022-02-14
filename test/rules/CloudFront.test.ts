/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import {
  Distribution,
  CfnDistribution,
  GeoRestriction,
  CfnStreamingDistribution,
  OriginProtocolPolicy,
  OriginSslPolicy,
} from '@aws-cdk/aws-cloudfront';
import { S3Origin, HttpOrigin } from '@aws-cdk/aws-cloudfront-origins';
import { Bucket } from '@aws-cdk/aws-s3';
import { CfnWebACL } from '@aws-cdk/aws-wafv2';
import { Aspects, Stack } from '@aws-cdk/core';
import {
  CloudFrontDistributionAccessLogging,
  CloudFrontDistributionGeoRestrictions,
  CloudFrontDistributionNoOutdatedSSL,
  CloudFrontDistributionS3OriginAccessIdentity,
  CloudFrontDistributionWAFIntegration,
} from '../../src/rules/cloudfront';
import { validateStack, TestType, TestPack } from './utils';

const testPack = new TestPack([
  CloudFrontDistributionAccessLogging,
  CloudFrontDistributionGeoRestrictions,
  CloudFrontDistributionNoOutdatedSSL,
  CloudFrontDistributionS3OriginAccessIdentity,
  CloudFrontDistributionWAFIntegration,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon CloudFront', () => {
  describe('CloudFrontDistributionGeoRestrictions: CloudFront distributions may require Geo restrictions', () => {
    const ruleId = 'CloudFrontDistributionGeoRestrictions';
    test('Noncompliance 1', () => {
      new Distribution(stack, 'rDistribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(stack, 'rOriginBucket')),
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 2', () => {
      new CfnDistribution(stack, 'rDistribution', {
        distributionConfig: {
          restrictions: { geoRestriction: { restrictionType: 'none' } },
          enabled: false,
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new Distribution(stack, 'rDistribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(stack, 'rOriginBucket')),
        },
        geoRestriction: GeoRestriction.allowlist('US'),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('CloudFrontDistributionWAFIntegration: CloudFront distributions may require integration with AWS WAF', () => {
    const ruleId = 'CloudFrontDistributionWAFIntegration';
    test('Noncompliance ', () => {
      new Distribution(stack, 'rDistribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(stack, 'rOriginBucket')),
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new Distribution(stack, 'rDistribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(stack, 'rOriginBucket')),
        },
        webAclId: new CfnWebACL(stack, 'rWebAcl', {
          defaultAction: {
            allow: {
              customRequestHandling: {
                insertHeaders: [{ name: 'foo', value: 'bar' }],
              },
            },
          },
          scope: 'CLOUDFRONT',
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'foo',
            sampledRequestsEnabled: true,
          },
        }).attrId,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('CloudFrontDistributionAccessLogging: CloudFront distributions have access logging enabled', () => {
    const ruleId = 'CloudFrontDistributionAccessLogging';
    test('Noncompliance 1', () => {
      new Distribution(stack, 'rDistribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(stack, 'rOriginBucket')),
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnStreamingDistribution(stack, 'rStreamingDistribution', {
        streamingDistributionConfig: {
          comment: 'foo',
          enabled: true,
          s3Origin: {
            domainName: 'foo.s3.us-east-1.amazonaws.com',
            originAccessIdentity:
              'origin-access-identity/cloudfront/E127EXAMPLE51Z',
          },
          trustedSigners: {
            awsAccountNumbers: ['1111222233334444'],
            enabled: true,
          },
        },
        tags: [{ key: 'foo', value: 'bar' }],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const logsBucket = new Bucket(stack, 'rLoggingBucket');
      new Distribution(stack, 'rDistribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(stack, 'rOriginBucket')),
        },
        logBucket: logsBucket,
      });

      new CfnStreamingDistribution(stack, 'rStreamingDistribution', {
        streamingDistributionConfig: {
          comment: 'foo',
          enabled: true,
          s3Origin: {
            domainName: 'foo.s3.us-east-1.amazonaws.com',
            originAccessIdentity:
              'origin-access-identity/cloudfront/E127EXAMPLE51Z',
          },
          trustedSigners: {
            awsAccountNumbers: ['1111222233334444'],
            enabled: true,
          },
          logging: {
            bucket: logsBucket.bucketName,
            prefix: 'foo',
            enabled: true,
          },
        },
        tags: [{ key: 'foo', value: 'bar' }],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('CloudFrontDistributionNoOutdatedSSL: CloudFront distributions do not use SSLv3 or TLSv1 for communication to the origin', () => {
    const ruleId = 'CloudFrontDistributionNoOutdatedSSL';
    test('Noncompliance 1', () => {
      new Distribution(stack, 'rDistribution', {
        defaultBehavior: {
          origin: new HttpOrigin('foo.bar.com', {
            protocolPolicy: OriginProtocolPolicy.MATCH_VIEWER,
          }),
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Distribution(stack, 'rDistribution', {
        defaultBehavior: {
          origin: new HttpOrigin('foo.bar.com', {
            originSslProtocols: [
              OriginSslPolicy.TLS_V1,
              OriginSslPolicy.TLS_V1_1,
            ],
          }),
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const logsBucket = new Bucket(stack, 'rLoggingBucket');
      new Distribution(stack, 'rDistribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(stack, 'rOriginBucket')),
        },
        logBucket: logsBucket,
      });
      new Distribution(stack, 'rDistribution2', {
        defaultBehavior: {
          origin: new HttpOrigin('foo.bar.com', {
            originSslProtocols: [OriginSslPolicy.TLS_V1_2],
          }),
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('CloudFrontDistributionS3OriginAccessIdentity: CloudFront distributions use an origin access identity for S3 origins', () => {
    const ruleId = 'CloudFrontDistributionS3OriginAccessIdentity';
    test('Noncompliance 1', () => {
      new CfnDistribution(stack, 'rDistribution', {
        distributionConfig: {
          comment: 'foo',
          enabled: true,
          origins: [
            {
              domainName: 'foo.s3.us-east-1.amazonaws.com',
              id: 'lorem ipsum',
              s3OriginConfig: {
                originAccessIdentity: '',
              },
            },
          ],
        },
        tags: [{ key: 'foo', value: 'bar' }],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Distribution(stack, 'rDistribution', {
        defaultBehavior: {
          origin: new HttpOrigin('foo.s3-website.amazonaws.com'),
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new CfnStreamingDistribution(stack, 'rStreamingDistribution', {
        streamingDistributionConfig: {
          comment: 'foo',
          enabled: true,
          s3Origin: {
            domainName: 'foo.s3.us-east-1.amazonaws.com',
            originAccessIdentity: '',
          },
          trustedSigners: {
            awsAccountNumbers: ['1111222233334444'],
            enabled: true,
          },
        },
        tags: [{ key: 'foo', value: 'bar' }],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Distribution(stack, 'rDistribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(stack, 'rOriginBucket')),
        },
      });

      new CfnStreamingDistribution(stack, 'rStreamingDistribution', {
        streamingDistributionConfig: {
          comment: 'foo',
          enabled: true,
          s3Origin: {
            domainName: 'foo.s3.us-east-1.amazonaws.com',
            originAccessIdentity:
              'origin-access-identity/cloudfront/E127EXAMPLE51Z',
          },
          trustedSigners: {
            awsAccountNumbers: ['1111222233334444'],
            enabled: true,
          },
        },
        tags: [{ key: 'foo', value: 'bar' }],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});
