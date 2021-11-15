/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';

import { CfnDomain as LegacyCfnDomain } from '@aws-cdk/aws-elasticsearch';
import { CfnDomain } from '@aws-cdk/aws-opensearchservice';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * OpenSearch Service domains stream error logs to CloudWatch Logs
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof LegacyCfnDomain || node instanceof CfnDomain) {
      const logPublishingOptions = Stack.of(node).resolve(
        node.logPublishingOptions
      );
      if (logPublishingOptions == undefined) {
        return false;
      }
      const resolvedLog = Stack.of(node).resolve(
        logPublishingOptions?.ES_APPLICATION_LOGS
      );
      if (resolvedLog == undefined) {
        return false;
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);
