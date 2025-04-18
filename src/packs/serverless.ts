import { CfnResource } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
import { NagPack, NagPackProps } from '../nag-pack';
import { NagMessageLevel } from '../nag-rules';
import {
  apigw,
  appsync,
  cloudwatch,
  eventbridge,
  iam,
  lambda,
  sns,
  sqs,
  stepfunctions,
} from '../rules';

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
      this.checkIAM(node);
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
      info: 'The Lambda function does not have tracing set to Tracing.ACTIVE.',
      explanation:
        'When a Lambda function has ACTIVE tracing, Lambda automatically samples invocation requests, based on the sampling algorithm specified by X-Ray.',
      level: NagMessageLevel.WARN,
      rule: lambda.LambdaTracing,
      node: node,
    });

    this.applyRule({
      info: 'Lambda Event Source Mapping does not have a destination configured for failed invocations.',
      explanation:
        'Configuring a destination for failed invocations in Lambda Event Source Mappings allows you to capture and process events that fail to be processed by your Lambda function. This helps in monitoring, debugging, and implementing retry mechanisms for failed events, improving the reliability and observability of your serverless applications.',
      level: NagMessageLevel.ERROR,
      rule: lambda.LambdaEventSourceMappingDestination,
      node: node,
    });

    this.applyRule({
      info: 'Lambda function does not utilize the latest available runtime version.',
      explanation:
        "Using the latest runtime version ensures that your Lambda function has access to the most recent features, performance improvements, and security updates. It's important to regularly update your Lambda functions to use the latest runtime versions to maintain optimal performance and security.",
      level: NagMessageLevel.WARN,
      rule: lambda.LambdaLatestVersion,
      node: node,
    });

    this.applyRule({
      info: 'Lambda function does not have a configured failure destination for asynchronous invocations.',
      explanation:
        "When a Lambda function is invoked asynchronously (e.g., by S3, SNS, or EventBridge), it's important to configure a failure destination. This allows you to capture and handle events that fail processing, improving the reliability and observability of your serverless applications.",
      level: NagMessageLevel.ERROR,
      rule: lambda.LambdaAsyncFailureDestination,
      node: node,
    });

    this.applyRule({
      info: 'Lambda function does not have an explicit memory value configured',
      explanation:
        "Lambda allocates CPU power in proportion to the amount of memory configured. By default, your functions have 128 MB of memory allocated. You can increase that value up to 10 GB. With more CPU resources, your Lambda function's duration might decrease.  You can use tools such as AWS Lambda Power Tuning to test your function at different memory settings to find the one that matches your cost and performance requirements the best.",
      level: NagMessageLevel.ERROR,
      rule: lambda.LambdaDefaultMemorySize,
      node: node,
    });

    this.applyRule({
      info: 'Lambda function does not have an explicitly defined timeout value.',
      explanation:
        'Lambda functions have a default timeout of 3 seconds.  If your timeout value is too short, Lambda might terminate invocations prematurely. On the other side, setting the timeout much higher than the average execution may cause functions to execute for longer upon code malfunction, resulting in higher costs and possibly reaching concurrency limits depending on how such functions are invoked. You can also use AWS Lambda Power Tuning to test your function at different timeout settings to find the one that matches your cost and performance requirements the best.',
      level: NagMessageLevel.ERROR,
      rule: lambda.LambdaDefaultTimeout,
      node: node,
    });

    this.applyRule({
      info: 'Lambda function does not have a dead letter target configured.',
      explanation:
        'When a lambda function has the DeadLetterConfig property set, failed messages can be temporarily stored for review in an SQS queue or an SNS topic.',
      level: NagMessageLevel.ERROR,
      rule: lambda.LambdaDLQ,
      node: node,
    });

    this.applyRule({
      info: 'Lambda function does not use the latest runtime version.',
      explanation:
        "Using the latest runtime version ensures that your Lambda function has access to the most recent features, performance improvements, and security updates. It's important to regularly update your Lambda functions to use the latest runtime versions to maintain optimal performance and security.",
      level: NagMessageLevel.ERROR,
      rule: lambda.LambdaLatestVersion,
      node: node,
    });

    this.applyRule({
      info: 'Lambda Event Source Mappings does not have a destination configured for failed invocations.',
      explanation:
        'Configuring a destination for failed invocations in Lambda Event Source Mappings allows you to capture and process events that fail to be processed by your Lambda function. This helps in monitoring, debugging, and implementing retry mechanisms for failed events, improving the reliability and observability of your serverless applications.',
      level: NagMessageLevel.ERROR,
      rule: lambda.LambdaEventSourceMappingDestination,
      node: node,
    });
  }

  /**
   * Check Lambda Resources
   * @param node the CfnResource to check
   * @param ignores list of ignores for the resource
   */
  private checkIAM(node: CfnResource) {
    this.applyRule({
      info: 'Lambda function has overly permissive IAM roles.',
      explanation:
        'Lambda functions should follow the principle of least privilege. Avoid using wildcard (*) permissions in IAM roles attached to Lambda functions. Instead, specify only the permissions required for the function to operate.',
      level: NagMessageLevel.WARN,
      rule: iam.IAMNoWildcardPermissions,
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
      info: 'CloudWatch Log Group does not have an explicit retention policy defined.',
      explanation:
        'By default, logs are kept indefinitely and never expire. You can adjust the retention policy for each log group, keeping the indefinite retention, or choosing a retention period between one day and 10 years. For Lambda functions, this applies to their automatically created CloudWatch Log Groups.',
      level: NagMessageLevel.WARN,
      rule: cloudwatch.CloudWatchLogGroupRetentionPeriod,
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
      info: 'API Gateway Stage does not have access logging enabled.',
      explanation:
        'API Gateway provides access logging for API stages. Enable access logging on your API stages to monitor API requests and responses.',
      level: NagMessageLevel.ERROR,
      rule: apigw.APIGWAccessLogging,
      node: node,
    });
    this.applyRule({
      info: 'API Gateway does not have Tracing enabled.',
      explanation:
        'Amazon API Gateway provides active tracing support for AWS X-Ray. Enable active tracing on your API stages to sample incoming requests and send traces to X-Ray.',
      level: NagMessageLevel.ERROR,
      rule: apigw.APIGWXrayEnabled,
      node: node,
    });
    this.applyRule({
      info: 'API Gateway logs are not configured for the JSON format.',
      explanation:
        'You can customize the log format that Amazon API Gateway uses to send logs. JSON Structured logging makes it easier to derive queries to answer arbitrary questions about the health of your application.',
      level: NagMessageLevel.ERROR,
      rule: apigw.APIGWStructuredLogging,
      node: node,
    });
    this.applyRule({
      info: 'API Gateway Stage is using default throttling setting.',
      explanation:
        'API Gateway default throttling settings may not be suitable for all applications. Custom throttling limits help protect your backend systems from being overwhelmed with requests, ensure consistent performance, and can be tailored to your specific use case.',
      level: NagMessageLevel.ERROR,
      rule: apigw.APIGWDefaultThrottling,
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
      info: 'AppSync API does not have tracing enabled',
      explanation:
        'AWS AppSync can emit traces to AWS X-Ray, which enables visualizing service maps for faster troubleshooting.',
      level: NagMessageLevel.WARN,
      rule: appsync.AppSyncTracing,
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
      info: 'EventBridge Target does not have a DLQ configured.',
      explanation:
        "Configuring a Dead-Letter Queue (DLQ) for EventBridge rules helps manage failed event deliveries. When a rule's target fails to process an event, the DLQ captures these failed events, allowing for analysis, troubleshooting, and potential reprocessing. This improves the reliability and observability of your event-driven architectures by providing a safety net for handling delivery failures.",
      level: NagMessageLevel.ERROR,
      rule: eventbridge.EventBusDLQ,
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
      info: 'SNS subscription does not have a redrive policy configured.',
      explanation:
        'Configuring a redrive policy helps manage message delivery failures by sending undeliverable messages to a dead-letter queue.',
      level: NagMessageLevel.ERROR,
      rule: sns.SNSRedrivePolicy,
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
      info: 'SQS queue does not have a redrive policy configured.',
      explanation:
        'Configuring a redrive policy on an SQS queue allows you to define how many times SQS will make messages available for consumers before sending them to a dead-letter queue. This helps in managing message processing failures and provides a mechanism for handling problematic messages.',
      level: NagMessageLevel.ERROR,
      rule: sqs.SQSRedrivePolicy,
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
      info: 'StepFunction does not have X-Ray tracing configured.',
      explanation:
        'AWS StepFunctions provides active tracing support for AWS X-Ray. Enable active tracing on your API stages to sample incoming requests and send traces to X-Ray.',
      level: NagMessageLevel.ERROR,
      rule: stepfunctions.StepFunctionStateMachineXray,
      node: node,
    });
  }
}
