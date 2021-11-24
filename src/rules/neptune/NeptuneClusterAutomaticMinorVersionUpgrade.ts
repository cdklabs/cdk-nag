/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnDBInstance } from 'aws-cdk-lib/aws-neptune';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Neptune DB instances have Auto Minor Version Upgrade enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnDBInstance) {
      if (node.autoMinorVersionUpgrade == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const autoMinorVersionUpgrade = NagRules.resolveIfPrimitive(
        node,
        node.autoMinorVersionUpgrade
      );
      if (!autoMinorVersionUpgrade) {
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
