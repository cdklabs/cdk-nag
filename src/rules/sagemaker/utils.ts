/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnResource } from 'aws-cdk-lib';
import { NagRules } from '../../nag-rules';
import { resolveIfNotIntrinsic } from '../../utils/resolve-if-not-intrinsic';

/**
 * Resolve a boolean setting of a SageMaker monitoring network configuration
 * @param node the CfnResource to check
 * @param networkConfig the network configuration property of the resource
 * @param setting the setting to resolve
 * @returns the resolved setting
 */
export function resolveNetworkConfigSetting(
  node: CfnResource,
  networkConfig: any,
  setting: 'enableInterContainerTrafficEncryption' | 'enableNetworkIsolation'
): any {
  return NagRules.resolveIfPrimitive(
    node,
    resolveIfNotIntrinsic(node, networkConfig)?.[setting]
  );
}

/**
 * Check whether a SageMaker model container pulls its image from a private registry in a VPC
 * @param node the CfnResource to check
 * @param container the container definition to check
 * @returns whether the container uses VPC repository access mode
 */
export function usesPrivateRegistry(
  node: CfnResource,
  container: any
): boolean {
  const imageConfig = resolveIfNotIntrinsic(
    node,
    resolveIfNotIntrinsic(node, container)?.imageConfig
  );
  return (
    NagRules.resolveIfPrimitive(node, imageConfig?.repositoryAccessMode) ===
    'Vpc'
  );
}
