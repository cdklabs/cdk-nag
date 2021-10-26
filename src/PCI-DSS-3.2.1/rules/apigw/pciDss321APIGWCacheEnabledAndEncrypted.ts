/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnStage } from '@aws-cdk/aws-apigateway';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * All methods in API Gateway stages have caching enabled and encrypted - (Control ID: 3.4)
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
        resolvedSetting?.cacheDataEncrypted &&
        resolvedSetting?.cachingEnabled
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
