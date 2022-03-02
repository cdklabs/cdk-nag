/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnDBCluster } from '@aws-cdk/aws-rds';
import { CfnResource, Stack } from '@aws-cdk/core';
import {
  NagRuleCompliance,
  NagRuleFindings,
  NagRuleResult,
  NagRules,
} from '../../nag-rules';

/**
 * RDS Aurora MySQL serverless clusters have audit, error, general, and slowquery Log Exports enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleResult => {
    if (node instanceof CfnDBCluster) {
      const engine = NagRules.resolveIfPrimitive(
        node,
        node.engine
      ).toLowerCase();
      const engineMode = NagRules.resolveIfPrimitive(node, node.engineMode);
      if (
        engineMode != undefined &&
        engineMode.toLowerCase() == 'serverless' &&
        (engine.toLowerCase() == 'aurora' ||
          engine.toLowerCase() == 'aurora-mysql')
      ) {
        const exports =
          Stack.of(node).resolve(node.enableCloudwatchLogsExports) ?? [];
        const needed = ['audit', 'error', 'general', 'slowquery'];
        const findings: NagRuleFindings = needed
          .filter((log) => !exports.includes(log))
          .map((log) => `LogExport::${log}`);
        if (findings.length) {
          return findings;
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
