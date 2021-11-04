/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnResource, IConstruct } from '@aws-cdk/core';
import { NagPack, NagMessageLevel } from '../nag-pack';
import {
  hipaaSecurityAPIGWCacheEnabledAndEncrypted,
  hipaaSecurityAPIGWExecutionLoggingEnabled,
  hipaaSecurityAPIGWSSLEnabled,
  hipaaSecurityAPIGWXrayEnabled,
} from './rules/apigw';
import {
  hipaaSecurityAutoscalingGroupELBHealthCheckRequired,
  hipaaSecurityAutoscalingLaunchConfigPublicIpDisabled,
} from './rules/autoscaling';
import {
  hipaaSecurityCloudTrailCloudWatchLogsEnabled,
  hipaaSecurityCloudTrailEncryptionEnabled,
  hipaaSecurityCloudTrailLogFileValidationEnabled,
} from './rules/cloudtrail';
import {
  hipaaSecurityCloudWatchAlarmAction,
  hipaaSecurityCloudWatchLogGroupEncrypted,
  hipaaSecurityCloudWatchLogGroupRetentionPeriod,
} from './rules/cloudwatch';
import {
  hipaaSecurityCodeBuildProjectEnvVarAwsCred,
  hipaaSecurityCodeBuildProjectSourceRepoUrl,
} from './rules/codebuild';
import { hipaaSecurityDMSReplicationNotPublic } from './rules/dms';
import {
  hipaaSecurityDynamoDBAutoscalingEnabled,
  hipaaSecurityDynamoDBInBackupPlan,
  hipaaSecurityDynamoDBPITREnabled,
} from './rules/dynamodb';
import {
  hipaaSecurityEC2EBSInBackupPlan,
  hipaaSecurityEC2EBSOptimizedInstance,
  hipaaSecurityEC2InstanceDetailedMonitoringEnabled,
  hipaaSecurityEC2InstanceNoPublicIps,
  hipaaSecurityEC2InstanceProfileAttached,
  hipaaSecurityEC2InstancesInVPC,
  hipaaSecurityEC2RestrictedCommonPorts,
  hipaaSecurityEC2RestrictedSSH,
} from './rules/ec2';
import { hipaaSecurityECSTaskDefinitionUserForHostMode } from './rules/ecs';
import {
  hipaaSecurityEFSEncrypted,
  hipaaSecurityEFSInBackupPlan,
} from './rules/efs';
import { hipaaSecurityElastiCacheRedisClusterAutomaticBackup } from './rules/elasticache';
import {
  hipaaSecurityElasticBeanstalkEnhancedHealthReportingEnabled,
  hipaaSecurityElasticBeanstalkManagedUpdatesEnabled,
} from './rules/elasticbeanstalk';
import {
  hipaaSecurityALBHttpDropInvalidHeaderEnabled,
  hipaaSecurityALBHttpToHttpsRedirection,
  hipaaSecurityELBACMCertificateRequired,
  hipaaSecurityELBCrossZoneLoadBalancingEnabled,
  hipaaSecurityELBDeletionProtectionEnabled,
  hipaaSecurityELBLoggingEnabled,
  hipaaSecurityELBTlsHttpsListenersOnly,
  hipaaSecurityELBv2ACMCertificateRequired,
} from './rules/elb';
import { hipaaSecurityEMRKerberosEnabled } from './rules/emr';
import {
  hipaaSecurityIAMGroupHasUsers,
  hipaaSecurityIAMNoInlinePolicy,
  hipaaSecurityIAMPolicyNoStatementsWithAdminAccess,
  hipaaSecurityIAMPolicyNoStatementsWithFullAccess,
  hipaaSecurityIAMUserGroupMembership,
  hipaaSecurityIAMUserNoPolicies,
} from './rules/iam';
import {
  hipaaSecurityLambdaConcurrency,
  hipaaSecurityLambdaDlq,
  hipaaSecurityLambdaInsideVPC,
} from './rules/lambda';
import {
  hipaaSecurityOpenSearchEncryptedAtRest,
  hipaaSecurityOpenSearchInVPCOnly,
  hipaaSecurityOpenSearchLogsToCloudWatch,
  hipaaSecurityOpenSearchNodeToNodeEncryption,
} from './rules/opensearch';
import {
  hipaaSecurityRDSAutomaticMinorVersionUpgradeEnabled,
  hipaaSecurityRDSEnhancedMonitoringEnabled,
  hipaaSecurityRDSInBackupPlan,
  hipaaSecurityRDSInstanceBackupEnabled,
  hipaaSecurityRDSInstanceDeletionProtectionEnabled,
  hipaaSecurityRDSInstanceMultiAZSupport,
  hipaaSecurityRDSInstancePublicAccess,
  hipaaSecurityRDSLoggingEnabled,
  hipaaSecurityRDSStorageEncrypted,
} from './rules/rds';
import {
  hipaaSecurityRedshiftBackupEnabled,
  hipaaSecurityRedshiftClusterConfiguration,
  hipaaSecurityRedshiftClusterMaintenanceSettings,
  hipaaSecurityRedshiftClusterPublicAccess,
  hipaaSecurityRedshiftEnhancedVPCRoutingEnabled,
} from './rules/redshift';
import {
  hipaaSecurityS3BucketLevelPublicAccessProhibited,
  hipaaSecurityS3BucketLoggingEnabled,
  hipaaSecurityS3BucketPublicReadProhibited,
  hipaaSecurityS3BucketPublicWriteProhibited,
  hipaaSecurityS3BucketReplicationEnabled,
  hipaaSecurityS3BucketServerSideEncryptionEnabled,
  hipaaSecurityS3BucketVersioningEnabled,
  hipaaSecurityS3DefaultEncryptionKMS,
} from './rules/s3';
import {
  hipaaSecuritySageMakerEndpointConfigurationKMSKeyConfigured,
  hipaaSecuritySageMakerNotebookInstanceKMSKeyConfigured,
  hipaaSecuritySageMakerNotebookNoDirectInternetAccess,
} from './rules/sagemaker';
import { hipaaSecuritySecretsManagerUsingKMSKey } from './rules/secretsmanager';
import { hipaaSecuritySNSEncryptedKMS } from './rules/sns';
import {
  hipaaSecurityVPCDefaultSecurityGroupClosed,
  hipaaSecurityVPCNoUnrestrictedRouteToIGW,
  hipaaSecurityVPCSubnetAutoAssignPublicIpDisabled,
} from './rules/vpc';

/**
 * Check for HIPAA Security compliance.
 * Based on the HIPAA Security AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-hipaa_security.html
 */
export class HIPAASecurityChecks extends NagPack {
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      this.checkAPIGW(node);
      this.checkAutoScaling(node);
      this.checkCloudTrail(node);
      this.checkCloudWatch(node);
      this.checkCodeBuild(node);
      this.checkDMS(node);
      this.checkDynamoDB(node);
      this.checkEC2(node);
      this.checkECS(node);
      this.checkEFS(node);
      this.checkElastiCache(node);
      this.checkElasticBeanstalk(node);
      this.checkELB(node);
      this.checkEMR(node);
      this.checkIAM(node);
      this.checkLambda(node);
      this.checkOpenSearch(node);
      this.checkRDS(node);
      this.checkRedshift(node);
      this.checkS3(node);
      this.checkSageMaker(node);
      this.checkSecretsManager(node);
      this.checkSNS(node);
      this.checkVPC(node);
    }
  }

  /**
   * Check API Gateway Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkAPIGW(node: CfnResource): void {
    this.applyRule({
      ruleId: 'HIPAA.Security-APIGWCacheEnabledAndEncrypted',
      info: 'The API Gateway stage does not have caching enabled and encrypted for all methods - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      explanation:
        "To help protect data at rest, ensure encryption is enabled for your API Gateway stage's cache. Because sensitive data can be captured for the API method, enable encryption at rest to help protect that data.",
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityAPIGWCacheEnabledAndEncrypted,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-APIGWExecutionLoggingEnabled',
      info: 'The API Gateway stage does not have execution logging enabled for all methods - (Control ID: 164.312(b)).',
      explanation:
        'API Gateway logging displays detailed views of users who accessed the API and the way they accessed the API. This insight enables visibility of user activities.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityAPIGWExecutionLoggingEnabled,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-APIGWSSLEnabled',
      info: 'The API Gateway REST API stage is not configured with SSL certificates - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(1), 164.312(e)(2)(i), 164.312(e)(2)(ii)).',
      explanation:
        'Ensure Amazon API Gateway REST API stages are configured with SSL certificates to allow backend systems to authenticate that requests originate from API Gateway.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityAPIGWSSLEnabled,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-APIGWXrayEnabled',
      info: 'The API Gateway REST API stage does not have X-Ray enabled - (Control ID: 164.312(b)).',
      explanation:
        'AWS X-Ray collects data about requests that your application serves, and provides tools you can use to view, filter, and gain insights into that data to identify issues and opportunities for optimization. Ensure X-Ray is enables so you can see detailed information not only about the request and response, but also about calls that your application makes to downstream AWS resources, microservices, databases and HTTP web APIs.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityAPIGWXrayEnabled,
      node: node,
    });
  }

  /**
   * Check Auto Scaling Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkAutoScaling(node: CfnResource): void {
    this.applyRule({
      ruleId: 'HIPAA.Security-AutoscalingGroupELBHealthCheckRequired',
      info: 'The Auto Scaling group utilizes a load balancer and does not have an ELB health check configured - (Control ID: 164.312(b)).',
      explanation:
        'The Elastic Load Balancer (ELB) health checks for Amazon Elastic Compute Cloud (Amazon EC2) Auto Scaling groups support maintenance of adequate capacity and availability. The load balancer periodically sends pings, attempts connections, or sends requests to test Amazon EC2 instances health in an auto-scaling group. If an instance is not reporting back, traffic is sent to a new Amazon EC2 instance.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityAutoscalingGroupELBHealthCheckRequired,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-AutoscalingLaunchConfigPublicIpDisabled',
      info: 'The Auto Scaling launch configuration does not have public IP addresses disabled - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(B), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      explanation:
        'If you configure your Network Interfaces with a public IP address, then the associated resources to those Network Interfaces are reachable from the internet. EC2 resources should not be publicly accessible, as this may allow unintended access to your applications or servers.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityAutoscalingLaunchConfigPublicIpDisabled,
      node: node,
    });
  }

  /**
   * Check CloudTrail Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkCloudTrail(node: CfnResource): void {
    this.applyRule({
      ruleId: 'HIPAA.Security-CloudTrailCloudWatchLogsEnabled',
      info: 'The trail does not have CloudWatch logs enabled - (Control IDs: 164.308(a)(3)(ii)(A), 164.312(b)).',
      explanation:
        'Use Amazon CloudWatch to centrally collect and manage log event activity. Inclusion of AWS CloudTrail data provides details of API call activity within your AWS account.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityCloudTrailCloudWatchLogsEnabled,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-CloudTrailEncryptionEnabled',
      info: 'The trail does not have a KMS key ID or have encryption enabled - (Control ID: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      explanation:
        'Because sensitive data may exist and to help protect data at rest, ensure encryption is enabled for your AWS CloudTrail trails.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityCloudTrailEncryptionEnabled,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-CloudTrailLogFileValidationEnabled',
      info: 'The trail does not have log file validation enabled - (Control ID: 164.312(c)(1), 164.312(c)(2)).',
      explanation:
        'Utilize AWS CloudTrail log file validation to check the integrity of CloudTrail logs. Log file validation helps determine if a log file was modified or deleted or unchanged after CloudTrail delivered it. This feature is built using industry standard algorithms: SHA-256 for hashing and SHA-256 with RSA for digital signing. This makes it computationally infeasible to modify, delete or forge CloudTrail log files without detection.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityCloudTrailLogFileValidationEnabled,
      node: node,
    });
  }

  /**
   * Check CloudWatch Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkCloudWatch(node: CfnResource): void {
    this.applyRule({
      ruleId: 'HIPAA.Security-CloudWatchAlarmAction',
      info: 'The CloudWatch alarm does not have at least one alarm action, one INSUFFICIENT_DATA action, or one OK action enabled - (Control ID: 164.312(b)).',
      explanation:
        'Amazon CloudWatch alarms alert when a metric breaches the threshold for a specified number of evaluation periods. The alarm performs one or more actions based on the value of the metric or expression relative to a threshold over a number of time periods.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityCloudWatchAlarmAction,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-CloudWatchLogGroupEncrypted',
      info: 'The CloudWatch Log Group is not encrypted with an AWS KMS key - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      explanation:
        'To help protect sensitive data at rest, ensure encryption is enabled for your Amazon CloudWatch Log Groups.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityCloudWatchLogGroupEncrypted,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-CloudWatchLogGroupRetentionPeriod',
      info: 'The CloudWatch Log Group does not have an explicit retention period configured - (Control ID: 164.312(b)).',
      explanation:
        'Ensure a minimum duration of event log data is retained for your log groups to help with troubleshooting and forensics investigations. The lack of available past event log data makes it difficult to reconstruct and identify potentially malicious events.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityCloudWatchLogGroupRetentionPeriod,
      node: node,
    });
  }

  /**
   * Check CodeBuild Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkCodeBuild(node: CfnResource): void {
    this.applyRule({
      ruleId: 'HIPAA.Security-CodeBuildProjectEnvVarAwsCred',
      info: 'The CodeBuild environment stores sensitive credentials (such as AWS_ACCESS_KEY_ID and/or AWS_SECRET_ACCESS_KEY) as plaintext environment variables - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1)).',
      explanation:
        'Do not store these variables in clear text. Storing these variables in clear text leads to unintended data exposure and unauthorized access.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityCodeBuildProjectEnvVarAwsCred,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-CodeBuildProjectSourceRepoUrl',
      info: 'The CodeBuild project which utilizes either a GitHub or BitBucket source repository does not utilize OAUTH - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1)).',
      explanation:
        'OAUTH is the most secure method of authenticating your CodeBuild application. Use OAuth instead of personal access tokens or a user name and password to grant authorization for accessing GitHub or Bitbucket repositories.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityCodeBuildProjectSourceRepoUrl,
      node: node,
    });
  }

  /**
   * Check DMS Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkDMS(node: CfnResource) {
    this.applyRule({
      ruleId: 'HIPAA.Security-DMSReplicationNotPublic',
      info: 'The DMS replication instance is public - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      explanation:
        'DMS replication instances can contain sensitive information and access control is required for such accounts.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityDMSReplicationNotPublic,
      node: node,
    });
  }

  /**
   * Check DynamoDB Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkDynamoDB(node: CfnResource) {
    this.applyRule({
      ruleId: 'HIPAA.Security-DynamoDBAutoscalingEnabled',
      info: "The provisioned capacity DynamoDB table does not have Auto Scaling enabled on it's indexes - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(C)).",
      explanation:
        'Amazon DynamoDB auto scaling uses the AWS Application Auto Scaling service to adjust provisioned throughput capacity that automatically responds to actual traffic patterns. This enables a table or a global secondary index to increase its provisioned read/write capacity to handle sudden increases in traffic, without throttling.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityDynamoDBAutoscalingEnabled,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-DynamoDBInBackupPlan',
      info: 'The DynamoDB table is not in an AWS Backup plan - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B)).',
      explanation:
        'To help with data back-up processes, ensure your Amazon DynamoDB tables are a part of an AWS Backup plan. AWS Backup is a fully managed backup service with a policy-based backup solution. This solution simplifies your backup management and enables you to meet your business and regulatory backup compliance requirements.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityDynamoDBInBackupPlan,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-DynamoDBPITREnabled',
      info: 'The DynamoDB table does not have Point-in-time Recovery enabled - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B)).',
      explanation:
        'The recovery maintains continuous backups of your table for the last 35 days.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityDynamoDBPITREnabled,
      node: node,
    });
  }

  /**
   * Check EC2 Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkEC2(node: CfnResource): void {
    this.applyRule({
      ruleId: 'HIPAA.Security-EC2EBSInBackupPlan',
      info: 'The EBS volume is not in an AWS Backup plan - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B)).',
      explanation:
        'To help with data back-up processes, ensure your Amazon Elastic Block Store (Amazon EBS) volumes are a part of an AWS Backup plan. AWS Backup is a fully managed backup service with a policy-based backup solution. This solution simplifies your backup management and enables you to meet your business and regulatory backup compliance requirements.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityEC2EBSInBackupPlan,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-EC2EBSOptimizedInstance',
      info: "The EC2 instance type 'supports' EBS optimization and does not have EBS optimization enabled - (Control ID: 164.308(a)(7)(i)).",
      explanation:
        'An optimized instance in Amazon Elastic Block Store (Amazon EBS) provides additional, dedicated capacity for Amazon EBS I/O operations. This optimization provides the most efficient performance for your EBS volumes by minimizing contention between Amazon EBS I/O operations and other traffic from your instance.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityEC2EBSOptimizedInstance,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-EC2InstanceDetailedMonitoringEnabled',
      info: 'The EC2 instance does not have detailed monitoring enabled - (Control IDs: 164.312(b)).',
      explanation:
        'Detailed monitoring provides additional monitoring information (such as 1-minute period graphs) on the AWS console.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityEC2InstanceDetailedMonitoringEnabled,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-EC2InstanceNoPublicIps',
      info: 'The EC2 instance is associated with a public IP address - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      explanation:
        'Amazon EC2 instances can contain sensitive information and access control is required for such resources.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityEC2InstanceNoPublicIps,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-EC2InstanceProfileAttached',
      info: 'The EC2 instance does not have an instance profile attached - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(A), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(B), 164.308(a)(4)(ii)(C), 164.312(a)(1)).',
      explanation:
        'EC2 instance profiles pass an IAM role to an EC2 instance. Attaching an instance profile to your instances can assist with least privilege and permissions management.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityEC2InstanceProfileAttached,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-EC2InstancesInVPC',
      info: 'The EC2 instance is not within a VPC - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      explanation:
        'Because of their logical isolation, domains that reside within an Amazon VPC have an extra layer of security when compared to domains that use public endpoints.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityEC2InstancesInVPC,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-EC2RestrictedCommonPorts',
      info: 'The EC2 instance allows unrestricted inbound IPv4 TCP traffic on common ports (20, 21, 3389, 3306, 4333) - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(B), 164.308(a)(4)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(B), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      explanation:
        'Not restricting access to ports to trusted sources can lead to attacks against the availability, integrity and confidentiality of systems. By default, common ports which should be restricted include port numbers 20, 21, 3389, 3306, and 4333.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityEC2RestrictedCommonPorts,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-EC2RestrictedSSH',
      info: 'The Security Group allows unrestricted SSH access - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(B), 164.308(a)(4)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(B), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1).',
      explanation:
        'Not allowing ingress (or remote) traffic from 0.0.0.0/0 or ::/0 to port 22 on your resources helps to restrict remote access.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityEC2RestrictedSSH,
      node: node,
    });
  }

  /**
   * Check ECS Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkECS(node: CfnResource): void {
    this.applyRule({
      ruleId: 'HIPAA.Security-ECSTaskDefinitionUserForHostMode',
      info: "The ECS task definition is configured for host networking and has at least one container with definitions with 'privileged' set to false or empty or 'user' set to root or empty - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(A), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1)).",
      explanation:
        'If a task definition has elevated privileges it is because you have specifically opted-in to those configurations. This rule checks for unexpected privilege escalation when a task definition has host networking enabled but the customer has not opted-in to elevated privileges.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityECSTaskDefinitionUserForHostMode,
      node: node,
    });
  }

  /**
   * Check EFS Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkEFS(node: CfnResource) {
    this.applyRule({
      ruleId: 'HIPAA.Security-EFSInBackupPlan',
      info: 'The EFS is not in an AWS Backup plan - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B)).',
      explanation:
        'To help with data back-up processes, ensure your Amazon Elastic File System (Amazon EFS) file systems are a part of an AWS Backup plan. AWS Backup is a fully managed backup service with a policy-based backup solution. This solution simplifies your backup management and enables you to meet your business and regulatory backup compliance requirements.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityEFSInBackupPlan,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-EFSEncrypted',
      info: 'The EFS does not have encryption at rest enabled - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      explanation:
        'Because sensitive data can exist and to help protect data at rest, ensure encryption is enabled for your Amazon Elastic File System (EFS).',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityEFSEncrypted,
      node: node,
    });
  }

  /**
   * Check ElastiCache Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkElastiCache(node: CfnResource) {
    this.applyRule({
      ruleId: 'HIPAA.Security-ElastiCacheRedisClusterAutomaticBackup',
      info: 'The ElastiCache Redis cluster does not retain automatic backups for at least 15 days - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B)).',
      explanation:
        'Automatic backups can help guard against data loss. If a failure occurs, you can create a new cluster, which restores your data from the most recent backup.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityElastiCacheRedisClusterAutomaticBackup,
      node: node,
    });
  }

  /**
   * Check Elastic Beanstalk Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkElasticBeanstalk(node: CfnResource): void {
    this.applyRule({
      ruleId: 'HIPAA.Security-ElasticBeanstalkEnhancedHealthReportingEnabled',
      info: 'The Elastic Beanstalk environment does not have enhanced health reporting enabled - (Control ID: 164.312(b)).',
      explanation:
        'AWS Elastic Beanstalk enhanced health reporting enables a more rapid response to changes in the health of the underlying infrastructure. These changes could result in a lack of availability of the application. Elastic Beanstalk enhanced health reporting provides a status descriptor to gauge the severity of the identified issues and identify possible causes to investigate.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityElasticBeanstalkEnhancedHealthReportingEnabled,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-ElasticBeanstalkManagedUpdatesEnabled',
      info: 'The Elastic Beanstalk environment does not have managed updates enabled - (Control ID: 164.308(a)(5)(ii)(A)).',
      explanation:
        'Enabling managed platform updates for an Amazon Elastic Beanstalk environment ensures that the latest available platform fixes, updates, and features for the environment are installed. Keeping up to date with patch installation is a best practice in securing systems.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityElasticBeanstalkManagedUpdatesEnabled,
      node: node,
    });
  }

  /**
   * Check Elastic Load Balancer Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkELB(node: CfnResource): void {
    this.applyRule({
      ruleId: 'HIPAA.Security-ALBHttpDropInvalidHeaderEnabled',
      info: 'The ALB does not have invalid HTTP header dropping enabled - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(1), 164.312(e)(2)(i), 164.312(e)(2)(ii)).',
      explanation:
        'Ensure that your Application Load Balancers (ALB) are configured to drop http headers. Because sensitive data can exist, enable encryption in transit to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityALBHttpDropInvalidHeaderEnabled,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-ALBHttpToHttpsRedirection',
      info: "The ALB's HTTP listeners are not configured to redirect to HTTPS - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(1), 164.312(e)(2)(i), 164.312(e)(2)(ii)).",
      explanation:
        'To help protect data in transit, ensure that your Application Load Balancer automatically redirects unencrypted HTTP requests to HTTPS. Because sensitive data can exist, enable encryption in transit to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityALBHttpToHttpsRedirection,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-ELBACMCertificateRequired',
      info: 'The CLB does not utilize an SSL certificate provided by ACM (Amazon Certificate Manager) - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(1), 164.312(e)(2)(i), 164.312(e)(2)(ii)).',
      explanation:
        'Because sensitive data can exist and to help protect data at transit, ensure encryption is enabled for your Elastic Load Balancing. Use AWS Certificate Manager to manage, provision and deploy public and private SSL/TLS certificates with AWS services and internal resources.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityELBACMCertificateRequired,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-ELBCrossZoneLoadBalancingEnabled',
      info: 'The CLB does not balance traffic between at least 2 Availability Zones - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(C)).',
      explanation:
        'The cross-zone load balancing reduces the need to maintain equivalent numbers of instances in each enabled availability zone.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityELBCrossZoneLoadBalancingEnabled,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-ELBDeletionProtectionEnabled',
      info: 'The ALB, NLB, or GLB does not have deletion protection enabled - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(C)).',
      explanation:
        'Use this feature to prevent your load balancer from being accidentally or maliciously deleted, which can lead to loss of availability for your applications.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityELBDeletionProtectionEnabled,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-ELBLoggingEnabled',
      info: 'The ELB does not have logging enabled - (Control ID: 164.312(b)).',
      explanation:
        "Elastic Load Balancing activity is a central point of communication within an environment. Ensure ELB logging is enabled. The collected data provides detailed information about requests sent to The ELB. Each log contains information such as the time the request was received, the client's IP address, latencies, request paths, and server responses.",
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityELBLoggingEnabled,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-ELBTlsHttpsListenersOnly',
      info: 'The CLB does not restrict its listeners to only the SSL and HTTPS protocols - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(1), 164.312(e)(2)(i), 164.312(e)(2)(ii)).',
      explanation:
        'Because sensitive data can exist, enable encryption in transit to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityELBTlsHttpsListenersOnly,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-ELBv2ACMCertificateRequired',
      info: 'The ALB, NLB, or GLB listener does not utilize an SSL certificate provided by ACM (Amazon Certificate Manager) - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      explanation:
        'Because sensitive data can exist and to help protect data at transit, ensure encryption is enabled for your Elastic Load Balancing. Use AWS Certificate Manager to manage, provision and deploy public and private SSL/TLS certificates with AWS services and internal resources.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityELBv2ACMCertificateRequired,
      node: node,
    });
  }

  /**
   * Check EMR Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkEMR(node: CfnResource) {
    this.applyRule({
      ruleId: 'HIPAA.Security-EMRKerberosEnabled',
      info: 'The EMR cluster does not have Kerberos enabled - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(A), 164.308(a)(3)(ii)(B), 164.308(a)(4)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(B), 164.308(a)(4)(ii)(C), 164.312(a)(1)).',
      explanation:
        'The access permissions and authorizations can be managed and incorporated with the principles of least privilege and separation of duties, by enabling Kerberos for Amazon EMR clusters.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityEMRKerberosEnabled,
      node: node,
    });
  }

  /**
   * Check IAM Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkIAM(node: CfnResource): void {
    this.applyRule({
      ruleId: 'HIPAA.Security-IAMGroupHasUsers',
      info: 'The IAM Group does not have at least one IAM User - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(A), 164.308(a)(3)(ii)(B), 164.308(a)(4)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(B), 164.308(a)(4)(ii)(C), 164.312(a)(1)).',
      explanation:
        'AWS Identity and Access Management (IAM) can help you incorporate the principles of least privilege and separation of duties with access permissions and authorizations, by ensuring that IAM groups have at least one IAM user. Placing IAM users in groups based on their associated permissions or job function is one way to incorporate least privilege.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityIAMGroupHasUsers,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-IAMNoInlinePolicy',
      info: 'The IAM Group, User, or Role contains an inline policy - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(A), 164.308(a)(3)(ii)(B), 164.308(a)(4)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(B), 164.308(a)(4)(ii)(C), 164.312(a)(1)).',
      explanation:
        'AWS recommends to use managed policies instead of inline policies. The managed policies allow reusability, versioning and rolling back, and delegating permissions management.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityIAMNoInlinePolicy,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-IAMPolicyNoStatementsWithAdminAccess',
      info: 'The IAM policy grants admin access - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(A), 164.308(a)(3)(ii)(B), 164.308(a)(4)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(B), 164.308(a)(4)(ii)(C), 164.312(a)(1)).',
      explanation:
        'AWS Identity and Access Management (IAM) can help you incorporate the principles of least privilege and separation of duties with access permissions and authorizations, restricting policies from containing "Effect": "Allow" with "Action": "*" over "Resource": "*". Allowing users to have more privileges than needed to complete a task may violate the principle of least privilege and separation of duties.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityIAMPolicyNoStatementsWithAdminAccess,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-IAMPolicyNoStatementsWithFullAccess',
      info: 'The IAM policy grants full access - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(A), 164.308(a)(3)(ii)(B), 164.308(a)(4)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(B), 164.308(a)(4)(ii)(C), 164.312(a)(1)).',
      explanation:
        'Ensure IAM Actions are restricted to only those actions that are needed. Allowing users to have more privileges than needed to complete a task may violate the principle of least privilege and separation of duties.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityIAMPolicyNoStatementsWithFullAccess,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-IAMUserGroupMembership',
      info: 'The IAM user does not belong to any group(s) - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(A), 164.308(a)(3)(ii)(B), 164.308(a)(4)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(B), 164.308(a)(4)(ii)(C), 164.312(a)(1)).',
      explanation:
        'AWS Identity and Access Management (IAM) can help you restrict access permissions and authorizations, by ensuring IAM users are members of at least one group. Allowing users more privileges than needed to complete a task may violate the principle of least privilege and separation of duties.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityIAMUserGroupMembership,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-IAMUserNoPolicies',
      info: 'The IAM policy is attached at the user level - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(A), 164.308(a)(3)(ii)(B), 164.308(a)(4)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(B), 164.308(a)(4)(ii)(C), 164.312(a)(1)).',
      explanation:
        'Assigning privileges at the group or the role level helps to reduce opportunity for an identity to receive or retain excessive privileges.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityIAMUserNoPolicies,
      node: node,
    });
  }

  /**
   * Check Lambda Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkLambda(node: CfnResource) {
    this.applyRule({
      ruleId: 'HIPAA.Security-LambdaConcurrency',
      info: 'The Lambda function is not configured with function-level concurrent execution limits - (Control ID: 164.312(b)).',
      explanation:
        "Ensure that a Lambda function's concurrency high and low limits are established. This can assist in baselining the number of requests that your function is serving at any given time.",
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityLambdaConcurrency,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-LambdaDlq',
      info: 'The Lambda function is not configured with a dead-letter configuration - (Control ID: 164.312(b)).',
      explanation:
        'Notify the appropriate personnel through Amazon Simple Queue Service (Amazon SQS) or Amazon Simple Notification Service (Amazon SNS) when a function has failed.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityLambdaDlq,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-LambdaInsideVPC',
      info: 'The Lambda function is not VPC enabled - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      explanation:
        'Because of their logical isolation, domains that reside within an Amazon VPC have an extra layer of security when compared to domains that use public endpoints.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityLambdaInsideVPC,
      node: node,
    });
  }

  /**
   * Check OpenSearch Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkOpenSearch(node: CfnResource) {
    this.applyRule({
      ruleId: 'HIPAA.Security-OpenSearchEncryptedAtRest',
      info: 'The OpenSearch Service domain does not have encryption at rest enabled - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      explanation:
        'Because sensitive data can exist and to help protect data at rest, ensure encryption is enabled for your Amazon OpenSearch Service (OpenSearch Service) domains.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityOpenSearchEncryptedAtRest,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-OpenSearchInVPCOnly',
      info: 'The OpenSearch Service domain is not running within a VPC - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      explanation:
        'VPCs help secure your AWS resources and provide an extra layer of protection.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityOpenSearchInVPCOnly,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-OpenSearchLogsToCloudWatch',
      info: 'The OpenSearch Service domain does not stream error logs (ES_APPLICATION_LOGS) to CloudWatch Logs - (Control IDs: 164.308(a)(3)(ii)(A), 164.312(b)).',
      explanation:
        'Ensure Amazon OpenSearch Service domains have error logs enabled and streamed to Amazon CloudWatch Logs for retention and response. Domain error logs can assist with security and access audits, and can help to diagnose availability issues.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityOpenSearchLogsToCloudWatch,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-OpenSearchNodeToNodeEncryption',
      info: 'The OpenSearch Service domain does not have node-to-node encryption enabled - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(1), 164.312(e)(2)(i), 164.312(e)(2)(ii)).',
      explanation:
        'Because sensitive data can exist, enable encryption in transit to help protect that data within your Amazon OpenSearch Service (OpenSearch Service) domains.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityOpenSearchNodeToNodeEncryption,
      node: node,
    });
  }

  /**
   * Check RDS Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkRDS(node: CfnResource): void {
    this.applyRule({
      ruleId: 'HIPAA.Security-RDSInBackupPlan',
      info: 'The RDS DB instance is not in an AWS Backup plan - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B)).',
      explanation:
        'To help with data back-up processes, ensure your Amazon Relational Database Service (Amazon RDS) instances are a part of an AWS Backup plan. AWS Backup is a fully managed backup service with a policy-based backup solution. This solution simplifies your backup management and enables you to meet your business and regulatory backup compliance requirements.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityRDSInBackupPlan,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-RDSAutomaticMinorVersionUpgradeEnabled',
      info: 'The RDS DB instance does not have automatic minor version upgrades enabled - (Control ID: 164.308(a)(5)(ii)(A)).',
      explanation:
        'Enable automatic minor version upgrades on your Amazon Relational Database Service (RDS) instances to ensure the latest minor version updates to the Relational Database Management System (RDBMS) are installed, which may include security patches and bug fixes.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityRDSAutomaticMinorVersionUpgradeEnabled,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-RDSEnhancedMonitoringEnabled',
      info: 'The RDS DB instance does not enhanced monitoring enabled - (Control ID: 164.312(b)).',
      explanation:
        'Enable enhanced monitoring to help monitor Amazon RDS availability. This provides detailed visibility into the health of your Amazon RDS database instances.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityRDSEnhancedMonitoringEnabled,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-RDSInstanceBackupEnabled',
      info: 'The RDS DB instance does not have backups enabled - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B)).',
      explanation:
        'The backup feature of Amazon RDS creates backups of your databases and transaction logs.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityRDSInstanceBackupEnabled,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-RDSInstanceDeletionProtectionEnabled',
      info: 'The RDS DB instance or Aurora DB cluster does not have deletion protection enabled - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(C)).',
      explanation:
        'Ensure Amazon Relational Database Service (Amazon RDS) instances and clusters have deletion protection enabled. Use deletion protection to prevent your Amazon RDS DB instances and clusters from being accidentally or maliciously deleted, which can lead to loss of availability for your applications.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityRDSInstanceDeletionProtectionEnabled,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-RDSInstanceMultiAZSupport',
      info: 'The non-Aurora RDS DB instance does not have multi-AZ support enabled - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(C)).',
      explanation:
        'Multi-AZ support in Amazon Relational Database Service (Amazon RDS) provides enhanced availability and durability for database instances. When you provision a Multi-AZ database instance, Amazon RDS automatically creates a primary database instance, and synchronously replicates the data to a standby instance in a different Availability Zone. In case of an infrastructure failure, Amazon RDS performs an automatic failover to the standby so that you can resume database operations as soon as the failover is complete.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityRDSInstanceMultiAZSupport,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-RDSInstancePublicAccess',
      info: 'The RDS DB instance allows public access - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      explanation:
        'Amazon RDS database instances can contain sensitive information, and principles and access control is required for such accounts.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityRDSInstancePublicAccess,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-RDSLoggingEnabled',
      info: 'The RDS DB instance does not have all CloudWatch log types exported - (Control IDs: 164.308(a)(3)(ii)(A), 164.308(a)(5)(ii)(C)).',
      explanation:
        'To help with logging and monitoring within your environment, ensure Amazon Relational Database Service (Amazon RDS) logging is enabled. With Amazon RDS logging, you can capture events such as connections, disconnections, queries, or tables queried.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityRDSLoggingEnabled,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-RDSStorageEncrypted',
      info: 'The RDS DB instance or Aurora DB cluster does not have storage encrypted - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      explanation:
        'Because sensitive data can exist at rest in Amazon RDS DB instances and clusters, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityRDSStorageEncrypted,
      node: node,
    });
  }

  /**
   * Check Redshift Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkRedshift(node: CfnResource): void {
    this.applyRule({
      ruleId: 'HIPAA.Security-RedshiftBackupEnabled',
      info: 'The Redshift cluster does not have automated snapshots enabled or the retention period is not between 1 and 35 days - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B)).',
      explanation:
        'To help with data back-up processes, ensure your Amazon Redshift clusters have automated snapshots. When automated snapshots are enabled for a cluster, Redshift periodically takes snapshots of that cluster. By default, Redshift takes a snapshot every eight hours or every 5 GB per node of data changes, or whichever comes first.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityRedshiftBackupEnabled,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-RedshiftClusterConfiguration',
      info: 'The Redshift cluster does not have encryption or audit logging enabled - (Control IDs: 164.312(a)(2)(iv), 164.312(b), 164.312(e)(2)(ii)).',
      explanation:
        'To protect data at rest, ensure that encryption is enabled for your Amazon Redshift clusters. You must also ensure that required configurations are deployed on Amazon Redshift clusters. The audit logging should be enabled to provide information about connections and user activities in the database.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityRedshiftClusterConfiguration,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-RedshiftClusterMaintenanceSettings',
      info: 'The Redshift cluster does not have version upgrades enabled, automated snapshot retention periods enabled, and an explicit maintenance window configured - (Control IDs: 164.308(a)(5)(ii)(A), 164.308(a)(7)(ii)(A)).',
      explanation:
        'Ensure that Amazon Redshift clusters have the preferred settings for your organization. Specifically, that they have preferred maintenance windows and automated snapshot retention periods for the database.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityRedshiftClusterMaintenanceSettings,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-RedshiftClusterPublicAccess',
      info: 'The Redshift cluster allows public access - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      explanation:
        'Amazon Redshift clusters can contain sensitive information and principles and access control is required for such accounts.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityRedshiftClusterPublicAccess,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-RedshiftEnhancedVPCRoutingEnabled',
      info: 'The Redshift cluster does not have enhanced VPC routing enabled - (Control IDs: 164.312(e)(1)).',
      explanation:
        'Enhanced VPC routing forces all COPY and UNLOAD traffic between the cluster and data repositories to go through your Amazon VPC. You can then use VPC features such as security groups and network access control lists to secure network traffic. You can also use VPC flow logs to monitor network traffic.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityRedshiftEnhancedVPCRoutingEnabled,
      node: node,
    });
  }

  /**
   * Check Amazon S3 Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkS3(node: CfnResource): void {
    this.applyRule({
      ruleId: 'HIPAA.Security-S3BucketLevelPublicAccessProhibited',
      info: 'The S3 bucket does not prohibit public access through bucket level settings - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      explanation:
        'Keep sensitive data safe from unauthorized remote users by preventing public access at the bucket level.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityS3BucketLevelPublicAccessProhibited,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-S3BucketLoggingEnabled',
      info: 'The S3 Bucket does not have server access logs enabled - (Control IDs: 164.308(a)(3)(ii)(A), 164.312(b)).',
      explanation:
        'Amazon Simple Storage Service (Amazon S3) server access logging provides a method to monitor the network for potential cybersecurity events. The events are monitored by capturing detailed records for the requests that are made to an Amazon S3 bucket. Each access log record provides details about a single access request. The details include the requester, bucket name, request time, request action, response status, and an error code, if relevant.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityS3BucketLoggingEnabled,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-S3BucketPublicReadProhibited',
      info: 'The S3 Bucket does not prohibit public read access through its Block Public Access configurations and bucket ACLs - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      explanation:
        'The management of access should be consistent with the classification of the data.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityS3BucketPublicReadProhibited,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-S3BucketPublicWriteProhibited',
      info: 'The S3 Bucket does not prohibit public write access through its Block Public Access configurations and bucket ACLs - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      explanation:
        'The management of access should be consistent with the classification of the data.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityS3BucketPublicWriteProhibited,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-S3BucketReplicationEnabled',
      info: 'The S3 Bucket does not have replication enabled - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B)).',
      explanation:
        'Amazon Simple Storage Service (Amazon S3) Cross-Region Replication (CRR) supports maintaining adequate capacity and availability. CRR enables automatic, asynchronous copying of objects across Amazon S3 buckets to help ensure that data availability is maintained.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityS3BucketReplicationEnabled,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-S3BucketServerSideEncryptionEnabled',
      info: 'The S3 Bucket does not have default server-side encryption enabled - (Control IDs: 164.312(a)(2)(iv), 164.312(c)(2), 164.312(e)(2)(ii)).',
      explanation:
        'Because sensitive data can exist at rest in Amazon S3 buckets, enable encryption to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityS3BucketServerSideEncryptionEnabled,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-S3BucketVersioningEnabled',
      info: 'The S3 Bucket does not have versioning enabled - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B), 164.312(c)(1), 164.312(c)(2)).',
      explanation:
        'Use versioning to preserve, retrieve, and restore every version of every object stored in your Amazon S3 bucket. Versioning helps you to easily recover from unintended user actions and application failures.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityS3BucketVersioningEnabled,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-S3DefaultEncryptionKMS',
      info: 'The S3 Bucket is not encrypted with a KMS Key by default - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      explanation:
        'Ensure that encryption is enabled for your Amazon Simple Storage Service (Amazon S3) buckets. Because sensitive data can exist at rest in an Amazon S3 bucket, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityS3DefaultEncryptionKMS,
      node: node,
    });
  }

  /**
   * Check SageMaker Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkSageMaker(node: CfnResource) {
    this.applyRule({
      ruleId: 'HIPAA.Security-SageMakerEndpointConfigurationKMSKeyConfigured',
      info: 'The SageMaker endpoint is not encrypted with a KMS key - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      explanation:
        'Because sensitive data can exist at rest in SageMaker endpoint, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecuritySageMakerEndpointConfigurationKMSKeyConfigured,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-SageMakerNotebookInstanceKMSKeyConfigured',
      info: 'The SageMaker notebook is not encrypted with a KMS key - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      explanation:
        'Because sensitive data can exist at rest in SageMaker notebook, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecuritySageMakerNotebookInstanceKMSKeyConfigured,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-SageMakerNotebookNoDirectInternetAccess',
      info: 'The SageMaker notebook does not disable direct internet access - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      explanation:
        'By preventing direct internet access, you can keep sensitive data from being accessed by unauthorized users.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecuritySageMakerNotebookNoDirectInternetAccess,
      node: node,
    });
  }

  /**
   * Check Secrets Manager Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkSecretsManager(node: CfnResource): void {
    this.applyRule({
      ruleId: 'HIPAA.Security-SecretsManagerUsingKMSKey',
      info: 'The secret is not encrypted with a KMS Customer managed key - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      explanation:
        'To help protect data at rest, ensure encryption with AWS Key Management Service (AWS KMS) is enabled for AWS Secrets Manager secrets. Because sensitive data can exist at rest in Secrets Manager secrets, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecuritySecretsManagerUsingKMSKey,
      node: node,
    });
  }

  /**
   * Check Amazon SNS Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkSNS(node: CfnResource): void {
    this.applyRule({
      ruleId: 'HIPAA.Security-SNSEncryptedKMS',
      info: 'The SNS topic does not have KMS encryption enabled - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      explanation:
        'Because sensitive data can exist at rest in published messages, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecuritySNSEncryptedKMS,
      node: node,
    });
  }

  /**
   * Check VPC Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkVPC(node: CfnResource): void {
    this.applyRule({
      ruleId: 'HIPAA.Security-VPCDefaultSecurityGroupClosed',
      info: "The VPC's default security group allows inbound or outbound traffic - (Control ID: 164.312(e)(1)).",
      explanation:
        'When creating a VPC through CloudFormation, the default security group will always be open. Therefore it is important to always close the default security group after stack creation whenever a VPC is created. Restricting all the traffic on the default security group helps in restricting remote access to your AWS resources.',
      level: NagMessageLevel.WARN,
      rule: hipaaSecurityVPCDefaultSecurityGroupClosed,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-VPCNoUnrestrictedRouteToIGW',
      info: "The route table may contain one or more unrestricted route(s) to an IGW ('0.0.0.0/0' or '::/0') - (Control ID: 164.312(e)(1)).",
      explanation:
        'Ensure Amazon EC2 route tables do not have unrestricted routes to an internet gateway. Removing or limiting the access to the internet for workloads within Amazon VPCs can reduce unintended access within your environment.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityVPCNoUnrestrictedRouteToIGW,
      node: node,
    });
    this.applyRule({
      ruleId: 'HIPAA.Security-VPCSubnetAutoAssignPublicIpDisabled',
      info: 'The subnet auto-assigns public IP addresses - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      explanation:
        'Manage access to the AWS Cloud by ensuring Amazon Virtual Private Cloud (VPC) subnets are not automatically assigned a public IP address. Amazon Elastic Compute Cloud (EC2) instances that are launched into subnets that have this attribute enabled have a public IP address assigned to their primary network interface.',
      level: NagMessageLevel.ERROR,
      rule: hipaaSecurityVPCSubnetAutoAssignPublicIpDisabled,
      node: node,
    });
  }
}
