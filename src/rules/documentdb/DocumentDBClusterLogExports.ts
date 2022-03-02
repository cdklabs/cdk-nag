/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnDBCluster } from '@aws-cdk/aws-docdb';
import { CfnResource } from '@aws-cdk/core';
import {
  NagRuleCompliance,
  NagRuleFindings,
  NagRuleResult,
} from '../../nag-rules';

/**
 * Document DB clusters have authenticate, createIndex, and dropCollection Log Exports enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleResult => {
    if (node instanceof CfnDBCluster) {
      const needed = ['authenticate', 'createIndex', 'dropCollection'];
      const exports = node.enableCloudwatchLogsExports ?? [];
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
