/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnFunction } from 'aws-cdk-lib/aws-lambda';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * By default, CloudWatch log groups created by Lambda functions have an unlimited retention time. For cost optimization purposes, you should explicitly define a LogGroup which allows for the CloudWatchLogGroupRetentionPeriod rule to detect unspecified log retention periods. 
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnFunction) {
      const loggingConfig = Stack.of(node).resolve(node.loggingConfig);
      if (loggingConfig && loggingConfig.logGroup)
        return NagRuleCompliance.COMPLIANT;
      return NagRuleCompliance.NON_COMPLIANT;
    }
    return NagRuleCompliance.NOT_APPLICABLE;
  },
  'name',
  { value: parse(__filename).name }
);
