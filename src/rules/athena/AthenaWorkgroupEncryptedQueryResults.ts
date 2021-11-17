/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnWorkGroup } from '@aws-cdk/aws-athena';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * Athena workgroups encrypt query results
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnWorkGroup) {
      const workGroupConfiguration = Stack.of(node).resolve(
        node.workGroupConfiguration
      );
      if (workGroupConfiguration == undefined) {
        const workGroupConfigurationUpdates = Stack.of(node).resolve(
          node.workGroupConfigurationUpdates
        );
        if (workGroupConfigurationUpdates == undefined) {
          return false;
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
            return false;
          } else if (
            encryptionConfiguration != undefined &&
            !enforceWorkGroupConfiguration
          ) {
            return false;
          }
        }
      } else {
        const enforceWorkGroupConfiguration = resolveIfPrimitive(
          node,
          workGroupConfiguration.enforceWorkGroupConfiguration
        );
        if (!enforceWorkGroupConfiguration) {
          return false;
        }
        const resultConfiguration = Stack.of(node).resolve(
          workGroupConfiguration.resultConfiguration
        );

        if (resultConfiguration == undefined) {
          return false;
        }
        const encryptionConfiguration = Stack.of(node).resolve(
          resultConfiguration.encryptionConfiguration
        );

        if (encryptionConfiguration == undefined) {
          return false;
        }
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);
