/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { Annotations, CfnResource, IConstruct } from '@aws-cdk/core';
import { NagPack } from '../common';
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
} from './rules/cloudwatch';
import {
  hipaaSecurityCodeBuildProjectEnvVarAwsCred,
  hipaaSecurityCodeBuildProjectSourceRepoUrl,
} from './rules/codebuild';
import { hipaaSecurityDMSReplicationNotPublic } from './rules/dms';
import { hipaaSecurityDynamoDBPITREnabled } from './rules/dynamodb';
import {
  hipaaSecurityEC2InstanceDetailedMonitoringEnabled,
  hipaaSecurityEC2InstancesInVPC,
  hipaaSecurityEC2InstanceNoPublicIp,
} from './rules/ec2';
import { hipaaSecurityECSTaskDefinitionUserForHostMode } from './rules/ecs';
import { hipaaSecurityEFSEncrypted } from './rules/efs';
import { hipaaSecurityElastiCacheRedisClusterAutomaticBackup } from './rules/elasticache';

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
      this.checkCodeBuild(node, ignores);
      this.checkCloudWatch(node, ignores);
      // this.checkCodeBuild(node, ignores);
      this.checkDMS(node, ignores);
      this.checkDynamoDB(node, ignores);
      this.checkEC2(node, ignores);
      this.checkECS(node, ignores);
      this.checkEFS(node, ignores);
      this.checkElastiCache(node, ignores);
      // this.checkElasticBeanstalk(node, ignores);
      // this.checkElasticsearch(node, ignores);
      // this.checkELB(node, ignores);
      // this.checkEMR(node, ignores);
      // this.checkIAM(node, ignores);
      // this.checkLambda(node, ignores);
      // this.checkRDS(node, ignores);
      // this.checkRedshift(node, ignores);
      // this.checkS3(node, ignores);
      // this.checkSageMaker(node, ignores);
      // this.checkSecretsManager(node, ignores);
      // this.checkSNS(node, ignores);
      // this.checkVPC(node, ignores);
    }
  }

  /**
   * Check API Gateway Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkAPIGW(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(
        ignores,
        'HIPAA.Security-APIGWCacheEnabledAndEncrypted'
      ) &&
      !hipaaSecurityAPIGWCacheEnabledAndEncrypted(node)
    ) {
      const ruleId = 'HIPAA.Security-APIGWCacheEnabledAndEncrypted';
      const info =
        'The API Gateway stage does not have caching enabled and encrypted for all methods - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).';
      const explanation =
        "To help protect data at rest, ensure encryption is enabled for your API Gateway stage's cache. Because sensitive data can be captured for the API method, enable encryption at rest to help protect that data.";
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(
        ignores,
        'HIPAA.Security-APIGWExecutionLoggingEnabled'
      ) &&
      !hipaaSecurityAPIGWExecutionLoggingEnabled(node)
    ) {
      const ruleId = 'HIPAA.Security-APIGWExecutionLoggingEnabled';
      const info =
        'The API Gateway stage does not have execution logging enabled for all methods - (Control ID: 164.312(b)).';
      const explanation =
        'API Gateway logging displays detailed views of users who accessed the API and the way they accessed the API. This insight enables visibility of user activities.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'HIPAA.Security-APIGWSSLEnabled') &&
      !hipaaSecurityAPIGWSSLEnabled(node)
    ) {
      const ruleId = 'HIPAA.Security-APIGWSSLEnabled';
      const info =
        'The API Gateway REST API stage is not configured with SSL certificates - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(1), 164.312(e)(2)(i), 164.312(e)(2)(ii)).';
      const explanation =
        'Ensure Amazon API Gateway REST API stages are configured with SSL certificates to allow backend systems to authenticate that requests originate from API Gateway.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'HIPAA.Security-APIGWXrayEnabled') &&
      !hipaaSecurityAPIGWXrayEnabled(node)
    ) {
      const ruleId = 'HIPAA.Security-APIGWXrayEnabled';
      const info =
        'The API Gateway REST API stage does not have X-Ray enabled - (Control ID: 164.312(b)).';
      const explanation =
        'AWS X-Ray collects data about requests that your application serves, and provides tools you can use to view, filter, and gain insights into that data to identify issues and opportunities for optimization. Ensure X-Ray is enables so you can see detailed information not only about the request and response, but also about calls that your application makes to downstream AWS resources, microservices, databases and HTTP web APIs.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check Auto Scaling Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkAutoScaling(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(
        ignores,
        'HIPAA.Security-AutoscalingGroupELBHealthCheckRequired'
      ) &&
      !hipaaSecurityAutoscalingGroupELBHealthCheckRequired(node)
    ) {
      const ruleId = 'HIPAA.Security-AutoscalingGroupELBHealthCheckRequired';
      const info =
        'The Auto Scaling group utilizes a load balancer and does not have an ELB health check configured - (Control ID: 164.312(b)).';
      const explanation =
        'The Elastic Load Balancer (ELB) health checks for Amazon Elastic Compute Cloud (Amazon EC2) Auto Scaling groups support maintenance of adequate capacity and availability. The load balancer periodically sends pings, attempts connections, or sends requests to test Amazon EC2 instances health in an auto-scaling group. If an instance is not reporting back, traffic is sent to a new Amazon EC2 instance.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(
        ignores,
        'HIPAA.Security-AutoscalingLaunchConfigPublicIpDisabled'
      ) &&
      !hipaaSecurityAutoscalingLaunchConfigPublicIpDisabled(node)
    ) {
      const ruleId = 'HIPAA.Security-AutoscalingLaunchConfigPublicIpDisabled';
      const info =
        'The Auto Scaling launch configuration does not have public IP addresses disabled - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(B), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).';
      const explanation =
        'If you configure your Network Interfaces with a public IP address, then the associated resources to those Network Interfaces are reachable from the internet. EC2 resources should not be publicly accessible, as this may allow unintended access to your applications or servers.';
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
        'HIPAA.Security-CloudTrailCloudWatchLogsEnabled'
      ) &&
      !hipaaSecurityCloudTrailCloudWatchLogsEnabled(node)
    ) {
      const ruleId = 'HIPAA.Security-CloudTrailCloudWatchLogsEnabled';
      const info =
        'The trail does not have CloudWatch logs enabled - (Control IDs: 164.308(a)(3)(ii)(A), 164.312(b)).';
      const explanation =
        'Use Amazon CloudWatch to centrally collect and manage log event activity. Inclusion of AWS CloudTrail data provides details of API call activity within your AWS account.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'HIPAA.Security-CloudTrailEncryptionEnabled') &&
      !hipaaSecurityCloudTrailEncryptionEnabled(node)
    ) {
      const ruleId = 'HIPAA.Security-CloudTrailEncryptionEnabled';
      const info =
        'The trail does not have a KMS key ID or have encryption enabled - (Control ID: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).';
      const explanation =
        'Because sensitive data may exist and to help protect data at rest, ensure encryption is enabled for your AWS CloudTrail trails.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(
        ignores,
        'HIPAA.Security-CloudTrailLogFileValidationEnabled'
      ) &&
      !hipaaSecurityCloudTrailLogFileValidationEnabled(node)
    ) {
      const ruleId = 'HIPAA.Security-CloudTrailLogFileValidationEnabled';
      const info =
        'The trail does not have log file validation enabled - (Control ID: 164.312(c)(1), 164.312(c)(2)).';
      const explanation =
        'Utilize AWS CloudTrail log file validation to check the integrity of CloudTrail logs. Log file validation helps determine if a log file was modified or deleted or unchanged after CloudTrail delivered it. This feature is built using industry standard algorithms: SHA-256 for hashing and SHA-256 with RSA for digital signing. This makes it computationally infeasible to modify, delete or forge CloudTrail log files without detection.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check CloudWatch Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkCloudWatch(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'HIPAA.Security-CloudWatchAlarmAction') &&
      !hipaaSecurityCloudWatchAlarmAction(node)
    ) {
      const ruleId = 'HIPAA.Security-CloudWatchAlarmAction';
      const info =
        'The CloudWatch alarm does not have at least one alarm action, one INSUFFICIENT_DATA action, or one OK action enabled - (Control ID: 164.312(b)).';
      const explanation =
        'Amazon CloudWatch alarms alert when a metric breaches the threshold for a specified number of evaluation periods. The alarm performs one or more actions based on the value of the metric or expression relative to a threshold over a number of time periods.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'HIPAA.Security-CloudWatchLogGroupEncrypted') &&
      !hipaaSecurityCloudWatchLogGroupEncrypted(node)
    ) {
      const ruleId = 'HIPAA.Security-CloudWatchLogGroupEncrypted';
      const info =
        'The CloudWatch Log Group is not encrypted with an AWS KMS key - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).';
      const explanation =
        'To help protect sensitive data at rest, ensure encryption is enabled for your Amazon CloudWatch Log Groups.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check CodeBuild Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkCodeBuild(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(
        ignores,
        'HIPAA.Security-CodeBuildProjectEnvVarAwsCred'
      ) &&
      !hipaaSecurityCodeBuildProjectEnvVarAwsCred(node)
    ) {
      const ruleId = 'HIPAA.Security-CodeBuildProjectEnvVarAwsCred';
      const info =
        'The CodeBuild environment stores sensitive credentials (such as AWS_ACCESS_KEY_ID and/or AWS_SECRET_ACCESS_KEY) as plaintext environment variables - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1)).';
      const explanation =
        'Do not store these variables in clear text. Storing these variables in clear text leads to unintended data exposure and unauthorized access.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(
        ignores,
        'HIPAA.Security-CodeBuildProjectSourceRepoUrl'
      ) &&
      !hipaaSecurityCodeBuildProjectSourceRepoUrl(node)
    ) {
      const ruleId = 'HIPAA.Security-CodeBuildProjectSourceRepoUrl';
      const info =
        'The CodeBuild project which utilizes either a GitHub or BitBucket source repository does not utilize OAUTH - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1)).';
      const explanation =
        'OAUTH is the most secure method of authenticating your CodeBuild application. Use OAuth instead of personal access tokens or a user name and password to grant authorization for accessing GitHub or Bitbucket repositories.';
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
      !this.ignoreRule(ignores, 'HIPAA.Security-DMSReplicationNotPublic') &&
      !hipaaSecurityDMSReplicationNotPublic(node)
    ) {
      const ruleId = 'HIPAA.Security-DMSReplicationNotPublic';
      const info =
        'The DMS replication instance is public - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).';
      const explanation =
        'DMS replication instances can contain sensitive information and access control is required for such accounts.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check DynamoDB Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkDynamoDB(node: CfnResource, ignores: any) {
    if (
      !this.ignoreRule(ignores, 'HIPAA.Security-DynamoDBPITREnabled') &&
      !hipaaSecurityDynamoDBPITREnabled(node)
    ) {
      const ruleId = 'HIPAA.Security-DynamoDBPITREnabled';
      const info =
        'The DynamoDB table does not have Point-in-time Recovery enabled - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B)).';
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
      !this.ignoreRule(
        ignores,
        'HIPAA.Security-EC2InstanceDetailedMonitoringEnabled'
      ) &&
      !hipaaSecurityEC2InstanceDetailedMonitoringEnabled(node)
    ) {
      const ruleId = 'HIPAA.Security-EC2InstanceDetailedMonitoringEnabled';
      const info =
        'The EC2 instance does not have detailed monitoring enabled - (Control IDs: 164.312(b)).';
      const explanation =
        'Detailed monitoring provides additional monitoring information (such as 1-minute period graphs) on the AWS console.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'HIPAA.Security-EC2InstancesInVPC') &&
      !hipaaSecurityEC2InstancesInVPC(node)
    ) {
      const ruleId = 'HIPAA.Security-EC2InstancesInVPC';
      const info =
        'The EC2 instance is not within a VPC - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).';
      const explanation =
        'Because of their logical isolation, domains that reside within an Amazon VPC have an extra layer of security when compared to domains that use public endpoints.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
    if (
      !this.ignoreRule(ignores, 'HIPAA.Security-EC2CheckNoPublicIPs') &&
      !hipaaSecurityEC2InstanceNoPublicIp(node)
    ) {
      const ruleId = 'HIPAA.Security-EC2CheckNoPublicIPs';
      const info =
        'The EC2 instance is associated with a public IP address - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1)).';
      const explanation =
        'Amazon EC2 instances can contain sensitive information and access control is required for such resources.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check ECS Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkECS(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(
        ignores,
        'HIPAA.Security-ECSTaskDefinitionUserForHostMode'
      ) &&
      !hipaaSecurityECSTaskDefinitionUserForHostMode(node)
    ) {
      const ruleId = 'HIPAA.Security-ECSTaskDefinitionUserForHostMode';
      const info =
        "The ECS task definition is configured for host networking and has at least one container with definitions with 'privileged' set to false or empty or 'user' set to root or empty - (Control IDs: 164.308(a)(3)(i), 164.308(a)(3)(ii)(A), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1)).";
      const explanation =
        'If a task definition has elevated privileges it is because you have specifically opted-in to those configurations. This rule checks for unexpected privilege escalation when a task definition has host networking enabled but the customer has not opted-in to elevated privileges.';
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
      !this.ignoreRule(ignores, 'HIPAA.Security-EFSEncrypted') &&
      !hipaaSecurityEFSEncrypted(node)
    ) {
      const ruleId = 'HIPAA.Security-EFSEncrypted';
      const info =
        'The EFS does not have encryption at rest enabled - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii)).';
      const explanation =
        'Because sensitive data can exist and to help protect data at rest, ensure encryption is enabled for your Amazon Elastic File System (EFS).';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  /**
   * Check ElastiCache Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkElastiCache(node: CfnResource, ignores: any) {
    if (
      !this.ignoreRule(
        ignores,
        'HIPAA.Security-ElasticacheRedisClusterAutomaticBackup'
      ) &&
      !hipaaSecurityElastiCacheRedisClusterAutomaticBackup(node)
    ) {
      const ruleId = 'HIPAA.Security-ElasticacheRedisClusterAutomaticBackup';
      const info =
        'The ElastiCache Redis cluster does not retain automatic backups for at least 15 days - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(A), 164.308(a)(7)(ii)(B)).';
      const explanation =
        'Automatic backups can help guard against data loss. If a failure occurs, you can create a new cluster, which restores your data from the most recent backup.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation)
      );
    }
  }

  //   /**
  //    * Check Elastic Beanstalk Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkElasticBeanstalk(node: CfnResource, ignores: any): void {}

  //   /**
  //    * Check Elasticsearch Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkElasticsearch(node: CfnResource, ignores: any): void {}

  //   /**
  //    * Check ELB Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkELB(node: CfnResource, ignores: any): void {}

  //   /**
  //    * Check EMR Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkEMR(node: CfnResource, ignores: any): void {}

  //   /**
  //    * Check IAM Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkIAM(node: CfnResource, ignores: any): void {}

  //   /**
  //    * Check Lambda Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkLambda(node: CfnResource, ignores: any): void {}

  //   /**
  //    * Check RDS Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkRDS(node: CfnResource, ignores: any): void {}

  //   /**
  //    * Check Redshift Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkRedshift(node: CfnResource, ignores: any): void {}

  //   /**
  //    * Check S3 Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkS3(node: CfnResource, ignores: any): void {}

  //   /**
  //    * Check SageMaker Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkSageMaker(node: CfnResource, ignores: any): void {}

  //   /**
  //    * Check Secrets Manager Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkSecretsManager(node: CfnResource, ignores: any): void {}

  //   /**
  //    * Check SNS Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkSNS(node: CfnResource, ignores: any): void {}

  //   /**
  //    * Check VPC Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkVPC(node: CfnResource, ignores: any): void {}
}
