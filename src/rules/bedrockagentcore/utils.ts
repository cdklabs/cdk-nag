/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnResource } from 'aws-cdk-lib';
import { NagRules } from '../../nag-rules';
import { resolveIfNotIntrinsic } from '../../utils/resolve-if-not-intrinsic';

/**
 * Resolve the network mode of a Bedrock AgentCore network configuration
 * @param node the CfnResource to check
 * @param networkConfiguration the network configuration property of the resource
 * @returns the resolved network mode
 */
export function resolveNetworkMode(
  node: CfnResource,
  networkConfiguration: any
): any {
  return NagRules.resolveIfPrimitive(
    node,
    resolveIfNotIntrinsic(node, networkConfiguration)?.networkMode
  );
}
