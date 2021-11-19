/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnStage } from 'aws-cdk-lib/aws-apigateway';

/**
 * All methods in API Gateway stages have caching enabled and encrypted
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
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
  },
  'name',
  { value: parse(__filename).name }
);
