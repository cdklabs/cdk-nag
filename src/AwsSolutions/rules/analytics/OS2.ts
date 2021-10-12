/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDomain as LegacyCfnDomain } from '@aws-cdk/aws-elasticsearch';
import { CfnDomain } from '@aws-cdk/aws-opensearchservice';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';

/**
 * OpenSearch Service domains have node-to-node encryption enabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof LegacyCfnDomain || node instanceof CfnDomain) {
    const nodeToNodeEncryptionOptions = Stack.of(node).resolve(
      node.nodeToNodeEncryptionOptions
    );
    if (nodeToNodeEncryptionOptions == undefined) {
      return false;
    }
    const enabled = resolveIfPrimitive(
      node,
      nodeToNodeEncryptionOptions.enabled
    );
    if (!enabled) {
      return false;
    }
  }
  return true;
}
