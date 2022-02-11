/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnCluster, CfnSecurityConfiguration } from '@aws-cdk/aws-emr';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * EMR clusters have encryption in transit enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnCluster) {
      const securityConfigurationId = NagRules.resolveResourceFromInstrinsic(
        node,
        node.securityConfiguration
      );
      if (securityConfigurationId == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      let found = false;
      for (const child of Stack.of(node).node.findAll()) {
        if (child instanceof CfnSecurityConfiguration) {
          if (isMatchingSecurityConfig(child, securityConfigurationId)) {
            found = true;
            break;
          }
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

/**
 * Helper function to check whether the referenced Security Configuration specifies encryption in transit
 * @param node the CfnSecurityConfiguration to check
 * @param securityConfigurationId the Cfn Logical ID of the security configuration
 * returns whether the CfnSecurityConfiguration specifies encryption in transit
 */
function isMatchingSecurityConfig(
  node: CfnSecurityConfiguration,
  securityConfigurationId: string
): boolean {
  const resolvedSecurityConfigurationLogicalId =
    NagRules.resolveResourceFromInstrinsic(node, node.ref);
  if (
    resolvedSecurityConfigurationLogicalId === securityConfigurationId ||
    node.name === securityConfigurationId
  ) {
    const securityConfiguration = Stack.of(node).resolve(
      node.securityConfiguration
    );
    const enableInTransitEncryption =
      securityConfiguration?.EnableInTransitEncryption;
    const certificateProviderType =
      securityConfiguration?.InTransitEncryptionConfiguration
        ?.TLSCertificateConfiguration?.CertificateProviderType;
    if (
      enableInTransitEncryption === true &&
      certificateProviderType !== undefined
    ) {
      return true;
    }
  }
  return false;
}
