/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { Annotations, CfnResource, IConstruct } from '@aws-cdk/core';
import { NagPack } from '../common';
import {
  nist80053APIGWCacheEnabledAndEncrypted,
  nist80053APIGWExecutionLoggingEnabled,
} from './rules/apigw';
import {
  nist80053CloudTrailLogFileValidationEnabled,
  nist80053CloudTrailCloudWatchLogsEnabled,
  nist80053CloudTrailEncryptionEnabled,
} from './rules/cloudtrail/index';
import { nist80053DMSReplicationNotPublic } from './rules/dms';
import { nist80053DynamoDBPITREnabled } from './rules/dynamodb';
import {
  nist80053EC2CheckDetailedMonitoring,
  nist80053EC2CheckInsideVPC,
  nist80053EC2CheckNoPublicIPs,
  nist80053EC2CheckSSHRestricted,
} from './rules/ec2';
import { nist80053EFSEncrypted } from './rules/efs';
import { nist80053ElasticacheRedisClusterAutomaticBackup } from './rules/elasticache';
import {
  nist80053ALBHttpDropInvalidHeaderEnabled,
  nist80053ALBHttpToHttpsRedirection,
  nist80053ELBLoggingEnabled,
  nist80053ALBLoggingEnabled,
} from './rules/elb';
import { nist80053EMRKerberosEnabled } from './rules/emr';
import {
  nist80053IamGroupMembership,
  nist80053IamNoInlinePolicy,
  nist80053IamPolicyNoStatementsWithAdminAccess,
  nist80053IamUserNoPolicies,
} from './rules/iam';
import {
  nist80053RDSLoggingEnabled,
  nist80053RDSEnhancedMonitoringEnabled,
  nist80053RDSInstanceDeletionProtectionEnabled,
  nist80053RDSInstanceMultiAZSupport,
  nist80053RDSInstancePublicAccess,
  nist80053RDSStorageEncrypted,
  nist80053RDSInstanceBackupEnabled,
} from './rules/rds';
import {
  nist80053RedshiftClusterConfiguration,
  nist80053RedshiftClusterPublicAccess,
} from './rules/redshift';
import { nist80053S3BucketLoggingEnabled } from './rules/s3';
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
      this.checkCloudTrail(node, ignores);
      this.checkDMS(node, ignores);
      this.checkDynamoDB(node, ignores);
      this.checkEC2(node, ignores);
      this.checkEFS(node, ignores);
      this.checkElasticache(node, ignores);
      this.checkELB(node, ignores);
      this.checkEMR(node, ignores);
      this.checkIAM(node, ignores);
      this.checkS3(node, ignores);
      this.checkSNS(node, ignores);
      this.checkRDS(node, ignores);
      this.checkRedshift(node, ignores);
    }
  }

  /**
   * Check API Gateway Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkAPIGW(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-APIGWCacheEnabledAndEncrypted') &&
      !nist80053APIGWCacheEnabledAndEncrypted(node)
    ) {
      const ruleId = 'NIST.800.53-APIGWCacheEnabledAndEncrypted';
      const info =
        'The  API Gateway stage does not have caching enabled and encrypted for all methods - (Control IDs: SC-13, SC-28).';
      const explanation =
        "To help protect data at rest, ensure encryption is enabled for your API Gateway stage's cache. Because sensitive data can be captured for the API method, enable encryption at rest to help protect that data.";
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }

    if (
      !this.ignoreRule(ignores, 'NIST.800.53-APIGWExecutionLoggingEnabled') &&
      !nist80053APIGWExecutionLoggingEnabled(node)
    ) {
      const ruleId = 'NIST.800.53-APIGWExecutionLoggingEnabled';
      const info =
        'The API Gateway stage does not have execution logging enabled for all methods - (Control IDs: AU-2(a)(d), AU-3, AU-12(a)(c)).';
      const explanation =
        'API Gateway logging displays detailed views of users who accessed the API and the way they accessed the API. This insight enables visibility of user activities.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check DMS Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkDMS(node: CfnResource, ignores: any) {
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-DMSReplicationNotPublic') &&
      !nist80053DMSReplicationNotPublic(node)
    ) {
      const ruleId = 'NIST.800.53-DMSReplicationNotPublic';
      const info =
        'The DMS replication instance is public (Control IDs: AC-3).';
      const explanation =
        'DMS replication instances can contain sensitive information and access control is required for such accounts.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check CloudTrail Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkCloudTrail(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(
        ignores,
        'NIST.800.53-CloudTrailCloudWatchLogsEnabled'
      ) &&
      !nist80053CloudTrailCloudWatchLogsEnabled(node)
    ) {
      const ruleId = 'NIST.800.53-CloudTrailCloudWatchLogsEnabled';
      const info =
        'The trail does not have CloudWatch logs enabled - (Control IDs: AC-2(4), AC-2(g), AU-2(a)(d), AU-3, AU-6(1)(3), AU-7(1), AU-12(a)(c), CA-7(a)(b), SI-4(2), SI-4(4), SI-4(5), SI-4(a)(b)(c)).';
      const explanation =
        'Use Amazon CloudWatch to centrally collect and manage log event activity. Inclusion of AWS CloudTrail data provides details of API call activity within your AWS account.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }

    if (
      !this.ignoreRule(ignores, 'NIST.800.53-CloudTrailEncryptionEnabled') &&
      !nist80053CloudTrailEncryptionEnabled(node)
    ) {
      const ruleId = 'NIST.800.53-CloudTrailEncryptionEnabled';
      const info =
        'The trail does not have a KMS key ID or have encryption enabled - (Control ID: AU-9).';
      const explanation =
        'Because sensitive data may exist and to help protect data at rest, ensure encryption is enabled for your AWS CloudTrail trails.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }

    if (
      !this.ignoreRule(
        ignores,
        'NIST.800.53-CloudTrailLogFileValidationEnabled'
      ) &&
      !nist80053CloudTrailLogFileValidationEnabled(node)
    ) {
      const ruleId = 'NIST.800.53-CloudTrailLogFileValidationEnabled';
      const info =
        'The trail does not have log file validation enabled - (Control ID: AC-6).';
      const explanation =
        'Utilize AWS CloudTrail log file validation to check the integrity of CloudTrail logs. Log file validation helps determine if a log file was modified or deleted or unchanged after CloudTrail delivered it. This feature is built using industry standard algorithms: SHA-256 for hashing and SHA-256 with RSA for digital signing. This makes it computationally infeasible to modify, delete or forge CloudTrail log files without detection.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * CheckDynamoDB Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkDynamoDB(node: CfnResource, ignores: any) {
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-DynamoDBPITREnabled') &&
      !nist80053DynamoDBPITREnabled(node)
    ) {
      const ruleId = 'NIST.800.53-DynamoDBPITREnabled';
      const info =
        'The DynamoDB table does not have Point-in-time Recovery enabled (Control IDs: CP-9(b), CP-10, SI-12).';
      const explanation =
        'The recovery maintains continuous backups of your table for the last 35 days.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check EC2 Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkEC2(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-EC2CheckDetailedMonitoring') &&
      !nist80053EC2CheckDetailedMonitoring(node)
    ) {
      const ruleId = 'NIST.800.53-EC2CheckDetailedMonitoring';
      const info =
        'The EC2 instance does not have detailed monitoring enabled - (Control IDs: CA-7(a)(b), SI-4(2), SI-4(a)(b)(c)).';
      const explanation =
        'Detailed monitoring provides additional monitoring information (such as 1-minute period graphs) on the AWS console.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-EC2CheckInsideVPC') &&
      !nist80053EC2CheckInsideVPC(node)
    ) {
      const ruleId = 'NIST.800.53-EC2CheckInsideVPC';
      const info =
        'The EC2 instance is not within a VPC - (Control IDs: AC-4, SC-7, SC-7(3)).';
      const explanation =
        'Because of their logical isolation, domains that reside within an Amazon VPC have an extra layer of security when compared to domains that use public endpoints.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-EC2CheckNoPublicIPs') &&
      !nist80053EC2CheckNoPublicIPs(node)
    ) {
      const ruleId = 'NIST.800.53-EC2CheckNoPublicIPs';
      const info =
        'The EC2 instance is associated with a public IP address - (Control IDs: AC-4, AC-6, AC-21(b), SC-7, SC-7(3)). ';
      const explanation =
        'Amazon EC2 instances can contain sensitive information and access control is required for such resources.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-EC2CheckSSHRestricted') &&
      !nist80053EC2CheckSSHRestricted(node)
    ) {
      const ruleId = 'NIST.800.53-EC2CheckSSHRestricted';
      const info =
        'The Security Group allows unrestricted SSH access - (Control IDs: AC-4, SC-7, SC-7(3)).';
      const explanation =
        'Not allowing ingress (or remote) traffic from 0.0.0.0/0 or ::/0 to port 22 on your resources helps to restrict remote access.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check EFS Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkEFS(node: CfnResource, ignores: any) {
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-EFSEncrypted') &&
      !nist80053EFSEncrypted(node)
    ) {
      const ruleId = 'NIST.800.53-EFSEncrypted';
      const info =
        'The EFS does not have encryption at rest enabled - (Control IDs: SC-13, SC-28).';
      const explanation =
        'Because sensitive data can exist and to help protect data at rest, ensure encryption is enabled for your Amazon Elastic File System (EFS).';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check Elasticache Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkElasticache(node: CfnResource, ignores: any) {
    if (
      !this.ignoreRule(
        ignores,
        'NIST.800.53-ElasticacheRedisClusterAutomaticBackup'
      ) &&
      !nist80053ElasticacheRedisClusterAutomaticBackup(node)
    ) {
      const ruleId = 'NIST.800.53-ElasticacheRedisClusterAutomaticBackup';
      const info =
        'The ElastiCache Redis cluster does not retain automatic backups for at least 15 days (Control IDs: CP-9(b), CP-10, SI-12).';
      const explanation =
        'Automatic backups can help guard against data loss. If a failure occurs, you can create a new cluster, which restores your data from the most recent backup.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check Elastic Load Balancer Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkELB(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(
        ignores,
        'NIST.800.53-ALBHttpDropInvalidHeaderEnabled'
      ) &&
      !nist80053ALBHttpDropInvalidHeaderEnabled(node)
    ) {
      const ruleId = 'NIST.800.53-ALBHttpDropInvalidHeaderEnabled';
      const info =
        'The Application Load Balancer does not have invalid http header dropping enabled - (Control ID: AC-17(2)).';
      const explanation =
        'Ensure that your Application Load Balancers (ALB) are configured to drop http headers. Because sensitive data can exist, enable encryption in transit to help protect that data.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }

    if (
      !this.ignoreRule(ignores, 'NIST.800.53-ELBLoggingEnabled') &&
      !nist80053ELBLoggingEnabled(node)
    ) {
      const ruleId = 'NIST.800.53-ELBLoggingEnabled';
      const info =
        'The Elastic Load Balancer does not have logging enabled - (Control ID: AU-2(a)(d)).';
      const explanation =
        "Elastic Load Balancing activity is a central point of communication within an environment. Ensure ELB logging is enabled. The collected data provides detailed information about requests sent to the ELB. Each log contains information such as the time the request was received, the client's IP address, latencies, request paths, and server responses.";
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }

    if (
      !this.ignoreRule(ignores, 'NIST.800.53-ALBLoggingEnabled') &&
      !nist80053ALBLoggingEnabled(node)
    ) {
      const ruleId = 'NIST.800.53-ALBLoggingEnabled';
      const info =
        'The Application Load Balancer does not have logging enabled - (Control ID: AU-2(a)(d)).';
      const explanation =
        "Application Load Balancing activity is a central point of communication within an environment. Ensure ALB logging is enabled. The collected data provides detailed information about requests sent to the ALB. Each log contains information such as the time the request was received, the client's IP address, latencies, request paths, and server responses.";
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }

    if (
      !this.ignoreRule(ignores, 'NIST.800.53-ALBHttpToHttpsRedirection') &&
      !nist80053ALBHttpToHttpsRedirection(node)
    ) {
      const ruleId = 'NIST.800.53-ALBHttpToHttpsRedirection';
      const info = `The ALB's Http listeners are not configured to redirect to https - (Control IDs: AC-17(2), SC-7, SC-8, SC-8(1), SC-13, SC-23).`;
      const explanation =
        'To help protect data in transit, ensure that your Application Load Balancer automatically redirects unencrypted HTTP requests to HTTPS. Because sensitive data can exist, enable encryption in transit to help protect that data.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check EMR Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkEMR(node: CfnResource, ignores: any) {
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-EMRKerberosEnabled') &&
      !nist80053EMRKerberosEnabled(node)
    ) {
      const ruleId = 'NIST.800.53-EMRKerberosEnabled';
      const info =
        'The EMR cluster does not have Kerberos enabled - (Control IDs: AC-2(j), AC-3, AC-5c, AC-6).';
      const explanation =
        'The access permissions and authorizations can be managed and incorporated with the principles of least privilege and separation of duties, by enabling Kerberos for Amazon EMR clusters.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check IAM Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkIAM(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-IAMGroupMembershipCheck') &&
      !nist80053IamGroupMembership(node)
    ) {
      const ruleId = 'NIST.800.53-IAMGroupMembershipCheck';
      const info =
        'The IAM user does not belong to any group(s) - (Control IDs: AC-2(1), AC-2(j), AC-3, and AC-6).';
      const explanation =
        'AWS Identity and Access Management (IAM) can help you restrict access permissions and authorizations, by ensuring IAM users are members of at least one group. Allowing users more privileges than needed to complete a task may violate the principle of least privilege and separation of duties.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }

    if (
      !this.ignoreRule(ignores, 'NIST.800.53-IAMUserNoPoliciesCheck') &&
      !nist80053IamUserNoPolicies(node)
    ) {
      const ruleId = 'NIST.800.53-IAMUserNoPoliciesCheck';
      const info =
        'The IAM policy is attached at the user level - (Control IDs: AC-2(j), AC-3, AC-5c, AC-6).';
      const explanation =
        'Assigning privileges at the group or the role level helps to reduce opportunity for an identity to receive or retain excessive privileges.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }

    if (
      !this.ignoreRule(ignores, 'NIST.800.53-IAMNoInlinePolicyCheck') &&
      !nist80053IamNoInlinePolicy(node)
    ) {
      const ruleId = 'NIST.800.53-IAMNoInlinePolicyCheck';
      const info =
        'The IAM Group, User, or Role contains an inline policy - (Control ID: AC-6).';
      const explanation =
        'AWS recommends to use managed policies instead of inline policies. The managed policies allow reusability, versioning and rolling back, and delegating permissions management.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }

    if (
      !this.ignoreRule(
        ignores,
        'NIST.800.53-IAMPolicyNoStatementsWithAdminAccess'
      ) &&
      !nist80053IamPolicyNoStatementsWithAdminAccess(node)
    ) {
      const ruleId = 'NIST.800.53-IAMPolicyNoStatementsWithAdminAccess';
      const info =
        'The IAM policy grants admin access - (Control IDs AC-2(1), AC-2(j), AC-3, AC-6).';
      const explanation =
        'AWS Identity and Access Management (IAM) can help you incorporate the principles of least privilege and separation of duties with access permissions and authorizations, restricting policies from containing "Effect": "Allow" with "Action": "*" over "Resource": "*". Allowing users to have more privileges than needed to complete a task may violate the principle of least privilege and separation of duties.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check Amazon S3 Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkS3(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-S3BucketLoggingEnabled') &&
      !nist80053S3BucketLoggingEnabled(node)
    ) {
      const ruleId = 'NIST.800.53-S3BucketLoggingEnabled';
      const info =
        'The S3 Bucket does not have server access logs enabled - (Control IDs: AC-2(g), AU-2(a)(d), AU-3, AU-12(a)(c)).';
      const explanation =
        'Amazon Simple Storage Service (Amazon S3) server access logging provides a method to monitor the network for potential cybersecurity events. The events are monitored by capturing detailed records for the requests that are made to an Amazon S3 bucket. Each access log record provides details about a single access request. The details include the requester, bucket name, request time, request action, response status, and an error code, if relevant.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check Amazon SNS Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkSNS(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-SNSEncryptedKMS') &&
      !nist80053SNSEncryptedKMS(node)
    ) {
      const ruleId = 'NIST.800.53-SNSEncryptedKMS';
      const info =
        'The SNS topic does not have KMS encryption enabled  - (Control ID: SC-13, SC-28).';
      const explanation =
        'Because sensitive data can exist at rest in published messages, enable encryption at rest to help protect that data.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check Amazon RDS Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkRDS(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-RDSInstanceBackupEnabled') &&
      !nist80053RDSInstanceBackupEnabled(node)
    ) {
      const ruleId = 'NIST.800.53-RDSInstanceBackupEnabled';
      const info =
        'The RDS DB Instance does not have backups enabled - (Control IDs: CP-9(b), CP-10, SI-12).';
      const explanation =
        'The backup feature of Amazon RDS creates backups of your databases and transaction logs.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-RDSLoggingEnabled') &&
      !nist80053RDSLoggingEnabled(node)
    ) {
      const ruleId = 'NIST.800.53-RDSLoggingEnabled';
      const info =
        'The RDS Instance does not have all CloudWatch log types exported - (Control IDs: AC-2(4), AC-2(g), AU-2(a)(d), AU-3, AU-12(a)(c)).';
      const explanation =
        'To help with logging and monitoring within your environment, ensure Amazon Relational Database Service (Amazon RDS) logging is enabled. With Amazon RDS logging, you can capture events such as connections, disconnections, queries, or tables queried.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-RDSEnhancedMonitoringEnabled') &&
      !nist80053RDSEnhancedMonitoringEnabled(node)
    ) {
      const ruleId = 'NIST.800.53-RDSEnhancedMonitoringEnabled';
      const info =
        'The RDS DB Instance does not enhanced monitoring enabled- (Control ID: CA-7(a)(b)).';
      const explanation =
        'Enable Amazon Relational Database Service (Amazon RDS) to help monitor Amazon RDS availability. This provides detailed visibility into the health of your Amazon RDS database instances.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(
        ignores,
        'NIST.800.53-RDSInstanceDeletionProtectionEnabled'
      ) &&
      !nist80053RDSInstanceDeletionProtectionEnabled(node)
    ) {
      const ruleId = 'NIST.800.53-RDSInstanceDeletionProtectionEnabled';
      const info =
        'The RDS DB Instance or Aurora Cluster does not have deletion protection enabled - (Control ID: SC-5).';
      const explanation =
        'Ensure Amazon Relational Database Service (Amazon RDS) instances  and clusters have deletion protection enabled. Use deletion protection to prevent your Amazon RDS instances and clusters from being accidentally or maliciously deleted, which can lead to loss of availability for your applications.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-RDSInstanceMultiAzSupport') &&
      !nist80053RDSInstanceMultiAZSupport(node)
    ) {
      const ruleId = 'NIST.800.53-RDSInstanceMultiAzSupport';
      const info =
        'The RDS DB Instance does not have multi-AZ support - (Control IDs: CP-10, SC-5, SC-36).';
      const explanation =
        'Multi-AZ support in Amazon Relational Database Service (Amazon RDS) provides enhanced availability and durability for database instances. When you provision a Multi-AZ database instance, Amazon RDS automatically creates a primary database instance, and synchronously replicates the data to a standby instance in a different Availability Zone.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-RDSInstancePublicAccess') &&
      !nist80053RDSInstancePublicAccess(node)
    ) {
      const ruleId = 'NIST.800.53-RDSInstancePublicAccess';
      const info =
        'The RDS DB Instance allows public access - (Control IDs: AC-4, AC-6, AC-21(b), SC-7, SC-7(3)).';
      const explanation =
        'Amazon RDS database instances can contain sensitive information, and principles and access control is required for such accounts.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-RDSStorageEncrypted') &&
      !nist80053RDSStorageEncrypted(node)
    ) {
      const ruleId = 'NIST.800.53-RDSStorageEncrypted';
      const info =
        'The RDS DB Instance or Aurora Cluster does not have storage encrypted - (Control IDs: SC-13, SC-28).';
      const explanation =
        'Because sensitive data can exist at rest in Amazon RDS instances and clusters, enable encryption at rest to help protect that data.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check Redshift Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkRedshift(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-RedshiftClusterConfiguration') &&
      !nist80053RedshiftClusterConfiguration(node)
    ) {
      const ruleId = 'NIST.800.53-RedshiftClusterConfiguration';
      const info =
        'The Redshift cluster does not have encryption or audit logging enabled - (Control IDs: AC-2(4), AC-2(g), AU-2(a)(d), AU-3, AU-12(a)(c), SC-13).';
      const explanation =
        'To protect data at rest, ensure that encryption is enabled for your Amazon Redshift clusters. You must also ensure that required configurations are deployed on Amazon Redshift clusters. The audit logging should be enabled to provide information about connections and user activities in the database.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }

    if (
      !this.ignoreRule(ignores, 'NIST.800.53-RedshiftClusterPublicAccess') &&
      !nist80053RedshiftClusterPublicAccess(node)
    ) {
      const ruleId = 'NIST.800.53-RedshiftClusterPublicAccess';
      const info =
        'The Redshift cluster allows public access - (Control IDs: AC-3, AC-4, AC-6, AC-21(b), SC-7, SC-7(3)).';
      const explanation =
        'Amazon Redshift clusters can contain sensitive information and principles and access control is required for such accounts.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }
}
