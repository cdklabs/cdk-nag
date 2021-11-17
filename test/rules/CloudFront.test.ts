/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
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
import { Aspects, CfnResource, IConstruct, Stack } from '@aws-cdk/core';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  CloudFrontDistributionAccessLogging,
  CloudFrontDistributionGeoRestrictions,
  CloudFrontDistributionNoOutdatedSSL,
  CloudFrontDistributionS3OriginAccessIdentity,
  CloudFrontDistributionWAFIntegration,
} from '../../src/rules/cloudfront';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        CloudFrontDistributionAccessLogging,
        CloudFrontDistributionGeoRestrictions,
        CloudFrontDistributionNoOutdatedSSL,
        CloudFrontDistributionS3OriginAccessIdentity,
        CloudFrontDistributionWAFIntegration,
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

describe('Amazon CloudFront', () => {
  test('CloudFrontDistributionGeoRestrictions: CloudFront distributions may require Geo restrictions', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Distribution(nonCompliant, 'rDistribution', {
      defaultBehavior: {
        origin: new S3Origin(new Bucket(nonCompliant, 'rOriginBucket')),
      },
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'CloudFrontDistributionGeoRestrictions:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnDistribution(nonCompliant2, 'rDistribution', {
      distributionConfig: {
        restrictions: { geoRestriction: { restrictionType: 'none' } },
        enabled: false,
      },
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'CloudFrontDistributionGeoRestrictions:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Distribution(compliant, 'rDistribution', {
      defaultBehavior: {
        origin: new S3Origin(new Bucket(compliant, 'rOriginBucket')),
      },
      geoRestriction: GeoRestriction.allowlist('US'),
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'CloudFrontDistributionGeoRestrictions:'
          ),
        }),
      })
    );
  });

  test('CloudFrontDistributionWAFIntegration: CloudFront distributions may require integration with AWS WAF', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Distribution(nonCompliant, 'rDistribution', {
      defaultBehavior: {
        origin: new S3Origin(new Bucket(nonCompliant, 'rOriginBucket')),
      },
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'CloudFrontDistributionWAFIntegration:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Distribution(compliant, 'rDistribution', {
      defaultBehavior: {
        origin: new S3Origin(new Bucket(compliant, 'rOriginBucket')),
      },
      webAclId: new CfnWebACL(compliant, 'rWebAcl', {
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
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'CloudFrontDistributionWAFIntegration:'
          ),
        }),
      })
    );
  });

  test('CloudFrontDistributionAccessLogging: CloudFront distributions have access logging enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Distribution(nonCompliant, 'rDistribution', {
      defaultBehavior: {
        origin: new S3Origin(new Bucket(nonCompliant, 'rOriginBucket')),
      },
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CloudFrontDistributionAccessLogging:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnStreamingDistribution(nonCompliant2, 'rStreamingDistribution', {
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
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CloudFrontDistributionAccessLogging:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const logsBucket = new Bucket(compliant, 'rLoggingBucket');
    new Distribution(compliant, 'rDistribution', {
      defaultBehavior: {
        origin: new S3Origin(new Bucket(compliant, 'rOriginBucket')),
      },
      logBucket: logsBucket,
    });

    new CfnStreamingDistribution(compliant, 'rStreamingDistribution', {
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
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CloudFrontDistributionAccessLogging:'),
        }),
      })
    );
  });

  test('CloudFrontDistributionNoOutdatedSSL: CloudFront distributions do not use SSLv3 or TLSv1 for communication to the origin', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Distribution(nonCompliant, 'rDistribution', {
      defaultBehavior: {
        origin: new HttpOrigin('foo.bar.com', {
          protocolPolicy: OriginProtocolPolicy.MATCH_VIEWER,
        }),
      },
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CloudFrontDistributionNoOutdatedSSL:'),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new Distribution(nonCompliant2, 'rDistribution', {
      defaultBehavior: {
        origin: new HttpOrigin('foo.bar.com', {
          originSslProtocols: [
            OriginSslPolicy.TLS_V1,
            OriginSslPolicy.TLS_V1_1,
          ],
        }),
      },
    });
    const messages2 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CloudFrontDistributionNoOutdatedSSL:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const logsBucket = new Bucket(compliant, 'rLoggingBucket');
    new Distribution(compliant, 'rDistribution', {
      defaultBehavior: {
        origin: new S3Origin(new Bucket(compliant, 'rOriginBucket')),
      },
      logBucket: logsBucket,
    });
    new Distribution(compliant, 'rDistribution2', {
      defaultBehavior: {
        origin: new HttpOrigin('foo.bar.com', {
          originSslProtocols: [OriginSslPolicy.TLS_V1_2],
        }),
      },
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CloudFrontDistributionNoOutdatedSSL:'),
        }),
      })
    );
  });

  test('CloudFrontDistributionS3OriginAccessIdentity: CloudFront distributions use an origin access identity for S3 origins', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnDistribution(nonCompliant, 'rDistribution', {
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

    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'CloudFrontDistributionS3OriginAccessIdentity:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new Distribution(nonCompliant2, 'rDistribution', {
      defaultBehavior: {
        origin: new HttpOrigin('foo.s3-website.amazonaws.com'),
      },
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'CloudFrontDistributionS3OriginAccessIdentity:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    new CfnStreamingDistribution(nonCompliant3, 'rStreamingDistribution', {
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
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'CloudFrontDistributionS3OriginAccessIdentity:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Distribution(compliant, 'rDistribution', {
      defaultBehavior: {
        origin: new S3Origin(new Bucket(compliant, 'rOriginBucket')),
      },
    });

    new CfnStreamingDistribution(compliant, 'rStreamingDistribution', {
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
    const messages4 = SynthUtils.synthesize(compliant).messages;
    expect(messages4).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'CloudFrontDistributionS3OriginAccessIdentity:'
          ),
        }),
      })
    );
  });
});
