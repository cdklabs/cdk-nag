/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnDBCluster } from '@aws-cdk/aws-neptune';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive, NagRuleCompliance } from '../../nag-pack';

/**
 * Neptune DB clusters have IAM Database Authentication enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnDBCluster) {
      if (node.iamAuthEnabled == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const iamAuthEnabled = resolveIfPrimitive(node, node.iamAuthEnabled);
      if (!iamAuthEnabled) {
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
