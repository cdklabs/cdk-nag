/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnDBCluster } from '@aws-cdk/aws-rds';
import { CfnResource } from '@aws-cdk/core';
import { resolveIfPrimitive, NagRuleCompliance } from '../../nag-pack';

/**
 * RDS Aurora MySQL serverless clusters have audit, error, general, and slowquery Log Exports enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnDBCluster) {
      const engine = resolveIfPrimitive(node, node.engine).toLowerCase();
      const engineMode = resolveIfPrimitive(
        node,
        node.engineMode
      ).toLowerCase();
      if (
        engineMode != undefined &&
        engineMode.toLowerCase() == 'serverless' &&
        (engine.toLowerCase() == 'aurora' ||
          engine.toLowerCase() == 'aurora-mysql')
      ) {
        if (node.enableCloudwatchLogsExports == undefined) {
          return NagRuleCompliance.NON_COMPLIANT;
        }
        const needed = ['audit', 'error', 'general', 'slowquery'];
        const exports = node.enableCloudwatchLogsExports.map((i) => {
          return i.toLowerCase();
        });
        const compliant = needed.every((i) => exports.includes(i));
        if (compliant !== true) {
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
