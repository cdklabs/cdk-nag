/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { Aspects, Stack } from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import { CfnEventBusPolicy, CfnRule } from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { validateStack, TestType, TestPack } from './utils';
import { EventBusOpenAccess, EventBusDLQ } from '../../src/rules/eventbridge';

const testPack = new TestPack([EventBusOpenAccess, EventBusDLQ]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('EventBusDLQ: EventBridge rules have a Dead Letter Queue configured.', () => {
  const ruleId = 'EventBusDLQ';

  test('Noncompliance: Rule without DLQ', () => {
    new CfnRule(stack, 'RuleWithoutDLQ', {
      eventPattern: {
        source: ['aws.ec2'],
      },
      targets: [
        {
          arn: 'arn:aws:lambda:us-east-1:111122223333:function:MyFunction',
          id: 'Target1',
        },
      ],
    });
    validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
  });

  test('Compliance: Rule with DLQ', () => {
    new CfnRule(stack, 'RuleWithDLQ', {
      eventPattern: {
        source: ['aws.ec2'],
      },
      targets: [
        {
          arn: 'arn:aws:lambda:us-east-1:111122223333:function:MyFunction',
          id: 'Target1',
          deadLetterConfig: {
            arn: 'arn:aws:sqs:us-east-1:111122223333:MyDLQ',
          },
        },
      ],
    });
    validateStack(stack, ruleId, TestType.COMPLIANCE);
  });

  test('Compliance: Rule with multiple targets, all having DLQs', () => {
    new CfnRule(stack, 'RuleWithMultipleTargetsAllDLQ', {
      eventPattern: {
        source: ['aws.ec2'],
      },
      targets: [
        {
          arn: 'arn:aws:lambda:us-east-1:111122223333:function:Function1',
          id: 'Target1',
          deadLetterConfig: {
            arn: 'arn:aws:sqs:us-east-1:111122223333:DLQ1',
          },
        },
        {
          arn: 'arn:aws:lambda:us-east-1:111122223333:function:Function2',
          id: 'Target2',
          deadLetterConfig: {
            arn: 'arn:aws:sqs:us-east-1:111122223333:DLQ2',
          },
        },
      ],
    });
    validateStack(stack, ruleId, TestType.COMPLIANCE);
  });

  test('Noncompliance: Rule with multiple targets, one missing DLQ', () => {
    new CfnRule(stack, 'RuleWithMultipleTargetsOneMissingDLQ', {
      eventPattern: {
        source: ['aws.ec2'],
      },
      targets: [
        {
          arn: 'arn:aws:lambda:us-east-1:111122223333:function:Function1',
          id: 'Target1',
          deadLetterConfig: {
            arn: 'arn:aws:sqs:us-east-1:111122223333:DLQ1',
          },
        },
        {
          arn: 'arn:aws:lambda:us-east-1:111122223333:function:Function2',
          id: 'Target2',
        },
      ],
    });
    validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
  });

  describe('L2 Construct Tests', () => {
    test('Noncompliance: L2 Rule without DLQ', () => {
      const rule = new events.Rule(stack, 'L2RuleWithoutDLQ', {
        eventPattern: {
          source: ['aws.ec2'],
        },
      });
      rule.addTarget(
        new targets.LambdaFunction(
          new lambda.Function(stack, 'MyLambda', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: lambda.Code.fromInline('exports.handler = async () => {};'),
          })
        )
      );
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance: L2 Rule with DLQ', () => {
      const dlq = new sqs.Queue(stack, 'MyDLQ');
      const rule = new events.Rule(stack, 'L2RuleWithDLQ', {
        eventPattern: {
          source: ['aws.ec2'],
        },
      });
      rule.addTarget(
        new targets.LambdaFunction(
          new lambda.Function(stack, 'MyLambda', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: lambda.Code.fromInline('exports.handler = async () => {};'),
          }),
          {
            deadLetterQueue: dlq,
          }
        )
      );
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });

    test('Compliance: L2 Rule with multiple targets, all having DLQs', () => {
      const dlq1 = new sqs.Queue(stack, 'MyDLQ1');
      const dlq2 = new sqs.Queue(stack, 'MyDLQ2');
      const rule = new events.Rule(stack, 'L2RuleWithMultipleTargetsAllDLQ', {
        eventPattern: {
          source: ['aws.ec2'],
        },
      });
      rule.addTarget(
        new targets.LambdaFunction(
          new lambda.Function(stack, 'MyLambda1', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: lambda.Code.fromInline('exports.handler = async () => {};'),
          }),
          {
            deadLetterQueue: dlq1,
          }
        )
      );
      rule.addTarget(
        new targets.LambdaFunction(
          new lambda.Function(stack, 'MyLambda2', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: lambda.Code.fromInline('exports.handler = async () => {};'),
          }),
          {
            deadLetterQueue: dlq2,
          }
        )
      );
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });

    test('Noncompliance: L2 Rule with multiple targets, one missing DLQ', () => {
      const dlq = new sqs.Queue(stack, 'MyDLQ');
      const rule = new events.Rule(
        stack,
        'L2RuleWithMultipleTargetsOneMissingDLQ',
        {
          eventPattern: {
            source: ['aws.ec2'],
          },
        }
      );
      rule.addTarget(
        new targets.LambdaFunction(
          new lambda.Function(stack, 'MyLambda1', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: lambda.Code.fromInline('exports.handler = async () => {};'),
          }),
          {
            deadLetterQueue: dlq,
          }
        )
      );
      rule.addTarget(
        new targets.LambdaFunction(
          new lambda.Function(stack, 'MyLambda2', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: lambda.Code.fromInline('exports.handler = async () => {};'),
          })
        )
      );
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
  });
});

describe('Amazon EventBridge', () => {
  describe('EventBusOpenAccess: DMS replication instances are not public', () => {
    const ruleId = 'EventBusOpenAccess';
    test('Noncompliance 1', () => {
      new CfnEventBusPolicy(stack, 'rPolicy', {
        statementId: 'foo',
        action: 'events:*',
        principal: '*',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnEventBusPolicy(stack, 'rPolicy', {
        statementId: 'foo',
        statement: {
          Effect: 'Allow',
          Principal: '*',
          Action: 'events:*',
          Resource: 'arn:aws:events:us-east-1:111122223333:event-bus/default',
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new CfnEventBusPolicy(stack, 'rPolicy', {
        statementId: 'foo',
        statement: {
          Effect: 'Allow',
          Principal: {
            AWS: ['arn:aws:iam::111122223333:user/alice', '*'],
          },
          Action: 'events:*',
          Resource: 'arn:aws:events:us-east-1:111122223333:event-bus/default',
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4', () => {
      new CfnEventBusPolicy(stack, 'rPolicy', {
        statementId: 'foo',
        statement: {
          Effect: 'Allow',
          Principal: { AWS: '*' },
          Action: 'events:*',
          Condition: {},
          Resource: 'arn:aws:events:us-east-1:111122223333:event-bus/default',
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 5', () => {
      new CfnEventBusPolicy(stack, 'rPolicy', {
        statementId: 'foo',
        action: 'events:*',
        principal: '*',
        condition: {
          key: 'foo',
          type: 'bar',
          value: 'baz',
        },
        statement: {
          Effect: 'Allow',
          Principal: '*',
          Action: 'events:*',
          Resource: 'arn:aws:events:us-east-1:111122223333:event-bus/default',
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnEventBusPolicy(stack, 'rPolicy1', {
        statementId: 'foo',
        action: 'events:*',
        principal: '*',
        condition: {
          key: 'foo',
          type: 'bar',
          value: 'baz',
        },
      });
      new CfnEventBusPolicy(stack, 'rPolicy2', {
        statementId: 'foo',
        statement: {
          Effect: 'Allow',
          Principal: '*',
          Action: 'events:*',
          Resource: 'arn:aws:events:us-east-1:111122223333:event-bus/default',
          Condition: {
            StringEquals: { 'aws:PrincipalOrgID': 'o-1234567890' },
          },
        },
      });
      new CfnEventBusPolicy(stack, 'rPolicy3', {
        statementId: 'foo',
        statement: {
          Effect: 'Allow',
          Principal: {
            AWS: [
              'arn:aws:iam::111122223333:user/alice',
              'arn:aws:iam::111122223333:user/bob',
            ],
          },
          Action: 'events:*',
          Resource: 'arn:aws:events:us-east-1:111122223333:event-bus/default',
        },
      });
      new CfnEventBusPolicy(stack, 'rPolicy4', {
        statementId: 'foo',
        statement: {
          Effect: 'Deny',
          Principal: {
            AWS: '*',
          },
          Action: 'events:*',
          Resource: 'arn:aws:events:us-east-1:111122223333:event-bus/default',
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});
