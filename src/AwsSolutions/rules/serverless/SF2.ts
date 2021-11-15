/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnStateMachine } from '@aws-cdk/aws-stepfunctions';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * Step Function have X-Ray tracing enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnStateMachine) {
      const tracingConfiguration = Stack.of(node).resolve(
        node.tracingConfiguration
      );
      if (tracingConfiguration == undefined) {
        return false;
      }
      const enabled = resolveIfPrimitive(node, tracingConfiguration.enabled);
      if (!enabled) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);
