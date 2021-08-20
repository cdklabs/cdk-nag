/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { Annotations, CfnResource, IConstruct } from '@aws-cdk/core';
import { NagPack } from '../common';
import {
  hipaaSecurityCloudTrailCloudWatchLogsEnabled,
  hipaaSecurityCloudTrailEncryptionEnabled,
  hipaaSecurityCloudTrailLogFileValidationEnabled,
} from './rules/cloudtrail/index';

/**
 * Check for HIPAA Security compliance.
 * Based on the HIPAA Security AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-hipaa_security.html
 */
export class HIPAASecurityChecks extends NagPack {
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      // Get ignores metadata if it exists
      const ignores = node.getMetadata('cdk_nag')?.rules_to_suppress;
      // this.checkAPIGW(node, ignores);
      // this.checkAutoScaling(node, ignores);
      this.checkCloudTrail(node, ignores);
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
