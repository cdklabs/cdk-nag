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

// CfnLaunchConfiguration

// Check to see if the EC2 Istance is configured with a launch profile
//Ec2imdsv2

/**
 * Determine if the EC2 Instance has a launch profile
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnInstance) {
      // to use imdsv2 there must be a launchtemplate.
      if (node.launchTemplate == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }

      // find the launchTemplate
      let instanceLaunchTemplate = Stack.of(node).resolve(node.launchTemplate);

      // find the launchTemplate by name or Id, and see if its got httpTokens set as 'required'
      for (const child of Stack.of(node).node.findAll()) {
        if (child instanceof CfnLaunchTemplate) {
          if (
            isMatchingLaunchTemplate(
              child,
              instanceLaunchTemplate.launchTemplateName,
              instanceLaunchTemplate.launchTemplateId
            ) &&
            hasHttpTokens(child)
          ) {
            return NagRuleCompliance.COMPLIANT;
          }
        }
      }
      return NagRuleCompliance.NON_COMPLIANT;
    } else if (node instanceof CfnAutoScalingGroup) {
      if (node.launchTemplate) {
        let nodeLaunchTemplate = Stack.of(node).resolve(node.launchTemplate);

        for (const child of Stack.of(node).node.findAll()) {
          if (child instanceof CfnLaunchTemplate) {
            if (
              isMatchingLaunchTemplate(
                child,
                nodeLaunchTemplate.launchTemplateName,
                nodeLaunchTemplate.launchTemplateId
              ) &&
              hasHttpTokens(child)
            ) {
              return NagRuleCompliance.COMPLIANT;
            }
          }
        }
      } // end of check on launchTemplate

      // an ASG may use a a LaunchConfiguration
      else if (node.launchConfigurationName) {
        let nodeLaunchConfigurationName = Stack.of(node).resolve(
          node.launchConfigurationName
        );

        for (const child of Stack.of(node).node.findAll()) {
          if (child instanceof CfnLaunchConfiguration) {
            if (
              child.launchConfigurationName === nodeLaunchConfigurationName &&
              launchConfigurationhasTokens(child)
            ) {
              return NagRuleCompliance.COMPLIANT;
            }
          }
        }
      } /// end of checking LaunchConfiguration

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
    launchTemplateId === NagRules.resolveResourceFromInstrinsic(node, node.ref)
  );
}

function hasHttpTokens(node: CfnLaunchTemplate): boolean {
  const launchTemplateData: CfnLaunchTemplate.LaunchTemplateDataProperty =
    Stack.of(node).resolve(node.launchTemplateData);
  const meta = Stack.of(node).resolve(
    launchTemplateData.metadataOptions
  ) as CfnLaunchTemplate.MetadataOptionsProperty;

  if (meta == undefined) {
    return false;
  }

  if (meta.httpTokens === 'required') {
    return true;
  }
  return false;
}

function launchConfigurationhasTokens(node: CfnLaunchConfiguration): boolean {
  if (node.metadataOptions != undefined) {
    const meta: CfnLaunchTemplate.MetadataOptionsProperty = Stack.of(
      node
    ).resolve(
      node.metadataOptions
    ) as CfnLaunchTemplate.MetadataOptionsProperty;

    if (meta.httpTokens === 'required') {
      return true;
    }
  }
  return false;
}
