# API Reference

**Classes**

Name|Description
----|-----------
[AnnotationLogger](#cdk-nag-annotationlogger)|A NagLogger that outputs to the CDK Annotations system.
[AwsSolutionsChecks](#cdk-nag-awssolutionschecks)|Check Best practices based on AWS Solutions Security Matrix.
[HIPAASecurityChecks](#cdk-nag-hipaasecuritychecks)|Check for HIPAA Security compliance.
[NIST80053R4Checks](#cdk-nag-nist80053r4checks)|Check for NIST 800-53 rev 4 compliance.
[NIST80053R5Checks](#cdk-nag-nist80053r5checks)|Check for NIST 800-53 rev 5 compliance.
[NagPack](#cdk-nag-nagpack)|Base class for all rule packs.
[NagReportLogger](#cdk-nag-nagreportlogger)|A NagLogger that creates compliance reports.
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
[AnnotationLoggerProps](#cdk-nag-annotationloggerprops)|Props for the AnnotationLogger.
[NagLoggerBaseData](#cdk-nag-nagloggerbasedata)|Shared data for all INagLogger methods.
[NagLoggerComplianceData](#cdk-nag-nagloggercompliancedata)|Data for onCompliance method of an INagLogger.
[NagLoggerErrorData](#cdk-nag-nagloggererrordata)|Data for onError method of an INagLogger.
[NagLoggerNonComplianceData](#cdk-nag-nagloggernoncompliancedata)|Data for onNonCompliance method of an INagLogger.
[NagLoggerNotApplicableData](#cdk-nag-nagloggernotapplicabledata)|Data for onNotApplicable method of an INagLogger.
[NagLoggerSuppressedData](#cdk-nag-nagloggersuppresseddata)|Data for onSuppressed method of an INagLogger.
[NagLoggerSuppressedErrorData](#cdk-nag-nagloggersuppressederrordata)|Data for onSuppressedError method of an INagLogger.
[NagPackProps](#cdk-nag-nagpackprops)|Interface for creating a NagPack.
[NagPackSuppression](#cdk-nag-nagpacksuppression)|Interface for creating a rule suppression.
[NagReportLine](#cdk-nag-nagreportline)|*No description*
[NagReportLoggerProps](#cdk-nag-nagreportloggerprops)|Props for the NagReportLogger.
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
[NagReportFormat](#cdk-nag-nagreportformat)|Possible output formats of the NagReport.
[NagRuleCompliance](#cdk-nag-nagrulecompliance)|The compliance level of a resource in relation to a rule.
[NagRulePostValidationStates](#cdk-nag-nagrulepostvalidationstates)|Additional states a rule can be in post compliance validation.



## class AnnotationLogger  <a id="cdk-nag-annotationlogger"></a>

A NagLogger that outputs to the CDK Annotations system.

__Implements__: [INagLogger](#cdk-nag-inaglogger)

### Initializer




```ts
new AnnotationLogger(props?: AnnotationLoggerProps)
```

* **props** (<code>[AnnotationLoggerProps](#cdk-nag-annotationloggerprops)</code>)  *No description*
  * **logIgnores** (<code>boolean</code>)  Whether or not to log suppressed rule violations as informational messages (default: false). __*Optional*__
  * **verbose** (<code>boolean</code>)  Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages. __*Optional*__



### Properties


Name | Type | Description 
-----|------|-------------
**logIgnores** | <code>boolean</code> | <span></span>
**suppressionId** | <code>string</code> | <span></span>
**verbose** | <code>boolean</code> | <span></span>

### Methods


#### onCompliance(_data) <a id="cdk-nag-annotationlogger-oncompliance"></a>

Called when a CfnResource passes the compliance check for a given rule.

```ts
onCompliance(_data: NagLoggerComplianceData): void
```

* **_data** (<code>[NagLoggerComplianceData](#cdk-nag-nagloggercompliancedata)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 




#### onError(data) <a id="cdk-nag-annotationlogger-onerror"></a>

Called when a rule throws an error during while validating a CfnResource for compliance.

```ts
onError(data: NagLoggerErrorData): void
```

* **data** (<code>[NagLoggerErrorData](#cdk-nag-nagloggererrordata)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **errorMessage** (<code>string</code>)  *No description* 




#### onNonCompliance(data) <a id="cdk-nag-annotationlogger-onnoncompliance"></a>

Called when a CfnResource does not pass the compliance check for a given rule and the the rule violation is not suppressed by the user.

```ts
onNonCompliance(data: NagLoggerNonComplianceData): void
```

* **data** (<code>[NagLoggerNonComplianceData](#cdk-nag-nagloggernoncompliancedata)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **findingId** (<code>string</code>)  *No description* 




#### onNotApplicable(_data) <a id="cdk-nag-annotationlogger-onnotapplicable"></a>

Called when a rule does not apply to the given CfnResource.

```ts
onNotApplicable(_data: NagLoggerNotApplicableData): void
```

* **_data** (<code>[NagLoggerNotApplicableData](#cdk-nag-nagloggernotapplicabledata)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 




#### onSuppressed(data) <a id="cdk-nag-annotationlogger-onsuppressed"></a>

Called when a CfnResource does not pass the compliance check for a given rule and the rule violation is suppressed by the user.

```ts
onSuppressed(data: NagLoggerSuppressedData): void
```

* **data** (<code>[NagLoggerSuppressedData](#cdk-nag-nagloggersuppresseddata)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **findingId** (<code>string</code>)  *No description* 
  * **suppressionReason** (<code>string</code>)  *No description* 




#### onSuppressedError(data) <a id="cdk-nag-annotationlogger-onsuppressederror"></a>

Called when a rule throws an error during while validating a CfnResource for compliance and the error is suppressed.

```ts
onSuppressedError(data: NagLoggerSuppressedErrorData): void
```

* **data** (<code>[NagLoggerSuppressedErrorData](#cdk-nag-nagloggersuppressederrordata)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **errorMessage** (<code>string</code>)  *No description* 
  * **errorSuppressionReason** (<code>string</code>)  *No description* 




#### protected createMessage(ruleId, findingId, ruleInfo, ruleExplanation, verbose) <a id="cdk-nag-annotationlogger-createmessage"></a>



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
  * **additionalLoggers** (<code>Array<[INagLogger](#cdk-nag-inaglogger)></code>)  Additional NagLoggers for logging rule validation outputs. __*Optional*__
  * **logIgnores** (<code>boolean</code>)  Whether or not to log suppressed rule violations as informational messages (default: false). __*Optional*__
  * **reportFormats** (<code>Array<[NagReportFormat](#cdk-nag-nagreportformat)></code>)  If reports are enabled, the output formats of compliance reports in the App's output directory (default: only CSV). __*Optional*__
  * **reports** (<code>boolean</code>)  Whether or not to generate compliance reports for applied Stacks in the App's output directory (default: true). __*Optional*__
  * **suppressionIgnoreCondition** (<code>[INagSuppressionIgnore](#cdk-nag-inagsuppressionignore)</code>)  Conditionally prevent rules from being suppressed (default: no user provided condition). __*Optional*__
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
  * **additionalLoggers** (<code>Array<[INagLogger](#cdk-nag-inaglogger)></code>)  Additional NagLoggers for logging rule validation outputs. __*Optional*__
  * **logIgnores** (<code>boolean</code>)  Whether or not to log suppressed rule violations as informational messages (default: false). __*Optional*__
  * **reportFormats** (<code>Array<[NagReportFormat](#cdk-nag-nagreportformat)></code>)  If reports are enabled, the output formats of compliance reports in the App's output directory (default: only CSV). __*Optional*__
  * **reports** (<code>boolean</code>)  Whether or not to generate compliance reports for applied Stacks in the App's output directory (default: true). __*Optional*__
  * **suppressionIgnoreCondition** (<code>[INagSuppressionIgnore](#cdk-nag-inagsuppressionignore)</code>)  Conditionally prevent rules from being suppressed (default: no user provided condition). __*Optional*__
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
  * **additionalLoggers** (<code>Array<[INagLogger](#cdk-nag-inaglogger)></code>)  Additional NagLoggers for logging rule validation outputs. __*Optional*__
  * **logIgnores** (<code>boolean</code>)  Whether or not to log suppressed rule violations as informational messages (default: false). __*Optional*__
  * **reportFormats** (<code>Array<[NagReportFormat](#cdk-nag-nagreportformat)></code>)  If reports are enabled, the output formats of compliance reports in the App's output directory (default: only CSV). __*Optional*__
  * **reports** (<code>boolean</code>)  Whether or not to generate compliance reports for applied Stacks in the App's output directory (default: true). __*Optional*__
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
  * **additionalLoggers** (<code>Array<[INagLogger](#cdk-nag-inaglogger)></code>)  Additional NagLoggers for logging rule validation outputs. __*Optional*__
  * **logIgnores** (<code>boolean</code>)  Whether or not to log suppressed rule violations as informational messages (default: false). __*Optional*__
  * **reportFormats** (<code>Array<[NagReportFormat](#cdk-nag-nagreportformat)></code>)  If reports are enabled, the output formats of compliance reports in the App's output directory (default: only CSV). __*Optional*__
  * **reports** (<code>boolean</code>)  Whether or not to generate compliance reports for applied Stacks in the App's output directory (default: true). __*Optional*__
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
  * **additionalLoggers** (<code>Array<[INagLogger](#cdk-nag-inaglogger)></code>)  Additional NagLoggers for logging rule validation outputs. __*Optional*__
  * **logIgnores** (<code>boolean</code>)  Whether or not to log suppressed rule violations as informational messages (default: false). __*Optional*__
  * **reportFormats** (<code>Array<[NagReportFormat](#cdk-nag-nagreportformat)></code>)  If reports are enabled, the output formats of compliance reports in the App's output directory (default: only CSV). __*Optional*__
  * **reports** (<code>boolean</code>)  Whether or not to generate compliance reports for applied Stacks in the App's output directory (default: true). __*Optional*__
  * **suppressionIgnoreCondition** (<code>[INagSuppressionIgnore](#cdk-nag-inagsuppressionignore)</code>)  Conditionally prevent rules from being suppressed (default: no user provided condition). __*Optional*__
  * **verbose** (<code>boolean</code>)  Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages (default: false). __*Optional*__



### Properties


Name | Type | Description 
-----|------|-------------
**loggers** | <code>Array<[INagLogger](#cdk-nag-inaglogger)></code> | <span></span>
**packName** | <code>string</code> | <span></span>
**readPackName** | <code>string</code> | <span></span>
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



## class NagReportLogger  <a id="cdk-nag-nagreportlogger"></a>

A NagLogger that creates compliance reports.

__Implements__: [INagLogger](#cdk-nag-inaglogger)

### Initializer




```ts
new NagReportLogger(props: NagReportLoggerProps)
```

* **props** (<code>[NagReportLoggerProps](#cdk-nag-nagreportloggerprops)</code>)  *No description*
  * **formats** (<code>Array<[NagReportFormat](#cdk-nag-nagreportformat)></code>)  *No description* 



### Properties


Name | Type | Description 
-----|------|-------------
**formats** | <code>Array<[NagReportFormat](#cdk-nag-nagreportformat)></code> | <span></span>

### Methods


#### getFormatStacks(format) <a id="cdk-nag-nagreportlogger-getformatstacks"></a>



```ts
getFormatStacks(format: NagReportFormat): Array<string>
```

* **format** (<code>[NagReportFormat](#cdk-nag-nagreportformat)</code>)  *No description*

__Returns__:
* <code>Array<string></code>

#### onCompliance(data) <a id="cdk-nag-nagreportlogger-oncompliance"></a>

Called when a CfnResource passes the compliance check for a given rule.

```ts
onCompliance(data: NagLoggerComplianceData): void
```

* **data** (<code>[NagLoggerComplianceData](#cdk-nag-nagloggercompliancedata)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 




#### onError(data) <a id="cdk-nag-nagreportlogger-onerror"></a>

Called when a rule throws an error during while validating a CfnResource for compliance.

```ts
onError(data: NagLoggerErrorData): void
```

* **data** (<code>[NagLoggerErrorData](#cdk-nag-nagloggererrordata)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **errorMessage** (<code>string</code>)  *No description* 




#### onNonCompliance(data) <a id="cdk-nag-nagreportlogger-onnoncompliance"></a>

Called when a CfnResource does not pass the compliance check for a given rule and the the rule violation is not suppressed by the user.

```ts
onNonCompliance(data: NagLoggerNonComplianceData): void
```

* **data** (<code>[NagLoggerNonComplianceData](#cdk-nag-nagloggernoncompliancedata)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **findingId** (<code>string</code>)  *No description* 




#### onNotApplicable(data) <a id="cdk-nag-nagreportlogger-onnotapplicable"></a>

Called when a rule does not apply to the given CfnResource.

```ts
onNotApplicable(data: NagLoggerNotApplicableData): void
```

* **data** (<code>[NagLoggerNotApplicableData](#cdk-nag-nagloggernotapplicabledata)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 




#### onSuppressed(data) <a id="cdk-nag-nagreportlogger-onsuppressed"></a>

Called when a CfnResource does not pass the compliance check for a given rule and the rule violation is suppressed by the user.

```ts
onSuppressed(data: NagLoggerSuppressedData): void
```

* **data** (<code>[NagLoggerSuppressedData](#cdk-nag-nagloggersuppresseddata)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **findingId** (<code>string</code>)  *No description* 
  * **suppressionReason** (<code>string</code>)  *No description* 




#### onSuppressedError(data) <a id="cdk-nag-nagreportlogger-onsuppressederror"></a>

Called when a rule throws an error during while validating a CfnResource for compliance and the error is suppressed.

```ts
onSuppressedError(data: NagLoggerSuppressedErrorData): void
```

* **data** (<code>[NagLoggerSuppressedErrorData](#cdk-nag-nagloggersuppressederrordata)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **errorMessage** (<code>string</code>)  *No description* 
  * **errorSuppressionReason** (<code>string</code>)  *No description* 




#### protected initializeStackReport(data) <a id="cdk-nag-nagreportlogger-initializestackreport"></a>

Initialize the report for the rule pack's compliance report for the resource's Stack if it doesn't exist.

```ts
protected initializeStackReport(data: NagLoggerBaseData): void
```

* **data** (<code>[NagLoggerBaseData](#cdk-nag-nagloggerbasedata)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 




#### protected writeToStackComplianceReport(data, compliance) <a id="cdk-nag-nagreportlogger-writetostackcompliancereport"></a>



```ts
protected writeToStackComplianceReport(data: NagLoggerBaseData, compliance: NagRuleCompliance &#124; NagRulePostValidationStates): void
```

* **data** (<code>[NagLoggerBaseData](#cdk-nag-nagloggerbasedata)</code>)  *No description*
* **compliance** (<code>[NagRuleCompliance](#cdk-nag-nagrulecompliance) &#124; [NagRulePostValidationStates](#cdk-nag-nagrulepostvalidationstates)</code>)  *No description*






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
  * **additionalLoggers** (<code>Array<[INagLogger](#cdk-nag-inaglogger)></code>)  Additional NagLoggers for logging rule validation outputs. __*Optional*__
  * **logIgnores** (<code>boolean</code>)  Whether or not to log suppressed rule violations as informational messages (default: false). __*Optional*__
  * **reportFormats** (<code>Array<[NagReportFormat](#cdk-nag-nagreportformat)></code>)  If reports are enabled, the output formats of compliance reports in the App's output directory (default: only CSV). __*Optional*__
  * **reports** (<code>boolean</code>)  Whether or not to generate compliance reports for applied Stacks in the App's output directory (default: true). __*Optional*__
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



## struct AnnotationLoggerProps  <a id="cdk-nag-annotationloggerprops"></a>


Props for the AnnotationLogger.



Name | Type | Description 
-----|------|-------------
**logIgnores**? | <code>boolean</code> | Whether or not to log suppressed rule violations as informational messages (default: false).<br/>__*Optional*__
**verbose**? | <code>boolean</code> | Whether or not to enable extended explanatory descriptions on warning, error, and logged ignore messages.<br/>__*Optional*__



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

__Implemented by__: [AnnotationLogger](#cdk-nag-annotationlogger), [NagReportLogger](#cdk-nag-nagreportlogger)

Interface for creating NagSuppression Ignores.
### Methods


#### onCompliance(data) <a id="cdk-nag-inaglogger-oncompliance"></a>

Called when a CfnResource passes the compliance check for a given rule.

```ts
onCompliance(data: NagLoggerComplianceData): void
```

* **data** (<code>[NagLoggerComplianceData](#cdk-nag-nagloggercompliancedata)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 




#### onError(data) <a id="cdk-nag-inaglogger-onerror"></a>

Called when a rule throws an error during while validating a CfnResource for compliance.

```ts
onError(data: NagLoggerErrorData): void
```

* **data** (<code>[NagLoggerErrorData](#cdk-nag-nagloggererrordata)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **errorMessage** (<code>string</code>)  *No description* 




#### onNonCompliance(data) <a id="cdk-nag-inaglogger-onnoncompliance"></a>

Called when a CfnResource does not pass the compliance check for a given rule and the the rule violation is not suppressed by the user.

```ts
onNonCompliance(data: NagLoggerNonComplianceData): void
```

* **data** (<code>[NagLoggerNonComplianceData](#cdk-nag-nagloggernoncompliancedata)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **findingId** (<code>string</code>)  *No description* 




#### onNotApplicable(data) <a id="cdk-nag-inaglogger-onnotapplicable"></a>

Called when a rule does not apply to the given CfnResource.

```ts
onNotApplicable(data: NagLoggerNotApplicableData): void
```

* **data** (<code>[NagLoggerNotApplicableData](#cdk-nag-nagloggernotapplicabledata)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 




#### onSuppressed(data) <a id="cdk-nag-inaglogger-onsuppressed"></a>

Called when a CfnResource does not pass the compliance check for a given rule and the rule violation is suppressed by the user.

```ts
onSuppressed(data: NagLoggerSuppressedData): void
```

* **data** (<code>[NagLoggerSuppressedData](#cdk-nag-nagloggersuppresseddata)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **findingId** (<code>string</code>)  *No description* 
  * **suppressionReason** (<code>string</code>)  *No description* 




#### onSuppressedError(data) <a id="cdk-nag-inaglogger-onsuppressederror"></a>

Called when a rule throws an error during while validating a CfnResource for compliance and the error is suppressed.

```ts
onSuppressedError(data: NagLoggerSuppressedErrorData): void
```

* **data** (<code>[NagLoggerSuppressedErrorData](#cdk-nag-nagloggersuppressederrordata)</code>)  *No description*
  * **nagPackName** (<code>string</code>)  *No description* 
  * **resource** (<code>[CfnResource](#aws-cdk-lib-cfnresource)</code>)  *No description* 
  * **ruleExplanation** (<code>string</code>)  *No description* 
  * **ruleId** (<code>string</code>)  *No description* 
  * **ruleInfo** (<code>string</code>)  *No description* 
  * **ruleLevel** (<code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code>)  *No description* 
  * **errorMessage** (<code>string</code>)  *No description* 
  * **errorSuppressionReason** (<code>string</code>)  *No description* 






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



## struct NagLoggerBaseData  <a id="cdk-nag-nagloggerbasedata"></a>


Shared data for all INagLogger methods.



Name | Type | Description 
-----|------|-------------
**nagPackName** | <code>string</code> | <span></span>
**resource** | <code>[CfnResource](#aws-cdk-lib-cfnresource)</code> | <span></span>
**ruleExplanation** | <code>string</code> | <span></span>
**ruleId** | <code>string</code> | <span></span>
**ruleInfo** | <code>string</code> | <span></span>
**ruleLevel** | <code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code> | <span></span>



## struct NagLoggerComplianceData  <a id="cdk-nag-nagloggercompliancedata"></a>


Data for onCompliance method of an INagLogger.



Name | Type | Description 
-----|------|-------------
**nagPackName** | <code>string</code> | <span></span>
**resource** | <code>[CfnResource](#aws-cdk-lib-cfnresource)</code> | <span></span>
**ruleExplanation** | <code>string</code> | <span></span>
**ruleId** | <code>string</code> | <span></span>
**ruleInfo** | <code>string</code> | <span></span>
**ruleLevel** | <code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code> | <span></span>



## struct NagLoggerErrorData  <a id="cdk-nag-nagloggererrordata"></a>


Data for onError method of an INagLogger.



Name | Type | Description 
-----|------|-------------
**errorMessage** | <code>string</code> | <span></span>
**nagPackName** | <code>string</code> | <span></span>
**resource** | <code>[CfnResource](#aws-cdk-lib-cfnresource)</code> | <span></span>
**ruleExplanation** | <code>string</code> | <span></span>
**ruleId** | <code>string</code> | <span></span>
**ruleInfo** | <code>string</code> | <span></span>
**ruleLevel** | <code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code> | <span></span>



## struct NagLoggerNonComplianceData  <a id="cdk-nag-nagloggernoncompliancedata"></a>


Data for onNonCompliance method of an INagLogger.



Name | Type | Description 
-----|------|-------------
**findingId** | <code>string</code> | <span></span>
**nagPackName** | <code>string</code> | <span></span>
**resource** | <code>[CfnResource](#aws-cdk-lib-cfnresource)</code> | <span></span>
**ruleExplanation** | <code>string</code> | <span></span>
**ruleId** | <code>string</code> | <span></span>
**ruleInfo** | <code>string</code> | <span></span>
**ruleLevel** | <code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code> | <span></span>



## struct NagLoggerNotApplicableData  <a id="cdk-nag-nagloggernotapplicabledata"></a>


Data for onNotApplicable method of an INagLogger.



Name | Type | Description 
-----|------|-------------
**nagPackName** | <code>string</code> | <span></span>
**resource** | <code>[CfnResource](#aws-cdk-lib-cfnresource)</code> | <span></span>
**ruleExplanation** | <code>string</code> | <span></span>
**ruleId** | <code>string</code> | <span></span>
**ruleInfo** | <code>string</code> | <span></span>
**ruleLevel** | <code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code> | <span></span>



## struct NagLoggerSuppressedData  <a id="cdk-nag-nagloggersuppresseddata"></a>


Data for onSuppressed method of an INagLogger.



Name | Type | Description 
-----|------|-------------
**findingId** | <code>string</code> | <span></span>
**nagPackName** | <code>string</code> | <span></span>
**resource** | <code>[CfnResource](#aws-cdk-lib-cfnresource)</code> | <span></span>
**ruleExplanation** | <code>string</code> | <span></span>
**ruleId** | <code>string</code> | <span></span>
**ruleInfo** | <code>string</code> | <span></span>
**ruleLevel** | <code>[NagMessageLevel](#cdk-nag-nagmessagelevel)</code> | <span></span>
**suppressionReason** | <code>string</code> | <span></span>



## struct NagLoggerSuppressedErrorData  <a id="cdk-nag-nagloggersuppressederrordata"></a>


Data for onSuppressedError method of an INagLogger.



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



## struct NagPackProps  <a id="cdk-nag-nagpackprops"></a>


Interface for creating a NagPack.



Name | Type | Description 
-----|------|-------------
**additionalLoggers**? | <code>Array<[INagLogger](#cdk-nag-inaglogger)></code> | Additional NagLoggers for logging rule validation outputs.<br/>__*Optional*__
**logIgnores**? | <code>boolean</code> | Whether or not to log suppressed rule violations as informational messages (default: false).<br/>__*Optional*__
**reportFormats**? | <code>Array<[NagReportFormat](#cdk-nag-nagreportformat)></code> | If reports are enabled, the output formats of compliance reports in the App's output directory (default: only CSV).<br/>__*Optional*__
**reports**? | <code>boolean</code> | Whether or not to generate compliance reports for applied Stacks in the App's output directory (default: true).<br/>__*Optional*__
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



## struct NagReportLoggerProps  <a id="cdk-nag-nagreportloggerprops"></a>


Props for the NagReportLogger.



Name | Type | Description 
-----|------|-------------
**formats** | <code>Array<[NagReportFormat](#cdk-nag-nagreportformat)></code> | <span></span>



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


## enum NagReportFormat  <a id="cdk-nag-nagreportformat"></a>

Possible output formats of the NagReport.

Name | Description
-----|-----
**CSV** |
**JSON** |


## enum NagRuleCompliance  <a id="cdk-nag-nagrulecompliance"></a>

The compliance level of a resource in relation to a rule.

Name | Description
-----|-----
**COMPLIANT** |
**NON_COMPLIANT** |
**NOT_APPLICABLE** |


## enum NagRulePostValidationStates  <a id="cdk-nag-nagrulepostvalidationstates"></a>

Additional states a rule can be in post compliance validation.

Name | Description
-----|-----
**SUPPRESSED** |
**UNKNOWN** |


