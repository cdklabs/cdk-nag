# API Reference

**Classes**

Name|Description
----|-----------
[AnnotationsLogger](#cdk-nag-annotationslogger)|A NagLogger that outputs to the CDK Annotations system.
[AwsSolutionsChecks](#cdk-nag-awssolutionschecks)|Check Best practices based on AWS Solutions Security Matrix.
[CsvNagReportLogger](#cdk-nag-csvnagreportlogger)|A NagLogger that creates CSV compliance reports.
[HIPAASecurityChecks](#cdk-nag-hipaasecuritychecks)|Check for HIPAA Security compliance.
[JsonNagReportLogger](#cdk-nag-jsonnagreportlogger)|A NagLogger that creates JSON compliance reports.
[NIST80053R4Checks](#cdk-nag-nist80053r4checks)|Check for NIST 800-53 rev 4 compliance.
[NIST80053R5Checks](#cdk-nag-nist80053r5checks)|Check for NIST 800-53 rev 5 compliance.
[NagPack](#cdk-nag-nagpack)|Base class for all rule packs.
[NagRules](#cdk-nag-nagrules)|Helper class with methods for rule creation.
[NagSuppressions](#cdk-nag-nagsuppressions)|Helper class with methods to add cdk-nag suppressions to cdk resources.
[PCIDSS321Checks](#cdk-nag-pcidss321checks)|Check for PCI DSS 3.2.1 compliance. Based on the PCI DSS 3.2.1 AWS operational best practices: https://docs.aws.amazon.com/config/latest/developerguide/operational-best-practices-for-pci-dss.html.
[SuppressionIgnoreAlways](#cdk-nag-suppressionignorealways)|Always ignore the suppression.
[SuppressionIgnoreAnd](#cdk-nag-suppressionignoreand)|Ignore the suppression if all of the given INagSuppressionIgnore return a non-empty message.
[SuppressionIgnoreErrors](#cdk-nag-suppressionignoreerrors)|Ignore Suppressions for Rules with a NagMessageLevel.ERROR.
[SuppressionIgnoreNever](#cdk-nag-suppressionignorenever)|Don't ignore the suppression.
[SuppressionIgnoreOr](#cdk-nag-suppressionignoreor)|Ignore the suppression if any of the given INagSuppressionIgnore return a non-empty message.


**Structs**

Name|Description
----|-----------
[NagLoggerComplianceInput](#cdk-nag-nagloggercomplianceinput)|Input for onCompliance method of an INagLogger.
[NagLoggerErrorInput](#cdk-nag-nagloggererrorinput)|Input for onError method of an INagLogger.
[NagLoggerInputBase](#cdk-nag-nagloggerinputbase)|Shared input for all INagLogger methods.
[NagLoggerNonComplianceInput](#cdk-nag-nagloggernoncomplianceinput)|Input for onNonCompliance method of an INagLogger.
[NagLoggerNotApplicableInput](#cdk-nag-nagloggernotapplicableinput)|Input for onNotApplicable method of an INagLogger.
[NagLoggerSuppressedErrorInput](#cdk-nag-nagloggersuppressederrorinput)|Input for onSuppressedError method of an INagLogger.
[NagLoggerSuppressionInput](#cdk-nag-nagloggersuppressioninput)|Input for onSuppression method of an INagLogger.
[NagPackProps](#cdk-nag-nagpackprops)|Interface for creating a NagPack.
[NagPackSuppression](#cdk-nag-nagpacksuppression)|Interface for creating a rule suppression.
[NagReportLine](#cdk-nag-nagreportline)|*No description*
[NagReportSchema](#cdk-nag-nagreportschema)|*No description*
[RegexAppliesTo](#cdk-nag-regexappliesto)|A regular expression to apply to matching findings.
[SuppressionIgnoreInput](#cdk-nag-suppressionignoreinput)|Information about the NagRule and the relevant NagSuppression for the INagSuppressionIgnore.


**Interfaces**

Name|Description
----|-----------
[IApplyRule](#cdk-nag-iapplyrule)|Interface for JSII interoperability for passing parameters and the Rule Callback to @applyRule method.
[INagLogger](#cdk-nag-inaglogger)|Interface for creating NagSuppression Ignores.
[INagSuppressionIgnore](#cdk-nag-inagsuppressionignore)|Interface for creating NagSuppression Ignores.


**Enums**

Name|Description
----|-----------
[NagMessageLevel](#cdk-nag-nagmessagelevel)|The severity level of the rule.
[NagRuleCompliance](#cdk-nag-nagrulecompliance)|The compliance level of a resource in relation to a rule.
[NagRulePostValidationStates](#cdk-nag-nagrulepostvalidationstates)|States a rule can be in post validation.



## class AnnotationsLogger  <a id="cdk-nag-annotationslogger"></a>

A NagLogger that outputs to the CDK Annotations system.

__Implements__: [INagLogger](#cdk-nag-inaglogger)

### Initializer




```ts
new AnnotationsLogger()
```




### Properties


Name | Type | Description 
-----|------|-------------
**suppressionId** | <code>string</code> | <span></span>

### Methods


#### onCompliance(_input) <a id="cdk-nag-annotationslogger-oncompliance"></a>

Called when a CfnResource passes the compliance check for a given rule.

```ts
onCompliance(_input: NagLoggerComplianceInput): void
```

* **_input** (<code>[NagLoggerComplianceInput](#cdk-nag-nagloggercomplianceinput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 




#### onError(input) <a id="cdk-nag-annotationslogger-onerror"></a>

Called when a rule throws an error during while validating a CfnResource for compliance.

```ts
onError(input: NagLoggerErrorInput): void
```

* **input** (<code>[NagLoggerErrorInput](#cdk-nag-nagloggererrorinput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 
  * **errorMessage** (<code>string</code>)  *No description* 




#### onNonCompliance(input) <a id="cdk-nag-annotationslogger-onnoncompliance"></a>

Called when a CfnResource does not pass the compliance check for a given rule and the the rule violation is not suppressed by the user.

```ts
onNonCompliance(input: NagLoggerNonComplianceInput): void
```

* **input** (<code>[NagLoggerNonComplianceInput](#cdk-nag-nagloggernoncomplianceinput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 
  * **findingId** (<code>string</code>)  *No description* 




#### onNotApplicable(_input) <a id="cdk-nag-annotationslogger-onnotapplicable"></a>

Called when a rule does not apply to the given CfnResource.

```ts
onNotApplicable(_input: NagLoggerNotApplicableInput): void
```

* **_input** (<code>[NagLoggerNotApplicableInput](#cdk-nag-nagloggernotapplicableinput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 




#### onSuppressedError(input) <a id="cdk-nag-annotationslogger-onsuppressederror"></a>

Called when a rule throws an error during while validating a CfnResource for compliance and the error is suppressed.

```ts
onSuppressedError(input: NagLoggerSuppressedErrorInput): void
```

* **input** (<code>[NagLoggerSuppressedErrorInput](#cdk-nag-nagloggersuppressederrorinput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 
  * **errorMessage** (<code>string</code>)  *No description* 
  * **errorSuppressionReason** (<code>string</code>)  *No description* 
  * **shouldLogIgnored** (<code>boolean</code>)  *No description* 




#### onSuppression(input) <a id="cdk-nag-annotationslogger-onsuppression"></a>

Called when a CfnResource does not pass the compliance check for a given rule and the rule violation is suppressed by the user.

```ts
onSuppression(input: NagLoggerSuppressionInput): void
```

* **input** (<code>[NagLoggerSuppressionInput](#cdk-nag-nagloggersuppressioninput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 
  * **findingId** (<code>string</code>)  *No description* 
  * **shouldLogIgnored** (<code>boolean</code>)  *No description* 
  * **suppressionReason** (<code>string</code>)  *No description* 




#### protected createMessage(ruleId, findingId, ruleInfo, ruleExplanation, verbose) <a id="cdk-nag-annotationslogger-createmessage"></a>



```ts
protected createMessage(ruleId: string, findingId: string, ruleInfo: string, ruleExplanation: string, verbose: boolean): string
```

* **ruleId** (<code>string</code>)  *No description*
* **findingId** (<code>string</code>)  *No description*
* **ruleInfo** (<code>string</code>)  *No description*
* **ruleExplanation** (<code>string</code>)  *No description*
* **verbose** (<code>boolean</code>)  *No description*

__Returns__:
* <code>string</code>



## class AwsSolutionsChecks  <a id="cdk-nag-awssolutionschecks"></a>

Check Best practices based on AWS Solutions Security Matrix.

__Implements__: [IAspect](#aws-cdk-lib-iaspect)
__Extends__: [NagPack](#cdk-nag-nagpack)

### Initializer




```ts
new AwsSolutionsChecks(props?: NagPackProps)
```

* **props** (<code>[NagPackProps](#cdk-nag-nagpackprops)</code>)  *No description*
  * **additionalNagLoggers** (<code>Array<[INagLogger](#cdk-nag-inaglogger)></code>)  Additional NagLoggers for logging rule validation outputs. __*Optional*__
  * **logIgnores** (<code>boolean</code>)  Whether or not to log triggered rules that have been suppressed as informational messages (default: false). __*Optional*__
  * **reports** (<code>boolean</code>)  Whether or not to generate CSV compliance reports for applied Stacks in the App's output directory (default: true). __*Optional*__
  * **suppressionIgnoreCondition** (<code>[INagSuppressionIgnore](#cdk-nag-inagsuppressionignore)</code>)  Conditionally prevent rules from being suppressed (default: no user provided condition). __*Optional*__
  * **verbose** (<code>boolean</code>)  Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false). __*Optional*__


### Methods


#### visit(node) <a id="cdk-nag-awssolutionschecks-visit"></a>

All aspects can visit an IConstruct.

```ts
visit(node: IConstruct): void
```

* **node** (<code>[IConstruct](#constructs-iconstruct)</code>)  *No description*






## class CsvNagReportLogger  <a id="cdk-nag-csvnagreportlogger"></a>

A NagLogger that creates CSV compliance reports.

__Implements__: [INagLogger](#cdk-nag-inaglogger)

### Initializer




```ts
new CsvNagReportLogger()
```




### Properties


Name | Type | Description 
-----|------|-------------
**reportStacks** | <code>Array<string></code> | <span></span>

### Methods


#### onCompliance(input) <a id="cdk-nag-csvnagreportlogger-oncompliance"></a>

Called when a CfnResource passes the compliance check for a given rule.

```ts
onCompliance(input: NagLoggerComplianceInput): void
```

* **input** (<code>[NagLoggerComplianceInput](#cdk-nag-nagloggercomplianceinput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 




#### onError(input) <a id="cdk-nag-csvnagreportlogger-onerror"></a>

Called when a rule throws an error during while validating a CfnResource for compliance.

```ts
onError(input: NagLoggerErrorInput): void
```

* **input** (<code>[NagLoggerErrorInput](#cdk-nag-nagloggererrorinput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 
  * **errorMessage** (<code>string</code>)  *No description* 




#### onNonCompliance(input) <a id="cdk-nag-csvnagreportlogger-onnoncompliance"></a>

Called when a CfnResource does not pass the compliance check for a given rule and the the rule violation is not suppressed by the user.

```ts
onNonCompliance(input: NagLoggerNonComplianceInput): void
```

* **input** (<code>[NagLoggerNonComplianceInput](#cdk-nag-nagloggernoncomplianceinput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 
  * **findingId** (<code>string</code>)  *No description* 




#### onNotApplicable(input) <a id="cdk-nag-csvnagreportlogger-onnotapplicable"></a>

Called when a rule does not apply to the given CfnResource.

```ts
onNotApplicable(input: NagLoggerNotApplicableInput): void
```

* **input** (<code>[NagLoggerNotApplicableInput](#cdk-nag-nagloggernotapplicableinput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 




#### onSuppressedError(input) <a id="cdk-nag-csvnagreportlogger-onsuppressederror"></a>

Called when a rule throws an error during while validating a CfnResource for compliance and the error is suppressed.

```ts
onSuppressedError(input: NagLoggerSuppressedErrorInput): void
```

* **input** (<code>[NagLoggerSuppressedErrorInput](#cdk-nag-nagloggersuppressederrorinput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 
  * **errorMessage** (<code>string</code>)  *No description* 
  * **errorSuppressionReason** (<code>string</code>)  *No description* 
  * **shouldLogIgnored** (<code>boolean</code>)  *No description* 




#### onSuppression(input) <a id="cdk-nag-csvnagreportlogger-onsuppression"></a>

Called when a CfnResource does not pass the compliance check for a given rule and the rule violation is suppressed by the user.

```ts
onSuppression(input: NagLoggerSuppressionInput): void
```

* **input** (<code>[NagLoggerSuppressionInput](#cdk-nag-nagloggersuppressioninput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 
  * **findingId** (<code>string</code>)  *No description* 
  * **shouldLogIgnored** (<code>boolean</code>)  *No description* 
  * **suppressionReason** (<code>string</code>)  *No description* 




#### protected initializeStackReport(input) <a id="cdk-nag-csvnagreportlogger-initializestackreport"></a>

Initialize the report for the rule pack's compliance report for the resource's Stack if it doesn't exist.

```ts
protected initializeStackReport(input: NagLoggerInputBase): void
```

* **input** (<code>[NagLoggerInputBase](#cdk-nag-nagloggerinputbase)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 




#### protected writeToStackComplianceReport(input, compliance) <a id="cdk-nag-csvnagreportlogger-writetostackcompliancereport"></a>



```ts
protected writeToStackComplianceReport(input: NagLoggerInputBase, compliance: NagRulePostValidationStates &#124; NagRuleCompliance): void
```

* **input** (<code>[NagLoggerInputBase](#cdk-nag-nagloggerinputbase)</code>)  *No description*
* **compliance** (<code>[NagRulePostValidationStates](#cdk-nag-nagrulepostvalidationstates) &#124; [NagRuleCompliance](#cdk-nag-nagrulecompliance)</code>)  *No description*






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
  * **additionalNagLoggers** (<code>Array<[INagLogger](#cdk-nag-inaglogger)></code>)  Additional NagLoggers for logging rule validation outputs. __*Optional*__
  * **logIgnores** (<code>boolean</code>)  Whether or not to log triggered rules that have been suppressed as informational messages (default: false). __*Optional*__
  * **reports** (<code>boolean</code>)  Whether or not to generate CSV compliance reports for applied Stacks in the App's output directory (default: true). __*Optional*__
  * **suppressionIgnoreCondition** (<code>[INagSuppressionIgnore](#cdk-nag-inagsuppressionignore)</code>)  Conditionally prevent rules from being suppressed (default: no user provided condition). __*Optional*__
  * **verbose** (<code>boolean</code>)  Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false). __*Optional*__


### Methods


#### visit(node) <a id="cdk-nag-hipaasecuritychecks-visit"></a>

All aspects can visit an IConstruct.

```ts
visit(node: IConstruct): void
```

* **node** (<code>[IConstruct](#constructs-iconstruct)</code>)  *No description*






## class JsonNagReportLogger  <a id="cdk-nag-jsonnagreportlogger"></a>

A NagLogger that creates JSON compliance reports.

__Implements__: [INagLogger](#cdk-nag-inaglogger)

### Initializer




```ts
new JsonNagReportLogger()
```




### Properties


Name | Type | Description 
-----|------|-------------
**reportStacks** | <code>Array<string></code> | <span></span>

### Methods


#### onCompliance(input) <a id="cdk-nag-jsonnagreportlogger-oncompliance"></a>

Called when a CfnResource passes the compliance check for a given rule.

```ts
onCompliance(input: NagLoggerComplianceInput): void
```

* **input** (<code>[NagLoggerComplianceInput](#cdk-nag-nagloggercomplianceinput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 




#### onError(input) <a id="cdk-nag-jsonnagreportlogger-onerror"></a>

Called when a rule throws an error during while validating a CfnResource for compliance.

```ts
onError(input: NagLoggerErrorInput): void
```

* **input** (<code>[NagLoggerErrorInput](#cdk-nag-nagloggererrorinput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 
  * **errorMessage** (<code>string</code>)  *No description* 




#### onNonCompliance(input) <a id="cdk-nag-jsonnagreportlogger-onnoncompliance"></a>

Called when a CfnResource does not pass the compliance check for a given rule and the the rule violation is not suppressed by the user.

```ts
onNonCompliance(input: NagLoggerNonComplianceInput): void
```

* **input** (<code>[NagLoggerNonComplianceInput](#cdk-nag-nagloggernoncomplianceinput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 
  * **findingId** (<code>string</code>)  *No description* 




#### onNotApplicable(input) <a id="cdk-nag-jsonnagreportlogger-onnotapplicable"></a>

Called when a rule does not apply to the given CfnResource.

```ts
onNotApplicable(input: NagLoggerNotApplicableInput): void
```

* **input** (<code>[NagLoggerNotApplicableInput](#cdk-nag-nagloggernotapplicableinput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 




#### onSuppressedError(input) <a id="cdk-nag-jsonnagreportlogger-onsuppressederror"></a>

Called when a rule throws an error during while validating a CfnResource for compliance and the error is suppressed.

```ts
onSuppressedError(input: NagLoggerSuppressedErrorInput): void
```

* **input** (<code>[NagLoggerSuppressedErrorInput](#cdk-nag-nagloggersuppressederrorinput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 
  * **errorMessage** (<code>string</code>)  *No description* 
  * **errorSuppressionReason** (<code>string</code>)  *No description* 
  * **shouldLogIgnored** (<code>boolean</code>)  *No description* 




#### onSuppression(input) <a id="cdk-nag-jsonnagreportlogger-onsuppression"></a>

Called when a CfnResource does not pass the compliance check for a given rule and the rule violation is suppressed by the user.

```ts
onSuppression(input: NagLoggerSuppressionInput): void
```

* **input** (<code>[NagLoggerSuppressionInput](#cdk-nag-nagloggersuppressioninput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 
  * **findingId** (<code>string</code>)  *No description* 
  * **shouldLogIgnored** (<code>boolean</code>)  *No description* 
  * **suppressionReason** (<code>string</code>)  *No description* 




#### protected initializeStackReport(input) <a id="cdk-nag-jsonnagreportlogger-initializestackreport"></a>

Initialize the report for the rule pack's compliance report for the resource's Stack if it doesn't exist.

```ts
protected initializeStackReport(input: NagLoggerInputBase): void
```

* **input** (<code>[NagLoggerInputBase](#cdk-nag-nagloggerinputbase)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 




#### protected writeToStackComplianceReport(input, compliance) <a id="cdk-nag-jsonnagreportlogger-writetostackcompliancereport"></a>



```ts
protected writeToStackComplianceReport(input: NagLoggerInputBase, compliance: NagRulePostValidationStates &#124; NagRuleCompliance): void
```

* **input** (<code>[NagLoggerInputBase](#cdk-nag-nagloggerinputbase)</code>)  *No description*
* **compliance** (<code>[NagRulePostValidationStates](#cdk-nag-nagrulepostvalidationstates) &#124; [NagRuleCompliance](#cdk-nag-nagrulecompliance)</code>)  *No description*






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
  * **additionalNagLoggers** (<code>Array<[INagLogger](#cdk-nag-inaglogger)></code>)  Additional NagLoggers for logging rule validation outputs. __*Optional*__
  * **logIgnores** (<code>boolean</code>)  Whether or not to log triggered rules that have been suppressed as informational messages (default: false). __*Optional*__
  * **reports** (<code>boolean</code>)  Whether or not to generate CSV compliance reports for applied Stacks in the App's output directory (default: true). __*Optional*__
  * **suppressionIgnoreCondition** (<code>[INagSuppressionIgnore](#cdk-nag-inagsuppressionignore)</code>)  Conditionally prevent rules from being suppressed (default: no user provided condition). __*Optional*__
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
  * **additionalNagLoggers** (<code>Array<[INagLogger](#cdk-nag-inaglogger)></code>)  Additional NagLoggers for logging rule validation outputs. __*Optional*__
  * **logIgnores** (<code>boolean</code>)  Whether or not to log triggered rules that have been suppressed as informational messages (default: false). __*Optional*__
  * **reports** (<code>boolean</code>)  Whether or not to generate CSV compliance reports for applied Stacks in the App's output directory (default: true). __*Optional*__
  * **suppressionIgnoreCondition** (<code>[INagSuppressionIgnore](#cdk-nag-inagsuppressionignore)</code>)  Conditionally prevent rules from being suppressed (default: no user provided condition). __*Optional*__
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
  * **additionalNagLoggers** (<code>Array<[INagLogger](#cdk-nag-inaglogger)></code>)  Additional NagLoggers for logging rule validation outputs. __*Optional*__
  * **logIgnores** (<code>boolean</code>)  Whether or not to log triggered rules that have been suppressed as informational messages (default: false). __*Optional*__
  * **reports** (<code>boolean</code>)  Whether or not to generate CSV compliance reports for applied Stacks in the App's output directory (default: true). __*Optional*__
  * **suppressionIgnoreCondition** (<code>[INagSuppressionIgnore](#cdk-nag-inagsuppressionignore)</code>)  Conditionally prevent rules from being suppressed (default: no user provided condition). __*Optional*__
  * **verbose** (<code>boolean</code>)  Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false). __*Optional*__



### Properties


Name | Type | Description 
-----|------|-------------
**logIgnores** | <code>boolean</code> | <span></span>
**loggingTargets** | <code>Array<[INagLogger](#cdk-nag-inaglogger)></code> | <span></span>
**packName** | <code>string</code> | <span></span>
**readPackName** | <code>string</code> | <span></span>
**verbose** | <code>boolean</code> | <span></span>
**packGlobalSuppressionIgnore**? | <code>[INagSuppressionIgnore](#cdk-nag-inagsuppressionignore)</code> | __*Optional*__
**userGlobalSuppressionIgnore**? | <code>[INagSuppressionIgnore](#cdk-nag-inagsuppressionignore)</code> | __*Optional*__

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




#### protected ignoreRule(suppressions, ruleId, findingId, resource, level, ignoreSuppressionCondition?) <a id="cdk-nag-nagpack-ignorerule"></a>

Check whether a specific rule should be ignored.

```ts
protected ignoreRule(suppressions: Array<NagPackSuppression>, ruleId: string, findingId: string, resource: CfnResource, level: NagMessageLevel, ignoreSuppressionCondition?: INagSuppressionIgnore): string
```

* **suppressions** (<code>Array<[NagPackSuppression](#cdk-nag-nagpacksuppression)></code>)  The suppressions listed in the cdk-nag metadata.
* **ruleId** (<code>string</code>)  The id of the rule to ignore.
* **findingId** (<code>string</code>)  The id of the finding that is being checked.
* **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  The resource being evaluated.
* **level** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description*
* **ignoreSuppressionCondition** (<code>[INagSuppressionIgnore](#cdk-nag-inagsuppressionignore)</code>)  *No description*

__Returns__:
* <code>string</code>



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
  * **additionalNagLoggers** (<code>Array<[INagLogger](#cdk-nag-inaglogger)></code>)  Additional NagLoggers for logging rule validation outputs. __*Optional*__
  * **logIgnores** (<code>boolean</code>)  Whether or not to log triggered rules that have been suppressed as informational messages (default: false). __*Optional*__
  * **reports** (<code>boolean</code>)  Whether or not to generate CSV compliance reports for applied Stacks in the App's output directory (default: true). __*Optional*__
  * **suppressionIgnoreCondition** (<code>[INagSuppressionIgnore](#cdk-nag-inagsuppressionignore)</code>)  Conditionally prevent rules from being suppressed (default: no user provided condition). __*Optional*__
  * **verbose** (<code>boolean</code>)  Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false). __*Optional*__


### Methods


#### visit(node) <a id="cdk-nag-pcidss321checks-visit"></a>

All aspects can visit an IConstruct.

```ts
visit(node: IConstruct): void
```

* **node** (<code>[IConstruct](#constructs-iconstruct)</code>)  *No description*






## class SuppressionIgnoreAlways  <a id="cdk-nag-suppressionignorealways"></a>

Always ignore the suppression.

__Implements__: [INagSuppressionIgnore](#cdk-nag-inagsuppressionignore)

### Initializer




```ts
new SuppressionIgnoreAlways(triggerMessage: string)
```

* **triggerMessage** (<code>string</code>)  *No description*


### Methods


#### createMessage(_input) <a id="cdk-nag-suppressionignorealways-createmessage"></a>



```ts
createMessage(_input: SuppressionIgnoreInput): string
```

* **_input** (<code>[SuppressionIgnoreInput](#cdk-nag-suppressionignoreinput)</code>)  *No description*
  * **findingId** (<code>string</code>)  *No description* 
  * **reason** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 

__Returns__:
* <code>string</code>



## class SuppressionIgnoreAnd  <a id="cdk-nag-suppressionignoreand"></a>

Ignore the suppression if all of the given INagSuppressionIgnore return a non-empty message.

__Implements__: [INagSuppressionIgnore](#cdk-nag-inagsuppressionignore)

### Initializer




```ts
new SuppressionIgnoreAnd(...SuppressionIgnoreAnds: INagSuppressionIgnore[])
```

* **SuppressionIgnoreAnds** (<code>[INagSuppressionIgnore](#cdk-nag-inagsuppressionignore)</code>)  *No description*


### Methods


#### createMessage(input) <a id="cdk-nag-suppressionignoreand-createmessage"></a>



```ts
createMessage(input: SuppressionIgnoreInput): string
```

* **input** (<code>[SuppressionIgnoreInput](#cdk-nag-suppressionignoreinput)</code>)  *No description*
  * **findingId** (<code>string</code>)  *No description* 
  * **reason** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 

__Returns__:
* <code>string</code>



## class SuppressionIgnoreErrors  <a id="cdk-nag-suppressionignoreerrors"></a>

Ignore Suppressions for Rules with a NagMessageLevel.ERROR.

__Implements__: [INagSuppressionIgnore](#cdk-nag-inagsuppressionignore)

### Initializer




```ts
new SuppressionIgnoreErrors()
```



### Methods


#### createMessage(input) <a id="cdk-nag-suppressionignoreerrors-createmessage"></a>



```ts
createMessage(input: SuppressionIgnoreInput): string
```

* **input** (<code>[SuppressionIgnoreInput](#cdk-nag-suppressionignoreinput)</code>)  *No description*
  * **findingId** (<code>string</code>)  *No description* 
  * **reason** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 

__Returns__:
* <code>string</code>



## class SuppressionIgnoreNever  <a id="cdk-nag-suppressionignorenever"></a>

Don't ignore the suppression.

__Implements__: [INagSuppressionIgnore](#cdk-nag-inagsuppressionignore)

### Initializer




```ts
new SuppressionIgnoreNever()
```



### Methods


#### createMessage(_input) <a id="cdk-nag-suppressionignorenever-createmessage"></a>



```ts
createMessage(_input: SuppressionIgnoreInput): string
```

* **_input** (<code>[SuppressionIgnoreInput](#cdk-nag-suppressionignoreinput)</code>)  *No description*
  * **findingId** (<code>string</code>)  *No description* 
  * **reason** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 

__Returns__:
* <code>string</code>



## class SuppressionIgnoreOr  <a id="cdk-nag-suppressionignoreor"></a>

Ignore the suppression if any of the given INagSuppressionIgnore return a non-empty message.

__Implements__: [INagSuppressionIgnore](#cdk-nag-inagsuppressionignore)

### Initializer




```ts
new SuppressionIgnoreOr(...orSuppressionIgnores: INagSuppressionIgnore[])
```

* **orSuppressionIgnores** (<code>[INagSuppressionIgnore](#cdk-nag-inagsuppressionignore)</code>)  *No description*


### Methods


#### createMessage(input) <a id="cdk-nag-suppressionignoreor-createmessage"></a>



```ts
createMessage(input: SuppressionIgnoreInput): string
```

* **input** (<code>[SuppressionIgnoreInput](#cdk-nag-suppressionignoreinput)</code>)  *No description*
  * **findingId** (<code>string</code>)  *No description* 
  * **reason** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 

__Returns__:
* <code>string</code>



## interface IApplyRule  <a id="cdk-nag-iapplyrule"></a>


Interface for JSII interoperability for passing parameters and the Rule Callback to @applyRule method.

### Properties


Name | Type | Description 
-----|------|-------------
**explanation** | <code>string</code> | Why the rule exists.
**info** | <code>string</code> | Why the rule was triggered.
**level** | <code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code> | The annotations message level to apply to the rule if triggered.
**node** | <code>[CfnResource](#aws-cdk-lib-cfnresource)</code> | The CfnResource to check.
**ignoreSuppressionCondition**? | <code>[INagSuppressionIgnore](#cdk-nag-inagsuppressionignore)</code> | A condition in which a suppression should be ignored.<br/>__*Optional*__
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



## interface INagLogger  <a id="cdk-nag-inaglogger"></a>

__Implemented by__: [AnnotationsLogger](#cdk-nag-annotationslogger), [CsvNagReportLogger](#cdk-nag-csvnagreportlogger), [JsonNagReportLogger](#cdk-nag-jsonnagreportlogger)

Interface for creating NagSuppression Ignores.
### Methods


#### onCompliance(input) <a id="cdk-nag-inaglogger-oncompliance"></a>

Called when a CfnResource passes the compliance check for a given rule.

```ts
onCompliance(input: NagLoggerComplianceInput): void
```

* **input** (<code>[NagLoggerComplianceInput](#cdk-nag-nagloggercomplianceinput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 




#### onError(input) <a id="cdk-nag-inaglogger-onerror"></a>

Called when a rule throws an error during while validating a CfnResource for compliance.

```ts
onError(input: NagLoggerErrorInput): void
```

* **input** (<code>[NagLoggerErrorInput](#cdk-nag-nagloggererrorinput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 
  * **errorMessage** (<code>string</code>)  *No description* 




#### onNonCompliance(input) <a id="cdk-nag-inaglogger-onnoncompliance"></a>

Called when a CfnResource does not pass the compliance check for a given rule and the the rule violation is not suppressed by the user.

```ts
onNonCompliance(input: NagLoggerNonComplianceInput): void
```

* **input** (<code>[NagLoggerNonComplianceInput](#cdk-nag-nagloggernoncomplianceinput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 
  * **findingId** (<code>string</code>)  *No description* 




#### onNotApplicable(input) <a id="cdk-nag-inaglogger-onnotapplicable"></a>

Called when a rule does not apply to the given CfnResource.

```ts
onNotApplicable(input: NagLoggerNotApplicableInput): void
```

* **input** (<code>[NagLoggerNotApplicableInput](#cdk-nag-nagloggernotapplicableinput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 




#### onSuppressedError(input) <a id="cdk-nag-inaglogger-onsuppressederror"></a>

Called when a rule throws an error during while validating a CfnResource for compliance and the error is suppressed.

```ts
onSuppressedError(input: NagLoggerSuppressedErrorInput): void
```

* **input** (<code>[NagLoggerSuppressedErrorInput](#cdk-nag-nagloggersuppressederrorinput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 
  * **errorMessage** (<code>string</code>)  *No description* 
  * **errorSuppressionReason** (<code>string</code>)  *No description* 
  * **shouldLogIgnored** (<code>boolean</code>)  *No description* 




#### onSuppression(input) <a id="cdk-nag-inaglogger-onsuppression"></a>

Called when a CfnResource does not pass the compliance check for a given rule and the rule violation is suppressed by the user.

```ts
onSuppression(input: NagLoggerSuppressionInput): void
```

* **input** (<code>[NagLoggerSuppressionInput](#cdk-nag-nagloggersuppressioninput)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **verbose** (<code>boolean</code>)  *No description* 
  * **findingId** (<code>string</code>)  *No description* 
  * **shouldLogIgnored** (<code>boolean</code>)  *No description* 
  * **suppressionReason** (<code>string</code>)  *No description* 






## interface INagSuppressionIgnore  <a id="cdk-nag-inagsuppressionignore"></a>

__Implemented by__: [SuppressionIgnoreAlways](#cdk-nag-suppressionignorealways), [SuppressionIgnoreAnd](#cdk-nag-suppressionignoreand), [SuppressionIgnoreErrors](#cdk-nag-suppressionignoreerrors), [SuppressionIgnoreNever](#cdk-nag-suppressionignorenever), [SuppressionIgnoreOr](#cdk-nag-suppressionignoreor)

Interface for creating NagSuppression Ignores.
### Methods


#### createMessage(input) <a id="cdk-nag-inagsuppressionignore-createmessage"></a>



```ts
createMessage(input: SuppressionIgnoreInput): string
```

* **input** (<code>[SuppressionIgnoreInput](#cdk-nag-suppressionignoreinput)</code>)  *No description*
  * **findingId** (<code>string</code>)  *No description* 
  * **reason** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 

__Returns__:
* <code>string</code>



## struct NagLoggerComplianceInput  <a id="cdk-nag-nagloggercomplianceinput"></a>


Input for onCompliance method of an INagLogger.



Name | Type | Description 
-----|------|-------------
**nagPackName** | <code>string</code> | <span></span>
**resource** | <code>[CfnResource](#aws-cdk-lib-cfnresource)</code> | <span></span>
**ruleExplanation** | <code>string</code> | <span></span>
**ruleId** | <code>string</code> | <span></span>
**ruleInfo** | <code>string</code> | <span></span>
**ruleLevel** | <code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code> | <span></span>
**verbose** | <code>boolean</code> | <span></span>



## struct NagLoggerErrorInput  <a id="cdk-nag-nagloggererrorinput"></a>


Input for onError method of an INagLogger.



Name | Type | Description 
-----|------|-------------
**errorMessage** | <code>string</code> | <span></span>
**nagPackName** | <code>string</code> | <span></span>
**resource** | <code>[CfnResource](#aws-cdk-lib-cfnresource)</code> | <span></span>
**ruleExplanation** | <code>string</code> | <span></span>
**ruleId** | <code>string</code> | <span></span>
**ruleInfo** | <code>string</code> | <span></span>
**ruleLevel** | <code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code> | <span></span>
**verbose** | <code>boolean</code> | <span></span>



## struct NagLoggerInputBase  <a id="cdk-nag-nagloggerinputbase"></a>


Shared input for all INagLogger methods.



Name | Type | Description 
-----|------|-------------
**nagPackName** | <code>string</code> | <span></span>
**resource** | <code>[CfnResource](#aws-cdk-lib-cfnresource)</code> | <span></span>
**ruleExplanation** | <code>string</code> | <span></span>
**ruleId** | <code>string</code> | <span></span>
**ruleInfo** | <code>string</code> | <span></span>
**ruleLevel** | <code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code> | <span></span>
**verbose** | <code>boolean</code> | <span></span>



## struct NagLoggerNonComplianceInput  <a id="cdk-nag-nagloggernoncomplianceinput"></a>


Input for onNonCompliance method of an INagLogger.



Name | Type | Description 
-----|------|-------------
**findingId** | <code>string</code> | <span></span>
**nagPackName** | <code>string</code> | <span></span>
**resource** | <code>[CfnResource](#aws-cdk-lib-cfnresource)</code> | <span></span>
**ruleExplanation** | <code>string</code> | <span></span>
**ruleId** | <code>string</code> | <span></span>
**ruleInfo** | <code>string</code> | <span></span>
**ruleLevel** | <code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code> | <span></span>
**verbose** | <code>boolean</code> | <span></span>



## struct NagLoggerNotApplicableInput  <a id="cdk-nag-nagloggernotapplicableinput"></a>


Input for onNotApplicable method of an INagLogger.



Name | Type | Description 
-----|------|-------------
**nagPackName** | <code>string</code> | <span></span>
**resource** | <code>[CfnResource](#aws-cdk-lib-cfnresource)</code> | <span></span>
**ruleExplanation** | <code>string</code> | <span></span>
**ruleId** | <code>string</code> | <span></span>
**ruleInfo** | <code>string</code> | <span></span>
**ruleLevel** | <code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code> | <span></span>
**verbose** | <code>boolean</code> | <span></span>



## struct NagLoggerSuppressedErrorInput  <a id="cdk-nag-nagloggersuppressederrorinput"></a>


Input for onSuppressedError method of an INagLogger.



Name | Type | Description 
-----|------|-------------
**errorMessage** | <code>string</code> | <span></span>
**errorSuppressionReason** | <code>string</code> | <span></span>
**nagPackName** | <code>string</code> | <span></span>
**resource** | <code>[CfnResource](#aws-cdk-lib-cfnresource)</code> | <span></span>
**ruleExplanation** | <code>string</code> | <span></span>
**ruleId** | <code>string</code> | <span></span>
**ruleInfo** | <code>string</code> | <span></span>
**ruleLevel** | <code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code> | <span></span>
**shouldLogIgnored** | <code>boolean</code> | <span></span>
**verbose** | <code>boolean</code> | <span></span>



## struct NagLoggerSuppressionInput  <a id="cdk-nag-nagloggersuppressioninput"></a>


Input for onSuppression method of an INagLogger.



Name | Type | Description 
-----|------|-------------
**findingId** | <code>string</code> | <span></span>
**nagPackName** | <code>string</code> | <span></span>
**resource** | <code>[CfnResource](#aws-cdk-lib-cfnresource)</code> | <span></span>
**ruleExplanation** | <code>string</code> | <span></span>
**ruleId** | <code>string</code> | <span></span>
**ruleInfo** | <code>string</code> | <span></span>
**ruleLevel** | <code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code> | <span></span>
**shouldLogIgnored** | <code>boolean</code> | <span></span>
**suppressionReason** | <code>string</code> | <span></span>
**verbose** | <code>boolean</code> | <span></span>



## struct NagPackProps  <a id="cdk-nag-nagpackprops"></a>


Interface for creating a NagPack.



Name | Type | Description 
-----|------|-------------
**additionalNagLoggers**? | <code>Array<[INagLogger](#cdk-nag-inaglogger)></code> | Additional NagLoggers for logging rule validation outputs.<br/>__*Optional*__
**logIgnores**? | <code>boolean</code> | Whether or not to log triggered rules that have been suppressed as informational messages (default: false).<br/>__*Optional*__
**reports**? | <code>boolean</code> | Whether or not to generate CSV compliance reports for applied Stacks in the App's output directory (default: true).<br/>__*Optional*__
**suppressionIgnoreCondition**? | <code>[INagSuppressionIgnore](#cdk-nag-inagsuppressionignore)</code> | Conditionally prevent rules from being suppressed (default: no user provided condition).<br/>__*Optional*__
**verbose**? | <code>boolean</code> | Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false).<br/>__*Optional*__



## struct NagPackSuppression  <a id="cdk-nag-nagpacksuppression"></a>


Interface for creating a rule suppression.



Name | Type | Description 
-----|------|-------------
**id** | <code>string</code> | The id of the rule to ignore.
**reason** | <code>string</code> | The reason to ignore the rule (minimum 10 characters).
**appliesTo**? | <code>Array<string &#124; [RegexAppliesTo](#cdk-nag-regexappliesto)></code> | Rule specific granular suppressions.<br/>__*Optional*__



## struct NagReportLine  <a id="cdk-nag-nagreportline"></a>






Name | Type | Description 
-----|------|-------------
**compliance** | <code>string</code> | <span></span>
**exceptionReason** | <code>string</code> | <span></span>
**resourceId** | <code>string</code> | <span></span>
**ruleId** | <code>string</code> | <span></span>
**ruleInfo** | <code>string</code> | <span></span>
**ruleLevel** | <code>string</code> | <span></span>



## struct NagReportSchema  <a id="cdk-nag-nagreportschema"></a>






Name | Type | Description 
-----|------|-------------
**lines** | <code>Array<[NagReportLine](#cdk-nag-nagreportline)></code> | <span></span>



## struct RegexAppliesTo  <a id="cdk-nag-regexappliesto"></a>


A regular expression to apply to matching findings.



Name | Type | Description 
-----|------|-------------
**regex** | <code>string</code> | An ECMA-262 regex string.



## struct SuppressionIgnoreInput  <a id="cdk-nag-suppressionignoreinput"></a>


Information about the NagRule and the relevant NagSuppression for the INagSuppressionIgnore.



Name | Type | Description 
-----|------|-------------
**findingId** | <code>string</code> | <span></span>
**reason** | <code>string</code> | <span></span>
**resource** | <code>[CfnResource](#aws-cdk-lib-cfnresource)</code> | <span></span>
**ruleId** | <code>string</code> | <span></span>
**ruleLevel** | <code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code> | <span></span>



## enum NagMessageLevel  <a id="cdk-nag-nagmessagelevel"></a>

The severity level of the rule.

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


## enum NagRulePostValidationStates  <a id="cdk-nag-nagrulepostvalidationstates"></a>

States a rule can be in post validation.

Name | Description
-----|-----
**SUPPRESSED** |
**UNKNOWN** |


