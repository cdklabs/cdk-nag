/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnStage, MethodLoggingLevel } from 'aws-cdk-lib/aws-apigateway';

/**
 * API Gateway stages have logging enabled
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
  },
  'name',
  { value: parse(__filename).name }
);
