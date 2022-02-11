/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnCluster } from '@aws-cdk/aws-eks';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * EKS Clusters publish 'api', 'audit', 'authenticator, 'controllerManager', and 'scheduler' control plane logs
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnCluster) {
      const logging = Stack.of(node).resolve(node.logging);
      if (logging === undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const clusterLogging = Stack.of(node).resolve(logging.clusterLogging);
      if (clusterLogging === undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const enabledTypes = Stack.of(node).resolve(clusterLogging.enabledTypes);
      if (!Array.isArray(enabledTypes)) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const requiredTypes = new Set([
        'api',
        'audit',
        'authenticator',
        'controllerManager',
        'scheduler',
      ]);
      for (const enabled of enabledTypes) {
        requiredTypes.delete(NagRules.resolveIfPrimitive(node, enabled.type));
        if (requiredTypes.size === 0) {
          break;
        }
      }
      if (requiredTypes.size !== 0) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } // The CDK uses a Custom Resource with AWS SDK calls to create EKS Clusters
    else if (node.cfnResourceType === 'Custom::AWSCDK-EKS-Cluster') {
      const props = Stack.of(node).resolve((<any>node)._cfnProperties);
      const clusterLogging = Stack.of(node).resolve(
        props?.Config?.logging?.clusterLogging
      );
      if (!Array.isArray(clusterLogging)) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
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
      if (requiredTypes.size !== 0) {
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
