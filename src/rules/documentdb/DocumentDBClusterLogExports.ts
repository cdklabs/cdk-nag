/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnDBCluster } from 'aws-cdk-lib/aws-docdb';
import { NagRuleCompliance } from '../..';

/**
 * Document DB clusters have authenticate, createIndex, and dropCollection Log Exports enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnDBCluster) {
      if (node.enableCloudwatchLogsExports == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const needed = ['authenticate', 'createIndex', 'dropCollection'];
      const exports = node.enableCloudwatchLogsExports;
      const compliant = needed.every((i) => exports.includes(i));
      if (compliant !== true) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);
