/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnSecret } from 'aws-cdk-lib/aws-secretsmanager';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * Secrets are encrypted with KMS Customer managed keys
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnSecret) {
      const kmsKeyId = resolveIfPrimitive(node, node.kmsKeyId);
      if (kmsKeyId === undefined || kmsKeyId === 'aws/secretsmanager') {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);
