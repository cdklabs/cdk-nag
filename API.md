# API Reference <a name="API Reference"></a>


## Structs <a name="Structs"></a>

### NagPackProps <a name="cdk-nag.NagPackProps"></a>

Interface for creating a Nag rule pack.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { NagPackProps } from 'cdk-nag'

const nagPackProps: NagPackProps = { ... }
```

##### `logIgnores`<sup>Optional</sup> <a name="cdk-nag.NagPackProps.property.logIgnores"></a>

```typescript
public readonly logIgnores: boolean;
```

- *Type:* `boolean`

Whether or not to log triggered rules that have been suppressed as informational messages (default: false).

---

##### `reports`<sup>Optional</sup> <a name="cdk-nag.NagPackProps.property.reports"></a>

```typescript
public readonly reports: boolean;
```

- *Type:* `boolean`

Whether or not to generate CSV compliance reports for applied Stacks in the App's output directory (default: true).

---

##### `verbose`<sup>Optional</sup> <a name="cdk-nag.NagPackProps.property.verbose"></a>

```typescript
public readonly verbose: boolean;
```

- *Type:* `boolean`

Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false).

---

### NagPackSuppression <a name="cdk-nag.NagPackSuppression"></a>

Interface for creating a rule suppression.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { NagPackSuppression } from 'cdk-nag'

const nagPackSuppression: NagPackSuppression = { ... }
```

##### `id`<sup>Required</sup> <a name="cdk-nag.NagPackSuppression.property.id"></a>

```typescript
public readonly id: string;
```

- *Type:* `string`

The id of the rule to ignore.

---

##### `reason`<sup>Required</sup> <a name="cdk-nag.NagPackSuppression.property.reason"></a>

```typescript
public readonly reason: string;
```

- *Type:* `string`

The reason to ignore the rule (minimum 10 characters).

---

## Classes <a name="Classes"></a>

### AwsSolutionsChecks <a name="cdk-nag.AwsSolutionsChecks"></a>

Check Best practices based on AWS Solutions Security Matrix.

#### Initializers <a name="cdk-nag.AwsSolutionsChecks.Initializer"></a>

```typescript
import { AwsSolutionsChecks } from 'cdk-nag'

new AwsSolutionsChecks(props?: NagPackProps)
```

##### `props`<sup>Optional</sup> <a name="cdk-nag.AwsSolutionsChecks.parameter.props"></a>

- *Type:* [`cdk-nag.NagPackProps`](#cdk-nag.NagPackProps)

---

#### Methods <a name="Methods"></a>

##### `visit` <a name="cdk-nag.AwsSolutionsChecks.visit"></a>

```typescript
public visit(node: IConstruct)
```

###### `node`<sup>Required</sup> <a name="cdk-nag.AwsSolutionsChecks.parameter.node"></a>

- *Type:* [`@aws-cdk/core.IConstruct`](#@aws-cdk/core.IConstruct)

---




### HIPAASecurityChecks <a name="cdk-nag.HIPAASecurityChecks"></a>

Check for HIPAA Security compliance.

Based on the HIPAA Security AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-hipaa_security.html

#### Initializers <a name="cdk-nag.HIPAASecurityChecks.Initializer"></a>

```typescript
import { HIPAASecurityChecks } from 'cdk-nag'

new HIPAASecurityChecks(props?: NagPackProps)
```

##### `props`<sup>Optional</sup> <a name="cdk-nag.HIPAASecurityChecks.parameter.props"></a>

- *Type:* [`cdk-nag.NagPackProps`](#cdk-nag.NagPackProps)

---

#### Methods <a name="Methods"></a>

##### `visit` <a name="cdk-nag.HIPAASecurityChecks.visit"></a>

```typescript
public visit(node: IConstruct)
```

###### `node`<sup>Required</sup> <a name="cdk-nag.HIPAASecurityChecks.parameter.node"></a>

- *Type:* [`@aws-cdk/core.IConstruct`](#@aws-cdk/core.IConstruct)

---




### NagPack <a name="cdk-nag.NagPack"></a>

- *Implements:* [`@aws-cdk/core.IAspect`](#@aws-cdk/core.IAspect)

Base class for all rule packs.

#### Initializers <a name="cdk-nag.NagPack.Initializer"></a>

```typescript
import { NagPack } from 'cdk-nag'

new NagPack(props?: NagPackProps)
```

##### `props`<sup>Optional</sup> <a name="cdk-nag.NagPack.parameter.props"></a>

- *Type:* [`cdk-nag.NagPackProps`](#cdk-nag.NagPackProps)

---

#### Methods <a name="Methods"></a>

##### `visit` <a name="cdk-nag.NagPack.visit"></a>

```typescript
public visit(node: IConstruct)
```

###### `node`<sup>Required</sup> <a name="cdk-nag.NagPack.parameter.node"></a>

- *Type:* [`@aws-cdk/core.IConstruct`](#@aws-cdk/core.IConstruct)

---


#### Properties <a name="Properties"></a>

##### `readPackName`<sup>Required</sup> <a name="cdk-nag.NagPack.property.readPackName"></a>

```typescript
public readonly readPackName: string;
```

- *Type:* `string`

---

##### `readReportStacks`<sup>Required</sup> <a name="cdk-nag.NagPack.property.readReportStacks"></a>

```typescript
public readonly readReportStacks: string[];
```

- *Type:* `string`[]

---


### NagRules <a name="cdk-nag.NagRules"></a>

Helper class with methods for rule creation.

#### Initializers <a name="cdk-nag.NagRules.Initializer"></a>

```typescript
import { NagRules } from 'cdk-nag'

new NagRules()
```


#### Static Functions <a name="Static Functions"></a>

##### `resolveIfPrimitive` <a name="cdk-nag.NagRules.resolveIfPrimitive"></a>

```typescript
import { NagRules } from 'cdk-nag'

NagRules.resolveIfPrimitive(node: CfnResource, parameter: any)
```

###### `node`<sup>Required</sup> <a name="cdk-nag.NagRules.parameter.node"></a>

- *Type:* [`@aws-cdk/core.CfnResource`](#@aws-cdk/core.CfnResource)

The CfnResource to check.

---

###### `parameter`<sup>Required</sup> <a name="cdk-nag.NagRules.parameter.parameter"></a>

- *Type:* `any`

The value to attempt to resolve.

---

##### `resolveResourceFromInstrinsic` <a name="cdk-nag.NagRules.resolveResourceFromInstrinsic"></a>

```typescript
import { NagRules } from 'cdk-nag'

NagRules.resolveResourceFromInstrinsic(node: CfnResource, parameter: any)
```

###### `node`<sup>Required</sup> <a name="cdk-nag.NagRules.parameter.node"></a>

- *Type:* [`@aws-cdk/core.CfnResource`](#@aws-cdk/core.CfnResource)

The CfnResource to check.

---

###### `parameter`<sup>Required</sup> <a name="cdk-nag.NagRules.parameter.parameter"></a>

- *Type:* `any`

The value to attempt to resolve.

---



### NagSuppressions <a name="cdk-nag.NagSuppressions"></a>

Helper class with methods to add cdk-nag suppressions to cdk resources.

#### Initializers <a name="cdk-nag.NagSuppressions.Initializer"></a>

```typescript
import { NagSuppressions } from 'cdk-nag'

new NagSuppressions()
```


#### Static Functions <a name="Static Functions"></a>

##### `addResourceSuppressions` <a name="cdk-nag.NagSuppressions.addResourceSuppressions"></a>

```typescript
import { NagSuppressions } from 'cdk-nag'

NagSuppressions.addResourceSuppressions(construct: IConstruct, suppressions: NagPackSuppression[], applyToChildren?: boolean)
```

###### `construct`<sup>Required</sup> <a name="cdk-nag.NagSuppressions.parameter.construct"></a>

- *Type:* [`@aws-cdk/core.IConstruct`](#@aws-cdk/core.IConstruct)

The IConstruct to apply the suppression to.

---

###### `suppressions`<sup>Required</sup> <a name="cdk-nag.NagSuppressions.parameter.suppressions"></a>

- *Type:* [`cdk-nag.NagPackSuppression`](#cdk-nag.NagPackSuppression)[]

A list of suppressions to apply to the resource.

---

###### `applyToChildren`<sup>Optional</sup> <a name="cdk-nag.NagSuppressions.parameter.applyToChildren"></a>

- *Type:* `boolean`

Apply the suppressions to children CfnResources  (default:false).

---

##### `addResourceSuppressionsByPath` <a name="cdk-nag.NagSuppressions.addResourceSuppressionsByPath"></a>

```typescript
import { NagSuppressions } from 'cdk-nag'

NagSuppressions.addResourceSuppressionsByPath(stack: Stack, path: string, suppressions: NagPackSuppression[], applyToChildren?: boolean)
```

###### `stack`<sup>Required</sup> <a name="cdk-nag.NagSuppressions.parameter.stack"></a>

- *Type:* [`@aws-cdk/core.Stack`](#@aws-cdk/core.Stack)

The Stack the construct belongs to.

---

###### `path`<sup>Required</sup> <a name="cdk-nag.NagSuppressions.parameter.path"></a>

- *Type:* `string`

The path to the construct in the provided stack.

---

###### `suppressions`<sup>Required</sup> <a name="cdk-nag.NagSuppressions.parameter.suppressions"></a>

- *Type:* [`cdk-nag.NagPackSuppression`](#cdk-nag.NagPackSuppression)[]

A list of suppressions to apply to the resource.

---

###### `applyToChildren`<sup>Optional</sup> <a name="cdk-nag.NagSuppressions.parameter.applyToChildren"></a>

- *Type:* `boolean`

Apply the suppressions to children CfnResources  (default:false).

---

##### `addStackSuppressions` <a name="cdk-nag.NagSuppressions.addStackSuppressions"></a>

```typescript
import { NagSuppressions } from 'cdk-nag'

NagSuppressions.addStackSuppressions(stack: Stack, suppressions: NagPackSuppression[], applyToNestedStacks?: boolean)
```

###### `stack`<sup>Required</sup> <a name="cdk-nag.NagSuppressions.parameter.stack"></a>

- *Type:* [`@aws-cdk/core.Stack`](#@aws-cdk/core.Stack)

The Stack to apply the suppression to.

---

###### `suppressions`<sup>Required</sup> <a name="cdk-nag.NagSuppressions.parameter.suppressions"></a>

- *Type:* [`cdk-nag.NagPackSuppression`](#cdk-nag.NagPackSuppression)[]

A list of suppressions to apply to the stack.

---

###### `applyToNestedStacks`<sup>Optional</sup> <a name="cdk-nag.NagSuppressions.parameter.applyToNestedStacks"></a>

- *Type:* `boolean`

Apply the suppressions to children stacks (default:false).

---



### NIST80053R4Checks <a name="cdk-nag.NIST80053R4Checks"></a>

Check for NIST 800-53 rev 4 compliance.

Based on the NIST 800-53 rev 4 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-nist-800-53_rev_4.html

#### Initializers <a name="cdk-nag.NIST80053R4Checks.Initializer"></a>

```typescript
import { NIST80053R4Checks } from 'cdk-nag'

new NIST80053R4Checks(props?: NagPackProps)
```

##### `props`<sup>Optional</sup> <a name="cdk-nag.NIST80053R4Checks.parameter.props"></a>

- *Type:* [`cdk-nag.NagPackProps`](#cdk-nag.NagPackProps)

---

#### Methods <a name="Methods"></a>

##### `visit` <a name="cdk-nag.NIST80053R4Checks.visit"></a>

```typescript
public visit(node: IConstruct)
```

###### `node`<sup>Required</sup> <a name="cdk-nag.NIST80053R4Checks.parameter.node"></a>

- *Type:* [`@aws-cdk/core.IConstruct`](#@aws-cdk/core.IConstruct)

---




### NIST80053R5Checks <a name="cdk-nag.NIST80053R5Checks"></a>

Check for NIST 800-53 rev 5 compliance.

Based on the NIST 800-53 rev 5 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-nist-800-53_rev_5.html

#### Initializers <a name="cdk-nag.NIST80053R5Checks.Initializer"></a>

```typescript
import { NIST80053R5Checks } from 'cdk-nag'

new NIST80053R5Checks(props?: NagPackProps)
```

##### `props`<sup>Optional</sup> <a name="cdk-nag.NIST80053R5Checks.parameter.props"></a>

- *Type:* [`cdk-nag.NagPackProps`](#cdk-nag.NagPackProps)

---

#### Methods <a name="Methods"></a>

##### `visit` <a name="cdk-nag.NIST80053R5Checks.visit"></a>

```typescript
public visit(node: IConstruct)
```

###### `node`<sup>Required</sup> <a name="cdk-nag.NIST80053R5Checks.parameter.node"></a>

- *Type:* [`@aws-cdk/core.IConstruct`](#@aws-cdk/core.IConstruct)

---




### PCIDSS321Checks <a name="cdk-nag.PCIDSS321Checks"></a>

Check for PCI DSS 3.2.1 compliance. Based on the PCI DSS 3.2.1 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-pci-dss.html.

#### Initializers <a name="cdk-nag.PCIDSS321Checks.Initializer"></a>

```typescript
import { PCIDSS321Checks } from 'cdk-nag'

new PCIDSS321Checks(props?: NagPackProps)
```

##### `props`<sup>Optional</sup> <a name="cdk-nag.PCIDSS321Checks.parameter.props"></a>

- *Type:* [`cdk-nag.NagPackProps`](#cdk-nag.NagPackProps)

---

#### Methods <a name="Methods"></a>

##### `visit` <a name="cdk-nag.PCIDSS321Checks.visit"></a>

```typescript
public visit(node: IConstruct)
```

###### `node`<sup>Required</sup> <a name="cdk-nag.PCIDSS321Checks.parameter.node"></a>

- *Type:* [`@aws-cdk/core.IConstruct`](#@aws-cdk/core.IConstruct)

---




## Protocols <a name="Protocols"></a>

### IApplyRule <a name="cdk-nag.IApplyRule"></a>

- *Implemented By:* [`cdk-nag.IApplyRule`](#cdk-nag.IApplyRule)

Interface for JSII interoperability for passing parameters and the Rule Callback to @applyRule method.

#### Methods <a name="Methods"></a>

##### `rule` <a name="cdk-nag.IApplyRule.rule"></a>

```typescript
public rule(node: CfnResource)
```

###### `node`<sup>Required</sup> <a name="cdk-nag.IApplyRule.parameter.node"></a>

- *Type:* [`@aws-cdk/core.CfnResource`](#@aws-cdk/core.CfnResource)

The CfnResource to check.

---

#### Properties <a name="Properties"></a>

##### `explanation`<sup>Required</sup> <a name="cdk-nag.IApplyRule.property.explanation"></a>

```typescript
public readonly explanation: string;
```

- *Type:* `string`

Why the rule exists.

---

##### `info`<sup>Required</sup> <a name="cdk-nag.IApplyRule.property.info"></a>

```typescript
public readonly info: string;
```

- *Type:* `string`

Why the rule was triggered.

---

##### `level`<sup>Required</sup> <a name="cdk-nag.IApplyRule.property.level"></a>

```typescript
public readonly level: NagMessageLevel;
```

- *Type:* [`cdk-nag.NagMessageLevel`](#cdk-nag.NagMessageLevel)

The annotations message level to apply to the rule if triggered.

---

##### `node`<sup>Required</sup> <a name="cdk-nag.IApplyRule.property.node"></a>

```typescript
public readonly node: CfnResource;
```

- *Type:* [`@aws-cdk/core.CfnResource`](#@aws-cdk/core.CfnResource)

Ignores listed in cdk-nag metadata.

---

##### `ruleSuffixOverride`<sup>Optional</sup> <a name="cdk-nag.IApplyRule.property.ruleSuffixOverride"></a>

```typescript
public readonly ruleSuffixOverride: string;
```

- *Type:* `string`

Override for the suffix of the Rule ID for this rule.

---

## Enums <a name="Enums"></a>

### NagMessageLevel <a name="NagMessageLevel"></a>

The level of the message that the rule applies.

#### `WARN` <a name="cdk-nag.NagMessageLevel.WARN"></a>

---


#### `ERROR` <a name="cdk-nag.NagMessageLevel.ERROR"></a>

---


### NagRuleCompliance <a name="NagRuleCompliance"></a>

The compliance level of a resource in relation to a rule.

#### `COMPLIANT` <a name="cdk-nag.NagRuleCompliance.COMPLIANT"></a>

---


#### `NON_COMPLIANT` <a name="cdk-nag.NagRuleCompliance.NON_COMPLIANT"></a>

---


#### `NOT_APPLICABLE` <a name="cdk-nag.NagRuleCompliance.NOT_APPLICABLE"></a>

---

