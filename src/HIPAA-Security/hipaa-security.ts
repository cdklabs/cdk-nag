/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnResource, IConstruct } from '@aws-cdk/core';
import { NagPack } from '../common';

/**
 * Check for HIPAA Security compliance.
 * Based on the HIPAA Security AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-hipaa_security.html
 */
export class HIPAASecurityChecks extends NagPack {
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      // Get ignores metadata if it exists
      // const ignores = node.getMetadata('cdk_nag')?.rules_to_suppress;
      // this.checkAPIGW(node, ignores);
      // this.checkAutoScaling(node, ignores);
      // this.checkCloudTrail(node, ignores);
      // this.checkCloudWatch(node, ignores);
      // this.checkCodeBuild(node, ignores);
      // this.checkDMS(node, ignores);
      // this.checkDynamoDB(node, ignores);
      // this.checkEC2(node, ignores);
      // this.checkECS(node, ignores);
      // this.checkEFS(node, ignores);
      // this.checkElastiCache(node, ignores);
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

  //   /**
  //    * Check API Gateway Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkAPIGW(node: CfnResource, ignores: any): void {}

  //   /**
  //    * Check Auto Scaling Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkAutoScaling(node: CfnResource, ignores: any): void {}

  //   /**
  //    * Check CloudTrail Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkCloudTrail(node: CfnResource, ignores: any): void {}

  //   /**
  //    * Check CloudWatch Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkCloudWatch(node: CfnResource, ignores: any): void {}

  //   /**
  //    * Check CodeBuild Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkCodeBuild(node: CfnResource, ignores: any): void {}

  //   /**
  //    * Check DMS Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkDMS(node: CfnResource, ignores: any): void {}

  //   /**
  //    * Check DynamoDB Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkDynamoDB(node: CfnResource, ignores: any): void {}

  //   /**
  //    * Check EC2 Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkEC2(node: CfnResource, ignores: any): void {}

  //   /**
  //    * Check ECS Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkECS(node: CfnResource, ignores: any): void {}

  //   /**
  //    * Check EFS Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkEFS(node: CfnResource, ignores: any): void {}

  //   /**
  //    * Check ElastiCache Resources
  //    * @param node the IConstruct to evaluate
  //    * @param ignores list of ignores for the resource
  //    */
  //   private checkElastiCache(node: CfnResource, ignores: any): void {}

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
