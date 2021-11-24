/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnDataSource } from '@aws-cdk/aws-quicksight';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Quicksight uses SSL when connecting to a data source
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnDataSource) {
      const sslProperties = Stack.of(node).resolve(node.sslProperties);
      if (sslProperties != undefined) {
        const disableSsl = NagRules.resolveIfPrimitive(
          node,
          sslProperties.disableSsl
        );
        if (disableSsl === true) {
          return NagRuleCompliance.NON_COMPLIANT;
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
