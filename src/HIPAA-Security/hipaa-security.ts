/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnResource, IConstruct } from '@aws-cdk/core';
import { NagPack, NagMessageLevel } from '../common';
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
import { hipaaSecurityDynamoDBPITREnabled } from './rules/dynamodb';
import {
  hipaaSecurityEC2EBSOptimizedInstance,
  hipaaSecurityEC2InstanceDetailedMonitoringEnabled,
  hipaaSecurityEC2InstanceNoPublicIps,
  hipaaSecurityEC2InstanceProfileAttached,
  hipaaSecurityEC2InstancesInVPC,
  hipaaSecurityEC2RestrictedCommonPorts,
  hipaaSecurityEC2RestrictedSSH,
} from './rules/ec2';
import { hipaaSecurityECSTaskDefinitionUserForHostMode } from './rules/ecs';
import { hipaaSecurityEFSEncrypted } from './rules/efs';
import { hipaaSecurityElastiCacheRedisClusterAutomaticBackup } from './rules/elasticache';
import {
  hipaaSecurityElasticBeanstalkEnhancedHealthReportingEnabled,
  hipaaSecurityElasticBeanstalkManagedUpdatesEnabled,
} from './rules/elasticbeanstalk';
import {
  hipaaSecurityALBHttpDropInvalidHeaderEnabled,
  hipaaSecurityALBHttpToHttpsRedirection,
  hipaaSecurityELBACMCertificateRequired,
  hipaaSecurityELBCrossZoneBalancingEnabled,
  hipaaSecurityELBDeletionProtectionEnabled,
  hipaaSecurityELBLoggingEnabled,
  hipaaSecurityELBTlsHttpsListenersOnly,
  hipaaSecurityELBv2ACMCertificateRequired,
} from './rules/elb';
import { hipaaSecurityEMRKerberosEnabled } from './rules/emr';
import {
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
      // Get ignores metadata if it exists
      const ignores = node.getMetadata('cdk_nag')?.rules_to_suppress;
      this.checkAPIGW(node, ignores);
      this.checkAutoScaling(node, ignores);
      this.checkCloudTrail(node, ignores);
      this.checkCloudWatch(node, ignores);
      this.checkCodeBuild(node, ignores);
      this.checkDMS(node, ignores);
      this.checkDynamoDB(node, ignores);
      this.checkEC2(node, ignores);
      this.checkECS(node, ignores);
      this.checkEFS(node, ignores);
      this.checkElastiCache(node, ignores);
      this.checkElasticBeanstalk(node, ignores);
      this.checkELB(node, ignores);
      this.checkEMR(node, ignores);
      this.checkIAM(node, ignores);
      this.checkLambda(node, ignores);
      this.checkOpenSearch(node, ignores);
      this.checkRDS(node, ignores);
      this.checkRedshift(node, ignores);
      this.checkS3(node, ignores);
      this.checkSageMaker(node, ignores);
      this.checkSecretsManager(node, ignores);
      this.checkSNS(node, ignores);
      this.checkVPC(node, ignores);
    }
  }

  /**
   * Check API Gateway Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkAPIGW(node: CfnResource, ignores: any): void {
    this.applyRule(
      'HIPAA.Security-APIGWCacheEnabledAndEncrypted',
      'The API Gateway stage does not have caching enabled and encrypted for all methods - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      "To help protect data at rest, ensure encryption is enabled for your API Gateway stage's cache. Because sensitive data can be captured for the API method, enable encryption at rest to help protect that data.",
      NagMessageLevel.ERROR,
      hipaaSecurityAPIGWCacheEnabledAndEncrypted,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-APIGWExecutionLoggingEnabled',
      'The API Gateway stage does not have execution logging enabled for all methods - (Control ID: 164.312(b)).',
      'API Gateway logging displays detailed views of users who accessed the API and the way they accessed the API. This insight enables visibility of user activities.',
      NagMessageLevel.ERROR,
      hipaaSecurityAPIGWExecutionLoggingEnabled,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-APIGWSSLEnabled',
      'The API Gateway REST API stage is not configured with SSL certificates - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(1), 164.312(e)(2)(i), 164.312(e)(2)(ii)).',
      'Ensure Amazon API Gateway REST API stages are configured with SSL certificates to allow backend systems to authenticate that requests originate from API Gateway.',
      NagMessageLevel.ERROR,
      hipaaSecurityAPIGWSSLEnabled,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-APIGWXrayEnabled',
      'The API Gateway REST API stage does not have X-Ray enabled - (Control ID: 164.312(b)).',
      'AWS X-Ray collects data about requests that your application serves, and provides tools you can use to view, filter, and gain insights into that data to identify issues and opportunities for optimization. Ensure X-Ray is enables so you can see detailed information not only about the request and response, but also about calls that your application makes to downstream AWS resources, microservices, databases and HTTP web APIs.',
      NagMessageLevel.ERROR,
      hipaaSecurityAPIGWXrayEnabled,
      ignores,
      node
    );
  }

  /**
   * Check Auto Scaling Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkAutoScaling(node: CfnResource, ignores: any): void {
    this.applyRule(
      'HIPAA.Security-AutoscalingGroupELBHealthCheckRequired',
      'The Auto Scaling group utilizes a load balancer and does not have an ELB health check configured - (Control ID: 164.312(b)).',
      'The Elastic Load Balancer (ELB) health checks for Amazon Elastic Compute Cloud (Amazon EC2) Auto Scaling groups support maintenance of adequate capacity and availability. The load balancer periodically sends pings, attempts connections, or sends requests to test Amazon EC2 instances health in an auto-scaling group. If an instance is not reporting back, traffic is sent to a new Amazon EC2 instance.',
      NagMessageLevel.ERROR,
      hipaaSecurityAutoscalingGroupELBHealthCheckRequired,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-AutoscalingLaunchConfigPublicIpDisabled',
      'The Auto Scaling launch configuration does not have public IP addresses disabled - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(B), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      'If you configure your Network Interfaces with a public IP address, then the associated resources to those Network Interfaces are reachable from the internet. EC2 resources should not be publicly accessible, as this may allow unintended access to your applications or servers.',
      NagMessageLevel.ERROR,
      hipaaSecurityAutoscalingLaunchConfigPublicIpDisabled,
      ignores,
      node
    );
  }

  /**
   * Check CloudTrail Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkCloudTrail(node: CfnResource, ignores: any): void {
    this.applyRule(
      'HIPAA.Security-CloudTrailCloudWatchLogsEnabled',
      'The trail does not have CloudWatch logs enabled - (Control IDs: 164.308(a)(3)(ii)(A), 164.312(b)).',
      'Use Amazon CloudWatch to centrally collect and manage log event activity. Inclusion of AWS CloudTrail data provides details of API call activity within your AWS account.',
      NagMessageLevel.ERROR,
      hipaaSecurityCloudTrailCloudWatchLogsEnabled,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-CloudTrailEncryptionEnabled',
      'The trail does not have a KMS key ID or have encryption enabled - (Control ID: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      'Because sensitive data may exist and to help protect data at rest, ensure encryption is enabled for your AWS CloudTrail trails.',
      NagMessageLevel.ERROR,
      hipaaSecurityCloudTrailEncryptionEnabled,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-CloudTrailLogFileValidationEnabled',
      'The trail does not have log file validation enabled - (Control ID: 164.312(c)(1), 164.312(c)(2)).',
      'Utilize AWS CloudTrail log file validation to check the integrity of CloudTrail logs. Log file validation helps determine if a log file was modified or deleted or unchanged after CloudTrail delivered it. This feature is built using industry standard algorithms: SHA-256 for hashing and SHA-256 with RSA for digital signing. This makes it computationally infeasible to modify, delete or forge CloudTrail log files without detection.',
      NagMessageLevel.ERROR,
      hipaaSecurityCloudTrailLogFileValidationEnabled,
      ignores,
      node
    );
  }

  /**
   * Check CloudWatch Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkCloudWatch(node: CfnResource, ignores: any): void {
    this.applyRule(
      'HIPAA.Security-CloudWatchAlarmAction',
      'The CloudWatch alarm does not have at least one alarm action, one INSUFFICIENT_DATA action, or one OK action enabled - (Control ID: 164.312(b)).',
      'Amazon CloudWatch alarms alert when a metric breaches the threshold for a specified number of evaluation periods. The alarm performs one or more actions based on the value of the metric or expression relative to a threshold over a number of time periods.',
      NagMessageLevel.ERROR,
      hipaaSecurityCloudWatchAlarmAction,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-CloudWatchLogGroupEncrypted',
      'The CloudWatch Log Group is not encrypted with an AWS KMS key - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      'To help protect sensitive data at rest, ensure encryption is enabled for your Amazon CloudWatch Log Groups.',
      NagMessageLevel.ERROR,
      hipaaSecurityCloudWatchLogGroupEncrypted,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-CloudWatchLogGroupRetentionPeriod',
      'The CloudWatch Log Group does not have an explicit retention period configured - (Control ID: 164.312(b)).',
      'Ensure a minimum duration of event log data is retained for your log groups to help with troubleshooting and forensics investigations. The lack of available past event log data makes it difficult to reconstruct and identify potentially malicious events.',
      NagMessageLevel.ERROR,
      hipaaSecurityCloudWatchLogGroupRetentionPeriod,
      ignores,
      node
    );
  }

  /**
   * Check CodeBuild Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkCodeBuild(node: CfnResource, ignores: any): void {
    this.applyRule(
      'HIPAA.Security-CodeBuildProjectEnvVarAwsCred',
      'The CodeBuild environment stores sensitive credentials (such as AWS_ACCESS_KEY_ID and/or AWS_SECRET_ACCESS_KEY) as plaintext environment variables - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1)).',
      'Do not store these variables in clear text. Storing these variables in clear text leads to unintended data exposure and unauthorized access.',
      NagMessageLevel.ERROR,
      hipaaSecurityCodeBuildProjectEnvVarAwsCred,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-CodeBuildProjectSourceRepoUrl',
      'The CodeBuild project which utilizes either a GitHub or BitBucket source repository does not utilize OAUTH - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1)).',
      'OAUTH is the most secure method of authenticating your CodeBuild application. Use OAuth instead of personal access tokens or a user name and password to grant authorization for accessing GitHub or Bitbucket repositories.',
      NagMessageLevel.ERROR,
      hipaaSecurityCodeBuildProjectSourceRepoUrl,
      ignores,
      node
    );
  }

  /**
   * Check DMS Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkDMS(node: CfnResource, ignores: any) {
    this.applyRule(
      'HIPAA.Security-DMSReplicationNotPublic',
      'The DMS replication instance is public - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      'DMS replication instances can contain sensitive information and access control is required for such accounts.',
      NagMessageLevel.ERROR,
      hipaaSecurityDMSReplicationNotPublic,
      ignores,
      node
    );
  }

  /**
   * Check DynamoDB Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkDynamoDB(node: CfnResource, ignores: any) {
    this.applyRule(
      'HIPAA.Security-DynamoDBPITREnabled',
      'The DynamoDB table does not have Point-in-time Recovery enabled - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B)).',
      'The recovery maintains continuous backups of your table for the last 35 days.',
      NagMessageLevel.ERROR,
      hipaaSecurityDynamoDBPITREnabled,
      ignores,
      node
    );
  }

  /**
   * Check EC2 Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkEC2(node: CfnResource, ignores: any): void {
    this.applyRule(
      'HIPAA.Security-EC2EBSOptimizedInstance',
      "The EC2 instance type 'supports' EBS optimization and does not have EBS optimization enabled - (Control ID: 164.308(a)(7)(i)).",
      'An optimized instance in Amazon Elastic Block Store (Amazon EBS) provides additional, dedicated capacity for Amazon EBS I/O operations. This optimization provides the most efficient performance for your EBS volumes by minimizing contention between Amazon EBS I/O operations and other traffic from your instance.',
      NagMessageLevel.ERROR,
      hipaaSecurityEC2EBSOptimizedInstance,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-EC2InstanceDetailedMonitoringEnabled',
      'The EC2 instance does not have detailed monitoring enabled - (Control IDs: 164.312(b)).',
      'Detailed monitoring provides additional monitoring information (such as 1-minute period graphs) on the AWS console.',
      NagMessageLevel.ERROR,
      hipaaSecurityEC2InstanceDetailedMonitoringEnabled,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-EC2InstanceNoPublicIps',
      'The EC2 instance is associated with a public IP address - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      'Amazon EC2 instances can contain sensitive information and access control is required for such resources.',
      NagMessageLevel.ERROR,
      hipaaSecurityEC2InstanceNoPublicIps,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-EC2InstanceProfileAttached',
      'The EC2 instance does not have an instance profile attached - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(A), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(B), 164.308(a)(4)(ii)(C), 164.312(a)(1)).',
      'EC2 instance profiles pass an IAM role to an EC2 instance. Attaching an instance profile to your instances can assist with least privilege and permissions management.',
      NagMessageLevel.ERROR,
      hipaaSecurityEC2InstanceProfileAttached,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-EC2InstancesInVPC',
      'The EC2 instance is not within a VPC - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      'Because of their logical isolation, domains that reside within an Amazon VPC have an extra layer of security when compared to domains that use public endpoints.',
      NagMessageLevel.ERROR,
      hipaaSecurityEC2InstancesInVPC,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-EC2RestrictedCommonPorts',
      'The EC2 instance allows unrestricted inbound IPv4 TCP traffic on common ports (20, 21, 3389, 3306, 4333) - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(B), 164.308(a)(4)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(B), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      'Not restricting access to ports to trusted sources can lead to attacks against the availability, integrity and confidentiality of systems. By default, common ports which should be restricted include port numbers 20, 21, 3389, 3306, and 4333.',
      NagMessageLevel.ERROR,
      hipaaSecurityEC2RestrictedCommonPorts,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-EC2RestrictedSSH',
      'The Security Group allows unrestricted SSH access - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(B), 164.308(a)(4)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(B), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1).',
      'Not allowing ingress (or remote) traffic from 0.0.0.0/0 or ::/0 to port 22 on your resources helps to restrict remote access.',
      NagMessageLevel.ERROR,
      hipaaSecurityEC2RestrictedSSH,
      ignores,
      node
    );
  }

  /**
   * Check ECS Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkECS(node: CfnResource, ignores: any): void {
    this.applyRule(
      'HIPAA.Security-ECSTaskDefinitionUserForHostMode',
      "The ECS task definition is configured for host networking and has at least one container with definitions with 'privileged' set to false or empty or 'user' set to root or empty - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(A), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1)).",
      'If a task definition has elevated privileges it is because you have specifically opted-in to those configurations. This rule checks for unexpected privilege escalation when a task definition has host networking enabled but the customer has not opted-in to elevated privileges.',
      NagMessageLevel.ERROR,
      hipaaSecurityECSTaskDefinitionUserForHostMode,
      ignores,
      node
    );
  }

  /**
   * Check EFS Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkEFS(node: CfnResource, ignores: any) {
    this.applyRule(
      'HIPAA.Security-EFSEncrypted',
      'The EFS does not have encryption at rest enabled - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      'Because sensitive data can exist and to help protect data at rest, ensure encryption is enabled for your Amazon Elastic File System (EFS).',
      NagMessageLevel.ERROR,
      hipaaSecurityEFSEncrypted,
      ignores,
      node
    );
  }

  /**
   * Check ElastiCache Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkElastiCache(node: CfnResource, ignores: any) {
    this.applyRule(
      'HIPAA.Security-ElastiCacheRedisClusterAutomaticBackup',
      'The ElastiCache Redis cluster does not retain automatic backups for at least 15 days - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B)).',
      'Automatic backups can help guard against data loss. If a failure occurs, you can create a new cluster, which restores your data from the most recent backup.',
      NagMessageLevel.ERROR,
      hipaaSecurityElastiCacheRedisClusterAutomaticBackup,
      ignores,
      node
    );
  }

  /**
   * Check Elastic Beanstalk Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkElasticBeanstalk(node: CfnResource, ignores: any): void {
    this.applyRule(
      'HIPAA.Security-ElasticBeanstalkEnhancedHealthReportingEnabled',
      'The Elastic Beanstalk environment does not have enhanced health reporting enabled - (Control ID: 164.312(b)).',
      'AWS Elastic Beanstalk enhanced health reporting enables a more rapid response to changes in the health of the underlying infrastructure. These changes could result in a lack of availability of the application. Elastic Beanstalk enhanced health reporting provides a status descriptor to gauge the severity of the identified issues and identify possible causes to investigate.',
      NagMessageLevel.ERROR,
      hipaaSecurityElasticBeanstalkEnhancedHealthReportingEnabled,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-ElasticBeanstalkManagedUpdatesEnabled',
      'The Elastic Beanstalk environment does not have managed updates enabled - (Control ID: 164.308(a)(5)(ii)(A)).',
      'Enabling managed platform updates for an Amazon Elastic Beanstalk environment ensures that the latest available platform fixes, updates, and features for the environment are installed. Keeping up to date with patch installation is a best practice in securing systems.',
      NagMessageLevel.ERROR,
      hipaaSecurityElasticBeanstalkManagedUpdatesEnabled,
      ignores,
      node
    );
  }

  /**
   * Check Elastic Load Balancer Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkELB(node: CfnResource, ignores: any): void {
    this.applyRule(
      'HIPAA.Security-ALBHttpDropInvalidHeaderEnabled',
      'The ALB does not have invalid HTTP header dropping enabled - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(1), 164.312(e)(2)(i), 164.312(e)(2)(ii)).',
      'Ensure that your Application Load Balancers (ALB) are configured to drop http headers. Because sensitive data can exist, enable encryption in transit to help protect that data.',
      NagMessageLevel.ERROR,
      hipaaSecurityALBHttpDropInvalidHeaderEnabled,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-ALBHttpToHttpsRedirection',
      "The ALB's HTTP listeners are not configured to redirect to HTTPS - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(1), 164.312(e)(2)(i), 164.312(e)(2)(ii)).",
      'To help protect data in transit, ensure that your Application Load Balancer automatically redirects unencrypted HTTP requests to HTTPS. Because sensitive data can exist, enable encryption in transit to help protect that data.',
      NagMessageLevel.ERROR,
      hipaaSecurityALBHttpToHttpsRedirection,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-ELBACMCertificateRequired',
      'The CLB does not utilize an SSL certificate provided by ACM (Amazon Certificate Manager) - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(1), 164.312(e)(2)(i), 164.312(e)(2)(ii)).',
      'Because sensitive data can exist and to help protect data at transit, ensure encryption is enabled for your Elastic Load Balancing. Use AWS Certificate Manager to manage, provision and deploy public and private SSL/TLS certificates with AWS services and internal resources.',
      NagMessageLevel.ERROR,
      hipaaSecurityELBACMCertificateRequired,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-ELBCrossZoneBalancingEnabled',
      'The CLB does not balance traffic between at least 2 Availability Zones - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(C)).',
      'The cross-zone load balancing reduces the need to maintain equivalent numbers of instances in each enabled availability zone.',
      NagMessageLevel.ERROR,
      hipaaSecurityELBCrossZoneBalancingEnabled,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-ELBDeletionProtectionEnabled',
      'The ALB, NLB, or GLB does not have deletion protection enabled - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(C)).',
      'Use this feature to prevent your load balancer from being accidentally or maliciously deleted, which can lead to loss of availability for your applications.',
      NagMessageLevel.ERROR,
      hipaaSecurityELBDeletionProtectionEnabled,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-ELBLoggingEnabled',
      'The ELB does not have logging enabled - (Control ID: 164.312(b)).',
      "Elastic Load Balancing activity is a central point of communication within an environment. Ensure ELB logging is enabled. The collected data provides detailed information about requests sent to The ELB. Each log contains information such as the time the request was received, the client's IP address, latencies, request paths, and server responses.",
      NagMessageLevel.ERROR,
      hipaaSecurityELBLoggingEnabled,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-ELBTlsHttpsListenersOnly',
      'The CLB does not restrict its listeners to only the SSL and HTTPS protocols - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(1), 164.312(e)(2)(i), 164.312(e)(2)(ii)).',
      'Because sensitive data can exist, enable encryption in transit to help protect that data.',
      NagMessageLevel.ERROR,
      hipaaSecurityELBTlsHttpsListenersOnly,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-ELBv2ACMCertificateRequired',
      'The ALB, NLB, or GLB listener does not utilize an SSL certificate provided by ACM (Amazon Certificate Manager) - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      'Because sensitive data can exist and to help protect data at transit, ensure encryption is enabled for your Elastic Load Balancing. Use AWS Certificate Manager to manage, provision and deploy public and private SSL/TLS certificates with AWS services and internal resources.',
      NagMessageLevel.ERROR,
      hipaaSecurityELBv2ACMCertificateRequired,
      ignores,
      node
    );
  }

  /**
   * Check EMR Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkEMR(node: CfnResource, ignores: any) {
    this.applyRule(
      'HIPAA.Security-EMRKerberosEnabled',
      'The EMR cluster does not have Kerberos enabled - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(A), 164.308(a)(3)(ii)(B), 164.308(a)(4)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(B), 164.308(a)(4)(ii)(C), 164.312(a)(1)).',
      'The access permissions and authorizations can be managed and incorporated with the principles of least privilege and separation of duties, by enabling Kerberos for Amazon EMR clusters.',
      NagMessageLevel.ERROR,
      hipaaSecurityEMRKerberosEnabled,
      ignores,
      node
    );
  }

  /**
   * Check IAM Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkIAM(node: CfnResource, ignores: any): void {
    this.applyRule(
      'HIPAA.Security-IAMNoInlinePolicy',
      'The IAM Group, User, or Role contains an inline policy - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(A), 164.308(a)(3)(ii)(B), 164.308(a)(4)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(B), 164.308(a)(4)(ii)(C), 164.312(a)(1)).',
      'AWS recommends to use managed policies instead of inline policies. The managed policies allow reusability, versioning and rolling back, and delegating permissions management.',
      NagMessageLevel.ERROR,
      hipaaSecurityIAMNoInlinePolicy,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-IAMPolicyNoStatementsWithAdminAccess',
      'The IAM policy grants admin access - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(A), 164.308(a)(3)(ii)(B), 164.308(a)(4)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(B), 164.308(a)(4)(ii)(C), 164.312(a)(1)).',
      'AWS Identity and Access Management (IAM) can help you incorporate the principles of least privilege and separation of duties with access permissions and authorizations, restricting policies from containing "Effect": "Allow" with "Action": "*" over "Resource": "*". Allowing users to have more privileges than needed to complete a task may violate the principle of least privilege and separation of duties.',
      NagMessageLevel.ERROR,
      hipaaSecurityIAMPolicyNoStatementsWithAdminAccess,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-IAMPolicyNoStatementsWithFullAccess',
      'The IAM policy grants full access - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(A), 164.308(a)(3)(ii)(B), 164.308(a)(4)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(B), 164.308(a)(4)(ii)(C), 164.312(a)(1)).',
      'Ensure IAM Actions are restricted to only those actions that are needed. Allowing users to have more privileges than needed to complete a task may violate the principle of least privilege and separation of duties.',
      NagMessageLevel.ERROR,
      hipaaSecurityIAMPolicyNoStatementsWithFullAccess,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-IAMUserGroupMembership',
      'The IAM user does not belong to any group(s) - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(A), 164.308(a)(3)(ii)(B), 164.308(a)(4)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(B), 164.308(a)(4)(ii)(C), 164.312(a)(1)).',
      'AWS Identity and Access Management (IAM) can help you restrict access permissions and authorizations, by ensuring IAM users are members of at least one group. Allowing users more privileges than needed to complete a task may violate the principle of least privilege and separation of duties.',
      NagMessageLevel.ERROR,
      hipaaSecurityIAMUserGroupMembership,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-IAMUserNoPolicies',
      'The IAM policy is attached at the user level - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(A), 164.308(a)(3)(ii)(B), 164.308(a)(4)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(B), 164.308(a)(4)(ii)(C), 164.312(a)(1)).',
      'Assigning privileges at the group or the role level helps to reduce opportunity for an identity to receive or retain excessive privileges.',
      NagMessageLevel.ERROR,
      hipaaSecurityIAMUserNoPolicies,
      ignores,
      node
    );
  }

  /**
   * Check Lambda Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkLambda(node: CfnResource, ignores: any) {
    this.applyRule(
      'HIPAA.Security-LambdaConcurrency',
      'The Lambda function is not configured with function-level concurrent execution limits - (Control ID: 164.312(b)).',
      "Ensure that a Lambda function's concurrency high and low limits are established. This can assist in baselining the number of requests that your function is serving at any given time.",
      NagMessageLevel.ERROR,
      hipaaSecurityLambdaConcurrency,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-LambdaDlq',
      'The Lambda function is not configured with a dead-letter configuration - (Control ID: 164.312(b)).',
      'Notify the appropriate personnel through Amazon Simple Queue Service (Amazon SQS) or Amazon Simple Notification Service (Amazon SNS) when a function has failed.',
      NagMessageLevel.ERROR,
      hipaaSecurityLambdaDlq,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-LambdaInsideVPC',
      'The Lambda function is not VPC enabled - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      'Because of their logical isolation, domains that reside within an Amazon VPC have an extra layer of security when compared to domains that use public endpoints.',
      NagMessageLevel.ERROR,
      hipaaSecurityLambdaInsideVPC,
      ignores,
      node
    );
  }

  /**
   * Check OpenSearch Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkOpenSearch(node: CfnResource, ignores: any) {
    this.applyRule(
      'HIPAA.Security-OpenSearchEncryptedAtRest',
      'The OpenSearch Service domain does not have encryption at rest enabled - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      'Because sensitive data can exist and to help protect data at rest, ensure encryption is enabled for your Amazon OpenSearch Service (OpenSearch Service) domains.',
      NagMessageLevel.ERROR,
      hipaaSecurityOpenSearchEncryptedAtRest,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-OpenSearchInVPCOnly',
      'The OpenSearch Service domain is not running within a VPC - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      'VPCs help secure your AWS resources and provide an extra layer of protection.',
      NagMessageLevel.ERROR,
      hipaaSecurityOpenSearchInVPCOnly,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-OpenSearchLogsToCloudWatch',
      'The OpenSearch Service domain does not stream error logs (ES_APPLICATION_LOGS) to CloudWatch Logs - (Control IDs: 164.308(a)(3)(ii)(A), 164.312(b)).',
      'Ensure Amazon OpenSearch Service domains have error logs enabled and streamed to Amazon CloudWatch Logs for retention and response. Domain error logs can assist with security and access audits, and can help to diagnose availability issues.',
      NagMessageLevel.ERROR,
      hipaaSecurityOpenSearchLogsToCloudWatch,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-OpenSearchNodeToNodeEncryption',
      'The OpenSearch Service domain does not have node-to-node encryption enabled - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(1), 164.312(e)(2)(i), 164.312(e)(2)(ii)).',
      'Because sensitive data can exist, enable encryption in transit to help protect that data within your Amazon OpenSearch Service (OpenSearch Service) domains.',
      NagMessageLevel.ERROR,
      hipaaSecurityOpenSearchNodeToNodeEncryption,
      ignores,
      node
    );
  }

  /**
   * Check RDS Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkRDS(node: CfnResource, ignores: any): void {
    this.applyRule(
      'HIPAA.Security-RDSAutomaticMinorVersionUpgradeEnabled',
      'The RDS DB instance does not have automatic minor version upgrades enabled - (Control ID: 164.308(a)(5)(ii)(A)).',
      'Enable automatic minor version upgrades on your Amazon Relational Database Service (RDS) instances to ensure the latest minor version updates to the Relational Database Management System (RDBMS) are installed, which may include security patches and bug fixes.',
      NagMessageLevel.ERROR,
      hipaaSecurityRDSAutomaticMinorVersionUpgradeEnabled,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-RDSEnhancedMonitoringEnabled',
      'The RDS DB instance does not enhanced monitoring enabled - (Control ID: 164.312(b)).',
      'Enable enhanced monitoring to help monitor Amazon RDS availability. This provides detailed visibility into the health of your Amazon RDS database instances.',
      NagMessageLevel.ERROR,
      hipaaSecurityRDSEnhancedMonitoringEnabled,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-RDSInstanceBackupEnabled',
      'The RDS DB instance does not have backups enabled - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B)).',
      'The backup feature of Amazon RDS creates backups of your databases and transaction logs.',
      NagMessageLevel.ERROR,
      hipaaSecurityRDSInstanceBackupEnabled,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-RDSInstanceDeletionProtectionEnabled',
      'The RDS DB instance or Aurora DB cluster does not have deletion protection enabled - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(C)).',
      'Ensure Amazon Relational Database Service (Amazon RDS) instances and clusters have deletion protection enabled. Use deletion protection to prevent your Amazon RDS DB instances and clusters from being accidentally or maliciously deleted, which can lead to loss of availability for your applications.',
      NagMessageLevel.ERROR,
      hipaaSecurityRDSInstanceDeletionProtectionEnabled,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-RDSInstanceMultiAZSupport',
      'The non-Aurora RDS DB instance does not have multi-AZ support enabled - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(C)).',
      'Multi-AZ support in Amazon Relational Database Service (Amazon RDS) provides enhanced availability and durability for database instances. When you provision a Multi-AZ database instance, Amazon RDS automatically creates a primary database instance, and synchronously replicates the data to a standby instance in a different Availability Zone. In case of an infrastructure failure, Amazon RDS performs an automatic failover to the standby so that you can resume database operations as soon as the failover is complete.',
      NagMessageLevel.ERROR,
      hipaaSecurityRDSInstanceMultiAZSupport,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-RDSInstancePublicAccess',
      'The RDS DB instance allows public access - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      'Amazon RDS database instances can contain sensitive information, and principles and access control is required for such accounts.',
      NagMessageLevel.ERROR,
      hipaaSecurityRDSInstancePublicAccess,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-RDSLoggingEnabled',
      'The RDS DB instance does not have all CloudWatch log types exported - (Control IDs: 164.308(a)(3)(ii)(A), 164.308(a)(5)(ii)(C)).',
      'To help with logging and monitoring within your environment, ensure Amazon Relational Database Service (Amazon RDS) logging is enabled. With Amazon RDS logging, you can capture events such as connections, disconnections, queries, or tables queried.',
      NagMessageLevel.ERROR,
      hipaaSecurityRDSLoggingEnabled,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-RDSStorageEncrypted',
      'The RDS DB instance or Aurora DB cluster does not have storage encrypted - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      'Because sensitive data can exist at rest in Amazon RDS DB instances and clusters, enable encryption at rest to help protect that data.',
      NagMessageLevel.ERROR,
      hipaaSecurityRDSStorageEncrypted,
      ignores,
      node
    );
  }

  /**
   * Check Redshift Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkRedshift(node: CfnResource, ignores: any): void {
    this.applyRule(
      'HIPAA.Security-RedshiftBackupEnabled',
      'The Redshift cluster does not have automated snapshots enabled or the retention period is not between 1 and 35 days - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B)).',
      'To help with data back-up processes, ensure your Amazon Redshift clusters have automated snapshots. When automated snapshots are enabled for a cluster, Redshift periodically takes snapshots of that cluster. By default, Redshift takes a snapshot every eight hours or every 5 GB per node of data changes, or whichever comes first.',
      NagMessageLevel.ERROR,
      hipaaSecurityRedshiftBackupEnabled,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-RedshiftClusterConfiguration',
      'The Redshift cluster does not have encryption or audit logging enabled - (Control IDs: 164.312(a)(2)(iv), 164.312(b), 164.312(e)(2)(ii)).',
      'To protect data at rest, ensure that encryption is enabled for your Amazon Redshift clusters. You must also ensure that required configurations are deployed on Amazon Redshift clusters. The audit logging should be enabled to provide information about connections and user activities in the database.',
      NagMessageLevel.ERROR,
      hipaaSecurityRedshiftClusterConfiguration,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-RedshiftClusterMaintenanceSettings',
      'The Redshift cluster has version upgrades enabled, automated snapshot retention periods enabled, and an explicit maintenance window configured - (Control IDs: 164.308(a)(5)(ii)(A), 164.308(a)(7)(ii)(A)).',
      'Ensure that Amazon Redshift clusters have the preferred settings for your organization. Specifically, that they have preferred maintenance windows and automated snapshot retention periods for the database.',
      NagMessageLevel.ERROR,
      hipaaSecurityRedshiftClusterMaintenanceSettings,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-RedshiftClusterPublicAccess',
      'The Redshift cluster allows public access - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      'Amazon Redshift clusters can contain sensitive information and principles and access control is required for such accounts.',
      NagMessageLevel.ERROR,
      hipaaSecurityRedshiftClusterPublicAccess,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-RedshiftEnhancedVPCRoutingEnabled',
      'The Redshift cluster does not have enhanced VPC routing enabled - (Control IDs: 164.312(e)(1)).',
      'Enhanced VPC routing forces all COPY and UNLOAD traffic between the cluster and data repositories to go through your Amazon VPC. You can then use VPC features such as security groups and network access control lists to secure network traffic. You can also use VPC flow logs to monitor network traffic.',
      NagMessageLevel.ERROR,
      hipaaSecurityRedshiftEnhancedVPCRoutingEnabled,
      ignores,
      node
    );
  }

  /**
   * Check Amazon S3 Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkS3(node: CfnResource, ignores: any): void {
    this.applyRule(
      'HIPAA.Security-S3BucketLevelPublicAccessProhibited',
      'The S3 bucket does not prohibit public access through bucket level settings - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      'Keep sensitive data safe from unauthorized remote users by preventing public access at the bucket level.',
      NagMessageLevel.ERROR,
      hipaaSecurityS3BucketLevelPublicAccessProhibited,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-S3BucketLoggingEnabled',
      'The S3 Bucket does not have server access logs enabled - (Control IDs: 164.308(a)(3)(ii)(A), 164.312(b)).',
      'Amazon Simple Storage Service (Amazon S3) server access logging provides a method to monitor the network for potential cybersecurity events. The events are monitored by capturing detailed records for the requests that are made to an Amazon S3 bucket. Each access log record provides details about a single access request. The details include the requester, bucket name, request time, request action, response status, and an error code, if relevant.',
      NagMessageLevel.ERROR,
      hipaaSecurityS3BucketLoggingEnabled,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-S3BucketPublicReadProhibited',
      'The S3 Bucket does not prohibit public read access through its Block Public Access configurations and bucket ACLs - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      'The management of access should be consistent with the classification of the data.',
      NagMessageLevel.ERROR,
      hipaaSecurityS3BucketPublicReadProhibited,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-S3BucketPublicWriteProhibited',
      'The S3 Bucket does not prohibit public write access through its Block Public Access configurations and bucket ACLs - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      'The management of access should be consistent with the classification of the data.',
      NagMessageLevel.ERROR,
      hipaaSecurityS3BucketPublicWriteProhibited,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-S3BucketReplicationEnabled',
      'The S3 Bucket does not have replication enabled - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B)).',
      'Amazon Simple Storage Service (Amazon S3) Cross-Region Replication (CRR) supports maintaining adequate capacity and availability. CRR enables automatic, asynchronous copying of objects across Amazon S3 buckets to help ensure that data availability is maintained.',
      NagMessageLevel.ERROR,
      hipaaSecurityS3BucketReplicationEnabled,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-S3BucketServerSideEncryptionEnabled',
      'The S3 Bucket does not have default server-side encryption enabled - (Control IDs: 164.312(a)(2)(iv), 164.312(c)(2), 164.312(e)(2)(ii)).',
      'Because sensitive data can exist at rest in Amazon S3 buckets, enable encryption to help protect that data.',
      NagMessageLevel.ERROR,
      hipaaSecurityS3BucketServerSideEncryptionEnabled,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-S3BucketVersioningEnabled',
      'The S3 Bucket does not have versioning enabled - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B), 164.312(c)(1), 164.312(c)(2)).',
      'Use versioning to preserve, retrieve, and restore every version of every object stored in your Amazon S3 bucket. Versioning helps you to easily recover from unintended user actions and application failures.',
      NagMessageLevel.ERROR,
      hipaaSecurityS3BucketVersioningEnabled,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-S3DefaultEncryptionKMS',
      'The S3 Bucket is not encrypted with a KMS Key by default - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      'Ensure that encryption is enabled for your Amazon Simple Storage Service (Amazon S3) buckets. Because sensitive data can exist at rest in an Amazon S3 bucket, enable encryption at rest to help protect that data.',
      NagMessageLevel.ERROR,
      hipaaSecurityS3DefaultEncryptionKMS,
      ignores,
      node
    );
  }

  /**
   * Check SageMaker Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkSageMaker(node: CfnResource, ignores: any) {
    this.applyRule(
      'HIPAA.Security-SageMakerEndpointConfigurationKMSKeyConfigured',
      'The SageMaker endpoint is not encrypted with a KMS key - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      'Because sensitive data can exist at rest in SageMaker endpoint, enable encryption at rest to help protect that data.',
      NagMessageLevel.ERROR,
      hipaaSecuritySageMakerEndpointConfigurationKMSKeyConfigured,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-SageMakerNotebookInstanceKMSKeyConfigured',
      'The SageMaker notebook is not encrypted with a KMS key - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      'Because sensitive data can exist at rest in SageMaker notebook, enable encryption at rest to help protect that data.',
      NagMessageLevel.ERROR,
      hipaaSecuritySageMakerNotebookInstanceKMSKeyConfigured,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-SageMakerNotebookNoDirectInternetAccess',
      'The SageMaker notebook does not disable direct internet access - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      'By preventing direct internet access, you can keep sensitive data from being accessed by unauthorized users.',
      NagMessageLevel.ERROR,
      hipaaSecuritySageMakerNotebookNoDirectInternetAccess,
      ignores,
      node
    );
  }

  /**
   * Check Secrets Manager Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkSecretsManager(node: CfnResource, ignores: any): void {
    this.applyRule(
      'HIPAA.Security-SecretsManagerUsingKMSKey',
      'The secret is not encrypted with a KMS Customer managed key - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      'To help protect data at rest, ensure encryption with AWS Key Management Service (AWS KMS) is enabled for AWS Secrets Manager secrets. Because sensitive data can exist at rest in Secrets Manager secrets, enable encryption at rest to help protect that data.',
      NagMessageLevel.ERROR,
      hipaaSecuritySecretsManagerUsingKMSKey,
      ignores,
      node
    );
  }

  /**
   * Check Amazon SNS Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkSNS(node: CfnResource, ignores: any): void {
    this.applyRule(
      'HIPAA.Security-SNSEncryptedKMS',
      'The SNS topic does not have KMS encryption enabled - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).',
      'Because sensitive data can exist at rest in published messages, enable encryption at rest to help protect that data.',
      NagMessageLevel.ERROR,
      hipaaSecuritySNSEncryptedKMS,
      ignores,
      node
    );
  }

  /**
   * Check VPC Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkVPC(node: CfnResource, ignores: any): void {
    this.applyRule(
      'HIPAA.Security-VPCDefaultSecurityGroupClosed',
      "The VPC's default security group allows inbound or outbound traffic - (Control ID: 164.312(e)(1)).",
      'When creating a VPC through CloudFormation, the default security group will always be open. Therefore it is important to always close the default security group after stack creation whenever a VPC is created. Restricting all the traffic on the default security group helps in restricting remote access to your AWS resources.',
      NagMessageLevel.WARN,
      hipaaSecurityVPCDefaultSecurityGroupClosed,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-VPCNoUnrestrictedRouteToIGW',
      "The route table may contain one or more unrestricted route(s) to an IGW ('0.0.0.0/0' or '::/0') - (Control ID: 164.312(e)(1)).",
      'Ensure Amazon EC2 route tables do not have unrestricted routes to an internet gateway. Removing or limiting the access to the internet for workloads within Amazon VPCs can reduce unintended access within your environment.',
      NagMessageLevel.ERROR,
      hipaaSecurityVPCNoUnrestrictedRouteToIGW,
      ignores,
      node
    );
    this.applyRule(
      'HIPAA.Security-VPCSubnetAutoAssignPublicIpDisabled',
      'The subnet auto-assigns public IP addresses - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).',
      'Manage access to the AWS Cloud by ensuring Amazon Virtual Private Cloud (VPC) subnets are not automatically assigned a public IP address. Amazon Elastic Compute Cloud (EC2) instances that are launched into subnets that have this attribute enabled have a public IP address assigned to their primary network interface.',
      NagMessageLevel.ERROR,
      hipaaSecurityVPCSubnetAutoAssignPublicIpDisabled,
      ignores,
      node
    );
  }
}
