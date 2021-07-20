/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { IAspect, IConstruct } from '@aws-cdk/core';

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
   *
   */
  public abstract visit(node: IConstruct): void;

  /**
   * Check whether a specific rule should be ignored
   * @param ignores ignores listed in cdkNag metadata
   * @param ruleId the id of the rule to ignore
   * @returns boolean
   */
  public ignoreRule(ignores: any, ruleId: string): boolean {
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
  public createMessage(
    ruleId: string,
    info: string,
    explanation: string,
  ): string {
    let message = `${ruleId}: ${info}`;
    return this.verbose ? `${message} ${explanation}` : message;
  }
}
