/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDomain } from '@aws-cdk/aws-elasticsearch';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * ES domains have encryption at rest enabled
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnDomain) {
    const encryptionAtRestOptions = Stack.of(node).resolve(
      node.encryptionAtRestOptions
    );
    if (encryptionAtRestOptions == undefined) {
      return false;
    }
    const enabled = Stack.of(node).resolve(encryptionAtRestOptions.enabled);
    if (!enabled) {
      return false;
    }
  }
  return true;
}
