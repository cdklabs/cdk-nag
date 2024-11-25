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
} from '../rules/apigw';
import {
  AutoScalingGroupELBHealthCheckRequired,
  AutoScalingLaunchConfigPublicIpDisabled,
} from '../rules/autoscaling';
import {
  CloudTrailCloudWatchLogsEnabled,
  CloudTrailEncryptionEnabled,
  CloudTrailLogFileValidationEnabled,
} from '../rules/cloudtrail';
import {
  CloudWatchLogGroupEncrypted,
  CloudWatchLogGroupRetentionPeriod,
} from '../rules/cloudwatch';
import {
  CodeBuildProjectEnvVarAwsCred,
  CodeBuildProjectSourceRepoUrl,
} from '../rules/codebuild';
import { DMSReplicationNotPublic } from '../rules/dms';
import {
  EC2InstanceNoPublicIp,
  EC2InstanceProfileAttached,
  EC2InstancesInVPC,
  EC2RestrictedCommonPorts,
  EC2RestrictedSSH,
} from '../rules/ec2';
import { ECSTaskDefinitionUserForHostMode } from '../rules/ecs';
import { EFSEncrypted } from '../rules/efs';
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
  RDSAutomaticMinorVersionUpgradeEnabled,
  RDSInstancePublicAccess,
  RDSLoggingEnabled,
  RDSStorageEncrypted,
} from '../rules/rds';
import {
  RedshiftClusterConfiguration,
  RedshiftClusterMaintenanceSettings,
  RedshiftClusterPublicAccess,
  RedshiftEnhancedVPCRoutingEnabled,
  RedshiftRequireTlsSSL,
} from '../rules/redshift';
import {
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
import { SecretsManagerUsingKMSKey } from '../rules/secretsmanager';
import { SNSEncryptedKMS } from '../rules/sns';
import {
  VPCDefaultSecurityGroupClosed,
  VPCFlowLogsEnabled,
  VPCNoUnrestrictedRouteToIGW,
  VPCSubnetAutoAssignPublicIpDisabled,
} from '../rules/vpc';
import { WAFv2LoggingEnabled } from '../rules/waf';

/**
 * Check for PCI DSS 3.2.1 compliance.
 * Based on the PCI DSS 3.2.1 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-pci-dss.html
 */
export class PCIDSS321Checks extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'PCI.DSS.321';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      this.checkAPIGW(node);
      this.checkAutoScaling(node);
      this.checkCloudTrail(node);
      this.checkCloudWatch(node);
      this.checkCodeBuild(node);
      this.checkDMS(node);
      this.checkEC2(node);
      this.checkECS(node);
      this.checkEFS(node);
      this.checkELB(node);
      this.checkEMR(node);
      this.checkIAM(node);
      this.checkKMS(node);
      this.checkLambda(node);
      this.checkOpenSearch(node);
      this.checkRDS(node);
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
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkAPIGW(node: CfnResource): void {
    this.applyRule({
      info: 'The REST API stage is not associated with AWS WAFv2 web ACL - (Control ID: 6.6).',
      explanation:
        'AWS WAF enables you to configure a set of rules (called a web access control list (web ACL)) that allow, block, or count web requests based on customizable web security rules and conditions that you define. Ensure your Amazon API Gateway stage is associated with a WAF Web ACL to protect it from malicious attacks.',
      level: NagMessageLevel.ERROR,
      rule: APIGWAssociatedWithWAF,
      node: node,
    });
    this.applyRule({
      info: 'The API Gateway stage does not have caching enabled and encrypted for all methods - (Control ID: 3.4).',
      explanation:
        "To help protect data at rest, ensure encryption is enabled for your API Gateway stage's cache. Because sensitive data can be captured for the API method, enable encryption at rest to help protect that data.",
      level: NagMessageLevel.ERROR,
      rule: APIGWCacheEnabledAndEncrypted,
      node: node,
    });
    this.applyRule({
      info: 'The API Gateway stage does not have execution logging enabled for all methods - (Control IDs: 10.1, 10.3.1, 10.3.2, 10.3.3, 10.3.4, 10.3.5, 10.3.6, 10.5.4).',
      explanation:
        'API Gateway logging displays detailed views of users who accessed the API and the way they accessed the API. This insight enables visibility of user activities.',
      level: NagMessageLevel.ERROR,
      rule: APIGWExecutionLoggingEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The API Gateway REST API stage is not configured with SSL certificates - (Control IDs: 2.3, 4.1, 8.2.1).',
      explanation:
        'Ensure Amazon API Gateway REST API stages are configured with SSL certificates to allow backend systems to authenticate that requests originate from API Gateway.',
      level: NagMessageLevel.ERROR,
      rule: APIGWSSLEnabled,
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
      info: 'The Auto Scaling group (which is associated with a load balancer) does not utilize ELB health checks - (Control ID: 2.2).',
      explanation:
        'The Elastic Load Balancer (ELB) health checks for Amazon Elastic Compute Cloud (Amazon EC2) Auto Scaling groups support maintenance of adequate capacity and availability. The load balancer periodically sends pings, attempts connections, or sends requests to test Amazon EC2 instances health in an auto-scaling group. If an instance is not reporting back, traffic is sent to a new Amazon EC2 instance.',
      level: NagMessageLevel.ERROR,
      rule: AutoScalingGroupELBHealthCheckRequired,
      node: node,
    });
    this.applyRule({
      info: 'The Auto Scaling launch configuration does not have public IP addresses disabled - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2.2).',
      explanation:
        'If you configure your Network Interfaces with a public IP address, then the associated resources to those Network Interfaces are reachable from the internet. EC2 resources should not be publicly accessible, as this may allow unintended access to your applications or servers.',
      level: NagMessageLevel.ERROR,
      rule: AutoScalingLaunchConfigPublicIpDisabled,
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
      info: 'The trail does not have CloudWatch logs enabled - (Control IDs: 2.2, 10.1, 10.2.1, 10.2.2, 10.2.3, 10.2.5, 10.3.1, 10.3.2, 10.3.3, 10.3.4, 10.3.5, 10.3.6, 10.5.3, 10.5.4).',
      explanation:
        'Use Amazon CloudWatch to centrally collect and manage log event activity. Inclusion of AWS CloudTrail data provides details of API call activity within your AWS account.',
      level: NagMessageLevel.ERROR,
      rule: CloudTrailCloudWatchLogsEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The trail does not have encryption enabled - (Control IDs: 2.2, 3.4, 10.5).',
      explanation:
        'Because sensitive data may exist and to help protect data at rest, ensure encryption is enabled for your AWS CloudTrail trails.',
      level: NagMessageLevel.ERROR,
      rule: CloudTrailEncryptionEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The trail does not have log file validation enabled - (Control IDs: 2.2, 10.5.2, 10.5, 10.5.5, 11.5).',
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
      info: 'The CloudWatch Log Group is not encrypted with an AWS KMS key - (Control ID: 3.4).',
      explanation:
        'To help protect sensitive data at rest, ensure encryption is enabled for your Amazon CloudWatch Log Groups.',
      level: NagMessageLevel.ERROR,
      rule: CloudWatchLogGroupEncrypted,
      node: node,
    });
    this.applyRule({
      info: 'The CloudWatch Log Group does not have an explicit retention period configured - (Control IDs: 3.1, 10.7).',
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
   * @param ignores list of ignores for the resource
   */
  private checkCodeBuild(node: CfnResource): void {
    this.applyRule({
      info: 'The CodeBuild environment stores sensitive credentials (such as AWS_ACCESS_KEY_ID and/or AWS_SECRET_ACCESS_KEY) as plaintext environment variables - (Control ID: 8.2.1).',
      explanation:
        'Do not store these variables in clear text. Storing these variables in clear text leads to unintended data exposure and unauthorized access.',
      level: NagMessageLevel.ERROR,
      rule: CodeBuildProjectEnvVarAwsCred,
      node: node,
    });
    this.applyRule({
      info: 'The CodeBuild project which utilizes either a GitHub or BitBucket source repository does not utilize OAuth - (Control ID: 8.2.1).',
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
   * @param ignores list of ignores for the resource
   */
  private checkDMS(node: CfnResource) {
    this.applyRule({
      info: 'The DMS replication instance is public - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2.2).',
      explanation:
        'DMS replication instances can contain sensitive information and access control is required for such accounts.',
      level: NagMessageLevel.ERROR,
      rule: DMSReplicationNotPublic,
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
      info: 'The EC2 instance is associated with a public IP address - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2.2).',
      explanation:
        'Manage access to the AWS Cloud by ensuring Amazon Elastic Compute Cloud (Amazon EC2) instances cannot be publicly accessed. Amazon EC2 instances can contain sensitive information and access control is required for such accounts.',
      level: NagMessageLevel.ERROR,
      rule: EC2InstanceNoPublicIp,
      node: node,
    });
    this.applyRule({
      info: 'The EC2 instance does not have an instance profile attached - (Control IDs: 2.2, 7.1.1, 7.2.1).',
      explanation:
        'EC2 instance profiles pass an IAM role to an EC2 instance. Attaching an instance profile to your instances can assist with least privilege and permissions management.',
      level: NagMessageLevel.ERROR,
      rule: EC2InstanceProfileAttached,
      node: node,
    });
    this.applyRule({
      info: 'The EC2 instance is not within a VPC - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2.2).',
      explanation:
        'Deploy Amazon Elastic Compute Cloud (Amazon EC2) instances within an Amazon Virtual Private Cloud (Amazon VPC) to enable secure communication between an instance and other services within the amazon VPC, without requiring an internet gateway, NAT device, or VPN connection. All traffic remains securely within the AWS Cloud. Because of their logical isolation, domains that reside within anAmazon VPC have an extra layer of security when compared to domains that use public endpoints. Assign Amazon EC2 instances to an Amazon VPC to properly manage access.',
      level: NagMessageLevel.ERROR,
      rule: EC2InstancesInVPC,
      node: node,
    });
    this.applyRule({
      info: 'The EC2 instance allows unrestricted inbound IPv4 TCP traffic on one or more common ports (by default these ports include 20, 21, 3389, 3309, 3306, 4333) - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 2.2, 2.2.2).',
      explanation:
        'Not restricting access to ports to trusted sources can lead to attacks against the availability, integrity and confidentiality of systems. By default, common ports which should be restricted include port numbers 20, 21, 3389, 3306, and 4333.',
      level: NagMessageLevel.ERROR,
      rule: EC2RestrictedCommonPorts,
      node: node,
    });
    this.applyRule({
      info: 'The Security Group allows unrestricted SSH access - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 2.2, 2.2.2).',
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
   * @param ignores list of ignores for the resource
   */
  private checkECS(node: CfnResource): void {
    this.applyRule({
      info: "The ECS task definition is configured for host networking and has at least one container with definitions with 'privileged' set to false or empty or 'user' set to root or empty - (Control ID: 7.2.1).",
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
   * @param ignores list of ignores for the resource
   */
  private checkEFS(node: CfnResource) {
    this.applyRule({
      info: 'The EFS does not have encryption at rest enabled - (Control IDs: 3.4, 8.2.1).',
      explanation:
        'Because sensitive data can exist and to help protect data at rest, ensure encryption is enabled for your Amazon Elastic File System (EFS).',
      level: NagMessageLevel.ERROR,
      rule: EFSEncrypted,
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
      info: 'The ALB does not have invalid HTTP header dropping enabled - (Control IDs: 4.1, 8.2.1).',
      explanation:
        'Ensure that your Application Load Balancers (ALB) are configured to drop http headers. Because sensitive data can exist, enable encryption in transit to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: ALBHttpDropInvalidHeaderEnabled,
      node: node,
    });
    this.applyRule({
      info: "The ALB's HTTP listeners are not configured to redirect to HTTPS - (Control IDs: 2.3, 4.1, 8.2.1).",
      explanation:
        'To help protect data in transit, ensure that your Application Load Balancer automatically redirects unencrypted HTTP requests to HTTPS. Because sensitive data can exist, enable encryption in transit to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: ALBHttpToHttpsRedirection,
      node: node,
    });
    this.applyRule({
      info: 'The ALB is not associated with AWS WAFv2 web ACL - (Control ID: 6.6).',
      explanation:
        'A WAF helps to protect your web applications or APIs against common web exploits. These web exploits may affect availability, compromise security, or consume excessive resources within your environment.',
      level: NagMessageLevel.ERROR,
      rule: ALBWAFEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The CLB does not utilize an SSL certificate provided by ACM (Amazon Certificate Manager) - (Control IDs: 4.1, 8.2.1).',
      explanation:
        'Because sensitive data can exist and to help protect data at transit, ensure encryption is enabled for your Elastic Load Balancing. Use AWS Certificate Manager to manage, provision and deploy public and private SSL/TLS certificates with AWS services and internal resources.',
      level: NagMessageLevel.ERROR,
      rule: ELBACMCertificateRequired,
      node: node,
    });
    this.applyRule({
      info: 'The ELB does not have logging enabled - (Control IDs: 10.1, 10.3.1, 10.3.2, 10.3.3, 10.3.4, 10.3.5, 10.3.6, 10.5.4).',
      explanation:
        "Elastic Load Balancing activity is a central point of communication within an environment. Ensure ELB logging is enabled. The collected data provides detailed information about requests sent to The ELB. Each log contains information such as the time the request was received, the client's IP address, latencies, request paths, and server responses.",
      level: NagMessageLevel.ERROR,
      rule: ELBLoggingEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The CLB does not restrict its listeners to only the SSL and HTTPS protocols - (Control IDs: 2.3, 4.1, 8.2.1).',
      explanation:
        'Ensure that your Classic Load Balancers (CLBs) are configured with SSL or HTTPS listeners. Because sensitive data can exist, enable encryption in transit to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: ELBTlsHttpsListenersOnly,
      node: node,
    });
    this.applyRule({
      info: 'The ALB, NLB, or GLB listener does not utilize an SSL certificate provided by ACM (Amazon Certificate Manager) - (Control ID: 4.1).',
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
   * @param ignores list of ignores for the resource
   */
  private checkEMR(node: CfnResource) {
    this.applyRule({
      info: 'The ALB, NLB, or GLB listener does not utilize an SSL certificate provided by ACM (Amazon Certificate Manager) - (Control ID: 7.2.1).',
      explanation:
        'Because sensitive data can exist and to help protect data at transit, ensure encryption is enabled for your Elastic Load Balancing. Use AWS Certificate Manager to manage, provision and deploy public and private SSL/TLS certificates with AWS services and internal resources.',
      level: NagMessageLevel.ERROR,
      rule: EMRKerberosEnabled,
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
      info: 'The IAM Group does not have at least one IAM User - (Control IDs: 7.1.2, 7.1.3, 7.2.1, 7.2.2).',
      explanation:
        'AWS Identity and Access Management (IAM) can help you incorporate the principles of least privilege and separation of duties with access permissions and authorizations, by ensuring that IAM groups have at least one IAM user. Placing IAM users in groups based on their associated permissions or job function is one way to incorporate least privilege.',
      level: NagMessageLevel.ERROR,
      rule: IAMGroupHasUsers,
      node: node,
    });
    this.applyRule({
      info: 'The IAM Group, User, or Role contains an inline policy - (Control IDs: 2.2, 7.1.2, 7.1.3, 7.2.1, 7.2.2).',
      explanation:
        'AWS recommends to use managed policies instead of inline policies. The managed policies allow reusability, versioning and rolling back, and delegating permissions management.',
      level: NagMessageLevel.ERROR,
      rule: IAMNoInlinePolicy,
      node: node,
    });
    this.applyRule({
      info: 'The IAM policy grants admin access, meaning the policy allows a principal to perform all actions on all resources - (Control IDs: 2.2, 7.1.2, 7.1.3, 7.2.1, 7.2.2).',
      explanation:
        'AWS Identity and Access Management (IAM) can help you incorporate the principles of least privilege and separation of duties with access permissions and authorizations, by ensuring that IAM groups have at least one IAM user. Placing IAM users in groups based on their associated permissions or job function is one way to incorporate least privilege.',
      level: NagMessageLevel.ERROR,
      rule: IAMPolicyNoStatementsWithAdminAccess,
      node: node,
    });
    this.applyRule({
      info: 'The IAM policy grants full access, meaning the policy allows a principal to perform all actions on individual resources - (Control IDs: 7.1.2, 7.1.3, 7.2.1, 7.2.2).',
      explanation:
        'Ensure IAM Actions are restricted to only those actions that are needed. Allowing users to have more privileges than needed to complete a task may violate the principle of least privilege and separation of duties.',
      level: NagMessageLevel.ERROR,
      rule: IAMPolicyNoStatementsWithFullAccess,
      node: node,
    });
    this.applyRule({
      info: 'The IAM user does not belong to any group(s) - (Control IDs: 2.2, 7.1.2, 7.1.3, 7.2.1, 7.2.2).',
      explanation:
        'AWS Identity and Access Management (IAM) can help you restrict access permissions and authorizations by ensuring IAM users are members of at least one group. Allowing users more privileges than needed to complete a task may violate the principle of least privilege and separation of duties.',
      level: NagMessageLevel.ERROR,
      rule: IAMUserGroupMembership,
      node: node,
    });
    this.applyRule({
      info: 'The IAM policy is attached at the user level - (Control IDs: 2.2, 7.1.2, 7.1.3, 7.2.1, 7.2.2).',
      explanation:
        'Assigning privileges at the group or the role level helps to reduce opportunity for an identity to receive or retain excessive privileges.',
      level: NagMessageLevel.ERROR,
      rule: IAMUserNoPolicies,
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
      info: 'The KMS Symmetric key does not have automatic key rotation enabled - (Control IDs: 2.2, 3.5, 3.6, 3.6.4).',
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
   * @param ignores list of ignores for the resource
   */
  private checkLambda(node: CfnResource) {
    this.applyRule({
      info: 'The Lambda function permission grants public access - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 2.2.2).',
      explanation:
        'Public access allows anyone on the internet to perform unauthenticated actions on your function and can potentially lead to degraded availability.',
      level: NagMessageLevel.ERROR,
      rule: LambdaFunctionPublicAccessProhibited,
      node: node,
    });
    this.applyRule({
      info: 'The Lambda function is not VPC enabled - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 2.2.2).',
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
   * @param ignores list of ignores for the resource
   */
  private checkOpenSearch(node: CfnResource) {
    this.applyRule({
      info: 'The OpenSearch Service domain does not have encryption at rest enabled - (Control IDs: 3.4, 8.2.1).',
      explanation:
        'Because sensitive data can exist and to help protect data at rest, ensure encryption is enabled for your Amazon OpenSearch Service (OpenSearch Service) domains.',
      level: NagMessageLevel.ERROR,
      rule: OpenSearchEncryptedAtRest,
      node: node,
    });
    this.applyRule({
      info: 'The OpenSearch Service domain is not running within a VPC - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2.2).',
      explanation:
        'VPCs help secure your AWS resources and provide an extra layer of protection.',
      level: NagMessageLevel.ERROR,
      rule: OpenSearchInVPCOnly,
      node: node,
    });
    this.applyRule({
      info: 'The OpenSearch Service domain does not stream error logs (ES_APPLICATION_LOGS) to CloudWatch Logs - (Control IDs: 10.1, 10.2.1, 10.2.2, 10.2.3, 10.2.4, 10.2.5, 10.3.1, 10.3.2, 10.3.3, 10.3.4, 10.3.5, 10.3.6).',
      explanation:
        'Ensure Amazon OpenSearch Service domains have error logs enabled and streamed to Amazon CloudWatch Logs for retention and response. Domain error logs can assist with security and access audits, and can help to diagnose availability issues.',
      level: NagMessageLevel.ERROR,
      rule: OpenSearchErrorLogsToCloudWatch,
      node: node,
    });
    this.applyRule({
      info: 'The OpenSearch Service domain does not have node-to-node encryption enabled - (Control ID: 4.1).',
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
      info: "The route table may contain one or more unrestricted route(s) to an IGW ('0.0.0.0/0' or '::/0') - (Control ID: 6.2).",
      explanation:
        'Ensure Amazon EC2 route tables do not have unrestricted routes to an internet gateway. Removing or limiting the access to the internet for workloads within Amazon VPCs can reduce unintended access within your environment.',
      level: NagMessageLevel.ERROR,
      rule: RDSAutomaticMinorVersionUpgradeEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The RDS DB Instance allows public access - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2.2).',
      explanation:
        'Amazon RDS database instances can contain sensitive information, and principles and access control is required for such accounts.',
      level: NagMessageLevel.ERROR,
      rule: RDSInstancePublicAccess,
      node: node,
    });
    this.applyRule({
      info: 'The non-Aurora RDS DB instance or Aurora cluster does not have all CloudWatch log types exported - (Control IDs: 10.1, 10.2.1, 10.2.2, 10.2.3, 10.2.4, 10.2.5, 10.3.1, 10.3.2, 10.3.3, 10.3.4, 10.3.5, 10.3.6).',
      explanation:
        'To help with logging and monitoring within your environment, ensure Amazon Relational Database Service (Amazon RDS) logging is enabled. With Amazon RDS logging, you can capture events such as connections, disconnections, queries, or tables queried.' +
        "This is a granular rule that returns individual findings that can be suppressed with 'appliesTo'. The findings are in the format 'LogExport::<log>' for exported logs. Example: appliesTo: ['LogExport::audit'].",
      level: NagMessageLevel.ERROR,
      rule: RDSLoggingEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The RDS DB Instance or Aurora Cluster does not have storage encrypted - (Control IDs: 3.4, 8.2.1).',
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
   * @param ignores list of ignores for the resource
   */
  private checkRedshift(node: CfnResource): void {
    this.applyRule({
      info: 'The Redshift cluster does not have encryption or audit logging enabled - (Control IDs: 3.4, 8.2.1, 10.1, 10.2.1, 10.2.2, 10.2.3, 10.2.4, 10.2.5, 10.3.1, 10.3.2, 10.3.3, 10.3.4, 10.3.5, 10.3.6).',
      explanation:
        'To protect data at rest, ensure that encryption is enabled for your Amazon Redshift clusters. You must also ensure that required configurations are deployed on Amazon Redshift clusters. The audit logging should be enabled to provide information about connections and user activities in the database.',
      level: NagMessageLevel.ERROR,
      rule: RedshiftClusterConfiguration,
      node: node,
    });
    this.applyRule({
      info: 'The Redshift cluster does not have version upgrades enabled, automated snapshot retention periods enabled, and an explicit maintenance window configured - (Control ID: 6.2).',
      explanation:
        'Ensure that Amazon Redshift clusters have the preferred settings for your organization. Specifically, that they have preferred maintenance windows and automated snapshot retention periods for the database.                                                                                                                                                                                                                                                                                                                                                              ',
      level: NagMessageLevel.ERROR,
      rule: RedshiftClusterMaintenanceSettings,
      node: node,
    });
    this.applyRule({
      info: 'The Redshift cluster allows public access - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2.2).',
      explanation:
        'Amazon Redshift clusters can contain sensitive information and principles and access control is required for such accounts.',
      level: NagMessageLevel.ERROR,
      rule: RedshiftClusterPublicAccess,
      node: node,
    });
    this.applyRule({
      info: 'The Redshift cluster does not have enhanced VPC routing enabled - (Control IDs: 1.2, 1.3, 1.3.1, 1.3.2).',
      explanation:
        'Enhanced VPC routing forces all COPY and UNLOAD traffic between the cluster and data repositories to go through your Amazon VPC. You can then use VPC features such as security groups and network access control lists to secure network traffic. You can also use VPC flow logs to monitor network traffic.',
      level: NagMessageLevel.ERROR,
      rule: RedshiftEnhancedVPCRoutingEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The Redshift cluster does not require TLS/SSL encryption - (Control IDs: 2.3, 4.1).',
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
      info: 'The S3 bucket does not prohibit public access through bucket level settings - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2.2).',
      explanation:
        'Keep sensitive data safe from unauthorized remote users by preventing public access at the bucket level.',
      level: NagMessageLevel.ERROR,
      rule: S3BucketLevelPublicAccessProhibited,
      node: node,
    });
    this.applyRule({
      info: 'The S3 Buckets does not have server access logs enabled - (Control IDs: 2.2, 10.1, 10.2.1, 10.2.2, 10.2.3, 10.2.4, 10.2.5, 10.2.7, 10.3.1, 10.3.2, 10.3.3, 10.3.4, 10.3.5, 10.3.6).',
      explanation:
        'Amazon Simple Storage Service (Amazon S3) server access logging provides a method to monitor the network for potential cybersecurity events. The events are monitored by capturing detailed records for the requests that are made to an Amazon S3 bucket. Each access log record provides details about a single access request. The details include the requester, bucket name, request time, request action, response status, and an error code, if relevant.',
      level: NagMessageLevel.ERROR,
      rule: S3BucketLoggingEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The S3 Bucket does not prohibit public read access through its Block Public Access configurations and bucket ACLs - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2, 2.2.2).',
      explanation:
        'The management of access should be consistent with the classification of the data.',
      level: NagMessageLevel.ERROR,
      rule: S3BucketPublicReadProhibited,
      node: node,
    });
    this.applyRule({
      info: 'The S3 Bucket does not prohibit public write access through its Block Public Access configurations and bucket ACLs - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2, 2.2.2).',
      explanation:
        'The management of access should be consistent with the classification of the data.',
      level: NagMessageLevel.ERROR,
      rule: S3BucketPublicWriteProhibited,
      node: node,
    });
    this.applyRule({
      info: 'The S3 Bucket does not have replication enabled - (Control IDs: 2.2, 10.5.3).',
      explanation:
        'Amazon Simple Storage Service (Amazon S3) Cross-Region Replication (CRR) supports maintaining adequate capacity and availability. CRR enables automatic, asynchronous copying of objects across Amazon S3 buckets to help ensure that data availability is maintained.',
      level: NagMessageLevel.ERROR,
      rule: S3BucketReplicationEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The S3 Bucket or bucket policy does not require requests to use SSL - (Control IDs: 2.2, 4.1, 8.2.1).',
      explanation:
        'To help protect data in transit, ensure that your Amazon Simple Storage Service (Amazon S3) buckets require requests to use Secure Socket Layer (SSL). Because sensitive data can exist, enable encryption in transit to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: S3BucketSSLRequestsOnly,
      node: node,
    });
    this.applyRule({
      info: 'The S3 Bucket does not have versioning enabled - (Control ID: 10.5.3).',
      explanation:
        'Use versioning to preserve, retrieve, and restore every version of every object stored in your Amazon S3 bucket. Versioning helps you to easily recover from unintended user actions and application failures.',
      level: NagMessageLevel.ERROR,
      rule: S3BucketVersioningEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The S3 Bucket is not encrypted with a KMS Key by default - (Control IDs: 3.4, 8.2.1, 10.5).',
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
   * @param ignores list of ignores for the resource
   */
  private checkSageMaker(node: CfnResource) {
    this.applyRule({
      info: 'The SageMaker resource endpoint is not encrypted with a KMS key - (Control IDs: 3.4, 8.2.1).',
      explanation:
        'Because sensitive data can exist at rest in SageMaker endpoint, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerEndpointConfigurationKMSKeyConfigured,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker notebook is not encrypted with a KMS key - (Control IDs: 3.4, 8.2.1).',
      explanation:
        'Because sensitive data can exist at rest in SageMaker notebook, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerNotebookInstanceKMSKeyConfigured,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker notebook does not disable direct internet access - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2.2).',
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
      info: 'The secret is not encrypted with a KMS Customer managed key - (Control IDs: 3.4, 8.2.1).',
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
   * @param ignores list of ignores for the resource
   */
  private checkSNS(node: CfnResource): void {
    this.applyRule({
      info: 'The SNS topic does not have KMS encryption enabled - (Control ID: 8.2.1).',
      explanation:
        'To help protect data at rest, ensure that your Amazon Simple Notification Service (Amazon SNS) topics require encryption using AWS Key Management Service (AWS KMS) Because sensitive data can exist at rest in published messages, enable encryption at rest to help protect that data.',
      level: NagMessageLevel.ERROR,
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
      info: "The VPC's default security group allows inbound or outbound traffic - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 2.1, 2.2, 2.2.2).",
      explanation:
        'Amazon Elastic Compute Cloud (Amazon EC2) security groups can help in the management of network access by providing stateful filtering of ingress and egress network traffic to AWS resources. Restricting all the traffic on the default security group helps in restricting remote access to your AWS resources.',
      level: NagMessageLevel.WARN,
      rule: VPCDefaultSecurityGroupClosed,
      node: node,
    });
    this.applyRule({
      info: 'The VPC does not have an associated Flow Log - (Control IDs: 2.2, 10.1, 10.3.2, 10.3.3, 10.3.4, 10.3.5, 10.3.6).',
      explanation:
        'The VPC flow logs provide detailed records for information about the IP traffic going to and from network interfaces in your Amazon Virtual Private Cloud (Amazon VPC). By default, the flow log record includes values for the different components of the IP flow, including the source, destination, and protocol.',
      level: NagMessageLevel.ERROR,
      rule: VPCFlowLogsEnabled,
      node: node,
    });
    this.applyRule({
      info: "The route table may contain one or more unrestricted route(s) to an IGW ('0.0.0.0/0' or '::/0') - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 2.2.2).",
      explanation:
        'Ensure Amazon EC2 route tables do not have unrestricted routes to an internet gateway. Removing or limiting the access to the internet for workloads within Amazon VPCs can reduce unintended access within your environment.',
      level: NagMessageLevel.ERROR,
      rule: VPCNoUnrestrictedRouteToIGW,
      node: node,
    });
    this.applyRule({
      info: 'The subnet auto-assigns public IP addresses - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2.2).',
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
   * @param ignores list of ignores for the resource
   */
  private checkWAF(node: CfnResource): void {
    this.applyRule({
      info: 'The WAFv2 web ACL does not have logging enabled - (Control IDs: 10.1, 10.3.1, 10.3.2, 10.3.3, 10.3.4, 10.3.5, 10.3.6, 10.5.4).',
      explanation:
        'AWS WAF logging provides detailed information about the traffic that is analyzed by your web ACL. The logs record the time that AWS WAF received the request from your AWS resource, information about the request, and an action for the rule that each request matched.',
      level: NagMessageLevel.ERROR,
      rule: WAFv2LoggingEnabled,
      node: node,
    });
  }
}
