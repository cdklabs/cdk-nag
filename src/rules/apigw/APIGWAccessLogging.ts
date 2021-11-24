/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnStage } from 'aws-cdk-lib/aws-apigateway';
import { CfnStage as CfnV2Stage } from 'aws-cdk-lib/aws-apigatewayv2';
import { NagRuleCompliance } from '../../nag-pack';

/**
 * APIs have access logging enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnStage) {
      if (node.accessLogSetting == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const accessLogSetting = Stack.of(node).resolve(node.accessLogSetting);
      if (
        accessLogSetting.destinationArn == undefined ||
        accessLogSetting.format == undefined
      ) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else if (node instanceof CfnV2Stage) {
      if (node.accessLogSettings == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const accessLogSetting = Stack.of(node).resolve(node.accessLogSettings);
      if (
        accessLogSetting.destinationArn == undefined ||
        accessLogSetting.format == undefined
      ) {
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
