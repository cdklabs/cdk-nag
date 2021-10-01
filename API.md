# API Reference

**Classes**

Name|Description
----|-----------
[AwsSolutionsChecks](#cdk-nag-awssolutionschecks)|Check Best practices based on AWS Solutions Security Matrix.
[HIPAASecurityChecks](#cdk-nag-hipaasecuritychecks)|Check for HIPAA Security compliance.
[NIST80053Checks](#cdk-nag-nist80053checks)|Check for NIST 800-53 compliance.
[NagPack](#cdk-nag-nagpack)|Base class for all rule sets.


**Structs**

Name|Description
----|-----------
[NagPackProps](#cdk-nag-nagpackprops)|Interface for creating a Nag rule set.


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

__Implements__: [IAspect](#aws-cdk-core-iaspect)
__Extends__: [NagPack](#cdk-nag-nagpack)

### Initializer




```ts
new AwsSolutionsChecks(props?: NagPackProps)
```

* **props** (<code>[NagPackProps](#cdk-nag-nagpackprops)</code>)  *No description*
  * **verbose** (<code>boolean</code>)  Whether or not to enable extended explanatory descriptions on warning and error messages. __*Optional*__


### Methods


#### visit(node) <a id="cdk-nag-awssolutionschecks-visit"></a>

All aspects can visit an IConstruct.

```ts
visit(node: IConstruct): void
```

* **node** (<code>[IConstruct](#aws-cdk-core-iconstruct)</code>)  *No description*






## class HIPAASecurityChecks  <a id="cdk-nag-hipaasecuritychecks"></a>

Check for HIPAA Security compliance.

Based on the HIPAA Security AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-hipaa_security.html

__Implements__: [IAspect](#aws-cdk-core-iaspect)
__Extends__: [NagPack](#cdk-nag-nagpack)

### Initializer




```ts
new HIPAASecurityChecks(props?: NagPackProps)
```

* **props** (<code>[NagPackProps](#cdk-nag-nagpackprops)</code>)  *No description*
  * **verbose** (<code>boolean</code>)  Whether or not to enable extended explanatory descriptions on warning and error messages. __*Optional*__


### Methods


#### visit(node) <a id="cdk-nag-hipaasecuritychecks-visit"></a>

All aspects can visit an IConstruct.

```ts
visit(node: IConstruct): void
```

* **node** (<code>[IConstruct](#aws-cdk-core-iconstruct)</code>)  *No description*






## class NIST80053Checks  <a id="cdk-nag-nist80053checks"></a>

Check for NIST 800-53 compliance.

Based on the NIST 800-53 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-nist-800-53_rev_4.html

__Implements__: [IAspect](#aws-cdk-core-iaspect)
__Extends__: [NagPack](#cdk-nag-nagpack)

### Initializer




```ts
new NIST80053Checks(props?: NagPackProps)
```

* **props** (<code>[NagPackProps](#cdk-nag-nagpackprops)</code>)  *No description*
  * **verbose** (<code>boolean</code>)  Whether or not to enable extended explanatory descriptions on warning and error messages. __*Optional*__


### Methods


#### visit(node) <a id="cdk-nag-nist80053checks-visit"></a>

All aspects can visit an IConstruct.

```ts
visit(node: IConstruct): void
```

* **node** (<code>[IConstruct](#aws-cdk-core-iconstruct)</code>)  *No description*






## class NagPack  <a id="cdk-nag-nagpack"></a>

Base class for all rule sets.

__Implements__: [IAspect](#aws-cdk-core-iaspect)
__Implemented by__: [AwsSolutionsChecks](#cdk-nag-awssolutionschecks), [HIPAASecurityChecks](#cdk-nag-hipaasecuritychecks), [NIST80053Checks](#cdk-nag-nist80053checks)

### Initializer




```ts
new NagPack(props?: NagPackProps)
```

* **props** (<code>[NagPackProps](#cdk-nag-nagpackprops)</code>)  *No description*
  * **verbose** (<code>boolean</code>)  Whether or not to enable extended explanatory descriptions on warning and error messages. __*Optional*__



### Properties


Name | Type | Description 
-----|------|-------------
**verbose** | <code>boolean</code> | <span></span>

### Methods


#### applyRule(params) <a id="cdk-nag-nagpack-applyrule"></a>



```ts
applyRule(params: IApplyRule): void
```

* **params** (<code>[IApplyRule](#cdk-nag-iapplyrule)</code>)  *No description*




#### visit(node) <a id="cdk-nag-nagpack-visit"></a>

All aspects can visit an IConstruct.

```ts
visit(node: IConstruct): void
```

* **node** (<code>[IConstruct](#aws-cdk-core-iconstruct)</code>)  *No description*






## interface IApplyRule  <a id="cdk-nag-iapplyrule"></a>


Interface for JSII interoperability for passing parameters and the Rule Callback to @applyRule method.

### Properties


Name | Type | Description 
-----|------|-------------
**explanation** | <code>string</code> | Why the rule exists.
**ignores** | <code>any</code> | Ignores listed in cdkNag metadata.
**info** | <code>string</code> | Why the rule was triggered.
**level** | <code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code> | The annotations message level to apply to the rule if triggered.
**node** | <code>[CfnResource](#aws-cdk-core-cfnresource)</code> | The CfnResource to check.
**ruleId** | <code>string</code> | The id of the rule to ignore.

### Methods


#### rule(node) <a id="cdk-nag-iapplyrule-rule"></a>

The callback to the rule.

```ts
rule(node: CfnResource): boolean
```

* **node** (<code>[CfnResource](#aws-cdk-core-cfnresource)</code>)  the CfnResource to check.

__Returns__:
* <code>boolean</code>



## struct NagPackProps  <a id="cdk-nag-nagpackprops"></a>


Interface for creating a Nag rule set.



Name | Type | Description 
-----|------|-------------
**verbose**? | <code>boolean</code> | Whether or not to enable extended explanatory descriptions on warning and error messages.<br/>__*Optional*__



## enum NagMessageLevel  <a id="cdk-nag-nagmessagelevel"></a>

The level of the message that the rule applies.

Name | Description
-----|-----
**WARN** |
**ERROR** |


