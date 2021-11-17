/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnDBCluster } from '@aws-cdk/aws-docdb';
import { CfnResource } from '@aws-cdk/core';

/**
 * Document DB clusters have authenticate, createIndex, and dropCollection Log Exports enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnDBCluster) {
      if (node.enableCloudwatchLogsExports == undefined) {
        return false;
      }
      const needed = ['authenticate', 'createIndex', 'dropCollection'];
      const exports = node.enableCloudwatchLogsExports;
      return needed.every((i) => exports.includes(i));
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);
