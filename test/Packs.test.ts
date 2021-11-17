/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { Aspects, CfnResource, Stack } from '@aws-cdk/core';
import {
  AwsSolutionsChecks,
  HIPAASecurityChecks,
  NIST80053R4Checks,
  NIST80053R5Checks,
  PCIDSS321Checks,
  IApplyRule,
} from '../src';

describe('Check NagPack Details', () => {
  describe('AwsSolutions', () => {
    const pack = new AwsSolutionsChecks();
    test('Pack Name is correct', () => {
      expect(pack.readPackName).toStrictEqual('AwsSolutions');
    });
    test('Pack contains expected rules', () => {
      const warnings = [
        'AwsSolutions-APIG3',
        'AwsSolutions-CB3',
        'AwsSolutions-CB5',
        'AwsSolutions-CFR1',
        'AwsSolutions-CFR2',
        'AwsSolutions-COG2',
        'AwsSolutions-DDB3',
        'AwsSolutions-EB4',
        'AwsSolutions-KDA3',
        'AwsSolutions-KDS3',
        'AwsSolutions-MS4',
        'AwsSolutions-MS7',
        'AwsSolutions-MS8',
        'AwsSolutions-MS10',
        'AwsSolutions-TS3',
        'AwsSolutions-VPC3',
      ];
      const errors = [
        'AwsSolutions-AEC1',
        'AwsSolutions-AEC3',
        'AwsSolutions-AEC4',
        'AwsSolutions-AEC5',
        'AwsSolutions-AEC6',
        'AwsSolutions-APIG1',
        'AwsSolutions-APIG2',
        'AwsSolutions-APIG4',
        'AwsSolutions-APIG6',
        'AwsSolutions-AS1',
        'AwsSolutions-AS2',
        'AwsSolutions-AS3',
        'AwsSolutions-ASC3',
        'AwsSolutions-ATH1',
        'AwsSolutions-CB4',
        'AwsSolutions-C91',
        'AwsSolutions-CFR3',
        'AwsSolutions-CFR5',
        'AwsSolutions-CFR6',
        'AwsSolutions-COG1',
        'AwsSolutions-COG3',
        'AwsSolutions-COG4',
        'AwsSolutions-COG7',
        'AwsSolutions-DDB4',
        'AwsSolutions-DOC1',
        'AwsSolutions-DOC2',
        'AwsSolutions-DOC3',
        'AwsSolutions-DOC4',
        'AwsSolutions-DOC5',
        'AwsSolutions-EB1',
        'AwsSolutions-EB3',
        'AwsSolutions-EC23',
        'AwsSolutions-EC26',
        'AwsSolutions-EC27',
        'AwsSolutions-EC28',
        'AwsSolutions-EC29',
        'AwsSolutions-ECR1',
        'AwsSolutions-ECS4',
        'AwsSolutions-ECS7',
        'AwsSolutions-EFS1',
        'AwsSolutions-ELB1',
        'AwsSolutions-ELB2',
        'AwsSolutions-ELB3',
        'AwsSolutions-ELB4',
        'AwsSolutions-ELB5',
        'AwsSolutions-EMR2',
        'AwsSolutions-EMR6',
        'AwsSolutions-IAM4',
        'AwsSolutions-IAM5',
        'AwsSolutions-KDF1',
        'AwsSolutions-KDS1',
        'AwsSolutions-KMS5',
        'AwsSolutions-MS1',
        'AwsSolutions-MSK2',
        'AwsSolutions-MSK3',
        'AwsSolutions-MSK6',
        'AwsSolutions-N1',
        'AwsSolutions-N2',
        'AwsSolutions-N3',
        'AwsSolutions-N4',
        'AwsSolutions-N5',
        'AwsSolutions-OS1',
        'AwsSolutions-OS2',
        'AwsSolutions-OS3',
        'AwsSolutions-OS4',
        'AwsSolutions-OS5',
        'AwsSolutions-OS7',
        'AwsSolutions-OS8',
        'AwsSolutions-OS9',
        'AwsSolutions-QS1',
        'AwsSolutions-RDS2',
        'AwsSolutions-RDS6',
        'AwsSolutions-RDS10',
        'AwsSolutions-RDS11',
        'AwsSolutions-RDS13',
        'AwsSolutions-RDS14',
        'AwsSolutions-RDS15',
        'AwsSolutions-RDS16',
        'AwsSolutions-RS1',
        'AwsSolutions-RS2',
        'AwsSolutions-RS3',
        'AwsSolutions-RS4',
        'AwsSolutions-RS5',
        'AwsSolutions-RS6',
        'AwsSolutions-RS8',
        'AwsSolutions-RS9',
        'AwsSolutions-RS10',
        'AwsSolutions-RS11',
        'AwsSolutions-S1',
        'AwsSolutions-S2',
        'AwsSolutions-S3',
        'AwsSolutions-SF1',
        'AwsSolutions-SF2',
        'AwsSolutions-SM1',
        'AwsSolutions-SM2',
        'AwsSolutions-SM3',
        'AwsSolutions-SMG4',
        'AwsSolutions-SNS2',
        'AwsSolutions-SQS2',
        'AwsSolutions-SQS3',
        'AwsSolutions-VPC7',
      ];
      const expectedRules = warnings.concat(errors);
      const actualRules = new Array<string>();
      jest.spyOn(pack, 'applyRule').mockImplementation((params: IApplyRule) => {
        const ruleSuffix = params.ruleSuffixOverride
          ? params.ruleSuffixOverride
          : params.rule.name;
        const ruleId = `${pack.readPackName}-${ruleSuffix}`;
        actualRules.push(ruleId);
        return ruleId;
      });
      const stack = new Stack();
      Aspects.of(stack).add(pack);
      new CfnResource(stack, 'rTestResource', { type: 'foo' });
      SynthUtils.synthesize(stack).messages;
      expect(expectedRules.sort()).toEqual(actualRules.sort());
    });
  });
  describe('HIPAA-Security', () => {
    const pack = new HIPAASecurityChecks();
    test('Pack Name is correct', () => {
      expect(pack.readPackName).toStrictEqual('HIPAA.Security');
    });
    test('Pack contains expected rules', () => {
      const warnings = ['HIPAA.Security-VPCDefaultSecurityGroupClosed'];
      const errors = [
        'HIPAA.Security-ALBHttpDropInvalidHeaderEnabled',
        'HIPAA.Security-ALBHttpToHttpsRedirection',
        'HIPAA.Security-APIGWCacheEnabledAndEncrypted',
        'HIPAA.Security-APIGWExecutionLoggingEnabled',
        'HIPAA.Security-APIGWSSLEnabled',
        'HIPAA.Security-APIGWXrayEnabled',
        'HIPAA.Security-AutoScalingGroupELBHealthCheckRequired',
        'HIPAA.Security-AutoScalingLaunchConfigPublicIpDisabled',
        'HIPAA.Security-CloudTrailCloudWatchLogsEnabled',
        'HIPAA.Security-CloudTrailEncryptionEnabled',
        'HIPAA.Security-CloudTrailLogFileValidationEnabled',
        'HIPAA.Security-CloudWatchAlarmAction',
        'HIPAA.Security-CloudWatchLogGroupEncrypted',
        'HIPAA.Security-CloudWatchLogGroupRetentionPeriod',
        'HIPAA.Security-CodeBuildProjectEnvVarAwsCred',
        'HIPAA.Security-CodeBuildProjectSourceRepoUrl',
        'HIPAA.Security-DMSReplicationNotPublic',
        'HIPAA.Security-DynamoDBAutoScalingEnabled',
        'HIPAA.Security-DynamoDBInBackupPlan',
        'HIPAA.Security-DynamoDBPITREnabled',
        'HIPAA.Security-EC2EBSInBackupPlan',
        'HIPAA.Security-EC2EBSOptimizedInstance',
        'HIPAA.Security-EC2InstanceDetailedMonitoringEnabled',
        'HIPAA.Security-EC2InstanceNoPublicIp',
        'HIPAA.Security-EC2InstanceProfileAttached',
        'HIPAA.Security-EC2InstancesInVPC',
        'HIPAA.Security-EC2RestrictedCommonPorts',
        'HIPAA.Security-EC2RestrictedSSH',
        'HIPAA.Security-ECSTaskDefinitionUserForHostMode',
        'HIPAA.Security-EFSEncrypted',
        'HIPAA.Security-EFSInBackupPlan',
        'HIPAA.Security-ElastiCacheRedisClusterAutomaticBackup',
        'HIPAA.Security-ElasticBeanstalkEnhancedHealthReportingEnabled',
        'HIPAA.Security-ElasticBeanstalkManagedUpdatesEnabled',
        'HIPAA.Security-ELBACMCertificateRequired',
        'HIPAA.Security-ELBCrossZoneLoadBalancingEnabled',
        'HIPAA.Security-ELBDeletionProtectionEnabled',
        'HIPAA.Security-ELBLoggingEnabled',
        'HIPAA.Security-ELBTlsHttpsListenersOnly',
        'HIPAA.Security-ELBv2ACMCertificateRequired',
        'HIPAA.Security-EMRKerberosEnabled',
        'HIPAA.Security-IAMGroupHasUsers',
        'HIPAA.Security-IAMNoInlinePolicy',
        'HIPAA.Security-IAMPolicyNoStatementsWithAdminAccess',
        'HIPAA.Security-IAMPolicyNoStatementsWithFullAccess',
        'HIPAA.Security-IAMUserGroupMembership',
        'HIPAA.Security-IAMUserNoPolicies',
        'HIPAA.Security-LambdaConcurrency',
        'HIPAA.Security-LambdaDLQ',
        'HIPAA.Security-LambdaInsideVPC',
        'HIPAA.Security-OpenSearchEncryptedAtRest',
        'HIPAA.Security-OpenSearchErrorLogsToCloudWatch',
        'HIPAA.Security-OpenSearchInVPCOnly',
        'HIPAA.Security-OpenSearchNodeToNodeEncryption',
        'HIPAA.Security-RDSAutomaticMinorVersionUpgradeEnabled',
        'HIPAA.Security-RDSEnhancedMonitoringEnabled',
        'HIPAA.Security-RDSInBackupPlan',
        'HIPAA.Security-RDSInstanceBackupEnabled',
        'HIPAA.Security-RDSInstanceDeletionProtectionEnabled',
        'HIPAA.Security-RDSInstancePublicAccess',
        'HIPAA.Security-RDSLoggingEnabled',
        'HIPAA.Security-RDSMultiAZSupport',
        'HIPAA.Security-RDSStorageEncrypted',
        'HIPAA.Security-RedshiftBackupEnabled',
        'HIPAA.Security-RedshiftClusterConfiguration',
        'HIPAA.Security-RedshiftClusterMaintenanceSettings',
        'HIPAA.Security-RedshiftClusterPublicAccess',
        'HIPAA.Security-RedshiftEnhancedVPCRoutingEnabled',
        'HIPAA.Security-RedshiftRequireTlsSSL',
        'HIPAA.Security-S3BucketLevelPublicAccessProhibited',
        'HIPAA.Security-S3BucketLoggingEnabled',
        'HIPAA.Security-S3BucketPublicReadProhibited',
        'HIPAA.Security-S3BucketPublicWriteProhibited',
        'HIPAA.Security-S3BucketReplicationEnabled',
        'HIPAA.Security-S3BucketServerSideEncryptionEnabled',
        'HIPAA.Security-S3BucketVersioningEnabled',
        'HIPAA.Security-S3DefaultEncryptionKMS',
        'HIPAA.Security-SageMakerEndpointConfigurationKMSKeyConfigured',
        'HIPAA.Security-SageMakerNotebookInstanceKMSKeyConfigured',
        'HIPAA.Security-SageMakerNotebookNoDirectInternetAccess',
        'HIPAA.Security-SecretsManagerRotationEnabled',
        'HIPAA.Security-SecretsManagerUsingKMSKey',
        'HIPAA.Security-SNSEncryptedKMS',
        'HIPAA.Security-VPCFlowLogsEnabled',
        'HIPAA.Security-VPCNoUnrestrictedRouteToIGW',
        'HIPAA.Security-VPCSubnetAutoAssignPublicIpDisabled',
        'HIPAA.Security-WAFv2LoggingEnabled',
      ];
      const expectedRules = warnings.concat(errors);
      const actualRules = new Array<string>();
      jest.spyOn(pack, 'applyRule').mockImplementation((params: IApplyRule) => {
        const ruleSuffix = params.ruleSuffixOverride
          ? params.ruleSuffixOverride
          : params.rule.name;
        const ruleId = `${pack.readPackName}-${ruleSuffix}`;
        actualRules.push(ruleId);
        return ruleId;
      });
      const stack = new Stack();
      Aspects.of(stack).add(pack);
      new CfnResource(stack, 'rTestResource', { type: 'foo' });
      SynthUtils.synthesize(stack).messages;
      expect(expectedRules.sort()).toEqual(actualRules.sort());
    });
  });
  describe('NIST-800-53-R4', () => {
    const pack = new NIST80053R4Checks();
    test('Pack Name is correct', () => {
      expect(pack.readPackName).toStrictEqual('NIST.800.53.R4');
    });
    test('Pack contains expected rules', () => {
      const warnings = ['NIST.800.53.R4-VPCDefaultSecurityGroupClosed'];
      const errors = [
        'NIST.800.53.R4-ALBHttpDropInvalidHeaderEnabled',
        'NIST.800.53.R4-ALBHttpToHttpsRedirection',
        'NIST.800.53.R4-ALBWAFEnabled',
        'NIST.800.53.R4-APIGWCacheEnabledAndEncrypted',
        'NIST.800.53.R4-APIGWExecutionLoggingEnabled',
        'NIST.800.53.R4-AutoScalingGroupELBHealthCheckRequired',
        'NIST.800.53.R4-CloudTrailCloudWatchLogsEnabled',
        'NIST.800.53.R4-CloudTrailEncryptionEnabled',
        'NIST.800.53.R4-CloudTrailLogFileValidationEnabled',
        'NIST.800.53.R4-CloudWatchAlarmAction',
        'NIST.800.53.R4-CloudWatchLogGroupEncrypted',
        'NIST.800.53.R4-CloudWatchLogGroupRetentionPeriod',
        'NIST.800.53.R4-CodeBuildProjectEnvVarAwsCred',
        'NIST.800.53.R4-CodeBuildProjectSourceRepoUrl',
        'NIST.800.53.R4-DMSReplicationNotPublic',
        'NIST.800.53.R4-DynamoDBAutoScalingEnabled',
        'NIST.800.53.R4-DynamoDBInBackupPlan',
        'NIST.800.53.R4-DynamoDBPITREnabled',
        'NIST.800.53.R4-EC2EBSInBackupPlan',
        'NIST.800.53.R4-EC2InstanceDetailedMonitoringEnabled',
        'NIST.800.53.R4-EC2InstanceNoPublicIp',
        'NIST.800.53.R4-EC2InstancesInVPC',
        'NIST.800.53.R4-EC2RestrictedCommonPorts',
        'NIST.800.53.R4-EC2RestrictedSSH',
        'NIST.800.53.R4-EFSEncrypted',
        'NIST.800.53.R4-EFSInBackupPlan',
        'NIST.800.53.R4-ElastiCacheRedisClusterAutomaticBackup',
        'NIST.800.53.R4-ELBACMCertificateRequired',
        'NIST.800.53.R4-ELBCrossZoneLoadBalancingEnabled',
        'NIST.800.53.R4-ELBDeletionProtectionEnabled',
        'NIST.800.53.R4-ELBLoggingEnabled',
        'NIST.800.53.R4-ELBTlsHttpsListenersOnly',
        'NIST.800.53.R4-EMRKerberosEnabled',
        'NIST.800.53.R4-IAMGroupHasUsers',
        'NIST.800.53.R4-IAMNoInlinePolicy',
        'NIST.800.53.R4-IAMPolicyNoStatementsWithAdminAccess',
        'NIST.800.53.R4-IAMUserGroupMembership',
        'NIST.800.53.R4-IAMUserNoPolicies',
        'NIST.800.53.R4-KMSBackingKeyRotationEnabled',
        'NIST.800.53.R4-LambdaInsideVPC',
        'NIST.800.53.R4-OpenSearchEncryptedAtRest',
        'NIST.800.53.R4-OpenSearchInVPCOnly',
        'NIST.800.53.R4-OpenSearchNodeToNodeEncryption',
        'NIST.800.53.R4-RDSEnhancedMonitoringEnabled',
        'NIST.800.53.R4-RDSInBackupPlan',
        'NIST.800.53.R4-RDSInstanceBackupEnabled',
        'NIST.800.53.R4-RDSInstanceDeletionProtectionEnabled',
        'NIST.800.53.R4-RDSInstancePublicAccess',
        'NIST.800.53.R4-RDSLoggingEnabled',
        'NIST.800.53.R4-RDSMultiAZSupport',
        'NIST.800.53.R4-RDSStorageEncrypted',
        'NIST.800.53.R4-RedshiftClusterConfiguration',
        'NIST.800.53.R4-RedshiftClusterPublicAccess',
        'NIST.800.53.R4-RedshiftRequireTlsSSL',
        'NIST.800.53.R4-S3BucketDefaultLockEnabled',
        'NIST.800.53.R4-S3BucketLoggingEnabled',
        'NIST.800.53.R4-S3BucketPublicReadProhibited',
        'NIST.800.53.R4-S3BucketPublicWriteProhibited',
        'NIST.800.53.R4-S3BucketReplicationEnabled',
        'NIST.800.53.R4-S3BucketServerSideEncryptionEnabled',
        'NIST.800.53.R4-S3BucketVersioningEnabled',
        'NIST.800.53.R4-SageMakerEndpointConfigurationKMSKeyConfigured',
        'NIST.800.53.R4-SageMakerNotebookInstanceKMSKeyConfigured',
        'NIST.800.53.R4-SageMakerNotebookNoDirectInternetAccess',
        'NIST.800.53.R4-SNSEncryptedKMS',
        'NIST.800.53.R4-VPCFlowLogsEnabled',
        'NIST.800.53.R4-WAFv2LoggingEnabled',
      ];
      const expectedRules = warnings.concat(errors);
      const actualRules = new Array<string>();
      jest.spyOn(pack, 'applyRule').mockImplementation((params: IApplyRule) => {
        const ruleSuffix = params.ruleSuffixOverride
          ? params.ruleSuffixOverride
          : params.rule.name;
        const ruleId = `${pack.readPackName}-${ruleSuffix}`;
        actualRules.push(ruleId);
        return ruleId;
      });
      const stack = new Stack();
      Aspects.of(stack).add(pack);
      new CfnResource(stack, 'rTestResource', { type: 'foo' });
      SynthUtils.synthesize(stack).messages;
      expect(expectedRules.sort()).toEqual(actualRules.sort());
    });
  });
  describe('NIST-800-53-R5', () => {
    const pack = new NIST80053R5Checks();
    test('Pack Name is correct', () => {
      expect(pack.readPackName).toStrictEqual('NIST.800.53.R5');
    });
    test('Pack contains expected rules', () => {
      const warnings = ['NIST.800.53.R5-VPCDefaultSecurityGroupClosed'];
      const errors = [
        'NIST.800.53.R5-ALBHttpToHttpsRedirection',
        'NIST.800.53.R5-ALBWAFEnabled',
        'NIST.800.53.R5-APIGWAssociatedWithWAF',
        'NIST.800.53.R5-APIGWCacheEnabledAndEncrypted',
        'NIST.800.53.R5-APIGWExecutionLoggingEnabled',
        'NIST.800.53.R5-APIGWSSLEnabled',
        'NIST.800.53.R5-AutoScalingGroupELBHealthCheckRequired',
        'NIST.800.53.R5-AutoScalingLaunchConfigPublicIpDisabled',
        'NIST.800.53.R5-CloudTrailCloudWatchLogsEnabled',
        'NIST.800.53.R5-CloudTrailEncryptionEnabled',
        'NIST.800.53.R5-CloudTrailLogFileValidationEnabled',
        'NIST.800.53.R5-CloudWatchAlarmAction',
        'NIST.800.53.R5-CloudWatchLogGroupEncrypted',
        'NIST.800.53.R5-CloudWatchLogGroupRetentionPeriod',
        'NIST.800.53.R5-DMSReplicationNotPublic',
        'NIST.800.53.R5-DynamoDBAutoScalingEnabled',
        'NIST.800.53.R5-DynamoDBInBackupPlan',
        'NIST.800.53.R5-DynamoDBPITREnabled',
        'NIST.800.53.R5-EC2EBSInBackupPlan',
        'NIST.800.53.R5-EC2EBSOptimizedInstance',
        'NIST.800.53.R5-EC2InstanceNoPublicIp',
        'NIST.800.53.R5-EC2InstanceProfileAttached',
        'NIST.800.53.R5-EC2InstancesInVPC',
        'NIST.800.53.R5-EC2RestrictedCommonPorts',
        'NIST.800.53.R5-EC2RestrictedSSH',
        'NIST.800.53.R5-ECSTaskDefinitionUserForHostMode',
        'NIST.800.53.R5-EFSEncrypted',
        'NIST.800.53.R5-EFSInBackupPlan',
        'NIST.800.53.R5-ElastiCacheRedisClusterAutomaticBackup',
        'NIST.800.53.R5-ElasticBeanstalkEnhancedHealthReportingEnabled',
        'NIST.800.53.R5-ElasticBeanstalkManagedUpdatesEnabled',
        'NIST.800.53.R5-ELBACMCertificateRequired',
        'NIST.800.53.R5-ELBCrossZoneLoadBalancingEnabled',
        'NIST.800.53.R5-ELBDeletionProtectionEnabled',
        'NIST.800.53.R5-ELBLoggingEnabled',
        'NIST.800.53.R5-ELBTlsHttpsListenersOnly',
        'NIST.800.53.R5-ELBv2ACMCertificateRequired',
        'NIST.800.53.R5-IAMNoInlinePolicy',
        'NIST.800.53.R5-IAMPolicyNoStatementsWithAdminAccess',
        'NIST.800.53.R5-IAMPolicyNoStatementsWithFullAccess',
        'NIST.800.53.R5-IAMUserGroupMembership',
        'NIST.800.53.R5-IAMUserNoPolicies',
        'NIST.800.53.R5-KMSBackingKeyRotationEnabled',
        'NIST.800.53.R5-LambdaConcurrency',
        'NIST.800.53.R5-LambdaDLQ',
        'NIST.800.53.R5-LambdaInsideVPC',
        'NIST.800.53.R5-OpenSearchEncryptedAtRest',
        'NIST.800.53.R5-OpenSearchErrorLogsToCloudWatch',
        'NIST.800.53.R5-OpenSearchInVPCOnly',
        'NIST.800.53.R5-OpenSearchNodeToNodeEncryption',
        'NIST.800.53.R5-RDSEnhancedMonitoringEnabled',
        'NIST.800.53.R5-RDSInBackupPlan',
        'NIST.800.53.R5-RDSInstanceBackupEnabled',
        'NIST.800.53.R5-RDSInstanceDeletionProtectionEnabled',
        'NIST.800.53.R5-RDSInstancePublicAccess',
        'NIST.800.53.R5-RDSLoggingEnabled',
        'NIST.800.53.R5-RDSMultiAZSupport',
        'NIST.800.53.R5-RDSStorageEncrypted',
        'NIST.800.53.R5-RedshiftBackupEnabled',
        'NIST.800.53.R5-RedshiftClusterConfiguration',
        'NIST.800.53.R5-RedshiftClusterMaintenanceSettings',
        'NIST.800.53.R5-RedshiftClusterPublicAccess',
        'NIST.800.53.R5-RedshiftEnhancedVPCRoutingEnabled',
        'NIST.800.53.R5-RedshiftRequireTlsSSL',
        'NIST.800.53.R5-S3BucketLevelPublicAccessProhibited',
        'NIST.800.53.R5-S3BucketLoggingEnabled',
        'NIST.800.53.R5-S3BucketPublicReadProhibited',
        'NIST.800.53.R5-S3BucketPublicWriteProhibited',
        'NIST.800.53.R5-S3BucketReplicationEnabled',
        'NIST.800.53.R5-S3BucketServerSideEncryptionEnabled',
        'NIST.800.53.R5-S3BucketVersioningEnabled',
        'NIST.800.53.R5-S3DefaultEncryptionKMS',
        'NIST.800.53.R5-SageMakerEndpointConfigurationKMSKeyConfigured',
        'NIST.800.53.R5-SageMakerNotebookInstanceKMSKeyConfigured',
        'NIST.800.53.R5-SageMakerNotebookNoDirectInternetAccess',
        'NIST.800.53.R5-SecretsManagerRotationEnabled',
        'NIST.800.53.R5-SecretsManagerUsingKMSKey',
        'NIST.800.53.R5-SNSEncryptedKMS',
        'NIST.800.53.R5-VPCFlowLogsEnabled',
        'NIST.800.53.R5-VPCNoUnrestrictedRouteToIGW',
        'NIST.800.53.R5-VPCSubnetAutoAssignPublicIpDisabled',
        'NIST.800.53.R5-WAFv2LoggingEnabled',
      ];
      const expectedRules = warnings.concat(errors);
      const actualRules = new Array<string>();
      jest.spyOn(pack, 'applyRule').mockImplementation((params: IApplyRule) => {
        const ruleSuffix = params.ruleSuffixOverride
          ? params.ruleSuffixOverride
          : params.rule.name;
        const ruleId = `${pack.readPackName}-${ruleSuffix}`;
        actualRules.push(ruleId);
        return ruleId;
      });
      const stack = new Stack();
      Aspects.of(stack).add(pack);
      new CfnResource(stack, 'rTestResource', { type: 'foo' });
      SynthUtils.synthesize(stack).messages;
      expect(expectedRules.sort()).toEqual(actualRules.sort());
    });
  });
  describe('PCI-DSS-3.2.1', () => {
    const pack = new PCIDSS321Checks();
    test('Pack Name is correct', () => {
      expect(pack.readPackName).toStrictEqual('PCI.DSS.321');
    });
    test('Pack contains expected rules', () => {
      const warnings = ['PCI.DSS.321-VPCDefaultSecurityGroupClosed'];
      const errors = [
        'PCI.DSS.321-ALBHttpDropInvalidHeaderEnabled',
        'PCI.DSS.321-ALBHttpToHttpsRedirection',
        'PCI.DSS.321-ALBWAFEnabled',
        'PCI.DSS.321-APIGWAssociatedWithWAF',
        'PCI.DSS.321-APIGWCacheEnabledAndEncrypted',
        'PCI.DSS.321-APIGWExecutionLoggingEnabled',
        'PCI.DSS.321-APIGWSSLEnabled',
        'PCI.DSS.321-AutoScalingGroupELBHealthCheckRequired',
        'PCI.DSS.321-AutoScalingLaunchConfigPublicIpDisabled',
        'PCI.DSS.321-CloudTrailCloudWatchLogsEnabled',
        'PCI.DSS.321-CloudTrailEncryptionEnabled',
        'PCI.DSS.321-CloudTrailLogFileValidationEnabled',
        'PCI.DSS.321-CloudWatchLogGroupEncrypted',
        'PCI.DSS.321-CloudWatchLogGroupRetentionPeriod',
        'PCI.DSS.321-CodeBuildProjectEnvVarAwsCred',
        'PCI.DSS.321-CodeBuildProjectSourceRepoUrl',
        'PCI.DSS.321-DMSReplicationNotPublic',
        'PCI.DSS.321-EC2InstanceNoPublicIp',
        'PCI.DSS.321-EC2InstanceProfileAttached',
        'PCI.DSS.321-EC2InstancesInVPC',
        'PCI.DSS.321-EC2RestrictedCommonPorts',
        'PCI.DSS.321-EC2RestrictedSSH',
        'PCI.DSS.321-ECSTaskDefinitionUserForHostMode',
        'PCI.DSS.321-EFSEncrypted',
        'PCI.DSS.321-ELBACMCertificateRequired',
        'PCI.DSS.321-ELBLoggingEnabled',
        'PCI.DSS.321-ELBTlsHttpsListenersOnly',
        'PCI.DSS.321-ELBv2ACMCertificateRequired',
        'PCI.DSS.321-EMRKerberosEnabled',
        'PCI.DSS.321-IAMGroupHasUsers',
        'PCI.DSS.321-IAMNoInlinePolicy',
        'PCI.DSS.321-IAMPolicyNoStatementsWithAdminAccess',
        'PCI.DSS.321-IAMPolicyNoStatementsWithFullAccess',
        'PCI.DSS.321-IAMUserGroupMembership',
        'PCI.DSS.321-IAMUserNoPolicies',
        'PCI.DSS.321-KMSBackingKeyRotationEnabled',
        'PCI.DSS.321-LambdaInsideVPC',
        'PCI.DSS.321-OpenSearchEncryptedAtRest',
        'PCI.DSS.321-OpenSearchErrorLogsToCloudWatch',
        'PCI.DSS.321-OpenSearchInVPCOnly',
        'PCI.DSS.321-OpenSearchNodeToNodeEncryption',
        'PCI.DSS.321-RDSAutomaticMinorVersionUpgradeEnabled',
        'PCI.DSS.321-RDSInstancePublicAccess',
        'PCI.DSS.321-RDSLoggingEnabled',
        'PCI.DSS.321-RDSStorageEncrypted',
        'PCI.DSS.321-RedshiftClusterConfiguration',
        'PCI.DSS.321-RedshiftClusterMaintenanceSettings',
        'PCI.DSS.321-RedshiftClusterPublicAccess',
        'PCI.DSS.321-RedshiftEnhancedVPCRoutingEnabled',
        'PCI.DSS.321-RedshiftRequireTlsSSL',
        'PCI.DSS.321-S3BucketLevelPublicAccessProhibited',
        'PCI.DSS.321-S3BucketLoggingEnabled',
        'PCI.DSS.321-S3BucketPublicReadProhibited',
        'PCI.DSS.321-S3BucketPublicWriteProhibited',
        'PCI.DSS.321-S3BucketReplicationEnabled',
        'PCI.DSS.321-S3BucketServerSideEncryptionEnabled',
        'PCI.DSS.321-S3BucketVersioningEnabled',
        'PCI.DSS.321-S3DefaultEncryptionKMS',
        'PCI.DSS.321-SageMakerEndpointConfigurationKMSKeyConfigured',
        'PCI.DSS.321-SageMakerNotebookInstanceKMSKeyConfigured',
        'PCI.DSS.321-SageMakerNotebookNoDirectInternetAccess',
        'PCI.DSS.321-SecretsManagerUsingKMSKey',
        'PCI.DSS.321-SNSEncryptedKMS',
        'PCI.DSS.321-VPCFlowLogsEnabled',
        'PCI.DSS.321-VPCNoUnrestrictedRouteToIGW',
        'PCI.DSS.321-VPCSubnetAutoAssignPublicIpDisabled',
        'PCI.DSS.321-WAFv2LoggingEnabled',
      ];
      const expectedRules = warnings.concat(errors);
      const actualRules = new Array<string>();
      jest.spyOn(pack, 'applyRule').mockImplementation((params: IApplyRule) => {
        const ruleSuffix = params.ruleSuffixOverride
          ? params.ruleSuffixOverride
          : params.rule.name;
        const ruleId = `${pack.readPackName}-${ruleSuffix}`;
        actualRules.push(ruleId);
        return ruleId;
      });
      const stack = new Stack();
      Aspects.of(stack).add(pack);
      new CfnResource(stack, 'rTestResource', { type: 'foo' });
      SynthUtils.synthesize(stack).messages;
      expect(expectedRules.sort()).toEqual(actualRules.sort());
    });
  });
});
