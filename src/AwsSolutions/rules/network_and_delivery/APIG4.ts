/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { AuthorizationType, CfnMethod } from '@aws-cdk/aws-apigateway';
import { CfnRoute } from '@aws-cdk/aws-apigatewayv2';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * APIs implement authorization
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnMethod || node instanceof CfnRoute) {
    if (
      node.authorizationType == undefined ||
      Stack.of(node).resolve(node.authorizationType) == AuthorizationType.NONE
    ) {
      return false;
    }
  }
  return true;
}
