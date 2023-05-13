/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnLaunchConfiguration } from 'aws-cdk-lib/aws-autoscaling';
import { CfnLaunchTemplate, CfnVolume, CfnInstance } from 'aws-cdk-lib/aws-ec2';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * EBS volumes have encryption enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnVolume) {
      const encryption = NagRules.resolveIfPrimitive(node, node.encrypted);
      if (encryption !== true) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else if (node instanceof CfnLaunchTemplate) {
      const launchTemplateData = Stack.of(node).resolve(
        node.launchTemplateData
      );
      if (launchTemplateData.blockDeviceMappings == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      } else {
        const blockDeviceMappings = Stack.of(node).resolve(
          launchTemplateData.blockDeviceMappings
        );
        for (const blockDeviceMapping of blockDeviceMappings) {
          const encryption = NagRules.resolveIfPrimitive(
            node,
            blockDeviceMapping.ebs.encrypted
          );
          if (encryption !== true) {
            return NagRuleCompliance.NON_COMPLIANT;
          }
        }
        return NagRuleCompliance.COMPLIANT;
      }
    } else if (node instanceof CfnInstance) {
      const blockDeviceMappings = Stack.of(node).resolve(
        node.blockDeviceMappings
      );
      if (blockDeviceMappings == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      } else {
        for (const blockDeviceMapping of blockDeviceMappings) {
          const encryption = NagRules.resolveIfPrimitive(
            node,
            blockDeviceMapping.ebs.encrypted
          );
          if (encryption !== true) {
            return NagRuleCompliance.NON_COMPLIANT;
          }
        }
      }
      return NagRuleCompliance.COMPLIANT;
    } else if (node instanceof CfnLaunchConfiguration) {
      const blockDeviceMappings = Stack.of(node).resolve(
        node.blockDeviceMappings
      );
      if (blockDeviceMappings == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      } else {
        for (const blockDeviceMapping of blockDeviceMappings) {
          const encryption = NagRules.resolveIfPrimitive(
            node,
            blockDeviceMapping.ebs.encrypted
          );
          if (encryption !== true) {
            return NagRuleCompliance.NON_COMPLIANT;
          }
        }
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);
