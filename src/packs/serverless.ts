import { CfnResource } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
import { NagPack, NagPackProps } from '../nag-pack';
import { NagMessageLevel } from '../nag-rules';
import {
  APIGWAccessLogging,
  APIGWXrayEnabled,
  APIGWStructuredLogging,
} from '../rules/apigw';
import { AppSyncTracing } from '../rules/appsync';
import { CloudWatchLogGroupRetentionPeriod } from '../rules/cloudwatch';
import { EventBusDLQ } from '../rules/eventbridge';
import {
  LambdaDLQ,
  LambdaDefaultMemorySize,
  LambdaLogLevel,
  LambdaDefaultTimeout,
  LambdaTracing,
} from '../rules/lambda';
import { SNSDeadLetterQueue } from '../rules/sns';
import { SQSQueueDLQ } from '../rules/sqs';
import {
  StepFunctionStateMachineAllLogsToCloudWatch,
  StepFunctionStateMachineXray,
} from '../rules/stepfunctions';

/**
 * Serverless Checks are a compilation of rules to validate infrastructure-as-code template against recommended practices.
 *
 */
export class ServerlessChecks extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Serverless';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      this.checkLambda(node);
      this.checkCloudwatch(node);
      this.checkApiGw(node);
      this.checkAppSync(node);
      this.checkEventBridge(node);
      this.checkSNS(node);
      this.checkSQS(node);
      this.checkStepFunctions(node);
    }
  }

  /**
   * Check Lambda Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkLambda(node: CfnResource) {
    this.applyRule({
      info: 'Ensure that Lambda functions have an explcity timeout value',
      explanation:
        'Lambda functions have a default timeout of 3 seconds.  If your timeout value is too short, Lambda might terminate invocations prematurely. On the other side, setting the timeout much higher than the average execution may cause functions to execute for longer upon code malfunction, resulting in higher costs and possibly reaching concurrency limits depending on how such functions are invoked. You can also use AWS Lambda Power Tuning to test your function at different timeout settings to find the one that matches your cost and performance requirements the best.',
      level: NagMessageLevel.ERROR,
      rule: LambdaDefaultTimeout,
      node: node,
    });
    this.applyRule({
      info: 'Ensure that Lambda functions have an explicit memory value',
      explanation:
        "Lambda allocates CPU power in proportion to the amount of memory configured. By default, your functions have 128 MB of memory allocated. You can increase that value up to 10 GB. With more CPU resources, your Lambda function's duration might decrease.  You can use tools such as AWS Lambda Power Tuning to test your function at different memory settings to find the one that matches your cost and performance requirements the best.",
      level: NagMessageLevel.ERROR,
      rule: LambdaDefaultMemorySize,
      node: node,
    });
    this.applyRule({
      info: 'Ensure Lambda functions have a onFaliure destination configured',
      explanation:
        'When a lambda function has a onFailure destination configured, failed messages can be temporarily stored to be later reviewed',
      level: NagMessageLevel.ERROR,
      rule: LambdaDLQ,
      node: node,
    });
    this.applyRule({
      info: 'The Lambda function should have tracing set to Tracing.ACTIVE',
      explanation:
        'When a Lambda function has ACTIVE tracing, Lambda automatically samples invocation requests, based on the sampling algorithm specified by X-Ray.',
      level: NagMessageLevel.ERROR,
      rule: LambdaTracing,
      node: node,
    });

    this.applyRule({
      info: 'Ensure that Lambda functions have a corresponding Log Group',
      explanation:
        'Lambda captures logs for all requests handled by your function and sends them to Amazon CloudWatch Logs.  You can insert logging statements into your code to help you validate that your code is working as expected. Lambda sends all logs from your code to the CloudWatch logs group associated with a Lambda function.',
      level: NagMessageLevel.ERROR,
      rule: LambdaLogLevel,
      node: node,
    });

    this.applyRule({
      info: 'Ensure that Lambda functions have a defined DLQ',
      explanation:
        'When a Dead Letter Queue (DLQ) is specified, messages that fail to deliver to targets are stored in the Dead Letter Queue',
      level: NagMessageLevel.ERROR,
      rule: LambdaDLQ,
      node: node,
    });
  }

  /**
   * Check Cloudwatch Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkCloudwatch(node: CfnResource) {
    this.applyRule({
      info: 'Ensure that CloudWatch Log Groups have an explcity retention policy',
      explanation:
        'By default, logs are kept indefinitely and never expire. You can adjust the retention policy for each log group, keeping the indefinite retention, or choosing a retention period between 10 years and one day.',
      level: NagMessageLevel.ERROR,
      rule: CloudWatchLogGroupRetentionPeriod,
      node: node,
    });
  }

  /**
   * Check API Gateway Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkApiGw(node: CfnResource) {
    this.applyRule({
      info: 'Ensure tracing is enabled',
      explanation:
        'Amazon API Gateway provides active tracing support for AWS X-Ray. Enable active tracing on your API stages to sample incoming requests and send traces to X-Ray.',
      level: NagMessageLevel.ERROR,
      rule: APIGWXrayEnabled,
      node: node,
    });
    this.applyRule({
      info: 'Ensure API Gateway stages have access logging enabled',
      explanation:
        'API Gateway provides access logging for API stages. Enable access logging on your API stages to monitor API requests and responses.',
      level: NagMessageLevel.ERROR,
      rule: APIGWAccessLogging,
      node: node,
    });
    this.applyRule({
      info: 'Ensure API Gateway stages have access logging enabled',
      explanation:
        'API Gateway provides access logging for API stages. Enable access logging on your API stages to monitor API requests and responses.',
      level: NagMessageLevel.ERROR,
      rule: APIGWStructuredLogging,
      node: node,
    });
  }

  /**
   * Check AppSync Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkAppSync(node: CfnResource) {
    this.applyRule({
      info: 'Ensure tracing is enabled',
      explanation:
        'AWS AppSync provides active tracing support for AWS X-Ray. Enable active tracing on your API stages to sample incoming requests and send traces to X-Ray.',
      level: NagMessageLevel.ERROR,
      rule: AppSyncTracing,
      node: node,
    });
  }

  /**
   * Check EventBridge Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkEventBridge(node: CfnResource) {
    this.applyRule({
      info: 'Ensure eventbridge targets have a DLQ configured',
      explanation:
        'When a Dead Letter Queue (DLQ) is specified, messages that fail to deliver to targets are stored in the Dead Letter Queue',
      level: NagMessageLevel.ERROR,
      rule: EventBusDLQ,
      node: node,
    });
  }

  /**
   * Check SNS Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkSNS(node: CfnResource) {
    this.applyRule({
      info: 'Ensure SNS subscriptions have a DLQ configured',
      explanation:
        'When a Dead Letter Queue (DLQ) is specified, messages that fail to deliver to targets are stored in the Dead Letter Queue',
      level: NagMessageLevel.ERROR,
      rule: SNSDeadLetterQueue,
      node: node,
    });
  }

  /**
   * Check SQS Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkSQS(node: CfnResource) {
    this.applyRule({
      info: 'Ensure SQS queues have a DLQ configured',
      explanation:
        'When a Dead Letter Queue (DLQ) is specified, messages that fail to deliver to targets are stored in the Dead Letter Queue',
      level: NagMessageLevel.ERROR,
      rule: SQSQueueDLQ,
      node: node,
    });
  }

  /**
   * Check StepFunctions Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkStepFunctions(node: CfnResource) {
    this.applyRule({
      info: 'Ensure StepFunctions have a DLQ configured',
      explanation:
        'AWS StepFunctions provides active tracing support for AWS X-Ray. Enable active tracing on your API stages to sample incoming requests and send traces to X-Ray.',
      level: NagMessageLevel.ERROR,
      rule: StepFunctionStateMachineXray,
      node: node,
    });
    this.applyRule({
      info: 'Ensure Stepfunctions have been configured to log all events to cloudwatch',
      explanation:
        'When a logging configuration is configured, errors can be captured in CLoudWatch Logs',
      level: NagMessageLevel.ERROR,
      rule: StepFunctionStateMachineAllLogsToCloudWatch,
      node: node,
    });
  }
}
