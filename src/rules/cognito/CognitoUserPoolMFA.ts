/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnUserPool, Mfa } from 'aws-cdk-lib/aws-cognito';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Cognito user pools require MFA
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnUserPool) {
      const mfaConfiguration = NagRules.resolveIfPrimitive(
        node,
        node.mfaConfiguration
      );
      if (mfaConfiguration == undefined || mfaConfiguration != Mfa.REQUIRED) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);
