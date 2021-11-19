/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnUserPool, Mfa } from 'aws-cdk-lib/aws-cognito';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * Cognito user pools require MFA
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnUserPool) {
      const mfaConfiguration = resolveIfPrimitive(node, node.mfaConfiguration);
      if (mfaConfiguration == undefined || mfaConfiguration != Mfa.REQUIRED) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);
