/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDomain as LegacyCfnDomain } from '@aws-cdk/aws-elasticsearch';
import { CfnDomain } from '@aws-cdk/aws-opensearchservice';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * OpenSearch Service domains minimally publish SEARCH_SLOW_LOGS and INDEX_SLOW_LOGS to CloudWatch Logs
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof LegacyCfnDomain || node instanceof CfnDomain) {
    const logPublishingOptions = Stack.of(node).resolve(
      node.logPublishingOptions
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
      const enabled = resolveIfPrimitive(node, resolvedLog.enabled);
      if (!enabled) {
        return false;
      }
    }
  }
  return true;
}
