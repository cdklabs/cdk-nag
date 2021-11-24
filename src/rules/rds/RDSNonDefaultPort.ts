/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnDBCluster, CfnDBInstance } from 'aws-cdk-lib/aws-rds';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 *  RDS DB instances and Aurora DB clusters do not use the default endpoint ports
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnDBCluster) {
      if (node.port == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const port = NagRules.resolveIfPrimitive(node, node.port);
      const engine = NagRules.resolveIfPrimitive(
        node,
        node.engine
      ).toLowerCase();
      const engineMode = NagRules.resolveIfPrimitive(node, node.engineMode);
      if (
        engineMode == undefined ||
        engineMode.toLowerCase() == 'provisioned'
      ) {
        if (engine.includes('aurora') && port == 3306) {
          return NagRuleCompliance.NON_COMPLIANT;
        }
      } else if (
        (engine == 'aurora' || engine == 'aurora-mysql') &&
        port == 3306
      ) {
        return NagRuleCompliance.NON_COMPLIANT;
      } else if (engine == 'aurora-postgresql' && port == 5432) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else if (node instanceof CfnDBInstance) {
      if (node.engine == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const port = NagRules.resolveIfPrimitive(node, node.port);
      const engine = NagRules.resolveIfPrimitive(
        node,
        node.engine
      ).toLowerCase();
      if (port == undefined) {
        if (!engine.includes('aurora')) {
          return NagRuleCompliance.NON_COMPLIANT;
        }
      } else {
        if ((engine == 'mariadb' || engine == 'mysql') && port == 3306) {
          return NagRuleCompliance.NON_COMPLIANT;
        } else if (engine == 'postgres' && port == 5432) {
          return NagRuleCompliance.NON_COMPLIANT;
        } else if (engine.includes('oracle') && port == 1521) {
          return NagRuleCompliance.NON_COMPLIANT;
        } else if (engine.includes('sqlserver') && port == 1433) {
          return NagRuleCompliance.NON_COMPLIANT;
        }
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);
