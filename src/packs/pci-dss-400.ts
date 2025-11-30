/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnResource } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
import { NagPack, NagPackProps } from '../nag-pack';
import { NagMessageLevel } from '../nag-rules';
import {
  APIGWAssociatedWithWAF,
  APIGWCacheEnabledAndEncrypted,
  APIGWExecutionLoggingEnabled,
  APIGWSSLEnabled,
  APIGWXrayEnabled,
} from '../rules/apigw';
import {
  AutoScalingGroupELBHealthCheckRequired,
  AutoScalingLaunchConfigPublicIpDisabled,
} from '../rules/autoscaling';
import {
  CloudFrontDistributionAccessLogging,
  CloudFrontDistributionHttpsViewerNoOutdatedSSL,
  CloudFrontDistributionNoOutdatedSSL,
  CloudFrontDistributionS3OriginAccessIdentity,
  CloudFrontDistributionWAFIntegration,
} from '../rules/cloudfront';
import {
  CloudTrailCloudWatchLogsEnabled,
  CloudTrailEncryptionEnabled,
  CloudTrailLogFileValidationEnabled,
} from '../rules/cloudtrail';
import {
  CloudWatchAlarmAction,
  CloudWatchLogGroupEncrypted,
  CloudWatchLogGroupRetentionPeriod,
} from '../rules/cloudwatch';
import {
  CodeBuildProjectEnvVarAwsCred,
  CodeBuildProjectKMSEncryptedArtifacts,
  CodeBuildProjectSourceRepoUrl,
} from '../rules/codebuild';
import { DMSReplicationNotPublic } from '../rules/dms';
import { DAXEncrypted, DynamoDBPITREnabled } from '../rules/dynamodb';
import {
  EC2IMDSv2Enabled,
  EC2InstanceDetailedMonitoringEnabled,
  EC2InstanceNoPublicIp,
  EC2InstanceProfileAttached,
  EC2InstancesInVPC,
  EC2RestrictedCommonPorts,
  EC2RestrictedSSH,
} from '../rules/ec2';
import {
  ECSTaskDefinitionContainerLogging,
  ECSTaskDefinitionUserForHostMode,
} from '../rules/ecs';
import { EFSEncrypted, EFSInBackupPlan } from '../rules/efs';
import {
  EKSClusterControlPlaneLogs,
  EKSClusterNoEndpointPublicAccess,
} from '../rules/eks';
import {
  ALBHttpDropInvalidHeaderEnabled,
  ALBHttpToHttpsRedirection,
  ALBWAFEnabled,
  ELBACMCertificateRequired,
  ELBLoggingEnabled,
  ELBTlsHttpsListenersOnly,
  ELBv2ACMCertificateRequired,
} from '../rules/elb';
import { EMRKerberosEnabled } from '../rules/emr';
import {
  IAMGroupHasUsers,
  IAMNoInlinePolicy,
  IAMPolicyNoStatementsWithAdminAccess,
  IAMPolicyNoStatementsWithFullAccess,
  IAMUserGroupMembership,
  IAMUserNoPolicies,
} from '../rules/iam';
import { KinesisDataStreamSSE } from '../rules/kinesis';
import { KMSBackingKeyRotationEnabled } from '../rules/kms';
import {
  LambdaFunctionPublicAccessProhibited,
  LambdaInsideVPC,
} from '../rules/lambda';
import {
  OpenSearchEncryptedAtRest,
  OpenSearchErrorLogsToCloudWatch,
  OpenSearchInVPCOnly,
  OpenSearchNodeToNodeEncryption,
} from '../rules/opensearch';
import {
  AuroraMySQLPostgresIAMAuth,
  RDSAutomaticMinorVersionUpgradeEnabled,
  RDSInBackupPlan,
  RDSInstanceBackupEnabled,
  RDSInstancePublicAccess,
  RDSLoggingEnabled,
  RDSStorageEncrypted,
} from '../rules/rds';
import {
  RedshiftBackupEnabled,
  RedshiftClusterConfiguration,
  RedshiftClusterEncryptionAtRest,
  RedshiftClusterMaintenanceSettings,
  RedshiftClusterPublicAccess,
  RedshiftEnhancedVPCRoutingEnabled,
  RedshiftRequireTlsSSL,
} from '../rules/redshift';
import {
  S3BucketDefaultLockEnabled,
  S3BucketLevelPublicAccessProhibited,
  S3BucketLoggingEnabled,
  S3BucketPublicReadProhibited,
  S3BucketPublicWriteProhibited,
  S3BucketReplicationEnabled,
  S3BucketSSLRequestsOnly,
  S3BucketVersioningEnabled,
  S3DefaultEncryptionKMS,
} from '../rules/s3';
import {
  SageMakerEndpointConfigurationKMSKeyConfigured,
  SageMakerNotebookInstanceKMSKeyConfigured,
  SageMakerNotebookNoDirectInternetAccess,
} from '../rules/sagemaker';
import {
  SecretsManagerRotationEnabled,
  SecretsManagerUsingKMSKey,
} from '../rules/secretsmanager';
import { SNSEncryptedKMS } from '../rules/sns';
import { StepFunctionStateMachineAllLogsToCloudWatch } from '../rules/stepfunctions';
import {
  VPCDefaultSecurityGroupClosed,
  VPCFlowLogsEnabled,
  VPCNoUnrestrictedRouteToIGW,
  VPCSubnetAutoAssignPublicIpDisabled,
} from '../rules/vpc';
import { WAFv2LoggingEnabled } from '../rules/waf';

/**
 * Check for PCI DSS 4.0 compliance.
 * Based on the PCI DSS 4.0 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-pci-dss-v4-including-global-resource-types.html
 */
export class PCIDSS400Checks extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'PCI.DSS.400';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      this.checkAPIGW(node);
      this.checkAutoScaling(node);
      this.checkCloudFront(node);
      this.checkCloudTrail(node);
      this.checkCloudWatch(node);
      this.checkCodeBuild(node);
      this.checkDMS(node);
      this.checkDynamoDB(node);
      this.checkEC2(node);
      this.checkECS(node);
      this.checkEFS(node);
      this.checkEKS(node);
      this.checkELB(node);
      this.checkEMR(node);
      this.checkIAM(node);
      this.checkKinesis(node);
      this.checkKMS(node);
      this.checkLambda(node);
      this.checkOpenSearch(node);
      this.checkRDS(node);
      this.checkRedshift(node);
      this.checkS3(node);
      this.checkSageMaker(node);
      this.checkSecretsManager(node);
      this.checkSNS(node);
      this.checkStepFunctions(node);
      this.checkVPC(node);
      this.checkWAF(node);
    }
  }

  /**
   * Check API Gateway Resources
   * @param node the CfnResource to check
   */
  private checkAPIGW(node: CfnResource): void {
    this.applyRule({
      info: 'The REST API stage is not associated with AWS WAFv2 web ACL - (Control IDs: 6.4.1, 6.4.2).',
      explanation:
        'AWS WAF enables you to configure a set of rules (called a web access control list (web ACL)) that allow, block, or count web requests based on customizable web security rules and conditions that you define. Ensure your Amazon API Gateway stage is associated with a WAF Web ACL to protect it from malicious attacks.',
      level: NagMessageLevel.ERROR,
      rule: APIGWAssociatedWithWAF,
      node: node,
    });
    this.applyRule({
      info: 'The API Gateway stage does not have caching enabled and encrypted for all methods - (Control IDs: 3.5.1, 3.5.1.1).',
      explanation:
        "To help protect data at rest, ensure encryption is enabled for your API Gateway stage's cache. Because sensitive data can be captured for the API method, enable encryption at rest to help protect that data.",
      level: NagMessageLevel.ERROR,
      rule: APIGWCacheEnabledAndEncrypted,
      node: node,
    });
    this.applyRule({
      info: 'The API Gateway stage does not have execution logging enabled for all methods - (Control IDs: 10.2.1, 10.2.1.1, 10.2.1.2, 10.2.1.3, 10.2.1.4, 10.2.1.5, 10.2.1.6, 10.2.1.7, 10.2.2, 10.3.1, 10.3.2, 10.3.3, 10.3.4).',
      explanation:
        'API Gateway logging displays detailed views of users who accessed the API and the way they accessed the API. This insight enables visibility of user activities.',
      level: NagMessageLevel.ERROR,
      rule: APIGWExecutionLoggingEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The API Gateway REST API stage is not configured with SSL certificates - (Control IDs: 4.2.1, 4.2.1.1, 4.2.1.2, 8.3.2).',
      explanation:
        'Ensure Amazon API Gateway REST API stages are configured with SSL certificates to allow backend systems to authenticate that requests originate from API Gateway.',
      level: NagMessageLevel.ERROR,
      rule: APIGWSSLEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The API Gateway REST API stage does not have X-Ray tracing enabled - (Control IDs: 10.2.1, 10.2.1.1).',
      explanation:
        'AWS X-Ray collects data about requests that your application serves, and provides tools you can use to view, filter, and gain insights into that data to identify issues and opportunities for optimization.',
      level: NagMessageLevel.ERROR,
      rule: APIGWXrayEnabled,
      node: node,
    });
  }

  /**
   * Check Auto Scaling Resources
   * @param node the CfnResource to check
   */
  private checkAutoScaling(node: CfnResource): void {
    this.applyRule({
      info: 'The Auto Scaling group (which is associated with a load balancer) does not utilize ELB health checks - (Control IDs: 2.2.1, 12.10.1).',
      explanation:
        'The Elastic Load Balancer (ELB) health checks for Amazon Elastic Compute Cloud (Amazon EC2) Auto Scaling groups support maintenance of adequate capacity and availability. The load balancer periodically sends pings, attempts connections, or sends requests to test Amazon EC2 instances health in an auto-scaling group. If an instance is not reporting back, traffic is sent to a new Amazon EC2 instance.',
      level: NagMessageLevel.ERROR,
      rule: AutoScalingGroupELBHealthCheckRequired,
      node: node,
    });
    this.applyRule({
      info: 'The Auto Scaling launch configuration does not have public IP addresses disabled - (Control IDs: 1.3.1, 1.3.2, 1.4.4, 1.4.5).',
      explanation:
        'If you configure your Network Interfaces with a public IP address, then the associated resources to those Network Interfaces are reachable from the internet. EC2 resources should not be publicly accessible, as this may allow unintended access to your applications or servers.',
      level: NagMessageLevel.ERROR,
      rule: AutoScalingLaunchConfigPublicIpDisabled,
      node: node,
    });
  }

  /**
   * Check CloudFront Resources
   * @param node the CfnResource to check
   */
  private checkCloudFront(node: CfnResource): void {
    this.applyRule({
      info: 'The CloudFront distribution does not have access logging enabled - (Control IDs: 10.2.1, 10.2.1.1, 10.2.1.2, 10.2.1.3, 10.2.1.4, 10.2.1.5, 10.2.1.6, 10.2.1.7, 10.2.2, 10.3.1, 10.3.2, 10.3.3, 10.3.4).',
      explanation:
        'Enabling access logs helps you track all viewer requests for the content that CloudFront delivers. The logs contain information about each request such as the date and time of the request, the IP address of the viewer, and the URI of the requested object.',
      level: NagMessageLevel.ERROR,
      rule: CloudFrontDistributionAccessLogging,
      node: node,
    });
    this.applyRule({
      info: 'The CloudFront distribution allows for SSLv3 or TLSv1 for HTTPS viewer connections - (Control IDs: 4.2.1, 4.2.1.1, 4.2.1.2, 12.3.3).',
      explanation:
        'Ensure that your CloudFront distributions are using a security policy with minimum TLSv1.1 or TLSv1.2 and appropriate security ciphers for HTTPS viewer connections. You can use HTTPS to help prevent eavesdropping or man-in-the-middle attacks.',
      level: NagMessageLevel.ERROR,
      rule: CloudFrontDistributionHttpsViewerNoOutdatedSSL,
      node: node,
    });
    this.applyRule({
      info: 'The CloudFront distribution allows for SSLv3 or TLSv1 for HTTPS origin connections - (Control IDs: 4.2.1, 4.2.1.1, 4.2.1.2, 12.3.3).',
      explanation:
        'Ensure that your CloudFront distributions are using a security policy with minimum TLSv1.1 or TLSv1.2 and appropriate security ciphers for HTTPS origin connections.',
      level: NagMessageLevel.ERROR,
      rule: CloudFrontDistributionNoOutdatedSSL,
      node: node,
    });
    this.applyRule({
      info: 'The CloudFront distribution does not use an origin access identity for S3 origins - (Control IDs: 1.3.1, 1.3.2, 1.4.4, 2.2.1).',
      explanation:
        'Using an origin access identity helps ensure that only CloudFront can access the content in your S3 bucket, preventing direct access to the bucket.',
      level: NagMessageLevel.ERROR,
      rule: CloudFrontDistributionS3OriginAccessIdentity,
      node: node,
    });
    this.applyRule({
      info: 'The CloudFront distribution is not associated with AWS WAFv2 web ACL - (Control IDs: 6.4.1, 6.4.2).',
      explanation:
        'A WAF helps to protect your web applications or APIs against common web exploits. These web exploits may affect availability, compromise security, or consume excessive resources within your environment.',
      level: NagMessageLevel.ERROR,
      rule: CloudFrontDistributionWAFIntegration,
      node: node,
    });
  }

  /**
   * Check CloudTrail Resources
   * @param node the CfnResource to check
   */
  private checkCloudTrail(node: CfnResource): void {
    this.applyRule({
      info: 'The trail does not have CloudWatch logs enabled - (Control IDs: 10.2.1, 10.2.1.1, 10.2.1.2, 10.2.1.3, 10.2.1.4, 10.2.1.5, 10.2.1.6, 10.2.1.7, 10.2.2, 10.3.1, 10.3.2, 10.3.3, 10.3.4).',
      explanation:
        'Use Amazon CloudWatch to centrally collect and manage log event activity. Inclusion of AWS CloudTrail data provides details of API call activity within your AWS account.',
      level: NagMessageLevel.ERROR,
      rule: CloudTrailCloudWatchLogsEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The trail does not have encryption enabled - (Control IDs: 3.5.1, 3.5.1.1, 10.3.2).',
      explanation:
        'Because sensitive data may exist and to help protect data at rest, ensure encryption is enabled for your AWS CloudTrail trails.',
      level: NagMessageLevel.ERROR,
      rule: CloudTrailEncryptionEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The trail does not have log file validation enabled - (Control IDs: 10.3.2, 10.3.4, 11.5.2).',
      explanation:
        'Utilize AWS CloudTrail log file validation to check the integrity of CloudTrail logs. Log file validation helps determine if a log file was modified or deleted or unchanged after CloudTrail delivered it. This feature is built using industry standard algorithms: SHA-256 for hashing and SHA-256 with RSA for digital signing. This makes it computationally infeasible to modify, delete or forge CloudTrail log files without detection.',
      level: NagMessageLevel.ERROR,
      rule: CloudTrailLogFileValidationEnabled,
      node: node,
    });
  }

  /**
   * Check CloudWatch Resources
   * @param node the CfnResource to check
   */
  private checkCloudWatch(node: CfnResource): void {
    this.applyRule({
      info: 'The CloudWatch alarm does not have at least one alarm action, one INSUFFICIENT_DATA action, or one OK action enabled - (Control IDs: 10.7.2, 12.10.1).',
      explanation:
        'Amazon CloudWatch alarms alert when a metric breaches the threshold for a specified number of evaluation periods. The alarm performs one or more actions based on the value of the metric or expression relative to a threshold over a number of time periods.',
      level: NagMessageLevel.ERROR,
      rule: CloudWatchAlarmAction,
      node: node,
    });
    this.applyRule({
      info: 'The CloudWatch Log Group is not encrypted with an AWS KMS key - (Control IDs: 3.5.1, 3.5.1.1).',
      explanation:
        'To help protect sensitive data at rest, ensure encryption is enabled for your Amazon CloudWatch Log Groups.',
      level: NagMessageLevel.ERROR,
      rule: CloudWatchLogGroupEncrypted,
      node: node,
    });
    this.applyRule({
      info: 'The CloudWatch Log Group does not have an explicit retention period configured - (Control IDs: 3.1, 10.7.1, 10.7.2).',
      explanation:
        'Ensure a minimum duration of event log data is retained for your log groups to help with troubleshooting and forensics investigations. The lack of available past event log data makes it difficult to reconstruct and identify potentially malicious events.',
      level: NagMessageLevel.ERROR,
      rule: CloudWatchLogGroupRetentionPeriod,
      node: node,
    });
  }

  /**
   * Check CodeBuild Resources
   * @param node the CfnResource to check
   */
  private checkCodeBuild(node: CfnResource): void {
    this.applyRule({
      info: 'The CodeBuild environment stores sensitive credentials (such as AWS_ACCESS_KEY_ID and/or AWS_SECRET_ACCESS_KEY) as plaintext environment variables - (Control IDs: 8.3.1, 8.3.2, 8.6.3).',
      explanation:
        'Do not store these variables in clear text. Storing these variables in clear text leads to unintended data exposure and unauthorized access.',
      level: NagMessageLevel.ERROR,
      rule: CodeBuildProjectEnvVarAwsCred,
      node: node,
    });
    this.applyRule({
      info: 'The CodeBuild project does not use KMS encryption for artifacts - (Control IDs: 3.5.1, 3.5.1.1).',
      explanation:
        'To help protect data at rest, ensure encryption is enabled for your CodeBuild project artifacts.',
      level: NagMessageLevel.ERROR,
      rule: CodeBuildProjectKMSEncryptedArtifacts,
      node: node,
    });
    this.applyRule({
      info: 'The CodeBuild project which utilizes either a GitHub or BitBucket source repository does not utilize OAuth - (Control IDs: 8.3.1, 8.3.2, 8.6.3).',
      explanation:
        'OAuth is the most secure method of authenticating your CodeBuild application. Use OAuth instead of personal access tokens or a user name and password to grant authorization for accessing GitHub or Bitbucket repositories.',
      level: NagMessageLevel.ERROR,
      rule: CodeBuildProjectSourceRepoUrl,
      node: node,
    });
  }

  /**
   * Check DMS Resources
   * @param node the CfnResource to check
   */
  private checkDMS(node: CfnResource) {
    this.applyRule({
      info: 'The DMS replication instance is public - (Control IDs: 1.3.1, 1.3.2, 1.4.4, 1.4.5).',
      explanation:
        'DMS replication instances can contain sensitive information and access control is required for such accounts.',
      level: NagMessageLevel.ERROR,
      rule: DMSReplicationNotPublic,
      node: node,
    });
  }

  /**
   * Check DynamoDB Resources
   * @param node the CfnResource to check
   */
  private checkDynamoDB(node: CfnResource): void {
    this.applyRule({
      info: 'The DAX cluster does not have encryption at rest enabled - (Control IDs: 3.5.1, 3.5.1.1).',
      explanation:
        'Enabling encryption at rest helps protect stored data from unauthorized access.',
      level: NagMessageLevel.ERROR,
      rule: DAXEncrypted,
      node: node,
    });
    this.applyRule({
      info: 'The DynamoDB table does not have Point-in-time Recovery enabled - (Control IDs: 9.4.1, 12.10.1).',
      explanation:
        'Enable Point-in-time Recovery (PITR) to protect your DynamoDB tables from accidental write or delete operations. With PITR, you can restore a table to any point in time during the last 35 days.',
      level: NagMessageLevel.ERROR,
      rule: DynamoDBPITREnabled,
      node: node,
    });
  }

  /**
   * Check EC2 Resources
   * @param node the CfnResource to check
   */
  private checkEC2(node: CfnResource): void {
    this.applyRule({
      info: 'The EC2 instance does not have IMDSv2 enabled - (Control IDs: 2.2.1, 8.3.1, 8.3.2, 8.6.3).',
      explanation:
        'IMDSv2 adds additional protection for your EC2 instances by requiring a session token for instance metadata requests.',
      level: NagMessageLevel.ERROR,
      rule: EC2IMDSv2Enabled,
      node: node,
    });
    this.applyRule({
      info: 'The EC2 instance does not have detailed monitoring enabled - (Control IDs: 10.2.1, 10.2.1.1, 12.10.1).',
      explanation:
        'Detailed monitoring provides more frequent metrics, published at one-minute intervals, instead of the five-minute intervals used in basic monitoring.',
      level: NagMessageLevel.ERROR,
      rule: EC2InstanceDetailedMonitoringEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The EC2 instance is associated with a public IP address - (Control IDs: 1.3.1, 1.3.2, 1.4.4, 1.4.5).',
      explanation:
        'Manage access to the AWS Cloud by ensuring Amazon Elastic Compute Cloud (Amazon EC2) instances cannot be publicly accessed. Amazon EC2 instances can contain sensitive information and access control is required for such accounts.',
      level: NagMessageLevel.ERROR,
      rule: EC2InstanceNoPublicIp,
      node: node,
    });
    this.applyRule({
      info: 'The EC2 instance does not have an instance profile attached - (Control IDs: 2.2.1, 7.2.1, 7.2.2, 7.2.5).',
      explanation:
        'EC2 instance profiles pass an IAM role to an EC2 instance. Attaching an instance profile to your instances can assist with least privilege and permissions management.',
      level: NagMessageLevel.ERROR,
      rule: EC2InstanceProfileAttached,
      node: node,
    });
    this.applyRule({
      info: 'The EC2 instance is not within a VPC - (Control IDs: 1.3.1, 1.3.2, 1.4.4, 1.4.5).',
      explanation:
        'Deploy Amazon Elastic Compute Cloud (Amazon EC2) instances within an Amazon Virtual Private Cloud (Amazon VPC) to enable secure communication between an instance and other services within the amazon VPC, without requiring an internet gateway, NAT device, or VPN connection. All traffic remains securely within the AWS Cloud. Because of their logical isolation, domains that reside within an Amazon VPC have an extra layer of security when compared to domains that use public endpoints. Assign Amazon EC2 instances to an Amazon VPC to properly manage access.',
      level: NagMessageLevel.ERROR,
      rule: EC2InstancesInVPC,
      node: node,
    });
    this.applyRule({
      info: 'The EC2 instance allows unrestricted inbound IPv4 TCP traffic on one or more common ports (by default these ports include 20, 21, 3389, 3309, 3306, 4333) - (Control IDs: 1.3.1, 1.3.2, 1.4.1, 1.4.2, 2.2.1).',
      explanation:
        'Not restricting access to ports to trusted sources can lead to attacks against the availability, integrity and confidentiality of systems. By default, common ports which should be restricted include port numbers 20, 21, 3389, 3306, and 4333.',
      level: NagMessageLevel.ERROR,
      rule: EC2RestrictedCommonPorts,
      node: node,
    });
    this.applyRule({
      info: 'The Security Group allows unrestricted SSH access - (Control IDs: 1.3.1, 1.3.2, 1.4.1, 1.4.2, 2.2.1).',
      explanation:
        'Not allowing ingress (or remote) traffic from 0.0.0.0/0 or ::/0 to port 22 on your resources helps to restrict remote access.',
      level: NagMessageLevel.ERROR,
      rule: EC2RestrictedSSH,
      node: node,
    });
  }

  /**
   * Check ECS Resources
   * @param node the CfnResource to check
   */
  private checkECS(node: CfnResource): void {
    this.applyRule({
      info: 'The ECS task definition does not have logging enabled for all containers - (Control IDs: 10.2.1, 10.2.1.1, 10.2.1.2, 10.2.1.3, 10.2.1.4, 10.2.1.5, 10.2.1.6, 10.2.1.7, 10.2.2, 10.3.1, 10.3.2, 10.3.3, 10.3.4).',
      explanation:
        'Container logging helps you troubleshoot issues, monitor container performance, and maintain audit trails for security and compliance.',
      level: NagMessageLevel.ERROR,
      rule: ECSTaskDefinitionContainerLogging,
      node: node,
    });
    this.applyRule({
      info: "The ECS task definition is configured for host networking and has at least one container with definitions with 'privileged' set to false or empty or 'user' set to root or empty - (Control IDs: 7.2.1, 7.2.2, 7.2.5).",
      explanation:
        'If a task definition has elevated privileges it is because you have specifically opted-in to those configurations. This rule checks for unexpected privilege escalation when a task definition has host networking enabled but the customer has not opted-in to elevated privileges.',
      level: NagMessageLevel.ERROR,
      rule: ECSTaskDefinitionUserForHostMode,
      node: node,
    });
  }

  /**
   * Check EFS Resources
   * @param node the CfnResource to check
   */
  private checkEFS(node: CfnResource) {
    this.applyRule({
      info: 'The EFS does not have encryption at rest enabled - (Control IDs: 3.5.1, 3.5.1.1, 8.3.2).',
      explanation:
        'Because sensitive data can exist and to help protect data at rest, ensure encryption is enabled for your Amazon Elastic File System (EFS).',
      level: NagMessageLevel.ERROR,
      rule: EFSEncrypted,
      node: node,
    });
    this.applyRule({
      info: 'The EFS file system is not included in a backup plan - (Control IDs: 9.4.1, 12.10.1).',
      explanation:
        'To help with data back-up processes, ensure your Amazon Elastic File System (Amazon EFS) file systems are a part of an AWS Backup plan.',
      level: NagMessageLevel.ERROR,
      rule: EFSInBackupPlan,
      node: node,
    });
  }

  /**
   * Check EKS Resources
   * @param node the CfnResource to check
   */
  private checkEKS(node: CfnResource): void {
    this.applyRule({
      info: 'The EKS cluster does not have control plane logging enabled - (Control IDs: 10.2.1, 10.2.1.1, 10.2.1.2, 10.2.1.3, 10.2.1.4, 10.2.1.5, 10.2.1.6, 10.2.1.7, 10.2.2, 10.3.1, 10.3.2, 10.3.3, 10.3.4).',
      explanation:
        'Amazon EKS control plane logging provides audit and diagnostic logs directly from the Amazon EKS control plane to CloudWatch Logs in your account.',
      level: NagMessageLevel.ERROR,
      rule: EKSClusterControlPlaneLogs,
      node: node,
    });
    this.applyRule({
      info: 'The EKS cluster has public endpoint access enabled - (Control IDs: 1.3.1, 1.3.2, 1.4.4, 1.4.5).',
      explanation:
        'Disabling public endpoint access to your Amazon EKS cluster helps prevent unauthorized access to your cluster.',
      level: NagMessageLevel.ERROR,
      rule: EKSClusterNoEndpointPublicAccess,
      node: node,
    });
  }

  /**
   * Check Elastic Load Balancer Resources
   * @param node the CfnResource to check
   */
  private checkELB(node: CfnResource): void {
    this.applyRule({
      info: 'The ALB does not have invalid HTTP header dropping enabled - (Control IDs: 4.2.1, 4.2.1.1, 4.2.1.2, 8.3.2).',
      explanation:
        'Ensure that your Application Load Balancers (ALB) are configured to drop http headers. Because sensitive data can exist, enable encryption in transit to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: ALBHttpDropInvalidHeaderEnabled,
      node: node,
    });
    this.applyRule({
      info: "The ALB's HTTP listeners are not configured to redirect to HTTPS - (Control IDs: 4.2.1, 4.2.1.1, 4.2.1.2, 8.3.2).",
      explanation:
        'To help protect data in transit, ensure that your Application Load Balancer automatically redirects unencrypted HTTP requests to HTTPS. Because sensitive data can exist, enable encryption in transit to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: ALBHttpToHttpsRedirection,
      node: node,
    });
    this.applyRule({
      info: 'The ALB is not associated with AWS WAFv2 web ACL - (Control IDs: 6.4.1, 6.4.2).',
      explanation:
        'A WAF helps to protect your web applications or APIs against common web exploits. These web exploits may affect availability, compromise security, or consume excessive resources within your environment.',
      level: NagMessageLevel.ERROR,
      rule: ALBWAFEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The CLB does not utilize an SSL certificate provided by ACM (Amazon Certificate Manager) - (Control IDs: 4.2.1, 4.2.1.1, 4.2.1.2, 8.3.2).',
      explanation:
        'Because sensitive data can exist and to help protect data at transit, ensure encryption is enabled for your Elastic Load Balancing. Use AWS Certificate Manager to manage, provision and deploy public and private SSL/TLS certificates with AWS services and internal resources.',
      level: NagMessageLevel.ERROR,
      rule: ELBACMCertificateRequired,
      node: node,
    });
    this.applyRule({
      info: 'The ELB does not have logging enabled - (Control IDs: 10.2.1, 10.2.1.1, 10.2.1.2, 10.2.1.3, 10.2.1.4, 10.2.1.5, 10.2.1.6, 10.2.1.7, 10.2.2, 10.3.1, 10.3.2, 10.3.3, 10.3.4).',
      explanation:
        "Elastic Load Balancing activity is a central point of communication within an environment. Ensure ELB logging is enabled. The collected data provides detailed information about requests sent to The ELB. Each log contains information such as the time the request was received, the client's IP address, latencies, request paths, and server responses.",
      level: NagMessageLevel.ERROR,
      rule: ELBLoggingEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The CLB does not restrict its listeners to only the SSL and HTTPS protocols - (Control IDs: 4.2.1, 4.2.1.1, 4.2.1.2, 8.3.2).',
      explanation:
        'Ensure that your Classic Load Balancers (CLBs) are configured with SSL or HTTPS listeners. Because sensitive data can exist, enable encryption in transit to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: ELBTlsHttpsListenersOnly,
      node: node,
    });
    this.applyRule({
      info: 'The ALB, NLB, or GLB listener does not utilize an SSL certificate provided by ACM (Amazon Certificate Manager) - (Control IDs: 4.2.1, 4.2.1.1, 4.2.1.2).',
      explanation:
        'Because sensitive data can exist and to help protect data at transit, ensure encryption is enabled for your Elastic Load Balancing. Use AWS Certificate Manager to manage, provision and deploy public and private SSL/TLS certificates with AWS services and internal resources.',
      level: NagMessageLevel.ERROR,
      rule: ELBv2ACMCertificateRequired,
      node: node,
    });
  }

  /**
   * Check EMR Resources
   * @param node the CfnResource to check
   */
  private checkEMR(node: CfnResource) {
    this.applyRule({
      info: 'The EMR cluster does not have Kerberos enabled - (Control IDs: 7.2.1, 7.2.2, 7.2.5, 8.3.1, 8.3.2).',
      explanation:
        'Kerberos provides strong authentication through secret-key cryptography. Enabling Kerberos on your EMR cluster helps ensure that only authorized users can access the cluster.',
      level: NagMessageLevel.ERROR,
      rule: EMRKerberosEnabled,
      node: node,
    });
  }

  /**
   * Check IAM Resources
   * @param node the CfnResource to check
   */
  private checkIAM(node: CfnResource): void {
    this.applyRule({
      info: 'The IAM Group does not have at least one IAM User - (Control IDs: 7.2.1, 7.2.2, 7.2.5, 7.2.6).',
      explanation:
        'AWS Identity and Access Management (IAM) can help you incorporate the principles of least privilege and separation of duties with access permissions and authorizations, by ensuring that IAM groups have at least one IAM user. Placing IAM users in groups based on their associated permissions or job function is one way to incorporate least privilege.',
      level: NagMessageLevel.ERROR,
      rule: IAMGroupHasUsers,
      node: node,
    });
    this.applyRule({
      info: 'The IAM Group, User, or Role contains an inline policy - (Control IDs: 2.2.1, 7.2.1, 7.2.2, 7.2.5, 7.2.6).',
      explanation:
        'AWS recommends to use managed policies instead of inline policies. The managed policies allow reusability, versioning and rolling back, and delegating permissions management.',
      level: NagMessageLevel.ERROR,
      rule: IAMNoInlinePolicy,
      node: node,
    });
    this.applyRule({
      info: 'The IAM policy grants admin access, meaning the policy allows a principal to perform all actions on all resources - (Control IDs: 2.2.1, 7.2.1, 7.2.2, 7.2.5, 7.2.6).',
      explanation:
        'AWS Identity and Access Management (IAM) can help you incorporate the principles of least privilege and separation of duties with access permissions and authorizations, by ensuring that IAM groups have at least one IAM user. Placing IAM users in groups based on their associated permissions or job function is one way to incorporate least privilege.',
      level: NagMessageLevel.ERROR,
      rule: IAMPolicyNoStatementsWithAdminAccess,
      node: node,
    });
    this.applyRule({
      info: 'The IAM policy grants full access, meaning the policy allows a principal to perform all actions on individual resources - (Control IDs: 7.2.1, 7.2.2, 7.2.5, 7.2.6).',
      explanation:
        'Ensure IAM Actions are restricted to only those actions that are needed. Allowing users to have more privileges than needed to complete a task may violate the principle of least privilege and separation of duties.',
      level: NagMessageLevel.ERROR,
      rule: IAMPolicyNoStatementsWithFullAccess,
      node: node,
    });
    this.applyRule({
      info: 'The IAM user does not belong to any group(s) - (Control IDs: 2.2.1, 7.2.1, 7.2.2, 7.2.5, 7.2.6).',
      explanation:
        'AWS Identity and Access Management (IAM) can help you restrict access permissions and authorizations by ensuring IAM users are members of at least one group. Allowing users more privileges than needed to complete a task may violate the principle of least privilege and separation of duties.',
      level: NagMessageLevel.ERROR,
      rule: IAMUserGroupMembership,
      node: node,
    });
    this.applyRule({
      info: 'The IAM policy is attached at the user level - (Control IDs: 2.2.1, 7.2.1, 7.2.2, 7.2.5, 7.2.6).',
      explanation:
        'Assigning privileges at the group or the role level helps to reduce opportunity for an identity to receive or retain excessive privileges.',
      level: NagMessageLevel.ERROR,
      rule: IAMUserNoPolicies,
      node: node,
    });
  }

  /**
   * Check Kinesis Resources
   * @param node the CfnResource to check
   */
  private checkKinesis(node: CfnResource): void {
    this.applyRule({
      info: 'The Kinesis Data Stream does not have server-side encryption enabled - (Control IDs: 3.5.1, 3.5.1.1).',
      explanation:
        'To help protect data at rest, ensure encryption is enabled for your Amazon Kinesis Data Streams.',
      level: NagMessageLevel.ERROR,
      rule: KinesisDataStreamSSE,
      node: node,
    });
  }

  /**
   * Check KMS Resources
   * @param node the CfnResource to check
   */
  private checkKMS(node: CfnResource): void {
    this.applyRule({
      info: 'The KMS Symmetric key does not have automatic key rotation enabled - (Control IDs: 3.6.1, 3.6.1.1, 3.6.1.2, 3.6.1.3, 3.7.1, 3.7.2).',
      explanation:
        'Enable key rotation to ensure that keys are rotated once they have reached the end of their crypto period.',
      level: NagMessageLevel.ERROR,
      rule: KMSBackingKeyRotationEnabled,
      node: node,
    });
  }

  /**
   * Check Lambda Resources
   * @param node the CfnResource to check
   */
  private checkLambda(node: CfnResource) {
    this.applyRule({
      info: 'The Lambda function permission grants public access - (Control IDs: 1.3.1, 1.3.2, 1.4.4, 1.4.5).',
      explanation:
        'Public access allows anyone on the internet to perform unauthenticated actions on your function and can potentially lead to degraded availability.',
      level: NagMessageLevel.ERROR,
      rule: LambdaFunctionPublicAccessProhibited,
      node: node,
    });
    this.applyRule({
      info: 'The Lambda function is not VPC enabled - (Control IDs: 1.3.1, 1.3.2, 1.4.4, 1.4.5).',
      explanation:
        'Because of their logical isolation, domains that reside within an Amazon VPC have an extra layer of security when compared to domains that use public endpoints.',
      level: NagMessageLevel.ERROR,
      rule: LambdaInsideVPC,
      node: node,
    });
  }

  /**
   * Check OpenSearch Resources
   * @param node the CfnResource to check
   */
  private checkOpenSearch(node: CfnResource) {
    this.applyRule({
      info: 'The OpenSearch Service domain does not have encryption at rest enabled - (Control IDs: 3.5.1, 3.5.1.1, 8.3.2).',
      explanation:
        'Because sensitive data can exist and to help protect data at rest, ensure encryption is enabled for your Amazon OpenSearch Service (OpenSearch Service) domains.',
      level: NagMessageLevel.ERROR,
      rule: OpenSearchEncryptedAtRest,
      node: node,
    });
    this.applyRule({
      info: 'The OpenSearch Service domain is not running within a VPC - (Control IDs: 1.3.1, 1.3.2, 1.4.4, 1.4.5).',
      explanation:
        'VPCs help secure your AWS resources and provide an extra layer of protection.',
      level: NagMessageLevel.ERROR,
      rule: OpenSearchInVPCOnly,
      node: node,
    });
    this.applyRule({
      info: 'The OpenSearch Service domain does not stream error logs (ES_APPLICATION_LOGS) to CloudWatch Logs - (Control IDs: 10.2.1, 10.2.1.1, 10.2.1.2, 10.2.1.3, 10.2.1.4, 10.2.1.5, 10.2.1.6, 10.2.1.7, 10.2.2, 10.3.1, 10.3.2, 10.3.3, 10.3.4).',
      explanation:
        'Ensure Amazon OpenSearch Service domains have error logs enabled and streamed to Amazon CloudWatch Logs for retention and response. Domain error logs can assist with security and access audits, and can help to diagnose availability issues.',
      level: NagMessageLevel.ERROR,
      rule: OpenSearchErrorLogsToCloudWatch,
      node: node,
    });
    this.applyRule({
      info: 'The OpenSearch Service domain does not have node-to-node encryption enabled - (Control IDs: 4.2.1, 4.2.1.1, 4.2.1.2).',
      explanation:
        'Because sensitive data can exist, enable encryption in transit to help protect that data within your Amazon OpenSearch Service (OpenSearch Service) domains.',
      level: NagMessageLevel.ERROR,
      rule: OpenSearchNodeToNodeEncryption,
      node: node,
    });
  }

  /**
   * Check RDS Resources
   * @param node the CfnResource to check
   */
  private checkRDS(node: CfnResource): void {
    this.applyRule({
      info: 'The RDS DB instance or Aurora DB cluster does not have IAM Database Authentication enabled - (Control IDs: 8.3.1, 8.3.2, 8.6.3).',
      explanation:
        'IAM database authentication allows authentication to database instances with an authentication token instead of a password.',
      level: NagMessageLevel.ERROR,
      rule: AuroraMySQLPostgresIAMAuth,
      node: node,
    });
    this.applyRule({
      info: 'The RDS DB instance does not have automatic minor version upgrades enabled - (Control IDs: 6.3.3).',
      explanation:
        'Enable automatic minor version upgrades on your Amazon Relational Database Service (RDS) instances to ensure the latest minor version updates to the Relational Database Management System (RDBMS) are installed, which may include security patches and bug fixes.',
      level: NagMessageLevel.ERROR,
      rule: RDSAutomaticMinorVersionUpgradeEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The RDS DB instance is not in an AWS Backup plan - (Control IDs: 9.4.1, 12.10.1).',
      explanation:
        'To help with data back-up processes, ensure your Amazon Relational Database Service (Amazon RDS) instances are a part of an AWS Backup plan.',
      level: NagMessageLevel.ERROR,
      rule: RDSInBackupPlan,
      node: node,
    });
    this.applyRule({
      info: 'The RDS DB instance does not have backup enabled - (Control IDs: 9.4.1, 12.10.1).',
      explanation:
        'The backup feature of Amazon RDS creates backups of your databases and transaction logs.',
      level: NagMessageLevel.ERROR,
      rule: RDSInstanceBackupEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The RDS DB Instance allows public access - (Control IDs: 1.3.1, 1.3.2, 1.4.4, 1.4.5).',
      explanation:
        'Amazon RDS database instances can contain sensitive information, and principles and access control is required for such accounts.',
      level: NagMessageLevel.ERROR,
      rule: RDSInstancePublicAccess,
      node: node,
    });
    this.applyRule({
      info: 'The non-Aurora RDS DB instance or Aurora cluster does not have all CloudWatch log types exported - (Control IDs: 10.2.1, 10.2.1.1, 10.2.1.2, 10.2.1.3, 10.2.1.4, 10.2.1.5, 10.2.1.6, 10.2.1.7, 10.2.2, 10.3.1, 10.3.2, 10.3.3, 10.3.4).',
      explanation:
        'To help with logging and monitoring within your environment, ensure Amazon Relational Database Service (Amazon RDS) logging is enabled. With Amazon RDS logging, you can capture events such as connections, disconnections, queries, or tables queried.' +
        "This is a granular rule that returns individual findings that can be suppressed with 'appliesTo'. The findings are in the format 'LogExport::<log>' for exported logs. Example: appliesTo: ['LogExport::audit'].",
      level: NagMessageLevel.ERROR,
      rule: RDSLoggingEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The RDS DB Instance or Aurora Cluster does not have storage encrypted - (Control IDs: 3.5.1, 3.5.1.1, 8.3.2).',
      explanation:
        'Because sensitive data can exist at rest in Amazon RDS instances, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: RDSStorageEncrypted,
      node: node,
    });
  }

  /**
   * Check Redshift Resources
   * @param node the CfnResource to check
   */
  private checkRedshift(node: CfnResource): void {
    this.applyRule({
      info: 'The Redshift cluster does not have automated snapshots enabled or the retention period is not between 1 and 35 days - (Control IDs: 9.4.1, 12.10.1).',
      explanation:
        'To help with data back-up processes, ensure your Amazon Redshift clusters have automated snapshots enabled.',
      level: NagMessageLevel.ERROR,
      rule: RedshiftBackupEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The Redshift cluster does not have encryption or audit logging enabled - (Control IDs: 3.5.1, 3.5.1.1, 8.3.2, 10.2.1, 10.2.1.1, 10.2.1.2, 10.2.1.3, 10.2.1.4, 10.2.1.5, 10.2.1.6, 10.2.1.7, 10.2.2, 10.3.1, 10.3.2, 10.3.3, 10.3.4).',
      explanation:
        'To protect data at rest, ensure that encryption is enabled for your Amazon Redshift clusters. You must also ensure that required configurations are deployed on Amazon Redshift clusters. The audit logging should be enabled to provide information about connections and user activities in the database.',
      level: NagMessageLevel.ERROR,
      rule: RedshiftClusterConfiguration,
      node: node,
    });
    this.applyRule({
      info: 'The Redshift cluster does not have encryption at rest enabled - (Control IDs: 3.5.1, 3.5.1.1).',
      explanation:
        'To protect data at rest, ensure that encryption is enabled for your Amazon Redshift clusters.',
      level: NagMessageLevel.ERROR,
      rule: RedshiftClusterEncryptionAtRest,
      node: node,
    });
    this.applyRule({
      info: 'The Redshift cluster does not have version upgrades enabled, automated snapshot retention periods enabled, and an explicit maintenance window configured - (Control IDs: 6.3.3).',
      explanation:
        'Ensure that Amazon Redshift clusters have the preferred settings for your organization. Specifically, that they have preferred maintenance windows and automated snapshot retention periods for the database.',
      level: NagMessageLevel.ERROR,
      rule: RedshiftClusterMaintenanceSettings,
      node: node,
    });
    this.applyRule({
      info: 'The Redshift cluster allows public access - (Control IDs: 1.3.1, 1.3.2, 1.4.4, 1.4.5).',
      explanation:
        'Amazon Redshift clusters can contain sensitive information and principles and access control is required for such accounts.',
      level: NagMessageLevel.ERROR,
      rule: RedshiftClusterPublicAccess,
      node: node,
    });
    this.applyRule({
      info: 'The Redshift cluster does not have enhanced VPC routing enabled - (Control IDs: 1.3.1, 1.3.2).',
      explanation:
        'Enhanced VPC routing forces all COPY and UNLOAD traffic between the cluster and data repositories to go through your Amazon VPC. You can then use VPC features such as security groups and network access control lists to secure network traffic. You can also use VPC flow logs to monitor network traffic.',
      level: NagMessageLevel.ERROR,
      rule: RedshiftEnhancedVPCRoutingEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The Redshift cluster does not require TLS/SSL encryption - (Control IDs: 4.2.1, 4.2.1.1, 4.2.1.2).',
      explanation:
        'Ensure that your Amazon Redshift clusters require TLS/SSL encryption to connect to SQL clients. Because sensitive data can exist, enable encryption in transit to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: RedshiftRequireTlsSSL,
      node: node,
    });
  }

  /**
   * Check Amazon S3 Resources
   * @param node the CfnResource to check
   */
  private checkS3(node: CfnResource): void {
    this.applyRule({
      info: 'The S3 bucket does not have object lock enabled - (Control IDs: 9.4.1, 10.3.2).',
      explanation:
        'S3 Object Lock helps prevent objects from being deleted or overwritten for a fixed amount of time or indefinitely.',
      level: NagMessageLevel.ERROR,
      rule: S3BucketDefaultLockEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The S3 bucket does not prohibit public access through bucket level settings - (Control IDs: 1.3.1, 1.3.2, 1.4.4, 1.4.5).',
      explanation:
        'Keep sensitive data safe from unauthorized remote users by preventing public access at the bucket level.',
      level: NagMessageLevel.ERROR,
      rule: S3BucketLevelPublicAccessProhibited,
      node: node,
    });
    this.applyRule({
      info: 'The S3 Buckets does not have server access logs enabled - (Control IDs: 2.2.1, 10.2.1, 10.2.1.1, 10.2.1.2, 10.2.1.3, 10.2.1.4, 10.2.1.5, 10.2.1.6, 10.2.1.7, 10.2.2, 10.3.1, 10.3.2, 10.3.3, 10.3.4).',
      explanation:
        'Amazon Simple Storage Service (Amazon S3) server access logging provides a method to monitor the network for potential cybersecurity events. The events are monitored by capturing detailed records for the requests that are made to an Amazon S3 bucket. Each access log record provides details about a single access request. The details include the requester, bucket name, request time, request action, response status, and an error code, if relevant.',
      level: NagMessageLevel.ERROR,
      rule: S3BucketLoggingEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The S3 Bucket does not prohibit public read access through its Block Public Access configurations and bucket ACLs - (Control IDs: 1.3.1, 1.3.2, 1.4.4, 1.4.5, 2.2.1).',
      explanation:
        'The management of access should be consistent with the classification of the data.',
      level: NagMessageLevel.ERROR,
      rule: S3BucketPublicReadProhibited,
      node: node,
    });
    this.applyRule({
      info: 'The S3 Bucket does not prohibit public write access through its Block Public Access configurations and bucket ACLs - (Control IDs: 1.3.1, 1.3.2, 1.4.4, 1.4.5, 2.2.1).',
      explanation:
        'The management of access should be consistent with the classification of the data.',
      level: NagMessageLevel.ERROR,
      rule: S3BucketPublicWriteProhibited,
      node: node,
    });
    this.applyRule({
      info: 'The S3 Bucket does not have replication enabled - (Control IDs: 2.2.1, 9.4.1).',
      explanation:
        'Amazon Simple Storage Service (Amazon S3) Cross-Region Replication (CRR) supports maintaining adequate capacity and availability. CRR enables automatic, asynchronous copying of objects across Amazon S3 buckets to help ensure that data availability is maintained.',
      level: NagMessageLevel.ERROR,
      rule: S3BucketReplicationEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The S3 Bucket or bucket policy does not require requests to use SSL - (Control IDs: 2.2.1, 4.2.1, 4.2.1.1, 4.2.1.2, 8.3.2).',
      explanation:
        'To help protect data in transit, ensure that your Amazon Simple Storage Service (Amazon S3) buckets require requests to use Secure Socket Layer (SSL). Because sensitive data can exist, enable encryption in transit to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: S3BucketSSLRequestsOnly,
      node: node,
    });
    this.applyRule({
      info: 'The S3 Bucket does not have versioning enabled - (Control IDs: 9.4.1, 10.3.2).',
      explanation:
        'Use versioning to preserve, retrieve, and restore every version of every object stored in your Amazon S3 bucket. Versioning helps you to easily recover from unintended user actions and application failures.',
      level: NagMessageLevel.ERROR,
      rule: S3BucketVersioningEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The S3 Bucket is not encrypted with a KMS Key by default - (Control IDs: 3.5.1, 3.5.1.1, 8.3.2, 10.3.2).',
      explanation:
        'Ensure that encryption is enabled for your Amazon Simple Storage Service (Amazon S3) buckets. Because sensitive data can exist at rest in an Amazon S3 bucket, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: S3DefaultEncryptionKMS,
      node: node,
    });
  }

  /**
   * Check SageMaker Resources
   * @param node the CfnResource to check
   */
  private checkSageMaker(node: CfnResource) {
    this.applyRule({
      info: 'The SageMaker resource endpoint is not encrypted with a KMS key - (Control IDs: 3.5.1, 3.5.1.1, 8.3.2).',
      explanation:
        'Because sensitive data can exist at rest in SageMaker endpoint, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerEndpointConfigurationKMSKeyConfigured,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker notebook is not encrypted with a KMS key - (Control IDs: 3.5.1, 3.5.1.1, 8.3.2).',
      explanation:
        'Because sensitive data can exist at rest in SageMaker notebook, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerNotebookInstanceKMSKeyConfigured,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker notebook does not disable direct internet access - (Control IDs: 1.3.1, 1.3.2, 1.4.4, 1.4.5).',
      explanation:
        'By preventing direct internet access, you can keep sensitive data from being accessed by unauthorized users.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerNotebookNoDirectInternetAccess,
      node: node,
    });
  }

  /**
   * Check Secrets Manager Resources
   * @param node the CfnResource to check
   */
  private checkSecretsManager(node: CfnResource): void {
    this.applyRule({
      info: 'The secret does not have automatic rotation scheduled - (Control IDs: 8.3.9, 8.6.3).',
      explanation:
        'Rotating secrets on a regular schedule can shorten the period a secret is active, and potentially reduce the business impact if the secret is compromised.',
      level: NagMessageLevel.ERROR,
      rule: SecretsManagerRotationEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The secret is not encrypted with a KMS Customer managed key - (Control IDs: 3.5.1, 3.5.1.1, 8.3.2).',
      explanation:
        'To help protect data at rest, ensure encryption with AWS Key Management Service (AWS KMS) is enabled for AWS Secrets Manager secrets. Because sensitive data can exist at rest in Secrets Manager secrets, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: SecretsManagerUsingKMSKey,
      node: node,
    });
  }

  /**
   * Check Amazon SNS Resources
   * @param node the CfnResource to check
   */
  private checkSNS(node: CfnResource): void {
    this.applyRule({
      info: 'The SNS topic does not have KMS encryption enabled - (Control IDs: 8.3.2).',
      explanation:
        'To help protect data at rest, ensure that your Amazon Simple Notification Service (Amazon SNS) topics require encryption using AWS Key Management Service (AWS KMS) Because sensitive data can exist at rest in published messages, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: SNSEncryptedKMS,
      node: node,
    });
  }

  /**
   * Check Step Functions Resources
   * @param node the CfnResource to check
   */
  private checkStepFunctions(node: CfnResource): void {
    this.applyRule({
      info: 'The Step Functions state machine does not have logging enabled - (Control IDs: 10.2.1, 10.2.1.1, 10.2.1.2, 10.2.1.3, 10.2.1.4, 10.2.1.5, 10.2.1.6, 10.2.1.7, 10.2.2, 10.3.1, 10.3.2, 10.3.3, 10.3.4).',
      explanation:
        'AWS Step Functions can send logs to CloudWatch Logs, which you can use to troubleshoot and audit your workflows.',
      level: NagMessageLevel.ERROR,
      rule: StepFunctionStateMachineAllLogsToCloudWatch,
      node: node,
    });
  }

  /**
   * Check VPC Resources
   * @param node the CfnResource to check
   */
  private checkVPC(node: CfnResource): void {
    this.applyRule({
      info: "The VPC's default security group allows inbound or outbound traffic - (Control IDs: 1.3.1, 1.3.2, 1.4.1, 1.4.2, 2.1.1, 2.2.1).",
      explanation:
        'Amazon Elastic Compute Cloud (Amazon EC2) security groups can help in the management of network access by providing stateful filtering of ingress and egress network traffic to AWS resources. Restricting all the traffic on the default security group helps in restricting remote access to your AWS resources.',
      level: NagMessageLevel.WARN,
      rule: VPCDefaultSecurityGroupClosed,
      node: node,
    });
    this.applyRule({
      info: 'The VPC does not have an associated Flow Log - (Control IDs: 2.2.1, 10.2.1, 10.2.1.1, 10.2.1.2, 10.2.1.3, 10.2.1.4, 10.2.1.5, 10.2.1.6, 10.2.1.7, 10.2.2, 10.3.1, 10.3.2, 10.3.3, 10.3.4).',
      explanation:
        'The VPC flow logs provide detailed records for information about the IP traffic going to and from network interfaces in your Amazon Virtual Private Cloud (Amazon VPC). By default, the flow log record includes values for the different components of the IP flow, including the source, destination, and protocol.',
      level: NagMessageLevel.ERROR,
      rule: VPCFlowLogsEnabled,
      node: node,
    });
    this.applyRule({
      info: "The route table may contain one or more unrestricted route(s) to an IGW ('0.0.0.0/0' or '::/0') - (Control IDs: 1.3.1, 1.3.2, 1.4.1, 1.4.2).",
      explanation:
        'Ensure Amazon EC2 route tables do not have unrestricted routes to an internet gateway. Removing or limiting the access to the internet for workloads within Amazon VPCs can reduce unintended access within your environment.',
      level: NagMessageLevel.ERROR,
      rule: VPCNoUnrestrictedRouteToIGW,
      node: node,
    });
    this.applyRule({
      info: 'The subnet auto-assigns public IP addresses - (Control IDs: 1.3.1, 1.3.2, 1.4.4, 1.4.5).',
      explanation:
        'Manage access to the AWS Cloud by ensuring Amazon Virtual Private Cloud (VPC) subnets are not automatically assigned a public IP address. Amazon Elastic Compute Cloud (EC2) instances that are launched into subnets that have this attribute enabled have a public IP address assigned to their primary network interface.',
      level: NagMessageLevel.ERROR,
      rule: VPCSubnetAutoAssignPublicIpDisabled,
      node: node,
    });
  }

  /**
   * Check WAF Resources
   * @param node the CfnResource to check
   */
  private checkWAF(node: CfnResource): void {
    this.applyRule({
      info: 'The WAFv2 web ACL does not have logging enabled - (Control IDs: 10.2.1, 10.2.1.1, 10.2.1.2, 10.2.1.3, 10.2.1.4, 10.2.1.5, 10.2.1.6, 10.2.1.7, 10.2.2, 10.3.1, 10.3.2, 10.3.3, 10.3.4).',
      explanation:
        'AWS WAF logging provides detailed information about the traffic that is analyzed by your web ACL. The logs record the time that AWS WAF received the request from your AWS resource, information about the request, and an action for the rule that each request matched.',
      level: NagMessageLevel.ERROR,
      rule: WAFv2LoggingEnabled,
      node: node,
    });
  }
}
