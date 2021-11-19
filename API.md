# API Reference

**Classes**

Name|Description
----|-----------
[AwsSolutionsChecks](#cdk-nag-awssolutionschecks)|Check Best practices based on AWS Solutions Security Matrix.
[HIPAASecurityChecks](#cdk-nag-hipaasecuritychecks)|Check for HIPAA Security compliance.
[NIST80053R4Checks](#cdk-nag-nist80053r4checks)|Check for NIST 800-53 rev 4 compliance.
[NIST80053R5Checks](#cdk-nag-nist80053r5checks)|Check for NIST 800-53 rev 5 compliance.
[NagPack](#cdk-nag-nagpack)|Base class for all rule packs.
[NagSuppressions](#cdk-nag-nagsuppressions)|Helper class with methods to add cdk-nag suppressions to cdk resources.
[PCIDSS321Checks](#cdk-nag-pcidss321checks)|Check for PCI DSS 3.2.1 compliance. Based on the PCI DSS 3.2.1 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-pci-dss.html.


**Structs**

Name|Description
----|-----------
[NagPackProps](#cdk-nag-nagpackprops)|Interface for creating a Nag rule pack.
[NagPackSuppression](#cdk-nag-nagpacksuppression)|Interface for creating a rule suppression.


**Interfaces**

Name|Description
----|-----------
[IApplyRule](#cdk-nag-iapplyrule)|Interface for JSII interoperability for passing parameters and the Rule Callback to @applyRule method.


**Enums**

Name|Description
----|-----------
[NagMessageLevel](#cdk-nag-nagmessagelevel)|The level of the message that the rule applies.



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
  * **verbose** (<code>boolean</code>)  Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false). __*Optional*__



### Properties


Name | Type | Description 
-----|------|-------------
**logIgnores** | <code>boolean</code> | <span></span>
**packName** | <code>string</code> | <span></span>
**readPackName** | <code>string</code> | <span></span>
**verbose** | <code>boolean</code> | <span></span>

### Methods


#### applyRule(params) <a id="cdk-nag-nagpack-applyrule"></a>

Create a rule to be used in the NagPack.

```ts
applyRule(params: IApplyRule): void
```

* **params** (<code>[IApplyRule](#cdk-nag-iapplyrule)</code>)  The.




#### visit(node) <a id="cdk-nag-nagpack-visit"></a>

All aspects can visit an IConstruct.

```ts
visit(node: IConstruct): void
```

* **node** (<code>[IConstruct](#constructs-iconstruct)</code>)  *No description*






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
static addResourceSuppressions(construct: IConstruct, suppressions: Array<NagPackSuppression>, applyToChildren?: boolean): void
```

* **construct** (<code>[IConstruct](#constructs-iconstruct)</code>)  The IConstruct to apply the suppression to.
* **suppressions** (<code>Array<[NagPackSuppression](#cdk-nag-nagpacksuppression)></code>)  A list of suppressions to apply to the resource.
* **applyToChildren** (<code>boolean</code>)  Apply the suppressions to children CfnResources  (default:false).




#### *static* addResourceSuppressionsByPath(stack, path, suppressions, applyToChildren?) <a id="cdk-nag-nagsuppressions-addresourcesuppressionsbypath"></a>

Add cdk-nag suppressions to a CfnResource and optionally its children via its path.

```ts
static addResourceSuppressionsByPath(stack: Stack, path: string, suppressions: Array<NagPackSuppression>, applyToChildren?: boolean): void
```

* **stack** (<code>[Stack](#aws-cdk-lib-stack)</code>)  The Stack the construct belongs to.
* **path** (<code>string</code>)  The path to the construct in the provided stack.
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
rule(node: CfnResource): boolean
```

* **node** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  The CfnResource to check.

__Returns__:
* <code>boolean</code>



## struct NagPackProps  <a id="cdk-nag-nagpackprops"></a>


Interface for creating a Nag rule pack.



Name | Type | Description 
-----|------|-------------
**logIgnores**? | <code>boolean</code> | Whether or not to log triggered rules that have been suppressed as informational messages (default: false).<br/>__*Optional*__
**verbose**? | <code>boolean</code> | Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false).<br/>__*Optional*__



## struct NagPackSuppression  <a id="cdk-nag-nagpacksuppression"></a>


Interface for creating a rule suppression.



Name | Type | Description 
-----|------|-------------
**id** | <code>string</code> | The id of the rule to ignore.
**reason** | <code>string</code> | The reason to ignore the rule (minimum 10 characters).



## enum NagMessageLevel  <a id="cdk-nag-nagmessagelevel"></a>

The level of the message that the rule applies.

Name | Description
-----|-----
**WARN** |
**ERROR** |


