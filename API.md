# API Reference <a name="API Reference" id="api-reference"></a>


## Structs <a name="Structs" id="structs"></a>

### NagPackProps <a name="cdk-nag.NagPackProps" id="cdknagnagpackprops"></a>

Interface for creating a Nag rule pack.

#### Initializer <a name="[object Object].Initializer" id="object-objectinitializer"></a>

```typescript
import { NagPackProps } from 'cdk-nag'

const nagPackProps: NagPackProps = { ... }
```

#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`logIgnores`](#cdknagnagpackpropspropertylogignores) | `boolean` | Whether or not to log triggered rules that have been suppressed as informational messages (default: false). |
| [`reports`](#cdknagnagpackpropspropertyreports) | `boolean` | Whether or not to generate CSV compliance reports for applied Stacks in the App's output directory (default: true). |
| [`verbose`](#cdknagnagpackpropspropertyverbose) | `boolean` | Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false). |

---

##### `logIgnores`<sup>Optional</sup> <a name="cdk-nag.NagPackProps.property.logIgnores" id="cdknagnagpackpropspropertylogignores"></a>

```typescript
public readonly logIgnores: boolean;
```

- *Type:* `boolean`

Whether or not to log triggered rules that have been suppressed as informational messages (default: false).

---

##### `reports`<sup>Optional</sup> <a name="cdk-nag.NagPackProps.property.reports" id="cdknagnagpackpropspropertyreports"></a>

```typescript
public readonly reports: boolean;
```

- *Type:* `boolean`

Whether or not to generate CSV compliance reports for applied Stacks in the App's output directory (default: true).

---

##### `verbose`<sup>Optional</sup> <a name="cdk-nag.NagPackProps.property.verbose" id="cdknagnagpackpropspropertyverbose"></a>

```typescript
public readonly verbose: boolean;
```

- *Type:* `boolean`

Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false).

---

### NagPackSuppression <a name="cdk-nag.NagPackSuppression" id="cdknagnagpacksuppression"></a>

Interface for creating a rule suppression.

#### Initializer <a name="[object Object].Initializer" id="object-objectinitializer"></a>

```typescript
import { NagPackSuppression } from 'cdk-nag'

const nagPackSuppression: NagPackSuppression = { ... }
```

#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`id`](#cdknagnagpacksuppressionpropertyid)<span title="Required">*</span> | `string` | The id of the rule to ignore. |
| [`reason`](#cdknagnagpacksuppressionpropertyreason)<span title="Required">*</span> | `string` | The reason to ignore the rule (minimum 10 characters). |
| [`appliesTo`](#cdknagnagpacksuppressionpropertyappliesto) | `string`[] | Rule specific granular suppressions. |

---

##### `id`<sup>Required</sup> <a name="cdk-nag.NagPackSuppression.property.id" id="cdknagnagpacksuppressionpropertyid"></a>

```typescript
public readonly id: string;
```

- *Type:* `string`

The id of the rule to ignore.

---

##### `reason`<sup>Required</sup> <a name="cdk-nag.NagPackSuppression.property.reason" id="cdknagnagpacksuppressionpropertyreason"></a>

```typescript
public readonly reason: string;
```

- *Type:* `string`

The reason to ignore the rule (minimum 10 characters).

---

##### `appliesTo`<sup>Optional</sup> <a name="cdk-nag.NagPackSuppression.property.appliesTo" id="cdknagnagpacksuppressionpropertyappliesto"></a>

```typescript
public readonly appliesTo: string[];
```

- *Type:* `string`[]

Rule specific granular suppressions.

---

## Classes <a name="Classes" id="classes"></a>

### AwsSolutionsChecks <a name="cdk-nag.AwsSolutionsChecks" id="cdknagawssolutionschecks"></a>

Check Best practices based on AWS Solutions Security Matrix.

#### Initializers <a name="cdk-nag.AwsSolutionsChecks.Initializer" id="cdknagawssolutionschecksinitializer"></a>

```typescript
import { AwsSolutionsChecks } from 'cdk-nag'

new AwsSolutionsChecks(props?: NagPackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`props`](#cdknagawssolutionschecksparameterprops) | [`cdk-nag.NagPackProps`](#cdk-nag.NagPackProps) | *No description.* |

---

##### `props`<sup>Optional</sup> <a name="cdk-nag.AwsSolutionsChecks.parameter.props" id="cdknagawssolutionschecksparameterprops"></a>

- *Type:* [`cdk-nag.NagPackProps`](#cdk-nag.NagPackProps)

---

#### Methods <a name="Methods" id="methods"></a>

| **Name** | **Description** |
| --- | --- |
| [`visit`](#cdknagawssolutionschecksvisit) | All aspects can visit an IConstruct. |

---

##### `visit` <a name="cdk-nag.AwsSolutionsChecks.visit" id="cdknagawssolutionschecksvisit"></a>

```typescript
public visit(node: IConstruct)
```

###### `node`<sup>Required</sup> <a name="cdk-nag.AwsSolutionsChecks.parameter.node" id="cdknagawssolutionschecksparameternode"></a>

- *Type:* [`@aws-cdk/core.IConstruct`](#@aws-cdk/core.IConstruct)

---




### HIPAASecurityChecks <a name="cdk-nag.HIPAASecurityChecks" id="cdknaghipaasecuritychecks"></a>

Check for HIPAA Security compliance.

Based on the HIPAA Security AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-hipaa_security.html

#### Initializers <a name="cdk-nag.HIPAASecurityChecks.Initializer" id="cdknaghipaasecuritychecksinitializer"></a>

```typescript
import { HIPAASecurityChecks } from 'cdk-nag'

new HIPAASecurityChecks(props?: NagPackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`props`](#cdknaghipaasecuritychecksparameterprops) | [`cdk-nag.NagPackProps`](#cdk-nag.NagPackProps) | *No description.* |

---

##### `props`<sup>Optional</sup> <a name="cdk-nag.HIPAASecurityChecks.parameter.props" id="cdknaghipaasecuritychecksparameterprops"></a>

- *Type:* [`cdk-nag.NagPackProps`](#cdk-nag.NagPackProps)

---

#### Methods <a name="Methods" id="methods"></a>

| **Name** | **Description** |
| --- | --- |
| [`visit`](#cdknaghipaasecuritychecksvisit) | All aspects can visit an IConstruct. |

---

##### `visit` <a name="cdk-nag.HIPAASecurityChecks.visit" id="cdknaghipaasecuritychecksvisit"></a>

```typescript
public visit(node: IConstruct)
```

###### `node`<sup>Required</sup> <a name="cdk-nag.HIPAASecurityChecks.parameter.node" id="cdknaghipaasecuritychecksparameternode"></a>

- *Type:* [`@aws-cdk/core.IConstruct`](#@aws-cdk/core.IConstruct)

---




### NagPack <a name="cdk-nag.NagPack" id="cdknagnagpack"></a>

- *Implements:* [`@aws-cdk/core.IAspect`](#@aws-cdk/core.IAspect)

Base class for all rule packs.

#### Initializers <a name="cdk-nag.NagPack.Initializer" id="cdknagnagpackinitializer"></a>

```typescript
import { NagPack } from 'cdk-nag'

new NagPack(props?: NagPackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`props`](#cdknagnagpackparameterprops) | [`cdk-nag.NagPackProps`](#cdk-nag.NagPackProps) | *No description.* |

---

##### `props`<sup>Optional</sup> <a name="cdk-nag.NagPack.parameter.props" id="cdknagnagpackparameterprops"></a>

- *Type:* [`cdk-nag.NagPackProps`](#cdk-nag.NagPackProps)

---

#### Methods <a name="Methods" id="methods"></a>

| **Name** | **Description** |
| --- | --- |
| [`visit`](#cdknagnagpackvisit) | All aspects can visit an IConstruct. |

---

##### `visit` <a name="cdk-nag.NagPack.visit" id="cdknagnagpackvisit"></a>

```typescript
public visit(node: IConstruct)
```

###### `node`<sup>Required</sup> <a name="cdk-nag.NagPack.parameter.node" id="cdknagnagpackparameternode"></a>

- *Type:* [`@aws-cdk/core.IConstruct`](#@aws-cdk/core.IConstruct)

---


#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`readPackName`](#cdknagnagpackpropertyreadpackname)<span title="Required">*</span> | `string` | *No description.* |
| [`readReportStacks`](#cdknagnagpackpropertyreadreportstacks)<span title="Required">*</span> | `string`[] | *No description.* |

---

##### `readPackName`<sup>Required</sup> <a name="cdk-nag.NagPack.property.readPackName" id="cdknagnagpackpropertyreadpackname"></a>

```typescript
public readonly readPackName: string;
```

- *Type:* `string`

---

##### `readReportStacks`<sup>Required</sup> <a name="cdk-nag.NagPack.property.readReportStacks" id="cdknagnagpackpropertyreadreportstacks"></a>

```typescript
public readonly readReportStacks: string[];
```

- *Type:* `string`[]

---


### NagRules <a name="cdk-nag.NagRules" id="cdknagnagrules"></a>

Helper class with methods for rule creation.

#### Initializers <a name="cdk-nag.NagRules.Initializer" id="cdknagnagrulesinitializer"></a>

```typescript
import { NagRules } from 'cdk-nag'

new NagRules()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="static-functions"></a>

| **Name** | **Description** |
| --- | --- |
| [`resolveIfPrimitive`](#cdknagnagrulesresolveifprimitive) | Use in cases where a primitive value must be known to pass a rule. |
| [`resolveResourceFromInstrinsic`](#cdknagnagrulesresolveresourcefrominstrinsic) | Use in cases where a token resolves to an intrinsic function and the referenced resource must be known to pass a rule. |

---

##### `resolveIfPrimitive` <a name="cdk-nag.NagRules.resolveIfPrimitive" id="cdknagnagrulesresolveifprimitive"></a>

```typescript
import { NagRules } from 'cdk-nag'

NagRules.resolveIfPrimitive(node: CfnResource, parameter: any)
```

###### `node`<sup>Required</sup> <a name="cdk-nag.NagRules.parameter.node" id="cdknagnagrulesparameternode"></a>

- *Type:* [`@aws-cdk/core.CfnResource`](#@aws-cdk/core.CfnResource)

The CfnResource to check.

---

###### `parameter`<sup>Required</sup> <a name="cdk-nag.NagRules.parameter.parameter" id="cdknagnagrulesparameterparameter"></a>

- *Type:* `any`

The value to attempt to resolve.

---

##### `resolveResourceFromInstrinsic` <a name="cdk-nag.NagRules.resolveResourceFromInstrinsic" id="cdknagnagrulesresolveresourcefrominstrinsic"></a>

```typescript
import { NagRules } from 'cdk-nag'

NagRules.resolveResourceFromInstrinsic(node: CfnResource, parameter: any)
```

###### `node`<sup>Required</sup> <a name="cdk-nag.NagRules.parameter.node" id="cdknagnagrulesparameternode"></a>

- *Type:* [`@aws-cdk/core.CfnResource`](#@aws-cdk/core.CfnResource)

The CfnResource to check.

---

###### `parameter`<sup>Required</sup> <a name="cdk-nag.NagRules.parameter.parameter" id="cdknagnagrulesparameterparameter"></a>

- *Type:* `any`

The value to attempt to resolve.

---



### NagSuppressions <a name="cdk-nag.NagSuppressions" id="cdknagnagsuppressions"></a>

Helper class with methods to add cdk-nag suppressions to cdk resources.

#### Initializers <a name="cdk-nag.NagSuppressions.Initializer" id="cdknagnagsuppressionsinitializer"></a>

```typescript
import { NagSuppressions } from 'cdk-nag'

new NagSuppressions()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="static-functions"></a>

| **Name** | **Description** |
| --- | --- |
| [`addResourceSuppressions`](#cdknagnagsuppressionsaddresourcesuppressions) | Add cdk-nag suppressions to a CfnResource and optionally its children. |
| [`addResourceSuppressionsByPath`](#cdknagnagsuppressionsaddresourcesuppressionsbypath) | Add cdk-nag suppressions to a CfnResource and optionally its children via its path. |
| [`addStackSuppressions`](#cdknagnagsuppressionsaddstacksuppressions) | Apply cdk-nag suppressions to a Stack and optionally nested stacks. |

---

##### `addResourceSuppressions` <a name="cdk-nag.NagSuppressions.addResourceSuppressions" id="cdknagnagsuppressionsaddresourcesuppressions"></a>

```typescript
import { NagSuppressions } from 'cdk-nag'

NagSuppressions.addResourceSuppressions(construct: IConstruct, suppressions: NagPackSuppression[], applyToChildren?: boolean)
```

###### `construct`<sup>Required</sup> <a name="cdk-nag.NagSuppressions.parameter.construct" id="cdknagnagsuppressionsparameterconstruct"></a>

- *Type:* [`@aws-cdk/core.IConstruct`](#@aws-cdk/core.IConstruct)

The IConstruct to apply the suppression to.

---

###### `suppressions`<sup>Required</sup> <a name="cdk-nag.NagSuppressions.parameter.suppressions" id="cdknagnagsuppressionsparametersuppressions"></a>

- *Type:* [`cdk-nag.NagPackSuppression`](#cdk-nag.NagPackSuppression)[]

A list of suppressions to apply to the resource.

---

###### `applyToChildren`<sup>Optional</sup> <a name="cdk-nag.NagSuppressions.parameter.applyToChildren" id="cdknagnagsuppressionsparameterapplytochildren"></a>

- *Type:* `boolean`

Apply the suppressions to children CfnResources  (default:false).

---

##### `addResourceSuppressionsByPath` <a name="cdk-nag.NagSuppressions.addResourceSuppressionsByPath" id="cdknagnagsuppressionsaddresourcesuppressionsbypath"></a>

```typescript
import { NagSuppressions } from 'cdk-nag'

NagSuppressions.addResourceSuppressionsByPath(stack: Stack, path: string, suppressions: NagPackSuppression[], applyToChildren?: boolean)
```

###### `stack`<sup>Required</sup> <a name="cdk-nag.NagSuppressions.parameter.stack" id="cdknagnagsuppressionsparameterstack"></a>

- *Type:* [`@aws-cdk/core.Stack`](#@aws-cdk/core.Stack)

The Stack the construct belongs to.

---

###### `path`<sup>Required</sup> <a name="cdk-nag.NagSuppressions.parameter.path" id="cdknagnagsuppressionsparameterpath"></a>

- *Type:* `string`

The path to the construct in the provided stack.

---

###### `suppressions`<sup>Required</sup> <a name="cdk-nag.NagSuppressions.parameter.suppressions" id="cdknagnagsuppressionsparametersuppressions"></a>

- *Type:* [`cdk-nag.NagPackSuppression`](#cdk-nag.NagPackSuppression)[]

A list of suppressions to apply to the resource.

---

###### `applyToChildren`<sup>Optional</sup> <a name="cdk-nag.NagSuppressions.parameter.applyToChildren" id="cdknagnagsuppressionsparameterapplytochildren"></a>

- *Type:* `boolean`

Apply the suppressions to children CfnResources  (default:false).

---

##### `addStackSuppressions` <a name="cdk-nag.NagSuppressions.addStackSuppressions" id="cdknagnagsuppressionsaddstacksuppressions"></a>

```typescript
import { NagSuppressions } from 'cdk-nag'

NagSuppressions.addStackSuppressions(stack: Stack, suppressions: NagPackSuppression[], applyToNestedStacks?: boolean)
```

###### `stack`<sup>Required</sup> <a name="cdk-nag.NagSuppressions.parameter.stack" id="cdknagnagsuppressionsparameterstack"></a>

- *Type:* [`@aws-cdk/core.Stack`](#@aws-cdk/core.Stack)

The Stack to apply the suppression to.

---

###### `suppressions`<sup>Required</sup> <a name="cdk-nag.NagSuppressions.parameter.suppressions" id="cdknagnagsuppressionsparametersuppressions"></a>

- *Type:* [`cdk-nag.NagPackSuppression`](#cdk-nag.NagPackSuppression)[]

A list of suppressions to apply to the stack.

---

###### `applyToNestedStacks`<sup>Optional</sup> <a name="cdk-nag.NagSuppressions.parameter.applyToNestedStacks" id="cdknagnagsuppressionsparameterapplytonestedstacks"></a>

- *Type:* `boolean`

Apply the suppressions to children stacks (default:false).

---



### NIST80053R4Checks <a name="cdk-nag.NIST80053R4Checks" id="cdknagnist80053r4checks"></a>

Check for NIST 800-53 rev 4 compliance.

Based on the NIST 800-53 rev 4 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-nist-800-53_rev_4.html

#### Initializers <a name="cdk-nag.NIST80053R4Checks.Initializer" id="cdknagnist80053r4checksinitializer"></a>

```typescript
import { NIST80053R4Checks } from 'cdk-nag'

new NIST80053R4Checks(props?: NagPackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`props`](#cdknagnist80053r4checksparameterprops) | [`cdk-nag.NagPackProps`](#cdk-nag.NagPackProps) | *No description.* |

---

##### `props`<sup>Optional</sup> <a name="cdk-nag.NIST80053R4Checks.parameter.props" id="cdknagnist80053r4checksparameterprops"></a>

- *Type:* [`cdk-nag.NagPackProps`](#cdk-nag.NagPackProps)

---

#### Methods <a name="Methods" id="methods"></a>

| **Name** | **Description** |
| --- | --- |
| [`visit`](#cdknagnist80053r4checksvisit) | All aspects can visit an IConstruct. |

---

##### `visit` <a name="cdk-nag.NIST80053R4Checks.visit" id="cdknagnist80053r4checksvisit"></a>

```typescript
public visit(node: IConstruct)
```

###### `node`<sup>Required</sup> <a name="cdk-nag.NIST80053R4Checks.parameter.node" id="cdknagnist80053r4checksparameternode"></a>

- *Type:* [`@aws-cdk/core.IConstruct`](#@aws-cdk/core.IConstruct)

---




### NIST80053R5Checks <a name="cdk-nag.NIST80053R5Checks" id="cdknagnist80053r5checks"></a>

Check for NIST 800-53 rev 5 compliance.

Based on the NIST 800-53 rev 5 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-nist-800-53_rev_5.html

#### Initializers <a name="cdk-nag.NIST80053R5Checks.Initializer" id="cdknagnist80053r5checksinitializer"></a>

```typescript
import { NIST80053R5Checks } from 'cdk-nag'

new NIST80053R5Checks(props?: NagPackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`props`](#cdknagnist80053r5checksparameterprops) | [`cdk-nag.NagPackProps`](#cdk-nag.NagPackProps) | *No description.* |

---

##### `props`<sup>Optional</sup> <a name="cdk-nag.NIST80053R5Checks.parameter.props" id="cdknagnist80053r5checksparameterprops"></a>

- *Type:* [`cdk-nag.NagPackProps`](#cdk-nag.NagPackProps)

---

#### Methods <a name="Methods" id="methods"></a>

| **Name** | **Description** |
| --- | --- |
| [`visit`](#cdknagnist80053r5checksvisit) | All aspects can visit an IConstruct. |

---

##### `visit` <a name="cdk-nag.NIST80053R5Checks.visit" id="cdknagnist80053r5checksvisit"></a>

```typescript
public visit(node: IConstruct)
```

###### `node`<sup>Required</sup> <a name="cdk-nag.NIST80053R5Checks.parameter.node" id="cdknagnist80053r5checksparameternode"></a>

- *Type:* [`@aws-cdk/core.IConstruct`](#@aws-cdk/core.IConstruct)

---




### PCIDSS321Checks <a name="cdk-nag.PCIDSS321Checks" id="cdknagpcidss321checks"></a>

Check for PCI DSS 3.2.1 compliance. Based on the PCI DSS 3.2.1 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-pci-dss.html.

#### Initializers <a name="cdk-nag.PCIDSS321Checks.Initializer" id="cdknagpcidss321checksinitializer"></a>

```typescript
import { PCIDSS321Checks } from 'cdk-nag'

new PCIDSS321Checks(props?: NagPackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`props`](#cdknagpcidss321checksparameterprops) | [`cdk-nag.NagPackProps`](#cdk-nag.NagPackProps) | *No description.* |

---

##### `props`<sup>Optional</sup> <a name="cdk-nag.PCIDSS321Checks.parameter.props" id="cdknagpcidss321checksparameterprops"></a>

- *Type:* [`cdk-nag.NagPackProps`](#cdk-nag.NagPackProps)

---

#### Methods <a name="Methods" id="methods"></a>

| **Name** | **Description** |
| --- | --- |
| [`visit`](#cdknagpcidss321checksvisit) | All aspects can visit an IConstruct. |

---

##### `visit` <a name="cdk-nag.PCIDSS321Checks.visit" id="cdknagpcidss321checksvisit"></a>

```typescript
public visit(node: IConstruct)
```

###### `node`<sup>Required</sup> <a name="cdk-nag.PCIDSS321Checks.parameter.node" id="cdknagpcidss321checksparameternode"></a>

- *Type:* [`@aws-cdk/core.IConstruct`](#@aws-cdk/core.IConstruct)

---




## Protocols <a name="Protocols" id="protocols"></a>

### IApplyRule <a name="cdk-nag.IApplyRule" id="cdknagiapplyrule"></a>

- *Implemented By:* [`cdk-nag.IApplyRule`](#cdk-nag.IApplyRule)

Interface for JSII interoperability for passing parameters and the Rule Callback to @applyRule method.

#### Methods <a name="Methods" id="methods"></a>

| **Name** | **Description** |
| --- | --- |
| [`rule`](#cdknagiapplyrulerule) | The callback to the rule. |

---

##### `rule` <a name="cdk-nag.IApplyRule.rule" id="cdknagiapplyrulerule"></a>

```typescript
public rule(node: CfnResource)
```

###### `node`<sup>Required</sup> <a name="cdk-nag.IApplyRule.parameter.node" id="cdknagiapplyruleparameternode"></a>

- *Type:* [`@aws-cdk/core.CfnResource`](#@aws-cdk/core.CfnResource)

The CfnResource to check.

---

#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`explanation`](#cdknagiapplyrulepropertyexplanation)<span title="Required">*</span> | `string` | Why the rule exists. |
| [`info`](#cdknagiapplyrulepropertyinfo)<span title="Required">*</span> | `string` | Why the rule was triggered. |
| [`level`](#cdknagiapplyrulepropertylevel)<span title="Required">*</span> | [`cdk-nag.NagMessageLevel`](#cdk-nag.NagMessageLevel) | The annotations message level to apply to the rule if triggered. |
| [`node`](#cdknagiapplyrulepropertynode)<span title="Required">*</span> | [`@aws-cdk/core.CfnResource`](#@aws-cdk/core.CfnResource) | Ignores listed in cdk-nag metadata. |
| [`ruleSuffixOverride`](#cdknagiapplyrulepropertyrulesuffixoverride) | `string` | Override for the suffix of the Rule ID for this rule. |

---

##### `explanation`<sup>Required</sup> <a name="cdk-nag.IApplyRule.property.explanation" id="cdknagiapplyrulepropertyexplanation"></a>

```typescript
public readonly explanation: string;
```

- *Type:* `string`

Why the rule exists.

---

##### `info`<sup>Required</sup> <a name="cdk-nag.IApplyRule.property.info" id="cdknagiapplyrulepropertyinfo"></a>

```typescript
public readonly info: string;
```

- *Type:* `string`

Why the rule was triggered.

---

##### `level`<sup>Required</sup> <a name="cdk-nag.IApplyRule.property.level" id="cdknagiapplyrulepropertylevel"></a>

```typescript
public readonly level: NagMessageLevel;
```

- *Type:* [`cdk-nag.NagMessageLevel`](#cdk-nag.NagMessageLevel)

The annotations message level to apply to the rule if triggered.

---

##### `node`<sup>Required</sup> <a name="cdk-nag.IApplyRule.property.node" id="cdknagiapplyrulepropertynode"></a>

```typescript
public readonly node: CfnResource;
```

- *Type:* [`@aws-cdk/core.CfnResource`](#@aws-cdk/core.CfnResource)

Ignores listed in cdk-nag metadata.

---

##### `ruleSuffixOverride`<sup>Optional</sup> <a name="cdk-nag.IApplyRule.property.ruleSuffixOverride" id="cdknagiapplyrulepropertyrulesuffixoverride"></a>

```typescript
public readonly ruleSuffixOverride: string;
```

- *Type:* `string`

Override for the suffix of the Rule ID for this rule.

---

## Enums <a name="Enums" id="enums"></a>

### NagMessageLevel <a name="NagMessageLevel" id="nagmessagelevel"></a>

| **Name** | **Description** |
| --- | --- |
| [`WARN`](#cdknagnagmessagelevelwarn) | *No description.* |
| [`ERROR`](#cdknagnagmessagelevelerror) | *No description.* |

---

The level of the message that the rule applies.

#### `WARN` <a name="cdk-nag.NagMessageLevel.WARN" id="cdknagnagmessagelevelwarn"></a>

---


#### `ERROR` <a name="cdk-nag.NagMessageLevel.ERROR" id="cdknagnagmessagelevelerror"></a>

---


### NagRuleCompliance <a name="NagRuleCompliance" id="nagrulecompliance"></a>

| **Name** | **Description** |
| --- | --- |
| [`COMPLIANT`](#cdknagnagrulecompliancecompliant) | *No description.* |
| [`NON_COMPLIANT`](#cdknagnagrulecompliancenoncompliant) | *No description.* |
| [`NOT_APPLICABLE`](#cdknagnagrulecompliancenotapplicable) | *No description.* |

---

The compliance level of a resource in relation to a rule.

#### `COMPLIANT` <a name="cdk-nag.NagRuleCompliance.COMPLIANT" id="cdknagnagrulecompliancecompliant"></a>

---


#### `NON_COMPLIANT` <a name="cdk-nag.NagRuleCompliance.NON_COMPLIANT" id="cdknagnagrulecompliancenoncompliant"></a>

---


#### `NOT_APPLICABLE` <a name="cdk-nag.NagRuleCompliance.NOT_APPLICABLE" id="cdknagnagrulecompliancenotapplicable"></a>

---

