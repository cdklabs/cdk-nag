/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnDomain } from '@aws-cdk/aws-elasticsearch';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Elasticsearch service domains are node to node encrypted - (Control IDs: SC-7, SC-8, SC-8(1))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnDomain) {
    //Is the node to node encryption property set?
    const encryptedNodeToNode = Stack.of(node).resolve(node.nodeToNodeEncryptionOptions);
    if (encryptedNodeToNode != undefined) {
     if (encryptedNodeToNode.Enabled == undefined || encryptedNodeToNode.Enabled == false){
      return false;
     }
    }
    else{
      return false;
    }
  }
  return true;
}
