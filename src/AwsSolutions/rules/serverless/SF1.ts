/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnStateMachine, LogLevel } from '@aws-cdk/aws-stepfunctions';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Step Function log "ALL" events to CloudWatch Logs
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnStateMachine) {
    const loggingConfiguration = Stack.of(node).resolve(
      node.loggingConfiguration,
    );
    if (loggingConfiguration == undefined) {
      return false;
    }
    const level = Stack.of(node).resolve(loggingConfiguration.level);
    if (level == undefined || level != LogLevel.ALL) {
      return false;
    }
  }
  return true;
}
