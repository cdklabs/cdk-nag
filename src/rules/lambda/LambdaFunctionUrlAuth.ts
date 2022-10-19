/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnUrl, FunctionUrlAuthType} from 'aws-cdk-lib/aws-lambda';
import { NagRuleCompliance } from '../../nag-rules';
 
/**
 * Lambda function URLs require Auth
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnUrl) {
        if (node.authType === FunctionUrlAuthType.NONE) {
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
