/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnMethod } from 'aws-cdk-lib/aws-apigateway';

/**
 * Rest API methods use Cognito User Pool Authorizers
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnMethod) {
      if (node.authorizationType !== 'COGNITO_USER_POOLS') {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);
