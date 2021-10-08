/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnStage } from '@aws-cdk/aws-apigateway';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';
/**
 * API Gateway REST API stages have X-Ray tracing enabled - (Control IDs: 164.312(b))
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnStage) {
    const tracingEnabled = resolveIfPrimitive(node, node.tracingEnabled);
    if (tracingEnabled !== true) {
      return false;
    }
  }
  return true;
}
