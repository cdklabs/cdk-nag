# API Reference <a name="API Reference" id="api-reference"></a>


## Structs <a name="Structs" id="Structs"></a>

### NagPackProps <a name="NagPackProps" id="cdk-nag.NagPackProps"></a>

Interface for creating a NagPack.

#### Initializer <a name="Initializer" id="cdk-nag.NagPackProps.Initializer"></a>

```typescript
import { NagPackProps } from 'cdk-nag'

const nagPackProps: NagPackProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NagPackProps.property.verbose">verbose</a></code> | <code>boolean</code> | Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false). |
| <code><a href="#cdk-nag.NagPackProps.property.writeSuppressionsToCloudFormation">writeSuppressionsToCloudFormation</a></code> | <code>boolean</code> | Whether to write acknowledged rules into CfnResource CloudFormation Metadata as `cdk_nag: { rules_to_suppress: [...] }` for backwards compatibility with v2 audit trail tooling (default: false). |

---

##### `verbose`<sup>Optional</sup> <a name="verbose" id="cdk-nag.NagPackProps.property.verbose"></a>

```typescript
public readonly verbose: boolean;
```

- *Type:* boolean

Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false).

---

##### `writeSuppressionsToCloudFormation`<sup>Optional</sup> <a name="writeSuppressionsToCloudFormation" id="cdk-nag.NagPackProps.property.writeSuppressionsToCloudFormation"></a>

```typescript
public readonly writeSuppressionsToCloudFormation: boolean;
```

- *Type:* boolean

Whether to write acknowledged rules into CfnResource CloudFormation Metadata as `cdk_nag: { rules_to_suppress: [...] }` for backwards compatibility with v2 audit trail tooling (default: false).

---

### NagReportLine <a name="NagReportLine" id="cdk-nag.NagReportLine"></a>

A single line in a NagReport.

#### Initializer <a name="Initializer" id="cdk-nag.NagReportLine.Initializer"></a>

```typescript
import { NagReportLine } from 'cdk-nag'

const nagReportLine: NagReportLine = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NagReportLine.property.compliance">compliance</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagReportLine.property.resourceId">resourceId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagReportLine.property.ruleId">ruleId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagReportLine.property.ruleInfo">ruleInfo</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagReportLine.property.ruleLevel">ruleLevel</a></code> | <code>string</code> | *No description.* |

---

##### `compliance`<sup>Required</sup> <a name="compliance" id="cdk-nag.NagReportLine.property.compliance"></a>

```typescript
public readonly compliance: string;
```

- *Type:* string

---

##### `resourceId`<sup>Required</sup> <a name="resourceId" id="cdk-nag.NagReportLine.property.resourceId"></a>

```typescript
public readonly resourceId: string;
```

- *Type:* string

---

##### `ruleId`<sup>Required</sup> <a name="ruleId" id="cdk-nag.NagReportLine.property.ruleId"></a>

```typescript
public readonly ruleId: string;
```

- *Type:* string

---

##### `ruleInfo`<sup>Required</sup> <a name="ruleInfo" id="cdk-nag.NagReportLine.property.ruleInfo"></a>

```typescript
public readonly ruleInfo: string;
```

- *Type:* string

---

##### `ruleLevel`<sup>Required</sup> <a name="ruleLevel" id="cdk-nag.NagReportLine.property.ruleLevel"></a>

```typescript
public readonly ruleLevel: string;
```

- *Type:* string

---

### NagReportSchema <a name="NagReportSchema" id="cdk-nag.NagReportSchema"></a>

Schema for the NagReport output.

#### Initializer <a name="Initializer" id="cdk-nag.NagReportSchema.Initializer"></a>

```typescript
import { NagReportSchema } from 'cdk-nag'

const nagReportSchema: NagReportSchema = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NagReportSchema.property.lines">lines</a></code> | <code><a href="#cdk-nag.NagReportLine">NagReportLine</a>[]</code> | *No description.* |

---

##### `lines`<sup>Required</sup> <a name="lines" id="cdk-nag.NagReportSchema.property.lines"></a>

```typescript
public readonly lines: NagReportLine[];
```

- *Type:* <a href="#cdk-nag.NagReportLine">NagReportLine</a>[]

---

## Classes <a name="Classes" id="Classes"></a>

### AwsSolutionsChecks <a name="AwsSolutionsChecks" id="cdk-nag.AwsSolutionsChecks"></a>

Check Best practices based on AWS Solutions Security Matrix.

#### Initializers <a name="Initializers" id="cdk-nag.AwsSolutionsChecks.Initializer"></a>

```typescript
import { AwsSolutionsChecks } from 'cdk-nag'

new AwsSolutionsChecks(scope?: IConstruct, props?: NagPackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.AwsSolutionsChecks.Initializer.parameter.scope">scope</a></code> | <code>constructs.IConstruct</code> | *No description.* |
| <code><a href="#cdk-nag.AwsSolutionsChecks.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nag.NagPackProps">NagPackProps</a></code> | *No description.* |

---

##### `scope`<sup>Optional</sup> <a name="scope" id="cdk-nag.AwsSolutionsChecks.Initializer.parameter.scope"></a>

- *Type:* constructs.IConstruct

---

##### `props`<sup>Optional</sup> <a name="props" id="cdk-nag.AwsSolutionsChecks.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nag.NagPackProps">NagPackProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.AwsSolutionsChecks.validate">validate</a></code> | Entry point called by the CDK validation framework. |
| <code><a href="#cdk-nag.AwsSolutionsChecks.validateScope">validateScope</a></code> | Validate a construct tree directly. |

---

##### `validate` <a name="validate" id="cdk-nag.AwsSolutionsChecks.validate"></a>

```typescript
public validate(context: IPolicyValidationContext): PolicyValidationPluginReport
```

Entry point called by the CDK validation framework.

Requires `appConstruct` to be present on the context (CDK core change).
For testing or direct invocation, use `validateScope(scope)`.

###### `context`<sup>Required</sup> <a name="context" id="cdk-nag.AwsSolutionsChecks.validate.parameter.context"></a>

- *Type:* aws-cdk-lib.IPolicyValidationContext

---

##### `validateScope` <a name="validateScope" id="cdk-nag.AwsSolutionsChecks.validateScope"></a>

```typescript
public validateScope(scope: IConstruct): PolicyValidationPluginReport
```

Validate a construct tree directly.

This is the primary entry point
for testing and for CDK versions that do not yet provide `appConstruct` on
`IPolicyValidationContext`.

###### `scope`<sup>Required</sup> <a name="scope" id="cdk-nag.AwsSolutionsChecks.validateScope.parameter.scope"></a>

- *Type:* constructs.IConstruct

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.AwsSolutionsChecks.property.name">name</a></code> | <code>string</code> | The name of the plugin that will be displayed in the validation report. |
| <code><a href="#cdk-nag.AwsSolutionsChecks.property.readPackName">readPackName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.AwsSolutionsChecks.property.ruleIds">ruleIds</a></code> | <code>string[]</code> | The list of rule IDs that the plugin will evaluate. |
| <code><a href="#cdk-nag.AwsSolutionsChecks.property.version">version</a></code> | <code>string</code> | The version of the plugin, following the Semantic Versioning specification (see https://semver.org/). This version is used for analytics purposes, to measure the usage of different plugins and different versions. The value of this property should be kept in sync with the actual version of the software package. If the version is not provided or is not a valid semantic version, it will be reported as `0.0.0`. |

---

##### `name`<sup>Required</sup> <a name="name" id="cdk-nag.AwsSolutionsChecks.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

The name of the plugin that will be displayed in the validation report.

---

##### `readPackName`<sup>Required</sup> <a name="readPackName" id="cdk-nag.AwsSolutionsChecks.property.readPackName"></a>

```typescript
public readonly readPackName: string;
```

- *Type:* string

---

##### `ruleIds`<sup>Optional</sup> <a name="ruleIds" id="cdk-nag.AwsSolutionsChecks.property.ruleIds"></a>

```typescript
public readonly ruleIds: string[];
```

- *Type:* string[]

The list of rule IDs that the plugin will evaluate.

Used for analytics
purposes.

---

##### `version`<sup>Optional</sup> <a name="version" id="cdk-nag.AwsSolutionsChecks.property.version"></a>

```typescript
public readonly version: string;
```

- *Type:* string

The version of the plugin, following the Semantic Versioning specification (see https://semver.org/). This version is used for analytics purposes, to measure the usage of different plugins and different versions. The value of this property should be kept in sync with the actual version of the software package. If the version is not provided or is not a valid semantic version, it will be reported as `0.0.0`.

---


### HIPAASecurityChecks <a name="HIPAASecurityChecks" id="cdk-nag.HIPAASecurityChecks"></a>

Check for HIPAA Security compliance.

Based on the HIPAA Security AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-hipaa_security.html

#### Initializers <a name="Initializers" id="cdk-nag.HIPAASecurityChecks.Initializer"></a>

```typescript
import { HIPAASecurityChecks } from 'cdk-nag'

new HIPAASecurityChecks(scope?: IConstruct, props?: NagPackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.HIPAASecurityChecks.Initializer.parameter.scope">scope</a></code> | <code>constructs.IConstruct</code> | *No description.* |
| <code><a href="#cdk-nag.HIPAASecurityChecks.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nag.NagPackProps">NagPackProps</a></code> | *No description.* |

---

##### `scope`<sup>Optional</sup> <a name="scope" id="cdk-nag.HIPAASecurityChecks.Initializer.parameter.scope"></a>

- *Type:* constructs.IConstruct

---

##### `props`<sup>Optional</sup> <a name="props" id="cdk-nag.HIPAASecurityChecks.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nag.NagPackProps">NagPackProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.HIPAASecurityChecks.validate">validate</a></code> | Entry point called by the CDK validation framework. |
| <code><a href="#cdk-nag.HIPAASecurityChecks.validateScope">validateScope</a></code> | Validate a construct tree directly. |

---

##### `validate` <a name="validate" id="cdk-nag.HIPAASecurityChecks.validate"></a>

```typescript
public validate(context: IPolicyValidationContext): PolicyValidationPluginReport
```

Entry point called by the CDK validation framework.

Requires `appConstruct` to be present on the context (CDK core change).
For testing or direct invocation, use `validateScope(scope)`.

###### `context`<sup>Required</sup> <a name="context" id="cdk-nag.HIPAASecurityChecks.validate.parameter.context"></a>

- *Type:* aws-cdk-lib.IPolicyValidationContext

---

##### `validateScope` <a name="validateScope" id="cdk-nag.HIPAASecurityChecks.validateScope"></a>

```typescript
public validateScope(scope: IConstruct): PolicyValidationPluginReport
```

Validate a construct tree directly.

This is the primary entry point
for testing and for CDK versions that do not yet provide `appConstruct` on
`IPolicyValidationContext`.

###### `scope`<sup>Required</sup> <a name="scope" id="cdk-nag.HIPAASecurityChecks.validateScope.parameter.scope"></a>

- *Type:* constructs.IConstruct

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.HIPAASecurityChecks.property.name">name</a></code> | <code>string</code> | The name of the plugin that will be displayed in the validation report. |
| <code><a href="#cdk-nag.HIPAASecurityChecks.property.readPackName">readPackName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.HIPAASecurityChecks.property.ruleIds">ruleIds</a></code> | <code>string[]</code> | The list of rule IDs that the plugin will evaluate. |
| <code><a href="#cdk-nag.HIPAASecurityChecks.property.version">version</a></code> | <code>string</code> | The version of the plugin, following the Semantic Versioning specification (see https://semver.org/). This version is used for analytics purposes, to measure the usage of different plugins and different versions. The value of this property should be kept in sync with the actual version of the software package. If the version is not provided or is not a valid semantic version, it will be reported as `0.0.0`. |

---

##### `name`<sup>Required</sup> <a name="name" id="cdk-nag.HIPAASecurityChecks.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

The name of the plugin that will be displayed in the validation report.

---

##### `readPackName`<sup>Required</sup> <a name="readPackName" id="cdk-nag.HIPAASecurityChecks.property.readPackName"></a>

```typescript
public readonly readPackName: string;
```

- *Type:* string

---

##### `ruleIds`<sup>Optional</sup> <a name="ruleIds" id="cdk-nag.HIPAASecurityChecks.property.ruleIds"></a>

```typescript
public readonly ruleIds: string[];
```

- *Type:* string[]

The list of rule IDs that the plugin will evaluate.

Used for analytics
purposes.

---

##### `version`<sup>Optional</sup> <a name="version" id="cdk-nag.HIPAASecurityChecks.property.version"></a>

```typescript
public readonly version: string;
```

- *Type:* string

The version of the plugin, following the Semantic Versioning specification (see https://semver.org/). This version is used for analytics purposes, to measure the usage of different plugins and different versions. The value of this property should be kept in sync with the actual version of the software package. If the version is not provided or is not a valid semantic version, it will be reported as `0.0.0`.

---


### NagPack <a name="NagPack" id="cdk-nag.NagPack"></a>

- *Implements:* aws-cdk-lib.IPolicyValidationPlugin

Base class for all rule packs.

Implements IPolicyValidationPlugin so that
packs are registered via `Validations.of(app).addPlugins(new MyPack(app))`
instead of `Aspects.of(app).add(...)`.

#### Initializers <a name="Initializers" id="cdk-nag.NagPack.Initializer"></a>

```typescript
import { NagPack } from 'cdk-nag'

new NagPack(scope?: IConstruct, props?: NagPackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NagPack.Initializer.parameter.scope">scope</a></code> | <code>constructs.IConstruct</code> | *No description.* |
| <code><a href="#cdk-nag.NagPack.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nag.NagPackProps">NagPackProps</a></code> | *No description.* |

---

##### `scope`<sup>Optional</sup> <a name="scope" id="cdk-nag.NagPack.Initializer.parameter.scope"></a>

- *Type:* constructs.IConstruct

---

##### `props`<sup>Optional</sup> <a name="props" id="cdk-nag.NagPack.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nag.NagPackProps">NagPackProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.NagPack.validate">validate</a></code> | Entry point called by the CDK validation framework. |
| <code><a href="#cdk-nag.NagPack.validateScope">validateScope</a></code> | Validate a construct tree directly. |

---

##### `validate` <a name="validate" id="cdk-nag.NagPack.validate"></a>

```typescript
public validate(context: IPolicyValidationContext): PolicyValidationPluginReport
```

Entry point called by the CDK validation framework.

Requires `appConstruct` to be present on the context (CDK core change).
For testing or direct invocation, use `validateScope(scope)`.

###### `context`<sup>Required</sup> <a name="context" id="cdk-nag.NagPack.validate.parameter.context"></a>

- *Type:* aws-cdk-lib.IPolicyValidationContext

---

##### `validateScope` <a name="validateScope" id="cdk-nag.NagPack.validateScope"></a>

```typescript
public validateScope(scope: IConstruct): PolicyValidationPluginReport
```

Validate a construct tree directly.

This is the primary entry point
for testing and for CDK versions that do not yet provide `appConstruct` on
`IPolicyValidationContext`.

###### `scope`<sup>Required</sup> <a name="scope" id="cdk-nag.NagPack.validateScope.parameter.scope"></a>

- *Type:* constructs.IConstruct

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NagPack.property.name">name</a></code> | <code>string</code> | The name of the plugin that will be displayed in the validation report. |
| <code><a href="#cdk-nag.NagPack.property.readPackName">readPackName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagPack.property.ruleIds">ruleIds</a></code> | <code>string[]</code> | The list of rule IDs that the plugin will evaluate. |
| <code><a href="#cdk-nag.NagPack.property.version">version</a></code> | <code>string</code> | The version of the plugin, following the Semantic Versioning specification (see https://semver.org/). This version is used for analytics purposes, to measure the usage of different plugins and different versions. The value of this property should be kept in sync with the actual version of the software package. If the version is not provided or is not a valid semantic version, it will be reported as `0.0.0`. |

---

##### `name`<sup>Required</sup> <a name="name" id="cdk-nag.NagPack.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

The name of the plugin that will be displayed in the validation report.

---

##### `readPackName`<sup>Required</sup> <a name="readPackName" id="cdk-nag.NagPack.property.readPackName"></a>

```typescript
public readonly readPackName: string;
```

- *Type:* string

---

##### `ruleIds`<sup>Optional</sup> <a name="ruleIds" id="cdk-nag.NagPack.property.ruleIds"></a>

```typescript
public readonly ruleIds: string[];
```

- *Type:* string[]

The list of rule IDs that the plugin will evaluate.

Used for analytics
purposes.

---

##### `version`<sup>Optional</sup> <a name="version" id="cdk-nag.NagPack.property.version"></a>

```typescript
public readonly version: string;
```

- *Type:* string

The version of the plugin, following the Semantic Versioning specification (see https://semver.org/). This version is used for analytics purposes, to measure the usage of different plugins and different versions. The value of this property should be kept in sync with the actual version of the software package. If the version is not provided or is not a valid semantic version, it will be reported as `0.0.0`.

---


### NagRules <a name="NagRules" id="cdk-nag.NagRules"></a>

Helper class with methods for rule creation.

#### Initializers <a name="Initializers" id="cdk-nag.NagRules.Initializer"></a>

```typescript
import { NagRules } from 'cdk-nag'

new NagRules()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.NagRules.resolveIfPrimitive">resolveIfPrimitive</a></code> | Use in cases where a primitive value must be known to pass a rule. |
| <code><a href="#cdk-nag.NagRules.resolveResourceFromInstrinsic">resolveResourceFromInstrinsic</a></code> | *No description.* |
| <code><a href="#cdk-nag.NagRules.resolveResourceFromIntrinsic">resolveResourceFromIntrinsic</a></code> | Use in cases where a token resolves to an intrinsic function and the referenced resource must be known to pass a rule. |

---

##### `resolveIfPrimitive` <a name="resolveIfPrimitive" id="cdk-nag.NagRules.resolveIfPrimitive"></a>

```typescript
import { NagRules } from 'cdk-nag'

NagRules.resolveIfPrimitive(node: CfnResource, parameter: any)
```

Use in cases where a primitive value must be known to pass a rule.

https://developer.mozilla.org/en-US/docs/Glossary/Primitive

###### `node`<sup>Required</sup> <a name="node" id="cdk-nag.NagRules.resolveIfPrimitive.parameter.node"></a>

- *Type:* aws-cdk-lib.CfnResource

The CfnResource to check.

---

###### `parameter`<sup>Required</sup> <a name="parameter" id="cdk-nag.NagRules.resolveIfPrimitive.parameter.parameter"></a>

- *Type:* any

The value to attempt to resolve.

---

##### ~~`resolveResourceFromInstrinsic`~~ <a name="resolveResourceFromInstrinsic" id="cdk-nag.NagRules.resolveResourceFromInstrinsic"></a>

```typescript
import { NagRules } from 'cdk-nag'

NagRules.resolveResourceFromInstrinsic(node: CfnResource, parameter: any)
```

###### `node`<sup>Required</sup> <a name="node" id="cdk-nag.NagRules.resolveResourceFromInstrinsic.parameter.node"></a>

- *Type:* aws-cdk-lib.CfnResource

The CfnResource to check.

---

###### `parameter`<sup>Required</sup> <a name="parameter" id="cdk-nag.NagRules.resolveResourceFromInstrinsic.parameter.parameter"></a>

- *Type:* any

The value to attempt to resolve.

---

##### `resolveResourceFromIntrinsic` <a name="resolveResourceFromIntrinsic" id="cdk-nag.NagRules.resolveResourceFromIntrinsic"></a>

```typescript
import { NagRules } from 'cdk-nag'

NagRules.resolveResourceFromIntrinsic(node: CfnResource, parameter: any)
```

Use in cases where a token resolves to an intrinsic function and the referenced resource must be known to pass a rule.

###### `node`<sup>Required</sup> <a name="node" id="cdk-nag.NagRules.resolveResourceFromIntrinsic.parameter.node"></a>

- *Type:* aws-cdk-lib.CfnResource

The CfnResource to check.

---

###### `parameter`<sup>Required</sup> <a name="parameter" id="cdk-nag.NagRules.resolveResourceFromIntrinsic.parameter.parameter"></a>

- *Type:* any

The value to attempt to resolve.

---



### NIST80053R4Checks <a name="NIST80053R4Checks" id="cdk-nag.NIST80053R4Checks"></a>

Check for NIST 800-53 rev 4 compliance.

Based on the NIST 800-53 rev 4 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-nist-800-53_rev_4.html

#### Initializers <a name="Initializers" id="cdk-nag.NIST80053R4Checks.Initializer"></a>

```typescript
import { NIST80053R4Checks } from 'cdk-nag'

new NIST80053R4Checks(scope?: IConstruct, props?: NagPackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NIST80053R4Checks.Initializer.parameter.scope">scope</a></code> | <code>constructs.IConstruct</code> | *No description.* |
| <code><a href="#cdk-nag.NIST80053R4Checks.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nag.NagPackProps">NagPackProps</a></code> | *No description.* |

---

##### `scope`<sup>Optional</sup> <a name="scope" id="cdk-nag.NIST80053R4Checks.Initializer.parameter.scope"></a>

- *Type:* constructs.IConstruct

---

##### `props`<sup>Optional</sup> <a name="props" id="cdk-nag.NIST80053R4Checks.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nag.NagPackProps">NagPackProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.NIST80053R4Checks.validate">validate</a></code> | Entry point called by the CDK validation framework. |
| <code><a href="#cdk-nag.NIST80053R4Checks.validateScope">validateScope</a></code> | Validate a construct tree directly. |

---

##### `validate` <a name="validate" id="cdk-nag.NIST80053R4Checks.validate"></a>

```typescript
public validate(context: IPolicyValidationContext): PolicyValidationPluginReport
```

Entry point called by the CDK validation framework.

Requires `appConstruct` to be present on the context (CDK core change).
For testing or direct invocation, use `validateScope(scope)`.

###### `context`<sup>Required</sup> <a name="context" id="cdk-nag.NIST80053R4Checks.validate.parameter.context"></a>

- *Type:* aws-cdk-lib.IPolicyValidationContext

---

##### `validateScope` <a name="validateScope" id="cdk-nag.NIST80053R4Checks.validateScope"></a>

```typescript
public validateScope(scope: IConstruct): PolicyValidationPluginReport
```

Validate a construct tree directly.

This is the primary entry point
for testing and for CDK versions that do not yet provide `appConstruct` on
`IPolicyValidationContext`.

###### `scope`<sup>Required</sup> <a name="scope" id="cdk-nag.NIST80053R4Checks.validateScope.parameter.scope"></a>

- *Type:* constructs.IConstruct

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NIST80053R4Checks.property.name">name</a></code> | <code>string</code> | The name of the plugin that will be displayed in the validation report. |
| <code><a href="#cdk-nag.NIST80053R4Checks.property.readPackName">readPackName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NIST80053R4Checks.property.ruleIds">ruleIds</a></code> | <code>string[]</code> | The list of rule IDs that the plugin will evaluate. |
| <code><a href="#cdk-nag.NIST80053R4Checks.property.version">version</a></code> | <code>string</code> | The version of the plugin, following the Semantic Versioning specification (see https://semver.org/). This version is used for analytics purposes, to measure the usage of different plugins and different versions. The value of this property should be kept in sync with the actual version of the software package. If the version is not provided or is not a valid semantic version, it will be reported as `0.0.0`. |

---

##### `name`<sup>Required</sup> <a name="name" id="cdk-nag.NIST80053R4Checks.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

The name of the plugin that will be displayed in the validation report.

---

##### `readPackName`<sup>Required</sup> <a name="readPackName" id="cdk-nag.NIST80053R4Checks.property.readPackName"></a>

```typescript
public readonly readPackName: string;
```

- *Type:* string

---

##### `ruleIds`<sup>Optional</sup> <a name="ruleIds" id="cdk-nag.NIST80053R4Checks.property.ruleIds"></a>

```typescript
public readonly ruleIds: string[];
```

- *Type:* string[]

The list of rule IDs that the plugin will evaluate.

Used for analytics
purposes.

---

##### `version`<sup>Optional</sup> <a name="version" id="cdk-nag.NIST80053R4Checks.property.version"></a>

```typescript
public readonly version: string;
```

- *Type:* string

The version of the plugin, following the Semantic Versioning specification (see https://semver.org/). This version is used for analytics purposes, to measure the usage of different plugins and different versions. The value of this property should be kept in sync with the actual version of the software package. If the version is not provided or is not a valid semantic version, it will be reported as `0.0.0`.

---


### NIST80053R5Checks <a name="NIST80053R5Checks" id="cdk-nag.NIST80053R5Checks"></a>

Check for NIST 800-53 rev 5 compliance.

Based on the NIST 800-53 rev 5 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-nist-800-53_rev_5.html

#### Initializers <a name="Initializers" id="cdk-nag.NIST80053R5Checks.Initializer"></a>

```typescript
import { NIST80053R5Checks } from 'cdk-nag'

new NIST80053R5Checks(scope?: IConstruct, props?: NagPackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NIST80053R5Checks.Initializer.parameter.scope">scope</a></code> | <code>constructs.IConstruct</code> | *No description.* |
| <code><a href="#cdk-nag.NIST80053R5Checks.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nag.NagPackProps">NagPackProps</a></code> | *No description.* |

---

##### `scope`<sup>Optional</sup> <a name="scope" id="cdk-nag.NIST80053R5Checks.Initializer.parameter.scope"></a>

- *Type:* constructs.IConstruct

---

##### `props`<sup>Optional</sup> <a name="props" id="cdk-nag.NIST80053R5Checks.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nag.NagPackProps">NagPackProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.NIST80053R5Checks.validate">validate</a></code> | Entry point called by the CDK validation framework. |
| <code><a href="#cdk-nag.NIST80053R5Checks.validateScope">validateScope</a></code> | Validate a construct tree directly. |

---

##### `validate` <a name="validate" id="cdk-nag.NIST80053R5Checks.validate"></a>

```typescript
public validate(context: IPolicyValidationContext): PolicyValidationPluginReport
```

Entry point called by the CDK validation framework.

Requires `appConstruct` to be present on the context (CDK core change).
For testing or direct invocation, use `validateScope(scope)`.

###### `context`<sup>Required</sup> <a name="context" id="cdk-nag.NIST80053R5Checks.validate.parameter.context"></a>

- *Type:* aws-cdk-lib.IPolicyValidationContext

---

##### `validateScope` <a name="validateScope" id="cdk-nag.NIST80053R5Checks.validateScope"></a>

```typescript
public validateScope(scope: IConstruct): PolicyValidationPluginReport
```

Validate a construct tree directly.

This is the primary entry point
for testing and for CDK versions that do not yet provide `appConstruct` on
`IPolicyValidationContext`.

###### `scope`<sup>Required</sup> <a name="scope" id="cdk-nag.NIST80053R5Checks.validateScope.parameter.scope"></a>

- *Type:* constructs.IConstruct

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NIST80053R5Checks.property.name">name</a></code> | <code>string</code> | The name of the plugin that will be displayed in the validation report. |
| <code><a href="#cdk-nag.NIST80053R5Checks.property.readPackName">readPackName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NIST80053R5Checks.property.ruleIds">ruleIds</a></code> | <code>string[]</code> | The list of rule IDs that the plugin will evaluate. |
| <code><a href="#cdk-nag.NIST80053R5Checks.property.version">version</a></code> | <code>string</code> | The version of the plugin, following the Semantic Versioning specification (see https://semver.org/). This version is used for analytics purposes, to measure the usage of different plugins and different versions. The value of this property should be kept in sync with the actual version of the software package. If the version is not provided or is not a valid semantic version, it will be reported as `0.0.0`. |

---

##### `name`<sup>Required</sup> <a name="name" id="cdk-nag.NIST80053R5Checks.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

The name of the plugin that will be displayed in the validation report.

---

##### `readPackName`<sup>Required</sup> <a name="readPackName" id="cdk-nag.NIST80053R5Checks.property.readPackName"></a>

```typescript
public readonly readPackName: string;
```

- *Type:* string

---

##### `ruleIds`<sup>Optional</sup> <a name="ruleIds" id="cdk-nag.NIST80053R5Checks.property.ruleIds"></a>

```typescript
public readonly ruleIds: string[];
```

- *Type:* string[]

The list of rule IDs that the plugin will evaluate.

Used for analytics
purposes.

---

##### `version`<sup>Optional</sup> <a name="version" id="cdk-nag.NIST80053R5Checks.property.version"></a>

```typescript
public readonly version: string;
```

- *Type:* string

The version of the plugin, following the Semantic Versioning specification (see https://semver.org/). This version is used for analytics purposes, to measure the usage of different plugins and different versions. The value of this property should be kept in sync with the actual version of the software package. If the version is not provided or is not a valid semantic version, it will be reported as `0.0.0`.

---


### PCIDSS321Checks <a name="PCIDSS321Checks" id="cdk-nag.PCIDSS321Checks"></a>

Check for PCI DSS 3.2.1 compliance. Based on the PCI DSS 3.2.1 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-pci-dss.html.

#### Initializers <a name="Initializers" id="cdk-nag.PCIDSS321Checks.Initializer"></a>

```typescript
import { PCIDSS321Checks } from 'cdk-nag'

new PCIDSS321Checks(scope?: IConstruct, props?: NagPackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.PCIDSS321Checks.Initializer.parameter.scope">scope</a></code> | <code>constructs.IConstruct</code> | *No description.* |
| <code><a href="#cdk-nag.PCIDSS321Checks.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nag.NagPackProps">NagPackProps</a></code> | *No description.* |

---

##### `scope`<sup>Optional</sup> <a name="scope" id="cdk-nag.PCIDSS321Checks.Initializer.parameter.scope"></a>

- *Type:* constructs.IConstruct

---

##### `props`<sup>Optional</sup> <a name="props" id="cdk-nag.PCIDSS321Checks.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nag.NagPackProps">NagPackProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.PCIDSS321Checks.validate">validate</a></code> | Entry point called by the CDK validation framework. |
| <code><a href="#cdk-nag.PCIDSS321Checks.validateScope">validateScope</a></code> | Validate a construct tree directly. |

---

##### `validate` <a name="validate" id="cdk-nag.PCIDSS321Checks.validate"></a>

```typescript
public validate(context: IPolicyValidationContext): PolicyValidationPluginReport
```

Entry point called by the CDK validation framework.

Requires `appConstruct` to be present on the context (CDK core change).
For testing or direct invocation, use `validateScope(scope)`.

###### `context`<sup>Required</sup> <a name="context" id="cdk-nag.PCIDSS321Checks.validate.parameter.context"></a>

- *Type:* aws-cdk-lib.IPolicyValidationContext

---

##### `validateScope` <a name="validateScope" id="cdk-nag.PCIDSS321Checks.validateScope"></a>

```typescript
public validateScope(scope: IConstruct): PolicyValidationPluginReport
```

Validate a construct tree directly.

This is the primary entry point
for testing and for CDK versions that do not yet provide `appConstruct` on
`IPolicyValidationContext`.

###### `scope`<sup>Required</sup> <a name="scope" id="cdk-nag.PCIDSS321Checks.validateScope.parameter.scope"></a>

- *Type:* constructs.IConstruct

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.PCIDSS321Checks.property.name">name</a></code> | <code>string</code> | The name of the plugin that will be displayed in the validation report. |
| <code><a href="#cdk-nag.PCIDSS321Checks.property.readPackName">readPackName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.PCIDSS321Checks.property.ruleIds">ruleIds</a></code> | <code>string[]</code> | The list of rule IDs that the plugin will evaluate. |
| <code><a href="#cdk-nag.PCIDSS321Checks.property.version">version</a></code> | <code>string</code> | The version of the plugin, following the Semantic Versioning specification (see https://semver.org/). This version is used for analytics purposes, to measure the usage of different plugins and different versions. The value of this property should be kept in sync with the actual version of the software package. If the version is not provided or is not a valid semantic version, it will be reported as `0.0.0`. |

---

##### `name`<sup>Required</sup> <a name="name" id="cdk-nag.PCIDSS321Checks.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

The name of the plugin that will be displayed in the validation report.

---

##### `readPackName`<sup>Required</sup> <a name="readPackName" id="cdk-nag.PCIDSS321Checks.property.readPackName"></a>

```typescript
public readonly readPackName: string;
```

- *Type:* string

---

##### `ruleIds`<sup>Optional</sup> <a name="ruleIds" id="cdk-nag.PCIDSS321Checks.property.ruleIds"></a>

```typescript
public readonly ruleIds: string[];
```

- *Type:* string[]

The list of rule IDs that the plugin will evaluate.

Used for analytics
purposes.

---

##### `version`<sup>Optional</sup> <a name="version" id="cdk-nag.PCIDSS321Checks.property.version"></a>

```typescript
public readonly version: string;
```

- *Type:* string

The version of the plugin, following the Semantic Versioning specification (see https://semver.org/). This version is used for analytics purposes, to measure the usage of different plugins and different versions. The value of this property should be kept in sync with the actual version of the software package. If the version is not provided or is not a valid semantic version, it will be reported as `0.0.0`.

---


### ServerlessChecks <a name="ServerlessChecks" id="cdk-nag.ServerlessChecks"></a>

Serverless Checks are a compilation of rules to validate infrastructure-as-code template against recommended practices.

#### Initializers <a name="Initializers" id="cdk-nag.ServerlessChecks.Initializer"></a>

```typescript
import { ServerlessChecks } from 'cdk-nag'

new ServerlessChecks(scope?: IConstruct, props?: NagPackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.ServerlessChecks.Initializer.parameter.scope">scope</a></code> | <code>constructs.IConstruct</code> | *No description.* |
| <code><a href="#cdk-nag.ServerlessChecks.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nag.NagPackProps">NagPackProps</a></code> | *No description.* |

---

##### `scope`<sup>Optional</sup> <a name="scope" id="cdk-nag.ServerlessChecks.Initializer.parameter.scope"></a>

- *Type:* constructs.IConstruct

---

##### `props`<sup>Optional</sup> <a name="props" id="cdk-nag.ServerlessChecks.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nag.NagPackProps">NagPackProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.ServerlessChecks.validate">validate</a></code> | Entry point called by the CDK validation framework. |
| <code><a href="#cdk-nag.ServerlessChecks.validateScope">validateScope</a></code> | Validate a construct tree directly. |

---

##### `validate` <a name="validate" id="cdk-nag.ServerlessChecks.validate"></a>

```typescript
public validate(context: IPolicyValidationContext): PolicyValidationPluginReport
```

Entry point called by the CDK validation framework.

Requires `appConstruct` to be present on the context (CDK core change).
For testing or direct invocation, use `validateScope(scope)`.

###### `context`<sup>Required</sup> <a name="context" id="cdk-nag.ServerlessChecks.validate.parameter.context"></a>

- *Type:* aws-cdk-lib.IPolicyValidationContext

---

##### `validateScope` <a name="validateScope" id="cdk-nag.ServerlessChecks.validateScope"></a>

```typescript
public validateScope(scope: IConstruct): PolicyValidationPluginReport
```

Validate a construct tree directly.

This is the primary entry point
for testing and for CDK versions that do not yet provide `appConstruct` on
`IPolicyValidationContext`.

###### `scope`<sup>Required</sup> <a name="scope" id="cdk-nag.ServerlessChecks.validateScope.parameter.scope"></a>

- *Type:* constructs.IConstruct

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.ServerlessChecks.property.name">name</a></code> | <code>string</code> | The name of the plugin that will be displayed in the validation report. |
| <code><a href="#cdk-nag.ServerlessChecks.property.readPackName">readPackName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.ServerlessChecks.property.ruleIds">ruleIds</a></code> | <code>string[]</code> | The list of rule IDs that the plugin will evaluate. |
| <code><a href="#cdk-nag.ServerlessChecks.property.version">version</a></code> | <code>string</code> | The version of the plugin, following the Semantic Versioning specification (see https://semver.org/). This version is used for analytics purposes, to measure the usage of different plugins and different versions. The value of this property should be kept in sync with the actual version of the software package. If the version is not provided or is not a valid semantic version, it will be reported as `0.0.0`. |

---

##### `name`<sup>Required</sup> <a name="name" id="cdk-nag.ServerlessChecks.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

The name of the plugin that will be displayed in the validation report.

---

##### `readPackName`<sup>Required</sup> <a name="readPackName" id="cdk-nag.ServerlessChecks.property.readPackName"></a>

```typescript
public readonly readPackName: string;
```

- *Type:* string

---

##### `ruleIds`<sup>Optional</sup> <a name="ruleIds" id="cdk-nag.ServerlessChecks.property.ruleIds"></a>

```typescript
public readonly ruleIds: string[];
```

- *Type:* string[]

The list of rule IDs that the plugin will evaluate.

Used for analytics
purposes.

---

##### `version`<sup>Optional</sup> <a name="version" id="cdk-nag.ServerlessChecks.property.version"></a>

```typescript
public readonly version: string;
```

- *Type:* string

The version of the plugin, following the Semantic Versioning specification (see https://semver.org/). This version is used for analytics purposes, to measure the usage of different plugins and different versions. The value of this property should be kept in sync with the actual version of the software package. If the version is not provided or is not a valid semantic version, it will be reported as `0.0.0`.

---


### WriteNagSuppressionsToCloudFormationAspect <a name="WriteNagSuppressionsToCloudFormationAspect" id="cdk-nag.WriteNagSuppressionsToCloudFormationAspect"></a>

- *Implements:* aws-cdk-lib.IAspect

An IAspect that reads acknowledged rules from construct metadata and writes them into the CfnResource's CloudFormation Metadata for audit trail persistence in the synthesized template.

Preserves the v2 `cdk_nag`
metadata format.

#### Initializers <a name="Initializers" id="cdk-nag.WriteNagSuppressionsToCloudFormationAspect.Initializer"></a>

```typescript
import { WriteNagSuppressionsToCloudFormationAspect } from 'cdk-nag'

new WriteNagSuppressionsToCloudFormationAspect()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.WriteNagSuppressionsToCloudFormationAspect.visit">visit</a></code> | All aspects can visit an IConstruct. |

---

##### `visit` <a name="visit" id="cdk-nag.WriteNagSuppressionsToCloudFormationAspect.visit"></a>

```typescript
public visit(node: IConstruct): void
```

All aspects can visit an IConstruct.

###### `node`<sup>Required</sup> <a name="node" id="cdk-nag.WriteNagSuppressionsToCloudFormationAspect.visit.parameter.node"></a>

- *Type:* constructs.IConstruct

---




## Protocols <a name="Protocols" id="Protocols"></a>

### IApplyRule <a name="IApplyRule" id="cdk-nag.IApplyRule"></a>

- *Implemented By:* <a href="#cdk-nag.IApplyRule">IApplyRule</a>

Interface for JSII interoperability for passing parameters and the Rule Callback to.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.IApplyRule.rule">rule</a></code> | The callback to the rule. |

---

##### `rule` <a name="rule" id="cdk-nag.IApplyRule.rule"></a>

```typescript
public rule(node: CfnResource): NagRuleCompliance | string[]
```

The callback to the rule.

###### `node`<sup>Required</sup> <a name="node" id="cdk-nag.IApplyRule.rule.parameter.node"></a>

- *Type:* aws-cdk-lib.CfnResource

The CfnResource to check.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.IApplyRule.property.explanation">explanation</a></code> | <code>string</code> | Why the rule exists. |
| <code><a href="#cdk-nag.IApplyRule.property.info">info</a></code> | <code>string</code> | Why the rule was triggered. |
| <code><a href="#cdk-nag.IApplyRule.property.level">level</a></code> | <code><a href="#cdk-nag.NagMessageLevel">NagMessageLevel</a></code> | The annotations message level to apply to the rule if triggered. |
| <code><a href="#cdk-nag.IApplyRule.property.node">node</a></code> | <code>aws-cdk-lib.CfnResource</code> | The CfnResource to check. |
| <code><a href="#cdk-nag.IApplyRule.property.ruleSuffixOverride">ruleSuffixOverride</a></code> | <code>string</code> | Override for the suffix of the Rule ID for this rule. |

---

##### `explanation`<sup>Required</sup> <a name="explanation" id="cdk-nag.IApplyRule.property.explanation"></a>

```typescript
public readonly explanation: string;
```

- *Type:* string

Why the rule exists.

---

##### `info`<sup>Required</sup> <a name="info" id="cdk-nag.IApplyRule.property.info"></a>

```typescript
public readonly info: string;
```

- *Type:* string

Why the rule was triggered.

---

##### `level`<sup>Required</sup> <a name="level" id="cdk-nag.IApplyRule.property.level"></a>

```typescript
public readonly level: NagMessageLevel;
```

- *Type:* <a href="#cdk-nag.NagMessageLevel">NagMessageLevel</a>

The annotations message level to apply to the rule if triggered.

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-nag.IApplyRule.property.node"></a>

```typescript
public readonly node: CfnResource;
```

- *Type:* aws-cdk-lib.CfnResource

The CfnResource to check.

---

##### `ruleSuffixOverride`<sup>Optional</sup> <a name="ruleSuffixOverride" id="cdk-nag.IApplyRule.property.ruleSuffixOverride"></a>

```typescript
public readonly ruleSuffixOverride: string;
```

- *Type:* string

Override for the suffix of the Rule ID for this rule.

---

### INagValidationContext <a name="INagValidationContext" id="cdk-nag.INagValidationContext"></a>

- *Extends:* aws-cdk-lib.IPolicyValidationContext

- *Implemented By:* <a href="#cdk-nag.INagValidationContext">INagValidationContext</a>

Extended validation context that includes the construct tree.

Requires CDK core change to populate `appConstruct` during plugin validation.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.INagValidationContext.property.templatePaths">templatePaths</a></code> | <code>string[]</code> | The absolute path of all templates to be processed. |
| <code><a href="#cdk-nag.INagValidationContext.property.appConstruct">appConstruct</a></code> | <code>constructs.IConstruct</code> | *No description.* |

---

##### `templatePaths`<sup>Required</sup> <a name="templatePaths" id="cdk-nag.INagValidationContext.property.templatePaths"></a>

```typescript
public readonly templatePaths: string[];
```

- *Type:* string[]

The absolute path of all templates to be processed.

---

##### `appConstruct`<sup>Required</sup> <a name="appConstruct" id="cdk-nag.INagValidationContext.property.appConstruct"></a>

```typescript
public readonly appConstruct: IConstruct;
```

- *Type:* constructs.IConstruct

---

## Enums <a name="Enums" id="Enums"></a>

### NagMessageLevel <a name="NagMessageLevel" id="cdk-nag.NagMessageLevel"></a>

The severity level of the rule.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.NagMessageLevel.WARN">WARN</a></code> | *No description.* |
| <code><a href="#cdk-nag.NagMessageLevel.ERROR">ERROR</a></code> | *No description.* |
| <code><a href="#cdk-nag.NagMessageLevel.INFO">INFO</a></code> | *No description.* |

---

##### `WARN` <a name="WARN" id="cdk-nag.NagMessageLevel.WARN"></a>

---


##### `ERROR` <a name="ERROR" id="cdk-nag.NagMessageLevel.ERROR"></a>

---


##### `INFO` <a name="INFO" id="cdk-nag.NagMessageLevel.INFO"></a>

---


### NagReportFormat <a name="NagReportFormat" id="cdk-nag.NagReportFormat"></a>

Possible output formats of the NagReport.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.NagReportFormat.CSV">CSV</a></code> | *No description.* |
| <code><a href="#cdk-nag.NagReportFormat.JSON">JSON</a></code> | *No description.* |

---

##### `CSV` <a name="CSV" id="cdk-nag.NagReportFormat.CSV"></a>

---


##### `JSON` <a name="JSON" id="cdk-nag.NagReportFormat.JSON"></a>

---


### NagRuleCompliance <a name="NagRuleCompliance" id="cdk-nag.NagRuleCompliance"></a>

The compliance level of a resource in relation to a rule.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.NagRuleCompliance.COMPLIANT">COMPLIANT</a></code> | *No description.* |
| <code><a href="#cdk-nag.NagRuleCompliance.NON_COMPLIANT">NON_COMPLIANT</a></code> | *No description.* |
| <code><a href="#cdk-nag.NagRuleCompliance.NOT_APPLICABLE">NOT_APPLICABLE</a></code> | *No description.* |

---

##### `COMPLIANT` <a name="COMPLIANT" id="cdk-nag.NagRuleCompliance.COMPLIANT"></a>

---


##### `NON_COMPLIANT` <a name="NON_COMPLIANT" id="cdk-nag.NagRuleCompliance.NON_COMPLIANT"></a>

---


##### `NOT_APPLICABLE` <a name="NOT_APPLICABLE" id="cdk-nag.NagRuleCompliance.NOT_APPLICABLE"></a>

---


### NagRulePostValidationStates <a name="NagRulePostValidationStates" id="cdk-nag.NagRulePostValidationStates"></a>

Additional states a rule can be in post compliance validation.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.NagRulePostValidationStates.UNKNOWN">UNKNOWN</a></code> | *No description.* |

---

##### `UNKNOWN` <a name="UNKNOWN" id="cdk-nag.NagRulePostValidationStates.UNKNOWN"></a>

---

