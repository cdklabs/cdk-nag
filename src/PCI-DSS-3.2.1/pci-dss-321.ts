/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnResource, IConstruct } from '@aws-cdk/core';
import { NagPack } from '../nag-pack';
// import {} from './rules/apigw';
// import {} from './rules/autoscaling';
// import {} from './rules/cloudtrail';
// import {} from './rules/cloudwatch';
// import {} from './rules/dms';
// import {} from './rules/ec2';
// import {} from './rules/ecs';
// import {} from './rules/efs';
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
 * Check for PCI DSS 3.2.1 compliance.
 * Based on the PCI DSS 3.2.1 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-pci-dss.html
 */
export class PCIDSS321Checks extends NagPack {
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      this.checkAPIGW(node);
      this.checkAutoScaling(node);
      this.checkCloudTrail(node);
      this.checkCloudWatch(node);
      this.checkDMS(node);
      this.checkEC2(node);
      this.checkECS(node);
      this.checkEFS(node);
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
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkAPIGW(_node: CfnResource): void {}

  /**
   * Check Auto Scaling Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkAutoScaling(_node: CfnResource): void {}

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
   * Check DMS Resources
   * @param _node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkDMS(_node: CfnResource) {}

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
