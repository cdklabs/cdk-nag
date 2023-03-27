<!--
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
-->

# NagLogger

`NagLogger`s give `NagPack` authors and users the ability to create their own custom reporting mechanisms. All pre-built`NagPacks`come with the`AnnotationsLogger`and the`CsvNagReportLogger` enabled by default.

## Creating A NagLogger

`NagLogger`s implement the `INagLogger` interface. Corresponding `INagLogger` method of a loggers is called after a `CfnResource` is evaluated against a `NagRule`. Each of these methods are passed information that relate to the validation state.

1. The `onCompliance` method is called when a CfnResource passes the compliance check for a given rule.
2. The `onNonCompliance` method is called when a CfnResource does not pass the compliance check for a given rule and the the rule violation is not suppressed by the user.
3. The `onSuppressed` method is called when a CfnResource does not pass the compliance check for a given rule **and** the rule violation is suppressed by the user.
4. The `onError` method is called when a rule throws an error during while validating a CfnResource for compliance.
5. The `onSuppressedError` method is called when a rule throws an error during while validating a CfnResource for compliance **and** the error is suppressed.
6. The `onNotApplicable` method is called when a rule does not apply to the given CfnResource.

Here is an example of a basic console logger that outputs a small amount of the provided information

```ts
import { INagLogger } from 'cdk-nag';
export class ExtremelyHelpfulConsoleLogger implements INagLogger {
  onCompliance(data: NagLoggerComplianceData): void {
    console.log(
      `Yay! ${data.resource.logicalId} is compliant to ${data.ruleId}`
    );
  }
  onNonCompliance(data: NagLoggerNonComplianceData): void {
    console.log(
      `Boo! ${data.resource.logicalId} is non-compliant to ${data.ruleId}`
    );
  }
  onSuppressed(data: NagLoggerSuppressedData): void {
    console.log(
      `Hmmmm... ${data.ruleId} has been suppressed on ${data.resource.logicalId} with the following reason ${data.suppressionReason}`
    );
  }
  onError(data: NagLoggerErrorData): void {
    console.log(
      `WHAT?!?! ${data.ruleId} encountered an error during validation!`
    );
  }
  onSuppressedError(data: NagLoggerSuppressedErrorData): void {
    console.log(
      `PHEW! ${data.ruleId} encountered an error during validation, but was suppressed with the following reason ${data.errorSuppressionReason}.`
    );
  }
  onNotApplicable(data: NagLoggerNotApplicableData): void {
    console.log(
      `Meh. ${data.ruleId} and ${data.resource.logicalId} aren't related at all, but I still want to say something.`
    );
  }
}
```

### Adding NagLoggers to your NagPack

There are 2 ways of adding loggers to a `NagPack`. Users can supply additional loggers when instantiating a `NagPack` that gets applied to all rules. Ultimately `NagPack` authors have the final say can add/remove loggers in the `NagPack` constructor.

Here is an example of a `NagPack` author adding the `ExtremelyHelpfulConsoleLogger` to their pack.

```ts
import { CfnResource } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
import {
  NagMessageLevel,
  NagPack,
  NagPackProps,
  NagRuleCompliance,
  NagRuleResult,
  NagRules,
  rules,
} from 'cdk-nag';

export class ExampleChecks extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Example';
    this.loggers.push(new ExtremelyHelpfulConsoleLogger());
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      this.applyRule({
        info: 'My brief info.',
        explanation: 'My detailed explanation.',
        level: NagMessageLevel.ERROR,
        rule: rules.s3.S3BucketSSLRequestsOnly,
        ignoreSuppressionCondition: ALWAYS_IGNORE,
        node: node,
      });
    }
  }
}
```
