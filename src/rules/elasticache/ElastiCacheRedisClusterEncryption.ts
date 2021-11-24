/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnReplicationGroup } from '@aws-cdk/aws-elasticache';
import { CfnResource } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * ElastiCache Redis clusters have both encryption in transit and at rest enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnReplicationGroup) {
      if (
        node.atRestEncryptionEnabled == undefined ||
        node.transitEncryptionEnabled == undefined
      ) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const rest = NagRules.resolveIfPrimitive(
        node,
        node.atRestEncryptionEnabled
      );
      const transit = NagRules.resolveIfPrimitive(
        node,
        node.transitEncryptionEnabled
      );
      if (rest == false || transit == false) {
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
