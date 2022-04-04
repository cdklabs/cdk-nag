/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnDBCluster, CfnDBInstance } from '@aws-cdk/aws-rds';
import { CfnResource, Stack } from '@aws-cdk/core';
import {
  NagRuleCompliance,
  NagRuleFindings,
  NagRuleResult,
  NagRules,
} from '../../nag-rules';

/**
 * Non-Aurora RDS DB instances and Aurora clusters are configured to export all possible log types to CloudWatch
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleResult => {
    if (node instanceof CfnDBInstance) {
      const dbType = String(NagRules.resolveIfPrimitive(node, node.engine));
      const exports =
        Stack.of(node).resolve(node.enableCloudwatchLogsExports) ?? [];
      const needed: string[] = [];
      if (!dbType.includes('aurora')) {
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
    } else if (node instanceof CfnDBCluster) {
      const engine = NagRules.resolveIfPrimitive(
        node,
        node.engine
      ).toLowerCase();
      const needed: string[] = [];
      const exports =
        Stack.of(node).resolve(node.enableCloudwatchLogsExports) ?? [];
      if (
        engine.toLowerCase() === 'aurora' ||
        engine.toLowerCase() === 'aurora-mysql'
      ) {
        needed.push('audit', 'error', 'general', 'slowquery');
      } else if (engine.toLowerCase() === 'aurora-postgresql') {
        needed.push('postgresql');
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
