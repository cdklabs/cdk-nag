/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnDBCluster } from '@aws-cdk/aws-rds';
import { CfnResource } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * RDS Aurora serverless clusters have Log Exports enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnDBCluster) {
      const engine = NagRules.resolveIfPrimitive(
        node,
        node.engine
      ).toLowerCase();
      const backtrackWindow = NagRules.resolveIfPrimitive(
        node,
        node.backtrackWindow
      );
      if (engine == 'aurora' || engine == 'aurora-mysql') {
        if (backtrackWindow == undefined || backtrackWindow == 0) {
          return NagRuleCompliance.NON_COMPLIANT;
        }
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);
