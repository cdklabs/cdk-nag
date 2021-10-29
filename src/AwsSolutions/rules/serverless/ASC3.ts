/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnGraphQLApi } from '@aws-cdk/aws-appsync';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../nag-pack';

/**
 * GraphQL APIs have request leveling logging enabled
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnGraphQLApi) {
    const logConfig = Stack.of(node).resolve(node.logConfig);
    if (logConfig === undefined) {
      return false;
    }
    const excludeVerboseContent = resolveIfPrimitive(
      node,
      logConfig.excludeVerboseContent
    );
    if (
      logConfig.cloudWatchLogsRoleArn === undefined ||
      excludeVerboseContent === true
    ) {
      return false;
    }
  }
  return true;
}
