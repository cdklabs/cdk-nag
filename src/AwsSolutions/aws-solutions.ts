/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { Annotations, CfnResource, IConstruct } from '@aws-cdk/core';
import { NagPack } from '../common';
import {
  awsSolutionsAth1,
  awsSolutionsEmr2,
  awsSolutionsEmr6,
  awsSolutionsEsh1,
  awsSolutionsEsh2,
  awsSolutionsEsh3,
  awsSolutionsEsh4,
  awsSolutionsEsh5,
  awsSolutionsEsh7,
  awsSolutionsEsh8,
  awsSolutionsEsh9,
  awsSolutionsKda3,
  awsSolutionsKds1,
  awsSolutionsKdf1,
  awsSolutionsMsk2,
  awsSolutionsMsk6,
  awsSolutionsMsk3,
  awsSolutionsQs1,
} from './rules/analytics';
import {
  awsSolutionsSns2,
  awsSolutionsSqs2,
  awsSolutionsSqs3,
} from './rules/application_integration';
import {
  awsSolutionsEc23,
  awsSolutionsEc26,
  awsSolutionsEc27,
  awsSolutionsEc28,
  awsSolutionsEc29,
  awsSolutionsEcr1,
  awsSolutionsEcs4,
  awsSolutionsEcs7,
  awsSolutionsElb1,
  awsSolutionsElb2a,
  awsSolutionsElb2e,
  awsSolutionsElb3,
  awsSolutionsElb4,
  awsSolutionsElb5,
} from './rules/compute/index';
import {
  awsSolutionsAec1,
  awsSolutionsAec3,
  awsSolutionsAec4,
  awsSolutionsAec5,
  awsSolutionsAec6,
  awsSolutionsDdb3,
  awsSolutionsDdb4,
  awsSolutionsDoc1,
  awsSolutionsDoc2,
  awsSolutionsDoc3,
  awsSolutionsDoc4,
  awsSolutionsDoc5,
  awsSolutionsN1,
  awsSolutionsN2,
  awsSolutionsN3,
  awsSolutionsN4,
  awsSolutionsN5,
  awsSolutionsRds10,
  awsSolutionsRds11,
  awsSolutionsRds13,
  awsSolutionsRds14,
  awsSolutionsRds16,
  awsSolutionsRds2,
  awsSolutionsRds6,
  awsSolutionsRs1,
  awsSolutionsRs10,
  awsSolutionsRs2,
  awsSolutionsRs3,
  awsSolutionsRs4,
  awsSolutionsRs5,
  awsSolutionsRs6,
  awsSolutionsRs8,
  awsSolutionsRs9,
} from './rules/databases/index';
import {
  awsSolutionsC91,
  awsSolutionsCb3,
  awsSolutionsCb4,
  awsSolutionsCb5,
} from './rules/developer_tools';
import {
  awsSolutionsSm1,
  awsSolutionsSm2,
  awsSolutionsSm3,
} from './rules/machine_learning/index';
import {
  awsSolutionsAs1,
  awsSolutionsAs2,
  awsSolutionsAs3,
} from './rules/management_and_governance';
import {
  awsSolutionsMs1,
  awsSolutionsMs10,
  awsSolutionsMs4,
  awsSolutionsMs7,
  awsSolutionsMs8,
} from './rules/media_services';
import {
  awsSolutionsApig1,
  awsSolutionsApig4,
  awsSolutionsApig6,
  awsSolutionsCfr1,
  awsSolutionsCfr2,
  awsSolutionsCfr3,
  awsSolutionsCfr5,
  awsSolutionsCfr6,
  awsSolutionsVpc3,
} from './rules/network_and_delivery/index';
import {
  awsSolutionsCog1,
  awsSolutionsCog2,
  awsSolutionsCog3,
  awsSolutionsCog7,
  awsSolutionsIam4,
  awsSolutionsIam5,
  awsSolutionsKms5,
} from './rules/security_and_compliance';
import { awsSolutionsSf1, awsSolutionsSf2 } from './rules/serverless';
import {
  awsSolutionsEfs1,
  awsSolutionsS1,
  awsSolutionsS2,
  awsSolutionsS3,
} from './rules/storage/index';

/**
 * Check Best practices based on AWS Solutions Security Matrix
 *
 */
export class AwsSolutionsChecks extends NagPack {
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      // Get ignores metadata if it exists
      const ignores = node.getMetadata('cdk_nag')?.rules_to_suppress;
      this.checkCompute(node, ignores);
      this.checkStorage(node, ignores);
      this.checkDatabases(node, ignores);
      this.checkNetworkDelivery(node, ignores);
      this.checkManagementGovernance(node, ignores);
      this.checkMachineLearning(node, ignores);
      this.checkAnalytics(node, ignores);
      this.checkSecurityCompliance(node, ignores);
      this.checkServerless(node, ignores);
      this.checkApplicationIntegration(node, ignores);
      this.checkMediaServices(node, ignores);
      this.checkDeveloperTools(node, ignores);
    }
  }

  /**
   * Check Compute Services
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkCompute(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-EC23') &&
      !awsSolutionsEc23(node)
    ) {
      const ruleId = 'AwsSolutions-EC23';
      const info =
        'The Security Group allows for 0.0.0.0/0 or ::/0 inbound access.';
      const explanation =
        'Large port ranges, when open, expose instances to unwanted attacks. More than that, they make traceability of vulnerabilities very difficult. For instance, your web servers may only require 80 and 443 ports to be open, but not all. One of the most common mistakes observed is when  all ports for 0.0.0.0/0 range are open in a rush to access the instance. EC2 instances must expose only to those ports enabled on the corresponding security group level.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-EC26') &&
      !awsSolutionsEc26(node)
    ) {
      const ruleId = 'AwsSolutions-EC26';
      const info = 'The EBS volume has encryption disabled.';
      const explanation =
        "With EBS encryption, you aren't required to build, maintain, and secure your own key management infrastructure. EBS encryption uses KMS keys when creating encrypted volumes and snapshots. This helps protect data at rest.";
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-EC27') &&
      !awsSolutionsEc27(node)
    ) {
      const ruleId = 'AwsSolutions-EC27';
      const info = 'The Security Group does not have a description.';
      const explanation =
        'Descriptions help simplify operations and remove any opportunities for operator errors.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-EC28') &&
      !awsSolutionsEc28(node)
    ) {
      const ruleId = 'AwsSolutions-EC28';
      const info =
        'The EC2 instance/AutoScaling launch configuration does not have detailed monitoring enabled.';
      const explanation =
        'Monitoring data helps make better decisions on architecting and managing compute resources.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-EC29') &&
      !awsSolutionsEc29(node)
    ) {
      const ruleId = 'AwsSolutions-EC29';
      const info =
        'The EC2 instance is not part of an ASG and has Termination Protection disabled.';
      const explanation =
        'Termination Protection safety feature enabled in order to protect the instances from being accidentally terminated.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-ECR1') &&
      !awsSolutionsEcr1(node)
    ) {
      const ruleId = 'AwsSolutions-ECR1';
      const info = 'The ECR Repository allows open access.';
      const explanation =
        'Removing * principals in an ECR Repository helps protect against unauthorized access.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-ECS4') &&
      !awsSolutionsEcs4(node)
    ) {
      const ruleId = 'AwsSolutions-ECS4';
      const info =
        'The ECS Cluster has CloudWatch Container Insights disabled.';
      const explanation =
        'CloudWatch Container Insights allow operators to gain a better perspective on how the cluster’s applications and microservices are performing.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-ECS7') &&
      !awsSolutionsEcs7(node)
    ) {
      const ruleId = 'AwsSolutions-ECS7';
      const info =
        'The ECS Task Definition does not have awslogs logging enabled at the minimum.';
      const explanation =
        'Container logging allows operators to view and aggregate the logs from the container.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-ELB1') &&
      !awsSolutionsElb1(node)
    ) {
      const ruleId = 'AwsSolutions-ELB1';
      const info =
        'The CLB is used for incoming HTTP/HTTPS traffic. Use ALBs instead.';
      const explanation =
        'HTTP/HTTPS applications (monolithic or containerized) should use the ALB instead of The CLB for enhanced incoming traffic distribution, better performance and lower costs.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-ELB2a') &&
      !awsSolutionsElb2a(node)
    ) {
      const ruleId = 'AwsSolutions-ELB2a';
      const info = 'The ALB does not have access logs enabled.';
      const explanation =
        'Access logs allow operators to to analyze traffic patterns and identify and troubleshoot security issues.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-ELB2e') &&
      !awsSolutionsElb2e(node)
    ) {
      const ruleId = 'AwsSolutions-ELB2e';
      const info = 'The CLB does not have access logs enabled.';
      const explanation =
        'Access logs allow operators to to analyze traffic patterns and identify and troubleshoot security issues.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-ELB3') &&
      !awsSolutionsElb3(node)
    ) {
      const ruleId = 'AwsSolutions-ELB3';
      const info = 'The CLB does not have connection draining enabled.';
      const explanation =
        'With Connection Draining feature enabled, if an EC2 backend instance fails health checks The CLB will not send any new requests to the unhealthy instance. However, it will still allow existing (in-flight) requests to complete for the duration of the configured timeout.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-ELB4') &&
      !awsSolutionsElb4(node)
    ) {
      const ruleId = 'AwsSolutions-ELB4';
      const info =
        'The CLB does not use at least two AZs with the Cross-Zone Load Balancing feature enabled.';
      const explanation =
        'CLBs can distribute the traffic evenly across all backend instances. To use Cross-Zone Load Balancing at optimal level, the system should maintain an equal EC2 capacity distribution in each of the AZs registered with the load balancer.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-ELB5') &&
      !awsSolutionsElb5(node)
    ) {
      const ruleId = 'AwsSolutions-ELB5';
      const info =
        'The CLB listener is not configured for secure (HTTPs or SSL) protocols for client communication.';
      const explanation =
        'The HTTPs or SSL protocols enable secure communication by encrypting the communication between the client and the load balancer.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check Storage Services
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkStorage(node: CfnResource, ignores: any): void {
    if (!this.ignoreRule(ignores, 'AwsSolutions-S1') && !awsSolutionsS1(node)) {
      const ruleId = 'AwsSolutions-S1';
      const info = 'The S3 Bucket has server access logs disabled.';
      const explanation =
        'The bucket should have server access logging enabled to provide detailed records for the requests that are made to the bucket.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (!this.ignoreRule(ignores, 'AwsSolutions-S2') && !awsSolutionsS2(node)) {
      const ruleId = 'AwsSolutions-S2';
      const info =
        'The S3 Bucket does not have public access restricted and blocked.';
      const explanation =
        'The bucket should have public access restricted and blocked to prevent unauthorized access.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (!this.ignoreRule(ignores, 'AwsSolutions-S3') && !awsSolutionsS3(node)) {
      const ruleId = 'AwsSolutions-S3';
      const info = 'The S3 Bucket does not default encryption enabled.';
      const explanation =
        'The bucket should minimally have SSE enabled to help protect data-at-rest.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-EFS1') &&
      !awsSolutionsEfs1(node)
    ) {
      const ruleId = 'AwsSolutions-EFS1';
      const info = 'The EFS is not configured for encryption at rest.';
      const explanation =
        'By using an encrypted file system, data and metadata are automatically encrypted before being written to the file system. Similarly, as data and metadata are read, they are automatically decrypted before being presented to the application. These processes are handled transparently by EFS without requiring modification of applications.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check Database Services
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkDatabases(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-RDS2') &&
      !awsSolutionsRds2(node)
    ) {
      const ruleId = 'AwsSolutions-RDS2';
      const info =
        'The RDS instance or Aurora cluster does not have storage encryption enabled.';
      const explanation =
        'Storage encryption helps protect data-at-rest by encrypting the underlying storage, automated backups, read replicas, and snapshots for the database.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-RDS6') &&
      !awsSolutionsRds6(node)
    ) {
      const ruleId = 'AwsSolutions-RDS6';
      const info =
        'The RDS Aurora MySQL/PostgresSQL cluster does not have IAM Database Authentication enabled.';
      const explanation =
        "With IAM Database Authentication enabled, the system doesn't have to use a password when connecting to the MySQL/PostgreSQL database instances, instead it uses an authentication token.";
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-RDS10') &&
      !awsSolutionsRds10(node)
    ) {
      const ruleId = 'AwsSolutions-RDS10';
      const info =
        'The RDS instance or Aurora cluster does not have deletion protection enabled.';
      const explanation =
        'The deletion protection feature helps protect the database from being accidentally deleted.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-RDS11') &&
      !awsSolutionsRds11(node)
    ) {
      const ruleId = 'AwsSolutions-RDS11';
      const info =
        'The RDS instance or Aurora cluster uses the default endpoint port.';
      const explanation =
        'Port obfuscation (using a non default endpoint port) adds an additional layer of defense against non-targeted attacks (i.e. MySQL/Aurora port 3306, SQL Server port 1433, PostgreSQL port 5432, etc).';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-RDS13') &&
      !awsSolutionsRds13(node)
    ) {
      const ruleId = 'AwsSolutions-RDS13';
      const info = 'The RDS instance is not configured for automated backups.';
      const explanation = 'Automated backups allow for point-in-time recovery.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-RDS14') &&
      !awsSolutionsRds14(node)
    ) {
      const ruleId = 'AwsSolutions-RDS14';
      const info =
        'The RDS Aurora MySQL cluster does not have Backtrack enabled.';
      const explanation =
        'Backtrack helps order to rewind cluster tables to a specific time, without using backups.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-RDS16') &&
      !awsSolutionsRds16(node)
    ) {
      const ruleId = 'AwsSolutions-RDS16';
      const info =
        'The RDS Aurora MySQL serverless cluster does not have audit, error, general, and slowquery Log Exports enabled.';
      const explanation =
        'This allows operators to use CloudWatch to view logs to help diagnose problems in the database.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-DDB3') &&
      !awsSolutionsDdb3(node)
    ) {
      const ruleId = 'AwsSolutions-DDB3';
      const info =
        'The DynamoDB table does not have Point-in-time Recovery enabled.';
      const explanation =
        'DynamoDB continuous backups represent an additional layer of insurance against accidental loss of data on top of on-demand backups. The DynamoDB service can back up the data with per-second granularity and restore it to any single second from the time PITR was enabled up to the prior 35 days.';
      Annotations.of(node).addWarning(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-DDB4') &&
      !awsSolutionsDdb4(node)
    ) {
      const ruleId = 'AwsSolutions-DDB4';
      const info =
        'The DAX cluster does not have server-side encryption enabled.';
      const explanation =
        'Data in cache, configuration data and log files should be encrypted using Server-Side Encryption in order to protect from unauthorized access to the underlying storage.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-AEC1') &&
      !awsSolutionsAec1(node)
    ) {
      const ruleId = 'AwsSolutions-AEC1';
      const info = 'The ElastiCache cluster is not provisioned in a VPC.';
      const explanation =
        'Provisioning the cluster within a VPC allows for better flexibility and control over the cache clusters security, availability, traffic routing and more.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-AEC3') &&
      !awsSolutionsAec3(node)
    ) {
      const ruleId = 'AwsSolutions-AEC3';
      const info =
        'The ElastiCache Redis cluster does not have both encryption in transit and at rest enabled.';
      const explanation =
        'Encryption in transit helps secure communications to the cluster. Encryption at rest helps protect data at rest from unauthorized access.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-AEC4') &&
      !awsSolutionsAec4(node)
    ) {
      const ruleId = 'AwsSolutions-AEC4';
      const info =
        'The ElastiCache Redis cluster is not deployed in a Multi-AZ configuration.';
      const explanation =
        'The cluster should use a Multi-AZ deployment configuration for high availability.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-AEC5') &&
      !awsSolutionsAec5(node)
    ) {
      const ruleId = 'AwsSolutions-AEC5';
      const info = 'The ElastiCache cluster uses the default endpoint port.';
      const explanation =
        'Port obfuscation (using a non default endpoint port) adds an additional layer of defense against non-targeted attacks (i.e. Redis port 6379 and Memcached port 11211).';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-AEC6') &&
      !awsSolutionsAec6(node)
    ) {
      const ruleId = 'AwsSolutions-AEC6';
      const info =
        'The ElastiCache Redis cluster does not use Redis AUTH for user authentication.';
      const explanation =
        'Redis authentication tokens enable Redis to require a token (password) before allowing clients to execute commands, thereby improving data security.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (!this.ignoreRule(ignores, 'AwsSolutions-N1') && !awsSolutionsN1(node)) {
      const ruleId = 'AwsSolutions-N1';
      const info =
        'The Neptune DB cluster is not deployed in a Multi-AZ configuration.';
      const explanation =
        'The cluster should use a Multi-AZ deployment configuration for high availability.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (!this.ignoreRule(ignores, 'AwsSolutions-N2') && !awsSolutionsN2(node)) {
      const ruleId = 'AwsSolutions-N2';
      const info =
        'The Neptune DB instance does have Auto Minor Version Upgrade enabled.';
      const explanation =
        'The Neptune service regularly releases engine updates. Enabling Auto Minor Version Upgrade will allow the service to automatically apply these upgrades to DB Instances.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (!this.ignoreRule(ignores, 'AwsSolutions-N3') && !awsSolutionsN3(node)) {
      const ruleId = 'AwsSolutions-N3';
      const info =
        'The Neptune DB cluster does not have a reasonable minimum backup retention period configured.';
      const explanation =
        'The retention period represents the number of days to retain automated snapshots. A minimum retention period of 7 days is recommended but can be adjust to meet system requirements.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (!this.ignoreRule(ignores, 'AwsSolutions-N4') && !awsSolutionsN4(node)) {
      const ruleId = 'AwsSolutions-N4';
      const info =
        'The Neptune DB cluster does not have encryption at rest enabled.';
      const explanation =
        'Encrypting data-at-rest protects data confidentiality and prevents unauthorized users from accessing sensitive information.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (!this.ignoreRule(ignores, 'AwsSolutions-N5') && !awsSolutionsN5(node)) {
      const ruleId = 'AwsSolutions-N5';
      const info =
        'The Neptune DB cluster does not have IAM Database Authentication enabled.';
      const explanation =
        "With IAM Database Authentication enabled, the system doesn't have to use a password when connecting to the cluster.";
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-RS1') &&
      !awsSolutionsRs1(node)
    ) {
      const ruleId = 'AwsSolutions-RS1';
      const info =
        'The Redshift cluster parameter group must have the "require_ssl" parameter enabled.';
      const explanation =
        'Enabling the "require_ssl" parameter secures data-in-transit by encrypting the connection between the clients and the Redshift clusters.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-RS2') &&
      !awsSolutionsRs2(node)
    ) {
      const ruleId = 'AwsSolutions-RS2';
      const info = 'The Redshift cluster is not provisioned in a VPC.';
      const explanation =
        'Provisioning the cluster within a VPC allows for better flexibility and control over the Redshift clusters security, availability, traffic routing and more.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-RS3') &&
      !awsSolutionsRs3(node)
    ) {
      const ruleId = 'AwsSolutions-RS3';
      const info = 'The Redshift cluster uses the default "awsuser" username.';
      const explanation =
        'Using a custom master user name instead of the default master user name (i.e. "awsuser") provides an additional layer of defense against non-targeted attacks.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-RS4') &&
      !awsSolutionsRs4(node)
    ) {
      const ruleId = 'AwsSolutions-RS4';
      const info = 'The Redshift cluster uses the default endpoint port.';
      const explanation =
        'Port obfuscation (using a non default endpoint port) adds an additional layer of defense against non-targeted attacks (i.e. Redshift port 5439).';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-RS5') &&
      !awsSolutionsRs5(node)
    ) {
      const ruleId = 'AwsSolutions-RS5';
      const info = 'The Redshift cluster does not have audit logging enabled.';
      const explanation =
        'Audit logging helps operators troubleshoot issues and ensure security.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-RS6') &&
      !awsSolutionsRs6(node)
    ) {
      const ruleId = 'AwsSolutions-RS6';
      const info =
        'The Redshift cluster does not have encryption at rest enabled.';
      const explanation =
        'Encrypting data-at-rest protects data confidentiality.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-RS8') &&
      !awsSolutionsRs8(node)
    ) {
      const ruleId = 'AwsSolutions-RS8';
      const info = 'The Redshift cluster is publicly accessible.';
      const explanation =
        'Disabling public accessibility helps minimize security risks.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-RS9') &&
      !awsSolutionsRs9(node)
    ) {
      const ruleId = 'AwsSolutions-RS9';
      const info =
        'The Redshift cluster does not have version upgrade enabled.';
      const explanation =
        'Version Upgrade must enabled to enable the cluster to automatically receive upgrades during the maintenance window.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-RS10') &&
      !awsSolutionsRs10(node)
    ) {
      const ruleId = 'AwsSolutions-RS10';
      const info =
        'The Redshift cluster does not have a retention period for automated snapshots configured.';
      const explanation =
        'The retention period represents the number of days to retain automated snapshots. A positive retention period should be set to configure this feature.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-DOC1') &&
      !awsSolutionsDoc1(node)
    ) {
      const ruleId = 'AwsSolutions-DOC1';
      const info =
        'The Document DB cluster does not have encryption at rest enabled.';
      const explanation =
        'Encrypting data-at-rest protects data confidentiality and prevents unauthorized users from accessing sensitive information.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-DOC2') &&
      !awsSolutionsDoc2(node)
    ) {
      const ruleId = 'AwsSolutions-DOC2';
      const info = 'The Document DB cluster uses the default endpoint port.';
      const explanation =
        'Port obfuscation (using a non default endpoint port) adds an additional layer of defense against non-targeted attacks (i.e. MongoDB port 27017).';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-DOC3') &&
      !awsSolutionsDoc3(node)
    ) {
      const ruleId = 'AwsSolutions-DOC3';
      const info =
        'The Document DB cluster does not have the username and password stored in Secrets Manager.';
      const explanation =
        "Secrets Manager enables operators to replace hardcoded credentials in your code, including passwords, with an API call to Secrets Manager to retrieve the secret programmatically. This helps ensure the secret can't be compromised by someone examining system code, because the secret no longer exists in the code. Also, operators can configure Secrets Manager to automatically rotate the secret for you according to a specified schedule. This enables you to replace long-term secrets with short-term ones, significantly reducing the risk of compromise.";
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-DOC4') &&
      !awsSolutionsDoc4(node)
    ) {
      const ruleId = 'AwsSolutions-DOC4';
      const info =
        'The Document DB cluster does not have a reasonable minimum backup retention period configured.';
      const explanation =
        'The retention period represents the number of days to retain automated snapshots. A minimum retention period of 7 days is recommended but can be adjust to meet system requirements.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-DOC5') &&
      !awsSolutionsDoc5(node)
    ) {
      const ruleId = 'AwsSolutions-DOC5';
      const info =
        'The Document DB cluster does not have authenticate, createIndex, and dropCollection Log Exports enabled.';
      const explanation =
        'This allows operators to use CloudWatch to view logs to help diagnose problems in the database. The events recorded by the AWS DocumentDB audit logs include successful and failed authentication attempts, creating indexes or dropping a collection in a database within the DocumentDB cluster.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check Network and Delivery Services
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkNetworkDelivery(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-VPC3') &&
      !awsSolutionsVpc3(node)
    ) {
      const ruleId = 'AwsSolutions-VPC3';
      const info = 'A Network ACL or Network ACL entry has been implemented.';
      const explanation =
        'Network ACLs should be used sparingly for the following reasons: they can be complex to manage, they are stateless, every IP address must be explicitly opened in each (inbound/outbound) direction, and they affect a complete subnet. Use security groups when possible as they are stateful and easier to manage.';
      Annotations.of(node).addWarning(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-CFR1') &&
      !awsSolutionsCfr1(node)
    ) {
      const ruleId = 'AwsSolutions-CFR1';
      const info = 'The CloudFront distribution may require Geo restrictions.';
      const explanation =
        'Geo restriction may need to be enabled for the distribution in order to allow or deny a country in order to allow or restrict users in specific locations from accessing content.';
      Annotations.of(node).addWarning(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-CFR2') &&
      !awsSolutionsCfr2(node)
    ) {
      const ruleId = 'AwsSolutions-CFR2';
      const info =
        'The CloudFront distribution may require integration with AWS WAF.';
      const explanation =
        'The Web Application Firewall can help protect against application-layer attacks that can compromise the security of the system or place unnecessary load on them.';
      Annotations.of(node).addWarning(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-CFR3') &&
      !awsSolutionsCfr3(node)
    ) {
      const ruleId = 'AwsSolutions-CFR3';
      const info =
        'The CloudFront distributions does not have access logging enabled.';
      const explanation =
        'Enabling access logs helps operators track all viewer requests for the content delivered through the Content Delivery Network.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-CFR5') &&
      !awsSolutionsCfr5(node)
    ) {
      const ruleId = 'AwsSolutions-CFR5';
      const info =
        'The CloudFront distributions uses SSLv3 or TLSv1 for communication to the origin.';
      const explanation =
        'Vulnerabilities have been and continue to be discovered in the deprecated SSL and TLS protocols. Using a security policy with minimum TLSv1.1 or TLSv1.2 and appropriate security ciphers for HTTPS helps protect viewer connections.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-CFR6') &&
      !awsSolutionsCfr6(node)
    ) {
      const ruleId = 'AwsSolutions-CFR6';
      const info =
        'The CloudFront distribution does not use an origin access identity an S3 origin.';
      const explanation =
        'Origin access identities help with security by restricting any direct access to objects through S3 URLs.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-APIG1') &&
      !awsSolutionsApig1(node)
    ) {
      const ruleId = 'AwsSolutions-APIG1';
      const info = 'The API does not have access logging enabled.';
      const explanation =
        'Enabling access logs helps operators view who accessed an API and how the caller accessed the API.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-APIG4') &&
      !awsSolutionsApig4(node)
    ) {
      const ruleId = 'AwsSolutions-APIG4';
      const info = 'The API does not implement authorization.';
      const explanation =
        'In most cases an API needs to have an authentication and authorization implementation strategy. This includes using such approaches as IAM, Cognito User Pools, Custom authorizer, etc.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-APIG6') &&
      !awsSolutionsApig6(node)
    ) {
      const ruleId = 'AwsSolutions-APIG6';
      const info =
        'The REST API Stage does not have CloudWatch logging enabled for all methods.';
      const explanation =
        'Enabling CloudWatch logs at the stage level helps operators to track and analyze execution behavior at the API stage level.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check Management and Governance Services
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkManagementGovernance(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-AS1') &&
      !awsSolutionsAs1(node)
    ) {
      const ruleId = 'AwsSolutions-AS1';
      const info = 'The Auto Scaling Group does not have a cooldown period.';
      const explanation =
        'A cooldown period temporarily suspends any scaling activities in order to allow the newly launched EC2 instance(s) some time to start handling the application traffic.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-AS2') &&
      !awsSolutionsAs2(node)
    ) {
      const ruleId = 'AwsSolutions-AS2';
      const info =
        'The Auto Scaling Group does not have properly configured health checks.';
      const explanation =
        'The health check feature enables the service to detect whether its registered EC2 instances are healthy or not.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-AS3') &&
      !awsSolutionsAs3(node)
    ) {
      const ruleId = 'AwsSolutions-AS3';
      const info =
        'The Auto Scaling Group does not have notifications configured for all scaling events.';
      const explanation =
        'Notifications on EC2 instance launch, launch error, termination, and termination errors allow operators to gain better insights into systems attributes such as activity and health.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check Machine Learning Services
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkMachineLearning(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-SM1') &&
      !awsSolutionsSm1(node)
    ) {
      const ruleId = 'AwsSolutions-SM1';
      const info =
        'The SageMaker notebook instance is not provisioned inside a VPC.';
      const explanation =
        'Provisioning the notebook instances inside a VPC enables the notebook to access VPC-only resources such as EFS file systems.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-SM2') &&
      !awsSolutionsSm2(node)
    ) {
      const ruleId = 'AwsSolutions-SM2';
      const info =
        'The SageMaker notebook instance does not have an encrypted storage volume.';
      const explanation =
        'Encrypting storage volumes helps protect SageMaker data-at-rest.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-SM3') &&
      !awsSolutionsSm3(node)
    ) {
      const ruleId = 'AwsSolutions-SM3';
      const info =
        'The SageMaker notebook instance has direct internet access enabled.';
      const explanation =
        'Disabling public accessibility helps minimize security risks.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check Analytics Services
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkAnalytics(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-ATH1') &&
      !awsSolutionsAth1(node)
    ) {
      const ruleId = 'AwsSolutions-ATH1';
      const info = 'The Athena workgroup does not encrypt query results.';
      const explanation =
        'Encrypting query results stored in S3 helps secure data to meet compliance requirements for data-at-rest encryption.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-EMR2') &&
      !awsSolutionsEmr2(node)
    ) {
      const ruleId = 'AwsSolutions-EMR2';
      const info = 'The EMR cluster does not have S3 logging enabled.';
      const explanation =
        'Uploading logs to S3 enables the system to keep the logging data for historical purposes or to track and analyze the clusters behavior.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-EMR6') &&
      !awsSolutionsEmr6(node)
    ) {
      const ruleId = 'AwsSolutions-EMR6';
      const info =
        'The EMR cluster does not implement authentication via an EC2 Key Pair or Kerberos.';
      const explanation =
        'SSH clients can use an EC2 key pair to authenticate to cluster instances. Alternatively, with EMR release version 5.10.0 or later, solutions can configure Kerberos to authenticate users and SSH connections to the master node.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-ESH1') &&
      !awsSolutionsEsh1(node)
    ) {
      const ruleId = 'AwsSolutions-ESH1';
      const info = 'The ES domain is not provisioned inside a VPC.';
      const explanation =
        'Provisioning the domain within a VPC enables better flexibility and control over the clusters access and security as this feature keeps all traffic between the VPC and Elasticsearch domains within the AWS network instead of going over the public Internet.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-ESH2') &&
      !awsSolutionsEsh2(node)
    ) {
      const ruleId = 'AwsSolutions-ESH2';
      const info =
        'The ES domain does not have node-to-node encryption enabled.';
      const explanation =
        'Enabling the node-to-node encryption feature adds an extra layer of data protection on top of the existing ES security features such as HTTPS client to cluster encryption and data-at-rest encryption.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-ESH3') &&
      !awsSolutionsEsh3(node)
    ) {
      const ruleId = 'AwsSolutions-ESH3';
      const info =
        'The ES domain does not only grant access via allowlisted IP addresses.';
      const explanation =
        'Using allowlisted IP addresses helps protect the domain against unauthorized access.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-ESH4') &&
      !awsSolutionsEsh4(node)
    ) {
      const ruleId = 'AwsSolutions-ESH4';
      const info = 'The ES domain does not use dedicated master nodes.';
      const explanation =
        'Using dedicated master nodes helps improve environmental stability by offloading all the management tasks from the data nodes.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-ESH5') &&
      !awsSolutionsEsh5(node)
    ) {
      const ruleId = 'AwsSolutions-ESH5';
      const info =
        'The ES domain does not allow for unsigned requests or anonymous access.';
      const explanation =
        'Restricting public access helps prevent unauthorized access and prevents any unsigned requests to be made to the resources.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-ESH7') &&
      !awsSolutionsEsh7(node)
    ) {
      const ruleId = 'AwsSolutions-ESH7';
      const info = 'The ES domain does not have Zone Awareness enabled.';
      const explanation =
        'Enabling cross-zone replication (Zone Awareness) increases the availability of the ES domain by allocating the nodes and replicate the data across two AZs in the same region in order to prevent data loss and minimize downtime in the event of node or AZ failure.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-ESH8') &&
      !awsSolutionsEsh8(node)
    ) {
      const ruleId = 'AwsSolutions-ESH8';
      const info = 'The ES domain does not have encryption at rest enabled.';
      const explanation =
        'Encrypting data-at-rest protects data confidentiality and prevents unauthorized users from accessing sensitive information.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-ESH9') &&
      !awsSolutionsEsh9(node)
    ) {
      const ruleId = 'AwsSolutions-ESH9';
      const info =
        'The ES domain does not minimally publish SEARCH_SLOW_LOGS and INDEX_SLOW_LOGS to CloudWatch Logs.';
      const explanation =
        'These logs enable operators to gain full insight into the performance of these operations.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-KDA3') &&
      !awsSolutionsKda3(node)
    ) {
      const ruleId = 'AwsSolutions-KDA3';
      const info =
        'The Kinesis Data Analytics Flink Application does not have checkpointing enabled.';
      const explanation =
        'Checkpoints are backups of application state that KDA automatically creates periodically and uses to restore from faults.';
      Annotations.of(node).addWarning(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-KDS1') &&
      !awsSolutionsKds1(node)
    ) {
      const ruleId = 'AwsSolutions-KDS1';
      const info =
        'The Kinesis Data Stream does not has server-side encryption enabled.';
      const explanation =
        "Data is encrypted before it's written to the Kinesis stream storage layer, and decrypted after it’s retrieved from storage. This allows the system to meet strict regulatory requirements and enhance the security of system data.";
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-KDF1') &&
      !awsSolutionsKdf1(node)
    ) {
      const ruleId = 'AwsSolutions-KDF1';
      const info =
        'The Kinesis Data Firehose delivery stream does have server-side encryption enabled.';
      const explanation =
        'This allows the system to meet strict regulatory requirements and enhance the security of system data.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-MSK2') &&
      !awsSolutionsMsk2(node)
    ) {
      const ruleId = 'AwsSolutions-MSK2';
      const info =
        'The MSK cluster uses plaintext communication between clients and brokers.';
      const explanation =
        'TLS only communication secures data-in-transit by encrypting the connection between the clients and brokers.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-MSK3') &&
      !awsSolutionsMsk3(node)
    ) {
      const ruleId = 'AwsSolutions-MSK3';
      const info =
        'The MSK cluster uses plaintext communication between brokers.';
      const explanation =
        'TLS communication secures data-in-transit by encrypting the connection between brokers.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-MSK6') &&
      !awsSolutionsMsk6(node)
    ) {
      const ruleId = 'AwsSolutions-MSK6';
      const info =
        'The MSK cluster does not send broker logs to a supported destination.';
      const explanation =
        'Broker logs enable operators to troubleshoot Apache Kafka applications and to analyze their communications with the MSK cluster. The cluster can deliver logs to the following resources: a CloudWatch log group, an S3 bucket, a Kinesis Data Firehose delivery stream.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-QS1') &&
      !awsSolutionsQs1(node)
    ) {
      const ruleId = 'AwsSolutions-QS1';
      const info =
        'The Quicksight data sources connection is not configured to use SSL.';
      const explanation =
        'SSL secures communications to data sources, especially when using public networks. Using SSL with QuickSight requires the use of certificates signed by a publicly-recognized certificate authority.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check Security and Compliance Services
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkSecurityCompliance(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-IAM4') &&
      !awsSolutionsIam4(node)
    ) {
      const ruleId = 'AwsSolutions-IAM4';
      const info = 'The IAM user, role, or group uses AWS managed policies.';
      const explanation =
        'An AWS managed policy is a standalone policy that is created and administered by AWS. Currently, many AWS managed policies do not restrict resource scope. Replace AWS managed policies with system specific (customer) managed policies.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-IAM5') &&
      !awsSolutionsIam5(node)
    ) {
      const ruleId = 'AwsSolutions-IAM5';
      const info =
        'The IAM entity contains wildcard permissions and does not have a cdk_nag rule suppression with evidence for those permission.';
      const explanation =
        'Metadata explaining the evidence (e.g. via supporting links) for wildcard permissions allows for transparency to operators.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-COG1') &&
      !awsSolutionsCog1(node)
    ) {
      const ruleId = 'AwsSolutions-COG1';
      const info =
        'The Cognito user pool does not have a password policy that minimally specify a password length of at least 8 characters, as well as requiring uppercase, numeric, and special characters.';
      const explanation =
        'Strong password policies increase system security by encouraging users to create reliable and secure passwords.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-COG2') &&
      !awsSolutionsCog2(node)
    ) {
      const ruleId = 'AwsSolutions-COG2';
      const info = 'The Cognito user pool does not require MFA.';
      const explanation =
        'Multi-factor authentication (MFA) increases security for the application by adding another authentication method, and not relying solely on user name and password.';
      Annotations.of(node).addWarning(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-COG3') &&
      !awsSolutionsCog3(node)
    ) {
      const ruleId = 'AwsSolutions-COG3';
      const info =
        'The Cognito user pool does not have AdvancedSecurityMode set to ENFORCED.';
      const explanation =
        'Advanced security features enable the system to detect and act upon malicious sign-in attempts.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-COG7') &&
      !awsSolutionsCog7(node)
    ) {
      const ruleId = 'AwsSolutions-COG7';
      const info =
        'The Cognito identity pool allows for unauthenticated logins and does not have a cdk_nag rule suppression with a reason.';
      const explanation =
        'In many cases applications do not warrant unauthenticated guest access applications. Metadata explaining the use case allows for transparency to operators.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-KMS5') &&
      !awsSolutionsKms5(node)
    ) {
      const ruleId = 'AwsSolutions-KMS5';
      const info = 'The KMS Symmetric CMK does not have Key Rotation enabled.';
      const explanation =
        'KMS Key Rotation allow a system to set an yearly rotation schedule for a CMK so when a customer master key is required to encrypt new data, the KMS service can automatically use the latest version of the HSA backing key to perform the encryption.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check Serverless Services
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkServerless(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-SF1') &&
      !awsSolutionsSf1(node)
    ) {
      const ruleId = 'AwsSolutions-SF1';
      const info =
        'The Step Function does not log "ALL" events to CloudWatch Logs.';
      const explanation =
        'Logging "ALL" events to CloudWatch logs help operators troubleshoot and audit systems.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-SF2') &&
      !awsSolutionsSf2(node)
    ) {
      const ruleId = 'AwsSolutions-SF2';
      const info = 'The Step Function does not have X-Ray tracing enabled.';
      const explanation =
        'X-ray provides an end-to-end view of how an application is performing. This helps operators to discover performance issues, detect permission problems, and track requests made to and from other AWS services.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check Application Integration Services
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkApplicationIntegration(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-SNS2') &&
      !awsSolutionsSns2(node)
    ) {
      const ruleId = 'AwsSolutions-SNS2';
      const info =
        'The SNS Topic does not have server-side encryption enabled.';
      const explanation =
        'Server side encryption adds additional protection of sensitive data delivered as messages to subscribers.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-SQS2') &&
      !awsSolutionsSqs2(node)
    ) {
      const ruleId = 'AwsSolutions-SQS2';
      const info =
        'The SQS Queue does not have server-side encryption enabled.';
      const explanation =
        'Server side encryption adds additional protection of sensitive data delivered as messages to subscribers.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-SQS3') &&
      !awsSolutionsSqs3(node)
    ) {
      const ruleId = 'AwsSolutions-SQS3';
      const info =
        'The SQS queue does not have a dead-letter queue (DLQ) enabled or have a cdk_nag rule suppression indicating it is a DLQ.';
      const explanation =
        'Using a DLQ helps maintain the queue flow and avoid losing data by detecting and mitigating failures and service disruptions on time.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check Media Services
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkMediaServices(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-MS1') &&
      !awsSolutionsMs1(node)
    ) {
      const ruleId = 'AwsSolutions-MS1';
      const info =
        'The MediaStore container does not have container access logging enabled.';
      const explanation =
        'The container should have access logging enabled to provide detailed records for the requests that are made to the container.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-MS4') &&
      !awsSolutionsMs4(node)
    ) {
      const ruleId = 'AwsSolutions-MS4';
      const info =
        'The MediaStore container does not define a metric policy to send metrics to CloudWatch.';
      const explanation =
        'Using a combination of MediaStore metrics and CloudWatch alarms helps operators gain better insights into container operations.';
      Annotations.of(node).addWarning(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-MS7') &&
      !awsSolutionsMs7(node)
    ) {
      const ruleId = 'AwsSolutions-MS7';
      const info =
        'The MediaStore container does not define a container policy.';
      const explanation =
        'Using a container policy helps follow the standard security advice of granting least privilege, or granting only the permissions required to allow needed access to the container.';
      Annotations.of(node).addWarning(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-MS8') &&
      !awsSolutionsMs8(node)
    ) {
      const ruleId = 'AwsSolutions-MS8';
      const info = 'The MediaStore container does not define a CORS policy.';
      const explanation =
        'Using a CORS policy helps follow the standard security advice of granting least privilege, or granting only the permissions required to allow needed access to the container.';
      Annotations.of(node).addWarning(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-MS10') &&
      !awsSolutionsMs10(node)
    ) {
      const ruleId = 'AwsSolutions-MS10';
      const info =
        'The MediaStore container does not define a lifecycle policy.';
      const explanation =
        'Many use cases warrant the usage of lifecycle configurations to manage container objects during their lifetime.';
      Annotations.of(node).addWarning(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check Developer Tools Services
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkDeveloperTools(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-CB3') &&
      !awsSolutionsCb3(node)
    ) {
      const ruleId = 'AwsSolutions-CB3';
      const info = 'The CodeBuild project has privileged mode enabled.';
      const explanation =
        'Privileged grants elevated rights to the system, which introduces additional risk. Privileged mode should only be set to true only if the build project is used to build Docker images. Otherwise, a build that attempts to interact with the Docker daemon fails.';
      Annotations.of(node).addWarning(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-CB4') &&
      !awsSolutionsCb4(node)
    ) {
      const ruleId = 'AwsSolutions-CB4';
      const info = 'The CodeBuild project does not use a CMK for encryption.';
      const explanation =
        'Using a CMK helps follow the standard security advice of granting least privilege to objects generated by the project.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-CB5') &&
      !awsSolutionsCb5(node)
    ) {
      const ruleId = 'AwsSolutions-CB5';
      const info =
        'The Codebuild project does not use images provided by the CodeBuild service or have a cdk_nag suppression rule explaining the need for a custom image.';
      const explanation =
        'Explaining differences/edits to Docker images helps operators better understand system dependencies.';
      Annotations.of(node).addWarning(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'AwsSolutions-C91') &&
      !awsSolutionsC91(node)
    ) {
      const ruleId = 'AwsSolutions-C91';
      const info =
        'The Cloud9 instance does not use a no-ingress EC2 instance with AWS Systems Manager.';
      const explanation =
        'SSM adds an additional layer of protection as it allows operators to control access through IAM permissions and does not require opening inbound ports.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }
}
