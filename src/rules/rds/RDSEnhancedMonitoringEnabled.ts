/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnDBCluster, CfnDBInstance } from 'aws-cdk-lib/aws-rds';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * RDS DB instances have enhanced monitoring enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnDBInstance) {
      let enhancedMonitoring = NagRules.resolveIfPrimitive(
        node,
        node.monitoringInterval
      );
      if (
        enhancedMonitoring == undefined &&
        node.dbClusterIdentifier != undefined
      ) {
        const stack = Stack.of(node);
        const clusterIdentifier = stack.resolve(node.dbClusterIdentifier);
        for (const child of stack.node.findAll()) {
          if (child instanceof CfnDBCluster && Stack.of(child) === stack) {
            const matchesCluster =
              clusterIdentifier.Ref != undefined
                ? clusterIdentifier.Ref === stack.getLogicalId(child)
                : typeof clusterIdentifier === 'string' &&
                  clusterIdentifier ===
                    stack.resolve(child.dbClusterIdentifier);
            if (matchesCluster) {
              enhancedMonitoring = NagRules.resolveIfPrimitive(
                child,
                child.monitoringInterval
              );
              break;
            }
          }
        }
      }
      if (enhancedMonitoring == undefined || enhancedMonitoring <= 0) {
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
