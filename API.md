# API Reference

**Classes**

Name|Description
----|-----------
[AwsSolutionsChecks](#cdk-nag-awssolutionschecks)|Check Best practices based on AWS Solutions Security Matrix.
[HIPAASecurityChecks](#cdk-nag-hipaasecuritychecks)|Check for HIPAA Security compliance.
[NIST80053R4Checks](#cdk-nag-nist80053r4checks)|Check for NIST 800-53 rev 4 compliance.
[NIST80053R5Checks](#cdk-nag-nist80053r5checks)|Check for NIST 800-53 rev 5 compliance.
[NagPack](#cdk-nag-nagpack)|Base class for all rule packs.
[NagRules](#cdk-nag-nagrules)|Helper class with methods for rule creation.
[NagSuppressions](#cdk-nag-nagsuppressions)|Helper class with methods to add cdk-nag suppressions to cdk resources.
[PCIDSS321Checks](#cdk-nag-pcidss321checks)|Check for PCI DSS 3.2.1 compliance. Based on the PCI DSS 3.2.1 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-pci-dss.html.


**Structs**

Name|Description
----|-----------
[NagPackProps](#cdk-nag-nagpackprops)|Interface for creating a Nag rule pack.
[NagPackSuppression](#cdk-nag-nagpacksuppression)|Interface for creating a rule suppression.
[RegexAppliesTo](#cdk-nag-regexappliesto)|A regular expression to apply to matching findings.


**Interfaces**

Name|Description
----|-----------
[IApplyRule](#cdk-nag-iapplyrule)|Interface for JSII interoperability for passing parameters and the Rule Callback to @applyRule method.


**Enums**

Name|Description
----|-----------
[NagMessageLevel](#cdk-nag-nagmessagelevel)|The level of the message that the rule applies.
[NagRuleCompliance](#cdk-nag-nagrulecompliance)|The compliance level of a resource in relation to a rule.



## class AwsSolutionsChecks  <a id="cdk-nag-awssolutionschecks"></a>

Check Best practices based on AWS Solutions Security Matrix.

__Implements__: [IAspect](#aws-cdk-lib-iaspect)
__Extends__: [NagPack](#cdk-nag-nagpack)

### Initializer




```ts
new AwsSolutionsChecks(props?: NagPackProps)
```

* **props** (<code>[NagPackProps](#cdk-nag-nagpackprops)</code>)  *No description*
  * **logIgnores** (<code>boolean</code>)  Whether or not to log triggered rules that have been suppressed as informational messages (default: false). __*Optional*__
  * **reports** (<code>boolean</code>)  Whether or not to generate CSV compliance reports for applied Stacks in the App's output directory (default: true). __*Optional*__
  * **verbose** (<code>boolean</code>)  Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false). __*Optional*__


### Methods


#### visit(node) <a id="cdk-nag-awssolutionschecks-visit"></a>

All aspects can visit an IConstruct.

```ts
visit(node: IConstruct): void
```

* **node** (<code>[IConstruct](#constructs-iconstruct)</code>)  *No description*






## class HIPAASecurityChecks  <a id="cdk-nag-hipaasecuritychecks"></a>

Check for HIPAA Security compliance.

Based on the HIPAA Security AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-hipaa_security.html

__Implements__: [IAspect](#aws-cdk-lib-iaspect)
__Extends__: [NagPack](#cdk-nag-nagpack)

### Initializer




```ts
new HIPAASecurityChecks(props?: NagPackProps)
```

* **props** (<code>[NagPackProps](#cdk-nag-nagpackprops)</code>)  *No description*
  * **logIgnores** (<code>boolean</code>)  Whether or not to log triggered rules that have been suppressed as informational messages (default: false). __*Optional*__
  * **reports** (<code>boolean</code>)  Whether or not to generate CSV compliance reports for applied Stacks in the App's output directory (default: true). __*Optional*__
  * **verbose** (<code>boolean</code>)  Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false). __*Optional*__


### Methods


#### visit(node) <a id="cdk-nag-hipaasecuritychecks-visit"></a>

All aspects can visit an IConstruct.

```ts
visit(node: IConstruct): void
```

* **node** (<code>[IConstruct](#constructs-iconstruct)</code>)  *No description*






## class NIST80053R4Checks  <a id="cdk-nag-nist80053r4checks"></a>

Check for NIST 800-53 rev 4 compliance.

Based on the NIST 800-53 rev 4 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-nist-800-53_rev_4.html

__Implements__: [IAspect](#aws-cdk-lib-iaspect)
__Extends__: [NagPack](#cdk-nag-nagpack)

### Initializer




```ts
new NIST80053R4Checks(props?: NagPackProps)
```

* **props** (<code>[NagPackProps](#cdk-nag-nagpackprops)</code>)  *No description*
  * **logIgnores** (<code>boolean</code>)  Whether or not to log triggered rules that have been suppressed as informational messages (default: false). __*Optional*__
  * **reports** (<code>boolean</code>)  Whether or not to generate CSV compliance reports for applied Stacks in the App's output directory (default: true). __*Optional*__
  * **verbose** (<code>boolean</code>)  Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false). __*Optional*__


### Methods


#### visit(node) <a id="cdk-nag-nist80053r4checks-visit"></a>

All aspects can visit an IConstruct.

```ts
visit(node: IConstruct): void
```

* **node** (<code>[IConstruct](#constructs-iconstruct)</code>)  *No description*






## class NIST80053R5Checks  <a id="cdk-nag-nist80053r5checks"></a>

Check for NIST 800-53 rev 5 compliance.

Based on the NIST 800-53 rev 5 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-nist-800-53_rev_5.html

__Implements__: [IAspect](#aws-cdk-lib-iaspect)
__Extends__: [NagPack](#cdk-nag-nagpack)

### Initializer




```ts
new NIST80053R5Checks(props?: NagPackProps)
```

* **props** (<code>[NagPackProps](#cdk-nag-nagpackprops)</code>)  *No description*
  * **logIgnores** (<code>boolean</code>)  Whether or not to log triggered rules that have been suppressed as informational messages (default: false). __*Optional*__
  * **reports** (<code>boolean</code>)  Whether or not to generate CSV compliance reports for applied Stacks in the App's output directory (default: true). __*Optional*__
  * **verbose** (<code>boolean</code>)  Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false). __*Optional*__


### Methods


#### visit(node) <a id="cdk-nag-nist80053r5checks-visit"></a>

All aspects can visit an IConstruct.

```ts
visit(node: IConstruct): void
```

* **node** (<code>[IConstruct](#constructs-iconstruct)</code>)  *No description*






## class NagPack  <a id="cdk-nag-nagpack"></a>

Base class for all rule packs.

__Implements__: [IAspect](#aws-cdk-lib-iaspect)
__Implemented by__: [AwsSolutionsChecks](#cdk-nag-awssolutionschecks), [HIPAASecurityChecks](#cdk-nag-hipaasecuritychecks), [NIST80053R4Checks](#cdk-nag-nist80053r4checks), [NIST80053R5Checks](#cdk-nag-nist80053r5checks), [PCIDSS321Checks](#cdk-nag-pcidss321checks)

### Initializer




```ts
new NagPack(props?: NagPackProps)
```

* **props** (<code>[NagPackProps](#cdk-nag-nagpackprops)</code>)  *No description*
  * **logIgnores** (<code>boolean</code>)  Whether or not to log triggered rules that have been suppressed as informational messages (default: false). __*Optional*__
  * **reports** (<code>boolean</code>)  Whether or not to generate CSV compliance reports for applied Stacks in the App's output directory (default: true). __*Optional*__
  * **verbose** (<code>boolean</code>)  Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false). __*Optional*__



### Properties


Name | Type | Description 
-----|------|-------------
**logIgnores** | <code>boolean</code> | <span></span>
**packName** | <code>string</code> | <span></span>
**readPackName** | <code>string</code> | <span></span>
**readReportStacks** | <code>Array<string></code> | <span></span>
**reportStacks** | <code>Array<string></code> | <span></span>
**reports** | <code>boolean</code> | <span></span>
**verbose** | <code>boolean</code> | <span></span>

### Methods


#### visit(node) <a id="cdk-nag-nagpack-visit"></a>

All aspects can visit an IConstruct.

```ts
visit(node: IConstruct): void
```

* **node** (<code>[IConstruct](#constructs-iconstruct)</code>)  *No description*




#### protected applyRule(params) <a id="cdk-nag-nagpack-applyrule"></a>

Create a rule to be used in the NagPack.

```ts
protected applyRule(params: IApplyRule): void
```

* **params** (<code>[IApplyRule](#cdk-nag-iapplyrule)</code>)  The.




#### protected createComplianceReportLine(params, ruleId, compliance, explanation?) <a id="cdk-nag-nagpack-createcompliancereportline"></a>

Helper function to create a line for the compliance report.

```ts
protected createComplianceReportLine(params: IApplyRule, ruleId: string, compliance: NagRuleCompliance &#124; string, explanation?: string): string
```

* **params** (<code>[IApplyRule](#cdk-nag-iapplyrule)</code>)  The.
* **ruleId** (<code>string</code>)  The id of the rule.
* **compliance** (<code>[NagRuleCompliance](#cdk-nag-nagrulecompliance) &#124; string</code>)  The compliance status of the rule.
* **explanation** (<code>string</code>)  The explanation for suppressed rules.

__Returns__:
* <code>string</code>

#### protected createMessage(ruleId, findingId, info, explanation) <a id="cdk-nag-nagpack-createmessage"></a>

The message to output to the console when a rule is triggered.

```ts
protected createMessage(ruleId: string, findingId: string, info: string, explanation: string): string
```

* **ruleId** (<code>string</code>)  The id of the rule.
* **findingId** (<code>string</code>)  The id of the finding.
* **info** (<code>string</code>)  Why the rule was triggered.
* **explanation** (<code>string</code>)  Why the rule exists.

__Returns__:
* <code>string</code>

#### protected ignoreRule(ignores, ruleId, findingId) <a id="cdk-nag-nagpack-ignorerule"></a>

Check whether a specific rule should be ignored.

```ts
protected ignoreRule(ignores: Array<NagPackSuppression>, ruleId: string, findingId: string): string
```

* **ignores** (<code>Array<[NagPackSuppression](#cdk-nag-nagpacksuppression)></code>)  The ignores listed in cdk-nag metadata.
* **ruleId** (<code>string</code>)  The id of the rule to ignore.
* **findingId** (<code>string</code>)  The id of the finding that is being checked.

__Returns__:
* <code>string</code>

#### protected initializeStackReport(params) <a id="cdk-nag-nagpack-initializestackreport"></a>

Initialize the report for the rule pack's compliance report for the resource's Stack if it doesn't exist.

```ts
protected initializeStackReport(params: IApplyRule): void
```

* **params** (<code>[IApplyRule](#cdk-nag-iapplyrule)</code>)  *No description*




#### protected writeToStackComplianceReport(params, ruleId, compliance, explanation?) <a id="cdk-nag-nagpack-writetostackcompliancereport"></a>

Write a line to the rule pack's compliance report for the resource's Stack.

```ts
protected writeToStackComplianceReport(params: IApplyRule, ruleId: string, compliance: NagRuleCompliance &#124; string, explanation?: string): void
```

* **params** (<code>[IApplyRule](#cdk-nag-iapplyrule)</code>)  The.
* **ruleId** (<code>string</code>)  The id of the rule.
* **compliance** (<code>[NagRuleCompliance](#cdk-nag-nagrulecompliance) &#124; string</code>)  The compliance status of the rule.
* **explanation** (<code>string</code>)  The explanation for suppressed rules.






## class NagRules  <a id="cdk-nag-nagrules"></a>

Helper class with methods for rule creation.


### Initializer




```ts
new NagRules()
```



### Methods


#### *static* resolveIfPrimitive(node, parameter) <a id="cdk-nag-nagrules-resolveifprimitive"></a>

Use in cases where a primitive value must be known to pass a rule.

https://developer.mozilla.org/en-US/docs/Glossary/Primitive

```ts
static resolveIfPrimitive(node: CfnResource, parameter: any): any
```

* **node** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  The CfnResource to check.
* **parameter** (<code>any</code>)  The value to attempt to resolve.

__Returns__:
* <code>any</code>

#### *static* resolveResourceFromInstrinsic(node, parameter) <a id="cdk-nag-nagrules-resolveresourcefrominstrinsic"></a>

Use in cases where a token resolves to an intrinsic function and the referenced resource must be known to pass a rule.

```ts
static resolveResourceFromInstrinsic(node: CfnResource, parameter: any): any
```

* **node** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  The CfnResource to check.
* **parameter** (<code>any</code>)  The value to attempt to resolve.

__Returns__:
* <code>any</code>



## class NagSuppressions  <a id="cdk-nag-nagsuppressions"></a>

Helper class with methods to add cdk-nag suppressions to cdk resources.


### Initializer




```ts
new NagSuppressions()
```



### Methods


#### *static* addResourceSuppressions(construct, suppressions, applyToChildren?) <a id="cdk-nag-nagsuppressions-addresourcesuppressions"></a>

Add cdk-nag suppressions to a CfnResource and optionally its children.

```ts
static addResourceSuppressions(construct: IConstruct &#124; Array<IConstruct>, suppressions: Array<NagPackSuppression>, applyToChildren?: boolean): void
```

* **construct** (<code>[IConstruct](#constructs-iconstruct) &#124; Array<[IConstruct](#constructs-iconstruct)></code>)  The IConstruct(s) to apply the suppression to.
* **suppressions** (<code>Array<[NagPackSuppression](#cdk-nag-nagpacksuppression)></code>)  A list of suppressions to apply to the resource.
* **applyToChildren** (<code>boolean</code>)  Apply the suppressions to children CfnResources  (default:false).




#### *static* addResourceSuppressionsByPath(stack, path, suppressions, applyToChildren?) <a id="cdk-nag-nagsuppressions-addresourcesuppressionsbypath"></a>

Add cdk-nag suppressions to a CfnResource and optionally its children via its path.

```ts
static addResourceSuppressionsByPath(stack: Stack, path: string &#124; Array<string>, suppressions: Array<NagPackSuppression>, applyToChildren?: boolean): void
```

* **stack** (<code>[Stack](#aws-cdk-lib-stack)</code>)  The Stack the construct belongs to.
* **path** (<code>string &#124; Array<string></code>)  The path(s) to the construct in the provided stack.
* **suppressions** (<code>Array<[NagPackSuppression](#cdk-nag-nagpacksuppression)></code>)  A list of suppressions to apply to the resource.
* **applyToChildren** (<code>boolean</code>)  Apply the suppressions to children CfnResources  (default:false).




#### *static* addStackSuppressions(stack, suppressions, applyToNestedStacks?) <a id="cdk-nag-nagsuppressions-addstacksuppressions"></a>

Apply cdk-nag suppressions to a Stack and optionally nested stacks.

```ts
static addStackSuppressions(stack: Stack, suppressions: Array<NagPackSuppression>, applyToNestedStacks?: boolean): void
```

* **stack** (<code>[Stack](#aws-cdk-lib-stack)</code>)  The Stack to apply the suppression to.
* **suppressions** (<code>Array<[NagPackSuppression](#cdk-nag-nagpacksuppression)></code>)  A list of suppressions to apply to the stack.
* **applyToNestedStacks** (<code>boolean</code>)  Apply the suppressions to children stacks (default:false).






## class PCIDSS321Checks  <a id="cdk-nag-pcidss321checks"></a>

Check for PCI DSS 3.2.1 compliance. Based on the PCI DSS 3.2.1 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-pci-dss.html.

__Implements__: [IAspect](#aws-cdk-lib-iaspect)
__Extends__: [NagPack](#cdk-nag-nagpack)

### Initializer




```ts
new PCIDSS321Checks(props?: NagPackProps)
```

* **props** (<code>[NagPackProps](#cdk-nag-nagpackprops)</code>)  *No description*
  * **logIgnores** (<code>boolean</code>)  Whether or not to log triggered rules that have been suppressed as informational messages (default: false). __*Optional*__
  * **reports** (<code>boolean</code>)  Whether or not to generate CSV compliance reports for applied Stacks in the App's output directory (default: true). __*Optional*__
  * **verbose** (<code>boolean</code>)  Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false). __*Optional*__


### Methods


#### visit(node) <a id="cdk-nag-pcidss321checks-visit"></a>

All aspects can visit an IConstruct.

```ts
visit(node: IConstruct): void
```

* **node** (<code>[IConstruct](#constructs-iconstruct)</code>)  *No description*






## interface IApplyRule  <a id="cdk-nag-iapplyrule"></a>


Interface for JSII interoperability for passing parameters and the Rule Callback to @applyRule method.

### Properties


Name | Type | Description 
-----|------|-------------
**explanation** | <code>string</code> | Why the rule exists.
**info** | <code>string</code> | Why the rule was triggered.
**level** | <code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code> | The annotations message level to apply to the rule if triggered.
**node** | <code>[CfnResource](#aws-cdk-lib-cfnresource)</code> | Ignores listed in cdk-nag metadata.
**ruleSuffixOverride**? | <code>string</code> | Override for the suffix of the Rule ID for this rule.<br/>__*Optional*__

### Methods


#### rule(node) <a id="cdk-nag-iapplyrule-rule"></a>

The callback to the rule.

```ts
rule(node: CfnResource): NagRuleCompliance &#124; Array<string>
```

* **node** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  The CfnResource to check.

__Returns__:
* <code>[NagRuleCompliance](#cdk-nag-nagrulecompliance) &#124; Array<string></code>



## struct NagPackProps  <a id="cdk-nag-nagpackprops"></a>


Interface for creating a Nag rule pack.



Name | Type | Description 
-----|------|-------------
**logIgnores**? | <code>boolean</code> | Whether or not to log triggered rules that have been suppressed as informational messages (default: false).<br/>__*Optional*__
**reports**? | <code>boolean</code> | Whether or not to generate CSV compliance reports for applied Stacks in the App's output directory (default: true).<br/>__*Optional*__
**verbose**? | <code>boolean</code> | Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false).<br/>__*Optional*__



## struct NagPackSuppression  <a id="cdk-nag-nagpacksuppression"></a>


Interface for creating a rule suppression.



Name | Type | Description 
-----|------|-------------
**id** | <code>string</code> | The id of the rule to ignore.
**reason** | <code>string</code> | The reason to ignore the rule (minimum 10 characters).
**appliesTo**? | <code>Array<string &#124; [RegexAppliesTo](#cdk-nag-regexappliesto)></code> | Rule specific granular suppressions.<br/>__*Optional*__



## struct RegexAppliesTo  <a id="cdk-nag-regexappliesto"></a>


A regular expression to apply to matching findings.



Name | Type | Description 
-----|------|-------------
**regex** | <code>string</code> | An ECMA-262 regex string.



## enum NagMessageLevel  <a id="cdk-nag-nagmessagelevel"></a>

The level of the message that the rule applies.

Name | Description
-----|-----
**WARN** |
**ERROR** |


## enum NagRuleCompliance  <a id="cdk-nag-nagrulecompliance"></a>

The compliance level of a resource in relation to a rule.

Name | Description
-----|-----
**COMPLIANT** |
**NON_COMPLIANT** |
**NOT_APPLICABLE** |


