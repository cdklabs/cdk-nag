/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnResource } from 'aws-cdk-lib';
import { CfnMonitoringSchedule } from 'aws-cdk-lib/aws-sagemaker';
import { NagRules } from '../../nag-rules';

/**
 * Resolve the inline job definition of a SageMaker monitoring schedule
 * @param node the CfnMonitoringSchedule to check
 * @returns the resolved inline job definition, or undefined if the schedule references a separate job definition
 */
export function resolveInlineMonitoringJobDefinition(
  node: CfnMonitoringSchedule
): any {
  return NagRules.resolveIfNotIntrinsic(
    node,
    NagRules.resolveIfNotIntrinsic(node, node.monitoringScheduleConfig)
      ?.monitoringJobDefinition
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
  const imageConfig = NagRules.resolveIfNotIntrinsic(
    node,
    NagRules.resolveIfNotIntrinsic(node, container)?.imageConfig
  );
  return (
    NagRules.resolveIfPrimitive(node, imageConfig?.repositoryAccessMode) ===
    'Vpc'
  );
}
