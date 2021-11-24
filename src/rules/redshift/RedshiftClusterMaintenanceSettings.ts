/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnCluster } from '@aws-cdk/aws-redshift';
import { CfnResource } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Redshift clusters have version upgrades enabled, automated snapshot retention periods enabled, and explicit maintenance windows configured
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnCluster) {
      const allowVersionUpgrade = NagRules.resolveIfPrimitive(
        node,
        node.allowVersionUpgrade
      );
      const automatedSnapshotRetentionPeriod = NagRules.resolveIfPrimitive(
        node,
        node.automatedSnapshotRetentionPeriod
      );
      if (
        (automatedSnapshotRetentionPeriod != undefined &&
          automatedSnapshotRetentionPeriod == 0) ||
        node.preferredMaintenanceWindow == undefined ||
        allowVersionUpgrade === false
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
