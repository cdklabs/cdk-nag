/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnStage } from '@aws-cdk/aws-apigateway';
import { IConstruct } from '@aws-cdk/core';

/**
 * API Gateway REST API stages are configured with SSL certificates - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(1), 164.312(e)(2)(i), 164.312(e)(2)(ii))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnStage) {
    if (node.clientCertificateId == undefined) {
      return false;
    }
  }
  return true;
}
