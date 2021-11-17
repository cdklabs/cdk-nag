/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnStage } from '@aws-cdk/aws-apigateway';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../nag-pack';
/**
 * API Gateway REST API stages have X-Ray tracing enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnStage) {
      const tracingEnabled = resolveIfPrimitive(node, node.tracingEnabled);
      if (tracingEnabled !== true) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);
