/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnDomain as LegacyCfnDomain } from '@aws-cdk/aws-elasticsearch';
import { CfnDomain } from '@aws-cdk/aws-opensearchservice';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * OpenSearch Service domains are node-to-node encrypted
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof LegacyCfnDomain || node instanceof CfnDomain) {
      const encryptedNodeToNode = Stack.of(node).resolve(
        node.nodeToNodeEncryptionOptions
      );
      if (encryptedNodeToNode != undefined) {
        const enabled = NagRules.resolveIfPrimitive(
          node,
          encryptedNodeToNode.enabled
        );
        if (enabled !== true) {
          return NagRuleCompliance.NON_COMPLIANT;
        }
      } else {
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
