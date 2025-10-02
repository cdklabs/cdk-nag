# API Reference <a name="API Reference" id="api-reference"></a>


## Structs <a name="Structs" id="Structs"></a>

### AnnotationLoggerProps <a name="AnnotationLoggerProps" id="cdk-nag.AnnotationLoggerProps"></a>

Props for the AnnotationLogger.

#### Initializer <a name="Initializer" id="cdk-nag.AnnotationLoggerProps.Initializer"></a>

```typescript
import { AnnotationLoggerProps } from 'cdk-nag'

const annotationLoggerProps: AnnotationLoggerProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.AnnotationLoggerProps.property.logIgnores">logIgnores</a></code> | <code>boolean</code> | Whether or not to log suppressed rule violations as informational messages (default: false). |
| <code><a href="#cdk-nag.AnnotationLoggerProps.property.verbose">verbose</a></code> | <code>boolean</code> | Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages. |

---

##### `logIgnores`<sup>Optional</sup> <a name="logIgnores" id="cdk-nag.AnnotationLoggerProps.property.logIgnores"></a>

```typescript
public readonly logIgnores: boolean;
```

- *Type:* boolean

Whether or not to log suppressed rule violations as informational messages (default: false).

---

##### `verbose`<sup>Optional</sup> <a name="verbose" id="cdk-nag.AnnotationLoggerProps.property.verbose"></a>

```typescript
public readonly verbose: boolean;
```

- *Type:* boolean

Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages.

---

### NagLoggerBaseData <a name="NagLoggerBaseData" id="cdk-nag.NagLoggerBaseData"></a>

Shared data for all INagLogger methods.

#### Initializer <a name="Initializer" id="cdk-nag.NagLoggerBaseData.Initializer"></a>

```typescript
import { NagLoggerBaseData } from 'cdk-nag'

const nagLoggerBaseData: NagLoggerBaseData = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NagLoggerBaseData.property.nagPackName">nagPackName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerBaseData.property.resource">resource</a></code> | <code>aws-cdk-lib.CfnResource</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerBaseData.property.ruleExplanation">ruleExplanation</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerBaseData.property.ruleId">ruleId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerBaseData.property.ruleInfo">ruleInfo</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerBaseData.property.ruleLevel">ruleLevel</a></code> | <code><a href="#cdk-nag.NagMessageLevel">NagMessageLevel</a></code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerBaseData.property.ruleOriginalName">ruleOriginalName</a></code> | <code>string</code> | *No description.* |

---

##### `nagPackName`<sup>Required</sup> <a name="nagPackName" id="cdk-nag.NagLoggerBaseData.property.nagPackName"></a>

```typescript
public readonly nagPackName: string;
```

- *Type:* string

---

##### `resource`<sup>Required</sup> <a name="resource" id="cdk-nag.NagLoggerBaseData.property.resource"></a>

```typescript
public readonly resource: CfnResource;
```

- *Type:* aws-cdk-lib.CfnResource

---

##### `ruleExplanation`<sup>Required</sup> <a name="ruleExplanation" id="cdk-nag.NagLoggerBaseData.property.ruleExplanation"></a>

```typescript
public readonly ruleExplanation: string;
```

- *Type:* string

---

##### `ruleId`<sup>Required</sup> <a name="ruleId" id="cdk-nag.NagLoggerBaseData.property.ruleId"></a>

```typescript
public readonly ruleId: string;
```

- *Type:* string

---

##### `ruleInfo`<sup>Required</sup> <a name="ruleInfo" id="cdk-nag.NagLoggerBaseData.property.ruleInfo"></a>

```typescript
public readonly ruleInfo: string;
```

- *Type:* string

---

##### `ruleLevel`<sup>Required</sup> <a name="ruleLevel" id="cdk-nag.NagLoggerBaseData.property.ruleLevel"></a>

```typescript
public readonly ruleLevel: NagMessageLevel;
```

- *Type:* <a href="#cdk-nag.NagMessageLevel">NagMessageLevel</a>

---

##### `ruleOriginalName`<sup>Required</sup> <a name="ruleOriginalName" id="cdk-nag.NagLoggerBaseData.property.ruleOriginalName"></a>

```typescript
public readonly ruleOriginalName: string;
```

- *Type:* string

---

### NagLoggerComplianceData <a name="NagLoggerComplianceData" id="cdk-nag.NagLoggerComplianceData"></a>

Data for onCompliance method of an INagLogger.

#### Initializer <a name="Initializer" id="cdk-nag.NagLoggerComplianceData.Initializer"></a>

```typescript
import { NagLoggerComplianceData } from 'cdk-nag'

const nagLoggerComplianceData: NagLoggerComplianceData = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NagLoggerComplianceData.property.nagPackName">nagPackName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerComplianceData.property.resource">resource</a></code> | <code>aws-cdk-lib.CfnResource</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerComplianceData.property.ruleExplanation">ruleExplanation</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerComplianceData.property.ruleId">ruleId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerComplianceData.property.ruleInfo">ruleInfo</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerComplianceData.property.ruleLevel">ruleLevel</a></code> | <code><a href="#cdk-nag.NagMessageLevel">NagMessageLevel</a></code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerComplianceData.property.ruleOriginalName">ruleOriginalName</a></code> | <code>string</code> | *No description.* |

---

##### `nagPackName`<sup>Required</sup> <a name="nagPackName" id="cdk-nag.NagLoggerComplianceData.property.nagPackName"></a>

```typescript
public readonly nagPackName: string;
```

- *Type:* string

---

##### `resource`<sup>Required</sup> <a name="resource" id="cdk-nag.NagLoggerComplianceData.property.resource"></a>

```typescript
public readonly resource: CfnResource;
```

- *Type:* aws-cdk-lib.CfnResource

---

##### `ruleExplanation`<sup>Required</sup> <a name="ruleExplanation" id="cdk-nag.NagLoggerComplianceData.property.ruleExplanation"></a>

```typescript
public readonly ruleExplanation: string;
```

- *Type:* string

---

##### `ruleId`<sup>Required</sup> <a name="ruleId" id="cdk-nag.NagLoggerComplianceData.property.ruleId"></a>

```typescript
public readonly ruleId: string;
```

- *Type:* string

---

##### `ruleInfo`<sup>Required</sup> <a name="ruleInfo" id="cdk-nag.NagLoggerComplianceData.property.ruleInfo"></a>

```typescript
public readonly ruleInfo: string;
```

- *Type:* string

---

##### `ruleLevel`<sup>Required</sup> <a name="ruleLevel" id="cdk-nag.NagLoggerComplianceData.property.ruleLevel"></a>

```typescript
public readonly ruleLevel: NagMessageLevel;
```

- *Type:* <a href="#cdk-nag.NagMessageLevel">NagMessageLevel</a>

---

##### `ruleOriginalName`<sup>Required</sup> <a name="ruleOriginalName" id="cdk-nag.NagLoggerComplianceData.property.ruleOriginalName"></a>

```typescript
public readonly ruleOriginalName: string;
```

- *Type:* string

---

### NagLoggerErrorData <a name="NagLoggerErrorData" id="cdk-nag.NagLoggerErrorData"></a>

Data for onError method of an INagLogger.

#### Initializer <a name="Initializer" id="cdk-nag.NagLoggerErrorData.Initializer"></a>

```typescript
import { NagLoggerErrorData } from 'cdk-nag'

const nagLoggerErrorData: NagLoggerErrorData = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NagLoggerErrorData.property.nagPackName">nagPackName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerErrorData.property.resource">resource</a></code> | <code>aws-cdk-lib.CfnResource</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerErrorData.property.ruleExplanation">ruleExplanation</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerErrorData.property.ruleId">ruleId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerErrorData.property.ruleInfo">ruleInfo</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerErrorData.property.ruleLevel">ruleLevel</a></code> | <code><a href="#cdk-nag.NagMessageLevel">NagMessageLevel</a></code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerErrorData.property.ruleOriginalName">ruleOriginalName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerErrorData.property.errorMessage">errorMessage</a></code> | <code>string</code> | *No description.* |

---

##### `nagPackName`<sup>Required</sup> <a name="nagPackName" id="cdk-nag.NagLoggerErrorData.property.nagPackName"></a>

```typescript
public readonly nagPackName: string;
```

- *Type:* string

---

##### `resource`<sup>Required</sup> <a name="resource" id="cdk-nag.NagLoggerErrorData.property.resource"></a>

```typescript
public readonly resource: CfnResource;
```

- *Type:* aws-cdk-lib.CfnResource

---

##### `ruleExplanation`<sup>Required</sup> <a name="ruleExplanation" id="cdk-nag.NagLoggerErrorData.property.ruleExplanation"></a>

```typescript
public readonly ruleExplanation: string;
```

- *Type:* string

---

##### `ruleId`<sup>Required</sup> <a name="ruleId" id="cdk-nag.NagLoggerErrorData.property.ruleId"></a>

```typescript
public readonly ruleId: string;
```

- *Type:* string

---

##### `ruleInfo`<sup>Required</sup> <a name="ruleInfo" id="cdk-nag.NagLoggerErrorData.property.ruleInfo"></a>

```typescript
public readonly ruleInfo: string;
```

- *Type:* string

---

##### `ruleLevel`<sup>Required</sup> <a name="ruleLevel" id="cdk-nag.NagLoggerErrorData.property.ruleLevel"></a>

```typescript
public readonly ruleLevel: NagMessageLevel;
```

- *Type:* <a href="#cdk-nag.NagMessageLevel">NagMessageLevel</a>

---

##### `ruleOriginalName`<sup>Required</sup> <a name="ruleOriginalName" id="cdk-nag.NagLoggerErrorData.property.ruleOriginalName"></a>

```typescript
public readonly ruleOriginalName: string;
```

- *Type:* string

---

##### `errorMessage`<sup>Required</sup> <a name="errorMessage" id="cdk-nag.NagLoggerErrorData.property.errorMessage"></a>

```typescript
public readonly errorMessage: string;
```

- *Type:* string

---

### NagLoggerNonComplianceData <a name="NagLoggerNonComplianceData" id="cdk-nag.NagLoggerNonComplianceData"></a>

Data for onNonCompliance method of an INagLogger.

#### Initializer <a name="Initializer" id="cdk-nag.NagLoggerNonComplianceData.Initializer"></a>

```typescript
import { NagLoggerNonComplianceData } from 'cdk-nag'

const nagLoggerNonComplianceData: NagLoggerNonComplianceData = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NagLoggerNonComplianceData.property.nagPackName">nagPackName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerNonComplianceData.property.resource">resource</a></code> | <code>aws-cdk-lib.CfnResource</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerNonComplianceData.property.ruleExplanation">ruleExplanation</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerNonComplianceData.property.ruleId">ruleId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerNonComplianceData.property.ruleInfo">ruleInfo</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerNonComplianceData.property.ruleLevel">ruleLevel</a></code> | <code><a href="#cdk-nag.NagMessageLevel">NagMessageLevel</a></code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerNonComplianceData.property.ruleOriginalName">ruleOriginalName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerNonComplianceData.property.findingId">findingId</a></code> | <code>string</code> | *No description.* |

---

##### `nagPackName`<sup>Required</sup> <a name="nagPackName" id="cdk-nag.NagLoggerNonComplianceData.property.nagPackName"></a>

```typescript
public readonly nagPackName: string;
```

- *Type:* string

---

##### `resource`<sup>Required</sup> <a name="resource" id="cdk-nag.NagLoggerNonComplianceData.property.resource"></a>

```typescript
public readonly resource: CfnResource;
```

- *Type:* aws-cdk-lib.CfnResource

---

##### `ruleExplanation`<sup>Required</sup> <a name="ruleExplanation" id="cdk-nag.NagLoggerNonComplianceData.property.ruleExplanation"></a>

```typescript
public readonly ruleExplanation: string;
```

- *Type:* string

---

##### `ruleId`<sup>Required</sup> <a name="ruleId" id="cdk-nag.NagLoggerNonComplianceData.property.ruleId"></a>

```typescript
public readonly ruleId: string;
```

- *Type:* string

---

##### `ruleInfo`<sup>Required</sup> <a name="ruleInfo" id="cdk-nag.NagLoggerNonComplianceData.property.ruleInfo"></a>

```typescript
public readonly ruleInfo: string;
```

- *Type:* string

---

##### `ruleLevel`<sup>Required</sup> <a name="ruleLevel" id="cdk-nag.NagLoggerNonComplianceData.property.ruleLevel"></a>

```typescript
public readonly ruleLevel: NagMessageLevel;
```

- *Type:* <a href="#cdk-nag.NagMessageLevel">NagMessageLevel</a>

---

##### `ruleOriginalName`<sup>Required</sup> <a name="ruleOriginalName" id="cdk-nag.NagLoggerNonComplianceData.property.ruleOriginalName"></a>

```typescript
public readonly ruleOriginalName: string;
```

- *Type:* string

---

##### `findingId`<sup>Required</sup> <a name="findingId" id="cdk-nag.NagLoggerNonComplianceData.property.findingId"></a>

```typescript
public readonly findingId: string;
```

- *Type:* string

---

### NagLoggerNotApplicableData <a name="NagLoggerNotApplicableData" id="cdk-nag.NagLoggerNotApplicableData"></a>

Data for onNotApplicable method of an INagLogger.

#### Initializer <a name="Initializer" id="cdk-nag.NagLoggerNotApplicableData.Initializer"></a>

```typescript
import { NagLoggerNotApplicableData } from 'cdk-nag'

const nagLoggerNotApplicableData: NagLoggerNotApplicableData = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NagLoggerNotApplicableData.property.nagPackName">nagPackName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerNotApplicableData.property.resource">resource</a></code> | <code>aws-cdk-lib.CfnResource</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerNotApplicableData.property.ruleExplanation">ruleExplanation</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerNotApplicableData.property.ruleId">ruleId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerNotApplicableData.property.ruleInfo">ruleInfo</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerNotApplicableData.property.ruleLevel">ruleLevel</a></code> | <code><a href="#cdk-nag.NagMessageLevel">NagMessageLevel</a></code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerNotApplicableData.property.ruleOriginalName">ruleOriginalName</a></code> | <code>string</code> | *No description.* |

---

##### `nagPackName`<sup>Required</sup> <a name="nagPackName" id="cdk-nag.NagLoggerNotApplicableData.property.nagPackName"></a>

```typescript
public readonly nagPackName: string;
```

- *Type:* string

---

##### `resource`<sup>Required</sup> <a name="resource" id="cdk-nag.NagLoggerNotApplicableData.property.resource"></a>

```typescript
public readonly resource: CfnResource;
```

- *Type:* aws-cdk-lib.CfnResource

---

##### `ruleExplanation`<sup>Required</sup> <a name="ruleExplanation" id="cdk-nag.NagLoggerNotApplicableData.property.ruleExplanation"></a>

```typescript
public readonly ruleExplanation: string;
```

- *Type:* string

---

##### `ruleId`<sup>Required</sup> <a name="ruleId" id="cdk-nag.NagLoggerNotApplicableData.property.ruleId"></a>

```typescript
public readonly ruleId: string;
```

- *Type:* string

---

##### `ruleInfo`<sup>Required</sup> <a name="ruleInfo" id="cdk-nag.NagLoggerNotApplicableData.property.ruleInfo"></a>

```typescript
public readonly ruleInfo: string;
```

- *Type:* string

---

##### `ruleLevel`<sup>Required</sup> <a name="ruleLevel" id="cdk-nag.NagLoggerNotApplicableData.property.ruleLevel"></a>

```typescript
public readonly ruleLevel: NagMessageLevel;
```

- *Type:* <a href="#cdk-nag.NagMessageLevel">NagMessageLevel</a>

---

##### `ruleOriginalName`<sup>Required</sup> <a name="ruleOriginalName" id="cdk-nag.NagLoggerNotApplicableData.property.ruleOriginalName"></a>

```typescript
public readonly ruleOriginalName: string;
```

- *Type:* string

---

### NagLoggerSuppressedData <a name="NagLoggerSuppressedData" id="cdk-nag.NagLoggerSuppressedData"></a>

Data for onSuppressed method of an INagLogger.

#### Initializer <a name="Initializer" id="cdk-nag.NagLoggerSuppressedData.Initializer"></a>

```typescript
import { NagLoggerSuppressedData } from 'cdk-nag'

const nagLoggerSuppressedData: NagLoggerSuppressedData = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NagLoggerSuppressedData.property.nagPackName">nagPackName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerSuppressedData.property.resource">resource</a></code> | <code>aws-cdk-lib.CfnResource</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerSuppressedData.property.ruleExplanation">ruleExplanation</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerSuppressedData.property.ruleId">ruleId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerSuppressedData.property.ruleInfo">ruleInfo</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerSuppressedData.property.ruleLevel">ruleLevel</a></code> | <code><a href="#cdk-nag.NagMessageLevel">NagMessageLevel</a></code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerSuppressedData.property.ruleOriginalName">ruleOriginalName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerSuppressedData.property.findingId">findingId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerSuppressedData.property.suppressionReason">suppressionReason</a></code> | <code>string</code> | *No description.* |

---

##### `nagPackName`<sup>Required</sup> <a name="nagPackName" id="cdk-nag.NagLoggerSuppressedData.property.nagPackName"></a>

```typescript
public readonly nagPackName: string;
```

- *Type:* string

---

##### `resource`<sup>Required</sup> <a name="resource" id="cdk-nag.NagLoggerSuppressedData.property.resource"></a>

```typescript
public readonly resource: CfnResource;
```

- *Type:* aws-cdk-lib.CfnResource

---

##### `ruleExplanation`<sup>Required</sup> <a name="ruleExplanation" id="cdk-nag.NagLoggerSuppressedData.property.ruleExplanation"></a>

```typescript
public readonly ruleExplanation: string;
```

- *Type:* string

---

##### `ruleId`<sup>Required</sup> <a name="ruleId" id="cdk-nag.NagLoggerSuppressedData.property.ruleId"></a>

```typescript
public readonly ruleId: string;
```

- *Type:* string

---

##### `ruleInfo`<sup>Required</sup> <a name="ruleInfo" id="cdk-nag.NagLoggerSuppressedData.property.ruleInfo"></a>

```typescript
public readonly ruleInfo: string;
```

- *Type:* string

---

##### `ruleLevel`<sup>Required</sup> <a name="ruleLevel" id="cdk-nag.NagLoggerSuppressedData.property.ruleLevel"></a>

```typescript
public readonly ruleLevel: NagMessageLevel;
```

- *Type:* <a href="#cdk-nag.NagMessageLevel">NagMessageLevel</a>

---

##### `ruleOriginalName`<sup>Required</sup> <a name="ruleOriginalName" id="cdk-nag.NagLoggerSuppressedData.property.ruleOriginalName"></a>

```typescript
public readonly ruleOriginalName: string;
```

- *Type:* string

---

##### `findingId`<sup>Required</sup> <a name="findingId" id="cdk-nag.NagLoggerSuppressedData.property.findingId"></a>

```typescript
public readonly findingId: string;
```

- *Type:* string

---

##### `suppressionReason`<sup>Required</sup> <a name="suppressionReason" id="cdk-nag.NagLoggerSuppressedData.property.suppressionReason"></a>

```typescript
public readonly suppressionReason: string;
```

- *Type:* string

---

### NagLoggerSuppressedErrorData <a name="NagLoggerSuppressedErrorData" id="cdk-nag.NagLoggerSuppressedErrorData"></a>

Data for onSuppressedError method of an INagLogger.

#### Initializer <a name="Initializer" id="cdk-nag.NagLoggerSuppressedErrorData.Initializer"></a>

```typescript
import { NagLoggerSuppressedErrorData } from 'cdk-nag'

const nagLoggerSuppressedErrorData: NagLoggerSuppressedErrorData = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NagLoggerSuppressedErrorData.property.nagPackName">nagPackName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerSuppressedErrorData.property.resource">resource</a></code> | <code>aws-cdk-lib.CfnResource</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerSuppressedErrorData.property.ruleExplanation">ruleExplanation</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerSuppressedErrorData.property.ruleId">ruleId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerSuppressedErrorData.property.ruleInfo">ruleInfo</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerSuppressedErrorData.property.ruleLevel">ruleLevel</a></code> | <code><a href="#cdk-nag.NagMessageLevel">NagMessageLevel</a></code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerSuppressedErrorData.property.ruleOriginalName">ruleOriginalName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerSuppressedErrorData.property.errorMessage">errorMessage</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagLoggerSuppressedErrorData.property.errorSuppressionReason">errorSuppressionReason</a></code> | <code>string</code> | *No description.* |

---

##### `nagPackName`<sup>Required</sup> <a name="nagPackName" id="cdk-nag.NagLoggerSuppressedErrorData.property.nagPackName"></a>

```typescript
public readonly nagPackName: string;
```

- *Type:* string

---

##### `resource`<sup>Required</sup> <a name="resource" id="cdk-nag.NagLoggerSuppressedErrorData.property.resource"></a>

```typescript
public readonly resource: CfnResource;
```

- *Type:* aws-cdk-lib.CfnResource

---

##### `ruleExplanation`<sup>Required</sup> <a name="ruleExplanation" id="cdk-nag.NagLoggerSuppressedErrorData.property.ruleExplanation"></a>

```typescript
public readonly ruleExplanation: string;
```

- *Type:* string

---

##### `ruleId`<sup>Required</sup> <a name="ruleId" id="cdk-nag.NagLoggerSuppressedErrorData.property.ruleId"></a>

```typescript
public readonly ruleId: string;
```

- *Type:* string

---

##### `ruleInfo`<sup>Required</sup> <a name="ruleInfo" id="cdk-nag.NagLoggerSuppressedErrorData.property.ruleInfo"></a>

```typescript
public readonly ruleInfo: string;
```

- *Type:* string

---

##### `ruleLevel`<sup>Required</sup> <a name="ruleLevel" id="cdk-nag.NagLoggerSuppressedErrorData.property.ruleLevel"></a>

```typescript
public readonly ruleLevel: NagMessageLevel;
```

- *Type:* <a href="#cdk-nag.NagMessageLevel">NagMessageLevel</a>

---

##### `ruleOriginalName`<sup>Required</sup> <a name="ruleOriginalName" id="cdk-nag.NagLoggerSuppressedErrorData.property.ruleOriginalName"></a>

```typescript
public readonly ruleOriginalName: string;
```

- *Type:* string

---

##### `errorMessage`<sup>Required</sup> <a name="errorMessage" id="cdk-nag.NagLoggerSuppressedErrorData.property.errorMessage"></a>

```typescript
public readonly errorMessage: string;
```

- *Type:* string

---

##### `errorSuppressionReason`<sup>Required</sup> <a name="errorSuppressionReason" id="cdk-nag.NagLoggerSuppressedErrorData.property.errorSuppressionReason"></a>

```typescript
public readonly errorSuppressionReason: string;
```

- *Type:* string

---

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
| <code><a href="#cdk-nag.NagPackProps.property.additionalLoggers">additionalLoggers</a></code> | <code><a href="#cdk-nag.INagLogger">INagLogger</a>[]</code> | Additional NagLoggers for logging rule validation outputs. |
| <code><a href="#cdk-nag.NagPackProps.property.logIgnores">logIgnores</a></code> | <code>boolean</code> | Whether or not to log suppressed rule violations as informational messages (default: false). |
| <code><a href="#cdk-nag.NagPackProps.property.reportFormats">reportFormats</a></code> | <code><a href="#cdk-nag.NagReportFormat">NagReportFormat</a>[]</code> | If reports are enabled, the output formats of compliance reports in the App's output directory (default: only CSV). |
| <code><a href="#cdk-nag.NagPackProps.property.reports">reports</a></code> | <code>boolean</code> | Whether or not to generate compliance reports for applied Stacks in the App's output directory (default: true). |
| <code><a href="#cdk-nag.NagPackProps.property.suppressionIgnoreCondition">suppressionIgnoreCondition</a></code> | <code><a href="#cdk-nag.INagSuppressionIgnore">INagSuppressionIgnore</a></code> | Conditionally prevent rules from being suppressed (default: no user provided condition). |
| <code><a href="#cdk-nag.NagPackProps.property.verbose">verbose</a></code> | <code>boolean</code> | Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false). |

---

##### `additionalLoggers`<sup>Optional</sup> <a name="additionalLoggers" id="cdk-nag.NagPackProps.property.additionalLoggers"></a>

```typescript
public readonly additionalLoggers: INagLogger[];
```

- *Type:* <a href="#cdk-nag.INagLogger">INagLogger</a>[]

Additional NagLoggers for logging rule validation outputs.

---

##### `logIgnores`<sup>Optional</sup> <a name="logIgnores" id="cdk-nag.NagPackProps.property.logIgnores"></a>

```typescript
public readonly logIgnores: boolean;
```

- *Type:* boolean

Whether or not to log suppressed rule violations as informational messages (default: false).

---

##### `reportFormats`<sup>Optional</sup> <a name="reportFormats" id="cdk-nag.NagPackProps.property.reportFormats"></a>

```typescript
public readonly reportFormats: NagReportFormat[];
```

- *Type:* <a href="#cdk-nag.NagReportFormat">NagReportFormat</a>[]

If reports are enabled, the output formats of compliance reports in the App's output directory (default: only CSV).

---

##### `reports`<sup>Optional</sup> <a name="reports" id="cdk-nag.NagPackProps.property.reports"></a>

```typescript
public readonly reports: boolean;
```

- *Type:* boolean

Whether or not to generate compliance reports for applied Stacks in the App's output directory (default: true).

---

##### `suppressionIgnoreCondition`<sup>Optional</sup> <a name="suppressionIgnoreCondition" id="cdk-nag.NagPackProps.property.suppressionIgnoreCondition"></a>

```typescript
public readonly suppressionIgnoreCondition: INagSuppressionIgnore;
```

- *Type:* <a href="#cdk-nag.INagSuppressionIgnore">INagSuppressionIgnore</a>

Conditionally prevent rules from being suppressed (default: no user provided condition).

---

##### `verbose`<sup>Optional</sup> <a name="verbose" id="cdk-nag.NagPackProps.property.verbose"></a>

```typescript
public readonly verbose: boolean;
```

- *Type:* boolean

Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false).

---

### NagPackSuppression <a name="NagPackSuppression" id="cdk-nag.NagPackSuppression"></a>

Interface for creating a rule suppression.

#### Initializer <a name="Initializer" id="cdk-nag.NagPackSuppression.Initializer"></a>

```typescript
import { NagPackSuppression } from 'cdk-nag'

const nagPackSuppression: NagPackSuppression = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NagPackSuppression.property.id">id</a></code> | <code>string</code> | The id of the rule to ignore. |
| <code><a href="#cdk-nag.NagPackSuppression.property.reason">reason</a></code> | <code>string</code> | The reason to ignore the rule (minimum 10 characters). |
| <code><a href="#cdk-nag.NagPackSuppression.property.appliesTo">appliesTo</a></code> | <code>string \| <a href="#cdk-nag.RegexAppliesTo">RegexAppliesTo</a>[]</code> | Rule specific granular suppressions. |

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-nag.NagPackSuppression.property.id"></a>

```typescript
public readonly id: string;
```

- *Type:* string

The id of the rule to ignore.

---

##### `reason`<sup>Required</sup> <a name="reason" id="cdk-nag.NagPackSuppression.property.reason"></a>

```typescript
public readonly reason: string;
```

- *Type:* string

The reason to ignore the rule (minimum 10 characters).

---

##### `appliesTo`<sup>Optional</sup> <a name="appliesTo" id="cdk-nag.NagPackSuppression.property.appliesTo"></a>

```typescript
public readonly appliesTo: (string | RegexAppliesTo)[];
```

- *Type:* string | <a href="#cdk-nag.RegexAppliesTo">RegexAppliesTo</a>[]

Rule specific granular suppressions.

---

### NagReportLine <a name="NagReportLine" id="cdk-nag.NagReportLine"></a>

#### Initializer <a name="Initializer" id="cdk-nag.NagReportLine.Initializer"></a>

```typescript
import { NagReportLine } from 'cdk-nag'

const nagReportLine: NagReportLine = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NagReportLine.property.compliance">compliance</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.NagReportLine.property.exceptionReason">exceptionReason</a></code> | <code>string</code> | *No description.* |
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

##### `exceptionReason`<sup>Required</sup> <a name="exceptionReason" id="cdk-nag.NagReportLine.property.exceptionReason"></a>

```typescript
public readonly exceptionReason: string;
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

### NagReportLoggerProps <a name="NagReportLoggerProps" id="cdk-nag.NagReportLoggerProps"></a>

Props for the NagReportLogger.

#### Initializer <a name="Initializer" id="cdk-nag.NagReportLoggerProps.Initializer"></a>

```typescript
import { NagReportLoggerProps } from 'cdk-nag'

const nagReportLoggerProps: NagReportLoggerProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NagReportLoggerProps.property.formats">formats</a></code> | <code><a href="#cdk-nag.NagReportFormat">NagReportFormat</a>[]</code> | *No description.* |

---

##### `formats`<sup>Required</sup> <a name="formats" id="cdk-nag.NagReportLoggerProps.property.formats"></a>

```typescript
public readonly formats: NagReportFormat[];
```

- *Type:* <a href="#cdk-nag.NagReportFormat">NagReportFormat</a>[]

---

### NagReportSchema <a name="NagReportSchema" id="cdk-nag.NagReportSchema"></a>

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

### RegexAppliesTo <a name="RegexAppliesTo" id="cdk-nag.RegexAppliesTo"></a>

A regular expression to apply to matching findings.

#### Initializer <a name="Initializer" id="cdk-nag.RegexAppliesTo.Initializer"></a>

```typescript
import { RegexAppliesTo } from 'cdk-nag'

const regexAppliesTo: RegexAppliesTo = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.RegexAppliesTo.property.regex">regex</a></code> | <code>string</code> | An ECMA-262 regex string. |

---

##### `regex`<sup>Required</sup> <a name="regex" id="cdk-nag.RegexAppliesTo.property.regex"></a>

```typescript
public readonly regex: string;
```

- *Type:* string

An ECMA-262 regex string.

---

### SuppressionIgnoreInput <a name="SuppressionIgnoreInput" id="cdk-nag.SuppressionIgnoreInput"></a>

Information about the NagRule and the relevant NagSuppression for the INagSuppressionIgnore.

#### Initializer <a name="Initializer" id="cdk-nag.SuppressionIgnoreInput.Initializer"></a>

```typescript
import { SuppressionIgnoreInput } from 'cdk-nag'

const suppressionIgnoreInput: SuppressionIgnoreInput = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.SuppressionIgnoreInput.property.findingId">findingId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.SuppressionIgnoreInput.property.reason">reason</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.SuppressionIgnoreInput.property.resource">resource</a></code> | <code>aws-cdk-lib.CfnResource</code> | *No description.* |
| <code><a href="#cdk-nag.SuppressionIgnoreInput.property.ruleId">ruleId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nag.SuppressionIgnoreInput.property.ruleLevel">ruleLevel</a></code> | <code><a href="#cdk-nag.NagMessageLevel">NagMessageLevel</a></code> | *No description.* |

---

##### `findingId`<sup>Required</sup> <a name="findingId" id="cdk-nag.SuppressionIgnoreInput.property.findingId"></a>

```typescript
public readonly findingId: string;
```

- *Type:* string

---

##### `reason`<sup>Required</sup> <a name="reason" id="cdk-nag.SuppressionIgnoreInput.property.reason"></a>

```typescript
public readonly reason: string;
```

- *Type:* string

---

##### `resource`<sup>Required</sup> <a name="resource" id="cdk-nag.SuppressionIgnoreInput.property.resource"></a>

```typescript
public readonly resource: CfnResource;
```

- *Type:* aws-cdk-lib.CfnResource

---

##### `ruleId`<sup>Required</sup> <a name="ruleId" id="cdk-nag.SuppressionIgnoreInput.property.ruleId"></a>

```typescript
public readonly ruleId: string;
```

- *Type:* string

---

##### `ruleLevel`<sup>Required</sup> <a name="ruleLevel" id="cdk-nag.SuppressionIgnoreInput.property.ruleLevel"></a>

```typescript
public readonly ruleLevel: NagMessageLevel;
```

- *Type:* <a href="#cdk-nag.NagMessageLevel">NagMessageLevel</a>

---

## Classes <a name="Classes" id="Classes"></a>

### AnnotationLogger <a name="AnnotationLogger" id="cdk-nag.AnnotationLogger"></a>

- *Implements:* <a href="#cdk-nag.INagLogger">INagLogger</a>

A NagLogger that outputs to the CDK Annotations system.

#### Initializers <a name="Initializers" id="cdk-nag.AnnotationLogger.Initializer"></a>

```typescript
import { AnnotationLogger } from 'cdk-nag'

new AnnotationLogger(props?: AnnotationLoggerProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.AnnotationLogger.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nag.AnnotationLoggerProps">AnnotationLoggerProps</a></code> | *No description.* |

---

##### `props`<sup>Optional</sup> <a name="props" id="cdk-nag.AnnotationLogger.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nag.AnnotationLoggerProps">AnnotationLoggerProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.AnnotationLogger.onCompliance">onCompliance</a></code> | Called when a CfnResource passes the compliance check for a given rule. |
| <code><a href="#cdk-nag.AnnotationLogger.onError">onError</a></code> | Called when a rule throws an error during while validating a CfnResource for compliance. |
| <code><a href="#cdk-nag.AnnotationLogger.onNonCompliance">onNonCompliance</a></code> | Called when a CfnResource does not pass the compliance check for a given rule and the the rule violation is not suppressed by the user. |
| <code><a href="#cdk-nag.AnnotationLogger.onNotApplicable">onNotApplicable</a></code> | Called when a rule does not apply to the given CfnResource. |
| <code><a href="#cdk-nag.AnnotationLogger.onSuppressed">onSuppressed</a></code> | Called when a CfnResource does not pass the compliance check for a given rule and the rule violation is suppressed by the user. |
| <code><a href="#cdk-nag.AnnotationLogger.onSuppressedError">onSuppressedError</a></code> | Called when a rule throws an error during while validating a CfnResource for compliance and the error is suppressed. |

---

##### `onCompliance` <a name="onCompliance" id="cdk-nag.AnnotationLogger.onCompliance"></a>

```typescript
public onCompliance(_data: NagLoggerComplianceData): void
```

Called when a CfnResource passes the compliance check for a given rule.

###### `_data`<sup>Required</sup> <a name="_data" id="cdk-nag.AnnotationLogger.onCompliance.parameter._data"></a>

- *Type:* <a href="#cdk-nag.NagLoggerComplianceData">NagLoggerComplianceData</a>

---

##### `onError` <a name="onError" id="cdk-nag.AnnotationLogger.onError"></a>

```typescript
public onError(data: NagLoggerErrorData): void
```

Called when a rule throws an error during while validating a CfnResource for compliance.

###### `data`<sup>Required</sup> <a name="data" id="cdk-nag.AnnotationLogger.onError.parameter.data"></a>

- *Type:* <a href="#cdk-nag.NagLoggerErrorData">NagLoggerErrorData</a>

---

##### `onNonCompliance` <a name="onNonCompliance" id="cdk-nag.AnnotationLogger.onNonCompliance"></a>

```typescript
public onNonCompliance(data: NagLoggerNonComplianceData): void
```

Called when a CfnResource does not pass the compliance check for a given rule and the the rule violation is not suppressed by the user.

###### `data`<sup>Required</sup> <a name="data" id="cdk-nag.AnnotationLogger.onNonCompliance.parameter.data"></a>

- *Type:* <a href="#cdk-nag.NagLoggerNonComplianceData">NagLoggerNonComplianceData</a>

---

##### `onNotApplicable` <a name="onNotApplicable" id="cdk-nag.AnnotationLogger.onNotApplicable"></a>

```typescript
public onNotApplicable(_data: NagLoggerNotApplicableData): void
```

Called when a rule does not apply to the given CfnResource.

###### `_data`<sup>Required</sup> <a name="_data" id="cdk-nag.AnnotationLogger.onNotApplicable.parameter._data"></a>

- *Type:* <a href="#cdk-nag.NagLoggerNotApplicableData">NagLoggerNotApplicableData</a>

---

##### `onSuppressed` <a name="onSuppressed" id="cdk-nag.AnnotationLogger.onSuppressed"></a>

```typescript
public onSuppressed(data: NagLoggerSuppressedData): void
```

Called when a CfnResource does not pass the compliance check for a given rule and the rule violation is suppressed by the user.

###### `data`<sup>Required</sup> <a name="data" id="cdk-nag.AnnotationLogger.onSuppressed.parameter.data"></a>

- *Type:* <a href="#cdk-nag.NagLoggerSuppressedData">NagLoggerSuppressedData</a>

---

##### `onSuppressedError` <a name="onSuppressedError" id="cdk-nag.AnnotationLogger.onSuppressedError"></a>

```typescript
public onSuppressedError(data: NagLoggerSuppressedErrorData): void
```

Called when a rule throws an error during while validating a CfnResource for compliance and the error is suppressed.

###### `data`<sup>Required</sup> <a name="data" id="cdk-nag.AnnotationLogger.onSuppressedError.parameter.data"></a>

- *Type:* <a href="#cdk-nag.NagLoggerSuppressedErrorData">NagLoggerSuppressedErrorData</a>

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.AnnotationLogger.property.logIgnores">logIgnores</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#cdk-nag.AnnotationLogger.property.verbose">verbose</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#cdk-nag.AnnotationLogger.property.suppressionId">suppressionId</a></code> | <code>string</code> | *No description.* |

---

##### `logIgnores`<sup>Required</sup> <a name="logIgnores" id="cdk-nag.AnnotationLogger.property.logIgnores"></a>

```typescript
public readonly logIgnores: boolean;
```

- *Type:* boolean

---

##### `verbose`<sup>Required</sup> <a name="verbose" id="cdk-nag.AnnotationLogger.property.verbose"></a>

```typescript
public readonly verbose: boolean;
```

- *Type:* boolean

---

##### `suppressionId`<sup>Required</sup> <a name="suppressionId" id="cdk-nag.AnnotationLogger.property.suppressionId"></a>

```typescript
public readonly suppressionId: string;
```

- *Type:* string

---


### AwsSolutionsChecks <a name="AwsSolutionsChecks" id="cdk-nag.AwsSolutionsChecks"></a>

Check Best practices based on AWS Solutions Security Matrix.

#### Initializers <a name="Initializers" id="cdk-nag.AwsSolutionsChecks.Initializer"></a>

```typescript
import { AwsSolutionsChecks } from 'cdk-nag'

new AwsSolutionsChecks(props?: NagPackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.AwsSolutionsChecks.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nag.NagPackProps">NagPackProps</a></code> | *No description.* |

---

##### `props`<sup>Optional</sup> <a name="props" id="cdk-nag.AwsSolutionsChecks.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nag.NagPackProps">NagPackProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.AwsSolutionsChecks.visit">visit</a></code> | All aspects can visit an IConstruct. |

---

##### `visit` <a name="visit" id="cdk-nag.AwsSolutionsChecks.visit"></a>

```typescript
public visit(node: IConstruct): void
```

All aspects can visit an IConstruct.

###### `node`<sup>Required</sup> <a name="node" id="cdk-nag.AwsSolutionsChecks.visit.parameter.node"></a>

- *Type:* constructs.IConstruct

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.AwsSolutionsChecks.property.readPackName">readPackName</a></code> | <code>string</code> | *No description.* |

---

##### `readPackName`<sup>Required</sup> <a name="readPackName" id="cdk-nag.AwsSolutionsChecks.property.readPackName"></a>

```typescript
public readonly readPackName: string;
```

- *Type:* string

---


### HIPAASecurityChecks <a name="HIPAASecurityChecks" id="cdk-nag.HIPAASecurityChecks"></a>

Check for HIPAA Security compliance.

Based on the HIPAA Security AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-hipaa_security.html

#### Initializers <a name="Initializers" id="cdk-nag.HIPAASecurityChecks.Initializer"></a>

```typescript
import { HIPAASecurityChecks } from 'cdk-nag'

new HIPAASecurityChecks(props?: NagPackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.HIPAASecurityChecks.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nag.NagPackProps">NagPackProps</a></code> | *No description.* |

---

##### `props`<sup>Optional</sup> <a name="props" id="cdk-nag.HIPAASecurityChecks.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nag.NagPackProps">NagPackProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.HIPAASecurityChecks.visit">visit</a></code> | All aspects can visit an IConstruct. |

---

##### `visit` <a name="visit" id="cdk-nag.HIPAASecurityChecks.visit"></a>

```typescript
public visit(node: IConstruct): void
```

All aspects can visit an IConstruct.

###### `node`<sup>Required</sup> <a name="node" id="cdk-nag.HIPAASecurityChecks.visit.parameter.node"></a>

- *Type:* constructs.IConstruct

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.HIPAASecurityChecks.property.readPackName">readPackName</a></code> | <code>string</code> | *No description.* |

---

##### `readPackName`<sup>Required</sup> <a name="readPackName" id="cdk-nag.HIPAASecurityChecks.property.readPackName"></a>

```typescript
public readonly readPackName: string;
```

- *Type:* string

---


### NagPack <a name="NagPack" id="cdk-nag.NagPack"></a>

- *Implements:* aws-cdk-lib.IAspect

Base class for all rule packs.

#### Initializers <a name="Initializers" id="cdk-nag.NagPack.Initializer"></a>

```typescript
import { NagPack } from 'cdk-nag'

new NagPack(props?: NagPackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NagPack.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nag.NagPackProps">NagPackProps</a></code> | *No description.* |

---

##### `props`<sup>Optional</sup> <a name="props" id="cdk-nag.NagPack.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nag.NagPackProps">NagPackProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.NagPack.visit">visit</a></code> | All aspects can visit an IConstruct. |

---

##### `visit` <a name="visit" id="cdk-nag.NagPack.visit"></a>

```typescript
public visit(node: IConstruct): void
```

All aspects can visit an IConstruct.

###### `node`<sup>Required</sup> <a name="node" id="cdk-nag.NagPack.visit.parameter.node"></a>

- *Type:* constructs.IConstruct

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NagPack.property.readPackName">readPackName</a></code> | <code>string</code> | *No description.* |

---

##### `readPackName`<sup>Required</sup> <a name="readPackName" id="cdk-nag.NagPack.property.readPackName"></a>

```typescript
public readonly readPackName: string;
```

- *Type:* string

---


### NagReportLogger <a name="NagReportLogger" id="cdk-nag.NagReportLogger"></a>

- *Implements:* <a href="#cdk-nag.INagLogger">INagLogger</a>

A NagLogger that creates compliance reports.

#### Initializers <a name="Initializers" id="cdk-nag.NagReportLogger.Initializer"></a>

```typescript
import { NagReportLogger } from 'cdk-nag'

new NagReportLogger(props: NagReportLoggerProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NagReportLogger.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nag.NagReportLoggerProps">NagReportLoggerProps</a></code> | *No description.* |

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-nag.NagReportLogger.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nag.NagReportLoggerProps">NagReportLoggerProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.NagReportLogger.getFormatStacks">getFormatStacks</a></code> | *No description.* |
| <code><a href="#cdk-nag.NagReportLogger.onCompliance">onCompliance</a></code> | Called when a CfnResource passes the compliance check for a given rule. |
| <code><a href="#cdk-nag.NagReportLogger.onError">onError</a></code> | Called when a rule throws an error during while validating a CfnResource for compliance. |
| <code><a href="#cdk-nag.NagReportLogger.onNonCompliance">onNonCompliance</a></code> | Called when a CfnResource does not pass the compliance check for a given rule and the the rule violation is not suppressed by the user. |
| <code><a href="#cdk-nag.NagReportLogger.onNotApplicable">onNotApplicable</a></code> | Called when a rule does not apply to the given CfnResource. |
| <code><a href="#cdk-nag.NagReportLogger.onSuppressed">onSuppressed</a></code> | Called when a CfnResource does not pass the compliance check for a given rule and the rule violation is suppressed by the user. |
| <code><a href="#cdk-nag.NagReportLogger.onSuppressedError">onSuppressedError</a></code> | Called when a rule throws an error during while validating a CfnResource for compliance and the error is suppressed. |

---

##### `getFormatStacks` <a name="getFormatStacks" id="cdk-nag.NagReportLogger.getFormatStacks"></a>

```typescript
public getFormatStacks(format: NagReportFormat): string[]
```

###### `format`<sup>Required</sup> <a name="format" id="cdk-nag.NagReportLogger.getFormatStacks.parameter.format"></a>

- *Type:* <a href="#cdk-nag.NagReportFormat">NagReportFormat</a>

---

##### `onCompliance` <a name="onCompliance" id="cdk-nag.NagReportLogger.onCompliance"></a>

```typescript
public onCompliance(data: NagLoggerComplianceData): void
```

Called when a CfnResource passes the compliance check for a given rule.

###### `data`<sup>Required</sup> <a name="data" id="cdk-nag.NagReportLogger.onCompliance.parameter.data"></a>

- *Type:* <a href="#cdk-nag.NagLoggerComplianceData">NagLoggerComplianceData</a>

---

##### `onError` <a name="onError" id="cdk-nag.NagReportLogger.onError"></a>

```typescript
public onError(data: NagLoggerErrorData): void
```

Called when a rule throws an error during while validating a CfnResource for compliance.

###### `data`<sup>Required</sup> <a name="data" id="cdk-nag.NagReportLogger.onError.parameter.data"></a>

- *Type:* <a href="#cdk-nag.NagLoggerErrorData">NagLoggerErrorData</a>

---

##### `onNonCompliance` <a name="onNonCompliance" id="cdk-nag.NagReportLogger.onNonCompliance"></a>

```typescript
public onNonCompliance(data: NagLoggerNonComplianceData): void
```

Called when a CfnResource does not pass the compliance check for a given rule and the the rule violation is not suppressed by the user.

###### `data`<sup>Required</sup> <a name="data" id="cdk-nag.NagReportLogger.onNonCompliance.parameter.data"></a>

- *Type:* <a href="#cdk-nag.NagLoggerNonComplianceData">NagLoggerNonComplianceData</a>

---

##### `onNotApplicable` <a name="onNotApplicable" id="cdk-nag.NagReportLogger.onNotApplicable"></a>

```typescript
public onNotApplicable(data: NagLoggerNotApplicableData): void
```

Called when a rule does not apply to the given CfnResource.

###### `data`<sup>Required</sup> <a name="data" id="cdk-nag.NagReportLogger.onNotApplicable.parameter.data"></a>

- *Type:* <a href="#cdk-nag.NagLoggerNotApplicableData">NagLoggerNotApplicableData</a>

---

##### `onSuppressed` <a name="onSuppressed" id="cdk-nag.NagReportLogger.onSuppressed"></a>

```typescript
public onSuppressed(data: NagLoggerSuppressedData): void
```

Called when a CfnResource does not pass the compliance check for a given rule and the rule violation is suppressed by the user.

###### `data`<sup>Required</sup> <a name="data" id="cdk-nag.NagReportLogger.onSuppressed.parameter.data"></a>

- *Type:* <a href="#cdk-nag.NagLoggerSuppressedData">NagLoggerSuppressedData</a>

---

##### `onSuppressedError` <a name="onSuppressedError" id="cdk-nag.NagReportLogger.onSuppressedError"></a>

```typescript
public onSuppressedError(data: NagLoggerSuppressedErrorData): void
```

Called when a rule throws an error during while validating a CfnResource for compliance and the error is suppressed.

###### `data`<sup>Required</sup> <a name="data" id="cdk-nag.NagReportLogger.onSuppressedError.parameter.data"></a>

- *Type:* <a href="#cdk-nag.NagLoggerSuppressedErrorData">NagLoggerSuppressedErrorData</a>

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NagReportLogger.property.formats">formats</a></code> | <code><a href="#cdk-nag.NagReportFormat">NagReportFormat</a>[]</code> | *No description.* |

---

##### `formats`<sup>Required</sup> <a name="formats" id="cdk-nag.NagReportLogger.property.formats"></a>

```typescript
public readonly formats: NagReportFormat[];
```

- *Type:* <a href="#cdk-nag.NagReportFormat">NagReportFormat</a>[]

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



### NagSuppressions <a name="NagSuppressions" id="cdk-nag.NagSuppressions"></a>

Helper class with methods to add cdk-nag suppressions to cdk resources.

#### Initializers <a name="Initializers" id="cdk-nag.NagSuppressions.Initializer"></a>

```typescript
import { NagSuppressions } from 'cdk-nag'

new NagSuppressions()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.NagSuppressions.addResourceSuppressions">addResourceSuppressions</a></code> | Add cdk-nag suppressions to a CfnResource and optionally its children. |
| <code><a href="#cdk-nag.NagSuppressions.addResourceSuppressionsByPath">addResourceSuppressionsByPath</a></code> | Add cdk-nag suppressions to a CfnResource and optionally its children via its path. |
| <code><a href="#cdk-nag.NagSuppressions.addStackSuppressions">addStackSuppressions</a></code> | Apply cdk-nag suppressions to a Stack and optionally nested stacks. |

---

##### `addResourceSuppressions` <a name="addResourceSuppressions" id="cdk-nag.NagSuppressions.addResourceSuppressions"></a>

```typescript
import { NagSuppressions } from 'cdk-nag'

NagSuppressions.addResourceSuppressions(construct: IConstruct | IConstruct[], suppressions: NagPackSuppression[], applyToChildren?: boolean)
```

Add cdk-nag suppressions to a CfnResource and optionally its children.

###### `construct`<sup>Required</sup> <a name="construct" id="cdk-nag.NagSuppressions.addResourceSuppressions.parameter.construct"></a>

- *Type:* constructs.IConstruct | constructs.IConstruct[]

The IConstruct(s) to apply the suppression to.

---

###### `suppressions`<sup>Required</sup> <a name="suppressions" id="cdk-nag.NagSuppressions.addResourceSuppressions.parameter.suppressions"></a>

- *Type:* <a href="#cdk-nag.NagPackSuppression">NagPackSuppression</a>[]

A list of suppressions to apply to the resource.

---

###### `applyToChildren`<sup>Optional</sup> <a name="applyToChildren" id="cdk-nag.NagSuppressions.addResourceSuppressions.parameter.applyToChildren"></a>

- *Type:* boolean

Apply the suppressions to children CfnResources  (default:false).

---

##### `addResourceSuppressionsByPath` <a name="addResourceSuppressionsByPath" id="cdk-nag.NagSuppressions.addResourceSuppressionsByPath"></a>

```typescript
import { NagSuppressions } from 'cdk-nag'

NagSuppressions.addResourceSuppressionsByPath(stack: Stack, path: string | string[], suppressions: NagPackSuppression[], applyToChildren?: boolean)
```

Add cdk-nag suppressions to a CfnResource and optionally its children via its path.

###### `stack`<sup>Required</sup> <a name="stack" id="cdk-nag.NagSuppressions.addResourceSuppressionsByPath.parameter.stack"></a>

- *Type:* aws-cdk-lib.Stack

The Stack the construct belongs to.

---

###### `path`<sup>Required</sup> <a name="path" id="cdk-nag.NagSuppressions.addResourceSuppressionsByPath.parameter.path"></a>

- *Type:* string | string[]

The path(s) to the construct in the provided stack.

---

###### `suppressions`<sup>Required</sup> <a name="suppressions" id="cdk-nag.NagSuppressions.addResourceSuppressionsByPath.parameter.suppressions"></a>

- *Type:* <a href="#cdk-nag.NagPackSuppression">NagPackSuppression</a>[]

A list of suppressions to apply to the resource.

---

###### `applyToChildren`<sup>Optional</sup> <a name="applyToChildren" id="cdk-nag.NagSuppressions.addResourceSuppressionsByPath.parameter.applyToChildren"></a>

- *Type:* boolean

Apply the suppressions to children CfnResources  (default:false).

---

##### `addStackSuppressions` <a name="addStackSuppressions" id="cdk-nag.NagSuppressions.addStackSuppressions"></a>

```typescript
import { NagSuppressions } from 'cdk-nag'

NagSuppressions.addStackSuppressions(stack: Stack, suppressions: NagPackSuppression[], applyToNestedStacks?: boolean)
```

Apply cdk-nag suppressions to a Stack and optionally nested stacks.

###### `stack`<sup>Required</sup> <a name="stack" id="cdk-nag.NagSuppressions.addStackSuppressions.parameter.stack"></a>

- *Type:* aws-cdk-lib.Stack

The Stack to apply the suppression to.

---

###### `suppressions`<sup>Required</sup> <a name="suppressions" id="cdk-nag.NagSuppressions.addStackSuppressions.parameter.suppressions"></a>

- *Type:* <a href="#cdk-nag.NagPackSuppression">NagPackSuppression</a>[]

A list of suppressions to apply to the stack.

---

###### `applyToNestedStacks`<sup>Optional</sup> <a name="applyToNestedStacks" id="cdk-nag.NagSuppressions.addStackSuppressions.parameter.applyToNestedStacks"></a>

- *Type:* boolean

Apply the suppressions to children stacks (default:false).

---



### NIST80053R4Checks <a name="NIST80053R4Checks" id="cdk-nag.NIST80053R4Checks"></a>

Check for NIST 800-53 rev 4 compliance.

Based on the NIST 800-53 rev 4 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-nist-800-53_rev_4.html

#### Initializers <a name="Initializers" id="cdk-nag.NIST80053R4Checks.Initializer"></a>

```typescript
import { NIST80053R4Checks } from 'cdk-nag'

new NIST80053R4Checks(props?: NagPackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NIST80053R4Checks.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nag.NagPackProps">NagPackProps</a></code> | *No description.* |

---

##### `props`<sup>Optional</sup> <a name="props" id="cdk-nag.NIST80053R4Checks.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nag.NagPackProps">NagPackProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.NIST80053R4Checks.visit">visit</a></code> | All aspects can visit an IConstruct. |

---

##### `visit` <a name="visit" id="cdk-nag.NIST80053R4Checks.visit"></a>

```typescript
public visit(node: IConstruct): void
```

All aspects can visit an IConstruct.

###### `node`<sup>Required</sup> <a name="node" id="cdk-nag.NIST80053R4Checks.visit.parameter.node"></a>

- *Type:* constructs.IConstruct

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NIST80053R4Checks.property.readPackName">readPackName</a></code> | <code>string</code> | *No description.* |

---

##### `readPackName`<sup>Required</sup> <a name="readPackName" id="cdk-nag.NIST80053R4Checks.property.readPackName"></a>

```typescript
public readonly readPackName: string;
```

- *Type:* string

---


### NIST80053R5Checks <a name="NIST80053R5Checks" id="cdk-nag.NIST80053R5Checks"></a>

Check for NIST 800-53 rev 5 compliance.

Based on the NIST 800-53 rev 5 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-nist-800-53_rev_5.html

#### Initializers <a name="Initializers" id="cdk-nag.NIST80053R5Checks.Initializer"></a>

```typescript
import { NIST80053R5Checks } from 'cdk-nag'

new NIST80053R5Checks(props?: NagPackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NIST80053R5Checks.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nag.NagPackProps">NagPackProps</a></code> | *No description.* |

---

##### `props`<sup>Optional</sup> <a name="props" id="cdk-nag.NIST80053R5Checks.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nag.NagPackProps">NagPackProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.NIST80053R5Checks.visit">visit</a></code> | All aspects can visit an IConstruct. |

---

##### `visit` <a name="visit" id="cdk-nag.NIST80053R5Checks.visit"></a>

```typescript
public visit(node: IConstruct): void
```

All aspects can visit an IConstruct.

###### `node`<sup>Required</sup> <a name="node" id="cdk-nag.NIST80053R5Checks.visit.parameter.node"></a>

- *Type:* constructs.IConstruct

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.NIST80053R5Checks.property.readPackName">readPackName</a></code> | <code>string</code> | *No description.* |

---

##### `readPackName`<sup>Required</sup> <a name="readPackName" id="cdk-nag.NIST80053R5Checks.property.readPackName"></a>

```typescript
public readonly readPackName: string;
```

- *Type:* string

---


### PCIDSS321Checks <a name="PCIDSS321Checks" id="cdk-nag.PCIDSS321Checks"></a>

Check for PCI DSS 3.2.1 compliance. Based on the PCI DSS 3.2.1 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-pci-dss.html.

#### Initializers <a name="Initializers" id="cdk-nag.PCIDSS321Checks.Initializer"></a>

```typescript
import { PCIDSS321Checks } from 'cdk-nag'

new PCIDSS321Checks(props?: NagPackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.PCIDSS321Checks.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nag.NagPackProps">NagPackProps</a></code> | *No description.* |

---

##### `props`<sup>Optional</sup> <a name="props" id="cdk-nag.PCIDSS321Checks.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nag.NagPackProps">NagPackProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.PCIDSS321Checks.visit">visit</a></code> | All aspects can visit an IConstruct. |

---

##### `visit` <a name="visit" id="cdk-nag.PCIDSS321Checks.visit"></a>

```typescript
public visit(node: IConstruct): void
```

All aspects can visit an IConstruct.

###### `node`<sup>Required</sup> <a name="node" id="cdk-nag.PCIDSS321Checks.visit.parameter.node"></a>

- *Type:* constructs.IConstruct

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.PCIDSS321Checks.property.readPackName">readPackName</a></code> | <code>string</code> | *No description.* |

---

##### `readPackName`<sup>Required</sup> <a name="readPackName" id="cdk-nag.PCIDSS321Checks.property.readPackName"></a>

```typescript
public readonly readPackName: string;
```

- *Type:* string

---


### ServerlessChecks <a name="ServerlessChecks" id="cdk-nag.ServerlessChecks"></a>

Serverless Checks are a compilation of rules to validate infrastructure-as-code template against recommended practices.

#### Initializers <a name="Initializers" id="cdk-nag.ServerlessChecks.Initializer"></a>

```typescript
import { ServerlessChecks } from 'cdk-nag'

new ServerlessChecks(props?: NagPackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.ServerlessChecks.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nag.NagPackProps">NagPackProps</a></code> | *No description.* |

---

##### `props`<sup>Optional</sup> <a name="props" id="cdk-nag.ServerlessChecks.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nag.NagPackProps">NagPackProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.ServerlessChecks.visit">visit</a></code> | All aspects can visit an IConstruct. |

---

##### `visit` <a name="visit" id="cdk-nag.ServerlessChecks.visit"></a>

```typescript
public visit(node: IConstruct): void
```

All aspects can visit an IConstruct.

###### `node`<sup>Required</sup> <a name="node" id="cdk-nag.ServerlessChecks.visit.parameter.node"></a>

- *Type:* constructs.IConstruct

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.ServerlessChecks.property.readPackName">readPackName</a></code> | <code>string</code> | *No description.* |

---

##### `readPackName`<sup>Required</sup> <a name="readPackName" id="cdk-nag.ServerlessChecks.property.readPackName"></a>

```typescript
public readonly readPackName: string;
```

- *Type:* string

---


### SuppressionIgnoreAlways <a name="SuppressionIgnoreAlways" id="cdk-nag.SuppressionIgnoreAlways"></a>

- *Implements:* <a href="#cdk-nag.INagSuppressionIgnore">INagSuppressionIgnore</a>

Always ignore the suppression.

#### Initializers <a name="Initializers" id="cdk-nag.SuppressionIgnoreAlways.Initializer"></a>

```typescript
import { SuppressionIgnoreAlways } from 'cdk-nag'

new SuppressionIgnoreAlways(triggerMessage: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.SuppressionIgnoreAlways.Initializer.parameter.triggerMessage">triggerMessage</a></code> | <code>string</code> | *No description.* |

---

##### `triggerMessage`<sup>Required</sup> <a name="triggerMessage" id="cdk-nag.SuppressionIgnoreAlways.Initializer.parameter.triggerMessage"></a>

- *Type:* string

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.SuppressionIgnoreAlways.createMessage">createMessage</a></code> | *No description.* |

---

##### `createMessage` <a name="createMessage" id="cdk-nag.SuppressionIgnoreAlways.createMessage"></a>

```typescript
public createMessage(_input: SuppressionIgnoreInput): string
```

###### `_input`<sup>Required</sup> <a name="_input" id="cdk-nag.SuppressionIgnoreAlways.createMessage.parameter._input"></a>

- *Type:* <a href="#cdk-nag.SuppressionIgnoreInput">SuppressionIgnoreInput</a>

---




### SuppressionIgnoreAnd <a name="SuppressionIgnoreAnd" id="cdk-nag.SuppressionIgnoreAnd"></a>

- *Implements:* <a href="#cdk-nag.INagSuppressionIgnore">INagSuppressionIgnore</a>

Ignore the suppression if all of the given INagSuppressionIgnore return a non-empty message.

#### Initializers <a name="Initializers" id="cdk-nag.SuppressionIgnoreAnd.Initializer"></a>

```typescript
import { SuppressionIgnoreAnd } from 'cdk-nag'

new SuppressionIgnoreAnd(SuppressionIgnoreAnds: ...INagSuppressionIgnore[])
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.SuppressionIgnoreAnd.Initializer.parameter.SuppressionIgnoreAnds">SuppressionIgnoreAnds</a></code> | <code>...<a href="#cdk-nag.INagSuppressionIgnore">INagSuppressionIgnore</a>[]</code> | *No description.* |

---

##### `SuppressionIgnoreAnds`<sup>Required</sup> <a name="SuppressionIgnoreAnds" id="cdk-nag.SuppressionIgnoreAnd.Initializer.parameter.SuppressionIgnoreAnds"></a>

- *Type:* ...<a href="#cdk-nag.INagSuppressionIgnore">INagSuppressionIgnore</a>[]

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.SuppressionIgnoreAnd.createMessage">createMessage</a></code> | *No description.* |

---

##### `createMessage` <a name="createMessage" id="cdk-nag.SuppressionIgnoreAnd.createMessage"></a>

```typescript
public createMessage(input: SuppressionIgnoreInput): string
```

###### `input`<sup>Required</sup> <a name="input" id="cdk-nag.SuppressionIgnoreAnd.createMessage.parameter.input"></a>

- *Type:* <a href="#cdk-nag.SuppressionIgnoreInput">SuppressionIgnoreInput</a>

---




### SuppressionIgnoreErrors <a name="SuppressionIgnoreErrors" id="cdk-nag.SuppressionIgnoreErrors"></a>

- *Implements:* <a href="#cdk-nag.INagSuppressionIgnore">INagSuppressionIgnore</a>

Ignore Suppressions for Rules with a NagMessageLevel.ERROR.

#### Initializers <a name="Initializers" id="cdk-nag.SuppressionIgnoreErrors.Initializer"></a>

```typescript
import { SuppressionIgnoreErrors } from 'cdk-nag'

new SuppressionIgnoreErrors()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.SuppressionIgnoreErrors.createMessage">createMessage</a></code> | *No description.* |

---

##### `createMessage` <a name="createMessage" id="cdk-nag.SuppressionIgnoreErrors.createMessage"></a>

```typescript
public createMessage(input: SuppressionIgnoreInput): string
```

###### `input`<sup>Required</sup> <a name="input" id="cdk-nag.SuppressionIgnoreErrors.createMessage.parameter.input"></a>

- *Type:* <a href="#cdk-nag.SuppressionIgnoreInput">SuppressionIgnoreInput</a>

---




### SuppressionIgnoreNever <a name="SuppressionIgnoreNever" id="cdk-nag.SuppressionIgnoreNever"></a>

- *Implements:* <a href="#cdk-nag.INagSuppressionIgnore">INagSuppressionIgnore</a>

Don't ignore the suppression.

#### Initializers <a name="Initializers" id="cdk-nag.SuppressionIgnoreNever.Initializer"></a>

```typescript
import { SuppressionIgnoreNever } from 'cdk-nag'

new SuppressionIgnoreNever()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.SuppressionIgnoreNever.createMessage">createMessage</a></code> | *No description.* |

---

##### `createMessage` <a name="createMessage" id="cdk-nag.SuppressionIgnoreNever.createMessage"></a>

```typescript
public createMessage(_input: SuppressionIgnoreInput): string
```

###### `_input`<sup>Required</sup> <a name="_input" id="cdk-nag.SuppressionIgnoreNever.createMessage.parameter._input"></a>

- *Type:* <a href="#cdk-nag.SuppressionIgnoreInput">SuppressionIgnoreInput</a>

---




### SuppressionIgnoreOr <a name="SuppressionIgnoreOr" id="cdk-nag.SuppressionIgnoreOr"></a>

- *Implements:* <a href="#cdk-nag.INagSuppressionIgnore">INagSuppressionIgnore</a>

Ignore the suppression if any of the given INagSuppressionIgnore return a non-empty message.

#### Initializers <a name="Initializers" id="cdk-nag.SuppressionIgnoreOr.Initializer"></a>

```typescript
import { SuppressionIgnoreOr } from 'cdk-nag'

new SuppressionIgnoreOr(orSuppressionIgnores: ...INagSuppressionIgnore[])
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nag.SuppressionIgnoreOr.Initializer.parameter.orSuppressionIgnores">orSuppressionIgnores</a></code> | <code>...<a href="#cdk-nag.INagSuppressionIgnore">INagSuppressionIgnore</a>[]</code> | *No description.* |

---

##### `orSuppressionIgnores`<sup>Required</sup> <a name="orSuppressionIgnores" id="cdk-nag.SuppressionIgnoreOr.Initializer.parameter.orSuppressionIgnores"></a>

- *Type:* ...<a href="#cdk-nag.INagSuppressionIgnore">INagSuppressionIgnore</a>[]

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.SuppressionIgnoreOr.createMessage">createMessage</a></code> | *No description.* |

---

##### `createMessage` <a name="createMessage" id="cdk-nag.SuppressionIgnoreOr.createMessage"></a>

```typescript
public createMessage(input: SuppressionIgnoreInput): string
```

###### `input`<sup>Required</sup> <a name="input" id="cdk-nag.SuppressionIgnoreOr.createMessage.parameter.input"></a>

- *Type:* <a href="#cdk-nag.SuppressionIgnoreInput">SuppressionIgnoreInput</a>

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
| <code><a href="#cdk-nag.IApplyRule.property.ignoreSuppressionCondition">ignoreSuppressionCondition</a></code> | <code><a href="#cdk-nag.INagSuppressionIgnore">INagSuppressionIgnore</a></code> | A condition in which a suppression should be ignored. |
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

##### `ignoreSuppressionCondition`<sup>Optional</sup> <a name="ignoreSuppressionCondition" id="cdk-nag.IApplyRule.property.ignoreSuppressionCondition"></a>

```typescript
public readonly ignoreSuppressionCondition: INagSuppressionIgnore;
```

- *Type:* <a href="#cdk-nag.INagSuppressionIgnore">INagSuppressionIgnore</a>

A condition in which a suppression should be ignored.

---

##### `ruleSuffixOverride`<sup>Optional</sup> <a name="ruleSuffixOverride" id="cdk-nag.IApplyRule.property.ruleSuffixOverride"></a>

```typescript
public readonly ruleSuffixOverride: string;
```

- *Type:* string

Override for the suffix of the Rule ID for this rule.

---

### INagLogger <a name="INagLogger" id="cdk-nag.INagLogger"></a>

- *Implemented By:* <a href="#cdk-nag.AnnotationLogger">AnnotationLogger</a>, <a href="#cdk-nag.NagReportLogger">NagReportLogger</a>, <a href="#cdk-nag.INagLogger">INagLogger</a>

Interface for creating NagSuppression Ignores.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.INagLogger.onCompliance">onCompliance</a></code> | Called when a CfnResource passes the compliance check for a given rule. |
| <code><a href="#cdk-nag.INagLogger.onError">onError</a></code> | Called when a rule throws an error during while validating a CfnResource for compliance. |
| <code><a href="#cdk-nag.INagLogger.onNonCompliance">onNonCompliance</a></code> | Called when a CfnResource does not pass the compliance check for a given rule and the the rule violation is not suppressed by the user. |
| <code><a href="#cdk-nag.INagLogger.onNotApplicable">onNotApplicable</a></code> | Called when a rule does not apply to the given CfnResource. |
| <code><a href="#cdk-nag.INagLogger.onSuppressed">onSuppressed</a></code> | Called when a CfnResource does not pass the compliance check for a given rule and the rule violation is suppressed by the user. |
| <code><a href="#cdk-nag.INagLogger.onSuppressedError">onSuppressedError</a></code> | Called when a rule throws an error during while validating a CfnResource for compliance and the error is suppressed. |

---

##### `onCompliance` <a name="onCompliance" id="cdk-nag.INagLogger.onCompliance"></a>

```typescript
public onCompliance(data: NagLoggerComplianceData): void
```

Called when a CfnResource passes the compliance check for a given rule.

###### `data`<sup>Required</sup> <a name="data" id="cdk-nag.INagLogger.onCompliance.parameter.data"></a>

- *Type:* <a href="#cdk-nag.NagLoggerComplianceData">NagLoggerComplianceData</a>

---

##### `onError` <a name="onError" id="cdk-nag.INagLogger.onError"></a>

```typescript
public onError(data: NagLoggerErrorData): void
```

Called when a rule throws an error during while validating a CfnResource for compliance.

###### `data`<sup>Required</sup> <a name="data" id="cdk-nag.INagLogger.onError.parameter.data"></a>

- *Type:* <a href="#cdk-nag.NagLoggerErrorData">NagLoggerErrorData</a>

---

##### `onNonCompliance` <a name="onNonCompliance" id="cdk-nag.INagLogger.onNonCompliance"></a>

```typescript
public onNonCompliance(data: NagLoggerNonComplianceData): void
```

Called when a CfnResource does not pass the compliance check for a given rule and the the rule violation is not suppressed by the user.

###### `data`<sup>Required</sup> <a name="data" id="cdk-nag.INagLogger.onNonCompliance.parameter.data"></a>

- *Type:* <a href="#cdk-nag.NagLoggerNonComplianceData">NagLoggerNonComplianceData</a>

---

##### `onNotApplicable` <a name="onNotApplicable" id="cdk-nag.INagLogger.onNotApplicable"></a>

```typescript
public onNotApplicable(data: NagLoggerNotApplicableData): void
```

Called when a rule does not apply to the given CfnResource.

###### `data`<sup>Required</sup> <a name="data" id="cdk-nag.INagLogger.onNotApplicable.parameter.data"></a>

- *Type:* <a href="#cdk-nag.NagLoggerNotApplicableData">NagLoggerNotApplicableData</a>

---

##### `onSuppressed` <a name="onSuppressed" id="cdk-nag.INagLogger.onSuppressed"></a>

```typescript
public onSuppressed(data: NagLoggerSuppressedData): void
```

Called when a CfnResource does not pass the compliance check for a given rule and the rule violation is suppressed by the user.

###### `data`<sup>Required</sup> <a name="data" id="cdk-nag.INagLogger.onSuppressed.parameter.data"></a>

- *Type:* <a href="#cdk-nag.NagLoggerSuppressedData">NagLoggerSuppressedData</a>

---

##### `onSuppressedError` <a name="onSuppressedError" id="cdk-nag.INagLogger.onSuppressedError"></a>

```typescript
public onSuppressedError(data: NagLoggerSuppressedErrorData): void
```

Called when a rule throws an error during while validating a CfnResource for compliance and the error is suppressed.

###### `data`<sup>Required</sup> <a name="data" id="cdk-nag.INagLogger.onSuppressedError.parameter.data"></a>

- *Type:* <a href="#cdk-nag.NagLoggerSuppressedErrorData">NagLoggerSuppressedErrorData</a>

---


### INagSuppressionIgnore <a name="INagSuppressionIgnore" id="cdk-nag.INagSuppressionIgnore"></a>

- *Implemented By:* <a href="#cdk-nag.SuppressionIgnoreAlways">SuppressionIgnoreAlways</a>, <a href="#cdk-nag.SuppressionIgnoreAnd">SuppressionIgnoreAnd</a>, <a href="#cdk-nag.SuppressionIgnoreErrors">SuppressionIgnoreErrors</a>, <a href="#cdk-nag.SuppressionIgnoreNever">SuppressionIgnoreNever</a>, <a href="#cdk-nag.SuppressionIgnoreOr">SuppressionIgnoreOr</a>, <a href="#cdk-nag.INagSuppressionIgnore">INagSuppressionIgnore</a>

Interface for creating NagSuppression Ignores.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nag.INagSuppressionIgnore.createMessage">createMessage</a></code> | *No description.* |

---

##### `createMessage` <a name="createMessage" id="cdk-nag.INagSuppressionIgnore.createMessage"></a>

```typescript
public createMessage(input: SuppressionIgnoreInput): string
```

###### `input`<sup>Required</sup> <a name="input" id="cdk-nag.INagSuppressionIgnore.createMessage.parameter.input"></a>

- *Type:* <a href="#cdk-nag.SuppressionIgnoreInput">SuppressionIgnoreInput</a>

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
| <code><a href="#cdk-nag.NagRulePostValidationStates.SUPPRESSED">SUPPRESSED</a></code> | *No description.* |
| <code><a href="#cdk-nag.NagRulePostValidationStates.UNKNOWN">UNKNOWN</a></code> | *No description.* |

---

##### `SUPPRESSED` <a name="SUPPRESSED" id="cdk-nag.NagRulePostValidationStates.SUPPRESSED"></a>

---


##### `UNKNOWN` <a name="UNKNOWN" id="cdk-nag.NagRulePostValidationStates.UNKNOWN"></a>

---

