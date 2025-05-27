/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnDeployment, CfnStage } from 'aws-cdk-lib/aws-apigateway';
import { CfnStage as CfnStageV2 } from 'aws-cdk-lib/aws-apigatewayv2';
import { CfnApi, CfnHttpApi } from 'aws-cdk-lib/aws-sam';
import { NagRuleCompliance } from '../../nag-rules';

const isJSON = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

/**
 * API Gateway logs are configured in JSON format.
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (
      node instanceof CfnApi ||
      node instanceof CfnHttpApi ||
      node instanceof CfnStage
    ) {
      const accessLogSetting = Stack.of(node).resolve(node.accessLogSetting);
      if (!accessLogSetting) {
        return NagRuleCompliance.NOT_APPLICABLE;
      }
      if (isJSON(accessLogSetting.format)) {
        return NagRuleCompliance.COMPLIANT;
      }
      return NagRuleCompliance.NON_COMPLIANT;
    } else if (node instanceof CfnDeployment) {
      const stageDescription = Stack.of(node).resolve(node.stageDescription);
      const accessLogSetting = stageDescription.accessLogSetting;
      if (!accessLogSetting) {
        return NagRuleCompliance.NOT_APPLICABLE;
      }
      if (isJSON(accessLogSetting.format)) {
        return NagRuleCompliance.COMPLIANT;
      }
      return NagRuleCompliance.NON_COMPLIANT;
    } else if (node instanceof CfnStageV2) {
      const accessLogSetting = Stack.of(node).resolve(node.accessLogSettings);
      if (!accessLogSetting) {
        return NagRuleCompliance.NOT_APPLICABLE;
      }
      if (isJSON(accessLogSetting.format)) {
        return NagRuleCompliance.COMPLIANT;
      }
      return NagRuleCompliance.NON_COMPLIANT;
    }
    return NagRuleCompliance.NOT_APPLICABLE;
  },
  'name',
  { value: parse(__filename).name }
);
