/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnDomain as LegacyCfnDomain } from '@aws-cdk/aws-elasticsearch';
import { CfnDomain } from '@aws-cdk/aws-opensearchservice';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * OpenSearch Service domains have encryption at rest enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof LegacyCfnDomain || node instanceof CfnDomain) {
      const encryptionAtRestOptions = Stack.of(node).resolve(
        node.encryptionAtRestOptions
      );
      if (encryptionAtRestOptions !== undefined) {
        const enabled = resolveIfPrimitive(
          node,
          encryptionAtRestOptions.enabled
        );
        if (enabled !== true) {
          return false;
        }
      } else {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);
