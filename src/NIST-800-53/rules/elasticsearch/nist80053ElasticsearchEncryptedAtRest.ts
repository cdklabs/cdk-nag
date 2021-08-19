/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnDomain } from '@aws-cdk/aws-elasticsearch';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Elasticsearch service domains have encryption at rest enabled - (Control IDs: SC-13, SC-28)
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnDomain) {
    //Is the encryption at rest property set?
    const encryptionAtRestOptions = Stack.of(node).resolve(
      node.encryptionAtRestOptions
    );
    if (encryptionAtRestOptions != undefined) {
      if (
        encryptionAtRestOptions.enabled == undefined ||
        encryptionAtRestOptions.enabled == false
      ) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}
