/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnTrail } from '@aws-cdk/aws-cloudtrail';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance } from '../../nag-pack';

/**
 * CloudTrail trails have CloudWatch logs enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnTrail) {
      const cloudWatch = Stack.of(node).resolve(node.cloudWatchLogsLogGroupArn);

      if (cloudWatch == undefined) {
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
