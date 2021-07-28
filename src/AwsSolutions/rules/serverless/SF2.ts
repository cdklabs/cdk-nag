/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnStateMachine } from '@aws-cdk/aws-stepfunctions';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Step Function have X-Ray tracing enabled
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnStateMachine) {
    const tracingConfiguration = Stack.of(node).resolve(
      node.tracingConfiguration
    );
    if (tracingConfiguration == undefined) {
      return false;
    }
    const enabled = Stack.of(node).resolve(tracingConfiguration.enabled);
    if (!enabled) {
      return false;
    }
  }
  return true;
}
