/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnSubscription } from 'aws-cdk-lib/aws-sns';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * Ensure that API Gateway REST and HTTP APIs are using JSON structured logs
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnSubscription) {
      const redrivePolicy = node.redrivePolicy;
      if (redrivePolicy) return NagRuleCompliance.COMPLIANT;
      return NagRuleCompliance.NON_COMPLIANT;
    }
    return NagRuleCompliance.NOT_APPLICABLE;
  },
  'name',
  { value: parse(__filename).name }
);
