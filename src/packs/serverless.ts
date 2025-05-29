/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnResource } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
import { NagPack, NagPackProps } from '../nag-pack';
import { NagMessageLevel } from '../nag-rules';
import {
  APIGWAccessLogging,
  APIGWDefaultThrottling,
  APIGWStructuredLogging,
  APIGWXrayEnabled,
} from '../rules/apigw';
import { AppSyncTracing } from '../rules/appsync';
import { CloudWatchLogGroupRetentionPeriod } from '../rules/cloudwatch';
import { EventBusDLQ } from '../rules/eventbridge';
import {
  LambdaAsyncFailureDestination,
  LambdaDefaultMemorySize,
  LambdaDefaultTimeout,
  LambdaDLQ,
  LambdaEventSourceMappingDestination,
  LambdaLatestVersion,
  LambdaStarPermissions,
  LambdaTracing,
} from '../rules/lambda';
import { SNSRedrivePolicy } from '../rules/sns';
import { SQSRedrivePolicy } from '../rules/sqs';
import { StepFunctionStateMachineXray } from '../rules/stepfunctions';

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
      info: 'The Lambda function does not have a configured failure destination for asynchronous invocations.',
      explanation:
        "When a Lambda function is invoked asynchronously (e.g., by S3, SNS, or EventBridge), it's important to configure a failure destination. This allows you to capture and handle events that fail processing, improving the reliability and observability of your serverless applications.",
      level: NagMessageLevel.ERROR,
      rule: LambdaAsyncFailureDestination,
      node: node,
    });

    this.applyRule({
      info: 'The Lambda function does not have an explicit memory value configured.',
      explanation:
        "Lambda allocates CPU power in proportion to the amount of memory configured. By default, your functions have 128 MB of memory allocated. You can increase that value up to 10 GB. With more CPU resources, your Lambda function's duration might decrease.  You can use tools such as AWS Lambda Power Tuning to test your function at different memory settings to find the one that matches your cost and performance requirements the best.",
      level: NagMessageLevel.ERROR,
      rule: LambdaDefaultMemorySize,
      node: node,
    });

    this.applyRule({
      info: 'The Lambda function does not have an explicitly defined timeout value.',
      explanation:
        'Lambda functions have a default timeout of 3 seconds. If your timeout value is too short, Lambda might terminate invocations prematurely. On the other side, setting the timeout much higher than the average execution may cause functions to execute for longer upon code malfunction, resulting in higher costs and possibly reaching concurrency limits depending on how such functions are invoked. You can also use AWS Lambda Power Tuning to test your function at different timeout settings to find the one that matches your cost and performance requirements the best.',
      level: NagMessageLevel.ERROR,
      rule: LambdaDefaultTimeout,
      node: node,
    });

    this.applyRule({
      info: 'The Lambda function does not have a dead letter target configured.',
      explanation:
        'When a Lambda function has the DeadLetterConfig property set, failed messages can be temporarily stored for review in an SQS queue or an SNS topic.',
      level: NagMessageLevel.ERROR,
      rule: LambdaDLQ,
      node: node,
    });

    this.applyRule({
      info: 'The Lambda Event Source Mapping does not have a destination configured for failed invocations.',
      explanation:
        'Configuring a destination for failed invocations in Lambda Event Source Mappings allows you to capture and process events that fail to be processed by your Lambda function. This helps in monitoring, debugging, and implementing retry mechanisms for failed events, improving the reliability and observability of your serverless applications.',
      level: NagMessageLevel.ERROR,
      rule: LambdaEventSourceMappingDestination,
      node: node,
    });

    this.applyRule({
      info: 'The Lambda function does not use the latest runtime version.',
      explanation:
        'Using the latest runtime version ensures that your Lambda function has access to the most recent features, performance improvements, and security updates. It is important to regularly update your Lambda functions to use the latest runtime versions to maintain optimal performance and security.',
      level: NagMessageLevel.ERROR,
      rule: LambdaLatestVersion,
      node: node,
    });

    this.applyRule({
      info: 'The Lambda IAM role uses wildcard permissions.',
      explanation:
        'You should follow least-privileged access and only allow the access needed to perform a given operation. If your Lambda function needs a broad range of permissions, you should know ahead of time which permissions you will need, have evaluated the risks of using broad permissions and can suppress this rule.',
      level: NagMessageLevel.WARN,
      rule: LambdaStarPermissions,
      node: node,
    });

    this.applyRule({
      info: 'The Lambda function does not have tracing set to Tracing.ACTIVE.',
      explanation:
        'When a Lambda function has ACTIVE tracing, Lambda automatically samples invocation requests, based on the sampling algorithm specified by X-Ray.',
      level: NagMessageLevel.WARN,
      rule: LambdaTracing,
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
      info: 'The CloudWatch Log Group does not have an explicit retention policy defined.',
      explanation:
        'By default, logs are kept indefinitely and never expire. You can adjust the retention policy for each log group, keeping the indefinite retention, or choosing a retention period between one day and 10 years. For Lambda functions, this applies to their automatically created CloudWatch Log Groups.',
      level: NagMessageLevel.WARN,
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
      info: 'The API Gateway Stage does not have access logging enabled.',
      explanation:
        'API Gateway provides access logging for API stages. Enable access logging on your API stages to monitor API requests and responses.',
      level: NagMessageLevel.ERROR,
      rule: APIGWAccessLogging,
      node: node,
    });

    this.applyRule({
      info: 'The API Gateway Stage is using default throttling setting.',
      explanation:
        'API Gateway default throttling settings may not be suitable for all applications. Custom throttling limits help protect your backend systems from being overwhelmed with requests, ensure consistent performance, and can be tailored to your specific use case.',
      level: NagMessageLevel.ERROR,
      rule: APIGWDefaultThrottling,
      node: node,
    });

    this.applyRule({
      info: 'The API Gateway logs are not configured for the JSON format.',
      explanation:
        'You can customize the log format that Amazon API Gateway uses to send logs. JSON Structured logging makes it easier to derive queries to answer arbitrary questions about the health of your application.',
      level: NagMessageLevel.WARN,
      rule: APIGWStructuredLogging,
      node: node,
    });

    this.applyRule({
      info: 'The API Gateway does not have Tracing enabled.',
      explanation:
        'Amazon API Gateway provides active tracing support for AWS X-Ray. Enable active tracing on your API stages to sample incoming requests and send traces to X-Ray.',
      level: NagMessageLevel.WARN,
      rule: APIGWXrayEnabled,
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
      info: 'The AppSync API does not have tracing enabled',
      explanation:
        'AWS AppSync can emit traces to AWS X-Ray, which enables visualizing service maps for faster troubleshooting.',
      level: NagMessageLevel.WARN,
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
      info: 'The EventBridge Target does not have a DLQ configured.',
      explanation:
        "Configuring a Dead-Letter Queue (DLQ) for EventBridge rules helps manage failed event deliveries. When a rule's target fails to process an event, the DLQ captures these failed events, allowing for analysis, troubleshooting, and potential reprocessing. This improves the reliability and observability of your event-driven architectures by providing a safety net for handling delivery failures.",
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
      info: 'The SNS subscription does not have a redrive policy configured.',
      explanation:
        'Configuring a redrive policy helps manage message delivery failures by sending undeliverable messages to a dead-letter queue.',
      level: NagMessageLevel.ERROR,
      rule: SNSRedrivePolicy,
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
      info: 'The SQS queue does not have a redrive policy configured.',
      explanation:
        'Configuring a redrive policy on an SQS queue allows you to define how many times SQS will make messages available for consumers before sending them to a dead-letter queue. This helps in managing message processing failures and provides a mechanism for handling problematic messages.',
      level: NagMessageLevel.ERROR,
      rule: SQSRedrivePolicy,
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
      info: 'The StepFunction state machine does not have X-Ray tracing configured.',
      explanation:
        'AWS StepFunctions provides active tracing support for AWS X-Ray. Enable active tracing on your API stages to sample incoming requests and send traces to X-Ray.',
      level: NagMessageLevel.ERROR,
      rule: StepFunctionStateMachineXray,
      node: node,
    });
  }
}
