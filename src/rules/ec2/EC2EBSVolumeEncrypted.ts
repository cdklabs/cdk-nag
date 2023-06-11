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
    } else if (node instanceof CfnInstance) {
      const blockDeviceMappings = Stack.of(node).resolve(
        node.blockDeviceMappings
      );
      if (blockDeviceMappings !== undefined) {
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

      const instanceLaunchTemplate = Stack.of(node).resolve(
        node.launchTemplate
      );
      for (const child of Stack.of(node).node.findAll()) {
        if (child instanceof CfnLaunchTemplate) {
          if (
            isMatchingLaunchTemplate(
              child,
              instanceLaunchTemplate.launchTemplateName,
              instanceLaunchTemplate.launchTemplateId
            )
          ) {
            const launchTemplateData = Stack.of(node).resolve(
              child.launchTemplateData
            );
            if (launchTemplateData.blockDeviceMappings == undefined) {
              return NagRuleCompliance.NON_COMPLIANT;
            } else {
              const launchTemplateBlockDeviceMappings = Stack.of(child).resolve(
                launchTemplateData.blockDeviceMappings
              );
              for (const blockDeviceMapping of launchTemplateBlockDeviceMappings) {
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
          }
        }
      }
      return NagRuleCompliance.NON_COMPLIANT;
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

function isMatchingLaunchTemplate(
  node: CfnLaunchTemplate,
  launchTemplateName?: string | undefined,
  launchTemplateId?: string | undefined
): boolean {
  return (
    launchTemplateName === node.launchTemplateName ||
    launchTemplateId === NagRules.resolveResourceFromInstrinsic(node, node.ref)
  );
}
