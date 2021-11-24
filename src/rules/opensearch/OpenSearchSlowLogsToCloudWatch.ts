/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnDomain as LegacyCfnDomain } from 'aws-cdk-lib/aws-elasticsearch';
import { CfnDomain } from 'aws-cdk-lib/aws-opensearchservice';
import { NagRuleCompliance, resolveIfPrimitive } from '../../nag-pack';

/**
 * OpenSearch Service domains minimally publish SEARCH_SLOW_LOGS and INDEX_SLOW_LOGS to CloudWatch Logs
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof LegacyCfnDomain || node instanceof CfnDomain) {
      const logPublishingOptions = Stack.of(node).resolve(
        node.logPublishingOptions
      );
      if (logPublishingOptions == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const requiredSlowLogs = [
        logPublishingOptions?.SEARCH_SLOW_LOGS,
        logPublishingOptions?.INDEX_SLOW_LOGS,
      ];
      for (const log of requiredSlowLogs) {
        const resolvedLog = Stack.of(node).resolve(log);
        if (resolvedLog == undefined) {
          return NagRuleCompliance.NON_COMPLIANT;
        }
        const enabled = resolveIfPrimitive(node, resolvedLog.enabled);
        if (!enabled) {
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
