/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnAlarm } from '@aws-cdk/aws-cloudwatch';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * CloudWatch alarms have at least one alarm action, one INSUFFICIENT_DATA action, or one OK action enabled - (Control IDs: AU-6(1), AU-6(5), AU-12(3), AU-14a, AU-14b, CA-2(2), CA-7, CA-7b, PM-14a.1, PM-14b, PM-31, SC-36(1)(a), SI-2a, SI-4(12), SI-5b, SI-5(1))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnAlarm) {
    const actionsEnabled = Stack.of(node).resolve(node.actionsEnabled);
    if (actionsEnabled === false) {
      return false;
    }
    // Actions can be an array with a token that then resolves to an empty array or undefined
    const alarmActions = Stack.of(node).resolve(node.alarmActions);
    const insufficientDataActions = Stack.of(node).resolve(
      node.insufficientDataActions
    );
    const okActions = Stack.of(node).resolve(node.okActions);
    const totalAlarmActions = alarmActions ? alarmActions.length : 0;
    const totalInsufficientDataActions = insufficientDataActions
      ? insufficientDataActions.length
      : 0;
    const totalOkActions = okActions ? okActions.length : 0;
    const totalActions =
      totalAlarmActions + totalInsufficientDataActions + totalOkActions;
    if (totalActions == 0) {
      return false;
    }
  }
  return true;
}
