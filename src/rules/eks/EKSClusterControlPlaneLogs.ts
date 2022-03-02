/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnCluster } from 'aws-cdk-lib/aws-eks';
import { NagRuleCompliance, NagRuleResult, NagRules } from '../../nag-rules';

/**
 * EKS Clusters publish 'api', 'audit', 'authenticator, 'controllerManager', and 'scheduler' control plane logs
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleResult => {
    if (node instanceof CfnCluster) {
      const requiredTypes = new Set([
        'api',
        'audit',
        'authenticator',
        'controllerManager',
        'scheduler',
      ]);
      const logging = Stack.of(node).resolve(node.logging);
      const clusterLogging = Stack.of(node).resolve(logging?.clusterLogging);
      const enabledTypes: CfnCluster.LoggingTypeConfigProperty[] =
        Stack.of(node).resolve(clusterLogging?.enabledTypes) ?? [];
      for (const enabled of enabledTypes) {
        requiredTypes.delete(NagRules.resolveIfPrimitive(node, enabled.type));
        if (requiredTypes.size === 0) {
          break;
        }
      }
      return requiredTypes.size
        ? [...requiredTypes].map((log) => `LogExport::${log}`)
        : NagRuleCompliance.COMPLIANT;
    } else if (node.cfnResourceType === 'Custom::AWSCDK-EKS-Cluster') {
      // The CDK uses a Custom Resource with AWS SDK calls to create EKS Clusters
      const props = Stack.of(node).resolve((<any>node)._cfnProperties);
      const clusterLogging =
        Stack.of(node).resolve(props?.Config?.logging?.clusterLogging) ?? [];
      const requiredTypes = new Set([
        'api',
        'audit',
        'authenticator',
        'controllerManager',
        'scheduler',
      ]);
      for (const config of clusterLogging) {
        if (config?.enabled === true) {
          for (const type of config?.types) {
            requiredTypes.delete(type);
            if (requiredTypes.size === 0) {
              break;
            }
          }
        }
      }
      return requiredTypes.size
        ? [...requiredTypes].map((log) => `LogExport::${log}`)
        : NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);
