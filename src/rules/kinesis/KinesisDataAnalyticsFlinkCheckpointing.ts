/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnApplicationV2 } from 'aws-cdk-lib/aws-kinesisanalytics';
import { NagRuleCompliance, resolveIfPrimitive } from '../../nag-pack';

/**
 * Kinesis Data Analytics Flink Applications have checkpointing enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnApplicationV2) {
      if (node.runtimeEnvironment.toLowerCase().startsWith('flink')) {
        const applicationConfiguration = Stack.of(node).resolve(
          node.applicationConfiguration
        );
        if (applicationConfiguration == undefined) {
          return NagRuleCompliance.NON_COMPLIANT;
        }
        const flinkApplicationConfiguration = Stack.of(node).resolve(
          applicationConfiguration.flinkApplicationConfiguration
        );
        if (flinkApplicationConfiguration == undefined) {
          return NagRuleCompliance.NON_COMPLIANT;
        }
        const checkpointConfiguration = Stack.of(node).resolve(
          flinkApplicationConfiguration.checkpointConfiguration
        );
        if (checkpointConfiguration == undefined) {
          return NagRuleCompliance.NON_COMPLIANT;
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
