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
import {
  HttpOrigin,
  S3Origin,
  S3BucketOrigin,
} from 'aws-cdk-lib/aws-cloudfront-origins';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { CfnWebACL } from 'aws-cdk-lib/aws-wafv2';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import { TestPack, TestType, validateStack } from './utils';
import {
  CloudFrontDistributionAccessLogging,
  CloudFrontDistributionGeoRestrictions,
  CloudFrontDistributionHttpsViewerNoOutdatedSSL,
  CloudFrontDistributionNoOutdatedSSL,
  CloudFrontDistributionS3OriginAccessIdentity,
  CloudFrontDistributionWAFIntegration,
  CloudFrontDistributionS3OriginAccessControl,
} from '../../src/rules/cloudfront';

const testPack = new TestPack([
  CloudFrontDistributionAccessLogging,
  CloudFrontDistributionGeoRestrictions,
  CloudFrontDistributionHttpsViewerNoOutdatedSSL,
  CloudFrontDistributionNoOutdatedSSL,
  CloudFrontDistributionS3OriginAccessIdentity,
  CloudFrontDistributionWAFIntegration,
  CloudFrontDistributionS3OriginAccessControl,
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
      new Distribution(stack, 'Distribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(stack, 'OriginBucket')),
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnStreamingDistribution(stack, 'StreamingDistribution', {
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
      const logsBucket = new Bucket(stack, 'LoggingBucket');
      new Distribution(stack, 'Distribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(stack, 'OriginBucket')),
        },
        logBucket: logsBucket,
      });

      new CfnStreamingDistribution(stack, 'StreamingDistribution', {
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
      new Distribution(stack, 'Distribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(stack, 'OriginBucket')),
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 2', () => {
      new CfnDistribution(stack, 'Distribution', {
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
      new Distribution(stack, 'Distribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(stack, 'OriginBucket')),
        },
        geoRestriction: GeoRestriction.allowlist('US'),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('CloudFrontDistributionHttpsViewerNoOutdatedSSL: CloudFront distributions use a security policy with minimum TLSv1.1 or TLSv1.2 and appropriate security ciphers for HTTPS viewer connections', () => {
    const ruleId = 'CloudFrontDistributionHttpsViewerNoOutdatedSSL';
    test('Noncompliance 1: No viewer certificate specified', () => {
      new CfnDistribution(stack, 'Distribution', {
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
      new CfnDistribution(stack, 'Distribution', {
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
      new CfnDistribution(stack, 'Distribution', {
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
      new CfnDistribution(stack, 'Distribution', {
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
      new Distribution(stack, 'Distribution', {
        domainNames: ['foo.com'],
        defaultBehavior: {
          origin: new S3Origin(new Bucket(stack, 'OriginBucket')),
        },
        certificate: new Certificate(stack, 'Certificate', {
          domainName: 'foo.com',
        }),
      });
      new CfnDistribution(stack, 'Distribution2', {
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
      new Distribution(stack, 'Distribution', {
        defaultBehavior: {
          origin: new HttpOrigin('foo.bar.com', {
            protocolPolicy: OriginProtocolPolicy.MATCH_VIEWER,
          }),
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Distribution(stack, 'Distribution', {
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
      const logsBucket = new Bucket(stack, 'LoggingBucket');
      new Distribution(stack, 'Distribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(stack, 'OriginBucket')),
        },
        logBucket: logsBucket,
      });
      new Distribution(stack, 'Distribution2', {
        defaultBehavior: {
          origin: new HttpOrigin('foo.bar.com', {
            originSslProtocols: [OriginSslPolicy.TLS_V1_2],
          }),
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('CloudFrontDistributionS3OriginAccessIdentity: CloudFront Streaming distributions use an origin access identity for S3 origins', () => {
    const ruleId = 'CloudFrontDistributionS3OriginAccessIdentity';
    test('Noncompliance', () => {
      new CfnStreamingDistribution(stack, 'StreamingDistribution', {
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
      new CfnDistribution(stack, 'Distribution1', {
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
      new Distribution(stack, 'Distribution2', {
        defaultBehavior: {
          origin: new HttpOrigin('foo.s3-website.amazonaws.com'),
        },
      });
      new CfnStreamingDistribution(stack, 'StreamingDistribution', {
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
      new Distribution(stack, 'Distribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(stack, 'OriginBucket')),
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new Distribution(stack, 'Distribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(stack, 'OriginBucket')),
        },
        webAclId: new CfnWebACL(stack, 'WebAcl', {
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

  describe('CloudFrontDistributionS3OriginAccessControl: CloudFront distributions use an origin access control for S3 origins', () => {
    const ruleId = 'CloudFrontDistributionS3OriginAccessControl';
    test('Noncompliance 1', () => {
      new Distribution(stack, 'Distribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(stack, 'OriginBucket')),
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new Distribution(stack, 'Distribution', {
        defaultBehavior: {
          origin: S3BucketOrigin.withOriginAccessIdentity(
            new Bucket(stack, 'OriginBucket')
          ),
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Distribution(stack, 'Distribution', {
        defaultBehavior: {
          origin: S3BucketOrigin.withOriginAccessControl(
            new Bucket(stack, 'OriginBucket')
          ),
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});
