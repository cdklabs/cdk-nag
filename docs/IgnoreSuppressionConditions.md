<!--
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
-->

# Conditionally Ignoring Suppressions

As a [NagPack](./NagPack.md) author or user, you can optionally create a condition that prevents certain rules from being suppressed. You can create conditions for any variety of reasons. Examples include a condition that always ignores a suppression, a condition that ignores a suppression based on the date, a condition that ignores a suppression based on the reason.

## Creating A Condition

Conditions implement the `INagSuppressionIgnore` interface. They return a message string when the `createMessage()` method is called. If the method returns a non-empty string the suppression is ignored. Conversely if the method returns an empty string the suppression is allowed.

Here is an example of a re-usable condition class that ignores a suppression if the suppression reason doesn't contain the word `Arun`

```ts
import { INagSuppressionIgnore, SuppressionIgnoreInput } from 'cdk-nag';
class ArunCondition implements INagSuppressionIgnore {
  createMessage(input: SuppressionIgnoreInput) {
    if (!input.reason.includes('Arun')) {
      return 'The reason must contain the word Arun!';
    }
    return '';
  }
}
```

You could also create the same condition without a class and by just implementing the interface

```ts
({
  createMessage(input: SuppressionIgnoreInput) {
    return !input.reason.includes('Arun')
      ? 'The reason must contain the word Arun!'
      : '';
  },
});
```

### Applying Conditions

There are 3 ways of applying conditions to rules. Users have 1 way, they can supply an additional global condition that gets applied to all rules. `NagPack` authors have 2 ways, they can individually apply conditions to rules and/or apply a global condition to all rules. All present conditions are evaluated together using a `SuppressionIgnoreOr`(review [this section](#creating-complex-conditions) for more details on complex conditions).

Here is an example of a `NagPack` author applying both a global condition and an individual condition to the prebuilt `S3BucketSSLRequestsOnly` S3 Rule.

```ts
import { CfnResource } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import {
  NagMessageLevel,
  NagPack,
  NagPackProps,
  NagSuppressions,
  SuppressionIgnoreInput,
  rules,
} from 'cdk-nag';
import { IConstruct } from 'constructs';

export class ExampleChecks extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Example';
    this.packGlobalSuppressionIgnore = {
      createMessage(input: SuppressionIgnoreInput) {
        return !input.reason.includes('Arun')
          ? 'The reason must contain the word Arun!'
          : '';
      },
    };
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      this.applyRule({
        info: 'My brief info.',
        explanation: 'My detailed explanation.',
        level: NagMessageLevel.ERROR,
        rule: rules.s3.S3BucketSSLRequestsOnly,
        ignoreSuppressionCondition: {
          createMessage(input: SuppressionIgnoreInput) {
            return !input.reason.includes('Donti')
              ? 'The reason must contain the word Donti!'
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
        The reason must contain the word Arun!
        The reason must contain the word Donti!
[Error at /Test/bucket/Resource] Example-S3BucketSSLRequestsOnly: My brief info.
```

## Creating Complex Conditions

`cdk-nag` exposes both a `SuppressionIgnoreAnd` class and a `SuppressionIgnoreOr` to help developers create more complicated conditions

- `SuppressionIgnoreAnd`: Ignores the suppression if **ALL** of the given INagSuppressionIgnore return a non-empty message (logical and)
- `SuppressionIgnoreOr`: Ignores the suppression if **ANY** of the given INagSuppressionIgnore return a non-empty message (logical or)

Here is an example `SuppressionIgnoreAnd` that ignores a suppression if both a 'ticket' CloudFormation metadata entry does not exist on the resource and the current year is after 2022.

```ts
import { SuppressionIgnoreAnd, SuppressionIgnoreInput } from 'cdk-nag';

new SuppressionIgnoreAnd(
  {
    createMessage(input: SuppressionIgnoreInput) {
      return !input.resource.getMetadata('ticket')
        ? 'Must provide a ticket for an exception!'
        : '';
    },
  },
  {
    createMessage(_input: SuppressionIgnoreInput) {
      return Date.now() > Date.parse('31 Dec 2022 23:59 UTC')
        ? 'Suppressions are only allowed before the year 2023'
        : '';
    },
  }
);
```

A user would see the following output when attempting to synthesize an application using a non-compliant suppression on a rule evaluating a S3 Bucket.

```bash
[Info at /Test/bucket/Resource] The suppression for Example-S3BucketSSLRequestsOnly was ignored for the following reason(s).
        Must provide a ticket for an exception!
        Suppressions are only allowed before the year 2023
[Error at /Test/bucket/Resource] Example-S3BucketSSLRequestsOnly: My brief info.
```
