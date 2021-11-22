/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnDBCluster, CfnDBInstance } from '@aws-cdk/aws-rds';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive, NagRuleCompliance } from '../../nag-pack';

/**
 *  RDS DB instances and Aurora DB clusters have Deletion Protection enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnDBCluster) {
      if (node.deletionProtection == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const deletionProtection = resolveIfPrimitive(
        node,
        node.deletionProtection
      );
      if (deletionProtection == false) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else if (node instanceof CfnDBInstance) {
      const deletionProtection = resolveIfPrimitive(
        node,
        node.deletionProtection
      );
      const engine = resolveIfPrimitive(node, node.engine);
      if (
        (deletionProtection == false || deletionProtection == undefined) &&
        (engine == undefined || !engine.toLowerCase().includes('aurora'))
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
