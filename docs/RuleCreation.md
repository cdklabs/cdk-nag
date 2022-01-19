<!--
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
-->

# Rule Creation

A rule contains an assertion to make against each individual resource in your CDK application.

## Anatomy of a Rule

A rule returns a `NagRuleCompliance` status.

- `NON_COMPLIANT` - The resource that **does not meet** the requirements.
- `COMPLIANT` - The resource that **meets** the requirements.
- `NOT_APPLICABLE` - The rule **does not apply** to the given resource.
  - Ex. The current resource is a S3 Bucket but the rule is for validating DMS Replication Instances.

```typescript
// CDK v2
import { CfnResource } from 'aws-cdk-lib';
// CDK v1
// import { CfnResource } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from 'cdk-nag';
import { CfnReplicationInstance } from 'aws-cdk-lib/aws-dms';

/**
 * DMS replication instances are not public
 * @param node the CfnResource to check
 */
export function myRule(node: CfnResource): NagRuleCompliance {
  if (node instanceof CfnReplicationInstance) {
    const publicAccess = NagRules.resolveIfPrimitive(
      node,
      node.publiclyAccessible
    );
    if (publicAccess !== false) {
      return NagRuleCompliance.NON_COMPLIANT;
    }
    return NagRuleCompliance.COMPLIANT;
  } else {
    return NagRuleCompliance.NOT_APPLICABLE;
  }
}
```

## Working with Tokens

In many cases you may find that you may have to deal with [Tokenized values](https://docs.aws.amazon.com/cdk/v2/guide/tokens.html) when creating a rule. `cdk-nag` provides the `NagRules` class to help resolve tokens when an the resolved value of a Token must be known to pass rule validation.

When using `NagRules` helper function, if a Tokenized value can not be resolved to a specific value (ex. the token resolves to a [CloudFormation Intrinsic function](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference.html)) you will see a `CdkNagValidationFailure` in the `cdk-nag` cli output for a given resource.

A list of `NagRules` functions can be [found in the API documentation](../API.md#nag-rules).

## Naming a Rule

A `cdk-nag` rule validation error contains both the [NagPack](./NagPack.md) name and a rule name. You can set a default rule name and/or override the rule name when applying the rule in pack.

```bash
# An example cdk-nag message.
Error at /StackName/Resource] NagPackName-RuleName: Information.
```

### Setting the Default Name

You can use the [Object.defineProperty()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) method to influence the name of the rule. Without this

```typescript
// CDK v2
import { CfnResource } from 'aws-cdk-lib';
// CDK v1
// import { CfnResource } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from 'cdk-nag';
import { CfnReplicationInstance } from 'aws-cdk-lib/aws-dms';

export function myRule(node: CfnResource): NagRuleCompliance {
  if (node instanceof CfnReplicationInstance) {
    const publicAccess = NagRules.resolveIfPrimitive(
      node,
      node.publiclyAccessible
    );
    if (publicAccess !== false) {
      return NagRuleCompliance.NON_COMPLIANT;
    }
    return NagRuleCompliance.COMPLIANT;
  } else {
    return NagRuleCompliance.NOT_APPLICABLE;
  }
}
Object.defineProperty(myRule, 'name', { value: 'MyDefaultName' });
```

### Overriding the Name

You may optionally override the rule name when applying the rule in a [NagPack](./NagPack.md) by using a `ruleSuffixOverride`. An overridden name takes priority over the defined function name.

```typescript
// CDK v2
import { CfnResource } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
// CDK v1
// import { CfnResource, IConstruct } from '@aws-cdk/core';
import { NagMessageLevel, NagPack, NagPackProps } from 'cdk-nag';
import { myRule } from './MyRule';

export class ExampleChecks extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Example';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      this.applyRule({
        ruleSuffixOverride: 'OverriddenName',
        info: 'My brief info.',
        explanation: 'My detailed explanation.',
        level: NagMessageLevel.ERROR,
        rule: myRule,
        node: node,
      });
    }
  }
}
```
