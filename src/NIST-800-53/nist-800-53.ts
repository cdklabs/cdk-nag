/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnResource, IConstruct } from '@aws-cdk/core';
import { NagPack, NagMessageLevel } from '../common';
import {
  nist80053APIGWCacheEnabledAndEncrypted,
  nist80053APIGWExecutionLoggingEnabled,
} from './rules/apigw';
import { nist80053AutoScalingHealthChecks } from './rules/autoscaling';
import {
  nist80053CloudTrailCloudWatchLogsEnabled,
  nist80053CloudTrailEncryptionEnabled,
  nist80053CloudTrailLogFileValidationEnabled,
} from './rules/cloudtrail';
import {
  nist80053CloudWatchAlarmAction,
  nist80053CloudWatchLogGroupEncrypted,
} from './rules/cloudwatch';
import {
  nist80053CodeBuildCheckEnvVars,
  nist80053CodeBuildURLCheck,
} from './rules/codebuild';
import { nist80053DMSReplicationNotPublic } from './rules/dms';
import { nist80053DynamoDBPITREnabled } from './rules/dynamodb';
import {
  nist80053EC2CheckCommonPortsRestricted,
  nist80053EC2CheckDefaultSecurityGroupClosed,
  nist80053EC2CheckDetailedMonitoring,
  nist80053EC2CheckInsideVPC,
  nist80053EC2CheckNoPublicIPs,
  nist80053EC2CheckSSHRestricted,
} from './rules/ec2';
import { nist80053EFSEncrypted } from './rules/efs';
import { nist80053ElastiCacheRedisClusterAutomaticBackup } from './rules/elasticache';
import {
  nist80053ALBHttpDropInvalidHeaderEnabled,
  nist80053ALBHttpToHttpsRedirection,
  nist80053ELBCrossZoneBalancing,
  nist80053ELBDeletionProtectionEnabled,
  nist80053ELBListenersUseSSLOrHTTPS,
  nist80053ELBLoggingEnabled,
  nist80053ELBUseACMCerts,
} from './rules/elb';
import { nist80053EMRKerberosEnabled } from './rules/emr';
import {
  nist80053IAMGroupMembership,
  nist80053IAMNoInlinePolicy,
  nist80053IAMPolicyNoStatementsWithAdminAccess,
  nist80053IAMUserNoPolicies,
} from './rules/iam';
import { nist80053LambdaFunctionsInsideVPC } from './rules/lambda';
import {
  nist80053OpenSearchEncryptedAtRest,
  nist80053OpenSearchNodeToNodeEncrypted,
  nist80053OpenSearchRunningWithinVPC,
} from './rules/opensearch';
import {
  nist80053RDSEnhancedMonitoringEnabled,
  nist80053RDSInstanceBackupEnabled,
  nist80053RDSInstanceDeletionProtectionEnabled,
  nist80053RDSInstanceMultiAZSupport,
  nist80053RDSInstancePublicAccess,
  nist80053RDSLoggingEnabled,
  nist80053RDSStorageEncrypted,
} from './rules/rds';
import {
  nist80053RedshiftClusterConfiguration,
  nist80053RedshiftClusterPublicAccess,
} from './rules/redshift';
import {
  nist80053S3BucketDefaultLockEnabled,
  nist80053S3BucketLoggingEnabled,
  nist80053S3BucketPublicReadProhibited,
  nist80053S3BucketPublicWriteProhibited,
  nist80053S3BucketReplicationEnabled,
  nist80053S3BucketServerSideEncryptionEnabled,
  nist80053S3BucketVersioningEnabled,
} from './rules/s3';
import {
  nist80053SageMakerEndpointKMS,
  nist80053SageMakerNotebookDirectInternetAccessDisabled,
  nist80053SageMakerNotebookKMS,
} from './rules/sagemaker';
import { nist80053SNSEncryptedKMS } from './rules/sns';

/**
 * Check for NIST 800-53 compliance.
 * Based on the NIST 800-53 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-nist-800-53_rev_4.html
 */
export class NIST80053Checks extends NagPack {
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
      this.checkEFS(node, ignores);
      this.checkElastiCache(node, ignores);
      this.checkELB(node, ignores);
      this.checkEMR(node, ignores);
      this.checkIAM(node, ignores);
      this.checkLambda(node, ignores);
      this.checkOpenSearch(node, ignores);
      this.checkRDS(node, ignores);
      this.checkRedshift(node, ignores);
      this.checkS3(node, ignores);
      this.checkSageMaker(node, ignores);
      this.checkSNS(node, ignores);
    }
  }

  /**
   * Check API Gateway Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkAPIGW(node: CfnResource, ignores: any): void {
    this.applyRule({
      ruleId: 'NIST.800.53-APIGWCacheEnabledAndEncrypted',
      info: 'The API Gateway stage does not have caching enabled and encrypted for all methods - (Control IDs: SC-13, SC-28).',
      explanation:
        "To help protect data at rest, ensure encryption is enabled for your API Gateway stage's cache. Because sensitive data can be captured for the API method, enable encryption at rest to help protect that data.",
      level: NagMessageLevel.ERROR,
      rule: nist80053APIGWCacheEnabledAndEncrypted,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-APIGWExecutionLoggingEnabled',
      info: 'The API Gateway stage does not have execution logging enabled for all methods - (Control IDs: AU-2(a)(d), AU-3, AU-12(a)(c)).',
      explanation:
        'API Gateway logging displays detailed views of users who accessed the API and the way they accessed the API. This insight enables visibility of user activities.',
      level: NagMessageLevel.ERROR,
      rule: nist80053APIGWExecutionLoggingEnabled,
      ignores: ignores,
      node: node,
    });
  }

  /**
   * Check Auto Scaling Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkAutoScaling(node: CfnResource, ignores: any) {
    this.applyRule({
      ruleId: 'NIST.800.53-AutoScalingHealthChecks',
      info: 'The Auto Scaling group utilizes a load balancer and does not have an ELB health check configured - (Control IDs: SC-5).',
      explanation:
        'The Elastic Load Balancer (ELB) health checks for Amazon Elastic Compute Cloud (Amazon EC2) Auto Scaling groups support maintenance of adequate capacity and availability.',
      level: NagMessageLevel.ERROR,
      rule: nist80053AutoScalingHealthChecks,
      ignores: ignores,
      node: node,
    });
  }

  /**
   * Check CloudTrail Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkCloudTrail(node: CfnResource, ignores: any): void {
    this.applyRule({
      ruleId: 'NIST.800.53-CloudTrailCloudWatchLogsEnabled',
      info: 'The trail does not have CloudWatch logs enabled - (Control IDs: AC-2(4), AC-2(g), AU-2(a)(d), AU-3, AU-6(1)(3), AU-7(1), AU-12(a)(c), CA-7(a)(b), SI-4(2), SI-4(4), SI-4(5), SI-4(a)(b)(c)).',
      explanation:
        'Use Amazon CloudWatch to centrally collect and manage log event activity. Inclusion of AWS CloudTrail data provides details of API call activity within your AWS account.',
      level: NagMessageLevel.ERROR,
      rule: nist80053CloudTrailCloudWatchLogsEnabled,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-CloudTrailEncryptionEnabled',
      info: 'The trail does not have a KMS key ID or have encryption enabled - (Control ID: AU-9).',
      explanation:
        'Because sensitive data may exist and to help protect data at rest, ensure encryption is enabled for your AWS CloudTrail trails.',
      level: NagMessageLevel.ERROR,
      rule: nist80053CloudTrailEncryptionEnabled,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-CloudTrailLogFileValidationEnabled',
      info: 'The trail does not have log file validation enabled - (Control ID: AC-6).',
      explanation:
        'Utilize AWS CloudTrail log file validation to check the integrity of CloudTrail logs. Log file validation helps determine if a log file was modified or deleted or unchanged after CloudTrail delivered it. This feature is built using industry standard algorithms: SHA-256 for hashing and SHA-256 with RSA for digital signing. This makes it computationally infeasible to modify, delete or forge CloudTrail log files without detection.',
      level: NagMessageLevel.ERROR,
      rule: nist80053CloudTrailLogFileValidationEnabled,
      ignores: ignores,
      node: node,
    });
  }

  /**
   * Check CloudWatch Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkCloudWatch(node: CfnResource, ignores: any): void {
    this.applyRule({
      ruleId: 'NIST.800.53-CloudWatchAlarmAction',
      info: 'The CloudWatch alarm does not have at least one alarm action, one INSUFFICIENT_DATA action, or one OK action enabled - (Control IDs: AC-2(4), AU-6(1)(3), AU-7(1), CA-7(a)(b), IR-4(1), SI-4(2), SI-4(4), SI-4(5), SI-4(a)(b)(c)).',
      explanation:
        'Amazon CloudWatch alarms alert when a metric breaches the threshold for a specified number of evaluation periods. The alarm performs one or more actions based on the value of the metric or expression relative to a threshold over a number of time periods.',
      level: NagMessageLevel.ERROR,
      rule: nist80053CloudWatchAlarmAction,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-CloudWatchLogGroupEncrypted',
      info: 'The CloudWatch Log Group is not encrypted with an AWS KMS key - (Control IDs: AU-9, SC-13, SC-28).',
      explanation:
        'To help protect sensitive data at rest, ensure encryption is enabled for your Amazon CloudWatch Log Groups.',
      level: NagMessageLevel.ERROR,
      rule: nist80053CloudWatchLogGroupEncrypted,
      ignores: ignores,
      node: node,
    });
  }

  /**
   * Check CodeBuild Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkCodeBuild(node: CfnResource, ignores: any) {
    this.applyRule({
      ruleId: 'NIST.800.53-CodeBuildCheckEnvVars',
      info: 'The CodeBuild environment stores sensitive credentials (such as AWS_ACCESS_KEY_ID and/or AWS_SECRET_ACCESS_KEY) as plaintext environment variables - (Control IDs: AC-6, IA-5(7), SA-3(a)).',
      explanation:
        'Do not store these variables in clear text. Storing these variables in clear text leads to unintended data exposure and unauthorized access.',
      level: NagMessageLevel.ERROR,
      rule: nist80053CodeBuildCheckEnvVars,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-CodeBuildURLCheck',
      info: 'The CodeBuild project which utilizes either a GitHub or BitBucket source repository does not utilize OAUTH - (Control ID: SA-3(a)).',
      explanation:
        'OAUTH is the most secure method of authenticating your CodeBuild application. Use OAuth instead of personal access tokens or a user name and password to grant authorization for accessing GitHub or Bitbucket repositories.',
      level: NagMessageLevel.ERROR,
      rule: nist80053CodeBuildURLCheck,
      ignores: ignores,
      node: node,
    });
  }

  /**
   * Check DMS Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkDMS(node: CfnResource, ignores: any) {
    this.applyRule({
      ruleId: 'NIST.800.53-DMSReplicationNotPublic',
      info: 'The DMS replication instance is public - (Control IDs: AC-3).',
      explanation:
        'DMS replication instances can contain sensitive information and access control is required for such accounts.',
      level: NagMessageLevel.ERROR,
      rule: nist80053DMSReplicationNotPublic,
      ignores: ignores,
      node: node,
    });
  }

  /**
   * Check DynamoDB Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkDynamoDB(node: CfnResource, ignores: any) {
    this.applyRule({
      ruleId: 'NIST.800.53-DynamoDBPITREnabled',
      info: 'The DynamoDB table does not have Point-in-time Recovery enabled - (Control IDs: CP-9(b), CP-10, SI-12).',
      explanation:
        'The recovery maintains continuous backups of your table for the last 35 days.',
      level: NagMessageLevel.ERROR,
      rule: nist80053DynamoDBPITREnabled,
      ignores: ignores,
      node: node,
    });
  }

  /**
   * Check EC2 Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkEC2(node: CfnResource, ignores: any): void {
    this.applyRule({
      ruleId: 'NIST.800.53-EC2CheckDefaultSecurityGroupClosed',
      info: "The VPC's default security group allows inbound or outbound traffic - (Control IDs: AC-4, SC-7, SC-7(3)).",
      explanation:
        'When creating a VPC through CloudFormation, the default security group will always be open. Therefore it is important to always close the default security group after stack creation whenever a VPC is created. Restricting all the traffic on the default security group helps in restricting remote access to your AWS resources.',
      level: NagMessageLevel.WARN,
      rule: nist80053EC2CheckDefaultSecurityGroupClosed,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-EC2CheckDetailedMonitoring',
      info: 'The EC2 instance does not have detailed monitoring enabled - (Control IDs: CA-7(a)(b), SI-4(2), SI-4(a)(b)(c)).',
      explanation:
        'Detailed monitoring provides additional monitoring information (such as 1-minute period graphs) on the AWS console.',
      level: NagMessageLevel.ERROR,
      rule: nist80053EC2CheckDetailedMonitoring,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-EC2CheckInsideVPC',
      info: 'The EC2 instance is not within a VPC - (Control IDs: AC-4, SC-7, SC-7(3)).',
      explanation:
        'Because of their logical isolation, domains that reside within an Amazon VPC have an extra layer of security when compared to domains that use public endpoints.',
      level: NagMessageLevel.ERROR,
      rule: nist80053EC2CheckInsideVPC,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-EC2CheckNoPublicIPs',
      info: 'The EC2 instance is associated with a public IP address - (Control IDs: AC-4, AC-6, AC-21(b), SC-7, SC-7(3)). ',
      explanation:
        'Amazon EC2 instances can contain sensitive information and access control is required for such resources.',
      level: NagMessageLevel.ERROR,
      rule: nist80053EC2CheckNoPublicIPs,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-EC2CheckSSHRestricted',
      info: 'The Security Group allows unrestricted SSH access - (Control IDs: AC-4, SC-7, SC-7(3)).',
      explanation:
        'Not allowing ingress (or remote) traffic from 0.0.0.0/0 or ::/0 to port 22 on your resources helps to restrict remote access.',
      level: NagMessageLevel.ERROR,
      rule: nist80053EC2CheckSSHRestricted,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-EC2CheckCommonPortsRestricted',
      info: 'The EC2 instance allows unrestricted inbound IPv4 TCP traffic on common ports (20, 21, 3389, 3306, 4333) - (Control IDs: AC-4, CM-2, SC-7, SC-7(3)).',
      explanation:
        'Not restricting access to ports to trusted sources can lead to attacks against the availability, integrity and confidentiality of systems. By default, common ports which should be restricted include port numbers 20, 21, 3389, 3306, and 4333.',
      level: NagMessageLevel.ERROR,
      rule: nist80053EC2CheckCommonPortsRestricted,
      ignores: ignores,
      node: node,
    });
  }

  /**
   * Check EFS Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkEFS(node: CfnResource, ignores: any) {
    this.applyRule({
      ruleId: 'NIST.800.53-EFSEncrypted',
      info: 'The EFS does not have encryption at rest enabled - (Control IDs: SC-13, SC-28).',
      explanation:
        'Because sensitive data can exist and to help protect data at rest, ensure encryption is enabled for your Amazon Elastic File System (EFS).',
      level: NagMessageLevel.ERROR,
      rule: nist80053EFSEncrypted,
      ignores: ignores,
      node: node,
    });
  }

  /**
   * Check ElastiCache Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkElastiCache(node: CfnResource, ignores: any) {
    this.applyRule({
      ruleId: 'NIST.800.53-ElastiCacheRedisClusterAutomaticBackup',
      info: 'The ElastiCache Redis cluster does not retain automatic backups for at least 15 days - (Control IDs: CP-9(b), CP-10, SI-12).',
      explanation:
        'Automatic backups can help guard against data loss. If a failure occurs, you can create a new cluster, which restores your data from the most recent backup.',
      level: NagMessageLevel.ERROR,
      rule: nist80053ElastiCacheRedisClusterAutomaticBackup,
      ignores: ignores,
      node: node,
    });
  }

  /**
   * Check Elastic Load Balancer Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkELB(node: CfnResource, ignores: any): void {
    this.applyRule({
      ruleId: 'NIST.800.53-ALBHttpDropInvalidHeaderEnabled',
      info: 'The ALB does not have invalid HTTP header dropping enabled - (Control ID: AC-17(2)).',
      explanation:
        'Ensure that your Application Load Balancers (ALB) are configured to drop http headers. Because sensitive data can exist, enable encryption in transit to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: nist80053ALBHttpDropInvalidHeaderEnabled,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-ALBHttpToHttpsRedirection',
      info: "The ALB's HTTP listeners are not configured to redirect to HTTPS - (Control IDs: AC-17(2), SC-7, SC-8, SC-8(1), SC-13, SC-23).",
      explanation:
        'To help protect data in transit, ensure that your Application Load Balancer automatically redirects unencrypted HTTP requests to HTTPS. Because sensitive data can exist, enable encryption in transit to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: nist80053ALBHttpToHttpsRedirection,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-ELBCrossZoneBalancing',
      info: 'The CLB does not balance traffic between at least 2 Availability Zones - (Control IDs: SC-5, CP-10).',
      explanation:
        'The cross-zone load balancing reduces the need to maintain equivalent numbers of instances in each enabled availability zone.',
      level: NagMessageLevel.ERROR,
      rule: nist80053ELBCrossZoneBalancing,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-ELBDeletionProtectionEnabled',
      info: 'The ALB, NLB, or GLB does not have deletion protection enabled - (Control IDs: CM-2, CP-10).',
      explanation:
        'Use this feature to prevent your load balancer from being accidentally or maliciously deleted, which can lead to loss of availability for your applications.',
      level: NagMessageLevel.ERROR,
      rule: nist80053ELBDeletionProtectionEnabled,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-ELBListenersUseSSLOrHTTPS',
      info: 'The CLB does not restrict its listeners to only the SSL and HTTPS protocols - (Control IDs: AC-17(2), SC-7, SC-8, SC-8(1), SC-23).',
      explanation:
        'Because sensitive data can exist, enable encryption in transit to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: nist80053ELBListenersUseSSLOrHTTPS,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-ELBLoggingEnabled',
      info: 'The ELB does not have logging enabled - (Control ID: AU-2(a)(d)).',
      explanation:
        "Elastic Load Balancing activity is a central point of communication within an environment. Ensure ELB logging is enabled. The collected data provides detailed information about requests sent to The ELB. Each log contains information such as the time the request was received, the client's IP address, latencies, request paths, and server responses.",
      level: NagMessageLevel.ERROR,
      rule: nist80053ELBLoggingEnabled,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-ELBUseACMCerts',
      info: 'The CLB does not utilize an SSL certificate provided by ACM (Amazon Certificate Manager) - (Control IDs: AC-17(2), SC-7, SC-8, SC-8(1), SC-13).',
      explanation:
        'Because sensitive data can exist and to help protect data at transit, ensure encryption is enabled for your Elastic Load Balancing. Use AWS Certificate Manager to manage, provision and deploy public and private SSL/TLS certificates with AWS services and internal resources.',
      level: NagMessageLevel.ERROR,
      rule: nist80053ELBUseACMCerts,
      ignores: ignores,
      node: node,
    });
  }

  /**
   * Check EMR Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkEMR(node: CfnResource, ignores: any) {
    this.applyRule({
      ruleId: 'NIST.800.53-EMRKerberosEnabled',
      info: 'The EMR cluster does not have Kerberos enabled - (Control IDs: AC-2(j), AC-3, AC-5c, AC-6).',
      explanation:
        'The access permissions and authorizations can be managed and incorporated with the principles of least privilege and separation of duties, by enabling Kerberos for Amazon EMR clusters.',
      level: NagMessageLevel.ERROR,
      rule: nist80053EMRKerberosEnabled,
      ignores: ignores,
      node: node,
    });
  }

  /**
   * Check IAM Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkIAM(node: CfnResource, ignores: any): void {
    this.applyRule({
      ruleId: 'NIST.800.53-IAMGroupMembership',
      info: 'The IAM user does not belong to any group(s) - (Control IDs: AC-2(1), AC-2(j), AC-3, and AC-6).',
      explanation:
        'AWS Identity and Access Management (IAM) can help you restrict access permissions and authorizations, by ensuring IAM users are members of at least one group. Allowing users more privileges than needed to complete a task may violate the principle of least privilege and separation of duties.',
      level: NagMessageLevel.ERROR,
      rule: nist80053IAMGroupMembership,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-IAMNoInlinePolicy',
      info: 'The IAM Group, User, or Role contains an inline policy - (Control ID: AC-6).',
      explanation:
        'AWS recommends to use managed policies instead of inline policies. The managed policies allow reusability, versioning and rolling back, and delegating permissions management.',
      level: NagMessageLevel.ERROR,
      rule: nist80053IAMNoInlinePolicy,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-IAMPolicyNoStatementsWithAdminAccess',
      info: 'The IAM policy grants admin access - (Control IDs: AC-2(1), AC-2(j), AC-3, AC-6).',
      explanation:
        'AWS Identity and Access Management (IAM) can help you incorporate the principles of least privilege and separation of duties with access permissions and authorizations, restricting policies from containing "Effect": "Allow" with "Action": "*" over "Resource": "*". Allowing users to have more privileges than needed to complete a task may violate the principle of least privilege and separation of duties.',
      level: NagMessageLevel.ERROR,
      rule: nist80053IAMPolicyNoStatementsWithAdminAccess,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-IAMUserNoPolicies',
      info: 'The IAM policy is attached at the user level - (Control IDs: AC-2(j), AC-3, AC-5c, AC-6).',
      explanation:
        'Assigning privileges at the group or the role level helps to reduce opportunity for an identity to receive or retain excessive privileges.',
      level: NagMessageLevel.ERROR,
      rule: nist80053IAMUserNoPolicies,
      ignores: ignores,
      node: node,
    });
  }
  /**
   * Check Lambda Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkLambda(node: CfnResource, ignores: any) {
    this.applyRule({
      ruleId: 'NIST.800.53-LambdaFunctionsInsideVPC',
      info: 'The Lambda function is not VPC enabled - (Control IDs: AC-4, SC-7, SC-7(3)).',
      explanation:
        'Because of their logical isolation, domains that reside within an Amazon VPC have an extra layer of security when compared to domains that use public endpoints.',
      level: NagMessageLevel.ERROR,
      rule: nist80053LambdaFunctionsInsideVPC,
      ignores: ignores,
      node: node,
    });
  }

  /**
   * Check OpenSearch Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkOpenSearch(node: CfnResource, ignores: any) {
    this.applyRule({
      ruleId: 'NIST.800.53-OpenSearchEncryptedAtRest',
      info: 'The OpenSearch Service domain does not have encryption at rest enabled - (Control IDs: SC-13, SC-28).',
      explanation:
        'Because sensitive data can exist and to help protect data at rest, ensure encryption is enabled for your Amazon OpenSearch Service (OpenSearch Service) domains.',
      level: NagMessageLevel.ERROR,
      rule: nist80053OpenSearchEncryptedAtRest,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-OpenSearchNodeToNodeEncrypted',
      info: 'The OpenSearch Service domain does not have node-to-node encryption enabled - (Control IDs: SC-7, SC-8, SC-8(1)).',
      explanation:
        'Because sensitive data can exist, enable encryption in transit to help protect that data within your Amazon OpenSearch Service (OpenSearch Service) domains.',
      level: NagMessageLevel.ERROR,
      rule: nist80053OpenSearchNodeToNodeEncrypted,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-OpenSearchRunningWithinVPC',
      info: 'The OpenSearch Service domain is not running within a VPC - (Control IDs: AC-4, SC-7, SC-7(3)).',
      explanation:
        'VPCs help secure your AWS resources and provide an extra layer of protection.',
      level: NagMessageLevel.ERROR,
      rule: nist80053OpenSearchRunningWithinVPC,
      ignores: ignores,
      node: node,
    });
  }

  /**
   * Check Amazon RDS Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkRDS(node: CfnResource, ignores: any): void {
    this.applyRule({
      ruleId: 'NIST.800.53-RDSEnhancedMonitoringEnabled',
      info: 'The RDS DB instance does not enhanced monitoring enabled - (Control ID: CA-7(a)(b)).',
      explanation:
        'Enable enhanced monitoring to help monitor Amazon RDS availability. This provides detailed visibility into the health of your Amazon RDS database instances.',
      level: NagMessageLevel.ERROR,
      rule: nist80053RDSEnhancedMonitoringEnabled,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-RDSInstanceBackupEnabled',
      info: 'The RDS DB instance does not have backups enabled - (Control IDs: CP-9(b), CP-10, SI-12).',
      explanation:
        'The backup feature of Amazon RDS creates backups of your databases and transaction logs.',
      level: NagMessageLevel.ERROR,
      rule: nist80053RDSInstanceBackupEnabled,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-RDSInstanceDeletionProtectionEnabled',
      info: 'The RDS DB instance or Aurora DB cluster does not have deletion protection enabled - (Control ID: SC-5).',
      explanation:
        'Ensure Amazon Relational Database Service (Amazon RDS) instances and clusters have deletion protection enabled. Use deletion protection to prevent your Amazon RDS DB instances and clusters from being accidentally or maliciously deleted, which can lead to loss of availability for your applications.',
      level: NagMessageLevel.ERROR,
      rule: nist80053RDSInstanceDeletionProtectionEnabled,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-RDSInstanceMultiAZSupport',
      info: 'The non-Aurora RDS DB instance does not have multi-AZ support enabled - (Control IDs: CP-10, SC-5, SC-36).',
      explanation:
        'Multi-AZ support in Amazon Relational Database Service (Amazon RDS) provides enhanced availability and durability for database instances. When you provision a Multi-AZ database instance, Amazon RDS automatically creates a primary database instance, and synchronously replicates the data to a standby instance in a different Availability Zone. In case of an infrastructure failure, Amazon RDS performs an automatic failover to the standby so that you can resume database operations as soon as the failover is complete.',
      level: NagMessageLevel.ERROR,
      rule: nist80053RDSInstanceMultiAZSupport,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-RDSInstancePublicAccess',
      info: 'The RDS DB instance allows public access - (Control IDs: AC-4, AC-6, AC-21(b), SC-7, SC-7(3)).',
      explanation:
        'Amazon RDS database instances can contain sensitive information, and principles and access control is required for such accounts.',
      level: NagMessageLevel.ERROR,
      rule: nist80053RDSInstancePublicAccess,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-RDSLoggingEnabled',
      info: 'The RDS DB instance does not have all CloudWatch log types exported - (Control IDs: AC-2(4), AC-2(g), AU-2(a)(d), AU-3, AU-12(a)(c)).',
      explanation:
        'To help with logging and monitoring within your environment, ensure Amazon Relational Database Service (Amazon RDS) logging is enabled. With Amazon RDS logging, you can capture events such as connections, disconnections, queries, or tables queried.',
      level: NagMessageLevel.ERROR,
      rule: nist80053RDSLoggingEnabled,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-RDSStorageEncrypted',
      info: 'The RDS DB instance or Aurora DB cluster does not have storage encrypted - (Control IDs: SC-13, SC-28).',
      explanation:
        'Because sensitive data can exist at rest in Amazon RDS DB instances and clusters, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: nist80053RDSStorageEncrypted,
      ignores: ignores,
      node: node,
    });
  }

  /**
   * Check Redshift Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkRedshift(node: CfnResource, ignores: any): void {
    this.applyRule({
      ruleId: 'NIST.800.53-RedshiftClusterConfiguration',
      info: 'The Redshift cluster does not have encryption or audit logging enabled - (Control IDs: AC-2(4), AC-2(g), AU-2(a)(d), AU-3, AU-12(a)(c), SC-13).',
      explanation:
        'To protect data at rest, ensure that encryption is enabled for your Amazon Redshift clusters. You must also ensure that required configurations are deployed on Amazon Redshift clusters. The audit logging should be enabled to provide information about connections and user activities in the database.',
      level: NagMessageLevel.ERROR,
      rule: nist80053RedshiftClusterConfiguration,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-RedshiftClusterPublicAccess',
      info: 'The Redshift cluster allows public access - (Control IDs: AC-3, AC-4, AC-6, AC-21(b), SC-7, SC-7(3)).',
      explanation:
        'Amazon Redshift clusters can contain sensitive information and principles and access control is required for such accounts.',
      level: NagMessageLevel.ERROR,
      rule: nist80053RedshiftClusterPublicAccess,
      ignores: ignores,
      node: node,
    });
  }

  /**
   * Check Amazon S3 Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkS3(node: CfnResource, ignores: any): void {
    this.applyRule({
      ruleId: 'NIST.800.53-S3BucketDefaultLockEnabled',
      info: 'The S3 Bucket does not have object lock enabled - (Control ID: SC-28).',
      explanation:
        'Because sensitive data can exist at rest in S3 buckets, enforce object locks at rest to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: nist80053S3BucketDefaultLockEnabled,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-S3BucketLoggingEnabled',
      info: 'The S3 Bucket does not have server access logs enabled - (Control IDs: AC-2(g), AU-2(a)(d), AU-3, AU-12(a)(c)).',
      explanation:
        'Amazon Simple Storage Service (Amazon S3) server access logging provides a method to monitor the network for potential cybersecurity events. The events are monitored by capturing detailed records for the requests that are made to an Amazon S3 bucket. Each access log record provides details about a single access request. The details include the requester, bucket name, request time, request action, response status, and an error code, if relevant.',
      level: NagMessageLevel.ERROR,
      rule: nist80053S3BucketLoggingEnabled,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-S3BucketPublicReadProhibited',
      info: 'The S3 Bucket does not prohibit public read access through its Block Public Access configurations and bucket ACLs - (Control IDs: AC-3, AC-4, AC-6, AC-21(b), SC-7, SC-7(3)).',
      explanation:
        'The management of access should be consistent with the classification of the data.',
      level: NagMessageLevel.ERROR,
      rule: nist80053S3BucketPublicReadProhibited,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-S3BucketPublicWriteProhibited',
      info: 'The S3 Bucket does not prohibit public write access through its Block Public Access configurations and bucket ACLs - (Control IDs: AC-3, AC-4, AC-6, AC-21(b), SC-7, SC-7(3)).',
      explanation:
        'The management of access should be consistent with the classification of the data.',
      level: NagMessageLevel.ERROR,
      rule: nist80053S3BucketPublicWriteProhibited,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-S3BucketReplicationEnabled',
      info: 'The S3 Bucket does not have replication enabled - (Control IDs: AU-9(2), CP-9(b), CP-10, SC-5, SC-36).',
      explanation:
        'Amazon Simple Storage Service (Amazon S3) Cross-Region Replication (CRR) supports maintaining adequate capacity and availability. CRR enables automatic, asynchronous copying of objects across Amazon S3 buckets to help ensure that data availability is maintained.',
      level: NagMessageLevel.ERROR,
      rule: nist80053S3BucketReplicationEnabled,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-S3BucketServerSideEncryptionEnabled',
      info: 'The S3 Bucket does not have default server-side encryption enabled - (Control IDs: AU-9(2), CP-9(b), CP-10, SC-5, SC-36).',
      explanation:
        'Because sensitive data can exist at rest in Amazon S3 buckets, enable encryption to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: nist80053S3BucketServerSideEncryptionEnabled,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-S3BucketVersioningEnabled',
      info: 'The S3 Bucket does not have versioning enabled - (Control IDs: CP-10, SI-12).',
      explanation:
        'Use versioning to preserve, retrieve, and restore every version of every object stored in your Amazon S3 bucket. Versioning helps you to easily recover from unintended user actions and application failures.',
      level: NagMessageLevel.ERROR,
      rule: nist80053S3BucketVersioningEnabled,
      ignores: ignores,
      node: node,
    });
  }

  /**
   * Check SageMaker Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkSageMaker(node: CfnResource, ignores: any) {
    this.applyRule({
      ruleId: 'NIST.800.53-SageMakerEndpointKMS',
      info: 'The SageMaker endpoint is not encrypted with a KMS key - (Control IDs: SC-13, SC-28).',
      explanation:
        'Because sensitive data can exist at rest in SageMaker endpoint, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: nist80053SageMakerEndpointKMS,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-SageMakerNotebookDirectInternetAccessDisabled',
      info: 'The SageMaker notebook does not disable direct internet access - (Control IDs: AC-3, AC-4, AC-6, AC-21(b), SC-7, SC-7(3)).',
      explanation:
        'By preventing direct internet access, you can keep sensitive data from being accessed by unauthorized users.',
      level: NagMessageLevel.ERROR,
      rule: nist80053SageMakerNotebookDirectInternetAccessDisabled,
      ignores: ignores,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53-SageMakerNotebookKMS',
      info: 'The SageMaker notebook is not encrypted with a KMS key - (Control IDs: SC-13, SC-28).',
      explanation:
        'Because sensitive data can exist at rest in SageMaker notebook, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: nist80053SageMakerNotebookKMS,
      ignores: ignores,
      node: node,
    });
  }

  /**
   * Check Amazon SNS Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkSNS(node: CfnResource, ignores: any): void {
    this.applyRule({
      ruleId: 'NIST.800.53-SNSEncryptedKMS',
      info: 'The SNS topic does not have KMS encryption enabled - (Control IDs: SC-13, SC-28).',
      explanation:
        'Because sensitive data can exist at rest in published messages, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: nist80053SNSEncryptedKMS,
      ignores: ignores,
      node: node,
    });
  }
}
