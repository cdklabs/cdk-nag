/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnApplicationV2 } from '@aws-cdk/aws-kinesisanalytics';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * Kinesis Data Analytics Flink Applications have checkpointing enabled
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
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
      if (checkpointConfiguration.configurationType == 'CUSTOM') {
        const enabled = Stack.of(node).resolve(
          checkpointConfiguration.checkpointingEnabled
        );
        if (!enabled) {
          return false;
        }
      }
    }
  }
  return true;
}
