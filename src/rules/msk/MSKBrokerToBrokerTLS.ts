/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnCluster } from '@aws-cdk/aws-msk';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * MSK clusters use TLS communication between brokers
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnCluster) {
      const encryptionInfo = Stack.of(node).resolve(node.encryptionInfo);
      if (encryptionInfo != undefined) {
        const encryptionInTransit = Stack.of(node).resolve(
          encryptionInfo.encryptionInTransit
        );
        if (encryptionInTransit != undefined) {
          const inCluster = NagRules.resolveIfPrimitive(
            node,
            encryptionInTransit.inCluster
          );
          if (inCluster === false) {
            return NagRuleCompliance.NON_COMPLIANT;
          }
        }
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);
