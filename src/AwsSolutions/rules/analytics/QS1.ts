/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDataSource } from '@aws-cdk/aws-quicksight';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';

/**
 * Quicksight uses SSL when connecting to a data source
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDataSource) {
    const sslProperties = Stack.of(node).resolve(node.sslProperties);
    if (sslProperties != undefined) {
      const disableSsl = resolveIfPrimitive(node, sslProperties.disableSsl);
      if (disableSsl === true) {
        return false;
      }
    }
  }
  return true;
}
