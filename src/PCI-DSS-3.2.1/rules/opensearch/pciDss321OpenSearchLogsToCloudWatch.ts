/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnDomain as LegacyCfnDomain } from '@aws-cdk/aws-elasticsearch';
import { CfnDomain } from '@aws-cdk/aws-opensearchservice';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * OpenSearch Service domains stream error logs to CloudWatch Logs - (Control IDs: 10.1, 10.2.1, 10.2.2, 10.2.3, 10.2.4, 10.2.5, 10.3.1, 10.3.2, 10.3.3, 10.3.4, 10.3.5, 10.3.6)
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
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
}
