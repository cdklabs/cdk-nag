<!--
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
-->

# Conditionally Ignoring Suppressions

As a [NagPack](./NagPack.md) author, you can optionally create a condition that prevent certain rules from being suppressed. You can create conditions for any variety of reasons. Examples include a condition that always ignores a suppression, a condition that ignores a suppression based on the date, a condition that ignores a suppression based on the reason.

## Creating and Applying a Condition

Conditions implement the `INagSuppressionIgnore` interface. They return a message string when the `createMessage()` method is called. If the method returns a non-empty string the suppression is ignored. Conversely if the method returns an empty string the suppression is allowed.

Here is an example of a re-usable condition class that ignores a suppression if the suppression reason doesn't contain the word `Arun`

```ts
import { INagSuppressionIgnore } from 'cdk-nag';
class ArunCondition implements INagSuppressionIgnore {
  createMessage(
    _resource: CfnResource,
    reason: string,
    _ruleId: string,
    _findingId: string
  ) {
    if (!reason.includes('Arun')) {
      return 'Only Arun can suppress errors!';
    }
    return '';
  }
}
```

You could also create the same condition without a class and by just implementing the interface

```ts
({
  createMessage(
    _resource: CfnResource,
    reason: string,
    _ruleId: string,
    _findingId: string
  ) {
    return !reason.includes('Arun') ? 'Only Arun can suppress errors!' : '';
  },
});
```

Here is an example of applying the `Arun` condition to the prebuilt `S3BucketSSLRequestsOnly` S3 Rule.

```ts
import { App, Aspects, CfnResource, Stack } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import {
  NagMessageLevel,
  NagPack,
  NagPackProps,
  NagSuppressions,
  rules,
} from 'cdk-nag';
import { IConstruct } from 'constructs';

export class ExampleChecks extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Example';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      this.applyRule({
        info: 'My brief info.',
        explanation: 'My detailed explanation.',
        level: NagMessageLevel.ERROR,
        rule: rules.s3.S3BucketSSLRequestsOnly,
        ignoreSuppressionCondition: {
          createMessage(
            _resource: CfnResource,
            reason: string,
            _ruleId: string,
            _findingId: string
          ) {
            return !reason.includes('Arun')
              ? 'Only Arun can suppress errors!'
              : '';
          },
        },
        node: node,
      });
    }
  }
}
```

A user would see the following output when attempting to synthesize an application using a non-compliant suppression on a S3 Bucket

```bash
[Info at /Test/bucket/Resource] The suppression for Example-S3BucketSSLRequestsOnly was ignored for the following reason(s).
        Only Arun can suppress errors!
[Error at /Test/bucket/Resource] Example-S3BucketSSLRequestsOnly: My brief info.
```

## Creating Complex Conditions

`cdk-nag` exposes both a `SuppressionIgnoreAnd` class and a `SuppressionIgnoreOr` to help developers create more complicated conditions

- `SuppressionIgnoreAnd`: Ignores the suppression if **ALL** of the given INagSuppressionIgnore return a non-empty message (logical and)
- `SuppressionIgnoreOr`: Ignores the suppression if **ANY** of the given INagSuppressionIgnore return a non-empty message (logical or)

Here is an example `SuppressionIgnoreAnd` that only allows suppressions when the reason contains the word `Arun` and the current year is before `2023`

```ts
import { SuppressionIgnoreAnd } from 'cdk-nag';

new SuppressionIgnoreAnd(
  {
    createMessage(
      _resource: CfnResource,
      reason: string,
      _ruleId: string,
      _findingId: string
    ) {
      return !reason.includes('Arun') ? 'Only Arun can suppress errors!' : '';
    },
  },
  {
    createMessage(
      _resource: CfnResource,
      _reason: string,
      _ruleId: string,
      _findingId: string
    ) {
      return Date.now() > Date.parse('01 Jan 2023 00:00:00 UTC')
        ? 'Suppressions are only allowed before the year 2023'
        : '';
    },
  }
);
```

A user would see the following output when attempting to synthesize an application using a non-compliant suppression on a rule evaluating a S3 Bucket.

```bash
[Info at /Test/bucket/Resource] The suppression for Example-S3BucketSSLRequestsOnly was ignored for the following reason(s).
        Only Arun can suppress errors!
        Suppressions are only allowed before the year 2023
[Error at /Test/bucket/Resource] Example-S3BucketSSLRequestsOnly: My brief info.
```
