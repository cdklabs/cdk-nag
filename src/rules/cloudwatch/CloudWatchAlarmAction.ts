/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnAlarm } from '@aws-cdk/aws-cloudwatch';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance } from '../../nag-pack';

/**
 * CloudWatch alarms have at least one alarm action, one INSUFFICIENT_DATA action, or one OK action enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnAlarm) {
      const actionsEnabled = Stack.of(node).resolve(node.actionsEnabled);
      if (actionsEnabled === false) {
        return NagRuleCompliance.NON_COMPLIANT;
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
