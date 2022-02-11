/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import {
  CfnCrawler,
  CfnJob,
  CfnSecurityConfiguration,
} from '@aws-cdk/aws-glue';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Glue crawlers and jobs have CloudWatch Log encryption enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnCrawler || node instanceof CfnJob) {
      let securityConfigurationId;
      if (node instanceof CfnCrawler) {
        securityConfigurationId = NagRules.resolveResourceFromInstrinsic(
          node,
          node.crawlerSecurityConfiguration
        );
      } else {
        securityConfigurationId = NagRules.resolveResourceFromInstrinsic(
          node,
          node.securityConfiguration
        );
      }
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
 * Helper function to check whether the referenced Security Configuration encrypts CloudWatch Logs
 * @param node the CfnSecurityConfiguration to check
 * @param securityConfigurationId the Cfn Logical ID of the security configuration
 * returns whether the CfnSecurityConfiguration encrypts CloudWatch Logs
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
    const cloudWatchEncryption = encryptionConfiguration.cloudWatchEncryption;
    if (cloudWatchEncryption !== undefined) {
      const cloudWatchEncryptionMode = NagRules.resolveIfPrimitive(
        node,
        cloudWatchEncryption.cloudWatchEncryptionMode
      );
      if (cloudWatchEncryptionMode === 'SSE-KMS') {
        return true;
      }
    }
  }
  return false;
}
