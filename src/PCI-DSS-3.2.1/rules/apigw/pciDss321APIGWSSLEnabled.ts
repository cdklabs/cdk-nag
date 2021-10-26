/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnStage } from '@aws-cdk/aws-apigateway';
import { CfnResource } from '@aws-cdk/core';

/**
 * API Gateway REST API stages are configured with SSL certificates - (Control IDs: 2.3, 4.1, 8.2.1)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnStage) {
    if (node.clientCertificateId == undefined) {
      return false;
    }
  }
  return true;
}
