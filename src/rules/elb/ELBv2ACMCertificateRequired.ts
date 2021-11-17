/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnListener } from '@aws-cdk/aws-elasticloadbalancingv2';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * ALB, NLB, and GLB listeners use ACM-managed certificates
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnListener) {
      const certificates = Stack.of(node).resolve(node.certificates);
      if (certificates == undefined) {
        return false;
      }
      let found = false;
      for (const certificate of certificates) {
        const resolvedCertificate = Stack.of(node).resolve(certificate);
        if (resolvedCertificate.certificateArn != undefined) {
          found = true;
          break;
        }
      }
      if (!found) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);
