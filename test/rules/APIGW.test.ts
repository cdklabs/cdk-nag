/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import {
  AuthorizationType,
  CfnClientCertificate,
  CfnDeployment,
  CfnRequestValidator,
  CfnRestApi,
  CfnStage,
  MethodLoggingLevel,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { CfnRoute, CfnStage as CfnV2Stage } from 'aws-cdk-lib/aws-apigatewayv2';
import { CfnApi, CfnHttpApi } from 'aws-cdk-lib/aws-sam';
import { CfnWebACLAssociation } from 'aws-cdk-lib/aws-wafv2';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import { TestPack, TestType, validateStack } from './utils';
import {
  APIGWAccessLogging,
  APIGWAssociatedWithWAF,
  APIGWAuthorization,
  APIGWCacheEnabledAndEncrypted,
  APIGWDefaultThrottling,
  APIGWExecutionLoggingEnabled,
  APIGWRequestValidation,
  APIGWSSLEnabled,
  APIGWStructuredLogging,
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
  APIGWStructuredLogging,
  APIGWDefaultThrottling,
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
      new CfnStage(stack, 'RestApiDeploymentStage', {
        restApiId: 'foo',
        deploymentId: 'bar',
        stageName: 'prod',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnV2Stage(stack, 'HttpApiDefaultStage', {
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
      new CfnStage(stack, 'RestApiDeploymentStage', {
        restApiId: 'foo',
        accessLogSetting: {
          destinationArn: 'bar',
          format:
            '$context.identity.sourceIp $context.identity.caller $context.identity.user [$context.requestTime] "$context.httpMethod $context.resourcePath $context.protocol" $context.status $context.responseLength $context.requestId',
        },
        deploymentId: 'baz',
        stageName: 'prod',
      });
      new CfnV2Stage(stack, 'Stage', {
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
      new CfnStage(stack, 'RestStage', {
        restApiId: 'foo',
        stageName: 'bar',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      const nonCompliance2RestApi = new CfnRestApi(stack, 'RestApi', {
        name: 'RestApi',
      });
      new CfnStage(stack, 'RestStage', {
        restApiId: nonCompliance2RestApi.ref,
        stageName: 'foo',
      });
      new CfnWebACLAssociation(stack, 'WebAClAssoc', {
        webAclArn: 'bar',
        resourceArn: nonCompliance2RestApi.ref,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      const nonCompliance3RestApi = new CfnRestApi(stack, 'RestApi', {
        name: 'RestApi',
      });
      const nonCompliance3Stage = new CfnStage(stack, 'RestStage', {
        restApiId: nonCompliance3RestApi.ref,
        stageName: 'foo',
      });
      new CfnWebACLAssociation(stack, 'WebAClAssoc', {
        webAclArn: 'bar',
        resourceArn: nonCompliance3RestApi.ref,
      });
      new CfnWebACLAssociation(stack, 'WebAClAssoc2', {
        webAclArn: 'bar',
        resourceArn: `${nonCompliance3Stage.ref}/baz`,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const compliantRestApi = new RestApi(stack, 'RestApi', {
        deploy: false,
      });
      compliantRestApi.root.addMethod('ANY');
      new CfnStage(stack, 'RestStage', {
        restApiId: compliantRestApi.restApiId,
        stageName: 'foo',
      });
      new CfnWebACLAssociation(stack, 'WebAClAssoc', {
        webAclArn: 'bar',
        resourceArn: `${compliantRestApi.restApiId}/stage/foo`,
      });
      const compliantRestApi2 = new RestApi(stack, 'RestApi2', {
        deploy: false,
      });
      compliantRestApi2.root.addMethod('ANY');
      const compliantStage2 = new CfnStage(stack, 'RestStage2', {
        restApiId: compliantRestApi2.restApiId,
        stageName: 'foo',
      });
      new CfnWebACLAssociation(stack, 'WebAClAssoc2', {
        webAclArn: 'bar',
        resourceArn: `${compliantRestApi2.restApiId}/stage/${compliantStage2.stageName}`,
      });
      const compliantRestApi3 = new RestApi(stack, 'RestApi3', {
        deploy: false,
      });
      compliantRestApi3.root.addMethod('ANY');
      new CfnStage(stack, 'RestStage3', {
        restApiId: 'baz',
        stageName: 'foo',
      });
      new CfnWebACLAssociation(stack, 'WebAClAssoc3', {
        webAclArn: 'bar',
        resourceArn: `baz/stage/${compliantStage2.ref}`,
      });
      const compliantRestApi4 = new RestApi(stack, 'RestApi4', {
        deploy: false,
      });
      compliantRestApi4.root.addMethod('ANY');
      const compliantStage4 = new CfnStage(stack, 'RestStage4', {
        restApiId: 'baz',
        stageName: 'foo',
      });
      new CfnWebACLAssociation(stack, 'WebAClAssoc4', {
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
    test('Compliance', () => {
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
  });

  describe('APIGWCacheEnabledAndEncrypted: API Gateway stages have caching enabled and encrypted for all methods', () => {
    const ruleId = 'APIGWCacheEnabledAndEncrypted';
    test('Noncompliance 1', () => {
      new RestApi(stack, 'RestApi').root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new RestApi(stack, 'RestApi', {
        deployOptions: { cachingEnabled: false },
      }).root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new RestApi(stack, 'RestApi', {
        deployOptions: { cacheDataEncrypted: false },
      }).root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new RestApi(stack, 'RestApi', {
        deployOptions: { cacheDataEncrypted: true, cachingEnabled: true },
      }).root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('APIGWExecutionLoggingEnabled: API Gateway stages have logging enabled for all methods', () => {
    const ruleId = 'APIGWExecutionLoggingEnabled';
    test('Noncompliance 1', () => {
      new RestApi(stack, 'RestApi').root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new RestApi(stack, 'RestApi', {
        deployOptions: { loggingLevel: MethodLoggingLevel.OFF },
      }).root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new RestApi(stack, 'RestApi', {
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
      new RestApi(stack, 'RestApi').root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new RestApi(stack, 'RestApi', {
        deployOptions: {
          clientCertificateId: new CfnClientCertificate(
            stack,
            'ClientCertificate'
          ).attrClientCertificateId,
        },
      }).root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('APIGWXrayEnabled: API Gateway REST API stages have X-Ray tracing enabled', () => {
    const ruleId = 'APIGWXrayEnabled';
    test('Noncompliance 1', () => {
      new RestApi(stack, 'RestApi').root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new RestApi(stack, 'RestApi', {
        deployOptions: { tracingEnabled: true },
      }).root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('APIGWStructuredLogging: API Gateway stages use JSON-formatted structured logging', () => {
    const ruleId = 'APIGWStructuredLogging';

    test('Noncompliance 1: Non-JSON format (CfnStage)', () => {
      new CfnStage(stack, 'RestApiStageNonJsonFormat', {
        restApiId: 'foo',
        stageName: 'prod',
        accessLogSetting: {
          destinationArn:
            'arn:aws:logs:us-east-1:123456789012:log-group:API-Gateway-Execution-Logs_abc123/prod',
          format:
            '$context.identity.sourceIp $context.identity.caller $context.identity.user [$context.requestTime] "$context.httpMethod $context.resourcePath $context.protocol" $context.status $context.responseLength $context.requestId',
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 2: No access log settings (CfnDeployment)', () => {
      new CfnDeployment(stack, 'RestApiDeploymentNoLogs', {
        restApiId: 'foo',
        stageDescription: {
          accessLogSetting: {
            destinationArn:
              'arn:aws:logs:us-east-1:123456789012:log-group:API-Gateway-Execution-Logs_abc123/prod',
          },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 3: No access log settings (CfnApi)', () => {
      new CfnApi(stack, 'SamApiNoLogs', {
        stageName: 'MyApi',
        accessLogSetting: {
          destinationArn:
            'arn:aws:logs:us-east-1:123456789012:log-group:API-Gateway-Execution-Logs_abc123/prod',
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 4: No access log settings (CfnHttpApi)', () => {
      new CfnHttpApi(stack, 'SamHttpApiNoLogs', {
        stageName: 'MyApi',
        accessLogSetting: {
          destinationArn:
            'arn:aws:logs:us-east-1:123456789012:log-group:API-Gateway-Execution-Logs_abc123/prod',
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance 1: JSON-formatted log (CfnStage)', () => {
      new CfnStage(stack, 'RestApiStageJsonFormat', {
        restApiId: 'foo',
        stageName: 'prod',
        accessLogSetting: {
          destinationArn:
            'arn:aws:logs:us-east-1:123456789012:log-group:API-Gateway-Execution-Logs_abc123/prod',
          format:
            '{"requestId":"$context.requestId", "ip": "$context.identity.sourceIp", "caller":"$context.identity.caller", "user":"$context.identity.user","requestTime":"$context.requestTime", "httpMethod":"$context.httpMethod","resourcePath":"$context.resourcePath", "status":"$context.status","protocol":"$context.protocol", "responseLength":"$context.responseLength"}',
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });

    test('Compliance 2: HTTP API with JSON-formatted log (CfnStageV2)', () => {
      new CfnV2Stage(stack, 'HttpApiStageJsonFormat', {
        apiId: 'bar',
        stageName: 'prod',
        accessLogSettings: {
          destinationArn:
            'arn:aws:logs:us-east-1:123456789012:log-group:API-Gateway-Execution-Logs_abc123/prod',
          format:
            '{"requestId":"$context.requestId", "ip": "$context.identity.sourceIp", "requestTime":"$context.requestTime", "httpMethod":"$context.httpMethod","routeKey":"$context.routeKey", "status":"$context.status","protocol":"$context.protocol", "responseLength":"$context.responseLength"}',
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });

    test('Compliance 3: JSON-formatted log (CfnDeployment)', () => {
      new CfnDeployment(stack, 'RestApiDeploymentJsonFormat', {
        restApiId: 'foo',
        stageDescription: {
          accessLogSetting: {
            destinationArn:
              'arn:aws:logs:us-east-1:123456789012:log-group:API-Gateway-Execution-Logs_abc123/prod',
            format:
              '{"requestId":"$context.requestId", "ip": "$context.identity.sourceIp", "caller":"$context.identity.caller", "user":"$context.identity.user","requestTime":"$context.requestTime", "httpMethod":"$context.httpMethod","resourcePath":"$context.resourcePath", "status":"$context.status","protocol":"$context.protocol", "responseLength":"$context.responseLength"}',
          },
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });

    test('Compliance 4: JSON-formatted log (CfnApi)', () => {
      new CfnApi(stack, 'SamApiJsonFormat', {
        stageName: 'MyApi',
        accessLogSetting: {
          destinationArn:
            'arn:aws:logs:us-east-1:123456789012:log-group:API-Gateway-Execution-Logs_abc123/prod',
          format:
            '{"requestId":"$context.requestId", "ip": "$context.identity.sourceIp", "caller":"$context.identity.caller", "user":"$context.identity.user","requestTime":"$context.requestTime", "httpMethod":"$context.httpMethod","resourcePath":"$context.resourcePath", "status":"$context.status","protocol":"$context.protocol", "responseLength":"$context.responseLength"}',
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });

    test('Compliance 5: JSON-formatted log (CfnHttpApi)', () => {
      new CfnHttpApi(stack, 'SamHttpApiJsonFormat', {
        stageName: 'MyApi',
        accessLogSetting: {
          destinationArn:
            'arn:aws:logs:us-east-1:123456789012:log-group:API-Gateway-Execution-Logs_abc123/prod',
          format:
            '{"requestId":"$context.requestId", "ip": "$context.identity.sourceIp", "requestTime":"$context.requestTime", "httpMethod":"$context.httpMethod","routeKey":"$context.routeKey", "status":"$context.status","protocol":"$context.protocol", "responseLength":"$context.responseLength"}',
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('APIGWDefaultThrottling: API Gateway REST and HTTP APIs have default throttling enabled', () => {
    const ruleId = 'APIGWDefaultThrottling';

    test('Noncompliance 1: REST API without throttling', () => {
      new CfnStage(stack, 'RestApiStageNoThrottling', {
        restApiId: 'foo',
        stageName: 'prod',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 2: HTTP API without throttling', () => {
      new CfnV2Stage(stack, 'HttpApiStageNoThrottling', {
        apiId: 'bar',
        stageName: 'prod',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 3: REST API with incomplete throttling', () => {
      new CfnStage(stack, 'RestApiStageIncompleteThrottling', {
        restApiId: 'foo',
        stageName: 'prod',
        methodSettings: [
          {
            httpMethod: '*',
            resourcePath: '/*',
            throttlingRateLimit: 100,
          },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance 1: REST API with complete throttling', () => {
      new CfnStage(stack, 'RestApiStageCompliantThrottling', {
        restApiId: 'foo',
        stageName: 'prod',
        methodSettings: [
          {
            httpMethod: '*',
            resourcePath: '/*',
            throttlingRateLimit: 100,
            throttlingBurstLimit: 50,
          },
        ],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });

    test('Compliance 2: HTTP API with throttling', () => {
      new CfnV2Stage(stack, 'HttpApiStageCompliantThrottling', {
        apiId: 'bar',
        stageName: 'prod',
        defaultRouteSettings: {
          throttlingRateLimit: 100,
          throttlingBurstLimit: 50,
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});
