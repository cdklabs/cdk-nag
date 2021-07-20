/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDomain } from '@aws-cdk/aws-elasticsearch';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * ES domains minimally publish SEARCH_SLOW_LOGS and INDEX_SLOW_LOGS to CloudWatch Logs
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnDomain) {
    const logPublishingOptions = Stack.of(node).resolve(
      node.logPublishingOptions,
    );
    if (logPublishingOptions == undefined) {
      return false;
    }
    const requiredSlowLogs = [
      logPublishingOptions?.SEARCH_SLOW_LOGS,
      logPublishingOptions?.INDEX_SLOW_LOGS,
    ];
    for (const log of requiredSlowLogs) {
      const resolvedLog = Stack.of(node).resolve(log);
      if (resolvedLog == undefined) {
        return false;
      }
      const enabled = Stack.of(node).resolve(resolvedLog.enabled);
      if (!enabled) {
        return false;
      }
    }
  }
  return true;
}
