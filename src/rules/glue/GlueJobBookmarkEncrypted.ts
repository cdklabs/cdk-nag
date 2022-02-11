/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnJob, CfnSecurityConfiguration } from 'aws-cdk-lib/aws-glue';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Glue job bookmarks have encryption at rest enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnJob) {
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
 * Helper function to check whether the referenced Security Configuration encrypts job bookmarks
 * @param node the CfnSecurityConfiguration to check
 * @param securityConfigurationId the Cfn Logical ID of the security configuration
 * returns whether the CfnSecurityConfiguration encrypts job bookmarks
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
    const encryptionConfiguration = Stack.of(node).resolve(
      node.encryptionConfiguration
    );
    const jobBookmarksEncryption =
      encryptionConfiguration.jobBookmarksEncryption;
    if (jobBookmarksEncryption !== undefined) {
      const jobBookmarksEncryptionMode = NagRules.resolveIfPrimitive(
        node,
        jobBookmarksEncryption.jobBookmarksEncryptionMode
      );
      if (jobBookmarksEncryptionMode === 'CSE-KMS') {
        return true;
      }
    }
  }
  return false;
}
