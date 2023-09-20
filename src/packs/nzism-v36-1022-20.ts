/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnResource } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
import { NagPack, NagPackProps } from '../nag-pack';
import { NagMessageLevel } from '../nag-rules';
import { APIGWExecutionLoggingEnabled } from '../rules/apigw';
import {
  CloudFrontDistributionAccessLogging,
  CloudFrontDistributionHttpsViewerNoOutdatedSSL,
  CloudFrontDistributionWAFIntegration,
  CloudFrontDefaultRootObjectConfigured,
} from '../rules/cloudfront';
import {
  CloudTrailCloudWatchLogsEnabled,
  CloudTrailEncryptionEnabled,
  CloudTrailLogFileValidationEnabled,
} from '../rules/cloudtrail';
import {
  CloudWatchLogGroupEncrypted,
  CloudWatchLogGroupRetentionPeriod,
} from '../rules/cloudwatch';
import { DMSReplicationNotPublic } from '../rules/dms';
import {
  DynamoDBAutoScalingEnabled,
  DynamoDBInBackupPlan,
  DynamoDBPITREnabled,
} from '../rules/dynamodb';
import {
  EC2EBSInBackupPlan,
  EC2InstanceNoPublicIp,
  EC2InstancesInVPC,
  EC2RestrictedSSH,
  EC2EBSVolumeEncrypted,
  EC2SecurityGroupOnlyTcp443,
  EC2IMDSv2Enabled,
} from '../rules/ec2';
import { ECSTaskDefinitionUserForHostMode } from '../rules/ecs';
import { EFSEncrypted, EFSInBackupPlan } from '../rules/efs';
import { ElastiCacheRedisClusterAutomaticBackup } from '../rules/elasticache';
import { ElasticBeanstalkManagedUpdatesEnabled } from '../rules/elasticbeanstalk';
import {
  ALBHttpToHttpsRedirection,
  ALBWAFEnabled,
  ELBCrossZoneLoadBalancingEnabled,
  ELBLoggingEnabled,
  ELBTlsHttpsListenersOnly,
} from '../rules/elb';
import { IAMPolicyNoStatementsWithAdminAccess } from '../rules/iam';
import { KMSBackingKeyRotationEnabled } from '../rules/kms';
import { LambdaFunctionPublicAccessProhibited } from '../rules/lambda';
import {
  OpenSearchEncryptedAtRest,
  OpenSearchInVPCOnly,
  OpenSearchNodeToNodeEncryption,
} from '../rules/opensearch';
import {
  RDSAutomaticMinorVersionUpgradeEnabled,
  RDSInBackupPlan,
  RDSInstanceDeletionProtectionEnabled,
  RDSInstancePublicAccess,
  RDSLoggingEnabled,
  RDSMultiAZSupport,
  RDSStorageEncrypted,
} from '../rules/rds';
import {
  RedshiftRequireTlsSSL,
  RedshiftBackupEnabled,
  RedshiftClusterConfiguration,
  RedshiftClusterMaintenanceSettings,
  RedshiftClusterPublicAccess,
} from '../rules/redshift';
import {
  S3BucketLevelPublicAccessProhibited,
  S3BucketLoggingEnabled,
  S3BucketPublicReadProhibited,
  S3BucketPublicWriteProhibited,
  S3BucketSSLRequestsOnly,
  S3BucketVersioningEnabled,
  S3DefaultEncryptionKMS,
} from '../rules/s3';
import {
  SageMakerEndpointConfigurationKMSKeyConfigured,
  SageMakerNotebookInstanceKMSKeyConfigured,
  SageMakerNotebookNoDirectInternetAccess,
} from '../rules/sagemaker';
import { SecretsManagerUsingKMSKey } from '../rules/secretsmanager';
import { SNSEncryptedKMS } from '../rules/sns';
import {
  VPCFlowLogsEnabled,
  VPCDefaultSecurityGroupClosed,
} from '../rules/vpc';
import { WAFv2LoggingEnabled } from '../rules/waf';

/**
 * Check for NZISM v36-1022-20 compliance.
 * Based on the NZISM v36-1022-20: <URL To be updated once published>
 * */

export class NZISM36Checks extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'NZISM3.6';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      this.checkELB(node);
      this.checkAPIGW(node);
      this.checkCloudTrail(node);
      this.checkCloudFront(node);
      this.checkKMS(node);
      this.checkCloudWatch(node);
      this.checkRDS(node);
      this.checkECS(node);
      this.checkEFS(node);
      this.checkDMS(node);
      this.checkDynamoDB(node);
      this.checkEC2(node);
      this.checkElasticBeanstalk(node);
      this.checkElastiCache(node);
      this.checkLambda(node);
      this.checkOpenSearch(node);
      this.checkIAM(node);
      this.checkRedshift(node);
      this.checkS3(node);
      this.checkSageMaker(node);
      this.checkSecretsManager(node);
      this.checkSNS(node);
      this.checkVPC(node);
      this.checkWAF(node);
    }
  }

  /**
   * Check API Gateway Resources
   * E
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkAPIGW(node: CfnResource): void {
    this.applyRule({
      info: 'The API Gateway stage does not have execution logging enabled for all methods - (Control IDs: SHOULD(16.6.10.C.02[CID:2013]), MUST(23.5.11.C.01[CID:7496]))',
      explanation:
        'API Gateway logging displays detailed views of users who accessed the API and the way they accessed the API. This insight enables visibility of user activities.',
      level: NagMessageLevel.ERROR,
      rule: APIGWExecutionLoggingEnabled,
      node: node,
    });
  }

  /**
   * Check CloudFront Resources
   * @param node
   * @param ignores
   */
  private checkCloudFront(node: CfnResource): void {
    this.applyRule({
      info: 'The CloudFront distribution does not have access logging enabled. - (Control IDs: SHOULD(16.6.10.C.02[CID:2013]), MUST(23.5.11.C.01[CID:7496]))',
      explanation:
        'Enabling access logs helps operators track all viewer requests for the content delivered through the Content Delivery Network.',
      level: NagMessageLevel.ERROR,
      rule: CloudFrontDistributionAccessLogging,
      node: node,
    });
    this.applyRule({
      info: 'The CloudFront distribution requires integration with WAF  - (Control IDs: MUST(19.1.12.C.01[CID:3562]))',
      explanation:
        'The Web Application Firewall can help protect against application-layer attacks that can compromise the security of the system or place unnecessary load on them.',
      level: NagMessageLevel.ERROR,
      rule: CloudFrontDistributionWAFIntegration,
      node: node,
    });

    this.applyRule({
      info: 'The CloudFront distribution allows for SSLv3 or TLSv1 for HTTPS viewer connections - (Control IDs: MUST(16.1.37.C.01[CID:1847]))',
      explanation:
        'Vulnerabilities have been and continue to be discovered in the deprecated SSL and TLS protocols. Help protect viewer connections by specifying a viewer certificate that enforces a minimum of TLSv1.1 or TLSv1.2 in the security policy. Distributions that use the default CloudFront viewer certificate or use vip for the SslSupportMethod are non-compliant with this rule, as the minimum security policy is set to TLSv1 regardless of the specified MinimumProtocolVersion',
      level: NagMessageLevel.ERROR,
      rule: CloudFrontDistributionHttpsViewerNoOutdatedSSL,
      node: node,
    });

    this.applyRule({
      info: 'The Cloudfront distribution requires a default object - (Control IDs: SHOULD(14.5.6.C.01[CID:1661]))',
      explanation:
        'Specifying a default root object lets you avoid exposing the contents of your distribution',
      level: NagMessageLevel.WARN,
      rule: CloudFrontDefaultRootObjectConfigured,
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
      info: 'The trail does not have CloudWatch logs enabled - (Control IDs: SHOULD(16.6.6.C.02[CID:1998]), MUST(16.4.35.C.02[CID:6860]))',
      explanation:
        'Use Amazon CloudWatch to centrally collect and manage log event activity. Inclusion of AWS CloudTrail data provides details of API call activity within your AWS account.',
      level: NagMessageLevel.ERROR,
      rule: CloudTrailCloudWatchLogsEnabled,
      node: node,
    });

    this.applyRule({
      info: 'The trail does not have encryption enabled - (Control IDs:  SHOULD(17.1.46.C.04[CID:2082]))',
      explanation:
        'Because sensitive data may exist and to help protect data at rest, ensure encryption is enabled for your AWS CloudTrail trails.',
      level: NagMessageLevel.WARN,
      rule: CloudTrailEncryptionEnabled,
      node: node,
    });

    this.applyRule({
      info: 'The trail does not have log file validation  - (Control IDs: MUST(16.6.12.C.01[CID:2022], 23.5.11.C.01[CID:7496]))',
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
   * @param ignores list of ignores for the resource
   */

  private checkCloudWatch(node: CfnResource): void {
    this.applyRule({
      info: 'The CloudWatch Log Group does not have an explicit retention period configured - (Control IDs: SHOULD(16.6.6.C.02[CID:1998]), MUST(16.6.13.C.01[CID:2028]))',
      explanation:
        'Ensure a minimum duration of event log data is retained for your log groups to help with troubleshooting and forensics investigations. The lack of available past event log data makes it difficult to reconstruct and identify potentially malicious events.',
      level: NagMessageLevel.ERROR,
      rule: CloudWatchLogGroupRetentionPeriod,
      node: node,
    });

    this.applyRule({
      info: 'The CloudWatch Log Group is not encrypted with an AWS KMS key - (Control IDs: MUST(16.6.12.C.01[CID:2022], 23.5.11.C.01[CID:7496]))',
      explanation:
        'To help protect sensitive data at rest, ensure encryption is enabled for your Amazon CloudWatch Log Groups.',
      level: NagMessageLevel.ERROR,
      rule: CloudWatchLogGroupEncrypted,
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
      info: 'The DMS replication instance is public - (Control IDs: MUST(19.1.12.C.01[CID:3562], 23.4.10.C.01[CID:7466]))',
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
   * @param ignores list of ignores for the resource
   */
  private checkDynamoDB(node: CfnResource) {
    this.applyRule({
      info: 'The provisioned capacity DynamoDB table does not have Auto Scaling enabled on its indexes - (Control IDs: MUST(22.1.23.C.01[CID:4829]))',
      explanation:
        'Amazon DynamoDB auto scaling uses the AWS Application Auto Scaling service to adjust provisioned throughput capacity that automatically responds to actual traffic patterns. This enables a table or a global secondary index to increase its provisioned read/write capacity to handle sudden increases in traffic, without throttling.',
      level: NagMessageLevel.ERROR,
      rule: DynamoDBAutoScalingEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The DynamoDB table is not in an AWS Backup plan - (Control IDs: MUST(22.1.26.C.01[CID:4849]))',
      explanation:
        'To help with data back-up processes, ensure your Amazon DynamoDB tables are a part of an AWS Backup plan. AWS Backup is a fully managed backup service with a policy-based backup solution. This solution simplifies your backup management and enables you to meet your business and regulatory backup compliance requirements.',
      level: NagMessageLevel.ERROR,
      rule: DynamoDBInBackupPlan,
      node: node,
    });
    this.applyRule({
      info: 'The DynamoDB table does not have Point-in-time Recovery enabled - (Control IDs: MUST(22.1.26.C.01[CID:4849]))',
      explanation:
        'The recovery maintains continuous backups of your table for the last 35 days.',
      level: NagMessageLevel.ERROR,
      rule: DynamoDBPITREnabled,
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
      info: 'The EBS volume is not in an AWS Backup plan - (Control IDs: MUST(22.1.26.C.01[CID:4849]))',
      explanation:
        'To help with data back-up processes, ensure your Amazon Elastic Block Store (Amazon EBS) volumes are a part of an AWS Backup plan. AWS Backup is a fully managed backup service with a policy-based backup solution. This solution simplifies your backup management and enables you to meet your business and regulatory backup compliance requirements.',
      level: NagMessageLevel.ERROR,
      rule: EC2EBSInBackupPlan,
      node: node,
    });

    this.applyRule({
      info: 'The EC2 instance is associated with a public IP address - (Control IDs: MUST(19.1.12.C.01[CID:3562], 23.4.10.C.01[CID:7466]))',
      explanation:
        'Manage access to the AWS Cloud by ensuring Amazon Elastic Compute Cloud (Amazon EC2) instances cannot be publicly accessed. Amazon EC2 instances can contain sensitive information and access control is required for such accounts.',
      level: NagMessageLevel.ERROR,
      rule: EC2InstanceNoPublicIp,
      node: node,
    });

    this.applyRule({
      info: 'The EC2 instance is not within a VPC  - (Control IDs:  MUST(19.1.12.C.01[CID:3562], 23.4.10.C.01[CID:7466]))',
      explanation:
        'Deploy Amazon Elastic Compute Cloud (Amazon EC2) instances within an Amazon Virtual Private Cloud (Amazon VPC) to enable secure communication between an instance and other services within the amazon VPC, without requiring an internet gateway, NAT device, or VPN connection. All traffic remains securely within the AWS Cloud. Because of their logical isolation, domains that reside within anAmazon VPC have an extra layer of security when compared to domains that use public endpoints. Assign Amazon EC2 instances to an Amazon VPC to properly manage access.',
      level: NagMessageLevel.ERROR,
      rule: EC2InstancesInVPC,
      node: node,
    });

    this.applyRule({
      info: 'The EBS volume has encryption disabled - (Control IDs: SHOULD(17.1.46.C.04[CID:2082], 22.1.24.C.04[CID:4839]))',
      explanation:
        'With EBS encryption, you aren not required to build, maintain, and secure your own key management infrastructure. EBS encryption uses KMS keys when creating encrypted volumes and snapshots. This helps protect data at rest.',
      level: NagMessageLevel.WARN,
      rule: EC2EBSVolumeEncrypted,
      node: node,
    });

    this.applyRule({
      info: 'The Security Group allows unrestricted SSH access - (Control IDs: SHOULD(17.5.8.C.02[CID:2726]))',
      explanation:
        'Not allowing ingress (or remote) traffic from 0.0.0.0/0 or ::/0 to port 22 on your resources helps to restrict remote access.',
      level: NagMessageLevel.WARN,
      rule: EC2RestrictedSSH,
      node: node,
    });

    this.applyRule({
      info: 'The Security Group allows access other than tcp 443 - (Control IDs: SHOULD(18.1.13.C.02[CID:3205]))',
      explanation:
        'Not allowing ingress (or remote) traffic to ports other than tcp port 443 helps improve security',
      level: NagMessageLevel.WARN,
      rule: EC2SecurityGroupOnlyTcp443,
      node: node,
    });

    // this can be modified to use EC2IMDVs2 enabled.
    this.applyRule({
      info: 'The EC2 Instance does not use IMDSv2 - (Control IDs: MUST(19.1.12.C.01[CID:3562], 23.4.10.C.01[CID:7466]))',
      explanation:
        'IMDSv2 adds additional protection by using session authentication to the Instance Meta Data Service',
      level: NagMessageLevel.ERROR,
      rule: EC2IMDSv2Enabled,
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
      info: 'The ECS task definition is configured for host networking and has at least one container with definitions with privileged set to false or empty or user set to root or empty - (Control IDs: SHOULD(14.1.8.C.01[CID:1149]))',
      explanation:
        'If a task definition has elevated privileges it is because you have specifically opted-in to those configurations. This rule checks for unexpected privilege escalation when a task definition has host networking enabled but the customer has not opted-in to elevated privileges.',
      level: NagMessageLevel.WARN,
      rule: ECSTaskDefinitionUserForHostMode,
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
      info: 'The EFS is not in an AWS Backup plan - (Control IDs: MUST(22.1.26.C.01[CID:4849]))',
      explanation:
        'To help with data back-up processes, ensure your Amazon Elastic File System (Amazon EFS) file systems are a part of an AWS Backup plan. AWS Backup is a fully managed backup service with a policy-based backup solution. This solution simplifies your backup management and enables you to meet your business and regulatory backup compliance requirements.',
      level: NagMessageLevel.ERROR,
      rule: EFSInBackupPlan,
      node: node,
    });
    this.applyRule({
      info: 'The EFS does not have encryption at rest enabled - (Control IDs: SHOULD(17.1.46.C.04[CID:2082], 22.1.24.C.04[CID:4839]))',
      explanation:
        'Because sensitive data can exist and to help protect data at rest, ensure encryption is enabled for your Amazon Elastic File System (EFS).',
      level: NagMessageLevel.WARN,
      rule: EFSEncrypted,
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
      info: 'The ElastiCache Redis cluster does not retain automatic backups for at least 15 days - (Control IDs: MUST(22.1.26.C.01[CID:4849]))',
      explanation:
        'Automatic backups can help guard against data loss. If a failure occurs, you can create a new cluster, which restores your data from the most recent backup.',
      level: NagMessageLevel.ERROR,
      rule: ElastiCacheRedisClusterAutomaticBackup,
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
      info: 'The Elastic Beanstalk environment does not have enhanced health reporting enabled - (Control IDs: SHOULD(12.4.4.C.05[CID:3452]))',
      explanation:
        'Enabling managed platform updates for an Amazon Elastic Beanstalk environment ensures that the latest available platform fixes, updates, and features for the environment are installed. Keeping up to date with patch installation is a best practice in securing systems.',
      level: NagMessageLevel.WARN,
      rule: ElasticBeanstalkManagedUpdatesEnabled,
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
      info: 'The ALBs HTTP listeners are not configured to redirect to HTTPS - (Control IDs: MUST 16.1.37.C.01[CID:1847], MUST 17.1.48.C.03[CID:2091])',
      explanation:
        'To help protect data in transit, ensure that your Application Load Balancer automatically redirects unencrypted HTTP requests to HTTPS. Because sensitive data can exist, enable encryption in transit to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: ALBHttpToHttpsRedirection,
      node: node,
    });

    this.applyRule({
      info: 'The ALB is not associated with AWS WAFv2 web ACL  - (Control IDs: MUST 19.1.12.C.01[CID:3562], SHOULD 20.3.7.C.02[CID:4333], MUST 23.4.10.C.01[CID:7466])',
      explanation:
        'A WAF helps to protect your web applications or APIs against common web exploits. These web exploits may affect availability, compromise security, or consume excessive resources within your environment.',
      level: NagMessageLevel.ERROR,
      rule: ALBWAFEnabled,
      node: node,
    });

    this.applyRule({
      info: 'Load Balancer is not enabled for Cross Zone - (Control IDs: MUST 22.1.23.C.01[CID:4829])',
      explanation:
        "Enable cross-zone load balancing for your Classic Load Balancers (CLBs) to help maintain adequate capacity and availability. The cross-zone load balancing reduces the need to maintain equivalent numbers of instances in each enabled availability zone. It also improves your application's ability to handle the loss of one or more instances.",
      level: NagMessageLevel.ERROR,
      rule: ELBCrossZoneLoadBalancingEnabled,
      node: node,
    });

    this.applyRule({
      info: 'The ELB does not have logging enabled - (Control IDs: SHOULD 16.6.10.C.02[CID:2013], MUST 23.5.11.C.01[CID:7496])',
      explanation:
        "Elastic Load Balancing activity is a central point of communication within an environment. Ensure ELB logging is enabled. The collected data provides detailed information about requests sent to The ELB. Each log contains information such as the time the request was received, the client's IP address, latencies, request paths, and server responses.",
      level: NagMessageLevel.ERROR,
      rule: ELBLoggingEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The ELB does not restrict its listeners to only the SSL and HTTPS protocol - (Control IDs: SHOULD 14.5.8.C.01[CID:1667], MUST 16.1.37.C.01[CID:1847], MUST 17.1.48.C.03[CID:2091], SHOULD 22.1.24.C.04[CID:4839])',
      explanation:
        'Ensure that your Classic Load Balancers (CLBs) are configured with SSL or HTTPS listeners. Because sensitive data can exist, enable encryption in transit to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: ELBTlsHttpsListenersOnly,
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
      info: 'The IAM policy grants admin access, meaning the policy allows a principal to perform all actions on all resources - (Control IDs: SHOULD 16.3.5.C.02[CID:1946])',
      explanation:
        'AWS Identity and Access Management (IAM) can help you incorporate the principles of least privilege and separation of duties with access permissions and authorizations, by ensuring that IAM groups have at least one IAM user. Placing IAM users in groups based on their associated permissions or job function is one way to incorporate least privilege.',
      level: NagMessageLevel.WARN,
      rule: IAMPolicyNoStatementsWithAdminAccess,
      node: node,
    });
  }

  /**
   * Check KMS Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkKMS(node: CfnResource): void {
    this.applyRule({
      info: 'The KMS Symmetric key does not have automatic key rotation enabled - (Control IDs: SHOULD 17.9.25.C.01[CID:3021])',
      explanation:
        'Enable key rotation to ensure that keys are rotated once they have reached the end of their crypto period.',
      level: NagMessageLevel.WARN,
      rule: KMSBackingKeyRotationEnabled,
      node: node,
    });
  }

  /**
   * Check Lambda
   * @param node
   */

  private checkLambda(node: CfnResource) {
    this.applyRule({
      info: 'The Lambda function permission grants public access - (Control IDs: MUST 19.1.12.C.01[CID:3562], MUST 23.4.10.C.01[CID:7466])',
      explanation:
        'Public access allows anyone on the internet to perform unauthenticated actions on your function and can potentially lead to degraded availability.',
      level: NagMessageLevel.ERROR,
      rule: LambdaFunctionPublicAccessProhibited,
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
      info: 'The OpenSearch Service domain does not have encryption at rest enabled - (Control IDs: SHOULD 17.1.46.C.04[CID:2082], SHOULD 20.4.4.C.02[CID:4441], SHOULD 22.1.24.C.04[CID:4839])',
      explanation:
        'Because sensitive data can exist and to help protect data at rest, ensure encryption is enabled for your Amazon OpenSearch Service (OpenSearch Service) domains.',
      level: NagMessageLevel.WARN,
      rule: OpenSearchEncryptedAtRest,
      node: node,
    });

    this.applyRule({
      info: 'The OpenSearch Service domain is not running within a VPC - (Control IDs: MUST 19.1.12.C.01[CID:3562], SHOULD 19.1.14.C.02[CID:3623])',
      explanation:
        'VPCs help secure your AWS resources and provide an extra layer of protection.',
      level: NagMessageLevel.ERROR,
      rule: OpenSearchInVPCOnly,
      node: node,
    });

    this.applyRule({
      info: 'The OpenSearch Service domain does not have node-to-node encryption enabled - (Control IDs: MUST 16.1.37.C.01[CID:1847], SHOULD 22.1.24.C.04[CID:4839])',
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
   * @param ignores list of ignores for the resource
   */
  private checkRDS(node: CfnResource): void {
    this.applyRule({
      info: 'The RDS DB Instance or Aurora Cluster does not have deletion protection enabled - (Control IDs: MUST 22.1.26.C.01[CID:4849])',
      explanation:
        'Ensure Amazon Relational Database Service (Amazon RDS) instances and clusters have deletion protection enabled. Use deletion protection to prevent your Amazon RDS DB instances and clusters from being accidentally or maliciously deleted, which can lead to loss of availability for your applications.',
      level: NagMessageLevel.ERROR,
      rule: RDSInstanceDeletionProtectionEnabled,
      node: node,
    });

    this.applyRule({
      info: 'The RDS DB Instance does not have multi-AZ support - (Control IDs: MUST 22.1.23.C.01[CID:4829])',
      explanation:
        'Ensure Amazon Relational Database Service (Amazon RDS) instances and clusters have deletion protection enabled. Use deletion protection to prevent your Amazon RDS DB instances and clusters from being accidentally or maliciously deleted, which can lead to loss of availability for your applications.',
      level: NagMessageLevel.ERROR,
      rule: RDSMultiAZSupport,
      node: node,
    });

    this.applyRule({
      info: 'The RDS DB instance is not in an AWS Backup plan - (Control IDs: MUST 22.1.26.C.01[CID:4849])',
      explanation:
        'To help with data back-up processes, ensure your Amazon Relational Database Service (Amazon RDS) instances are a part of an AWS Backup plan. AWS Backup is a fully managed backup service with a policy-based backup solution. This solution simplifies your backup management and enables you to meet your business and regulatory backup compliance requirements.',
      level: NagMessageLevel.ERROR,
      rule: RDSInBackupPlan,
      node: node,
    });

    this.applyRule({
      info: 'The RDS DB Instance allows public access - (Control IDs: MUST 19.1.12.C.01[CID:3562], SHOULD 19.1.14.C.02[CID:3623], MUST 23.4.10.C.01[CID:7466])',
      explanation:
        'Amazon RDS database instances can contain sensitive information, and principles and access control is required for such accounts.',
      level: NagMessageLevel.ERROR,
      rule: RDSInstancePublicAccess,
      node: node,
    });

    this.applyRule({
      info: 'The non-Aurora RDS DB instance or Aurora cluster does not have all CloudWatch log types exported - (Control IDs: SHOULD 16.6.10.C.02[CID:2013], SHOULD 20.4.4.C.02[CID:4441], SHOULD 20.4.5.C.02[CID:4445], MUST 23.5.11.C.01[CID:7496])',
      explanation:
        'To help with logging and monitoring within your environment, ensure Amazon Relational Database Service (Amazon RDS) logging is enabled. With Amazon RDS logging, you can capture events such as connections, disconnections, queries, or tables queried.' +
        "This is a granular rule that returns individual findings that can be suppressed with 'appliesTo'. The findings are in the format 'LogExport::<log>' for exported logs. Example: appliesTo: ['LogExport::audit'].",
      level: NagMessageLevel.ERROR,
      rule: RDSLoggingEnabled,
      node: node,
    });

    this.applyRule({
      info: 'The RDS DB Instance or Aurora Cluster does not have storage encrypted - (Control IDs: SHOULD 17.1.46.C.04[CID:2082], SHOULD 20.4.4.C.02[CID:4441], SHOULD 22.1.24.C.04[CID:4839])',
      explanation:
        'Because sensitive data can exist at rest in Amazon RDS instances, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.WARN,
      rule: RDSStorageEncrypted,
      node: node,
    });

    this.applyRule({
      info: 'RDS DB Instance is not configured for minor patches - (Control IDs: SHOULD 12.4.4.C.05[CID:3452])',
      explanation: 'Provides automatic Patching in the Database',
      level: NagMessageLevel.WARN,
      rule: RDSAutomaticMinorVersionUpgradeEnabled,
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
      info: 'The Redshift cluster does not have automated snapshots enabled or the retention period is not between 1 and 35 days - (Control IDs: MUST 22.1.26.C.01[CID:4849])',
      explanation:
        'To help with data back-up processes, ensure your Amazon Redshift clusters have automated snapshots. When automated snapshots are enabled for a cluster, Redshift periodically takes snapshots of that cluster. By default, Redshift takes a snapshot every eight hours or every 5 GB per node of data changes, or whichever comes first.',
      level: NagMessageLevel.ERROR,
      rule: RedshiftBackupEnabled,
      node: node,
    });

    this.applyRule({
      info: 'The Redshift cluster does not have encryption or audit logging enabled - (Control IDs: SHOULD 20.4.4.C.02[CID:4441], SHOULD 20.4.5.C.02[CID:4445], SHOULD 22.1.24.C.04[CID:4839])',
      explanation:
        'To protect data at rest, ensure that encryption is enabled for your Amazon Redshift clusters. You must also ensure that required configurations are deployed on Amazon Redshift clusters. The audit logging should be enabled to provide information about connections and user activities in the database.',
      level: NagMessageLevel.WARN,
      rule: RedshiftClusterConfiguration,
      node: node,
    });

    this.applyRule({
      info: 'The Redshift cluster does not have version upgrades enabled, automated snapshot retention periods enabled, and an explicit maintenance window configure - (Control IDs:  MUST 12.4.4.C.02[CID:3449], SHOULD 12.4.4.C.06[CID:3453])',
      explanation:
        'Ensure that Amazon Redshift clusters have the preferred settings for your organization. Specifically, that they have preferred maintenance windows and automated snapshot retention periods for the database.                                                                            ',
      level: NagMessageLevel.ERROR,
      rule: RedshiftClusterMaintenanceSettings,
      node: node,
    });

    this.applyRule({
      info: 'Redshift must not be made publically avaialble - (Control IDs: MUST 19.1.12.C.01[CID:3562], SHOULD 19.1.14.C.02[CID:3623], MUST 23.4.10.C.01[CID:7466])',
      explanation:
        'Amazon Redshift clusters can contain sensitive information and principles and access control is required for such accounts.',
      level: NagMessageLevel.ERROR,
      rule: RedshiftClusterPublicAccess,
      node: node,
    });

    this.applyRule({
      info: 'The Redshift cluster must use  TLS/SSL encryption. - (Control IDs: MUST 17.1.48.C.03[CID:2091], SHOULD 22.1.24.C.04[CID:4839])',
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
   * @param ignores list of ignores for the resource
   */
  private checkS3(node: CfnResource): void {
    this.applyRule({
      info: 'The S3 bucket does not prohibit public access through bucket level settings - (Control IDs: SHOULD 22.1.24.C.03[CID:4838])',
      explanation:
        'Keep sensitive data safe from unauthorized remote users by preventing public access at the bucket level.',
      level: NagMessageLevel.WARN,
      rule: S3BucketLevelPublicAccessProhibited,
      node: node,
    });
    this.applyRule({
      info: 'The S3 Bucket or bucket policy does not require requests to use SSL - (Control IDs:  SHOULD 22.1.24.C.04[CID:4839])',
      explanation:
        'To help protect data in transit, ensure that your Amazon Simple Storage Service (Amazon S3) buckets require requests to use Secure Socket Layer (SSL). Because sensitive data can exist, enable encryption in transit to help protect that data.',
      level: NagMessageLevel.WARN,
      rule: S3BucketSSLRequestsOnly,
      node: node,
    });
    this.applyRule({
      info: 'The S3 Buckets does not have server access logs enabled - (Control IDs: MUST 22.1.26.C.01[CID:4849])',
      explanation:
        'Amazon Simple Storage Service (Amazon S3) server access logging provides a method to monitor the network for potential cybersecurity events. The events are monitored by capturing detailed records for the requests that are made to an Amazon S3 bucket. Each access log record provides details about a single access request. The details include the requester, bucket name, request time, request action, response status, and an error code, if relevant.',
      level: NagMessageLevel.ERROR,
      rule: S3BucketLoggingEnabled,
      node: node,
    });

    this.applyRule({
      info: 'The S3 Bucket does not prohibit public read access through its Block Public Access configurations and bucket ACLs - (Control IDs: SHOULD 22.1.24.C.03[CID:4838])',
      explanation:
        'The management of access should be consistent with the classification of the data.',
      level: NagMessageLevel.WARN,
      rule: S3BucketPublicReadProhibited,
      node: node,
    });
    this.applyRule({
      info: 'The S3 Bucket does not prohibit public write access through its Block Public Access configurations and bucket ACLs - (Control IDs: SHOULD 22.1.24.C.03[CID:4838])',
      explanation:
        'The management of access should be consistent with the classification of the data.',
      level: NagMessageLevel.WARN,
      rule: S3BucketPublicWriteProhibited,
      node: node,
    });
    this.applyRule({
      info: 'The S3 Bucket does not have versioning enabled - (Control IDs: MUST 22.1.26.C.01[CID:4849])',
      explanation:
        'Use versioning to preserve, retrieve, and restore every version of every object stored in your Amazon S3 bucket. Versioning helps you to easily recover from unintended user actions and application failures.',
      level: NagMessageLevel.ERROR,
      rule: S3BucketVersioningEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The S3 Bucket is not encrypted with a KMS Key by default - (Control IDs: SHOULD 17.1.46.C.04[CID:2082])',
      explanation:
        'Ensure that encryption is enabled for your Amazon Simple Storage Service (Amazon S3) buckets. Because sensitive data can exist at rest in an Amazon S3 bucket, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.WARN,
      rule: S3DefaultEncryptionKMS,
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
      info: 'The SageMaker resource endpoint is not encrypted with a KMS key  - (Control IDs: SHOULD 22.1.24.C.04[CID:4839])',
      explanation:
        'Because sensitive data can exist at rest in SageMaker endpoint, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.WARN,
      rule: SageMakerEndpointConfigurationKMSKeyConfigured,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker notebook is not encrypted with a KMS key - (Control IDs: SHOULD 22.1.24.C.04[CID:4839])',
      explanation:
        'Because sensitive data can exist at rest in SageMaker notebook, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.WARN,
      rule: SageMakerNotebookInstanceKMSKeyConfigured,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker notebook does not disable direct internet access - (Control IDs: MUST 19.1.12.C.01[CID:3562], MUST 23.4.10.C.01[CID:7466])',
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
   * @param ignores list of ignores for the resource
   */
  private checkSecretsManager(node: CfnResource): void {
    this.applyRule({
      info: 'The secret is not encrypted with a KMS Customer managed key - (Control IDs: SHOULD 22.1.24.C.04[CID:4839])',
      explanation:
        'To help protect data at rest, ensure encryption with AWS Key Management Service (AWS KMS) is enabled for AWS Secrets Manager secrets. Because sensitive data can exist at rest in Secrets Manager secrets, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.WARN,
      rule: SecretsManagerUsingKMSKey,
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
      info: 'The SNS topic does not have KMS encryption enabled - (Control IDs: SHOULD 22.1.24.C.04[CID:4839])',
      explanation:
        'To help protect data at rest, ensure that your Amazon Simple Notification Service (Amazon SNS) topics require encryption using AWS Key Management Service (AWS KMS) Because sensitive data can exist at rest in published messages, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.WARN,
      rule: SNSEncryptedKMS,
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
      info: 'The VPCs default security group allows inbound or outbound traffic - (Control IDs: MUST 19.1.12.C.01[CID:3562], MUST 23.4.10.C.01[CID:7466])',
      explanation:
        'Amazon Elastic Compute Cloud (Amazon EC2) security groups can help in the management of network access by providing stateful filtering of ingress and egress network traffic to AWS resources. Restricting all the traffic on the default security group helps in restricting remote access to your AWS resources.',
      level: NagMessageLevel.ERROR,
      rule: VPCDefaultSecurityGroupClosed,
      node: node,
    });
    this.applyRule({
      info: 'The VPC does not have an associated Flow Log  - (Control IDs: MUST 19.1.12.C.01[CID:3562], MUST 23.4.10.C.01[CID:7466])',
      explanation:
        'The VPC flow logs provide detailed records for information about the IP traffic going to and from network interfaces in your Amazon Virtual Private Cloud (Amazon VPC). By default, the flow log record includes values for the different components of the IP flow, including the source, destination, and protocol.',
      level: NagMessageLevel.ERROR,
      rule: VPCFlowLogsEnabled,
      node: node,
    });
  }

  /**
   * Check WAF Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkWAF(node: CfnResource): void {
    this.applyRule({
      info: 'The WAFv2 web ACL does not have logging enabled  - (Control IDs: SHOULD 16.6.10.C.02[CID:2013], MUST 23.5.11.C.01[CID:7496])',
      explanation:
        'AWS WAF logging provides detailed information about the traffic that is analyzed by your web ACL. The logs record the time that AWS WAF received the request from your AWS resource, information about the request, and an action for the rule that each request matched.',
      level: NagMessageLevel.ERROR,
      rule: WAFv2LoggingEnabled,
      node: node,
    });
  }
}
