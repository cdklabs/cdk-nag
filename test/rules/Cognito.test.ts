/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { RestApi, AuthorizationType } from 'aws-cdk-lib/aws-apigateway';
import {
  UserPool,
  Mfa,
  CfnUserPool,
  CfnIdentityPool,
} from 'aws-cdk-lib/aws-cognito';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import {
  CognitoUserPoolAPIGWAuthorizer,
  CognitoUserPoolAdvancedSecurityModeEnforced,
  CognitoUserPoolMFA,
  CognitoUserPoolNoUnauthenticatedLogins,
  CognitoUserPoolStrongPasswordPolicy,
} from '../../src/rules/cognito';
import { validateStack, TestType, TestPack } from './utils';

const testPack = new TestPack([
  CognitoUserPoolAPIGWAuthorizer,
  CognitoUserPoolAdvancedSecurityModeEnforced,
  CognitoUserPoolMFA,
  CognitoUserPoolNoUnauthenticatedLogins,
  CognitoUserPoolStrongPasswordPolicy,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon Cognito', () => {
  describe('CognitoUserPoolStrongPasswordPolicy: Cognito user pools have password policies that minimally specify a password length of at least 8 characters, as well as requiring uppercase, numeric, and special characters ', () => {
    const ruleId = 'CognitoUserPoolStrongPasswordPolicy';
    test('Noncompliance 1', () => {
      new UserPool(stack, 'rUserPool');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new UserPool(stack, 'rUserPool', {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireDigits: true,
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new UserPool(stack, 'rUserPool', {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireDigits: true,
          requireSymbols: true,
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('CognitoUserPoolMFA: Cognito user pools require MFA', () => {
    const ruleId = 'CognitoUserPoolMFA';
    test('Noncompliance 1', () => {
      new UserPool(stack, 'rUserPool');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new UserPool(stack, 'rUserPool', { mfa: Mfa.OPTIONAL });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new UserPool(stack, 'rUserPool', { mfa: Mfa.REQUIRED });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('CognitoUserPoolAdvancedSecurityModeEnforced: Cognito user pools have AdvancedSecurityMode set to ENFORCED', () => {
    const ruleId = 'CognitoUserPoolAdvancedSecurityModeEnforced';
    test('Noncompliance 1', () => {
      new UserPool(stack, 'rUserPool');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnUserPool(stack, 'rUserPool', {
        userPoolAddOns: { advancedSecurityMode: 'OFF' },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new CfnUserPool(stack, 'rUserPool', {
        userPoolAddOns: { advancedSecurityMode: 'ENFORCED' },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('CognitoUserPoolAPIGWAuthorizer: Rest API methods use Cognito User Pool Authorizers', () => {
    const ruleId = 'CognitoUserPoolAPIGWAuthorizer';
    test('Noncompliance 1', () => {
      new RestApi(stack, 'rRest').root.addMethod('ANY');
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new RestApi(stack, 'rRest').root.addMethod('ANY', undefined, {
        authorizationType: AuthorizationType.COGNITO,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('CognitoUserPoolNoUnauthenticatedLogins: Cognito identity pools do not allow for unauthenticated logins without a valid reason', () => {
    const ruleId = 'CognitoUserPoolNoUnauthenticatedLogins';
    test('Noncompliance 1', () => {
      new CfnIdentityPool(stack, 'rIdentityPool', {
        allowUnauthenticatedIdentities: true,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new CfnIdentityPool(stack, 'rIdentityPool', {
        allowUnauthenticatedIdentities: false,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});
