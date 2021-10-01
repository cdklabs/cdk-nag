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

  /**
   * Create a suppressible rule based on the provided logic
   * @param ruleId the id of the rule to ignore
   * @param info why the rule was triggered
   * @param explanation why the rule exists
   * @param level the annotations message level to apply to the rule if triggered
   * @param rule  the function logic for the rule
   * @param ignores ignores listed in cdkNag metadata
   * @param node the CfnResource to check
   */
  public applyRule(
    ruleId: string,
    info: string,
    explanation: string,
    level: NagMessageLevel,
    rule: (node: CfnResource) => boolean,
    ignores: any,
    node: CfnResource
  ): void {
    try {
      if (!this.ignoreRule(ignores, ruleId) && !rule(node)) {
        const message = this.createMessage(ruleId, info, explanation);
        if (level == NagMessageLevel.ERROR) {
          Annotations.of(node).addError(message);
        } else if (level == NagMessageLevel.WARN) {
          Annotations.of(node).addWarning(message);
        }
      }
    } catch (error) {
      if (!this.ignoreRule(ignores, VALIDATION_FAILURE_ID)) {
        const information = `'${ruleId}' failed to validate. This is generally caused by a parameter referencing an intrinsic function.'`;
        const message = this.createMessage(
          VALIDATION_FAILURE_ID,
          information,
          (error as Error).message
        );
        Annotations.of(node).addWarning(message);
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
    if (ignores) {
      for (let ignore of ignores) {
        if (
          ignore.id &&
          ignore.reason &&
          JSON.stringify(ignore.reason).length >= 10 &&
          ignore.id == ruleId
        ) {
          return true;
        }
      }
    }
    return false;
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
