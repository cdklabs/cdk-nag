/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnEnvironment } from '@aws-cdk/aws-elasticbeanstalk';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * Elastic Beanstalk environments have enhanced health reporting enabled - (Control ID: 164.312(b))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnEnvironment) {
    const optionSettings = Stack.of(node).resolve(node.optionSettings);
    if (optionSettings == undefined) {
      return false;
    }
    let found = false;
    for (const optionSetting of optionSettings) {
      const resolvedOptionSetting = Stack.of(node).resolve(optionSetting);
      const namespace = resolvedOptionSetting.namespace;
      const optionName = resolvedOptionSetting.optionName;
      const value = resolvedOptionSetting.value;
      if (
        namespace === 'aws:elasticbeanstalk:healthreporting:system' &&
        optionName === 'SystemType' &&
        value === 'enhanced'
      ) {
        found = true;
        break;
      }
    }
    if (!found) {
      return false;
    }
  }
  return true;
}
