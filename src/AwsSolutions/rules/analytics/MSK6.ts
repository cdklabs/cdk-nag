/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster } from '@aws-cdk/aws-msk';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * MSK clusters send broker logs to a supported destination
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnCluster) {
    const loggingInfo = Stack.of(node).resolve(node.loggingInfo);
    if (loggingInfo == undefined) {
      return false;
    }
    const resolvedBrokerLogs = Stack.of(node).resolve(loggingInfo.brokerLogs);
    let enabled = false;
    const s3 = Stack.of(node).resolve(resolvedBrokerLogs.s3);
    if (s3 != undefined) {
      const s3Enabled = Stack.of(node).resolve(s3.enabled);
      if (s3Enabled) {
        enabled = true;
      }
    }
    const cloudWatchLogs = Stack.of(node).resolve(
      resolvedBrokerLogs.cloudWatchLogs,
    );
    if (cloudWatchLogs != undefined) {
      const cloudWatchLogsEnabled = Stack.of(node).resolve(
        cloudWatchLogs.enabled,
      );
      if (cloudWatchLogsEnabled) {
        enabled = true;
      }
    }
    const firehose = Stack.of(node).resolve(resolvedBrokerLogs.firehose);
    if (firehose != undefined) {
      const firehoseEnabled = Stack.of(node).resolve(firehose.enabled);
      if (firehoseEnabled) {
        enabled = true;
      }
    }
    if (!enabled) {
      return false;
    }
  }
  return true;
}
