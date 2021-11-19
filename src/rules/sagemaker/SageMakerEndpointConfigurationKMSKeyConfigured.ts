/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnEndpointConfig } from 'aws-cdk-lib/aws-sagemaker';

/**
 * SageMaker endpoints utilize a KMS key
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnEndpointConfig) {
      //Does this endpoint have a KMS key ID?
      const kmsKey = Stack.of(node).resolve(node.kmsKeyId);
      if (kmsKey == undefined) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);
