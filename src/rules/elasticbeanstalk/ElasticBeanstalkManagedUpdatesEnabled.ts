/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnEnvironment } from '@aws-cdk/aws-elasticbeanstalk';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * Elastic Beanstalk environments have managed updates enabled
 * https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/command-options-general.html#command-options-general-elasticbeanstalkmanagedactions
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnEnvironment) {
      const optionSettings = Stack.of(node).resolve(node.optionSettings);
      if (optionSettings == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      let foundEnabled = false;
      let foundLevel = false;
      for (const optionSetting of optionSettings) {
        const resolvedOptionSetting = Stack.of(node).resolve(optionSetting);
        const namespace = resolvedOptionSetting.namespace;
        const optionName = resolvedOptionSetting.optionName;
        const value = resolvedOptionSetting.value;
        if (
          namespace === 'aws:elasticbeanstalk:managedactions' &&
          optionName === 'ManagedActionsEnabled' &&
          (value === undefined || value === 'true')
        ) {
          foundEnabled = true;
          if (foundLevel) {
            break;
          }
        } else if (
          namespace === 'aws:elasticbeanstalk:managedactions:platformupdate' &&
          optionName === 'UpdateLevel' &&
          (value === 'minor' || value === 'patch')
        ) {
          foundLevel = true;
          if (foundEnabled) {
            break;
          }
        }
      }
      if (!foundEnabled || !foundLevel) {
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
