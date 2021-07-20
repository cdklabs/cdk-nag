/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnWorkGroup } from '@aws-cdk/aws-athena';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Athena workgroups encrypt query results
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnWorkGroup) {
    const workGroupConfiguration = Stack.of(node).resolve(
      node.workGroupConfiguration,
    );
    if (workGroupConfiguration == undefined) {
      const workGroupConfigurationUpdates = Stack.of(node).resolve(
        node.workGroupConfigurationUpdates,
      );
      if (workGroupConfigurationUpdates == undefined) {
        return false;
      }
      const resultConfigurationUpdates = Stack.of(node).resolve(
        workGroupConfigurationUpdates.resultConfigurationUpdates,
      );
      if (resultConfigurationUpdates != undefined) {
        const removeEncryptionConfiguration = Stack.of(node).resolve(
          resultConfigurationUpdates.removeEncryptionConfiguration,
        );
        const encryptionConfiguration = Stack.of(node).resolve(
          resultConfigurationUpdates.encryptionConfiguration,
        );
        const enforceWorkGroupConfiguration = Stack.of(node).resolve(
          workGroupConfigurationUpdates.enforceWorkGroupConfiguration,
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
      const enforceWorkGroupConfiguration = Stack.of(node).resolve(
        workGroupConfiguration.enforceWorkGroupConfiguration,
      );
      if (!enforceWorkGroupConfiguration) {
        return false;
      }
      const resultConfiguration = Stack.of(node).resolve(
        workGroupConfiguration.resultConfiguration,
      );
      if (resultConfiguration == undefined) {
        return false;
      }
      const encryptionConfiguration = Stack.of(node).resolve(
        resultConfiguration.encryptionConfiguration,
      );
      if (encryptionConfiguration == undefined) {
        return false;
      }
    }
  }
  return true;
}
