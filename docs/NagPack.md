<!--
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
-->

# NagPack

A `NagPack` is a named collection of [rules](./RuleCreation.md) that can be used to validate your stacks and applications. All of the [pre-built packs](../README.md#available-packs) are `NagPacks`.

## Creating a NagPack

`cdk-nag` exposes libraries that allow you to create your own `NagPack`.

### Setup

Below is the minimal set-up for creating your own `NagPack`. At it's core a `NagPack` is an extension of [CDK Aspects](https://docs.aws.amazon.com/cdk/v2/guide/aspects.html#aspects_example) and inherits all the properties of Aspects.

```typescript
// CDK v2
import { CfnResource } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
// CDK v1
// import { CfnResource, IConstruct } from '@aws-cdk/core';
import { NagPack, NagPackProps } from 'cdk-nag';

export class ExampleChecks extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Example';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      // Add your rules here.
    }
  }
}
```

### Adding Rules

You may add both premade and custom rules to your `NagPack`. The documentation on [rules](./RuleCreation.md) walks through the process of creating a rule.

```typescript
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
import { CfnReplicationInstance } from 'aws-cdk-lib/aws-dms';

export class ExampleChecks extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Example';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      // premade rule
      this.applyRule({
        info: 'My brief info.',
        explanation: 'My detailed explanation.',
        level: NagMessageLevel.ERROR,
        rule: rules.s3.S3BucketSSLRequestsOnly,
        node: node,
      });
      // custom rule
      this.applyRule({
        ruleSuffixOverride: 'NoPublicDMS',
        info: 'This rule triggers on public DMS replication instances.',
        explanation:
          'This rule does not prevent deployment unless level is set to NagMessageLevel.ERROR.',
        level: NagMessageLevel.WARN,
        rule: function (node2: CfnResource): NagRuleResult {
          if (node2 instanceof CfnReplicationInstance) {
            const publicAccess = NagRules.resolveIfPrimitive(
              node2,
              node2.publiclyAccessible
            );
            if (publicAccess !== false) {
              return NagRuleCompliance.NON_COMPLIANT;
            }
            return NagRuleCompliance.COMPLIANT;
          } else {
            return NagRuleCompliance.NOT_APPLICABLE;
          }
        },
        node: node,
      });
    }
  }
}
```

## Using a NagPack

You can apply as many `NagPacks` to a CDK Stack or Application via Aspects

```typescript
// CDK v2
import { App, Aspects } from 'aws-cdk-lib';
// CDK v1
//import { App, Aspects } from '@aws-cdk/core';
import { CdkTestStack } from '../lib/cdk-test-stack';
import { AwsSolutionsChecks } from 'cdk-nag';
import { ExampleChecks } from './ExampleClass';

const app = new App();
new CdkTestStack(app, 'CdkNagDemo');
// Simple rule informational messages
Aspects.of(app).add(new AwsSolutionsChecks());
Aspects.of(app).add(new ExampleChecks());
```
