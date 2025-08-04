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
import { CfnInstance, CfnLaunchTemplate } from 'aws-cdk-lib/aws-ec2';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * The EC2 Instance requires IMDsv2
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnInstance) {
      if (node.launchTemplate === undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const instanceLaunchTemplate = Stack.of(node).resolve(
        node.launchTemplate
      );
      for (const child of Stack.of(node).node.findAll()) {
        if (child instanceof CfnLaunchTemplate) {
          if (
            isMatchingLaunchTemplate(
              child,
              NagRules.resolveResourceFromIntrinsic(
                node,
                instanceLaunchTemplate.launchTemplateName
              ),
              NagRules.resolveResourceFromIntrinsic(
                node,
                instanceLaunchTemplate.launchTemplateId
              )
            )
          ) {
            return hasHttpTokens(child)
              ? NagRuleCompliance.COMPLIANT
              : NagRuleCompliance.NON_COMPLIANT;
          }
        }
      }
      return NagRuleCompliance.NON_COMPLIANT;
    } else if (node instanceof CfnAutoScalingGroup) {
      if (node.launchTemplate) {
        const nodeLaunchTemplate = Stack.of(node).resolve(node.launchTemplate);
        for (const child of Stack.of(node).node.findAll()) {
          if (child instanceof CfnLaunchTemplate) {
            if (
              isMatchingLaunchTemplate(
                child,
                NagRules.resolveResourceFromIntrinsic(
                  node,
                  nodeLaunchTemplate.launchTemplateName
                ),
                NagRules.resolveResourceFromIntrinsic(
                  node,
                  nodeLaunchTemplate.launchTemplateId
                )
              )
            ) {
              return hasHttpTokens(child)
                ? NagRuleCompliance.COMPLIANT
                : NagRuleCompliance.NON_COMPLIANT;
            }
          }
        }
      } else if (node.launchConfigurationName) {
        for (const child of Stack.of(node).node.findAll()) {
          if (child instanceof CfnLaunchConfiguration) {
            if (
              isMatchingLaunchConfiguration(child, node.launchConfigurationName)
            ) {
              return hasHttpTokens(child)
                ? NagRuleCompliance.COMPLIANT
                : NagRuleCompliance.NON_COMPLIANT;
            }
          }
        }
      }
      return NagRuleCompliance.NON_COMPLIANT;
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
    launchTemplateId === NagRules.resolveResourceFromIntrinsic(node, node.ref)
  );
}

function isMatchingLaunchConfiguration(
  node: CfnLaunchConfiguration,
  launchConfigurationName?: string | undefined
): boolean {
  return (
    launchConfigurationName === node.launchConfigurationName ||
    NagRules.resolveResourceFromIntrinsic(node, launchConfigurationName) ===
      NagRules.resolveResourceFromIntrinsic(node, node.ref)
  );
}

function hasHttpTokens(
  node: CfnLaunchTemplate | CfnLaunchConfiguration
): boolean {
  let meta;
  if (node instanceof CfnLaunchTemplate) {
    const launchTemplateData = Stack.of(node).resolve(node.launchTemplateData);
    meta = Stack.of(node).resolve(
      launchTemplateData.metadataOptions
    ) as CfnLaunchTemplate.MetadataOptionsProperty;
  } else if (node instanceof CfnLaunchConfiguration) {
    meta = Stack.of(node).resolve(
      node.metadataOptions
    ) as CfnLaunchConfiguration.MetadataOptionsProperty;
  }
  return meta?.httpTokens === 'required';
}
