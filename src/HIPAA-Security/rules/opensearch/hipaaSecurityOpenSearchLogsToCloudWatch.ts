/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnDomain } from '@aws-cdk/aws-elasticsearch';
import { IConstruct, Stack } from '@aws-cdk/core';

/**
 * OpenSearch Service domains stream error logs to CloudWatch Logs - (Control IDs: 164.308(a)(3)(ii)(A), 164.312(b))
 * @param node the CfnResource to check
 */
export default function (node: IConstruct): boolean {
  if (node instanceof CfnDomain) {
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
