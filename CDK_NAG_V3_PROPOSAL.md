# cdk-nag v3 Proposal

## Summary

This proposal recommends a new major version of cdk-nag that replaces the library's custom suppression system with CDK's native `Validations.of().acknowledge()` API. A working proof-of-concept is available on branch `v3-validation-framework`.

## Why v3 Is Necessary

### The Problem: Duplicate Suppression Mechanisms

cdk-nag v2 predates CDK's validation framework. It was forced to invent its own suppression system:

- `NagSuppressions.addResourceSuppressions()`
- `NagSuppressions.addStackSuppressions()`
- `NagSuppressions.addResourceSuppressionsByPath()`
- Custom `cdk_nag` metadata format embedded in CloudFormation templates
- `INagSuppressionIgnore` condition system (5 classes)
- `CdkNagValidationFailure` pseudo-rule for error handling
- `NagSuppressionHelper` utility (164 lines of metadata parsing)

CDK now natively supports acknowledgment of validation warnings and errors via `Validations.of(construct).acknowledge()`. This creates a situation where:

1. **Two incompatible suppression APIs exist** — users must learn cdk-nag's custom API rather than CDK's standard one
2. **Suppressions are invisible to CDK tooling** — cdk-nag's `cdk_nag` metadata isn't understood by CDK CLI, CloudFormation, or other CDK tools
3. **Maintenance burden** — 450+ lines of suppression infrastructure in cdk-nag that duplicates platform functionality
4. **Integration friction** — other CDK validation tools cannot interoperate with cdk-nag's proprietary suppression format

### The Solution: Adopt CDK's Native Validation APIs

cdk-nag v3 uses CDK's `Validations.of()` API for both annotation emission and acknowledgment:

```typescript
// Emit violations with stable IDs (cdk-nag does this internally)
Validations.of(resource).addError('AwsSolutions-IAM4', 'Uses AWS managed policies.');
Validations.of(resource).addWarning('AwsSolutions-S1', 'Access logs disabled.');

// Suppress violations (users do this)
Validations.of(resource).acknowledge({ id: 'AwsSolutions-S1', reason: 'Logging bucket.' });
```

Benefits:
- **Standard CDK pattern** — no cdk-nag-specific APIs to learn for suppressions
- **Tooling interoperability** — CDK CLI, IDE extensions, and other tools understand the format
- **Less code to maintain** — 2,787 lines deleted, 163 added
- **No behavior change for rules** — all 150+ rules remain unchanged

## Why Aspects Over IPolicyValidationPlugin

CDK's `IPolicyValidationPlugin` interface was considered and rejected for v3. The plugin model runs **after** synthesis and receives only file paths to synthesized CloudFormation template JSON:

```typescript
interface IPolicyValidationContext {
  readonly templatePaths: string[];  // That's all you get
}
```

This means a plugin cannot access the construct tree — it only sees the final CloudFormation output. Migrating cdk-nag to this model would require:

1. **Rewriting or adapting all 150+ rules** — rules currently use `instanceof CfnFunction`, `Stack.of(node).resolve()`, and typed L1 property access. In the plugin model, rules would need to parse raw JSON, match resources by CloudFormation type strings, and handle PascalCase property names manually.

2. **Losing CDK token resolution** — rules use `Stack.of(node).resolve()` to dereference CDK tokens. In a synthesized template, most tokens are resolved, but the mapping from CDK's camelCase getters to CloudFormation's PascalCase keys would need to be maintained per resource type.

3. **Building an adapter layer or factory registry** — to preserve `instanceof` checks, we'd need to hydrate real L1 class instances from template JSON (60-80 factory functions mapping CloudFormation types to CDK constructors, plus PascalCase→camelCase property conversion).

4. **No annotation integration** — the plugin returns a `PolicyValidationPluginReport` struct. It cannot write annotations back to constructs, breaking the acknowledgment flow.

**The Aspect model gives us all of this for free.** Rules run during synthesis with full access to the construct tree, typed properties, and token resolution. The only thing v2's Aspect model was missing was a standard suppression mechanism — which `Validations.of().acknowledge()` now provides.

By keeping the Aspect architecture and adopting only the Validations API for annotation emission and acknowledgment, v3 achieves:
- Zero changes to rule implementations
- Zero performance cost from template parsing or L1 hydration
- Full compatibility with CDK's acknowledgment system
- A net deletion of 2,600+ lines rather than a rewrite

## What Changes

| Component | v2 | v3 |
|-----------|----|----|
| Suppression API | `NagSuppressions.addResourceSuppressions()` | `Validations.of(construct).acknowledge()` |
| Annotation emission | `Annotations.of().addWarning(msg)` | `Validations.of().addWarning(id, msg)` |
| Granular findings | `appliesTo: ['Action::s3:*']` | `acknowledge({ id: 'Rule[Action::s3:*]' })` |
| Error suppression | `{ id: 'CdkNagValidationFailure' }` | `acknowledge({ id: 'RuleId' })` |
| Suppression conditions | `INagSuppressionIgnore` (5 classes) | Removed |
| Rules | 150+ rules | **No changes** |
| Registration | `Aspects.of(app).add(...)` | **No changes** |
| NagPack base class | IAspect, `visit()`, `applyRule()` | **Same pattern, simplified** |

## POC Results

Branch: `v3-validation-framework` (commit `f29761f`)

| Metric | Value |
|--------|-------|
| Lines deleted | 2,787 |
| Lines added | 163 |
| Files deleted | 5 source files |
| Rule files changed | 0 |
| Tests passing | 803/806 |
| Tests failing | 3 (CDK version bump issue, unrelated to v3) |

The POC demonstrates that the migration is straightforward. Rule packs, individual rules, and the NagPack infrastructure all work unchanged. The only modifications are to the annotation/suppression layer.

## Prerequisite: Error Acknowledgment in CDK

CDK's `Validations.of().acknowledge()` currently only suppresses warnings. cdk-nag v2 allows suppressing ERROR-level rules. For full feature parity, CDK needs to support acknowledging errors.

This is a separate work item to be contributed to aws-cdk-lib. The v3 architecture does not change regardless — it just requires this CDK feature to ship first.

## v2 Support Plan

Following [AWS SDK maintenance policy](https://docs.aws.amazon.com/sdkref/latest/guide/maint-policy.html) and CDK precedent (CDK v1 received 12 months maintenance after v2 GA):

| Phase | Timeline | What Happens |
|-------|----------|-------------|
| **v3 Development** | Now | Build on `v3-validation-framework` branch. Error acknowledgment contributed to CDK. |
| **v3 GA** | When CDK ships error acknowledgment | v3 released. v2 enters maintenance announcement period. |
| **v2 Maintenance** | v3 GA + 12 months | v2 receives security fixes and critical bug fixes only. No new rules or features. |
| **v2 End-of-Support** | v3 GA + 12 months | v2 receives no further updates. |

### What "Maintenance Mode" means for v2:
- Security vulnerability patches
- Critical bug fixes
- Dependency updates required for security
- No new rules
- No new features
- No CDK version bumps beyond what's needed for security

### Release mechanics:
- v3 releases from `main` branch (after merge)
- v2 maintenance releases from a `v2` branch (forked at the point of v3 merge)
- npm: v3 gets `latest` tag, v2 gets `v2` tag

## Migration Path for Users

The migration is mechanical:

```diff
- import { NagSuppressions } from 'cdk-nag';
+ import { Validations } from 'aws-cdk-lib';

- NagSuppressions.addResourceSuppressions(bucket, [
-   { id: 'AwsSolutions-S1', reason: 'Logging bucket' },
- ]);
+ Validations.of(bucket).acknowledge({
+   id: 'AwsSolutions-S1',
+   reason: 'Logging bucket',
+ });

- NagSuppressions.addResourceSuppressions(role, [
-   { id: 'AwsSolutions-IAM5', reason: 'Need s3:*', appliesTo: ['Action::s3:*'] },
- ], true);
+ Validations.of(role).acknowledge({
+   id: 'AwsSolutions-IAM5[Action::s3:*]',
+   reason: 'Need s3:*',
+ });
```

No changes needed to:
- Rule pack registration (`Aspects.of(app).add(...)`)
- Custom NagPack implementations (rules stay the same)
- NagReportLogger configuration

## Open Questions for Discussion

1. **Error acknowledgment timeline** — When can we expect CDK to ship `acknowledge()` for errors? This gates v3 GA.

2. **Bulk acknowledgment** — In v2, suppressing a rule without `appliesTo` suppresses all findings. Should v3 support `acknowledge({ id: 'AwsSolutions-IAM5' })` to suppress all `AwsSolutions-IAM5[*]` findings on a construct? Recommendation: add as a fast-follow if customers request it.

3. **CloudFormation template metadata** — v2 embedds `cdk_nag` metadata in templates for suppressions. v3 uses CDK's `aws:cdk:acknowledged-rules` metadata. Should v3 still read legacy `cdk_nag` metadata for backwards compatibility during migration? Recommendation: no — clean break at major version.

4. **NagReportLogger audit trail** — v2 reports include "Suppressed" status. v3 can read `aws:cdk:acknowledged-rules` construct metadata to determine acknowledgment status. Should reports still show what was acknowledged? Recommendation: yes, for audit compliance.

## Next Steps

1. Review this proposal with CDK senior engineers
2. Agree on error acknowledgment timeline in CDK
3. Merge POC branch or use as reference for final implementation
4. Write migration guide and tooling (codemod for `NagSuppressions` → `Validations.of().acknowledge()`)
5. Announce v2 maintenance timeline
