/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnWorkGroup } from '@aws-cdk/aws-athena';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive, NagRuleCompliance } from '../../nag-pack';

/**
 * Athena workgroups encrypt query results
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnWorkGroup) {
      const workGroupConfiguration = Stack.of(node).resolve(
        node.workGroupConfiguration
      );
      if (workGroupConfiguration == undefined) {
        const workGroupConfigurationUpdates = Stack.of(node).resolve(
          node.workGroupConfigurationUpdates
        );
        if (workGroupConfigurationUpdates == undefined) {
          return NagRuleCompliance.NON_COMPLIANT;
        }
        const resultConfigurationUpdates = Stack.of(node).resolve(
          workGroupConfigurationUpdates.resultConfigurationUpdates
        );
        if (resultConfigurationUpdates != undefined) {
          const removeEncryptionConfiguration = resolveIfPrimitive(
            node,
            resultConfigurationUpdates.removeEncryptionConfiguration
          );
          const encryptionConfiguration = Stack.of(node).resolve(
            resultConfigurationUpdates.encryptionConfiguration
          );
          const enforceWorkGroupConfiguration = resolveIfPrimitive(
            node,
            workGroupConfigurationUpdates.enforceWorkGroupConfiguration
          );
          if (
            removeEncryptionConfiguration &&
            encryptionConfiguration == undefined
          ) {
            return NagRuleCompliance.NON_COMPLIANT;
          } else if (
            encryptionConfiguration != undefined &&
            !enforceWorkGroupConfiguration
          ) {
            return NagRuleCompliance.NON_COMPLIANT;
          }
        }
      } else {
        const enforceWorkGroupConfiguration = resolveIfPrimitive(
          node,
          workGroupConfiguration.enforceWorkGroupConfiguration
        );
        if (!enforceWorkGroupConfiguration) {
          return NagRuleCompliance.NON_COMPLIANT;
        }
        const resultConfiguration = Stack.of(node).resolve(
          workGroupConfiguration.resultConfiguration
        );

        if (resultConfiguration == undefined) {
          return NagRuleCompliance.NON_COMPLIANT;
        }
        const encryptionConfiguration = Stack.of(node).resolve(
          resultConfiguration.encryptionConfiguration
        );

        if (encryptionConfiguration == undefined) {
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
