/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
  CfnDistribution,
  CfnStreamingDistribution,
  Distribution,
  GeoRestriction,
  OriginProtocolPolicy,
  OriginSslPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin, S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { CfnWebACL } from 'aws-cdk-lib/aws-wafv2';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import {
  CloudFrontDistributionAccessLogging,
  CloudFrontDistributionGeoRestrictions,
  CloudFrontDistributionHttpsViewerNoOutdatedSSL,
  CloudFrontDistributionNoOutdatedSSL,
  CloudFrontDistributionS3OriginAccessIdentity,
  CloudFrontDistributionWAFIntegration,
} from '../../src/rules/cloudfront';
import { TestPack, TestType, validateStack } from './utils';

const testPack = new TestPack([
  CloudFrontDistributionAccessLogging,
  CloudFrontDistributionGeoRestrictions,
  CloudFrontDistributionHttpsViewerNoOutdatedSSL,
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
          defaultCacheBehavior: {
            targetOriginId: 'bar',
            viewerProtocolPolicy: 'https-only',
          },
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

  describe('CloudFrontDistributionHttpsViewerNoOutdatedSSL: CloudFront distributions use a security policy with minimum TLSv1.1 or TLSv1.2 and appropriate security ciphers for HTTPS viewer connections', () => {
    const ruleId = 'CloudFrontDistributionHttpsViewerNoOutdatedSSL';
    test('Noncompliance 1: No viewer certificate specified', () => {
      new CfnDistribution(stack, 'rDistribution', {
        distributionConfig: {
          defaultCacheBehavior: {
            targetOriginId: 'bar',
            viewerProtocolPolicy: 'https-only',
          },
          enabled: true,
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 2: using the default CloudFront Viewer Certificate', () => {
      new CfnDistribution(stack, 'rDistribution', {
        distributionConfig: {
          defaultCacheBehavior: {
            targetOriginId: 'bar',
            viewerProtocolPolicy: 'https-only',
          },
          enabled: true,
          viewerCertificate: {
            cloudFrontDefaultCertificate: true,
            minimumProtocolVersion: 'TLSv1.2_2019',
            sslSupportMethod: 'sni-only',
          },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 3: using an outdated protocol ', () => {
      new CfnDistribution(stack, 'rDistribution', {
        distributionConfig: {
          defaultCacheBehavior: {
            targetOriginId: 'bar',
            viewerProtocolPolicy: 'https-only',
          },
          enabled: true,
          viewerCertificate: {
            acmCertificateArn:
              'arn:aws:acm:us-east-1:111222333444:certificate/foo',
            minimumProtocolVersion: 'SSLv3',
            sslSupportMethod: 'sni-only',
          },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 3: using a virtual IP for ssl support ', () => {
      new CfnDistribution(stack, 'rDistribution', {
        distributionConfig: {
          defaultCacheBehavior: {
            targetOriginId: 'bar',
            viewerProtocolPolicy: 'https-only',
          },
          enabled: true,
          viewerCertificate: {
            acmCertificateArn:
              'arn:aws:acm:us-east-1:111222333444:certificate/foo',
            minimumProtocolVersion: 'TLSv1.2_2019',
            sslSupportMethod: 'vip',
          },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new Distribution(stack, 'rDistribution', {
        domainNames: ['foo.com'],
        defaultBehavior: {
          origin: new S3Origin(new Bucket(stack, 'rOriginBucket')),
        },
        certificate: new Certificate(stack, 'rCertificate', {
          domainName: 'foo.com',
        }),
      });
      new CfnDistribution(stack, 'rDistribution2', {
        distributionConfig: {
          defaultCacheBehavior: {
            targetOriginId: 'bar',
            viewerProtocolPolicy: 'https-only',
          },
          enabled: true,
          viewerCertificate: {
            acmCertificateArn:
              'arn:aws:acm:us-east-1:111222333444:certificate/foo',
            minimumProtocolVersion: 'TLSv1.2_2019',
            sslSupportMethod: 'sni-only',
          },
        },
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
          defaultCacheBehavior: {
            targetOriginId: 'bar',
            viewerProtocolPolicy: 'https-only',
          },
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
});
