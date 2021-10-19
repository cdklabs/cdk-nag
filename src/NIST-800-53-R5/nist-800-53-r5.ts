/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnResource, IConstruct } from '@aws-cdk/core';
import { NagMessageLevel, NagPack } from '../nag-pack';
import {
  nist80053r5APIGWCacheEnabledAndEncrypted,
  nist80053r5APIGWExecutionLoggingEnabled,
  nist80053r5APIGWSSLEnabled,
} from './rules/apigw';
import {
  nist80053r5AutoscalingGroupELBHealthCheckRequired,
  nist80053r5AutoscalingLaunchConfigPublicIpDisabled,
} from './rules/autoscaling';
// import {} from './rules/cloudtrail';
// import {} from './rules/cloudwatch';
// import {} from './rules/codebuild';
// import {} from './rules/dms';
// import {} from './rules/dynamodb';
// import {} from './rules/ec2';
// import {} from './rules/ecs';
// import {} from './rules/efs';
// import {} from './rules/elasticache';
// import {} from './rules/elasticbeanstalk';
// import {} from './rules/elb';
// import {} from './rules/emr';
// import {} from './rules/iam';
// import {} from './rules/lambda';
// import {} from './rules/opensearch';
// import {} from './rules/rds';
// import {} from './rules/redshift';
// import {} from './rules/s3';
// import {} from './rules/sagemaker';
// import {} from './rules/secretsmanager';
// import {} from './rules/sns';
// import {} from './rules/vpc';

/**
 * Check for NIST 800-53 rev 5 compliance.
 * Based on the NIST 800-53 rev 5 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-nist-800-53_rev_5.html
 */
export class NIST80053R5Checks extends NagPack {
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      this.checkAPIGW(node);
      this.checkAutoScaling(node);
      this.checkCloudTrail(node);
      this.checkCloudWatch(node);
      this.checkCodeBuild(node);
      this.checkDMS(node);
      this.checkDynamoDB(node);
      this.checkEC2(node);
      this.checkECS(node);
      this.checkEFS(node);
      this.checkElastiCache(node);
      this.checkElasticBeanstalk(node);
      this.checkELB(node);
      this.checkEMR(node);
      this.checkIAM(node);
      this.checkLambda(node);
      this.checkOpenSearch(node);
      this.checkRDS(node);
      this.checkRedshift(node);
      this.checkS3(node);
      this.checkSageMaker(node);
      this.checkSecretsManager(node);
      this.checkSNS(node);
      this.checkVPC(node);
    }
  }

  /**
   * Check API Gateway Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkAPIGW(node: CfnResource): void {
    this.applyRule({
      ruleId: 'NIST.800.53.R5-APIGWCacheEnabledAndEncrypted',
      info: 'The API Gateway stage does not have caching enabled and encrypted for all methods - (Control IDs: AU-9(3), CP-9d, SC-8(3), SC-8(4), SC-13a, SC-28(1), SI-19(4)).',
      explanation:
        "To help protect data at rest, ensure encryption is enabled for your API Gateway stage's cache. Because sensitive data can be captured for the API method, enable encryption at rest to help protect that data.",
      level: NagMessageLevel.ERROR,
      rule: nist80053r5APIGWCacheEnabledAndEncrypted,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53.R5-APIGWExecutionLoggingEnabled',
      info: 'The API Gateway stage does not have execution logging enabled for all methods - (Control IDs: AC-4(26), AU-2b, AU-3a, AU-3b, AU-3c, AU-3d, AU-3e, AU-3f, AU-6(3), AU-6(4), AU-6(6), AU-6(9), AU-8b, AU-10, AU-12a, AU-12c, AU-12(1), AU-12(2), AU-12(3), AU-12(4), AU-14a, AU-14b, AU-14b, AU-14(3), CA-7b, CM-5(1)(b), IA-3(3)(b), MA-4(1)(a), PM-14a.1, PM-14b, PM-31, SC-7(9)(b), SI-4(17), SI-7(8)).',
      explanation:
        'API Gateway logging displays detailed views of users who accessed the API and the way they accessed the API. This insight enables visibility of user activities.',
      level: NagMessageLevel.ERROR,
      rule: nist80053r5APIGWExecutionLoggingEnabled,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53.R5-APIGWSSLEnabled',
      info: 'The API Gateway REST API stage is not configured with SSL certificates - (Control IDs: AC-4, AC-4(22), AC-17(2), AC-24(1), AU-9(3), CA-9b, IA-5(1)(c), PM-17b, SC-7(4)(b), SC-7(4)(g), SC-8, SC-8(1), SC-8(2), SC-8(3), SC-8(4), SC-8(5), SC-13a, SC-23, SI-1a.2, SI-1a.2, SI-1c.2).',
      explanation:
        'Ensure Amazon API Gateway REST API stages are configured with SSL certificates to allow backend systems to authenticate that requests originate from API Gateway.',
      level: NagMessageLevel.ERROR,
      rule: nist80053r5APIGWSSLEnabled,
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
      ruleId: 'NIST.800.53.R5-AutoscalingGroupELBHealthCheckRequired',
      info: 'The Auto Scaling group (which is associated with a load balancer) does not utilize ELB healthchecks - (Control IDs: AU-12(3), AU-14a, AU-14b, CA-2(2), CA-7, CA-7b, CM-6a, CM-9b, PM-14a.1, PM-14b, PM-31, SC-6, SC-36(1)(a), SI-2a).',
      explanation:
        'The Elastic Load Balancer (ELB) health checks for Amazon Elastic Compute Cloud (Amazon EC2) Auto Scaling groups support maintenance of adequate capacity and availability. The load balancer periodically sends pings, attempts connections, or sends requests to test Amazon EC2 instances health in an auto-scaling group. If an instance is not reporting back, traffic is sent to a new Amazon EC2 instance.',
      level: NagMessageLevel.ERROR,
      rule: nist80053r5AutoscalingGroupELBHealthCheckRequired,
      node: node,
    });
    this.applyRule({
      ruleId: 'NIST.800.53.R5-AutoscalingLaunchConfigPublicIpDisabled',
      info: 'The Auto Scaling launch configuration does not have public IP addresses disabled - (Control IDs: AC-3, AC-4(21), CM-6a, SC-7(3)).',
      explanation:
        'If you configure your Network Interfaces with a public IP address, then the associated resources to those Network Interfaces are reachable from the internet. EC2 resources should not be publicly accessible, as this may allow unintended access to your applications or servers.',
      level: NagMessageLevel.ERROR,
      rule: nist80053r5AutoscalingLaunchConfigPublicIpDisabled,
      node: node,
    });
  }

  /**
   * Check CloudTrail Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkCloudTrail(_node: CfnResource): void {}

  /**
   * Check CloudWatch Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkCloudWatch(_node: CfnResource): void {}

  /**
   * Check CodeBuild Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkCodeBuild(_node: CfnResource): void {}

  /**
   * Check DMS Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkDMS(_node: CfnResource) {}

  /**
   * Check DynamoDB Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkDynamoDB(_node: CfnResource) {}

  /**
   * Check EC2 Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkEC2(_node: CfnResource): void {}

  /**
   * Check ECS Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkECS(_node: CfnResource): void {}

  /**
   * Check EFS Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkEFS(_node: CfnResource) {}

  /**
   * Check ElastiCache Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkElastiCache(_node: CfnResource) {}

  /**
   * Check Elastic Beanstalk Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkElasticBeanstalk(_node: CfnResource): void {}

  /**
   * Check Elastic Load Balancer Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkELB(_node: CfnResource): void {}

  /**
   * Check EMR Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkEMR(_node: CfnResource) {}

  /**
   * Check IAM Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkIAM(_node: CfnResource): void {}

  /**
   * Check Lambda Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkLambda(_node: CfnResource) {}

  /**
   * Check OpenSearch Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkOpenSearch(_node: CfnResource) {}

  /**
   * Check RDS Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkRDS(_node: CfnResource): void {}

  /**
   * Check Redshift Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkRedshift(_node: CfnResource): void {}

  /**
   * Check Amazon S3 Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkS3(_node: CfnResource): void {}

  /**
   * Check SageMaker Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkSageMaker(_node: CfnResource) {}

  /**
   * Check Secrets Manager Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkSecretsManager(_node: CfnResource): void {}

  /**
   * Check Amazon SNS Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkSNS(_node: CfnResource): void {}

  /**
   * Check VPC Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkVPC(_node: CfnResource): void {}
}
