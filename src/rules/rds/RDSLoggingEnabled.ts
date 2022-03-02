/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnDBInstance } from 'aws-cdk-lib/aws-rds';
import {
  NagRuleCompliance,
  NagRuleFindings,
  NagRuleResult,
  NagRules,
} from '../../nag-rules';

/**
 * RDS DB instances are configured to export all possible log types to CloudWatch
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleResult => {
    if (node instanceof CfnDBInstance) {
      const dbType = String(NagRules.resolveIfPrimitive(node, node.engine));
      const exports =
        Stack.of(node).resolve(node.enableCloudwatchLogsExports) ?? [];
      const needed: string[] = [];
      if (dbType.includes('mariadb') || dbType.includes('mysql')) {
        needed.push('audit', 'error', 'general', 'slowquery');
      } else if (dbType.includes('postgres')) {
        needed.push('postgresql', 'upgrade');
      } else if (dbType.includes('oracle')) {
        needed.push('audit', 'alert', 'listener', 'oemagent', 'trace');
      } else if (dbType.includes('sqlserver')) {
        needed.push('agent', 'error');
      }
      const findings: NagRuleFindings = needed
        .filter((log) => !exports.includes(log))
        .map((log) => `LogExport::${log}`);
      return findings.length ? findings : NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);
