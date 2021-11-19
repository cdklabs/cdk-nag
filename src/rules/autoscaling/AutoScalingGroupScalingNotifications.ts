/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnAutoScalingGroup, ScalingEvent } from 'aws-cdk-lib/aws-autoscaling';

/**
 * Auto Scaling Groups have notifications for all scaling events configured
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnAutoScalingGroup) {
      if (node.notificationConfigurations == undefined) {
        return false;
      }
      const notificationConfigurations = <
        CfnAutoScalingGroup.NotificationConfigurationProperty[]
      >Stack.of(node).resolve(node.notificationConfigurations);

      const requiredEvents = [
        ScalingEvent.INSTANCE_LAUNCH,
        ScalingEvent.INSTANCE_LAUNCH_ERROR,
        ScalingEvent.INSTANCE_TERMINATE,
        ScalingEvent.INSTANCE_TERMINATE_ERROR,
      ];

      return requiredEvents.every((req) => {
        return notificationConfigurations.some((config) => {
          return config.notificationTypes?.includes(req);
        });
      });
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);
