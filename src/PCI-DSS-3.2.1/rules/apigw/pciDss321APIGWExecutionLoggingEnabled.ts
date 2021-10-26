/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnStage, MethodLoggingLevel } from '@aws-cdk/aws-apigateway';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * API Gateway stages have logging enabled - (Control IDs: 10.1, 10.3.1, 10.3.2, 10.3.3, 10.3.4, 10.3.5, 10.3.6, 10.5.4)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnStage) {
    if (node.methodSettings == undefined) {
      return false;
    }
    const methodSettings = Stack.of(node).resolve(node.methodSettings);
    let found = false;
    for (const setting of methodSettings) {
      const resolvedSetting = Stack.of(node).resolve(setting);
      if (
        resolvedSetting?.httpMethod == '*' &&
        resolvedSetting?.resourcePath == '/*' &&
        (resolvedSetting?.loggingLevel == MethodLoggingLevel.ERROR ||
          resolvedSetting?.loggingLevel == MethodLoggingLevel.INFO)
      ) {
        found = true;
        break;
      }
    }
    if (!found) {
      return false;
    }
  }
  return true;
}
