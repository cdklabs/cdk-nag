/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnCluster } from '@aws-cdk/aws-msk';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * MSK clusters send broker logs to a supported destination
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnCluster) {
      const loggingInfo = Stack.of(node).resolve(node.loggingInfo);
      if (loggingInfo == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const resolvedBrokerLogs = Stack.of(node).resolve(loggingInfo.brokerLogs);
      let enabled = false;
      const s3 = Stack.of(node).resolve(resolvedBrokerLogs.s3);
      if (s3 != undefined) {
        const s3Enabled = NagRules.resolveIfPrimitive(node, s3.enabled);
        if (s3Enabled) {
          enabled = true;
        }
      }
      const cloudWatchLogs = Stack.of(node).resolve(
        resolvedBrokerLogs.cloudWatchLogs
      );
      if (cloudWatchLogs != undefined) {
        const cloudWatchLogsEnabled = NagRules.resolveIfPrimitive(
          node,
          cloudWatchLogs.enabled
        );
        if (cloudWatchLogsEnabled) {
          enabled = true;
        }
      }
      const firehose = Stack.of(node).resolve(resolvedBrokerLogs.firehose);
      if (firehose != undefined) {
        const firehoseEnabled = NagRules.resolveIfPrimitive(
          node,
          firehose.enabled
        );
        if (firehoseEnabled) {
          enabled = true;
        }
      }
      if (!enabled) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);
