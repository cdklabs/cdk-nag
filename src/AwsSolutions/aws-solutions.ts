/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnResource, IConstruct } from '@aws-cdk/core';
import { NagPack, NagMessageLevel } from '../common';
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
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkCompute(node: CfnResource, ignores: any): void {
    this.applyRule(
      'AwsSolutions-EC23',
      'The Security Group allows for 0.0.0.0/0 or ::/0 inbound access.',
      'Large port ranges, when open, expose instances to unwanted attacks. More than that, they make traceability of vulnerabilities very difficult. For instance, your web servers may only require 80 and 443 ports to be open, but not all. One of the most common mistakes observed is when  all ports for 0.0.0.0/0 range are open in a rush to access the instance. EC2 instances must expose only to those ports enabled on the corresponding security group level.',
      NagMessageLevel.ERROR,
      awsSolutionsEc23,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-EC26',
      'The EBS volume has encryption disabled.',
      "With EBS encryption, you aren't required to build, maintain, and secure your own key management infrastructure. EBS encryption uses KMS keys when creating encrypted volumes and snapshots. This helps protect data at rest.",
      NagMessageLevel.ERROR,
      awsSolutionsEc26,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-EC27',
      'The Security Group does not have a description.',
      'Descriptions help simplify operations and remove any opportunities for operator errors.',
      NagMessageLevel.ERROR,
      awsSolutionsEc27,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-EC28',
      'The EC2 instance/AutoScaling launch configuration does not have detailed monitoring enabled.',
      'Monitoring data helps make better decisions on architecting and managing compute resources.',
      NagMessageLevel.ERROR,
      awsSolutionsEc28,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-EC29',
      'The EC2 instance is not part of an ASG and has Termination Protection disabled.',
      'Termination Protection safety feature enabled in order to protect the instances from being accidentally terminated.',
      NagMessageLevel.ERROR,
      awsSolutionsEc29,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-ECR1',
      'The ECR Repository allows open access.',
      'Removing * principals in an ECR Repository helps protect against unauthorized access.',
      NagMessageLevel.ERROR,
      awsSolutionsEcr1,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-ECS4',
      'The ECS Cluster has CloudWatch Container Insights disabled.',
      'CloudWatch Container Insights allow operators to gain a better perspective on how the cluster’s applications and microservices are performing.',
      NagMessageLevel.ERROR,
      awsSolutionsEcs4,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-ECS7',
      'The ECS Task Definition does not have awslogs logging enabled at the minimum.',
      'Container logging allows operators to view and aggregate the logs from the container.',
      NagMessageLevel.ERROR,
      awsSolutionsEcs7,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-ELB1',
      'The CLB is used for incoming HTTP/HTTPS traffic. Use ALBs instead.',
      'HTTP/HTTPS applications (monolithic or containerized) should use the ALB instead of The CLB for enhanced incoming traffic distribution, better performance and lower costs.',
      NagMessageLevel.ERROR,
      awsSolutionsElb1,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-ELB2a',
      'The ALB does not have access logs enabled.',
      'Access logs allow operators to to analyze traffic patterns and identify and troubleshoot security issues.',
      NagMessageLevel.ERROR,
      awsSolutionsElb2a,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-ELB2e',
      'The CLB does not have access logs enabled.',
      'Access logs allow operators to to analyze traffic patterns and identify and troubleshoot security issues.',
      NagMessageLevel.ERROR,
      awsSolutionsElb2e,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-ELB3',
      'The CLB does not have connection draining enabled.',
      'With Connection Draining feature enabled, if an EC2 backend instance fails health checks The CLB will not send any new requests to the unhealthy instance. However, it will still allow existing (in-flight) requests to complete for the duration of the configured timeout.',
      NagMessageLevel.ERROR,
      awsSolutionsElb3,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-ELB4',
      'The CLB does not use at least two AZs with the Cross-Zone Load Balancing feature enabled.',
      'CLBs can distribute the traffic evenly across all backend instances. To use Cross-Zone Load Balancing at optimal level, the system should maintain an equal EC2 capacity distribution in each of the AZs registered with the load balancer.',
      NagMessageLevel.ERROR,
      awsSolutionsElb4,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-ELB5',
      'The CLB listener is not configured for secure (HTTPs or SSL) protocols for client communication.',
      'The HTTPs or SSL protocols enable secure communication by encrypting the communication between the client and the load balancer.',
      NagMessageLevel.ERROR,
      awsSolutionsElb5,
      ignores,
      node
    );
  }

  /**
   * Check Storage Services
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkStorage(node: CfnResource, ignores: any): void {
    this.applyRule(
      'AwsSolutions-S1',
      'The S3 Bucket has server access logs disabled.',
      'The bucket should have server access logging enabled to provide detailed records for the requests that are made to the bucket.',
      NagMessageLevel.ERROR,
      awsSolutionsS1,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-S2',
      'The S3 Bucket does not have public access restricted and blocked.',
      'The bucket should have public access restricted and blocked to prevent unauthorized access.',
      NagMessageLevel.ERROR,
      awsSolutionsS2,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-S3',
      'The S3 Bucket does not default encryption enabled.',
      'The bucket should minimally have SSE enabled to help protect data-at-rest.',
      NagMessageLevel.ERROR,
      awsSolutionsS3,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-EFS1',
      'The EFS is not configured for encryption at rest.',
      'By using an encrypted file system, data and metadata are automatically encrypted before being written to the file system. Similarly, as data and metadata are read, they are automatically decrypted before being presented to the application. These processes are handled transparently by EFS without requiring modification of applications.',
      NagMessageLevel.ERROR,
      awsSolutionsEfs1,
      ignores,
      node
    );
  }

  /**
   * Check Database Services
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkDatabases(node: CfnResource, ignores: any): void {
    this.applyRule(
      'AwsSolutions-RDS2',
      'The RDS instance or Aurora DB cluster does not have storage encryption enabled.',
      'Storage encryption helps protect data-at-rest by encrypting the underlying storage, automated backups, read replicas, and snapshots for the database.',
      NagMessageLevel.ERROR,
      awsSolutionsRds2,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-RDS6',
      'The RDS Aurora MySQL/PostgresSQL cluster does not have IAM Database Authentication enabled.',
      "With IAM Database Authentication enabled, the system doesn't have to use a password when connecting to the MySQL/PostgreSQL database instances, instead it uses an authentication token.",
      NagMessageLevel.ERROR,
      awsSolutionsRds6,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-RDS10',
      'The RDS instance or Aurora DB cluster does not have deletion protection enabled.',
      'The deletion protection feature helps protect the database from being accidentally deleted.',
      NagMessageLevel.ERROR,
      awsSolutionsRds10,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-RDS11',
      'The RDS instance or Aurora DB cluster uses the default endpoint port.',
      'Port obfuscation (using a non default endpoint port) adds an additional layer of defense against non-targeted attacks (i.e. MySQL/Aurora port 3306, SQL Server port 1433, PostgreSQL port 5432, etc).',
      NagMessageLevel.ERROR,
      awsSolutionsRds11,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-RDS13',
      'The RDS instance is not configured for automated backups.',
      'Automated backups allow for point-in-time recovery.',
      NagMessageLevel.ERROR,
      awsSolutionsRds13,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-RDS14',
      'The RDS Aurora MySQL cluster does not have Backtrack enabled.',
      'Backtrack helps order to rewind cluster tables to a specific time, without using backups.',
      NagMessageLevel.ERROR,
      awsSolutionsRds14,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-RDS16',
      'The RDS Aurora MySQL serverless cluster does not have audit, error, general, and slowquery Log Exports enabled.',
      'This allows operators to use CloudWatch to view logs to help diagnose problems in the database.',
      NagMessageLevel.ERROR,
      awsSolutionsRds16,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-DDB3',
      'The DynamoDB table does not have Point-in-time Recovery enabled.',
      'DynamoDB continuous backups represent an additional layer of insurance against accidental loss of data on top of on-demand backups. The DynamoDB service can back up the data with per-second granularity and restore it to any single second from the time PITR was enabled up to the prior 35 days.',
      NagMessageLevel.WARN,
      awsSolutionsDdb3,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-DDB4',
      'The DAX cluster does not have server-side encryption enabled.',
      'Data in cache, configuration data and log files should be encrypted using Server-Side Encryption in order to protect from unauthorized access to the underlying storage.',
      NagMessageLevel.ERROR,
      awsSolutionsDdb4,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-AEC1',
      'The ElastiCache cluster is not provisioned in a VPC.',
      'Provisioning the cluster within a VPC allows for better flexibility and control over the cache clusters security, availability, traffic routing and more.',
      NagMessageLevel.ERROR,
      awsSolutionsAec1,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-AEC3',
      'The ElastiCache Redis cluster does not have both encryption in transit and at rest enabled.',
      'Encryption in transit helps secure communications to the cluster. Encryption at rest helps protect data at rest from unauthorized access.',
      NagMessageLevel.ERROR,
      awsSolutionsAec3,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-AEC4',
      'The ElastiCache Redis cluster is not deployed in a Multi-AZ configuration.',
      'The cluster should use a Multi-AZ deployment configuration for high availability.',
      NagMessageLevel.ERROR,
      awsSolutionsAec4,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-AEC5',
      'The ElastiCache cluster uses the default endpoint port.',
      'Port obfuscation (using a non default endpoint port) adds an additional layer of defense against non-targeted attacks (i.e. Redis port 6379 and Memcached port 11211).',
      NagMessageLevel.ERROR,
      awsSolutionsAec5,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-AEC6',
      'The ElastiCache Redis cluster does not use Redis AUTH for user authentication.',
      'Redis authentication tokens enable Redis to require a token (password) before allowing clients to execute commands, thereby improving data security.',
      NagMessageLevel.ERROR,
      awsSolutionsAec6,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-N1',
      'The Neptune DB cluster is not deployed in a Multi-AZ configuration.',
      'The cluster should use a Multi-AZ deployment configuration for high availability.',
      NagMessageLevel.ERROR,
      awsSolutionsN1,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-N2',
      'The Neptune DB instance does have Auto Minor Version Upgrade enabled.',
      'The Neptune service regularly releases engine updates. Enabling Auto Minor Version Upgrade will allow the service to automatically apply these upgrades to DB Instances.',
      NagMessageLevel.ERROR,
      awsSolutionsN2,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-N3',
      'The Neptune DB cluster does not have a reasonable minimum backup retention period configured.',
      'The retention period represents the number of days to retain automated snapshots. A minimum retention period of 7 days is recommended but can be adjust to meet system requirements.',
      NagMessageLevel.ERROR,
      awsSolutionsN3,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-N4',
      'The Neptune DB cluster does not have encryption at rest enabled.',
      'Encrypting data-at-rest protects data confidentiality and prevents unauthorized users from accessing sensitive information.',
      NagMessageLevel.ERROR,
      awsSolutionsN4,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-N5',
      'The Neptune DB cluster does not have IAM Database Authentication enabled.',
      "With IAM Database Authentication enabled, the system doesn't have to use a password when connecting to the cluster.",
      NagMessageLevel.ERROR,
      awsSolutionsN5,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-RS1',
      'The Redshift cluster parameter group must have the "require_ssl" parameter enabled.',
      'Enabling the "require_ssl" parameter secures data-in-transit by encrypting the connection between the clients and the Redshift clusters.',
      NagMessageLevel.ERROR,
      awsSolutionsRs1,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-RS2',
      'The Redshift cluster is not provisioned in a VPC.',
      'Provisioning the cluster within a VPC allows for better flexibility and control over the Redshift clusters security, availability, traffic routing and more.',
      NagMessageLevel.ERROR,
      awsSolutionsRs2,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-RS3',
      'The Redshift cluster uses the default "awsuser" username.',
      'Using a custom master user name instead of the default master user name (i.e. "awsuser") provides an additional layer of defense against non-targeted attacks.',
      NagMessageLevel.ERROR,
      awsSolutionsRs3,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-RS4',
      'The Redshift cluster uses the default endpoint port.',
      'Port obfuscation (using a non default endpoint port) adds an additional layer of defense against non-targeted attacks (i.e. Redshift port 5439).',
      NagMessageLevel.ERROR,
      awsSolutionsRs4,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-RS5',
      'The Redshift cluster does not have audit logging enabled.',
      'Audit logging helps operators troubleshoot issues and ensure security.',
      NagMessageLevel.ERROR,
      awsSolutionsRs5,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-RS6',
      'The Redshift cluster does not have encryption at rest enabled.',
      'Encrypting data-at-rest protects data confidentiality.',
      NagMessageLevel.ERROR,
      awsSolutionsRs6,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-RS8',
      'The Redshift cluster is publicly accessible.',
      'Disabling public accessibility helps minimize security risks.',
      NagMessageLevel.ERROR,
      awsSolutionsRs8,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-RS9',
      'The Redshift cluster does not have version upgrade enabled.',
      'Version Upgrade must enabled to enable the cluster to automatically receive upgrades during the maintenance window.',
      NagMessageLevel.ERROR,
      awsSolutionsRs9,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-RS10',
      'The Redshift cluster does not have a retention period for automated snapshots configured.',
      'The retention period represents the number of days to retain automated snapshots. A positive retention period should be set to configure this feature.',
      NagMessageLevel.ERROR,
      awsSolutionsRs10,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-DOC1',
      'The Document DB cluster does not have encryption at rest enabled.',
      'Encrypting data-at-rest protects data confidentiality and prevents unauthorized users from accessing sensitive information.',
      NagMessageLevel.ERROR,
      awsSolutionsDoc1,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-DOC2',
      'The Document DB cluster uses the default endpoint port.',
      'Port obfuscation (using a non default endpoint port) adds an additional layer of defense against non-targeted attacks (i.e. MongoDB port 27017).',
      NagMessageLevel.ERROR,
      awsSolutionsDoc2,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-DOC3',
      'The Document DB cluster does not have the username and password stored in Secrets Manager.',
      "Secrets Manager enables operators to replace hardcoded credentials in your code, including passwords, with an API call to Secrets Manager to retrieve the secret programmatically. This helps ensure the secret can't be compromised by someone examining system code, because the secret no longer exists in the code. Also, operators can configure Secrets Manager to automatically rotate the secret for you according to a specified schedule. This enables you to replace long-term secrets with short-term ones, significantly reducing the risk of compromise.",
      NagMessageLevel.ERROR,
      awsSolutionsDoc3,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-DOC4',
      'The Document DB cluster does not have a reasonable minimum backup retention period configured.',
      'The retention period represents the number of days to retain automated snapshots. A minimum retention period of 7 days is recommended but can be adjust to meet system requirements.',
      NagMessageLevel.ERROR,
      awsSolutionsDoc4,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-DOC5',
      'The Document DB cluster does not have authenticate, createIndex, and dropCollection Log Exports enabled.',
      'This allows operators to use CloudWatch to view logs to help diagnose problems in the database. The events recorded by the AWS DocumentDB audit logs include successful and failed authentication attempts, creating indexes or dropping a collection in a database within the DocumentDB cluster.',
      NagMessageLevel.ERROR,
      awsSolutionsDoc5,
      ignores,
      node
    );
  }

  /**
   * Check Network and Delivery Services
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkNetworkDelivery(node: CfnResource, ignores: any): void {
    this.applyRule(
      'AwsSolutions-VPC3',
      'A Network ACL or Network ACL entry has been implemented.',
      'Network ACLs should be used sparingly for the following reasons: they can be complex to manage, they are stateless, every IP address must be explicitly opened in each (inbound/outbound) direction, and they affect a complete subnet. Use security groups when possible as they are stateful and easier to manage.',
      NagMessageLevel.WARN,
      awsSolutionsVpc3,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-CFR1',
      'The CloudFront distribution may require Geo restrictions.',
      'Geo restriction may need to be enabled for the distribution in order to allow or deny a country in order to allow or restrict users in specific locations from accessing content.',
      NagMessageLevel.WARN,
      awsSolutionsCfr1,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-CFR2',
      'The CloudFront distribution may require integration with AWS WAF.',
      'The Web Application Firewall can help protect against application-layer attacks that can compromise the security of the system or place unnecessary load on them.',
      NagMessageLevel.WARN,
      awsSolutionsCfr2,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-CFR3',
      'The CloudFront distributions does not have access logging enabled.',
      'Enabling access logs helps operators track all viewer requests for the content delivered through the Content Delivery Network.',
      NagMessageLevel.ERROR,
      awsSolutionsCfr3,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-CFR5',
      'The CloudFront distributions uses SSLv3 or TLSv1 for communication to the origin.',
      'Vulnerabilities have been and continue to be discovered in the deprecated SSL and TLS protocols. Using a security policy with minimum TLSv1.1 or TLSv1.2 and appropriate security ciphers for HTTPS helps protect viewer connections.',
      NagMessageLevel.ERROR,
      awsSolutionsCfr5,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-CFR6',
      'The CloudFront distribution does not use an origin access identity an S3 origin.',
      'Origin access identities help with security by restricting any direct access to objects through S3 URLs.',
      NagMessageLevel.ERROR,
      awsSolutionsCfr6,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-APIG1',
      'The API does not have access logging enabled.',
      'Enabling access logs helps operators view who accessed an API and how the caller accessed the API.',
      NagMessageLevel.ERROR,
      awsSolutionsApig1,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-APIG4',
      'The API does not implement authorization.',
      'In most cases an API needs to have an authentication and authorization implementation strategy. This includes using such approaches as IAM, Cognito User Pools, Custom authorizer, etc.',
      NagMessageLevel.ERROR,
      awsSolutionsApig4,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-APIG6',
      'The REST API Stage does not have CloudWatch logging enabled for all methods.',
      'Enabling CloudWatch logs at the stage level helps operators to track and analyze execution behavior at the API stage level.',
      NagMessageLevel.ERROR,
      awsSolutionsApig6,
      ignores,
      node
    );
  }

  /**
   * Check Management and Governance Services
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkManagementGovernance(node: CfnResource, ignores: any): void {
    this.applyRule(
      'AwsSolutions-AS1',
      'The Auto Scaling Group does not have a cooldown period.',
      'A cooldown period temporarily suspends any scaling activities in order to allow the newly launched EC2 instance(s) some time to start handling the application traffic.',
      NagMessageLevel.ERROR,
      awsSolutionsAs1,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-AS2',
      'The Auto Scaling Group does not have properly configured health checks.',
      'The health check feature enables the service to detect whether its registered EC2 instances are healthy or not.',
      NagMessageLevel.ERROR,
      awsSolutionsAs2,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-AS3',
      'The Auto Scaling Group does not have notifications configured for all scaling events.',
      'Notifications on EC2 instance launch, launch error, termination, and termination errors allow operators to gain better insights into systems attributes such as activity and health.',
      NagMessageLevel.ERROR,
      awsSolutionsAs3,
      ignores,
      node
    );
  }

  /**
   * Check Machine Learning Services
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkMachineLearning(node: CfnResource, ignores: any): void {
    this.applyRule(
      'AwsSolutions-SM1',
      'The SageMaker notebook instance is not provisioned inside a VPC.',
      'Provisioning the notebook instances inside a VPC enables the notebook to access VPC-only resources such as EFS file systems.',
      NagMessageLevel.ERROR,
      awsSolutionsSm1,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-SM2',
      'The SageMaker notebook instance does not have an encrypted storage volume.',
      'Encrypting storage volumes helps protect SageMaker data-at-rest.',
      NagMessageLevel.ERROR,
      awsSolutionsSm2,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-SM3',
      'The SageMaker notebook instance has direct internet access enabled.',
      'Disabling public accessibility helps minimize security risks.',
      NagMessageLevel.ERROR,
      awsSolutionsSm3,
      ignores,
      node
    );
  }

  /**
   * Check Analytics Services
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkAnalytics(node: CfnResource, ignores: any): void {
    this.applyRule(
      'AwsSolutions-ATH1',
      'The Athena workgroup does not encrypt query results.',
      'Encrypting query results stored in S3 helps secure data to meet compliance requirements for data-at-rest encryption.',
      NagMessageLevel.ERROR,
      awsSolutionsAth1,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-EMR2',
      'The EMR cluster does not have S3 logging enabled.',
      'Uploading logs to S3 enables the system to keep the logging data for historical purposes or to track and analyze the clusters behavior.',
      NagMessageLevel.ERROR,
      awsSolutionsEmr2,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-EMR6',
      'The EMR cluster does not implement authentication via an EC2 Key Pair or Kerberos.',
      'SSH clients can use an EC2 key pair to authenticate to cluster instances. Alternatively, with EMR release version 5.10.0 or later, solutions can configure Kerberos to authenticate users and SSH connections to the master node.',
      NagMessageLevel.ERROR,
      awsSolutionsEmr6,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-KDA3',
      'The Kinesis Data Analytics Flink Application does not have checkpointing enabled.',
      'Checkpoints are backups of application state that KDA automatically creates periodically and uses to restore from faults.',
      NagMessageLevel.WARN,
      awsSolutionsKda3,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-KDS1',
      'The Kinesis Data Stream does not has server-side encryption enabled.',
      "Data is encrypted before it's written to the Kinesis stream storage layer, and decrypted after it’s retrieved from storage. This allows the system to meet strict regulatory requirements and enhance the security of system data.",
      NagMessageLevel.ERROR,
      awsSolutionsKds1,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-KDF1',
      'The Kinesis Data Firehose delivery stream does have server-side encryption enabled.',
      'This allows the system to meet strict regulatory requirements and enhance the security of system data.',
      NagMessageLevel.ERROR,
      awsSolutionsKdf1,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-MSK2',
      'The MSK cluster uses plaintext communication between clients and brokers.',
      'TLS only communication secures data-in-transit by encrypting the connection between the clients and brokers.',
      NagMessageLevel.ERROR,
      awsSolutionsMsk2,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-MSK3',
      'The MSK cluster uses plaintext communication between brokers.',
      'TLS communication secures data-in-transit by encrypting the connection between brokers.',
      NagMessageLevel.ERROR,
      awsSolutionsMsk3,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-MSK6',
      'The MSK cluster does not send broker logs to a supported destination.',
      'Broker logs enable operators to troubleshoot Apache Kafka applications and to analyze their communications with the MSK cluster. The cluster can deliver logs to the following resources: a CloudWatch log group, an S3 bucket, a Kinesis Data Firehose delivery stream.',
      NagMessageLevel.ERROR,
      awsSolutionsMsk6,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-OS1',
      'The OpenSearch Service domain is not provisioned inside a VPC.',
      'Provisioning the domain within a VPC enables better flexibility and control over the clusters access and security as this feature keeps all traffic between the VPC and OpenSearch domains within the AWS network instead of going over the public Internet.',
      NagMessageLevel.ERROR,
      awsSolutionsOs1,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-OS2',
      'The OpenSearch Service domain does not have node-to-node encryption enabled.',
      'Enabling the node-to-node encryption feature adds an extra layer of data protection on top of the existing ES security features such as HTTPS client to cluster encryption and data-at-rest encryption.',
      NagMessageLevel.ERROR,
      awsSolutionsOs2,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-OS3',
      'The OpenSearch Service domain does not only grant access via allowlisted IP addresses.',
      'Using allowlisted IP addresses helps protect the domain against unauthorized access.',
      NagMessageLevel.ERROR,
      awsSolutionsOs3,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-OS4',
      'The OpenSearch Service domain does not use dedicated master nodes.',
      'Using dedicated master nodes helps improve environmental stability by offloading all the management tasks from the data nodes.',
      NagMessageLevel.ERROR,
      awsSolutionsOs4,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-OS5',
      'The OpenSearch Service domain does not allow for unsigned requests or anonymous access.',
      'Restricting public access helps prevent unauthorized access and prevents any unsigned requests to be made to the resources.',
      NagMessageLevel.ERROR,
      awsSolutionsOs5,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-OS7',
      'The OpenSearch Service domain does not have Zone Awareness enabled.',
      'Enabling cross-zone replication (Zone Awareness) increases the availability of the OpenSearch Service domain by allocating the nodes and replicate the data across two AZs in the same region in order to prevent data loss and minimize downtime in the event of node or AZ failure.',
      NagMessageLevel.ERROR,
      awsSolutionsOs7,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-OS8',
      'The OpenSearch Service domain does not have encryption at rest enabled.',
      'Encrypting data-at-rest protects data confidentiality and prevents unauthorized users from accessing sensitive information.',
      NagMessageLevel.ERROR,
      awsSolutionsOs8,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-OS9',
      'The OpenSearch Service domain does not minimally publish SEARCH_SLOW_LOGS and INDEX_SLOW_LOGS to CloudWatch Logs.',
      'These logs enable operators to gain full insight into the performance of these operations.',
      NagMessageLevel.ERROR,
      awsSolutionsOs9,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-QS1',
      'The Quicksight data sources connection is not configured to use SSL.',
      'SSL secures communications to data sources, especially when using public networks. Using SSL with QuickSight requires the use of certificates signed by a publicly-recognized certificate authority.',
      NagMessageLevel.ERROR,
      awsSolutionsQs1,
      ignores,
      node
    );
  }

  /**
   * Check Security and Compliance Services
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkSecurityCompliance(node: CfnResource, ignores: any): void {
    this.applyRule(
      'AwsSolutions-IAM4',
      'The IAM user, role, or group uses AWS managed policies.',
      'An AWS managed policy is a standalone policy that is created and administered by AWS. Currently, many AWS managed policies do not restrict resource scope. Replace AWS managed policies with system specific (customer) managed policies.',
      NagMessageLevel.ERROR,
      awsSolutionsIam4,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-IAM5',
      'The IAM entity contains wildcard permissions and does not have a cdk_nag rule suppression with evidence for those permission.',
      'Metadata explaining the evidence (e.g. via supporting links) for wildcard permissions allows for transparency to operators.',
      NagMessageLevel.ERROR,
      awsSolutionsIam5,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-COG1',
      'The Cognito user pool does not have a password policy that minimally specify a password length of at least 8 characters, as well as requiring uppercase, numeric, and special characters.',
      'Strong password policies increase system security by encouraging users to create reliable and secure passwords.',
      NagMessageLevel.ERROR,
      awsSolutionsCog1,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-COG2',
      'The Cognito user pool does not require MFA.',
      'Multi-factor authentication (MFA) increases security for the application by adding another authentication method, and not relying solely on user name and password.',
      NagMessageLevel.WARN,
      awsSolutionsCog2,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-COG3',
      'The Cognito user pool does not have AdvancedSecurityMode set to ENFORCED.',
      'Advanced security features enable the system to detect and act upon malicious sign-in attempts.',
      NagMessageLevel.ERROR,
      awsSolutionsCog3,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-COG7',
      'The Cognito identity pool allows for unauthenticated logins and does not have a cdk_nag rule suppression with a reason.',
      'In many cases applications do not warrant unauthenticated guest access applications. Metadata explaining the use case allows for transparency to operators.',
      NagMessageLevel.ERROR,
      awsSolutionsCog7,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-KMS5',
      'The KMS Symmetric key does not have Key Rotation enabled.',
      'KMS Key Rotation allow a system to set an yearly rotation schedule for a KMS key so when a AWS KMS key is required to encrypt new data, the KMS service can automatically use the latest version of the HSA backing key to perform the encryption.',
      NagMessageLevel.ERROR,
      awsSolutionsKms5,
      ignores,
      node
    );
  }

  /**
   * Check Serverless Services
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkServerless(node: CfnResource, ignores: any): void {
    this.applyRule(
      'AwsSolutions-SF1',
      'The Step Function does not log "ALL" events to CloudWatch Logs.',
      'Logging "ALL" events to CloudWatch logs help operators troubleshoot and audit systems.',
      NagMessageLevel.ERROR,
      awsSolutionsSf1,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-SF2',
      'The Step Function does not have X-Ray tracing enabled.',
      'X-ray provides an end-to-end view of how an application is performing. This helps operators to discover performance issues, detect permission problems, and track requests made to and from other AWS services.',
      NagMessageLevel.ERROR,
      awsSolutionsSf2,
      ignores,
      node
    );
  }

  /**
   * Check Application Integration Services
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkApplicationIntegration(node: CfnResource, ignores: any): void {
    this.applyRule(
      'AwsSolutions-SNS2',
      'The SNS Topic does not have server-side encryption enabled.',
      'Server side encryption adds additional protection of sensitive data delivered as messages to subscribers.',
      NagMessageLevel.ERROR,
      awsSolutionsSns2,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-SQS2',
      'The SQS Queue does not have server-side encryption enabled.',
      'Server side encryption adds additional protection of sensitive data delivered as messages to subscribers.',
      NagMessageLevel.ERROR,
      awsSolutionsSqs2,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-SQS3',
      'The SQS queue does not have a dead-letter queue (DLQ) enabled or have a cdk_nag rule suppression indicating it is a DLQ.',
      'Using a DLQ helps maintain the queue flow and avoid losing data by detecting and mitigating failures and service disruptions on time.',
      NagMessageLevel.ERROR,
      awsSolutionsSqs3,
      ignores,
      node
    );
  }

  /**
   * Check Media Services
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkMediaServices(node: CfnResource, ignores: any): void {
    this.applyRule(
      'AwsSolutions-MS1',
      'The MediaStore container does not have container access logging enabled.',
      'The container should have access logging enabled to provide detailed records for the requests that are made to the container.',
      NagMessageLevel.ERROR,
      awsSolutionsMs1,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-MS4',
      'The MediaStore container does not define a metric policy to send metrics to CloudWatch.',
      'Using a combination of MediaStore metrics and CloudWatch alarms helps operators gain better insights into container operations.',
      NagMessageLevel.WARN,
      awsSolutionsMs4,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-MS7',
      'The MediaStore container does not define a container policy.',
      'Using a container policy helps follow the standard security advice of granting least privilege, or granting only the permissions required to allow needed access to the container.',
      NagMessageLevel.WARN,
      awsSolutionsMs7,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-MS8',
      'The MediaStore container does not define a CORS policy.',
      'Using a CORS policy helps follow the standard security advice of granting least privilege, or granting only the permissions required to allow needed access to the container.',
      NagMessageLevel.WARN,
      awsSolutionsMs8,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-MS10',
      'The MediaStore container does not define a lifecycle policy.',
      'Many use cases warrant the usage of lifecycle configurations to manage container objects during their lifetime.',
      NagMessageLevel.WARN,
      awsSolutionsMs10,
      ignores,
      node
    );
  }

  /**
   * Check Developer Tools Services
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkDeveloperTools(node: CfnResource, ignores: any): void {
    this.applyRule(
      'AwsSolutions-CB3',
      'The CodeBuild project has privileged mode enabled.',
      'Privileged grants elevated rights to the system, which introduces additional risk. Privileged mode should only be set to true only if the build project is used to build Docker images. Otherwise, a build that attempts to interact with the Docker daemon fails.',
      NagMessageLevel.WARN,
      awsSolutionsCb3,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-CB4',
      'The CodeBuild project does not use an AWS KMS key for encryption.',
      'Using an AWS KMS key helps follow the standard security advice of granting least privilege to objects generated by the project.',
      NagMessageLevel.ERROR,
      awsSolutionsCb4,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-CB5',
      'The Codebuild project does not use images provided by the CodeBuild service or have a cdk_nag suppression rule explaining the need for a custom image.',
      'Explaining differences/edits to Docker images helps operators better understand system dependencies.',
      NagMessageLevel.WARN,
      awsSolutionsCb5,
      ignores,
      node
    );
    this.applyRule(
      'AwsSolutions-C91',
      'The Cloud9 instance does not use a no-ingress EC2 instance with AWS Systems Manager.',
      'SSM adds an additional layer of protection as it allows operators to control access through IAM permissions and does not require opening inbound ports.',
      NagMessageLevel.ERROR,
      awsSolutionsC91,
      ignores,
      node
    );
  }
}
