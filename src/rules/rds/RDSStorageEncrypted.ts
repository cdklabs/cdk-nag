/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnDBCluster, CfnDBInstance } from '@aws-cdk/aws-rds';
import { CfnResource } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * RDS DB instances and Aurora DB clusters have storage encryption enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnDBCluster) {
      if (node.storageEncrypted == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const encrypted = NagRules.resolveIfPrimitive(
        node,
        node.storageEncrypted
      );
      if (encrypted == false) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else if (node instanceof CfnDBInstance) {
      const encrypted = NagRules.resolveIfPrimitive(
        node,
        node.storageEncrypted
      );
      if (
        (encrypted == false || encrypted == undefined) &&
        (node.engine == undefined ||
          !node.engine.toLowerCase().includes('aurora'))
      ) {
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
