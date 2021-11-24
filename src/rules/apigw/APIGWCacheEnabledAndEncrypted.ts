/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnStage } from '@aws-cdk/aws-apigateway';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance } from '../../nag-pack';

/**
 * All methods in API Gateway stages have caching enabled and encrypted
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnStage) {
      if (node.methodSettings == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
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
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);
