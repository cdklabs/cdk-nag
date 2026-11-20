/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { Aws, CfnParameter, Fn } from 'aws-cdk-lib';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import {
  CfnDataQualityJobDefinition,
  CfnEndpointConfig,
  CfnFeatureGroup,
  CfnInferenceExperiment,
  CfnModel,
  CfnModelBiasJobDefinition,
  CfnModelExplainabilityJobDefinition,
  CfnModelQualityJobDefinition,
  CfnMonitoringSchedule,
  CfnNotebookInstance,
} from 'aws-cdk-lib/aws-sagemaker';
import { Stack } from 'aws-cdk-lib/core';
import { validateStack, TestType, TestPack, setActivePack } from './utils';
import {
  SageMakerDataQualityJobInterContainerEncryption,
  SageMakerDataQualityJobNetworkIsolation,
  SageMakerEndpointConfigProdInstanceCount,
  SageMakerEndpointConfigurationKMSKeyConfigured,
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
} from '../../src/rules/sagemaker';

const testPack = new TestPack([
  SageMakerDataQualityJobInterContainerEncryption,
  SageMakerDataQualityJobNetworkIsolation,
  SageMakerEndpointConfigProdInstanceCount,
  SageMakerEndpointConfigurationKMSKeyConfigured,
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
]);
const roleArn = 'arn:aws:iam::123456789012:role/sagemaker';
const imageUri = '123456789012.dkr.ecr.us-east-1.amazonaws.com/image:latest';
const endpointInput = {
  endpointName: 'endpoint',
  localPath: '/opt/ml/processing/input',
};
const monitoringOutputConfig = {
  monitoringOutputs: [
    {
      s3Output: {
        localPath: '/opt/ml/processing/output',
        s3Uri: 's3://bucket/output',
      },
    },
  ],
};
const jobResources = (instanceCount: number) => ({
  clusterConfig: {
    instanceCount,
    instanceType: 'ml.m5.large',
    volumeSizeInGb: 20,
  },
});
const dataQualityJobProps = {
  dataQualityAppSpecification: { imageUri },
  dataQualityJobInput: { endpointInput },
  dataQualityJobOutputConfig: monitoringOutputConfig,
  jobResources: jobResources(1),
  roleArn,
};
const modelBiasJobProps = {
  modelBiasAppSpecification: { configUri: 's3://bucket/config', imageUri },
  modelBiasJobInput: {
    endpointInput,
    groundTruthS3Input: { s3Uri: 's3://bucket/ground-truth' },
  },
  modelBiasJobOutputConfig: monitoringOutputConfig,
  jobResources: jobResources(1),
  roleArn,
};
const modelExplainabilityJobProps = {
  modelExplainabilityAppSpecification: {
    configUri: 's3://bucket/config',
    imageUri,
  },
  modelExplainabilityJobInput: { endpointInput },
  modelExplainabilityJobOutputConfig: monitoringOutputConfig,
  jobResources: jobResources(1),
  roleArn,
};
const modelQualityJobProps = {
  modelQualityAppSpecification: { imageUri, problemType: 'Regression' },
  modelQualityJobInput: {
    endpointInput,
    groundTruthS3Input: { s3Uri: 's3://bucket/ground-truth' },
  },
  modelQualityJobOutputConfig: monitoringOutputConfig,
  jobResources: jobResources(1),
  roleArn,
};
const monitoringJobDefinition = {
  monitoringAppSpecification: { imageUri },
  monitoringInputs: [{ endpointInput }],
  monitoringOutputConfig,
  monitoringResources: jobResources(1),
  roleArn,
};
const featureGroupProps = {
  eventTimeFeatureName: 'event_time',
  featureDefinitions: [
    { featureName: 'record_id', featureType: 'String' },
    { featureName: 'event_time', featureType: 'String' },
  ],
  featureGroupName: 'features',
  recordIdentifierFeatureName: 'record_id',
};
const inferenceExperimentProps = {
  endpointName: 'endpoint',
  modelVariants: [],
  name: 'experiment',
  roleArn,
  type: 'ShadowMode',
};
const vpcImageConfig = { repositoryAccessMode: 'Vpc' };
const platformImageConfig = { repositoryAccessMode: 'Platform' };
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  setActivePack(testPack);
});

describe('Amazon SageMaker', () => {
  describe('SageMakerEndpointConfigurationKMSKeyConfigured: SageMaker endpoints utilize a KMS key', () => {
    const ruleId = 'SageMakerEndpointConfigurationKMSKeyConfigured';
    test('Noncompliance 1', () => {
      new CfnEndpointConfig(stack, 'badendpoint', {
        productionVariants: [],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnEndpointConfig(stack, 'badendpoint', {
        productionVariants: [],
        kmsKeyId: 'somecoolIDkey',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('SageMakerNotebookInVPC: SageMaker notebook instances are provisioned inside a VPC', () => {
    const ruleId = 'SageMakerNotebookInVPC';
    test('Noncompliance 1', () => {
      new CfnNotebookInstance(stack, 'rNotebook', {
        instanceType: 'ml.t3.xlarge',
        roleArn: new Role(stack, 'rNotebookRole', {
          assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
        }).roleArn,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnNotebookInstance(stack, 'rNotebook', {
        instanceType: 'ml.t3.xlarge',
        roleArn: new Role(stack, 'rNotebookRole', {
          assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
        }).roleArn,
        subnetId: 'subnet-0bb1c79de3EXAMPLE',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('SageMakerNotebookInstanceKMSKeyConfigured: SageMaker notebook instances utilize KMS keys for encryption at rest', () => {
    const ruleId = 'SageMakerNotebookInstanceKMSKeyConfigured';
    test('Noncompliance 1', () => {
      new CfnNotebookInstance(stack, 'rNotebook', {
        instanceType: 'ml.t3.xlarge',
        roleArn: new Role(stack, 'rNotebookRole', {
          assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
        }).roleArn,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnNotebookInstance(stack, 'rNotebook', {
        instanceType: 'ml.t3.xlarge',
        roleArn: new Role(stack, 'rNotebookRole', {
          assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
        }).roleArn,
        kmsKeyId: '1234abcd-12ab-34cd-56ef-1234567890ab',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('SageMakerNotebookNoDirectInternetAccess: SageMaker notebook instances have direct internet access disabled', () => {
    const ruleId = 'SageMakerNotebookNoDirectInternetAccess';
    test('Noncompliance 1', () => {
      new CfnNotebookInstance(stack, 'rNotebook', {
        instanceType: 'ml.t3.xlarge',
        roleArn: new Role(stack, 'rNotebookRole', {
          assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
        }).roleArn,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnNotebookInstance(stack, 'rNotebook', {
        instanceType: 'ml.t3.xlarge',
        roleArn: new Role(stack, 'rNotebookRole', {
          assumedBy: new ServicePrincipal('sagemaker.amazonaws.com'),
        }).roleArn,
        subnetId: 'subnet-0bb1c79de3EXAMPLE',
        directInternetAccess: 'Disabled',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('SageMakerDataQualityJobInterContainerEncryption: SageMaker data quality job definitions have inter-container traffic encryption enabled', () => {
    const ruleId = 'SageMakerDataQualityJobInterContainerEncryption';
    test('Noncompliance 1', () => {
      new CfnDataQualityJobDefinition(stack, 'Job', dataQualityJobProps);
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnDataQualityJobDefinition(stack, 'Job', {
        ...dataQualityJobProps,
        networkConfig: { enableInterContainerTrafficEncryption: false },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnDataQualityJobDefinition(stack, 'Job', {
        ...dataQualityJobProps,
        networkConfig: { enableInterContainerTrafficEncryption: true },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error', () => {
      new CfnDataQualityJobDefinition(stack, 'Job', {
        ...dataQualityJobProps,
        networkConfig: Fn.conditionIf('Secure', {}, {}),
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });

  describe('SageMakerDataQualityJobNetworkIsolation: SageMaker data quality job definitions have network isolation enabled', () => {
    const ruleId = 'SageMakerDataQualityJobNetworkIsolation';
    test('Noncompliance 1', () => {
      new CfnDataQualityJobDefinition(stack, 'Job', dataQualityJobProps);
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnDataQualityJobDefinition(stack, 'Job', {
        ...dataQualityJobProps,
        networkConfig: { enableNetworkIsolation: false },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnDataQualityJobDefinition(stack, 'Job', {
        ...dataQualityJobProps,
        networkConfig: { enableNetworkIsolation: true },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error', () => {
      new CfnDataQualityJobDefinition(stack, 'Job', {
        ...dataQualityJobProps,
        networkConfig: Fn.conditionIf('Secure', {}, {}),
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });

  describe('SageMakerModelBiasJobNetworkIsolation: SageMaker model bias job definitions have network isolation enabled', () => {
    const ruleId = 'SageMakerModelBiasJobNetworkIsolation';
    test('Noncompliance 1', () => {
      new CfnModelBiasJobDefinition(stack, 'Job', modelBiasJobProps);
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnModelBiasJobDefinition(stack, 'Job', {
        ...modelBiasJobProps,
        networkConfig: { enableNetworkIsolation: false },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnModelBiasJobDefinition(stack, 'Job', {
        ...modelBiasJobProps,
        networkConfig: { enableNetworkIsolation: true },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error', () => {
      new CfnModelBiasJobDefinition(stack, 'Job', {
        ...modelBiasJobProps,
        networkConfig: Fn.conditionIf('Secure', {}, {}),
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });

  describe('SageMakerModelExplainabilityJobInterContainerEncryption: SageMaker model explainability job definitions have inter-container traffic encryption enabled', () => {
    const ruleId = 'SageMakerModelExplainabilityJobInterContainerEncryption';
    test('Noncompliance 1', () => {
      new CfnModelExplainabilityJobDefinition(
        stack,
        'Job',
        modelExplainabilityJobProps
      );
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnModelExplainabilityJobDefinition(stack, 'Job', {
        ...modelExplainabilityJobProps,
        networkConfig: { enableInterContainerTrafficEncryption: false },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnModelExplainabilityJobDefinition(stack, 'Job', {
        ...modelExplainabilityJobProps,
        networkConfig: { enableInterContainerTrafficEncryption: true },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error', () => {
      new CfnModelExplainabilityJobDefinition(stack, 'Job', {
        ...modelExplainabilityJobProps,
        networkConfig: Fn.conditionIf('Secure', {}, {}),
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });

  describe('SageMakerModelExplainabilityJobNetworkIsolation: SageMaker model explainability job definitions have network isolation enabled', () => {
    const ruleId = 'SageMakerModelExplainabilityJobNetworkIsolation';
    test('Noncompliance 1', () => {
      new CfnModelExplainabilityJobDefinition(
        stack,
        'Job',
        modelExplainabilityJobProps
      );
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnModelExplainabilityJobDefinition(stack, 'Job', {
        ...modelExplainabilityJobProps,
        networkConfig: { enableNetworkIsolation: false },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnModelExplainabilityJobDefinition(stack, 'Job', {
        ...modelExplainabilityJobProps,
        networkConfig: { enableNetworkIsolation: true },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error', () => {
      new CfnModelExplainabilityJobDefinition(stack, 'Job', {
        ...modelExplainabilityJobProps,
        networkConfig: Fn.conditionIf('Secure', {}, {}),
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });

  describe('SageMakerModelQualityJobInterContainerEncryption: SageMaker model quality job definitions have inter-container traffic encryption enabled', () => {
    const ruleId = 'SageMakerModelQualityJobInterContainerEncryption';
    test('Noncompliance 1', () => {
      new CfnModelQualityJobDefinition(stack, 'Job', modelQualityJobProps);
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnModelQualityJobDefinition(stack, 'Job', {
        ...modelQualityJobProps,
        networkConfig: { enableInterContainerTrafficEncryption: false },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnModelQualityJobDefinition(stack, 'Job', {
        ...modelQualityJobProps,
        networkConfig: { enableInterContainerTrafficEncryption: true },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error', () => {
      new CfnModelQualityJobDefinition(stack, 'Job', {
        ...modelQualityJobProps,
        networkConfig: Fn.conditionIf('Secure', {}, {}),
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });

  describe('SageMakerModelQualityJobNetworkIsolation: SageMaker model quality job definitions have network isolation enabled', () => {
    const ruleId = 'SageMakerModelQualityJobNetworkIsolation';
    test('Noncompliance 1', () => {
      new CfnModelQualityJobDefinition(stack, 'Job', modelQualityJobProps);
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnModelQualityJobDefinition(stack, 'Job', {
        ...modelQualityJobProps,
        networkConfig: { enableNetworkIsolation: false },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnModelQualityJobDefinition(stack, 'Job', {
        ...modelQualityJobProps,
        networkConfig: { enableNetworkIsolation: true },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error', () => {
      new CfnModelQualityJobDefinition(stack, 'Job', {
        ...modelQualityJobProps,
        networkConfig: Fn.conditionIf('Secure', {}, {}),
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });

  describe('SageMakerModelBiasJobInterContainerEncryption: SageMaker model bias job definitions that use multiple instances have inter-container traffic encryption enabled', () => {
    const ruleId = 'SageMakerModelBiasJobInterContainerEncryption';
    test('Noncompliance 1', () => {
      new CfnModelBiasJobDefinition(stack, 'Job', {
        ...modelBiasJobProps,
        jobResources: jobResources(2),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnModelBiasJobDefinition(stack, 'Job', {
        ...modelBiasJobProps,
        jobResources: jobResources(2),
        networkConfig: { enableInterContainerTrafficEncryption: false },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnModelBiasJobDefinition(stack, 'Job1', modelBiasJobProps);
      new CfnModelBiasJobDefinition(stack, 'Job2', {
        ...modelBiasJobProps,
        jobResources: jobResources(2),
        networkConfig: { enableInterContainerTrafficEncryption: true },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error', () => {
      new CfnModelBiasJobDefinition(stack, 'Job', {
        ...modelBiasJobProps,
        jobResources: Fn.conditionIf('Large', {}, {}),
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });

  describe('SageMakerMonitoringScheduleInterContainerEncryption: SageMaker monitoring schedules with an inline job definition have inter-container traffic encryption enabled', () => {
    const ruleId = 'SageMakerMonitoringScheduleInterContainerEncryption';
    test('Noncompliance 1', () => {
      new CfnMonitoringSchedule(stack, 'Schedule', {
        monitoringScheduleName: 'schedule',
        monitoringScheduleConfig: { monitoringJobDefinition },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnMonitoringSchedule(stack, 'Schedule', {
        monitoringScheduleName: 'schedule',
        monitoringScheduleConfig: {
          monitoringJobDefinition: {
            ...monitoringJobDefinition,
            networkConfig: { enableInterContainerTrafficEncryption: false },
          },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnMonitoringSchedule(stack, 'Schedule', {
        monitoringScheduleName: 'schedule',
        monitoringScheduleConfig: {
          monitoringJobDefinition: {
            ...monitoringJobDefinition,
            networkConfig: { enableInterContainerTrafficEncryption: true },
          },
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Not applicable', () => {
      new CfnMonitoringSchedule(stack, 'Schedule', {
        monitoringScheduleName: 'schedule',
        monitoringScheduleConfig: {
          monitoringJobDefinitionName: 'job-definition',
          monitoringType: 'DataQuality',
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error', () => {
      new CfnMonitoringSchedule(stack, 'Schedule', {
        monitoringScheduleName: 'schedule',
        monitoringScheduleConfig: Fn.conditionIf('Inline', {}, {}),
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });

  describe('SageMakerMonitoringScheduleNetworkIsolation: SageMaker monitoring schedules with an inline job definition have network isolation enabled', () => {
    const ruleId = 'SageMakerMonitoringScheduleNetworkIsolation';
    test('Noncompliance 1', () => {
      new CfnMonitoringSchedule(stack, 'Schedule', {
        monitoringScheduleName: 'schedule',
        monitoringScheduleConfig: { monitoringJobDefinition },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnMonitoringSchedule(stack, 'Schedule', {
        monitoringScheduleName: 'schedule',
        monitoringScheduleConfig: {
          monitoringJobDefinition: {
            ...monitoringJobDefinition,
            networkConfig: { enableNetworkIsolation: false },
          },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnMonitoringSchedule(stack, 'Schedule', {
        monitoringScheduleName: 'schedule',
        monitoringScheduleConfig: {
          monitoringJobDefinition: {
            ...monitoringJobDefinition,
            networkConfig: { enableNetworkIsolation: true },
          },
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Not applicable', () => {
      new CfnMonitoringSchedule(stack, 'Schedule', {
        monitoringScheduleName: 'schedule',
        monitoringScheduleConfig: {
          monitoringJobDefinitionName: 'job-definition',
          monitoringType: 'DataQuality',
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error', () => {
      new CfnMonitoringSchedule(stack, 'Schedule', {
        monitoringScheduleName: 'schedule',
        monitoringScheduleConfig: Fn.conditionIf('Inline', {}, {}),
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });

  describe('SageMakerNotebookRootAccessDisabled: SageMaker notebook instances have root access disabled', () => {
    const ruleId = 'SageMakerNotebookRootAccessDisabled';
    test('Noncompliance 1', () => {
      new CfnNotebookInstance(stack, 'Notebook', {
        instanceType: 'ml.t3.medium',
        roleArn,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnNotebookInstance(stack, 'Notebook', {
        instanceType: 'ml.t3.medium',
        roleArn,
        rootAccess: 'Enabled',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnNotebookInstance(stack, 'Notebook', {
        instanceType: 'ml.t3.medium',
        roleArn,
        rootAccess: 'Disabled',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error', () => {
      new CfnNotebookInstance(stack, 'Notebook', {
        instanceType: 'ml.t3.medium',
        roleArn,
        rootAccess: new CfnParameter(stack, 'RootAccess').valueAsString,
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });

  describe('SageMakerNotebookSupportedPlatform: SageMaker notebook instances run on a supported platform', () => {
    const ruleId = 'SageMakerNotebookSupportedPlatform';
    test('Noncompliance 1', () => {
      new CfnNotebookInstance(stack, 'Notebook', {
        instanceType: 'ml.t3.medium',
        roleArn,
        platformIdentifier: 'notebook-al2-v3',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnNotebookInstance(stack, 'Notebook1', {
        instanceType: 'ml.t3.medium',
        roleArn,
      });
      new CfnNotebookInstance(stack, 'Notebook2', {
        instanceType: 'ml.t3.medium',
        roleArn,
        platformIdentifier: 'notebook-al2023-v1',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error', () => {
      new CfnNotebookInstance(stack, 'Notebook', {
        instanceType: 'ml.t3.medium',
        roleArn,
        platformIdentifier: new CfnParameter(stack, 'Platform').valueAsString,
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });

  describe('SageMakerEndpointConfigProdInstanceCount: SageMaker endpoint configurations have more than one initial instance for each instance-based production variant', () => {
    const ruleId = 'SageMakerEndpointConfigProdInstanceCount';
    test('Noncompliance 1', () => {
      new CfnEndpointConfig(stack, 'EndpointConfig', {
        productionVariants: [
          {
            variantName: 'primary',
            modelName: 'model',
            instanceType: 'ml.m5.large',
            initialInstanceCount: 1,
          },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnEndpointConfig(stack, 'EndpointConfig', {
        productionVariants: [
          {
            variantName: 'primary',
            modelName: 'model',
            instanceType: 'ml.m5.large',
            initialInstanceCount: 2,
          },
          {
            variantName: 'secondary',
            modelName: 'model',
            instanceType: 'ml.m5.large',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnEndpointConfig(stack, 'EndpointConfig', {
        productionVariants: [
          {
            variantName: 'primary',
            modelName: 'model',
            instanceType: 'ml.m5.large',
            initialInstanceCount: 2,
          },
          {
            variantName: 'serverless',
            modelName: 'model',
            serverlessConfig: { maxConcurrency: 1, memorySizeInMb: 1024 },
          },
        ],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Not applicable', () => {
      new CfnEndpointConfig(stack, 'EndpointConfig', {
        productionVariants: [
          {
            variantName: 'serverless',
            modelName: 'model',
            serverlessConfig: { maxConcurrency: 1, memorySizeInMb: 1024 },
          },
        ],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error', () => {
      new CfnEndpointConfig(stack, 'EndpointConfig', {
        productionVariants: [
          {
            variantName: 'primary',
            modelName: 'model',
            instanceType: 'ml.m5.large',
            initialInstanceCount: new CfnParameter(stack, 'Count', {
              type: 'Number',
            }).valueAsNumber,
          },
        ],
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
    test('Error 2', () => {
      new CfnEndpointConfig(stack, 'EndpointConfig', {
        productionVariants: [
          {
            variantName: 'primary',
            modelName: 'model',
            instanceType: 'ml.m5.large',
            initialInstanceCount: 1,
            serverlessConfig: Fn.conditionIf(
              'IsDev',
              { maxConcurrency: 1, memorySizeInMb: 1024 },
              Aws.NO_VALUE
            ),
          },
        ],
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });

  describe('SageMakerModelNetworkIsolation: SageMaker models have network isolation enabled', () => {
    const ruleId = 'SageMakerModelNetworkIsolation';
    test('Noncompliance 1', () => {
      new CfnModel(stack, 'Model', {
        executionRoleArn: roleArn,
        primaryContainer: { image: imageUri },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnModel(stack, 'Model', {
        executionRoleArn: roleArn,
        primaryContainer: { image: imageUri },
        enableNetworkIsolation: false,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnModel(stack, 'Model', {
        executionRoleArn: roleArn,
        primaryContainer: { image: imageUri },
        enableNetworkIsolation: true,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error', () => {
      new CfnModel(stack, 'Model', {
        executionRoleArn: roleArn,
        primaryContainer: { image: imageUri },
        enableNetworkIsolation: Fn.conditionIf('Isolate', true, false),
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });

  describe('SageMakerModelPrimaryContainerPrivateRegistry: SageMaker models pull the primary container image from a private registry in a VPC', () => {
    const ruleId = 'SageMakerModelPrimaryContainerPrivateRegistry';
    test('Noncompliance 1', () => {
      new CfnModel(stack, 'Model', {
        executionRoleArn: roleArn,
        primaryContainer: { image: imageUri },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnModel(stack, 'Model', {
        executionRoleArn: roleArn,
        primaryContainer: { image: imageUri, imageConfig: platformImageConfig },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnModel(stack, 'Model', {
        executionRoleArn: roleArn,
        primaryContainer: { image: imageUri, imageConfig: vpcImageConfig },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Not applicable', () => {
      new CfnModel(stack, 'Model', {
        executionRoleArn: roleArn,
        containers: [{ image: imageUri }],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error', () => {
      new CfnModel(stack, 'Model', {
        executionRoleArn: roleArn,
        primaryContainer: {
          image: imageUri,
          imageConfig: Fn.conditionIf('Private', {}, {}),
        },
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });

  describe('SageMakerModelMultiContainerPrivateRegistry: SageMaker models with multi-container inference pipelines pull every container image from a private registry in a VPC', () => {
    const ruleId = 'SageMakerModelMultiContainerPrivateRegistry';
    test('Noncompliance 1', () => {
      new CfnModel(stack, 'Model', {
        executionRoleArn: roleArn,
        containers: [
          { image: imageUri, imageConfig: vpcImageConfig },
          { image: imageUri },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnModel(stack, 'Model', {
        executionRoleArn: roleArn,
        containers: [
          { image: imageUri, imageConfig: vpcImageConfig },
          { image: imageUri, imageConfig: platformImageConfig },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnModel(stack, 'Model', {
        executionRoleArn: roleArn,
        containers: [
          { image: imageUri, imageConfig: vpcImageConfig },
          { image: imageUri, imageConfig: vpcImageConfig },
        ],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Not applicable', () => {
      new CfnModel(stack, 'Model', {
        executionRoleArn: roleArn,
        primaryContainer: { image: imageUri },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error', () => {
      new CfnModel(stack, 'Model', {
        executionRoleArn: roleArn,
        containers: Fn.conditionIf('Pipeline', [], []),
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });

  describe('SageMakerFeatureGroupOfflineStoreKMSKeyConfigured: SageMaker feature group offline stores are encrypted with a KMS key', () => {
    const ruleId = 'SageMakerFeatureGroupOfflineStoreKMSKeyConfigured';
    test('Noncompliance 1', () => {
      new CfnFeatureGroup(stack, 'FeatureGroup', {
        ...featureGroupProps,
        offlineStoreConfig: { S3StorageConfig: { S3Uri: 's3://bucket' } },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnFeatureGroup(stack, 'FeatureGroup', {
        ...featureGroupProps,
        offlineStoreConfig: {
          S3StorageConfig: { S3Uri: 's3://bucket', KmsKeyId: '' },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnFeatureGroup(stack, 'FeatureGroup', {
        ...featureGroupProps,
        offlineStoreConfig: {
          S3StorageConfig: {
            S3Uri: 's3://bucket',
            KmsKeyId: new Key(stack, 'Key').keyArn,
          },
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Not applicable', () => {
      new CfnFeatureGroup(stack, 'FeatureGroup', featureGroupProps);
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error', () => {
      new CfnFeatureGroup(stack, 'FeatureGroup', {
        ...featureGroupProps,
        offlineStoreConfig: Fn.conditionIf('Offline', {}, {}),
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });

  describe('SageMakerFeatureGroupOnlineStoreKMSKeyConfigured: SageMaker feature group online stores with standard storage are encrypted with a KMS key', () => {
    const ruleId = 'SageMakerFeatureGroupOnlineStoreKMSKeyConfigured';
    test('Noncompliance 1', () => {
      new CfnFeatureGroup(stack, 'FeatureGroup', {
        ...featureGroupProps,
        onlineStoreConfig: { EnableOnlineStore: true },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnFeatureGroup(stack, 'FeatureGroup', {
        ...featureGroupProps,
        onlineStoreConfig: {
          EnableOnlineStore: true,
          StorageType: 'Standard',
          SecurityConfig: { KmsKeyId: '' },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnFeatureGroup(stack, 'FeatureGroup', {
        ...featureGroupProps,
        onlineStoreConfig: {
          EnableOnlineStore: true,
          SecurityConfig: { KmsKeyId: new Key(stack, 'Key').keyArn },
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Not applicable', () => {
      new CfnFeatureGroup(stack, 'FeatureGroup1', featureGroupProps);
      new CfnFeatureGroup(stack, 'FeatureGroup2', {
        ...featureGroupProps,
        onlineStoreConfig: { EnableOnlineStore: true, StorageType: 'InMemory' },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error', () => {
      new CfnFeatureGroup(stack, 'FeatureGroup', {
        ...featureGroupProps,
        onlineStoreConfig: Fn.conditionIf('Online', {}, {}),
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });

  describe('SageMakerInferenceExperimentKMSKeyConfigured: SageMaker inference experiments encrypt instance storage volumes with a customer managed KMS key', () => {
    const ruleId = 'SageMakerInferenceExperimentKMSKeyConfigured';
    test('Noncompliance 1', () => {
      new CfnInferenceExperiment(stack, 'Experiment', inferenceExperimentProps);
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnInferenceExperiment(stack, 'Experiment', {
        ...inferenceExperimentProps,
        kmsKey: '',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnInferenceExperiment(stack, 'Experiment', {
        ...inferenceExperimentProps,
        kmsKey: new Key(stack, 'Key').keyArn,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('SageMakerInferenceExperimentDataStorageKMSKeyConfigured: SageMaker inference experiments that capture data encrypt it with a customer managed KMS key', () => {
    const ruleId = 'SageMakerInferenceExperimentDataStorageKMSKeyConfigured';
    test('Noncompliance 1', () => {
      new CfnInferenceExperiment(stack, 'Experiment', {
        ...inferenceExperimentProps,
        dataStorageConfig: { destination: 's3://bucket/capture' },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnInferenceExperiment(stack, 'Experiment', {
        ...inferenceExperimentProps,
        dataStorageConfig: { destination: 's3://bucket/capture', kmsKey: '' },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnInferenceExperiment(stack, 'Experiment', {
        ...inferenceExperimentProps,
        dataStorageConfig: {
          destination: 's3://bucket/capture',
          kmsKey: new Key(stack, 'Key').keyArn,
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Not applicable', () => {
      new CfnInferenceExperiment(stack, 'Experiment', inferenceExperimentProps);
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error', () => {
      new CfnInferenceExperiment(stack, 'Experiment', {
        ...inferenceExperimentProps,
        dataStorageConfig: Fn.conditionIf('Capture', {}, {}),
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });
});
