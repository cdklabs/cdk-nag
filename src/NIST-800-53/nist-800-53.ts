/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { Annotations, CfnResource, IConstruct } from '@aws-cdk/core';
import { NagPack } from '../common';

import {
  nist80053AutoscalingHealthChecks,
} from './rules/autoscaling';
import {
  nist80053CodebuildCheckEnvVars,
  nist80053CodebuildURLCheck,
} from './rules/codebuild';
import {
  nist80053EC2CheckDetailedMonitoring,
  nist80053EC2CheckInsideVPC,
  nist80053EC2CheckNoPublicIPs,
  nist80053EC2CheckSSHRestricted,
  nist80053EC2CheckCommonPortsRestricted,
  nist80053EC2CheckDefaultSecurityGroupClosed,
  nist80053EC2CheckVPCSecurityGroupsAllowAuthPorts,
  nist80053EC2CheckVolumesEncrypted,
} from './rules/ec2';
import {
  nist80053EFSEncrypted,
} from './rules/efs';
import {
  nist80053ElasticSearchRunningWithinVPC,
  nist80053ElasticSearchEncryptedAtRest,
  nist80053ElasticSearchNodeToNodeEncrypted,
} from './rules/elasticsearch';
import {
  nist80053ELBCrossZoneBalancing,
  nist80053ELBDeletionProtectionEnabled,
  nist80053ELBListenersUseSSLOrHTTPS,
  nist80053ELBUseACMCerts,
} from './rules/elb';
import {
  nist80053IamGroupMembership,
  nist80053IamNoInlinePolicy,
  nist80053IamPolicyNoStatementsWithAdminAccess,
  nist80053IamUserNoPolicies,
} from './rules/iam';
import {
  nist80053LambdaFunctionsInsideVPC,
} from './rules/lambda';
import {
  nist80053SagemakerDirectInternetAccessDisabled,
  nist80053SagemakerEndpointKMS,
  nist80053SagemakerNotebookKMS,
} from './rules/sagemaker';

/**
 * Check for NIST 800-53 compliance.
 * Based on the NIST 800-53 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-nist-800-53_rev_4.html
 */
export class NIST80053Checks extends NagPack {
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      // Get ignores metadata if it exists
      const ignores = node.getMetadata('cdk_nag')?.rules_to_suppress;
      this.checkEC2(node, ignores);
      this.checkAutoscaling(node, ignores);
      this.checkElasticsearch(node, ignores);
      this.checkCodebuild(node, ignores);
      this.checkELB(node, ignores);
      this.checkLambda(node, ignores);
      this.checkSagemaker(node, ignores);
      this.checkIAM(node, ignores);
      this.checkEFS(node, ignores);
    }
  }

  /**
   * Check EC2 Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkEC2(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-EC2CheckDetailedMonitoring') &&
      !nist80053EC2CheckDetailedMonitoring(node)
    ) {
      const ruleId = 'NIST.800.53-EC2CheckDetailedMonitoring';
      const info = 'The EC2 instance does not have detailed monitoring enabled - (Control IDs: CA-7(a)(b), SI-4(2), SI-4(a)(b)(c)).';
      const explanation = 'Detailed monitoring provides additional monitoring information (such as 1-minute period graphs) on the AWS console.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-EC2CheckInsideVPC') &&
      !nist80053EC2CheckInsideVPC(node)
    ) {
      const ruleId = 'NIST.800.53-EC2CheckInsideVPC';
      const info = 'The EC2 instance is not within a VPC - (Control IDs: AC-4, SC-7, SC-7(3)).';
      const explanation = 'Because of their logical isolation, domains that reside within an Amazon VPC have an extra layer of security when compared to domains that use public endpoints.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-EC2CheckNoPublicIPs') &&
      !nist80053EC2CheckNoPublicIPs(node)
    ) {
      const ruleId = 'NIST.800.53-EC2CheckNoPublicIPs';
      const info = 'The EC2 instance is associated with a public IP address - (Control IDs: AC-4, AC-6, AC-21(b), SC-7, SC-7(3)). ';
      const explanation = 'Amazon EC2 instances can contain sensitive information and access control is required for such resources.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-EC2CheckSSHRestricted') &&
      !nist80053EC2CheckSSHRestricted(node)
    ) {
      const ruleId = 'NIST.800.53-EC2CheckSSHRestricted';
      const info = 'The Security Group allows unrestricted SSH access - (Control IDs: AC-4, SC-7, SC-7(3)).';
      const explanation = 'Not allowing ingress (or remote) traffic from 0.0.0.0/0 or ::/0 to port 22 on your resources helps to restrict remote access.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-EC2CheckDefaultSecurityGroupClosed') &&
      !nist80053EC2CheckDefaultSecurityGroupClosed(node)
    ) {
      const ruleId = 'NIST.800.53-EC2CheckDefaultSecurityGroupClosed';
      const info = 'The default security group for one or more VPCs is not closed - (Control IDs: AC-4, SC-7, SC-7(3)).';
      const explanation = 'Restricting all the traffic on the default security group helps in restricting remote access to your AWS resources.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-EC2CheckCommonPortsRestricted') &&
      !nist80053EC2CheckCommonPortsRestricted(node)
    ) {
      const ruleId = 'NIST.800.53-EC2CheckCommonPortsRestricted';
      const info = 'The EC2 machine does not restrict all common ports - (Control IDs: AC-4, CM-2, SC-7, SC-7(3)).';
      const explanation = 'Not restricting access to ports to trusted sources can lead to attacks against the availability, integrity and confidentiality of systems.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-EC2CheckVPCSecurityGroupsAllowAuthPorts') &&
      !nist80053EC2CheckVPCSecurityGroupsAllowAuthPorts(node)
    ) {
      const ruleId = 'NIST.800.53-EC2CheckVPCSecurityGroupsAllowAuthPorts';
      const info = 'The VPC Security Group does not allow all authorized ports - (Control IDs: AC-4, SC-7, SC-7(3).';
      const explanation = 'Not restricting access on ports to trusted sources can lead to attacks against the availability, integrity and confidentiality of systems.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-EC2CheckVolumesEncrypted') &&
      !nist80053EC2CheckVolumesEncrypted(node)
    ) {
      const ruleId = 'NIST.800.53-EC2CheckVPCSecurityGroupsAllowAuthPorts';
      const info = 'The EC2 instance does not utilize encrypted volumes. - (Control IDs: SC-13, SC-28.';
      const explanation = 'Utilizing encrypted volumes makes it more difficult for attackers to steal your information.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
  }

  /**
   * Check autoscaling Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkAutoscaling(node: CfnResource, ignores: any) {

    if (
      !this.ignoreRule(ignores, 'NIST.800.53-AutoscalingHealthChecks') &&
      !nist80053AutoscalingHealthChecks(node)
    ) {
      const ruleId = 'NIST.800.53-AutoscalingHealthChecks';
      const info = 'The EFS does not have encryption at rest enabled - (Control IDs: SC-5).';
      const explanation = 'Health checks for EC2 instances within an autoscaling group help maintain a reliable infrastructure.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }


  }

  /**
   * Check codebuild Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkCodebuild(node: CfnResource, ignores: any) {
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-CodeBuildCheckEnvVars') &&
      !nist80053CodebuildCheckEnvVars(node)
    ) {
      const ruleId = 'NIST.800.53-CodeBuildCheckEnvVars';
      const info = 'The Codebuild environment stores sensitive credentials as environment variables - (Control IDs: AC-6, IA-5(7), SA-3(a)).';
      const explanation = 'Sensitive credentials should not be stored as environment variables.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-CodeBuildURLCheck') &&
      !nist80053CodebuildURLCheck(node)
    ) {
      const ruleId = 'NIST.800.53-CodeBuildURLCheck';
      const info = 'The Codebuild project does not utilize OAUTH - (Control IDs: SA-3(a).';
      const explanation = 'OAUTH is the most secure method of authenticating your Codebuild application.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
  }

  /**
   * Check elasticsearch Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkElasticsearch(node: CfnResource, ignores: any) {
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-ElasticSearchNodeToNodeEncrypted') &&
      !nist80053ElasticSearchNodeToNodeEncrypted(node)
    ) {
      const ruleId = 'NIST.800.53-ElasticSearchNodeToNodeEncrypted';
      const info = 'The Elasticsearch resource is not node-to-node encrypted - (Control IDs: SC-7, SC-8, SC-8(1)).';
      const explanation = 'Node to node encryption helps to ensure that data is secure while in transit between nodes.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-ElasticSearchEncryptedAtRest') &&
      !nist80053ElasticSearchEncryptedAtRest(node)
    ) {
      const ruleId = 'NIST.800.53-ElasticSearchEncryptedAtRest';
      const info = 'The Elasticsearch resource is not encrypted at rest - (Control IDs: SC-13, SC-28).';
      const explanation = 'Encryption at rest helps to ensure that data is secure within each node.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-ElasticSearchRunningWithinVPC') &&
      !nist80053ElasticSearchRunningWithinVPC(node)
    ) {
      const ruleId = 'NIST.800.53-ElasticSearchRunningWithinVPC';
      const info = 'The Elasticsearch resource is not running within a VPC - (Control IDs: AC-4, SC-7, SC-7(3)).';
      const explanation = 'VPCs help secure your AWS resources and provide an extra layer of protection.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
  }

  /**
   * Check ELB Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkELB(node: CfnResource, ignores: any) {
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-ELBListenersUseSSLOrHTTPS') &&
      !nist80053ELBListenersUseSSLOrHTTPS(node)
    ) {
      const ruleId = 'NIST.800.53-ELBListenersUseSSLOrHTTPS';
      const info = 'The ELB has listeners which do not use SSL or HTTPS - (Control IDs: AC-17(2), SC-7, SC-8, SC-8(1), SC-23).';
      const explanation = 'Because sensitive data can exist, enable encryption in transit to help protect that data.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-ELBDeletionProtectionEnabled') &&
      !nist80053ELBDeletionProtectionEnabled(node)
    ) {
      const ruleId = 'NIST.800.53-ELBDeletionProtectionEnabled';
      const info = 'The ELB does not have deletion protection enabled - (Control IDs: CM-2, CP-10).';
      const explanation = 'Use this feature to prevent your load balancer from being accidentally or maliciously deleted, which can lead to loss of availability for your applications.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-ELBCrossZoneBalancing') &&
      !nist80053ELBCrossZoneBalancing(node)
    ) {
      const ruleId = 'NIST.800.53-ELBCrossZoneBalancing';
      const info = 'The ELB does not balance traffic between at least 2 AZs - (Control IDs: SC-5, CP-10).';
      const explanation = 'The cross-zone load balancing reduces the need to maintain equivalent numbers of instances in each enabled availability zone.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-ELBUseACMCerts') &&
      !nist80053ELBUseACMCerts(node)
    ) {
      const ruleId = 'NIST.800.53-ELBUseACMCerts';
      const info = 'The ELB does not utilize ACM (Amazon Certificate Manager) certifications - (Control IDs: AC-17(2), SC-7, SC-8, SC-8(1), SC-13).';
      const explanation = 'Use AWS Certificate Manager to manage, provision and deploy public and private SSL/TLS certificates with AWS services and internal resources.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
  }

  /**
   * Check Lambda Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkLambda(node: CfnResource, ignores: any) {
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-LambdaFunctionsInsideVPC') &&
      !nist80053LambdaFunctionsInsideVPC(node)
    ) {
      const ruleId = 'NIST.800.53-LambdaFunctionsInsideVPC';
      const info = 'The Lambda function does not exist within a VPC - (Control IDs: AC-4, SC-7, SC-7(3)).';
      const explanation = 'Because of their logical isolation, domains that reside within an Amazon VPC have an extra layer of security when compared to domains that use public endpoints.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
  }

  /**
   * Check Sagemaker Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkSagemaker(node: CfnResource, ignores: any) {
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-SagemakerDirectInternetAccessDisbabled') &&
      !nist80053SagemakerDirectInternetAccessDisabled(node)
    ) {
      const ruleId = 'NIST.800.53-SagemakerDirectInternetAccessDisbabled';
      const info = 'The Sagemaker resource does not disable direct internet access - (Control IDs: SC-13, SC-28).';
      const explanation = 'By preventing direct internet access, you can keep sensitive data from being accessed by unauthorized users.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-SagemakerEndpointKMS') &&
      !nist80053SagemakerEndpointKMS(node)
    ) {
      const ruleId = 'NIST.800.53-SagemakerEndpointKMS';
      const info = 'The Sagemaker resource endpoint is encryped using KMS - (Control IDs: SC-13, SC-28).';
      const explanation = 'Because sensitive data can exist at rest in SageMaker endpoint, enable encryption at rest to help protect that data.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-SagemakerNotebookKMS') &&
      !nist80053SagemakerNotebookKMS(node)
    ) {
      const ruleId = 'NIST.800.53-SagemakerNotebookKMS';
      const info = 'The Sagemaker notebook is encryped using KMS - (Control IDs: SC-13, SC-28).';
      const explanation = 'Because sensitive data can exist at rest in SageMaker notebook, enable encryption at rest to help protect that data.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
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
      !this.ignoreRule(ignores, 'NIST.800.53-EFSEncrypted') &&
      !nist80053EFSEncrypted(node)
    ) {
      const ruleId = 'NIST.800.53-EFSEncrypted';
      const info = 'The EFS does not have encryption at rest enabled - (Control IDs: SC-13, SC-28).';
      const explanation = 'Because sensitive data can exist and to help protect data at rest, ensure encryption is enabled for your Amazon Elastic File System (EFS).';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
  }

  /**
   * Check IAM Resources
   * @param node the IConstruct to evaluate
   * @param ignores list of ignores for the resource
   */
  private checkIAM(node: CfnResource, ignores: any): void {
    if (
      !this.ignoreRule(ignores, 'NIST.800.53-IAMGroupMembershipCheck') &&
      !nist80053IamGroupMembership(node)
    ) {
      const ruleId = 'NIST.800.53-IAMGroupMembershipCheck';
      const info = 'The IAM user does not belong to any group(s) - (Control IDs: AC-2(1), AC-2(j), AC-3, and AC-6).';
      const explanation =
        'AWS Identity and Access Management (IAM) can help you restrict access permissions and authorizations, by ensuring IAM users are members of at least one group. Allowing users more privileges than needed to complete a task may violate the principle of least privilege and separation of duties.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }

    if (
      !this.ignoreRule(ignores, 'NIST.800.53-IAMUserNoPoliciesCheck') &&
      !nist80053IamUserNoPolicies(node)
    ) {
      const ruleId = 'NIST.800.53-IAMUserNoPoliciesCheck';
      const info = 'The IAM policy is attached at the user level - (Control IDs: AC-2(j), AC-3, AC-5c, AC-6).';
      const explanation =
        'Assigning privileges at the group or the role level helps to reduce opportunity for an identity to receive or retain excessive privileges.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }

    if (
      !this.ignoreRule(ignores, 'NIST.800.53-IAMNoInlinePolicyCheck') &&
      !nist80053IamNoInlinePolicy(node)
    ) {
      const ruleId = 'NIST.800.53-IAMNoInlinePolicyCheck';
      const info = 'The IAM Group, User, or Role contains an inline policy - (Control ID: AC-6).';
      const explanation =
        'AWS recommends to use managed policies instead of inline policies. The managed policies allow reusability, versioning and rolling back, and delegating permissions management.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }

    if (
      !this.ignoreRule(ignores, 'NIST.800.53-IAMPolicyNoStatementsWithAdminAccess') &&
      !nist80053IamPolicyNoStatementsWithAdminAccess(node)
    ) {
      const ruleId = 'NIST.800.53-IAMPolicyNoStatementsWithAdminAccess';
      const info = 'The IAM policy grants admin access - (Control IDs AC-2(1), AC-2(j), AC-3, AC-6).';
      const explanation =
        'AWS Identity and Access Management (IAM) can help you incorporate the principles of least privilege and separation of duties with access permissions and authorizations, restricting policies from containing "Effect": "Allow" with "Action": "*" over "Resource": "*". Allowing users to have more privileges than needed to complete a task may violate the principle of least privilege and separation of duties.';
      Annotations.of(node).addError(
        this.createMessage(ruleId, info, explanation),
      );
    }
  }
}
