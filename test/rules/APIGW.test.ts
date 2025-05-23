/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import {
  AuthorizationType,
  CfnClientCertificate,
  CfnRequestValidator,
  CfnRestApi,
  CfnStage,
  Cors,
  MethodLoggingLevel,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { CfnRoute, CfnStage as CfnV2Stage } from 'aws-cdk-lib/aws-apigatewayv2';
import { CfnWebACLAssociation } from 'aws-cdk-lib/aws-wafv2';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import { TestPack, TestType, validateStack } from './utils';
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

const testPack = new TestPack([
  APIGWAccessLogging,
  APIGWAssociatedWithWAF,
  APIGWAuthorization,
  APIGWCacheEnabledAndEncrypted,
  APIGWExecutionLoggingEnabled,
  APIGWRequestValidation,
  APIGWSSLEnabled,
  APIGWXrayEnabled,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon API Gateway', () => {
  describe('APIGWAccessLogging: APIs have access logging enabled', () => {
    const ruleId = 'APIGWAccessLogging';
    test('Noncompliance 1', () => {
      new CfnStage(stack, 'rRestApiDeploymentStage', {
        restApiId: 'foo',
        deploymentId: 'bar',
        stageName: 'prod',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnV2Stage(stack, 'rHttpApiDefaultStage', {
        apiId: 'foo',
        stageName: '$default',
        autoDeploy: true,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance: CfnStage undefined settings', () => {
      new CfnStage(stack, 'restApiDeploymentStage', {
        restApiId: 'foo',
        accessLogSetting: {
          destinationArn: 'bar',
        },
        deploymentId: 'baz',
        stageName: 'prod',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance: CfnV2Stage undefined settings', () => {
      new CfnV2Stage(stack, 'stage', {
        accessLogSettings: {
          destinationArn: 'foo',
        },
        apiId: 'bar',
        stageName: 'baz',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnStage(stack, 'rRestApiDeploymentStage', {
        restApiId: 'foo',
        accessLogSetting: {
          destinationArn: 'bar',
          format:
            '$context.identity.sourceIp $context.identity.caller $context.identity.user [$context.requestTime] "$context.httpMethod $context.resourcePath $context.protocol" $context.status $context.responseLength $context.requestId',
        },
        deploymentId: 'baz',
        stageName: 'prod',
      });
      new CfnV2Stage(stack, 'rStage', {
        accessLogSettings: {
          destinationArn: 'foo',
          format: '$context.requestId',
        },
        apiId: 'bar',
        stageName: 'baz',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('APIGWAssociatedWithWAF: Rest API stages are associated with AWS WAFv2 web ACLs', () => {
    const ruleId = 'APIGWAssociatedWithWAF';
    test('Noncompliance 1', () => {
      new CfnStage(stack, 'rRestStage', {
        restApiId: 'foo',
        stageName: 'bar',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      const nonCompliance2RestApi = new CfnRestApi(stack, 'rRestApi', {
        name: 'rRestApi',
      });
      new CfnStage(stack, 'rRestStage', {
        restApiId: nonCompliance2RestApi.ref,
        stageName: 'foo',
      });
      new CfnWebACLAssociation(stack, 'rWebAClAssoc', {
        webAclArn: 'bar',
        resourceArn: nonCompliance2RestApi.ref,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      const nonCompliance3RestApi = new CfnRestApi(stack, 'rRestApi', {
        name: 'rRestApi',
      });
      const nonCompliance3Stage = new CfnStage(stack, 'rRestStage', {
        restApiId: nonCompliance3RestApi.ref,
        stageName: 'foo',
      });
      new CfnWebACLAssociation(stack, 'rWebAClAssoc', {
        webAclArn: 'bar',
        resourceArn: nonCompliance3RestApi.ref,
      });
      new CfnWebACLAssociation(stack, 'rWebAClAssoc2', {
        webAclArn: 'bar',
        resourceArn: `${nonCompliance3Stage.ref}/baz`,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const compliantRestApi = new RestApi(stack, 'rRestApi', {
        deploy: false,
      });
      compliantRestApi.root.addMethod('ANY');
      new CfnStage(stack, 'rRestStage', {
        restApiId: compliantRestApi.restApiId,
        stageName: 'foo',
      });
      new CfnWebACLAssociation(stack, 'rWebAClAssoc', {
        webAclArn: 'bar',
        resourceArn: `${compliantRestApi.restApiId}/stage/foo`,
      });
      const compliantRestApi2 = new RestApi(stack, 'rRestApi2', {
        deploy: false,
      });
      compliantRestApi2.root.addMethod('ANY');
      const compliantStage2 = new CfnStage(stack, 'rRestStage2', {
        restApiId: compliantRestApi2.restApiId,
        stageName: 'foo',
      });
      new CfnWebACLAssociation(stack, 'rWebAClAssoc2', {
        webAclArn: 'bar',
        resourceArn: `${compliantRestApi2.restApiId}/stage/${compliantStage2.stageName}`,
      });
      const compliantRestApi3 = new RestApi(stack, 'rRestApi3', {
        deploy: false,
      });
      compliantRestApi3.root.addMethod('ANY');
      new CfnStage(stack, 'rRestStage3', {
        restApiId: 'baz',
        stageName: 'foo',
      });
      new CfnWebACLAssociation(stack, 'rWebAClAssoc3', {
        webAclArn: 'bar',
        resourceArn: `baz/stage/${compliantStage2.ref}`,
      });
      const compliantRestApi4 = new RestApi(stack, 'rRestApi4', {
        deploy: false,
      });
      compliantRestApi4.root.addMethod('ANY');
      const compliantStage4 = new CfnStage(stack, 'rRestStage4', {
        restApiId: 'baz',
        stageName: 'foo',
      });
      new CfnWebACLAssociation(stack, 'rWebAClAssoc4', {
        webAclArn: 'bar',
        resourceArn: `${compliantStage4.restApiId}/stage/foo`,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('APIGWAuthorization: APIs implement authorization', () => {
    const ruleId = 'APIGWAuthorization';
    test('Noncompliance 1', () => {
      new RestApi(stack, 'RestApi').root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnRoute(stack, 'Route', {
        apiId: 'foo',
        routeKey: 'ANY /bar',
        authorizationType: 'NONE',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new RestApi(stack, 'RestApi').root.addMethod('OPTIONS');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance 1', () => {
      new RestApi(stack, 'RestApi', {
        defaultMethodOptions: { authorizationType: AuthorizationType.CUSTOM },
      }).root.addMethod('ANY');
      new CfnRoute(stack, 'Route', {
        apiId: 'foo',
        routeKey: 'ANY /bar',
        authorizationType: 'CUSTOM',
        authorizerId: 'baz',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Compliance 2', () => {
      new RestApi(stack, 'RestApi').root.addCorsPreflight({
        allowOrigins: Cors.ALL_ORIGINS,
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowMethods: Cors.ALL_METHODS,
        allowCredentials: true,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('APIGWCacheEnabledAndEncrypted: API Gateway stages have caching enabled and encrypted for all methods', () => {
    const ruleId = 'APIGWCacheEnabledAndEncrypted';
    test('Noncompliance 1', () => {
      new RestApi(stack, 'rRestApi').root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new RestApi(stack, 'rRestApi', {
        deployOptions: { cachingEnabled: false },
      }).root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new RestApi(stack, 'rRestApi', {
        deployOptions: { cacheDataEncrypted: false },
      }).root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new RestApi(stack, 'rRestApi', {
        deployOptions: { cacheDataEncrypted: true, cachingEnabled: true },
      }).root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('APIGWExecutionLoggingEnabled: API Gateway stages have logging enabled for all methods', () => {
    const ruleId = 'APIGWExecutionLoggingEnabled';
    test('Noncompliance 1', () => {
      new RestApi(stack, 'rRestApi').root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new RestApi(stack, 'rRestApi', {
        deployOptions: { loggingLevel: MethodLoggingLevel.OFF },
      }).root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new RestApi(stack, 'rRestApi', {
        deployOptions: { loggingLevel: MethodLoggingLevel.ERROR },
      }).root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('APIGWRequestValidation: Rest APIs have request validation enabled', () => {
    const ruleId = 'APIGWRequestValidation';
    test('Noncompliance 1', () => {
      new RestApi(stack, 'RestApi').root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new RestApi(stack, 'RestApi').root.addMethod('ANY');
      new CfnRequestValidator(stack, 'RequestVAlidator', {
        restApiId: 'foo',
        validateRequestBody: true,
        validateRequestParameters: false,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const compliantRestApi = new RestApi(stack, 'RestApi');
      compliantRestApi.addRequestValidator('RequestValidator', {
        validateRequestBody: true,
        validateRequestParameters: true,
      });
      compliantRestApi.root.addMethod('ANY');
      const compliantRestApi2 = new RestApi(stack, 'RestApi2');
      compliantRestApi2.root.addMethod('ANY');
      new CfnRequestValidator(stack, 'RequestValidator2', {
        restApiId: compliantRestApi2.restApiId,
        validateRequestBody: true,
        validateRequestParameters: true,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('APIGWSSLEnabled: API Gateway REST API stages are configured with SSL certificates', () => {
    const ruleId = 'APIGWSSLEnabled';
    test('Noncompliance 1', () => {
      new RestApi(stack, 'rRestApi').root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new RestApi(stack, 'rRestApi', {
        deployOptions: {
          clientCertificateId: new CfnClientCertificate(
            stack,
            'rClientCertificate'
          ).attrClientCertificateId,
        },
      }).root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('APIGWXrayEnabled: API Gateway REST API stages have X-Ray tracing enabled', () => {
    const ruleId = 'APIGWXrayEnabled';
    test('Noncompliance 1', () => {
      new RestApi(stack, 'rRestApi').root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new RestApi(stack, 'rRestApi', {
        deployOptions: { tracingEnabled: true },
      }).root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});
