# API Reference

**Classes**

Name|Description
----|-----------
[AwsSolutionsChecks](#cdk-nag-awssolutionschecks)|Check Best practices based on AWS Solutions Security Matrix.
[NIST80053Checks](#cdk-nag-nist80053checks)|Check whether the cloudformation stack is NIST 800-53 compliant Based on the NIST 800-53 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-nist-800-53_rev_4.html.
[NagPack](#cdk-nag-nagpack)|Base class for all rule sets.


**Structs**

Name|Description
----|-----------
[NagPackProps](#cdk-nag-nagpackprops)|Interface for creating a Nag rule set.



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






## class NIST80053Checks  <a id="cdk-nag-nist80053checks"></a>

Check whether the cloudformation stack is NIST 800-53 compliant Based on the NIST 800-53 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-nist-800-53_rev_4.html.

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
__Implemented by__: [AwsSolutionsChecks](#cdk-nag-awssolutionschecks), [NIST80053Checks](#cdk-nag-nist80053checks)

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


#### createMessage(ruleId, info, explanation) <a id="cdk-nag-nagpack-createmessage"></a>

The message to output to the console when a rule is triggered.

```ts
createMessage(ruleId: string, info: string, explanation: string): string
```

* **ruleId** (<code>string</code>)  the id of the rule.
* **info** (<code>string</code>)  why the rule was triggered.
* **explanation** (<code>string</code>)  why the rule exists.

__Returns__:
* <code>string</code>

#### ignoreRule(ignores, ruleId) <a id="cdk-nag-nagpack-ignorerule"></a>

Check whether a specific rule should be ignored.

```ts
ignoreRule(ignores: any, ruleId: string): boolean
```

* **ignores** (<code>any</code>)  ignores listed in cdkNag metadata.
* **ruleId** (<code>string</code>)  the id of the rule to ignore.

__Returns__:
* <code>boolean</code>

#### visit(node) <a id="cdk-nag-nagpack-visit"></a>

All aspects can visit an IConstruct.

```ts
visit(node: IConstruct): void
```

* **node** (<code>[IConstruct](#aws-cdk-core-iconstruct)</code>)  *No description*






## struct NagPackProps  <a id="cdk-nag-nagpackprops"></a>


Interface for creating a Nag rule set.



Name | Type | Description 
-----|------|-------------
**verbose**? | <code>boolean</code> | Whether or not to enable extended explanatory descriptions on warning and error messages.<br/>__*Optional*__



