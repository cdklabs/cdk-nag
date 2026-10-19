/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { Aws, CfnParameter, Fn, Lazy, Stack } from 'aws-cdk-lib';
import { CfnAgent, CfnDataSource, CfnGuardrail } from 'aws-cdk-lib/aws-bedrock';
import { Key } from 'aws-cdk-lib/aws-kms';
import { CfnBucket } from 'aws-cdk-lib/aws-s3';
import { NagRuleCompliance, rules } from '../../src';

const {
  BedrockAgentGuardrailConfigured,
  BedrockAgentKMSKeyConfigured,
  BedrockDataSourceKMSKeyConfigured,
  BedrockGuardrailKMSKeyConfigured,
} = rules.bedrock;
const keyArn =
  'arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012';
let stack: Stack;
beforeEach(() => {
  stack = new Stack();
});

function createAgent(kmsKeyArn?: string): CfnAgent {
  return new CfnAgent(stack, 'Agent', {
    agentName: 'test-agent',
    customerEncryptionKeyArn: kmsKeyArn,
  });
}

function createGuardrail(kmsKeyArn?: string): CfnGuardrail {
  return new CfnGuardrail(stack, 'Guardrail', {
    name: 'test-guardrail',
    blockedInputMessaging: 'Input blocked.',
    blockedOutputsMessaging: 'Output blocked.',
    kmsKeyArn,
  });
}

function createDataSource(kmsKeyArn?: string): CfnDataSource {
  return new CfnDataSource(stack, 'DataSource', {
    name: 'test-data-source',
    knowledgeBaseId: 'ABCDEFGHIJ',
    dataSourceConfiguration: { type: 'CUSTOM' },
    serverSideEncryptionConfiguration: { kmsKeyArn },
  });
}

describe.each([
  [BedrockAgentKMSKeyConfigured, createAgent],
  [BedrockGuardrailKMSKeyConfigured, createGuardrail],
  [BedrockDataSourceKMSKeyConfigured, createDataSource],
] as const)('%p', (rule, createResource) => {
  test.each([undefined, '', Aws.NO_VALUE])(
    'rejects an absent key: %p',
    (key) => {
      expect(rule(createResource(key))).toBe(NagRuleCompliance.NON_COMPLIANT);
    }
  );

  test('rejects a lazy key that resolves to undefined', () => {
    const resource = createResource(Lazy.string({ produce: () => undefined }));
    expect(rule(resource)).toBe(NagRuleCompliance.NON_COMPLIANT);
  });

  test('accepts an explicit key ARN', () => {
    expect(rule(createResource(keyArn))).toBe(NagRuleCompliance.COMPLIANT);
  });

  test('accepts a reference to a KMS key', () => {
    const key = new Key(stack, 'Key');
    expect(rule(createResource(key.keyArn))).toBe(NagRuleCompliance.COMPLIANT);
  });

  test('accepts a key supplied through a CloudFormation parameter', () => {
    const key = new CfnParameter(stack, 'KeyArn');
    expect(rule(createResource(key.valueAsString))).toBe(
      NagRuleCompliance.COMPLIANT
    );
  });

  test('rejects a conditional key that can be removed', () => {
    const key = Fn.conditionIf('UseKey', keyArn, Aws.NO_VALUE).toString();
    expect(rule(createResource(key))).toBe(NagRuleCompliance.NON_COMPLIANT);
  });

  test('accepts conditional keys when both branches configure a key', () => {
    const key = new Key(stack, 'Key');
    const conditionalKey = Fn.conditionIf(
      'UseKey',
      keyArn,
      key.keyArn
    ).toString();
    expect(rule(createResource(conditionalKey))).toBe(
      NagRuleCompliance.COMPLIANT
    );
  });

  test('does not apply to other resource types', () => {
    expect(rule(new CfnBucket(stack, 'Bucket'))).toBe(
      NagRuleCompliance.NOT_APPLICABLE
    );
  });
});

describe('BedrockDataSourceKMSKeyConfigured', () => {
  test('rejects a missing encryption configuration', () => {
    const source = createDataSource();
    source.serverSideEncryptionConfiguration = undefined;
    expect(BedrockDataSourceKMSKeyConfigured(source)).toBe(
      NagRuleCompliance.NON_COMPLIANT
    );
  });

  test('accepts conditional encryption configurations', () => {
    const source = createDataSource();
    source.serverSideEncryptionConfiguration = Fn.conditionIf(
      'SelectKey',
      { kmsKeyArn: keyArn },
      { kmsKeyArn: new Key(stack, 'Key').keyArn }
    );
    expect(BedrockDataSourceKMSKeyConfigured(source)).toBe(
      NagRuleCompliance.COMPLIANT
    );
  });

  test('rejects conditional encryption with an empty branch', () => {
    const source = createDataSource();
    source.serverSideEncryptionConfiguration = Fn.conditionIf(
      'UseKey',
      { kmsKeyArn: keyArn },
      Aws.NO_VALUE
    );
    expect(BedrockDataSourceKMSKeyConfigured(source)).toBe(
      NagRuleCompliance.NON_COMPLIANT
    );
  });

  test('resolves a lazy encryption configuration', () => {
    const source = createDataSource();
    source.serverSideEncryptionConfiguration = Lazy.any({
      produce: () => ({ kmsKeyArn: keyArn }),
    });
    expect(BedrockDataSourceKMSKeyConfigured(source)).toBe(
      NagRuleCompliance.COMPLIANT
    );
  });
});

describe('BedrockAgentGuardrailConfigured', () => {
  test.each([
    undefined,
    {},
    { guardrailIdentifier: 'abcdef123456' },
    { guardrailVersion: '1' },
    { guardrailIdentifier: '', guardrailVersion: '1' },
    { guardrailIdentifier: 'abcdef123456', guardrailVersion: '' },
    { guardrailIdentifier: Aws.NO_VALUE, guardrailVersion: '1' },
    { guardrailIdentifier: 'abcdef123456', guardrailVersion: Aws.NO_VALUE },
  ])('rejects an incomplete guardrail association: %p', (configuration) => {
    const agent = createAgent();
    agent.guardrailConfiguration = configuration;
    expect(BedrockAgentGuardrailConfigured(agent)).toBe(
      NagRuleCompliance.NON_COMPLIANT
    );
  });

  test.each(['1', 'DRAFT'])('accepts guardrail version %s', (version) => {
    const agent = createAgent();
    agent.guardrailConfiguration = {
      guardrailIdentifier: 'abcdef123456',
      guardrailVersion: version,
    };
    expect(BedrockAgentGuardrailConfigured(agent)).toBe(
      NagRuleCompliance.COMPLIANT
    );
  });

  test('accepts a guardrail ARN', () => {
    const agent = createAgent();
    agent.guardrailConfiguration = {
      guardrailIdentifier:
        'arn:aws:bedrock:us-east-1:123456789012:guardrail/abcdef123456',
      guardrailVersion: '1',
    };
    expect(BedrockAgentGuardrailConfigured(agent)).toBe(
      NagRuleCompliance.COMPLIANT
    );
  });

  test('resolves lazy configuration with resource references', () => {
    const guardrail = createGuardrail();
    const agent = createAgent();
    agent.guardrailConfiguration = Lazy.any({
      produce: () => ({
        guardrailIdentifier: guardrail.attrGuardrailId,
        guardrailVersion: guardrail.attrVersion,
      }),
    });
    expect(BedrockAgentGuardrailConfigured(agent)).toBe(
      NagRuleCompliance.COMPLIANT
    );
  });

  test('rejects an identifier that resolves to undefined', () => {
    const agent = createAgent();
    agent.guardrailConfiguration = {
      guardrailIdentifier: Lazy.string({ produce: () => undefined }),
      guardrailVersion: '1',
    };
    expect(BedrockAgentGuardrailConfigured(agent)).toBe(
      NagRuleCompliance.NON_COMPLIANT
    );
  });

  test('accepts conditional guardrail configurations', () => {
    const agent = createAgent();
    agent.guardrailConfiguration = Fn.conditionIf(
      'SelectGuardrail',
      { guardrailIdentifier: 'abcdef123456', guardrailVersion: '1' },
      { guardrailIdentifier: 'fedcba654321', guardrailVersion: 'DRAFT' }
    );
    expect(BedrockAgentGuardrailConfigured(agent)).toBe(
      NagRuleCompliance.COMPLIANT
    );
  });

  test('rejects a conditional guardrail version that can be removed', () => {
    const agent = createAgent();
    agent.guardrailConfiguration = {
      guardrailIdentifier: 'abcdef123456',
      guardrailVersion: Fn.conditionIf(
        'UseGuardrail',
        '1',
        Aws.NO_VALUE
      ).toString(),
    };
    expect(BedrockAgentGuardrailConfigured(agent)).toBe(
      NagRuleCompliance.NON_COMPLIANT
    );
  });

  test('rejects a nested conditional guardrail with an incomplete branch', () => {
    const agent = createAgent();
    agent.guardrailConfiguration = Fn.conditionIf(
      'UseGuardrail',
      { guardrailIdentifier: 'abcdef123456', guardrailVersion: '1' },
      Fn.conditionIf(
        'UseFallback',
        { guardrailIdentifier: 'fedcba654321', guardrailVersion: '1' },
        { guardrailIdentifier: 'fedcba654321' }
      )
    );
    expect(BedrockAgentGuardrailConfigured(agent)).toBe(
      NagRuleCompliance.NON_COMPLIANT
    );
  });

  test('does not apply to a guardrail resource', () => {
    expect(BedrockAgentGuardrailConfigured(createGuardrail())).toBe(
      NagRuleCompliance.NOT_APPLICABLE
    );
  });
});
