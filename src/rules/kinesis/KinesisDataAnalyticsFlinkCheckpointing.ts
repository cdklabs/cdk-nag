/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnApplicationV2 } from '@aws-cdk/aws-kinesisanalytics';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * Kinesis Data Analytics Flink Applications have checkpointing enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnApplicationV2) {
      if (node.runtimeEnvironment.toLowerCase().startsWith('flink')) {
        const applicationConfiguration = Stack.of(node).resolve(
          node.applicationConfiguration
        );
        if (applicationConfiguration == undefined) {
          return false;
        }
        const flinkApplicationConfiguration = Stack.of(node).resolve(
          applicationConfiguration.flinkApplicationConfiguration
        );
        if (flinkApplicationConfiguration == undefined) {
          return false;
        }
        const checkpointConfiguration = Stack.of(node).resolve(
          flinkApplicationConfiguration.checkpointConfiguration
        );
        if (checkpointConfiguration == undefined) {
          return false;
        }
        if (
          resolveIfPrimitive(node, checkpointConfiguration.configurationType) ==
          'CUSTOM'
        ) {
          const enabled = resolveIfPrimitive(
            node,
            checkpointConfiguration.checkpointingEnabled
          );
          if (!enabled) {
            return false;
          }
        }
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);
