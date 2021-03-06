/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnReplicationInstance } from 'aws-cdk-lib/aws-dms';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * DMS replication instances are not public
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnReplicationInstance) {
      const publicAccess = NagRules.resolveIfPrimitive(
        node,
        node.publiclyAccessible
      );
      if (publicAccess !== false) {
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
