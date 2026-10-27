/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnParameter, Fn } from 'aws-cdk-lib';
import {
  CfnBrowserCustom,
  CfnCodeInterpreterCustom,
  CfnGateway,
  CfnMemory,
  CfnRuntime,
} from 'aws-cdk-lib/aws-bedrockagentcore';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Stack } from 'aws-cdk-lib/core';
import { validateStack, TestType, TestPack, setActivePack } from './utils';
import {
  BedrockAgentCoreBrowserCustomNoPublicNetworkMode,
  BedrockAgentCoreBrowserCustomRecordingEnabled,
  BedrockAgentCoreCodeInterpreterCustomVPCNetworkMode,
  BedrockAgentCoreGatewayAuthorizerConfigured,
  BedrockAgentCoreGatewayKMSKeyConfigured,
  BedrockAgentCoreMemoryKMSKeyConfigured,
  BedrockAgentCoreRuntimeNoPublicNetworkMode,
} from '../../src/rules/bedrockagentcore';

const testPack = new TestPack([
  BedrockAgentCoreBrowserCustomNoPublicNetworkMode,
  BedrockAgentCoreBrowserCustomRecordingEnabled,
  BedrockAgentCoreCodeInterpreterCustomVPCNetworkMode,
  BedrockAgentCoreGatewayAuthorizerConfigured,
  BedrockAgentCoreGatewayKMSKeyConfigured,
  BedrockAgentCoreMemoryKMSKeyConfigured,
  BedrockAgentCoreRuntimeNoPublicNetworkMode,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  setActivePack(testPack);
});

const vpcNetworkModeConfig = {
  securityGroups: ['sg-12345678'],
  subnets: ['subnet-12345678'],
};

describe('Amazon Bedrock AgentCore', () => {
  describe('BedrockAgentCoreBrowserCustomRecordingEnabled: Bedrock AgentCore custom browsers have session recording enabled with an S3 destination', () => {
    const ruleId = 'BedrockAgentCoreBrowserCustomRecordingEnabled';
    test('Noncompliance 1', () => {
      new CfnBrowserCustom(stack, 'Browser', {
        name: 'browser',
        networkConfiguration: { networkMode: 'PUBLIC' },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnBrowserCustom(stack, 'Browser', {
        name: 'browser',
        networkConfiguration: { networkMode: 'PUBLIC' },
        recordingConfig: {
          enabled: false,
          s3Location: { bucket: 'bucket', prefix: 'recordings/' },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new CfnBrowserCustom(stack, 'Browser', {
        name: 'browser',
        networkConfiguration: { networkMode: 'PUBLIC' },
        recordingConfig: { enabled: true },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      new CfnBrowserCustom(stack, 'Browser', {
        name: 'browser',
        networkConfiguration: { networkMode: 'PUBLIC' },
        recordingConfig: {
          enabled: true,
          s3Location: { bucket: '', prefix: 'recordings/' },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnBrowserCustom(stack, 'Browser', {
        name: 'browser',
        networkConfiguration: { networkMode: 'PUBLIC' },
        recordingConfig: {
          enabled: true,
          s3Location: {
            bucket: new Bucket(stack, 'Bucket').bucketName,
            prefix: 'recordings/',
          },
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error 1', () => {
      new CfnBrowserCustom(stack, 'Browser', {
        name: 'browser',
        networkConfiguration: { networkMode: 'PUBLIC' },
        recordingConfig: Fn.conditionIf(
          'Record',
          { Enabled: true, S3Location: { Bucket: 'bucket' } },
          { Enabled: false }
        ),
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
    test('Error 2', () => {
      new CfnBrowserCustom(stack, 'Browser', {
        name: 'browser',
        networkConfiguration: { networkMode: 'PUBLIC' },
        recordingConfig: {
          enabled: Fn.conditionIf('Record', true, false),
          s3Location: { bucket: 'bucket', prefix: 'recordings/' },
        },
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
    test('Error 3', () => {
      new CfnBrowserCustom(stack, 'Browser', {
        name: 'browser',
        networkConfiguration: { networkMode: 'PUBLIC' },
        recordingConfig: {
          enabled: true,
          s3Location: Fn.conditionIf(
            'UseBucketA',
            { Bucket: 'bucket-a' },
            { Bucket: 'bucket-b' }
          ),
        },
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });

  describe('BedrockAgentCoreBrowserCustomNoPublicNetworkMode: Bedrock AgentCore custom browsers are not configured with PUBLIC network mode', () => {
    const ruleId = 'BedrockAgentCoreBrowserCustomNoPublicNetworkMode';
    test('Noncompliance 1', () => {
      new CfnBrowserCustom(stack, 'Browser', {
        name: 'browser',
        networkConfiguration: { networkMode: 'PUBLIC' },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnBrowserCustom(stack, 'Browser', {
        name: 'browser',
        networkConfiguration: {
          networkMode: 'VPC',
          vpcConfig: vpcNetworkModeConfig,
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error 1', () => {
      new CfnBrowserCustom(stack, 'Browser', {
        name: 'browser',
        networkConfiguration: Fn.conditionIf(
          'UseVpc',
          { NetworkMode: 'VPC', VpcConfig: vpcNetworkModeConfig },
          { NetworkMode: 'PUBLIC' }
        ),
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
    test('Error 2', () => {
      new CfnBrowserCustom(stack, 'Browser', {
        name: 'browser',
        networkConfiguration: {
          networkMode: new CfnParameter(stack, 'NetworkMode').valueAsString,
        },
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });

  describe('BedrockAgentCoreCodeInterpreterCustomVPCNetworkMode: Bedrock AgentCore custom code interpreters are configured with VPC network mode', () => {
    const ruleId = 'BedrockAgentCoreCodeInterpreterCustomVPCNetworkMode';
    test('Noncompliance 1', () => {
      new CfnCodeInterpreterCustom(stack, 'CodeInterpreter', {
        name: 'interpreter',
        networkConfiguration: { networkMode: 'PUBLIC' },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnCodeInterpreterCustom(stack, 'CodeInterpreter', {
        name: 'interpreter',
        networkConfiguration: { networkMode: 'SANDBOX' },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnCodeInterpreterCustom(stack, 'CodeInterpreter', {
        name: 'interpreter',
        networkConfiguration: {
          networkMode: 'VPC',
          vpcConfig: vpcNetworkModeConfig,
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error 1', () => {
      new CfnCodeInterpreterCustom(stack, 'CodeInterpreter', {
        name: 'interpreter',
        networkConfiguration: Fn.conditionIf(
          'UseVpc',
          { NetworkMode: 'VPC', VpcConfig: vpcNetworkModeConfig },
          { NetworkMode: 'SANDBOX' }
        ),
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
    test('Error 2', () => {
      new CfnCodeInterpreterCustom(stack, 'CodeInterpreter', {
        name: 'interpreter',
        networkConfiguration: {
          networkMode: new CfnParameter(stack, 'NetworkMode').valueAsString,
        },
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });

  describe('BedrockAgentCoreGatewayAuthorizerConfigured: Bedrock AgentCore gateways require authorization for inbound requests', () => {
    const ruleId = 'BedrockAgentCoreGatewayAuthorizerConfigured';
    test('Noncompliance 1', () => {
      new CfnGateway(stack, 'Gateway', {
        name: 'gateway',
        authorizerType: 'NONE',
        protocolType: 'MCP',
        roleArn: 'arn:aws:iam::123456789012:role/gateway',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnGateway(stack, 'Gateway', {
        name: 'gateway',
        authorizerType: 'AWS_IAM',
        protocolType: 'MCP',
        roleArn: 'arn:aws:iam::123456789012:role/gateway',
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error', () => {
      new CfnGateway(stack, 'Gateway', {
        name: 'gateway',
        authorizerType: new CfnParameter(stack, 'AuthorizerType').valueAsString,
        protocolType: 'MCP',
        roleArn: 'arn:aws:iam::123456789012:role/gateway',
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });

  describe('BedrockAgentCoreGatewayKMSKeyConfigured: Bedrock AgentCore gateways are encrypted with a customer managed KMS key', () => {
    const ruleId = 'BedrockAgentCoreGatewayKMSKeyConfigured';
    test('Noncompliance 1', () => {
      new CfnGateway(stack, 'Gateway', {
        name: 'gateway',
        authorizerType: 'AWS_IAM',
        protocolType: 'MCP',
        roleArn: 'arn:aws:iam::123456789012:role/gateway',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnGateway(stack, 'Gateway', {
        name: 'gateway',
        authorizerType: 'AWS_IAM',
        protocolType: 'MCP',
        roleArn: 'arn:aws:iam::123456789012:role/gateway',
        kmsKeyArn: '',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnGateway(stack, 'Gateway', {
        name: 'gateway',
        authorizerType: 'AWS_IAM',
        protocolType: 'MCP',
        roleArn: 'arn:aws:iam::123456789012:role/gateway',
        kmsKeyArn: new Key(stack, 'Key').keyArn,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('BedrockAgentCoreMemoryKMSKeyConfigured: Bedrock AgentCore memories are encrypted with a customer managed KMS key', () => {
    const ruleId = 'BedrockAgentCoreMemoryKMSKeyConfigured';
    test('Noncompliance 1', () => {
      new CfnMemory(stack, 'Memory', {
        name: 'memory',
        eventExpiryDuration: 30,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnMemory(stack, 'Memory', {
        name: 'memory',
        eventExpiryDuration: 30,
        encryptionKeyArn: '',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnMemory(stack, 'Memory', {
        name: 'memory',
        eventExpiryDuration: 30,
        encryptionKeyArn: new Key(stack, 'Key').keyArn,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('BedrockAgentCoreRuntimeNoPublicNetworkMode: Bedrock AgentCore runtimes are not configured with PUBLIC network mode', () => {
    const ruleId = 'BedrockAgentCoreRuntimeNoPublicNetworkMode';
    const runtimeProps = {
      agentRuntimeName: 'runtime',
      agentRuntimeArtifact: {
        containerConfiguration: {
          containerUri:
            '123456789012.dkr.ecr.us-east-1.amazonaws.com/agent:latest',
        },
      },
      roleArn: 'arn:aws:iam::123456789012:role/runtime',
    };
    test('Noncompliance 1', () => {
      new CfnRuntime(stack, 'Runtime', {
        ...runtimeProps,
        networkConfiguration: { networkMode: 'PUBLIC' },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnRuntime(stack, 'Runtime', {
        ...runtimeProps,
        networkConfiguration: {
          networkMode: 'VPC',
          networkModeConfig: vpcNetworkModeConfig,
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
    test('Error 1', () => {
      new CfnRuntime(stack, 'Runtime', {
        ...runtimeProps,
        networkConfiguration: Fn.conditionIf(
          'UseVpc',
          { NetworkMode: 'VPC', NetworkModeConfig: vpcNetworkModeConfig },
          { NetworkMode: 'PUBLIC' }
        ),
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
    test('Error 2', () => {
      new CfnRuntime(stack, 'Runtime', {
        ...runtimeProps,
        networkConfiguration: {
          networkMode: new CfnParameter(stack, 'NetworkMode').valueAsString,
        },
      });
      validateStack(stack, ruleId, TestType.ERROR);
    });
  });
});
