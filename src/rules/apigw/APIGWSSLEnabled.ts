/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnStage } from '@aws-cdk/aws-apigateway';
import { CfnResource } from '@aws-cdk/core';

/**
 * API Gateway REST API stages are configured with SSL certificates
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnStage) {
      if (node.clientCertificateId == undefined) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);
