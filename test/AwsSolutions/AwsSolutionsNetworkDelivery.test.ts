/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import {
  AuthorizationType,
  LogGroupLogDestination,
  MethodLoggingLevel,
  RestApi,
} from '@aws-cdk/aws-apigateway';
import {
  HttpApi,
  CfnStage as CfnV2Stage,
  HttpNoneAuthorizer,
} from '@aws-cdk/aws-apigatewayv2';
import { HttpLambdaAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import {
  CfnDistribution,
  Distribution,
  CfnStreamingDistribution,
  GeoRestriction,
  OriginSslPolicy,
  OriginProtocolPolicy,
} from '@aws-cdk/aws-cloudfront';
import { S3Origin, HttpOrigin } from '@aws-cdk/aws-cloudfront-origins';
import { NetworkAcl, Vpc } from '@aws-cdk/aws-ec2';
import { Function } from '@aws-cdk/aws-lambda';
import { LogGroup } from '@aws-cdk/aws-logs';
import { Bucket } from '@aws-cdk/aws-s3';
import { CfnWebACL } from '@aws-cdk/aws-wafv2';
import { Aspects, Stack } from '@aws-cdk/core';
import { AwsSolutionsChecks } from '../../src';

describe('AWS Solutions Network and Delivery Checks', () => {
  describe('Amazon Virtual Private Cloud (VPC)', () => {
    test('awsSolutionsVpc3: VPCs do not implement network ACLs', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new NetworkAcl(positive, 'rNacl', { vpc: new Vpc(positive, 'rVpc') });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-VPC3:'),
          }),
        }),
      );
      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new NetworkAcl(positive2, 'rNacl', { vpc: new Vpc(positive2, 'rVpc') });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-VPC3:'),
          }),
        }),
      );
      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Vpc(negative, 'rVpc');
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-VPC3:'),
          }),
        }),
      );
    });
  });

  describe('Amazon CloudFront', () => {
    test('awsSolutionsCfr1: CloudFront distributions may require Geo restrictions', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Distribution(positive, 'rDistribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(positive, 'rOriginBucket')),
        },
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-CFR1:'),
          }),
        }),
      );
      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new CfnDistribution(positive2, 'rDistribution', {
        distributionConfig: {
          restrictions: { geoRestriction: { restrictionType: 'none' } },
          enabled: false,
        },
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-CFR1:'),
          }),
        }),
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Distribution(negative, 'rDistribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(negative, 'rOriginBucket')),
        },
        geoRestriction: GeoRestriction.allowlist('US'),
      });
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-CFR1:'),
          }),
        }),
      );
    });
    test('awsSolutionsCfr2: CloudFront distributions may require integration with AWS WAF', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Distribution(positive, 'rDistribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(positive, 'rOriginBucket')),
        },
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-CFR2:'),
          }),
        }),
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Distribution(negative, 'rDistribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(negative, 'rOriginBucket')),
        },
        webAclId: new CfnWebACL(negative, 'rWebAcl', {
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
      const messages2 = SynthUtils.synthesize(negative).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-CFR2:'),
          }),
        }),
      );
    });
    test('awsSolutionsCfr3: CloudFront distributions have access logging enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Distribution(positive, 'rDistribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(positive, 'rOriginBucket')),
        },
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-CFR3:'),
          }),
        }),
      );

      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new CfnStreamingDistribution(positive2, 'rStreamingDistribution', {
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
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-CFR3:'),
          }),
        }),
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      const logsBucket = new Bucket(negative, 'rLoggingBucket');
      new Distribution(negative, 'rDistribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(negative, 'rOriginBucket')),
        },
        logBucket: logsBucket,
      });

      new CfnStreamingDistribution(negative, 'rStreamingDistribution', {
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
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-CFR3:'),
          }),
        }),
      );
    });
    test('awsSolutionsCfr5: CloudFront distributions do not use SSLv3 or TLSv1 for communication to the origin', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new Distribution(positive, 'rDistribution', {
        defaultBehavior: {
          origin: new HttpOrigin('foo.bar.com', {
            protocolPolicy: OriginProtocolPolicy.MATCH_VIEWER,
          }),
        },
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-CFR5:'),
          }),
        }),
      );
      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new Distribution(positive2, 'rDistribution', {
        defaultBehavior: {
          origin: new HttpOrigin('foo.bar.com', {
            originSslProtocols: [
              OriginSslPolicy.TLS_V1,
              OriginSslPolicy.TLS_V1_1,
            ],
          }),
        },
      });
      const messages2 = SynthUtils.synthesize(positive).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-CFR5:'),
          }),
        }),
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      const logsBucket = new Bucket(negative, 'rLoggingBucket');
      new Distribution(negative, 'rDistribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(negative, 'rOriginBucket')),
        },
        logBucket: logsBucket,
      });
      new Distribution(negative, 'rDistribution2', {
        defaultBehavior: {
          origin: new HttpOrigin('foo.bar.com', {
            originSslProtocols: [OriginSslPolicy.TLS_V1_2],
          }),
        },
      });
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-CFR5:'),
          }),
        }),
      );
    });
    test('awsSolutionsCfr6: CloudFront distributions use an origin access identity for S3 origins', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new CfnDistribution(positive, 'rDistribution', {
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

      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-CFR6:'),
          }),
        }),
      );

      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new Distribution(positive2, 'rDistribution', {
        defaultBehavior: {
          origin: new HttpOrigin('foo.s3-website.amazonaws.com'),
        },
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-CFR6:'),
          }),
        }),
      );

      const positive3 = new Stack();
      Aspects.of(positive3).add(new AwsSolutionsChecks());
      new CfnStreamingDistribution(positive3, 'rStreamingDistribution', {
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
      const messages3 = SynthUtils.synthesize(positive3).messages;
      expect(messages3).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-CFR6:'),
          }),
        }),
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new Distribution(negative, 'rDistribution', {
        defaultBehavior: {
          origin: new S3Origin(new Bucket(negative, 'rOriginBucket')),
        },
      });

      new CfnStreamingDistribution(negative, 'rStreamingDistribution', {
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
      const messages4 = SynthUtils.synthesize(negative).messages;
      expect(messages4).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-CFR6:'),
          }),
        }),
      );
    });
  });

  describe('Amazon API Gateway', () => {
    test('awsSolutionsApig1: APIs have access logging enabled', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new RestApi(positive, 'rRestApi').root.addMethod('ANY');
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-APIG1:'),
          }),
        }),
      );

      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new HttpApi(positive2, 'rHttpApi').addStage('rStage', {});
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-APIG1:'),
          }),
        }),
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new RestApi(negative, 'rRestApi', {
        deployOptions: {
          accessLogDestination: new LogGroupLogDestination(
            new LogGroup(negative, 'rLogGroup'),
          ),
        },
      }).root.addMethod('ANY');
      new CfnV2Stage(negative, 'rStage', {
        accessLogSettings: {
          destinationArn: 'foo',
          format: '$context.requestId',
        },
        apiId: 'bar',
        stageName: 'baz',
      });
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-APIG1:'),
          }),
        }),
      );
    });
    test('awsSolutionsApig4: APIs implement authorization', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new RestApi(positive, 'rRestApi').root.addMethod('ANY');
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-APIG4:'),
          }),
        }),
      );

      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new HttpApi(positive2, 'rHttpApi', {
        defaultAuthorizer: new HttpNoneAuthorizer(),
      }).addRoutes({
        path: '/foo',
        integration: new LambdaProxyIntegration({
          handler: Function.fromFunctionArn(positive2, 'rLambdaProxy', 'bar'),
        }),
      });
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-APIG4:'),
          }),
        }),
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new RestApi(negative, 'rRestApi', {
        defaultMethodOptions: { authorizationType: AuthorizationType.CUSTOM },
      }).root.addMethod('ANY');
      new HttpApi(negative, 'rHttpApi', {
        defaultAuthorizer: new HttpLambdaAuthorizer({
          authorizerName: 'foo',
          handler: Function.fromFunctionArn(
            negative,
            'rLambdaAuthorizer',
            'bar',
          ),
        }),
      }).addRoutes({
        path: '/foo',
        integration: new LambdaProxyIntegration({
          handler: Function.fromFunctionArn(negative, 'rLambdaProxy', 'bar'),
        }),
      });
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-APIG4:'),
          }),
        }),
      );
    });
    test('awsSolutionsApig6: REST API Stages have CloudWatch logging enabled for all methods', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new AwsSolutionsChecks());
      new RestApi(positive, 'rRestApi').root.addMethod('ANY');
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-APIG6:'),
          }),
        }),
      );
      const positive2 = new Stack();
      Aspects.of(positive2).add(new AwsSolutionsChecks());
      new RestApi(positive2, 'rRestApi', {
        deployOptions: { loggingLevel: MethodLoggingLevel.OFF },
      }).root.addMethod('ANY');
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-APIG6:'),
          }),
        }),
      );

      const negative = new Stack();
      Aspects.of(negative).add(new AwsSolutionsChecks());
      new RestApi(negative, 'rRestApi', {
        deployOptions: { loggingLevel: MethodLoggingLevel.ERROR },
      }).root.addMethod('ANY');
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('AwsSolutions-APIG6:'),
          }),
        }),
      );
    });
  });
});
