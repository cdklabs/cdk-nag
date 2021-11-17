/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import {
  CfnStage,
  MethodLoggingLevel,
  RestApi,
  CfnClientCertificate,
  LogGroupLogDestination,
  AuthorizationType,
  CfnRequestValidator,
} from '@aws-cdk/aws-apigateway';
import {
  HttpApi,
  CfnStage as CfnV2Stage,
  HttpNoneAuthorizer,
} from '@aws-cdk/aws-apigatewayv2';
import { HttpLambdaAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { Function } from '@aws-cdk/aws-lambda';
import { LogGroup } from '@aws-cdk/aws-logs';
import { CfnWebACLAssociation } from '@aws-cdk/aws-wafv2';
import { Aspects, CfnResource, IConstruct, Stack } from '@aws-cdk/core';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  APIGWAccessLogging,
  APIGWAssociatedWithWAF,
  APIGWAuthorization,
  APIGWCacheEnabledAndEncrypted,
  APIGWExecutionLoggingEnabled,
  APIGWRequestValidation,
  APIGWSSLEnabled,
  APIGWXrayEnabled,
} from '../../src/rules/apigw';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        APIGWAccessLogging,
        APIGWAssociatedWithWAF,
        APIGWAuthorization,
        APIGWCacheEnabledAndEncrypted,
        APIGWExecutionLoggingEnabled,
        APIGWRequestValidation,
        APIGWSSLEnabled,
        APIGWXrayEnabled,
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

describe('Amazon API Gateway', () => {
  test('APIGWAccessLogging: APIs have access logging enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new RestApi(nonCompliant, 'rRestApi').root.addMethod('ANY');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWAccessLogging:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new HttpApi(nonCompliant2, 'rHttpApi').addStage('rStage', {});
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWAccessLogging:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new RestApi(compliant, 'rRestApi', {
      deployOptions: {
        accessLogDestination: new LogGroupLogDestination(
          new LogGroup(compliant, 'rLogGroup')
        ),
      },
    }).root.addMethod('ANY');
    new CfnV2Stage(compliant, 'rStage', {
      accessLogSettings: {
        destinationArn: 'foo',
        format: '$context.requestId',
      },
      apiId: 'bar',
      stageName: 'baz',
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWAccessLogging:'),
        }),
      })
    );
  });

  test('APIGWAssociatedWithWAF: Rest API stages are associated with AWS WAFv2 web ACLs', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    const nonCompliantRestApi = new RestApi(nonCompliant, 'rRestApi', {
      deploy: false,
    });
    nonCompliantRestApi.root.addMethod('ANY');
    new CfnStage(nonCompliant, 'rRestStage', {
      restApiId: nonCompliantRestApi.restApiId,
      stageName: 'foo',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWAssociatedWithWAF:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    const nonCompliant2RestApi = new RestApi(nonCompliant2, 'rRestApi', {
      deploy: false,
    });
    nonCompliant2RestApi.root.addMethod('ANY');
    new CfnStage(nonCompliant2, 'rRestStage', {
      restApiId: nonCompliant2RestApi.restApiId,
      stageName: 'foo',
    });
    new CfnWebACLAssociation(nonCompliant2, 'rWebAClAssoc', {
      webAclArn: 'bar',
      resourceArn: `${nonCompliant2RestApi.restApiId}`,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWAssociatedWithWAF:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    const nonCompliant3RestApi = new RestApi(nonCompliant3, 'rRestApi', {
      deploy: false,
    });
    nonCompliant3RestApi.root.addMethod('ANY');
    const nonCompliant3Stage = new CfnStage(nonCompliant3, 'rRestStage', {
      restApiId: nonCompliant3RestApi.restApiId,
      stageName: 'foo',
    });
    new CfnWebACLAssociation(nonCompliant3, 'rWebAClAssoc', {
      webAclArn: 'bar',
      resourceArn: `${nonCompliant3Stage.restApiId}/baz`,
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWAssociatedWithWAF:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const compliantRestApi = new RestApi(compliant, 'rRestApi', {
      deploy: false,
    });
    compliantRestApi.root.addMethod('ANY');
    new CfnStage(compliant, 'rRestStage', {
      restApiId: compliantRestApi.restApiId,
      stageName: 'foo',
    });
    new CfnWebACLAssociation(compliant, 'rWebAClAssoc', {
      webAclArn: 'bar',
      resourceArn: `${compliantRestApi.restApiId}/stage/foo`,
    });
    const compliantRestApi2 = new RestApi(compliant, 'rRestApi2', {
      deploy: false,
    });
    compliantRestApi2.root.addMethod('ANY');
    const compliantStage2 = new CfnStage(compliant, 'rRestStage2', {
      restApiId: compliantRestApi2.restApiId,
      stageName: 'foo',
    });
    new CfnWebACLAssociation(compliant, 'rWebAClAssoc2', {
      webAclArn: 'bar',
      resourceArn: `${compliantRestApi2.restApiId}/stage/${compliantStage2.stageName}`,
    });
    const compliantRestApi3 = new RestApi(compliant, 'rRestApi3', {
      deploy: false,
    });
    compliantRestApi3.root.addMethod('ANY');
    new CfnStage(compliant, 'rRestStage3', {
      restApiId: 'baz',
      stageName: 'foo',
    });
    new CfnWebACLAssociation(compliant, 'rWebAClAssoc3', {
      webAclArn: 'bar',
      resourceArn: `baz/stage/${compliantStage2.ref}`,
    });
    const compliantRestApi4 = new RestApi(compliant, 'rRestApi4', {
      deploy: false,
    });
    compliantRestApi4.root.addMethod('ANY');
    const compliantStage4 = new CfnStage(compliant, 'rRestStage4', {
      restApiId: 'baz',
      stageName: 'foo',
    });
    new CfnWebACLAssociation(compliant, 'rWebAClAssoc4', {
      webAclArn: 'bar',
      resourceArn: `${compliantStage4.restApiId}/stage/foo`,
    });
    const messages4 = SynthUtils.synthesize(compliant).messages;
    expect(messages4).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWAssociatedWithWAF:'),
        }),
      })
    );
  });

  test('APIGWAuthorization: APIs implement authorization', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new RestApi(nonCompliant, 'rRestApi').root.addMethod('ANY');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWAuthorization:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new HttpApi(nonCompliant2, 'rHttpApi', {
      defaultAuthorizer: new HttpNoneAuthorizer(),
    }).addRoutes({
      path: '/foo',
      integration: new LambdaProxyIntegration({
        handler: Function.fromFunctionArn(nonCompliant2, 'rLambdaProxy', 'bar'),
      }),
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWAuthorization:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new RestApi(compliant, 'rRestApi', {
      defaultMethodOptions: { authorizationType: AuthorizationType.CUSTOM },
    }).root.addMethod('ANY');
    new HttpApi(compliant, 'rHttpApi', {
      defaultAuthorizer: new HttpLambdaAuthorizer({
        authorizerName: 'foo',
        handler: Function.fromFunctionArn(
          compliant,
          'rLambdaAuthorizer',
          'bar'
        ),
      }),
    }).addRoutes({
      path: '/foo',
      integration: new LambdaProxyIntegration({
        handler: Function.fromFunctionArn(compliant, 'rLambdaProxy', 'bar'),
      }),
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWAuthorization:'),
        }),
      })
    );
  });

  test('APIGWCacheEnabledAndEncrypted: API Gateway stages have caching enabled and encrypted for all methods', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new RestApi(nonCompliant, 'rRestApi').root.addMethod('ANY');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWCacheEnabledAndEncrypted:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new RestApi(nonCompliant2, 'rRestApi', {
      deployOptions: { cachingEnabled: false },
    }).root.addMethod('ANY');
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWCacheEnabledAndEncrypted:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    new RestApi(nonCompliant3, 'rRestApi', {
      deployOptions: { cacheDataEncrypted: false },
    }).root.addMethod('ANY');
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWCacheEnabledAndEncrypted:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new RestApi(compliant, 'rRestApi', {
      deployOptions: { cacheDataEncrypted: true, cachingEnabled: true },
    }).root.addMethod('ANY');
    const messages4 = SynthUtils.synthesize(compliant).messages;
    expect(messages4).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWCacheEnabledAndEncrypted:'),
        }),
      })
    );
  });

  test('APIGWExecutionLoggingEnabled: API Gateway stages have logging enabled for all methods', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new RestApi(nonCompliant, 'rRestApi').root.addMethod('ANY');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWExecutionLoggingEnabled:'),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new RestApi(nonCompliant2, 'rRestApi', {
      deployOptions: { loggingLevel: MethodLoggingLevel.OFF },
    }).root.addMethod('ANY');
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWExecutionLoggingEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new RestApi(compliant, 'rRestApi', {
      deployOptions: { loggingLevel: MethodLoggingLevel.ERROR },
    }).root.addMethod('ANY');
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWExecutionLoggingEnabled:'),
        }),
      })
    );
  });

  test('APIGWRequestValidation: Rest APIs have request validation enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new RestApi(nonCompliant, 'rRestApi').root.addMethod('ANY');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWRequestValidation:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new RestApi(nonCompliant2, 'rRestApi').root.addMethod('ANY');
    new CfnRequestValidator(nonCompliant2, 'rRequestVAlidator', {
      restApiId: 'foo',
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWRequestValidation:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const compliantRestApi = new RestApi(compliant, 'rRestApi');
    compliantRestApi.addRequestValidator('rRequestValidator', {});
    compliantRestApi.root.addMethod('ANY');
    const compliantRestApi2 = new RestApi(compliant, 'rRestApi2');
    compliantRestApi2.root.addMethod('ANY');
    new CfnRequestValidator(compliant, 'rRequestValidator2', {
      restApiId: compliantRestApi2.restApiId,
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWRequestValidation:'),
        }),
      })
    );
  });

  test('APIGWSSLEnabled: API Gateway REST API stages are configured with SSL certificates', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new RestApi(nonCompliant, 'rRestApi').root.addMethod('ANY');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWSSLEnabled:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new RestApi(compliant, 'rRestApi', {
      deployOptions: {
        clientCertificateId: new CfnClientCertificate(
          compliant,
          'rClientCertificate'
        ).attrClientCertificateId,
      },
    }).root.addMethod('ANY');
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWSSLEnabled:'),
        }),
      })
    );
  });

  test('APIGWXrayEnabled: API Gateway REST API stages have X-Ray tracing enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new RestApi(nonCompliant, 'rRestApi').root.addMethod('ANY');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWXrayEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new RestApi(compliant, 'rRestApi', {
      deployOptions: { tracingEnabled: true },
    }).root.addMethod('ANY');
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('APIGWXrayEnabled:'),
        }),
      })
    );
  });
});
