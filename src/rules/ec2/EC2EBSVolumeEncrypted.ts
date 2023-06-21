/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import {
  CfnAutoScalingGroup,
  CfnLaunchConfiguration,
} from 'aws-cdk-lib/aws-autoscaling';
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
      const instanceEBSCompliant = InstanceEBSState(node);
      const launchTemplateCompliant = InstanceLaunchTemplateState(node);

      if (
        instanceEBSCompliant === BlockDevicesState.Absent &&
        launchTemplateCompliant === BlockDevicesState.Absent
      ) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      if (
        instanceEBSCompliant === BlockDevicesState.Unencrypted ||
        launchTemplateCompliant === BlockDevicesState.Unencrypted
      ) {
        return NagRuleCompliance.NON_COMPLIANT;
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
    } else if (node instanceof CfnAutoScalingGroup) {
      const launchTemplate = Stack.of(node).resolve(node.launchTemplate);
      if (launchTemplate === undefined) {
        return NagRuleCompliance.NOT_APPLICABLE;
      }
      if (InstanceLaunchTemplateState(node) === BlockDevicesState.Encrypted) {
        return NagRuleCompliance.COMPLIANT;
      }
      return NagRuleCompliance.NON_COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);

enum BlockDevicesState {
  Encrypted,
  Unencrypted,
  Absent,
}

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

function InstanceLaunchTemplateState(
  node: CfnInstance | CfnAutoScalingGroup
): BlockDevicesState {
  const launchTemplate = Stack.of(node).resolve(node.launchTemplate);

  for (const child of Stack.of(node).node.findAll()) {
    if (child instanceof CfnLaunchTemplate) {
      if (
        isMatchingLaunchTemplate(
          child,
          launchTemplate.launchTemplateName,
          launchTemplate.launchTemplateId
        )
      ) {
        const launchTemplateData = Stack.of(node).resolve(
          child.launchTemplateData
        );
        if (
          launchTemplateData.blockDeviceMappings === undefined ||
          launchTemplateData.blockDeviceMappings.length === 0
        ) {
          return BlockDevicesState.Absent;
        } else {
          const launchTemplateBlockDeviceMappings = Stack.of(child).resolve(
            launchTemplateData.blockDeviceMappings
          );
          const devicesAllEncrypted = launchTemplateBlockDeviceMappings.every(
            (blockDeviceMapping: any) => {
              const encryption = NagRules.resolveIfPrimitive(
                node,
                blockDeviceMapping.ebs.encrypted
              );
              return encryption === true;
            }
          );
          return devicesAllEncrypted
            ? BlockDevicesState.Encrypted
            : BlockDevicesState.Unencrypted;
        }
      }
    }
  }
  return BlockDevicesState.Absent;
}

function InstanceEBSState(node: CfnInstance): BlockDevicesState {
  const blockDeviceMappings = Stack.of(node).resolve(node.blockDeviceMappings);

  if (blockDeviceMappings === undefined || blockDeviceMappings.length === 0) {
    return BlockDevicesState.Absent;
  } else {
    const devicesAllEncrypted = blockDeviceMappings.every(
      (blockDeviceMapping: any) => {
        const encryption = NagRules.resolveIfPrimitive(
          node,
          blockDeviceMapping.ebs.encrypted
        );
        return encryption === true;
      }
    );
    return devicesAllEncrypted
      ? BlockDevicesState.Encrypted
      : BlockDevicesState.Unencrypted;
  }
}
