# Migrating from cdk-nag v2 to v3

## Overview

cdk-nag v3 rewrites the core engine from an `IAspect` to an `IPolicyValidationPlugin`. Rule packs now participate in CDK's native [policy validation framework](https://docs.aws.amazon.com/cdk/v2/guide/policy-validation-synthesis.html) instead of emitting annotations during synthesis.

This guide covers every breaking change and the corresponding v3 equivalent.

---

## Minimum CDK Version

| Version | Minimum `aws-cdk-lib` |
|---------|----------------------|
| v2      | 2.176.0              |
| v3      | 2.257.0              |

---

## Registering a NagPack

### v2

```typescript
import { App, Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';

const app = new App();
Aspects.of(app).add(new AwsSolutionsChecks());
```

### v3

```typescript
import { App, Validations } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';

const app = new App();
Validations.of(app).addPlugins(new AwsSolutionsChecks(app));
```

**Key differences:**

- Use `Validations.of(scope).addPlugins(...)` instead of `Aspects.of(scope).add(...)`.
- The NagPack constructor now takes an optional `scope` as the first argument, followed by `props`.

---

## Acknowledging (Suppressing) Rules

### v2

```typescript
import { NagSuppressions } from 'cdk-nag';

NagSuppressions.addResourceSuppressions(myBucket, [
  { id: 'AwsSolutions-S1', reason: 'Logging not required.' },
]);

NagSuppressions.addStackSuppressions(stack, [
  { id: 'AwsSolutions-S1', reason: 'Logging not required.' },
]);
```

### v3

```typescript
import { Validations } from 'aws-cdk-lib';

Validations.of(myBucket).acknowledge({
  id: 'AwsSolutions-S1',
  reason: 'Logging not required.',
});

// Stack-level acknowledgment
Validations.of(stack).acknowledge({
  id: 'AwsSolutions-S1',
  reason: 'Logging not required for any resource in this stack.',
});
```

**Key differences:**

- `NagSuppressions` is removed. Use CDK's built-in `Validations.of(construct).acknowledge(...)`.
- Each call acknowledges a single rule. There is no bulk array form.
- Granular finding suppressions still use the `RuleId[FindingId]` format: `Validations.of(resource).acknowledge({ id: 'AwsSolutions-IAM5[Action::s3:*]', reason: '...' })`.

---

## Removed APIs

The following exports no longer exist in v3:

| Removed                        | Replacement                                         |
|-------------------------------|-----------------------------------------------------|
| `NagSuppressions`             | `Validations.of(construct).acknowledge(...)`        |
| `NagPackSuppression`          | Use `{ id, reason }` with `acknowledge()`           |
| `INagSuppressionIgnore`       | No equivalent (acknowledgments cannot be overridden)|
| `SuppressionIgnoreAlways`     | Removed                                             |
| `SuppressionIgnoreNever`      | Removed                                             |
| `SuppressionIgnoreOr`         | Removed                                             |
| `INagLogger`                  | Removed — violations surface in `policy-validation-report.json` |
| `AnnotationLogger`            | Removed                                             |
| `NagReportLogger`             | Removed                                             |
| `VALIDATION_FAILURE_ID`       | Rule errors are reported as violations directly     |
| `NagRulePostValidationStates.SUPPRESSED` | Removed                              |

---

## NagPackProps Changes

| v2 Property                    | v3 Status                                          |
|-------------------------------|-----------------------------------------------------|
| `verbose`                     | Retained — controls whether explanations are included in violation descriptions |
| `logIgnores`                  | Removed — no separate suppression logging          |
| `reports`                     | Removed — CDK writes `policy-validation-report.json` automatically |
| `reportFormats`               | Removed                                            |
| `suppressionIgnoreCondition`  | Removed                                            |
| `additionalLoggers`           | Removed                                            |
| `writeSuppressionsToCloudFormation` | **New** — writes acknowledged rules into CloudFormation Metadata for audit trail compatibility with v2 tooling |

---

## Custom NagPack Authors

### v2

```typescript
import { CfnResource, IAspect } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
import { NagPack, NagPackProps, NagMessageLevel, NagRuleCompliance } from 'cdk-nag';

export class MyPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'MyPack';
  }

  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      this.applyRule({
        info: 'My rule description.',
        explanation: 'Why this matters.',
        level: NagMessageLevel.ERROR,
        rule: (resource) =>
          resource.cfnResourceType === 'AWS::S3::Bucket'
            ? NagRuleCompliance.COMPLIANT
            : NagRuleCompliance.NON_COMPLIANT,
        node,
      });
    }
  }
}
```

### v3

```typescript
import { CfnResource } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
import { NagPack, NagPackProps, NagMessageLevel, NagRuleCompliance } from 'cdk-nag';

export class MyPack extends NagPack {
  public readonly name = 'MyPack';

  constructor(scope?: IConstruct, props?: NagPackProps) {
    super(scope, props);
    this.packName = 'MyPack';
  }

  protected checkResource(node: CfnResource): void {
    this.applyRule({
      info: 'My rule description.',
      explanation: 'Why this matters.',
      level: NagMessageLevel.ERROR,
      rule: (resource) =>
        resource.cfnResourceType === 'AWS::S3::Bucket'
          ? NagRuleCompliance.COMPLIANT
          : NagRuleCompliance.NON_COMPLIANT,
      node,
    });
  }
}
```

**Key differences:**

- Add a `public readonly name` property (required by `IPolicyValidationPlugin`).
- Constructor signature is `(scope?: IConstruct, props?: NagPackProps)`.
- Replace `public visit(node: IConstruct)` with `protected checkResource(node: CfnResource)`. The base class handles tree-walking and only calls `checkResource` for `CfnResource` nodes.
- The `ignoreSuppressionCondition` option on `IApplyRule` is removed.

---

## Validation Output

### v2

Violations appeared as CDK Annotations (warnings/errors) during `cdk synth` and in CSV/JSON report files in the cloud assembly output directory.

### v3

Violations appear in CDK's `policy-validation-report.json` in the cloud assembly. The CDK CLI displays a formatted summary of all violations on `cdk synth` or `cdk deploy`. Reports (`NagReportLogger`) are no longer generated separately.

---

## Audit Trail (CloudFormation Metadata)

If you have existing tooling that reads the `cdk_nag` metadata block from synthesized CloudFormation templates, enable backwards-compatible metadata writing:

```typescript
Validations.of(app).addPlugins(
  new AwsSolutionsChecks(app, { writeSuppressionsToCloudFormation: true })
);
```

This causes acknowledged rules to be written into each `CfnResource`'s Metadata as:

```json
{
  "cdk_nag": {
    "rules_to_suppress": [
      { "id": "AwsSolutions-S1", "reason": "..." }
    ]
  }
}
```

---

## Quick Migration Checklist

- [ ] Update `aws-cdk-lib` to >= 2.257.0
- [ ] Replace `Aspects.of(scope).add(new Pack())` → `Validations.of(scope).addPlugins(new Pack(scope))`
- [ ] Replace all `NagSuppressions.addResourceSuppressions(...)` / `addStackSuppressions(...)` → `Validations.of(construct).acknowledge({ id, reason })`
- [ ] Remove imports of `NagSuppressions`, `NagPackSuppression`, `INagLogger`, `AnnotationLogger`, `NagReportLogger`, `INagSuppressionIgnore`, and related types
- [ ] If using custom NagPacks: rename `visit()` → `checkResource()`, add `public readonly name`, update constructor signature
- [ ] If relying on CSV/JSON reports: switch to reading `policy-validation-report.json` from the cloud assembly, or enable `writeSuppressionsToCloudFormation` for template-level metadata
- [ ] Remove `logIgnores`, `reports`, `reportFormats`, `suppressionIgnoreCondition`, and `additionalLoggers` from NagPack props
