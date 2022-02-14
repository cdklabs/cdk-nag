/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnCluster, CfnClusterParameterGroup } from 'aws-cdk-lib/aws-redshift';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import {
  RedshiftBackupEnabled,
  RedshiftClusterAuditLogging,
  RedshiftClusterConfiguration,
  RedshiftClusterEncryptionAtRest,
  RedshiftClusterInVPC,
  RedshiftClusterMaintenanceSettings,
  RedshiftClusterNonDefaultPort,
  RedshiftClusterNonDefaultUsername,
  RedshiftClusterPublicAccess,
  RedshiftClusterUserActivityLogging,
  RedshiftClusterVersionUpgrade,
  RedshiftEnhancedVPCRoutingEnabled,
  RedshiftRequireTlsSSL,
} from '../../src/rules/redshift';
import { validateStack, TestType, TestPack } from './utils';

const testPack = new TestPack([
  RedshiftBackupEnabled,
  RedshiftClusterAuditLogging,
  RedshiftClusterConfiguration,
  RedshiftClusterEncryptionAtRest,
  RedshiftClusterInVPC,
  RedshiftClusterMaintenanceSettings,
  RedshiftClusterNonDefaultPort,
  RedshiftClusterNonDefaultUsername,
  RedshiftClusterPublicAccess,
  RedshiftClusterUserActivityLogging,
  RedshiftClusterVersionUpgrade,
  RedshiftEnhancedVPCRoutingEnabled,
  RedshiftRequireTlsSSL,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});
describe('Amazon Redshift', () => {
  describe('RedshiftBackupEnabled: Redshift clusters have automated snapshots enabled and the retention period is between 1 and 35 days', () => {
    const ruleId = 'RedshiftBackupEnabled';
    test('Noncompliance 1', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
        automatedSnapshotRetentionPeriod: 0,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
        automatedSnapshotRetentionPeriod: 1,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('RedshiftClusterAuditLogging: Redshift clusters have audit logging enabled', () => {
    const ruleId = 'RedshiftClusterAuditLogging';
    test('Noncompliance 1', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
        loggingProperties: { bucketName: 'foo' },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('RedshiftClusterConfiguration: Redshift clusters have encryption and audit logging enabled', () => {
    const ruleId = 'RedshiftClusterConfiguration';
    test('Noncompliance 1', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
        encrypted: false,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
        loggingProperties: { bucketName: 'foo' },
        encrypted: true,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('RedshiftClusterEncryptionAtRest: Redshift clusters have encryption at rest enabled', () => {
    const ruleId = 'RedshiftClusterEncryptionAtRest';
    test('Noncompliance 1', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
        encrypted: true,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('RedshiftClusterInVPC: Redshift clusters are provisioned in a VPC', () => {
    const ruleId = 'RedshiftClusterInVPC';
    test('Noncompliance 1', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
        clusterSubnetGroupName: 'foo',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('RedshiftClusterMaintenanceSettings: Redshift clusters have version upgrades enabled, automated snapshot retention periods enabled, and explicit maintenance windows configured', () => {
    const ruleId = 'RedshiftClusterMaintenanceSettings';
    test('Noncompliance 1', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
        allowVersionUpgrade: false,
        preferredMaintenanceWindow: 'Sun:23:45-Mon:00:15',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
        allowVersionUpgrade: true,
        preferredMaintenanceWindow: 'Sun:23:45-Mon:00:15',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('RedshiftClusterNonDefaultPort: Redshift clusters do not use the default endpoint port', () => {
    const ruleId = 'RedshiftClusterNonDefaultPort';
    test('Noncompliance 1', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
        port: 42,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('RedshiftClusterNonDefaultUsername: Redshift clusters use custom user names vice the default (awsuser)', () => {
    const ruleId = 'RedshiftClusterNonDefaultUsername';
    test('Noncompliance 1', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'awsuser',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'notawsuser',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('RedshiftClusterPublicAccess: Redshift clusters do not allow public access', () => {
    const ruleId = 'RedshiftClusterPublicAccess';
    test('Noncompliance 1', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'awsuser',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
        publiclyAccessible: true,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'awsuser',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('RedshiftClusterUserActivityLogging: Redshift clusters have user user activity logging enabled', () => {
    const ruleId = 'RedshiftClusterUserActivityLogging';
    test('Noncompliance 1', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      const nonCompliant2ParamGroup = new CfnClusterParameterGroup(
        stack,
        'rBadParameterGroup',
        {
          description: 'foo',
          parameterGroupFamily: 'redshift-1.0',
        }
      );
      new CfnClusterParameterGroup(stack, 'rGoodParameterGroup', {
        description: 'foo',
        parameterGroupFamily: 'redshift-1.0',
        parameters: [
          {
            parameterName: 'enable_user_activity_logging',
            parameterValue: 'true',
          },
        ],
      });
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
        clusterParameterGroupName: nonCompliant2ParamGroup.ref,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const compliantParamGroup = new CfnClusterParameterGroup(
        stack,
        'rCfnParameterGroup',
        {
          description: 'foo',
          parameterGroupFamily: 'redshift-1.0',
          parameters: [
            {
              parameterName: 'enable_user_activity_logging',
              parameterValue: 'true',
            },
          ],
        }
      );
      new CfnCluster(stack, 'rCfnRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
        clusterParameterGroupName: compliantParamGroup.ref,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('RedshiftClusterVersionUpgrade: Redshift clusters have version upgrade enabled', () => {
    const ruleId = 'RedshiftClusterVersionUpgrade';
    test('Noncompliance 1', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
        allowVersionUpgrade: false,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('RedshiftEnhancedVPCRoutingEnabled: Redshift clusters have enhanced VPC routing enabled', () => {
    const ruleId = 'RedshiftEnhancedVPCRoutingEnabled';
    test('Noncompliance 1', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
        clusterSubnetGroupName: 'foo',
        enhancedVpcRouting: true,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('RedshiftRequireTlsSSL: Redshift clusters require TLS/SSL encryption', () => {
    const ruleId = 'RedshiftRequireTlsSSL';
    test('Noncompliance 1', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
        clusterParameterGroupName: new CfnClusterParameterGroup(
          stack,
          'rRedshiftParamGroup',
          {
            description: 'Cluster parameter group for family redshift-1.0',
            parameterGroupFamily: 'redshift-1.0',
            parameters: [
              {
                parameterName: 'require_ssl',
                parameterValue: 'false',
              },
            ],
          }
        ).ref,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new CfnCluster(stack, 'rRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
        clusterParameterGroupName: new CfnClusterParameterGroup(
          stack,
          'rRedshiftParamGroup',
          {
            description: 'Cluster parameter group for family redshift-1.0',
            parameterGroupFamily: 'redshift-1.0',
            parameters: [
              {
                parameterName: 'auto_analyze',
                parameterValue: 'true',
              },
            ],
          }
        ).ref,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const compliantParameterGroup = new CfnClusterParameterGroup(
        stack,
        'rRedshiftParamGroup',
        {
          description: 'Cluster parameter group for family redshift-1.0',
          parameterGroupFamily: 'redshift-1.0',
          parameters: [
            {
              parameterName: 'require_ssl',
              parameterValue: 'true',
            },
          ],
        }
      );
      new CfnCluster(stack, 'rCfnRedshiftCluster', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
        clusterSubnetGroupName: 'foo',
        enhancedVpcRouting: true,
        clusterParameterGroupName: compliantParameterGroup.ref,
      });
      new CfnCluster(stack, 'rCfnRedshiftCluster2', {
        masterUsername: 'use_a_secret_here',
        masterUserPassword: 'use_a_secret_here',
        clusterType: 'single-node',
        dbName: 'bar',
        nodeType: 'ds2.xlarge',
        clusterSubnetGroupName: 'foo',
        enhancedVpcRouting: true,
        clusterParameterGroupName: compliantParameterGroup.ref,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});
