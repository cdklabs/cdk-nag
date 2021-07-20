/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDomain } from '@aws-cdk/aws-elasticsearch';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * ES domains have node-to-node encryption enabled
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnDomain) {
    const nodeToNodeEncryptionOptions = Stack.of(node).resolve(
      node.nodeToNodeEncryptionOptions,
    );
    if (nodeToNodeEncryptionOptions == undefined) {
      return false;
    }
    const enabled = Stack.of(node).resolve(nodeToNodeEncryptionOptions.enabled);
    if (!enabled) {
      return false;
    }
  }
  return true;
}
