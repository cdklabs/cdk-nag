/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnStateMachine, LogLevel } from 'aws-cdk-lib/aws-stepfunctions';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * Step Function log "ALL" events to CloudWatch Logs
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnStateMachine) {
      const loggingConfiguration = Stack.of(node).resolve(
        node.loggingConfiguration
      );
      if (loggingConfiguration == undefined) {
        return false;
      }
      const level = resolveIfPrimitive(node, loggingConfiguration.level);
      if (level == undefined || level != LogLevel.ALL) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);
