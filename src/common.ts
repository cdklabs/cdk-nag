/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { IAspect, IConstruct, Annotations, CfnResource } from '@aws-cdk/core';

const VALIDATION_FAILURE_ID = 'CdkNagValidationFailure';

/**
 * Interface for creating a Nag rule set
 */
export interface NagPackProps {
  /**
   * Whether or not to enable extended explanatory descriptions on warning and error messages.
   */
  readonly verbose?: boolean;
}

/**
 * Interface for JSII interoperability for passing parameters and the Rule Callback to @applyRule method
 */

export interface IApplyRule {
  /**
   * The id of the rule to ignore
   */
  ruleId: string;
  /**
   * Why the rule was triggered
   */
  info: string;
  /**
   * Why the rule exists
   */
  explanation: string;
  /**
   * The annotations message level to apply to the rule if triggered
   */
  level: NagMessageLevel;
  /**
   * Ignores listed in cdkNag metadata
   */
  ignores: any;
  /**
   * The CfnResource to check
   */
  node: CfnResource;
  /**
   * The callback to the rule
   * @param node the CfnResource to check
   */
  rule(node: CfnResource): boolean;
}

/**
 * The level of the message that the rule applies
 */
export enum NagMessageLevel {
  WARN,
  ERROR,
}

/**
 * Base class for all rule sets
 */
export abstract class NagPack implements IAspect {
  protected verbose: boolean;

  constructor(props?: NagPackProps) {
    this.verbose =
      props == undefined || props.verbose == undefined ? false : props.verbose;
  }

  /**
   * All aspects can visit an IConstruct.
   */
  public abstract visit(node: IConstruct): void;

  public applyRule(params: IApplyRule): void {
    try {
      if (
        !this.ignoreRule(params.ignores, params.ruleId) &&
        !params.rule(params.node)
      ) {
        const message = this.createMessage(
          params.ruleId,
          params.info,
          params.explanation
        );
        if (params.level == NagMessageLevel.ERROR) {
          Annotations.of(params.node).addError(message);
        } else if (params.level == NagMessageLevel.WARN) {
          Annotations.of(params.node).addWarning(message);
        }
      }
    } catch (error) {
      if (!this.ignoreRule(params.ignores, VALIDATION_FAILURE_ID)) {
        const information = `'${params.ruleId}' threw an error during validation. This is generally caused by a parameter referencing an intrinsic function. For more details enable verbose logging.'`;
        const message = this.createMessage(
          VALIDATION_FAILURE_ID,
          information,
          (error as Error).message
        );
        Annotations.of(params.node).addWarning(message);
      }
    }
  }

  /**
   * Check whether a specific rule should be ignored
   * @param ignores ignores listed in cdkNag metadata
   * @param ruleId the id of the rule to ignore
   * @returns boolean
   */
  private ignoreRule(ignores: any, ruleId: string): boolean {
    try {
      if (ignores) {
        for (let ignore of ignores) {
          if (
            ignore.id &&
            ignore.reason &&
            JSON.stringify(ignore.reason).length >= 10
          ) {
            if (ignore.id == ruleId) {
              return true;
            }
          } else {
            throw Error();
          }
        }
      }
      return false;
    } catch {
      throw Error(
        'Improperly formatted cdk_nag rule suppression detected. See https://github.com/cdklabs/cdk-nag#suppressing-a-rule for information on suppressing a rule.'
      );
    }
  }

  /**
   * The message to output to the console when a rule is triggered
   * @param ruleId the id of the rule
   * @param info why the rule was triggered
   * @param explanation why the rule exists
   * @returns string
   */
  private createMessage(
    ruleId: string,
    info: string,
    explanation: string
  ): string {
    let message = `${ruleId}: ${info}`;
    return this.verbose ? `${message} ${explanation}` : message;
  }
}
