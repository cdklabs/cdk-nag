/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnStage } from 'aws-cdk-lib/aws-apigateway';
import { CfnStage as CfnV2Stage } from 'aws-cdk-lib/aws-apigatewayv2';

/**
 * APIs have access logging enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnStage) {
      if (node.accessLogSetting == undefined) {
        return false;
      }
      const accessLogSetting = Stack.of(node).resolve(node.accessLogSetting);
      if (
        accessLogSetting.destinationArn == undefined ||
        accessLogSetting.format == undefined
      ) {
        return false;
      }
    } else if (node instanceof CfnV2Stage) {
      if (node.accessLogSettings == undefined) {
        return false;
      }
      const accessLogSetting = Stack.of(node).resolve(node.accessLogSettings);
      if (
        accessLogSetting.destinationArn == undefined ||
        accessLogSetting.format == undefined
      ) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);
