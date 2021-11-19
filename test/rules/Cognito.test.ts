/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Aspects, CfnResource, Stack } from 'aws-cdk-lib';
import { RestApi, AuthorizationType } from 'aws-cdk-lib/aws-apigateway';
import {
  UserPool,
  Mfa,
  CfnUserPool,
  CfnIdentityPool,
} from 'aws-cdk-lib/aws-cognito';
import { IConstruct } from 'constructs';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  CognitoUserPoolAPIGWAuthorizer,
  CognitoUserPoolAdvancedSecurityModeEnforced,
  CognitoUserPoolMFA,
  CognitoUserPoolNoUnauthenticatedLogins,
  CognitoUserPoolStrongPasswordPolicy,
} from '../../src/rules/cognito';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        CognitoUserPoolAPIGWAuthorizer,
        CognitoUserPoolAdvancedSecurityModeEnforced,
        CognitoUserPoolMFA,
        CognitoUserPoolNoUnauthenticatedLogins,
        CognitoUserPoolStrongPasswordPolicy,
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

describe('Amazon Cognito', () => {
  test('CognitoUserPoolStrongPasswordPolicy: Cognito user pools have password policies that minimally specify a password length of at least 8 characters, as well as requiring uppercase, numeric, and special characters ', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new UserPool(nonCompliant, 'rUserPool');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CognitoUserPoolStrongPasswordPolicy:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new UserPool(nonCompliant2, 'rUserPool', {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireDigits: true,
      },
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CognitoUserPoolStrongPasswordPolicy:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new UserPool(compliant, 'rUserPool', {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CognitoUserPoolStrongPasswordPolicy:'),
        }),
      })
    );
  });

  test('CognitoUserPoolMFA: Cognito user pools require MFA', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new UserPool(nonCompliant, 'rUserPool');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CognitoUserPoolMFA:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new UserPool(nonCompliant2, 'rUserPool', { mfa: Mfa.OPTIONAL });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CognitoUserPoolMFA:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new UserPool(compliant, 'rUserPool', { mfa: Mfa.REQUIRED });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CognitoUserPoolMFA:'),
        }),
      })
    );
  });

  test('CognitoUserPoolAdvancedSecurityModeEnforced: Cognito user pools have AdvancedSecurityMode set to ENFORCED', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new UserPool(nonCompliant, 'rUserPool');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'CognitoUserPoolAdvancedSecurityModeEnforced:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnUserPool(nonCompliant2, 'rUserPool', {
      userPoolAddOns: { advancedSecurityMode: 'OFF' },
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'CognitoUserPoolAdvancedSecurityModeEnforced:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnUserPool(compliant, 'rUserPool', {
      userPoolAddOns: { advancedSecurityMode: 'ENFORCED' },
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'CognitoUserPoolAdvancedSecurityModeEnforced:'
          ),
        }),
      })
    );
  });

  test('CognitoUserPoolAPIGWAuthorizer: Rest API methods use Cognito User Pool Authorizers', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new RestApi(nonCompliant, 'rRest').root.addMethod('ANY');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CognitoUserPoolAPIGWAuthorizer:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new RestApi(compliant, 'rRest').root.addMethod('ANY', undefined, {
      authorizationType: AuthorizationType.COGNITO,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CognitoUserPoolAPIGWAuthorizer:'),
        }),
      })
    );
  });

  test('CognitoUserPoolNoUnauthenticatedLogins: Cognito identity pools do not allow for unauthenticated logins without a valid reason', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnIdentityPool(nonCompliant, 'rIdentityPool', {
      allowUnauthenticatedIdentities: true,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'CognitoUserPoolNoUnauthenticatedLogins:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnIdentityPool(compliant, 'rIdentityPool', {
      allowUnauthenticatedIdentities: false,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'CognitoUserPoolNoUnauthenticatedLogins:'
          ),
        }),
      })
    );
  });
});
