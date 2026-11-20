/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnResource } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
import { NagPack, NagPackProps } from '../nag-pack';
import { NagMessageLevel } from '../nag-rules';
import { BedrockDataSourceKMSKeyConfigured } from '../rules/bedrock';
import {
  BedrockAgentCoreBrowserCustomNoPublicNetworkMode,
  BedrockAgentCoreBrowserCustomRecordingEnabled,
  BedrockAgentCoreCodeInterpreterCustomVPCNetworkMode,
  BedrockAgentCoreGatewayAuthorizerConfigured,
  BedrockAgentCoreGatewayKMSKeyConfigured,
  BedrockAgentCoreMemoryKMSKeyConfigured,
  BedrockAgentCoreRuntimeNoPublicNetworkMode,
} from '../rules/bedrockagentcore';
import {
  SageMakerDataQualityJobInterContainerEncryption,
  SageMakerDataQualityJobNetworkIsolation,
  SageMakerEndpointConfigProdInstanceCount,
  SageMakerFeatureGroupOfflineStoreKMSKeyConfigured,
  SageMakerFeatureGroupOnlineStoreKMSKeyConfigured,
  SageMakerInferenceExperimentDataStorageKMSKeyConfigured,
  SageMakerInferenceExperimentKMSKeyConfigured,
  SageMakerModelBiasJobInterContainerEncryption,
  SageMakerModelBiasJobNetworkIsolation,
  SageMakerModelExplainabilityJobInterContainerEncryption,
  SageMakerModelExplainabilityJobNetworkIsolation,
  SageMakerModelMultiContainerPrivateRegistry,
  SageMakerModelNetworkIsolation,
  SageMakerModelPrimaryContainerPrivateRegistry,
  SageMakerModelQualityJobInterContainerEncryption,
  SageMakerModelQualityJobNetworkIsolation,
  SageMakerMonitoringScheduleInterContainerEncryption,
  SageMakerMonitoringScheduleNetworkIsolation,
  SageMakerNotebookInVPC,
  SageMakerNotebookInstanceKMSKeyConfigured,
  SageMakerNotebookNoDirectInternetAccess,
  SageMakerNotebookRootAccessDisabled,
  SageMakerNotebookSupportedPlatform,
} from '../rules/sagemaker';

/**
 * Check for AI workload configurations that do not align with the AWS Security Hub CSPM AI Security Best Practices standard (v1.0.0)
 * @see https://docs.aws.amazon.com/securityhub/latest/userguide/standards-ai-security.html
 */
export class AISecurityBestPracticesChecks extends NagPack {
  public readonly name = 'AISecurityBestPractices';

  constructor(scope?: IConstruct, props?: NagPackProps) {
    super(scope, props);
    this.packName = 'AISecurityBestPractices';
  }

  protected checkResource(node: CfnResource): void {
    this.checkBedrock(node);
    this.checkBedrockAgentCore(node);
    this.checkSageMaker(node);
  }

  /**
   * Check Amazon Bedrock Resources
   * @param node the CfnResource to check
   */
  private checkBedrock(node: CfnResource): void {
    this.applyRule({
      info: 'The Bedrock knowledge base data source is not encrypted with a customer managed KMS key - (Control ID: Bedrock.1).',
      explanation:
        'Customer managed KMS keys give you control over key rotation, access policies, and CloudTrail auditing of key usage for data ingested into knowledge bases.',
      level: NagMessageLevel.ERROR,
      rule: BedrockDataSourceKMSKeyConfigured,
      node: node,
    });
  }

  /**
   * Check Amazon Bedrock AgentCore Resources
   * @param node the CfnResource to check
   */
  private checkBedrockAgentCore(node: CfnResource): void {
    this.applyRule({
      info: 'The Bedrock AgentCore runtime is configured with PUBLIC network mode - (Control ID: BedrockAgentCore.1).',
      explanation:
        'PUBLIC network mode exposes the runtime directly to the internet. VPC network mode keeps traffic within your private network.',
      level: NagMessageLevel.ERROR,
      rule: BedrockAgentCoreRuntimeNoPublicNetworkMode,
      node: node,
    });
    this.applyRule({
      info: 'The Bedrock AgentCore gateway does not require authorization for inbound requests - (Control ID: BedrockAgentCore.2).',
      explanation:
        'Without an inbound authorizer, any entity with network access to the gateway endpoint can invoke its targets.',
      level: NagMessageLevel.ERROR,
      rule: BedrockAgentCoreGatewayAuthorizerConfigured,
      node: node,
    });
    this.applyRule({
      info: 'The Bedrock AgentCore memory is not encrypted with a customer managed KMS key - (Control ID: BedrockAgentCore.3).',
      explanation:
        'Customer managed KMS keys give you control over key rotation, access policies, and CloudTrail auditing of key usage.',
      level: NagMessageLevel.ERROR,
      rule: BedrockAgentCoreMemoryKMSKeyConfigured,
      node: node,
    });
    this.applyRule({
      info: 'The Bedrock AgentCore gateway is not encrypted with a customer managed KMS key - (Control ID: BedrockAgentCore.4).',
      explanation:
        'Customer managed KMS keys give you control over key rotation, access policies, and CloudTrail auditing of key usage.',
      level: NagMessageLevel.ERROR,
      rule: BedrockAgentCoreGatewayKMSKeyConfigured,
      node: node,
    });
    this.applyRule({
      info: 'The Bedrock AgentCore custom browser is configured with PUBLIC network mode - (Control ID: BedrockAgentCore.5).',
      explanation:
        'PUBLIC network mode exposes browser traffic to the internet. VPC network mode keeps it within your private network so security groups, network ACLs, and VPC flow logs apply.',
      level: NagMessageLevel.ERROR,
      rule: BedrockAgentCoreBrowserCustomNoPublicNetworkMode,
      node: node,
    });
    this.applyRule({
      info: 'The Bedrock AgentCore custom browser does not have session recording enabled with an S3 destination - (Control ID: BedrockAgentCore.6).',
      explanation:
        'Recording browser sessions to S3 provides an audit trail of automated browsing activity, helping detect unauthorized access or data exfiltration.',
      level: NagMessageLevel.ERROR,
      rule: BedrockAgentCoreBrowserCustomRecordingEnabled,
      node: node,
    });
    this.applyRule({
      info: 'The Bedrock AgentCore custom code interpreter is not configured with VPC network mode - (Control ID: BedrockAgentCore.7).',
      explanation:
        'Only VPC network mode keeps code execution traffic within your private network, where security groups, network ACLs, and VPC flow logs apply.',
      level: NagMessageLevel.ERROR,
      rule: BedrockAgentCoreCodeInterpreterCustomVPCNetworkMode,
      node: node,
    });
  }

  /**
   * Check Amazon SageMaker AI Resources
   * @param node the CfnResource to check
   */
  private checkSageMaker(node: CfnResource): void {
    this.applyRule({
      info: 'The SageMaker notebook instance has direct internet access enabled - (Control ID: SageMaker.1).',
      explanation:
        'Disabling direct internet access keeps notebook traffic within your VPC, where it can be controlled and monitored, and helps prevent unauthorized access to sensitive data.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerNotebookNoDirectInternetAccess,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker notebook instance is not provisioned inside a custom VPC - (Control ID: SageMaker.2).',
      explanation:
        'Launching notebook instances in a custom VPC lets you control their network access and internet connectivity with security groups, network ACLs, and VPC endpoints.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerNotebookInVPC,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker notebook instance does not have root access disabled - (Control ID: SageMaker.3).',
      explanation:
        'Root access is enabled by default. Disabling it follows the principle of least privilege and prevents users from changing the notebook environment or escalating privileges.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerNotebookRootAccessDisabled,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker endpoint configuration has an instance-based production variant with an initial instance count of 1 or less - (Control ID: SageMaker.4).',
      explanation:
        'Production variants with more than one instance let SageMaker AI spread instances across Availability Zones, which keeps the endpoint available if an instance or Availability Zone fails.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerEndpointConfigProdInstanceCount,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker model does not have network isolation enabled - (Control ID: SageMaker.5).',
      explanation:
        'Network isolation blocks all inbound and outbound network calls from the model container, including calls to other AWS services, and withholds AWS credentials from the container.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerModelNetworkIsolation,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker notebook instance runs on a platform that is no longer supported - (Control ID: SageMaker.8).',
      explanation:
        'Notebook instances on unsupported platforms no longer receive security patches or critical bug fixes. Omitting the platform identifier uses the current default platform.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerNotebookSupportedPlatform,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker data quality job definition does not have inter-container traffic encryption enabled - (Control ID: SageMaker.9).',
      explanation:
        'Inter-container traffic encryption protects ML data passed between instances during distributed data quality analysis.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerDataQualityJobInterContainerEncryption,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker model explainability job definition does not have inter-container traffic encryption enabled - (Control ID: SageMaker.10).',
      explanation:
        'Inter-container traffic encryption protects model data, datasets, and intermediate results passed between instances during distributed explainability analysis.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerModelExplainabilityJobInterContainerEncryption,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker data quality job definition does not have network isolation enabled - (Control ID: SageMaker.11).',
      explanation:
        'Network isolation prevents the monitoring job containers from making network calls, reducing the risk of data exfiltration.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerDataQualityJobNetworkIsolation,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker model bias job definition does not have network isolation enabled - (Control ID: SageMaker.12).',
      explanation:
        'Network isolation prevents the monitoring job containers from making outbound connections, reducing the risk of data exfiltration.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerModelBiasJobNetworkIsolation,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker model quality job definition does not have inter-container traffic encryption enabled - (Control ID: SageMaker.13).',
      explanation:
        'Inter-container traffic encryption protects data passed between instances during distributed model quality monitoring.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerModelQualityJobInterContainerEncryption,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker monitoring schedule job definition does not have network isolation enabled - (Control ID: SageMaker.14).',
      explanation:
        'Network isolation prevents monitoring job containers from making outbound network calls. Schedules that reference a separate job definition are covered by the job definition rules instead.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerMonitoringScheduleNetworkIsolation,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker model bias job definition uses multiple instances without inter-container traffic encryption - (Control ID: SageMaker.15).',
      explanation:
        'Inter-container traffic encryption protects model information, such as weights, passed between instances during distributed model bias monitoring.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerModelBiasJobInterContainerEncryption,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker model primary container does not pull its image from a private registry in a VPC - (Control ID: SageMaker.16).',
      explanation:
        'Pulling images from a private registry through VPC endpoints keeps image pulls off the public internet and limits images to trusted sources.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerModelPrimaryContainerPrivateRegistry,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker feature group offline store is not encrypted with a KMS key - (Control ID: SageMaker.17).',
      explanation:
        'Customer managed KMS keys give you control over key rotation, access policies, and CloudTrail auditing of key usage for offline feature data in S3.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerFeatureGroupOfflineStoreKMSKeyConfigured,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker feature group online store with standard storage is not encrypted with a KMS key - (Control ID: SageMaker.18).',
      explanation:
        'Customer managed KMS keys give you control over key rotation, access policies, and CloudTrail auditing of key usage for online feature data.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerFeatureGroupOnlineStoreKMSKeyConfigured,
      node: node,
    });
    this.applyRule({
      info: 'A container in the SageMaker model inference pipeline does not pull its image from a private registry in a VPC - (Control ID: SageMaker.19).',
      explanation:
        'Pulling every pipeline image from a private registry through VPC endpoints keeps image pulls off the public internet and reduces the risk of supply chain attacks.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerModelMultiContainerPrivateRegistry,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker model explainability job definition does not have network isolation enabled - (Control ID: SageMaker.20).',
      explanation:
        'Network isolation prevents the job containers from making outbound network calls, reducing the risk of exfiltrating model and training data.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerModelExplainabilityJobNetworkIsolation,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker notebook instance storage volume is not encrypted with a customer managed KMS key - (Control ID: SageMaker.21).',
      explanation:
        'Notebook storage volumes hold notebooks, datasets, and model artifacts. Customer managed KMS keys give you control over key policies and CloudTrail auditing of key usage.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerNotebookInstanceKMSKeyConfigured,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker monitoring schedule job definition does not have inter-container traffic encryption enabled - (Control ID: SageMaker.22).',
      explanation:
        'Inter-container traffic encryption protects data passed between containers during monitoring jobs. Schedules that reference a separate job definition are covered by the job definition rules instead.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerMonitoringScheduleInterContainerEncryption,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker inference experiment does not encrypt instance storage volumes with a customer managed KMS key - (Control ID: SageMaker.23).',
      explanation:
        'Customer managed KMS keys give you control over key rotation and CloudTrail auditing for model artifacts and inference data stored during shadow tests.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerInferenceExperimentKMSKeyConfigured,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker inference experiment captures data without a customer managed KMS key - (Control ID: SageMaker.24).',
      explanation:
        'Customer managed KMS keys protect captured inference requests and responses in S3 with centralized key management and audit logging.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerInferenceExperimentDataStorageKMSKeyConfigured,
      node: node,
    });
    this.applyRule({
      info: 'The SageMaker model quality job definition does not have network isolation enabled - (Control ID: SageMaker.25).',
      explanation:
        'Network isolation prevents the job containers from making network calls, reducing the risk of unauthorized access and data exfiltration.',
      level: NagMessageLevel.ERROR,
      rule: SageMakerModelQualityJobNetworkIsolation,
      node: node,
    });
  }
}
