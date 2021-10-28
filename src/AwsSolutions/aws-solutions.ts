/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnResource, IConstruct } from '@aws-cdk/core';
import { NagPack, NagMessageLevel } from '../nag-pack';
import {
  awsSolutionsAth1,
  awsSolutionsEmr2,
  awsSolutionsEmr6,
  awsSolutionsKda3,
  awsSolutionsKds1,
  awsSolutionsKdf1,
  awsSolutionsMsk2,
  awsSolutionsMsk6,
  awsSolutionsMsk3,
  awsSolutionsOs1,
  awsSolutionsOs2,
  awsSolutionsOs3,
  awsSolutionsOs4,
  awsSolutionsOs5,
  awsSolutionsOs7,
  awsSolutionsOs8,
  awsSolutionsOs9,
  awsSolutionsQs1,
} from './rules/analytics';
import {
  awsSolutionsSns2,
  awsSolutionsSqs2,
  awsSolutionsSqs3,
} from './rules/application_integration';
import {
  awsSolutionsEb1,
  awsSolutionsEb3,
  awsSolutionsEb4,
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
} from './rules/compute';
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
  awsSolutionsRds15,
  awsSolutionsRds16,
  awsSolutionsRds2,
  awsSolutionsRds6,
  awsSolutionsRs1,
  awsSolutionsRs10,
  awsSolutionsRs11,
  awsSolutionsRs2,
  awsSolutionsRs3,
  awsSolutionsRs4,
  awsSolutionsRs5,
  awsSolutionsRs6,
  awsSolutionsRs8,
  awsSolutionsRs9,
  awsSolutionsTs3,
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
} from './rules/network_and_delivery';
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
      this.checkCompute(node);
      this.checkStorage(node);
      this.checkDatabases(node);
      this.checkNetworkDelivery(node);
      this.checkManagementGovernance(node);
      this.checkMachineLearning(node);
      this.checkAnalytics(node);
      this.checkSecurityCompliance(node);
      this.checkServerless(node);
      this.checkApplicationIntegration(node);
      this.checkMediaServices(node);
      this.checkDeveloperTools(node);
    }
  }

  /**
   * Check Compute Services
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkCompute(node: CfnResource): void {
    this.applyRule({
      ruleId: 'AwsSolutions-EB1',
      info: 'The Elastic Beanstalk environment is not configured to use a specific VPC.',
      explanation:
        'Use a non-default in order to seperate your environment from default resources.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsEb1,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-EB3',
      info: 'The Elastic Beanstalk environment does not have managed updates enabled.',
      explanation:
        'Enable managed platform updates for beanstalk environments in order to receive bug fixes, software updates and new features. Managed platform updates perform immutable environment updates.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsEb3,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-EB4',
      info: 'The Elastic Beanstalk environment does not upload EC2 Instance logs to S3.',
      explanation:
        'Beanstalk environment logs should be retained and uploaded to Amazon S3 in order to keep the logging data for future audits, historical purposes or to track and analyze the EB application environment behavior for a long period of time.',
      level: NagMessageLevel.WARN,
      rule: awsSolutionsEb4,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-EC23',
      info: 'The Security Group allows for 0.0.0.0/0 or ::/0 inbound access.',
      explanation:
        'Large port ranges, when open, expose instances to unwanted attacks. More than that, they make traceability of vulnerabilities very difficult. For instance, your web servers may only require 80 and 443 ports to be open, but not all. One of the most common mistakes observed is when  all ports for 0.0.0.0/0 range are open in a rush to access the instance. EC2 instances must expose only to those ports enabled on the corresponding security group level.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsEc23,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-EC26',
      info: 'The EBS volume has encryption disabled.',
      explanation:
        "With EBS encryption, you aren't required to build, maintain, and secure your own key management infrastructure. EBS encryption uses KMS keys when creating encrypted volumes and snapshots. This helps protect data at rest.",
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsEc26,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-EC27',
      info: 'The Security Group does not have a description.',
      explanation:
        'Descriptions help simplify operations and remove any opportunities for operator errors.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsEc27,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-EC28',
      info: 'The EC2 instance/AutoScaling launch configuration does not have detailed monitoring enabled.',
      explanation:
        'Monitoring data helps make better decisions on architecting and managing compute resources.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsEc28,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-EC29',
      info: 'The EC2 instance is not part of an ASG and has Termination Protection disabled.',
      explanation:
        'Termination Protection safety feature enabled in order to protect the instances from being accidentally terminated.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsEc29,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-ECR1',
      info: 'The ECR Repository allows open access.',
      explanation:
        'Removing * principals in an ECR Repository helps protect against unauthorized access.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsEcr1,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-ECS4',
      info: 'The ECS Cluster has CloudWatch Container Insights disabled.',
      explanation:
        'CloudWatch Container Insights allow operators to gain a better perspective on how the cluster’s applications and microservices are performing.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsEcs4,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-ECS7',
      info: 'The ECS Task Definition does not have awslogs logging enabled at the minimum.',
      explanation:
        'Container logging allows operators to view and aggregate the logs from the container.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsEcs7,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-ELB1',
      info: 'The CLB is used for incoming HTTP/HTTPS traffic. Use ALBs instead.',
      explanation:
        'HTTP/HTTPS applications (monolithic or containerized) should use the ALB instead of The CLB for enhanced incoming traffic distribution, better performance and lower costs.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsElb1,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-ELB2a',
      info: 'The ALB does not have access logs enabled.',
      explanation:
        'Access logs allow operators to to analyze traffic patterns and identify and troubleshoot security issues.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsElb2a,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-ELB2e',
      info: 'The CLB does not have access logs enabled.',
      explanation:
        'Access logs allow operators to to analyze traffic patterns and identify and troubleshoot security issues.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsElb2e,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-ELB3',
      info: 'The CLB does not have connection draining enabled.',
      explanation:
        'With Connection Draining feature enabled, if an EC2 backend instance fails health checks The CLB will not send any new requests to the unhealthy instance. However, it will still allow existing (in-flight) requests to complete for the duration of the configured timeout.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsElb3,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-ELB4',
      info: 'The CLB does not use at least two AZs with the Cross-Zone Load Balancing feature enabled.',
      explanation:
        'CLBs can distribute the traffic evenly across all backend instances. To use Cross-Zone Load Balancing at optimal level, the system should maintain an equal EC2 capacity distribution in each of the AZs registered with the load balancer.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsElb4,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-ELB5',
      info: 'The CLB listener is not configured for secure (HTTPs or SSL) protocols for client communication.',
      explanation:
        'The HTTPs or SSL protocols enable secure communication by encrypting the communication between the client and the load balancer.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsElb5,
      node: node,
    });
  }

  /**
   * Check Storage Services
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkStorage(node: CfnResource): void {
    this.applyRule({
      ruleId: 'AwsSolutions-S1',
      info: 'The S3 Bucket has server access logs disabled.',
      explanation:
        'The bucket should have server access logging enabled to provide detailed records for the requests that are made to the bucket.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsS1,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-S2',
      info: 'The S3 Bucket does not have public access restricted and blocked.',
      explanation:
        'The bucket should have public access restricted and blocked to prevent unauthorized access.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsS2,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-S3',
      info: 'The S3 Bucket does not default encryption enabled.',
      explanation:
        'The bucket should minimally have SSE enabled to help protect data-at-rest.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsS3,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-EFS1',
      info: 'The EFS is not configured for encryption at rest.',
      explanation:
        'By using an encrypted file system, data and metadata are automatically encrypted before being written to the file system. Similarly, as data and metadata are read, they are automatically decrypted before being presented to the application. These processes are handled transparently by EFS without requiring modification of applications.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsEfs1,
      node: node,
    });
  }

  /**
   * Check Database Services
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkDatabases(node: CfnResource): void {
    this.applyRule({
      ruleId: 'AwsSolutions-RDS2',
      info: 'The RDS instance or Aurora DB cluster does not have storage encryption enabled.',
      explanation:
        'Storage encryption helps protect data-at-rest by encrypting the underlying storage, automated backups, read replicas, and snapshots for the database.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsRds2,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-RDS6',
      info: 'The RDS Aurora MySQL/PostgresSQL cluster does not have IAM Database Authentication enabled.',
      explanation:
        "With IAM Database Authentication enabled, the system doesn't have to use a password when connecting to the MySQL/PostgreSQL database instances, instead it uses an authentication token.",
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsRds6,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-RDS10',
      info: 'The RDS instance or Aurora DB cluster does not have deletion protection enabled.',
      explanation:
        'The deletion protection feature helps protect the database from being accidentally deleted.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsRds10,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-RDS11',
      info: 'The RDS instance or Aurora DB cluster uses the default endpoint port.',
      explanation:
        'Port obfuscation (using a non default endpoint port) adds an additional layer of defense against non-targeted attacks (i.e. MySQL/Aurora port 3306, SQL Server port 1433, PostgreSQL port 5432, etc).',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsRds11,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-RDS13',
      info: 'The RDS instance is not configured for automated backups.',
      explanation: 'Automated backups allow for point-in-time recovery.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsRds13,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-RDS14',
      info: 'The RDS Aurora MySQL cluster does not have Backtrack enabled.',
      explanation:
        'Backtrack helps order to rewind cluster tables to a specific time, without using backups.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsRds14,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-RDS15',
      info: 'The RDS Aurora cluster does not have deletion protection enabled.',
      explanation:
        'Enabling Deletion Protection at the cluster level helps protect Amazon Aurora dtabases from accidental deletion.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsRds15,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-RDS16',
      info: 'The RDS Aurora MySQL serverless cluster does not have audit, error, general, and slowquery Log Exports enabled.',
      explanation:
        'This allows operators to use CloudWatch to view logs to help diagnose problems in the database.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsRds16,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-DDB3',
      info: 'The DynamoDB table does not have Point-in-time Recovery enabled.',
      explanation:
        'DynamoDB continuous backups represent an additional layer of insurance against accidental loss of data on top of on-demand backups. The DynamoDB service can back up the data with per-second granularity and restore it to any single second from the time PITR was enabled up to the prior 35 days.',
      level: NagMessageLevel.WARN,
      rule: awsSolutionsDdb3,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-DDB4',
      info: 'The DAX cluster does not have server-side encryption enabled.',
      explanation:
        'Data in cache, configuration data and log files should be encrypted using Server-Side Encryption in order to protect from unauthorized access to the underlying storage.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsDdb4,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-AEC1',
      info: 'The ElastiCache cluster is not provisioned in a VPC.',
      explanation:
        'Provisioning the cluster within a VPC allows for better flexibility and control over the cache clusters security, availability, traffic routing and more.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsAec1,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-AEC3',
      info: 'The ElastiCache Redis cluster does not have both encryption in transit and at rest enabled.',
      explanation:
        'Encryption in transit helps secure communications to the cluster. Encryption at rest helps protect data at rest from unauthorized access.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsAec3,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-AEC4',
      info: 'The ElastiCache Redis cluster is not deployed in a Multi-AZ configuration.',
      explanation:
        'The cluster should use a Multi-AZ deployment configuration for high availability.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsAec4,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-AEC5',
      info: 'The ElastiCache cluster uses the default endpoint port.',
      explanation:
        'Port obfuscation (using a non default endpoint port) adds an additional layer of defense against non-targeted attacks (i.e. Redis port 6379 and Memcached port 11211).',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsAec5,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-AEC6',
      info: 'The ElastiCache Redis cluster does not use Redis AUTH for user authentication.',
      explanation:
        'Redis authentication tokens enable Redis to require a token (password) before allowing clients to execute commands, thereby improving data security.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsAec6,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-N1',
      info: 'The Neptune DB cluster is not deployed in a Multi-AZ configuration.',
      explanation:
        'The cluster should use a Multi-AZ deployment configuration for high availability.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsN1,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-N2',
      info: 'The Neptune DB instance does have Auto Minor Version Upgrade enabled.',
      explanation:
        'The Neptune service regularly releases engine updates. Enabling Auto Minor Version Upgrade will allow the service to automatically apply these upgrades to DB Instances.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsN2,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-N3',
      info: 'The Neptune DB cluster does not have a reasonable minimum backup retention period configured.',
      explanation:
        'The retention period represents the number of days to retain automated snapshots. A minimum retention period of 7 days is recommended but can be adjust to meet system requirements.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsN3,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-N4',
      info: 'The Neptune DB cluster does not have encryption at rest enabled.',
      explanation:
        'Encrypting data-at-rest protects data confidentiality and prevents unauthorized users from accessing sensitive information.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsN4,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-N5',
      info: 'The Neptune DB cluster does not have IAM Database Authentication enabled.',
      explanation:
        "With IAM Database Authentication enabled, the system doesn't have to use a password when connecting to the cluster.",
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsN5,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-RS1',
      info: 'The Redshift cluster parameter group must have the "require_ssl" parameter enabled.',
      explanation:
        'Enabling the "require_ssl" parameter secures data-in-transit by encrypting the connection between the clients and the Redshift clusters.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsRs1,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-RS2',
      info: 'The Redshift cluster is not provisioned in a VPC.',
      explanation:
        'Provisioning the cluster within a VPC allows for better flexibility and control over the Redshift clusters security, availability, traffic routing and more.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsRs2,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-RS3',
      info: 'The Redshift cluster uses the default "awsuser" username.',
      explanation:
        'Using a custom master user name instead of the default master user name (i.e. "awsuser") provides an additional layer of defense against non-targeted attacks.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsRs3,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-RS4',
      info: 'The Redshift cluster uses the default endpoint port.',
      explanation:
        'Port obfuscation (using a non default endpoint port) adds an additional layer of defense against non-targeted attacks (i.e. Redshift port 5439).',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsRs4,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-RS5',
      info: 'The Redshift cluster does not have audit logging enabled.',
      explanation:
        'Audit logging helps operators troubleshoot issues and ensure security.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsRs5,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-RS6',
      info: 'The Redshift cluster does not have encryption at rest enabled.',
      explanation: 'Encrypting data-at-rest protects data confidentiality.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsRs6,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-RS8',
      info: 'The Redshift cluster is publicly accessible.',
      explanation:
        'Disabling public accessibility helps minimize security risks.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsRs8,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-RS9',
      info: 'The Redshift cluster does not have version upgrade enabled.',
      explanation:
        'Version Upgrade must enabled to enable the cluster to automatically receive upgrades during the maintenance window.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsRs9,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-RS10',
      info: 'The Redshift cluster does not have a retention period for automated snapshots configured.',
      explanation:
        'The retention period represents the number of days to retain automated snapshots. A positive retention period should be set to configure this feature.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsRs10,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-RS11',
      info: 'The Redshift cluster does not have user activity logging enabled.',
      explanation:
        'User activity logging logs each query before it is performed on the clusters databse. To enable this feature associate a Resdhsift Cluster Parameter Group with the "enable_user_activity_logging" parameter set to "true".',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsRs11,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-DOC1',
      info: 'The Document DB cluster does not have encryption at rest enabled.',
      explanation:
        'Encrypting data-at-rest protects data confidentiality and prevents unauthorized users from accessing sensitive information.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsDoc1,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-DOC2',
      info: 'The Document DB cluster uses the default endpoint port.',
      explanation:
        'Port obfuscation (using a non default endpoint port) adds an additional layer of defense against non-targeted attacks (i.e. MongoDB port 27017).',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsDoc2,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-DOC3',
      info: 'The Document DB cluster does not have the username and password stored in Secrets Manager.',
      explanation:
        "Secrets Manager enables operators to replace hardcoded credentials in your code, including passwords, with an API call to Secrets Manager to retrieve the secret programmatically. This helps ensure the secret can't be compromised by someone examining system code, because the secret no longer exists in the code. Also, operators can configure Secrets Manager to automatically rotate the secret for you according to a specified schedule. This enables you to replace long-term secrets with short-term ones, significantly reducing the risk of compromise.",
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsDoc3,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-DOC4',
      info: 'The Document DB cluster does not have a reasonable minimum backup retention period configured.',
      explanation:
        'The retention period represents the number of days to retain automated snapshots. A minimum retention period of 7 days is recommended but can be adjust to meet system requirements.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsDoc4,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-DOC5',
      info: 'The Document DB cluster does not have authenticate, createIndex, and dropCollection Log Exports enabled.',
      explanation:
        'This allows operators to use CloudWatch to view logs to help diagnose problems in the database. The events recorded by the AWS DocumentDB audit logs include successful and failed authentication attempts, creating indexes or dropping a collection in a database within the DocumentDB cluster.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsDoc5,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-TS3',
      info: 'The Timestream database does not use a Customer Managed KMS Key for at rest encryption.',
      explanation:
        'All Timestream tables in a database are encrypted at rest by default using AWS Managed Key. These keys are rotated every three years. Data at rest must be encrypted using CMKs if you require more control over the permissions and lifecycle of your keys, including the ability to have them automatically rotated on an annual basis.',
      level: NagMessageLevel.WARN,
      rule: awsSolutionsTs3,
      node: node,
    });
  }

  /**
   * Check Network and Delivery Services
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkNetworkDelivery(node: CfnResource): void {
    this.applyRule({
      ruleId: 'AwsSolutions-VPC3',
      info: 'A Network ACL or Network ACL entry has been implemented.',
      explanation:
        'Network ACLs should be used sparingly for the following reasons: they can be complex to manage, they are stateless, every IP address must be explicitly opened in each (inbound/outbound) direction, and they affect a complete subnet. Use security groups when possible as they are stateful and easier to manage.',
      level: NagMessageLevel.WARN,
      rule: awsSolutionsVpc3,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-CFR1',
      info: 'The CloudFront distribution may require Geo restrictions.',
      explanation:
        'Geo restriction may need to be enabled for the distribution in order to allow or deny a country in order to allow or restrict users in specific locations from accessing content.',
      level: NagMessageLevel.WARN,
      rule: awsSolutionsCfr1,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-CFR2',
      info: 'The CloudFront distribution may require integration with AWS WAF.',
      explanation:
        'The Web Application Firewall can help protect against application-layer attacks that can compromise the security of the system or place unnecessary load on them.',
      level: NagMessageLevel.WARN,
      rule: awsSolutionsCfr2,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-CFR3',
      info: 'The CloudFront distributions does not have access logging enabled.',
      explanation:
        'Enabling access logs helps operators track all viewer requests for the content delivered through the Content Delivery Network.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsCfr3,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-CFR5',
      info: 'The CloudFront distributions uses SSLv3 or TLSv1 for communication to the origin.',
      explanation:
        'Vulnerabilities have been and continue to be discovered in the deprecated SSL and TLS protocols. Using a security policy with minimum TLSv1.1 or TLSv1.2 and appropriate security ciphers for HTTPS helps protect viewer connections.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsCfr5,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-CFR6',
      info: 'The CloudFront distribution does not use an origin access identity an S3 origin.',
      explanation:
        'Origin access identities help with security by restricting any direct access to objects through S3 URLs.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsCfr6,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-APIG1',
      info: 'The API does not have access logging enabled.',
      explanation:
        'Enabling access logs helps operators view who accessed an API and how the caller accessed the API.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsApig1,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-APIG4',
      info: 'The API does not implement authorization.',
      explanation:
        'In most cases an API needs to have an authentication and authorization implementation strategy. This includes using such approaches as IAM, Cognito User Pools, Custom authorizer, etc.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsApig4,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-APIG6',
      info: 'The REST API Stage does not have CloudWatch logging enabled for all methods.',
      explanation:
        'Enabling CloudWatch logs at the stage level helps operators to track and analyze execution behavior at the API stage level.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsApig6,
      node: node,
    });
  }

  /**
   * Check Management and Governance Services
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkManagementGovernance(node: CfnResource): void {
    this.applyRule({
      ruleId: 'AwsSolutions-AS1',
      info: 'The Auto Scaling Group does not have a cooldown period.',
      explanation:
        'A cooldown period temporarily suspends any scaling activities in order to allow the newly launched EC2 instance(s) some time to start handling the application traffic.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsAs1,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-AS2',
      info: 'The Auto Scaling Group does not have properly configured health checks.',
      explanation:
        'The health check feature enables the service to detect whether its registered EC2 instances are healthy or not.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsAs2,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-AS3',
      info: 'The Auto Scaling Group does not have notifications configured for all scaling events.',
      explanation:
        'Notifications on EC2 instance launch, launch error, termination, and termination errors allow operators to gain better insights into systems attributes such as activity and health.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsAs3,
      node: node,
    });
  }

  /**
   * Check Machine Learning Services
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkMachineLearning(node: CfnResource): void {
    this.applyRule({
      ruleId: 'AwsSolutions-SM1',
      info: 'The SageMaker notebook instance is not provisioned inside a VPC.',
      explanation:
        'Provisioning the notebook instances inside a VPC enables the notebook to access VPC-only resources such as EFS file systems.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsSm1,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-SM2',
      info: 'The SageMaker notebook instance does not have an encrypted storage volume.',
      explanation:
        'Encrypting storage volumes helps protect SageMaker data-at-rest.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsSm2,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-SM3',
      info: 'The SageMaker notebook instance has direct internet access enabled.',
      explanation:
        'Disabling public accessibility helps minimize security risks.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsSm3,
      node: node,
    });
  }

  /**
   * Check Analytics Services
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkAnalytics(node: CfnResource): void {
    this.applyRule({
      ruleId: 'AwsSolutions-ATH1',
      info: 'The Athena workgroup does not encrypt query results.',
      explanation:
        'Encrypting query results stored in S3 helps secure data to meet compliance requirements for data-at-rest encryption.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsAth1,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-EMR2',
      info: 'The EMR cluster does not have S3 logging enabled.',
      explanation:
        'Uploading logs to S3 enables the system to keep the logging data for historical purposes or to track and analyze the clusters behavior.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsEmr2,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-EMR6',
      info: 'The EMR cluster does not implement authentication via an EC2 Key Pair or Kerberos.',
      explanation:
        'SSH clients can use an EC2 key pair to authenticate to cluster instances. Alternatively, with EMR release version 5.10.0 or later, solutions can configure Kerberos to authenticate users and SSH connections to the master node.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsEmr6,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-KDA3',
      info: 'The Kinesis Data Analytics Flink Application does not have checkpointing enabled.',
      explanation:
        'Checkpoints are backups of application state that KDA automatically creates periodically and uses to restore from faults.',
      level: NagMessageLevel.WARN,
      rule: awsSolutionsKda3,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-KDS1',
      info: 'The Kinesis Data Stream does not has server-side encryption enabled.',
      explanation:
        "Data is encrypted before it's written to the Kinesis stream storage layer, and decrypted after it’s retrieved from storage. This allows the system to meet strict regulatory requirements and enhance the security of system data.",
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsKds1,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-KDF1',
      info: 'The Kinesis Data Firehose delivery stream does have server-side encryption enabled.',
      explanation:
        'This allows the system to meet strict regulatory requirements and enhance the security of system data.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsKdf1,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-MSK2',
      info: 'The MSK cluster uses plaintext communication between clients and brokers.',
      explanation:
        'TLS only communication secures data-in-transit by encrypting the connection between the clients and brokers.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsMsk2,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-MSK3',
      info: 'The MSK cluster uses plaintext communication between brokers.',
      explanation:
        'TLS communication secures data-in-transit by encrypting the connection between brokers.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsMsk3,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-MSK6',
      info: 'The MSK cluster does not send broker logs to a supported destination.',
      explanation:
        'Broker logs enable operators to troubleshoot Apache Kafka applications and to analyze their communications with the MSK cluster. The cluster can deliver logs to the following resources: a CloudWatch log group, an S3 bucket, a Kinesis Data Firehose delivery stream.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsMsk6,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-OS1',
      info: 'The OpenSearch Service domain is not provisioned inside a VPC.',
      explanation:
        'Provisioning the domain within a VPC enables better flexibility and control over the clusters access and security as this feature keeps all traffic between the VPC and OpenSearch domains within the AWS network instead of going over the public Internet.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsOs1,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-OS2',
      info: 'The OpenSearch Service domain does not have node-to-node encryption enabled.',
      explanation:
        'Enabling the node-to-node encryption feature adds an extra layer of data protection on top of the existing ES security features such as HTTPS client to cluster encryption and data-at-rest encryption.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsOs2,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-OS3',
      info: 'The OpenSearch Service domain does not only grant access via allowlisted IP addresses.',
      explanation:
        'Using allowlisted IP addresses helps protect the domain against unauthorized access.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsOs3,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-OS4',
      info: 'The OpenSearch Service domain does not use dedicated master nodes.',
      explanation:
        'Using dedicated master nodes helps improve environmental stability by offloading all the management tasks from the data nodes.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsOs4,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-OS5',
      info: 'The OpenSearch Service domain does not allow for unsigned requests or anonymous access.',
      explanation:
        'Restricting public access helps prevent unauthorized access and prevents any unsigned requests to be made to the resources.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsOs5,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-OS7',
      info: 'The OpenSearch Service domain does not have Zone Awareness enabled.',
      explanation:
        'Enabling cross-zone replication (Zone Awareness) increases the availability of the OpenSearch Service domain by allocating the nodes and replicate the data across two AZs in the same region in order to prevent data loss and minimize downtime in the event of node or AZ failure.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsOs7,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-OS8',
      info: 'The OpenSearch Service domain does not have encryption at rest enabled.',
      explanation:
        'Encrypting data-at-rest protects data confidentiality and prevents unauthorized users from accessing sensitive information.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsOs8,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-OS9',
      info: 'The OpenSearch Service domain does not minimally publish SEARCH_SLOW_LOGS and INDEX_SLOW_LOGS to CloudWatch Logs.',
      explanation:
        'These logs enable operators to gain full insight into the performance of these operations.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsOs9,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-QS1',
      info: 'The Quicksight data sources connection is not configured to use SSL.',
      explanation:
        'SSL secures communications to data sources, especially when using public networks. Using SSL with QuickSight requires the use of certificates signed by a publicly-recognized certificate authority.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsQs1,
      node: node,
    });
  }

  /**
   * Check Security and Compliance Services
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkSecurityCompliance(node: CfnResource): void {
    this.applyRule({
      ruleId: 'AwsSolutions-IAM4',
      info: 'The IAM user, role, or group uses AWS managed policies.',
      explanation:
        'An AWS managed policy is a standalone policy that is created and administered by AWS. Currently, many AWS managed policies do not restrict resource scope. Replace AWS managed policies with system specific (customer) managed policies.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsIam4,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-IAM5',
      info: 'The IAM entity contains wildcard permissions and does not have a cdk_nag rule suppression with evidence for those permission.',
      explanation:
        'Metadata explaining the evidence (e.g. via supporting links) for wildcard permissions allows for transparency to operators.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsIam5,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-COG1',
      info: 'The Cognito user pool does not have a password policy that minimally specify a password length of at least 8 characters, as well as requiring uppercase, numeric, and special characters.',
      explanation:
        'Strong password policies increase system security by encouraging users to create reliable and secure passwords.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsCog1,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-COG2',
      info: 'The Cognito user pool does not require MFA.',
      explanation:
        'Multi-factor authentication (MFA) increases security for the application by adding another authentication method, and not relying solely on user name and password.',
      level: NagMessageLevel.WARN,
      rule: awsSolutionsCog2,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-COG3',
      info: 'The Cognito user pool does not have AdvancedSecurityMode set to ENFORCED.',
      explanation:
        'Advanced security features enable the system to detect and act upon malicious sign-in attempts.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsCog3,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-COG7',
      info: 'The Cognito identity pool allows for unauthenticated logins and does not have a cdk_nag rule suppression with a reason.',
      explanation:
        'In many cases applications do not warrant unauthenticated guest access applications. Metadata explaining the use case allows for transparency to operators.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsCog7,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-KMS5',
      info: 'The KMS Symmetric key does not have Key Rotation enabled.',
      explanation:
        'KMS Key Rotation allow a system to set an yearly rotation schedule for a KMS key so when a AWS KMS key is required to encrypt new data, the KMS service can automatically use the latest version of the HSA backing key to perform the encryption.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsKms5,
      node: node,
    });
  }

  /**
   * Check Serverless Services
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkServerless(node: CfnResource): void {
    this.applyRule({
      ruleId: 'AwsSolutions-SF1',
      info: 'The Step Function does not log "ALL" events to CloudWatch Logs.',
      explanation:
        'Logging "ALL" events to CloudWatch logs help operators troubleshoot and audit systems.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsSf1,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-SF2',
      info: 'The Step Function does not have X-Ray tracing enabled.',
      explanation:
        'X-ray provides an end-to-end view of how an application is performing. This helps operators to discover performance issues, detect permission problems, and track requests made to and from other AWS services.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsSf2,
      node: node,
    });
  }

  /**
   * Check Application Integration Services
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkApplicationIntegration(node: CfnResource): void {
    this.applyRule({
      ruleId: 'AwsSolutions-SNS2',
      info: 'The SNS Topic does not have server-side encryption enabled.',
      explanation:
        'Server side encryption adds additional protection of sensitive data delivered as messages to subscribers.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsSns2,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-SQS2',
      info: 'The SQS Queue does not have server-side encryption enabled.',
      explanation:
        'Server side encryption adds additional protection of sensitive data delivered as messages to subscribers.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsSqs2,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-SQS3',
      info: 'The SQS queue does not have a dead-letter queue (DLQ) enabled or have a cdk_nag rule suppression indicating it is a DLQ.',
      explanation:
        'Using a DLQ helps maintain the queue flow and avoid losing data by detecting and mitigating failures and service disruptions on time.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsSqs3,
      node: node,
    });
  }

  /**
   * Check Media Services
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkMediaServices(node: CfnResource): void {
    this.applyRule({
      ruleId: 'AwsSolutions-MS1',
      info: 'The MediaStore container does not have container access logging enabled.',
      explanation:
        'The container should have access logging enabled to provide detailed records for the requests that are made to the container.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsMs1,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-MS4',
      info: 'The MediaStore container does not define a metric policy to send metrics to CloudWatch.',
      explanation:
        'Using a combination of MediaStore metrics and CloudWatch alarms helps operators gain better insights into container operations.',
      level: NagMessageLevel.WARN,
      rule: awsSolutionsMs4,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-MS7',
      info: 'The MediaStore container does not define a container policy.',
      explanation:
        'Using a container policy helps follow the standard security advice of granting least privilege, or granting only the permissions required to allow needed access to the container.',
      level: NagMessageLevel.WARN,
      rule: awsSolutionsMs7,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-MS8',
      info: 'The MediaStore container does not define a CORS policy.',
      explanation:
        'Using a CORS policy helps follow the standard security advice of granting least privilege, or granting only the permissions required to allow needed access to the container.',
      level: NagMessageLevel.WARN,
      rule: awsSolutionsMs8,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-MS10',
      info: 'The MediaStore container does not define a lifecycle policy.',
      explanation:
        'Many use cases warrant the usage of lifecycle configurations to manage container objects during their lifetime.',
      level: NagMessageLevel.WARN,
      rule: awsSolutionsMs10,
      node: node,
    });
  }

  /**
   * Check Developer Tools Services
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkDeveloperTools(node: CfnResource): void {
    this.applyRule({
      ruleId: 'AwsSolutions-CB3',
      info: 'The CodeBuild project has privileged mode enabled.',
      explanation:
        'Privileged grants elevated rights to the system, which introduces additional risk. Privileged mode should only be set to true only if the build project is used to build Docker images. Otherwise, a build that attempts to interact with the Docker daemon fails.',
      level: NagMessageLevel.WARN,
      rule: awsSolutionsCb3,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-CB4',
      info: 'The CodeBuild project does not use an AWS KMS key for encryption.',
      explanation:
        'Using an AWS KMS key helps follow the standard security advice of granting least privilege to objects generated by the project.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsCb4,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-CB5',
      info: 'The Codebuild project does not use images provided by the CodeBuild service or have a cdk_nag suppression rule explaining the need for a custom image.',
      explanation:
        'Explaining differences/edits to Docker images helps operators better understand system dependencies.',
      level: NagMessageLevel.WARN,
      rule: awsSolutionsCb5,
      node: node,
    });
    this.applyRule({
      ruleId: 'AwsSolutions-C91',
      info: 'The Cloud9 instance does not use a no-ingress EC2 instance with AWS Systems Manager.',
      explanation:
        'SSM adds an additional layer of protection as it allows operators to control access through IAM permissions and does not require opening inbound ports.',
      level: NagMessageLevel.ERROR,
      rule: awsSolutionsC91,
      node: node,
    });
  }
}
