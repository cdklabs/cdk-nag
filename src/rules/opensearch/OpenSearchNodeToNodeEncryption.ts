/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnDomain as LegacyCfnDomain } from 'aws-cdk-lib/aws-elasticsearch';
import { CfnDomain } from 'aws-cdk-lib/aws-opensearchservice';
import { NagRuleCompliance, resolveIfPrimitive } from '../../nag-pack';

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
        const enabled = resolveIfPrimitive(node, encryptedNodeToNode.enabled);
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
