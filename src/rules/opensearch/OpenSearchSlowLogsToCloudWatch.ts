/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnDomain as LegacyCfnDomain } from 'aws-cdk-lib/aws-elasticsearch';
import { CfnDomain } from 'aws-cdk-lib/aws-opensearchservice';
import {
  NagRuleCompliance,
  NagRuleFindings,
  NagRuleResult,
  NagRules,
} from '../../nag-rules';

/**
 * OpenSearch Service domains minimally publish SEARCH_SLOW_LOGS and INDEX_SLOW_LOGS to CloudWatch Logs
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleResult => {
    if (node instanceof LegacyCfnDomain || node instanceof CfnDomain) {
      const logPublishingOptions = Stack.of(node).resolve(
        node.logPublishingOptions
      );
      const requiredSlowLogs = ['SEARCH_SLOW_LOGS', 'INDEX_SLOW_LOGS'];
      const findings: NagRuleFindings = [];
      for (const log of requiredSlowLogs) {
        const resolvedLog = Stack.of(node).resolve(logPublishingOptions?.[log]);
        const enabled = NagRules.resolveIfPrimitive(node, resolvedLog?.enabled);
        if (!enabled) {
          findings.push(`LogExport::${log}`);
        }
      }
      return findings.length ? findings : NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);
