/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnEnvironment } from '@aws-cdk/aws-elasticbeanstalk';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * EC2 instances in Elastic Beanstalk environments upload rotated logs to S3
 * https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/command-options-general.html#command-options-general-elasticbeanstalkhostmanager
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnEnvironment) {
      const optionSettings = Stack.of(node).resolve(node.optionSettings);
      if (optionSettings == undefined) {
        return false;
      }
      let foundEnabled = false;
      for (const optionSetting of optionSettings) {
        const resolvedOptionSetting = Stack.of(node).resolve(optionSetting);
        const namespace = resolvedOptionSetting.namespace;
        const optionName = resolvedOptionSetting.optionName;
        const value = resolvedOptionSetting.value;
        if (
          namespace === 'aws:elasticbeanstalk:hostmanager' &&
          optionName === 'LogPublicationControl' &&
          value === 'true'
        ) {
          foundEnabled = true;
          break;
        }
      }
      if (!foundEnabled) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);
