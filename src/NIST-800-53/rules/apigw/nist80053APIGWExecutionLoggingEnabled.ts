/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnStage, MethodLoggingLevel } from '@aws-cdk/aws-apigateway';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * The API Gateway stage does not have logging enabled. - (Control IDs: AU-2(a)(d), AU-3, AU-12(a)(c))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
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
