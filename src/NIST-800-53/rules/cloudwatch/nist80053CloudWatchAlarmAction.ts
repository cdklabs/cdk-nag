/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnAlarm } from '@aws-cdk/aws-cloudwatch';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * CloudWatch alarms have at least one alarm action, one INSUFFICIENT_DATA action, or one OK action enabled - (Control IDs: AC-2(4), AU-6(1)(3), AU-7(1), CA-7(a)(b), IR-4(1), SI-4(2), SI-4(4), SI-4(5), SI-4(a)(b)(c))
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
