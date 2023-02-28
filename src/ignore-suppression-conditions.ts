/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CfnResource } from 'aws-cdk-lib';

/**
 * Interface for creating NagSuppression Ignores
 */
export interface INagSuppressionIgnore {
  /**
   * The informational message when a suppression is ignored
   */
  readonly triggerMessage: string;

  /**
   * Whether or not a suppression should be ignored
   * @param resource The resource the suppression is applied to.
   * @param reason The reason given for the suppression.
   * @param ruleId The id of the rule to ignore.
   * @param findingId The id of the finding that is being checked.
   */
  shouldIgnore(
    resource: CfnResource,
    reason: string,
    ruleId: string,
    findingId: string
  ): boolean;
}

/**
 * Ignore Suppression if it matches all of the given NagSuppression Ignores
 */
export class SuppressionIgnoreAnd implements INagSuppressionIgnore {
  readonly triggerMessage: string;
  private andSuppressionIgnores: INagSuppressionIgnore[];

  constructor(...andSuppressionIgnores: INagSuppressionIgnore[]) {
    if (andSuppressionIgnores.length === 0) {
      throw new Error(
        'andSuppressionIgnores needs at least one NagSuppressionIgnore'
      );
    }
    this.andSuppressionIgnores = andSuppressionIgnores;
    this.triggerMessage = this.andSuppressionIgnores
      .map((i) => i.triggerMessage)
      .join('\nAND\n');
  }

  shouldIgnore(
    resource: CfnResource,
    reason: string,
    ruleId: string,
    findingId: string
  ): boolean {
    for (const i of this.andSuppressionIgnores) {
      if (!i.shouldIgnore(resource, reason, ruleId, findingId)) {
        return false;
      }
    }
    return true;
  }
}

/**
 * Ignore Suppression if it matches at least one of the given NagSuppression Ignores
 */
export class SuppressionIgnoreOr implements INagSuppressionIgnore {
  readonly triggerMessage: string;
  private orSuppressionIgnores: INagSuppressionIgnore[];

  constructor(...orSuppressionIgnores: INagSuppressionIgnore[]) {
    if (orSuppressionIgnores.length === 0) {
      throw new Error(
        'orSuppressionIgnores needs at least one NagSuppressionIgnore'
      );
    }
    this.orSuppressionIgnores = orSuppressionIgnores;
    this.triggerMessage = this.orSuppressionIgnores
      .map((i) => i.triggerMessage)
      .join('\nOR\n');
  }

  shouldIgnore(
    resource: CfnResource,
    reason: string,
    ruleId: string,
    findingId: string
  ): boolean {
    for (const i of this.orSuppressionIgnores) {
      if (i.shouldIgnore(resource, reason, ruleId, findingId)) {
        return true;
      }
    }
    return false;
  }
}

/**
 * Always ignore the suppression
 */
export class SuppressionIgnoreAlways implements INagSuppressionIgnore {
  readonly triggerMessage: string;
  constructor(triggerMessage: string) {
    if (triggerMessage.length === 0) {
      throw new Error('provide a triggerMessage for the AlwaysIgnore');
    }
    this.triggerMessage = triggerMessage;
  }
  shouldIgnore(
    _resource: CfnResource,
    _reason: string,
    _ruleId: string,
    _findingId: string
  ): boolean {
    return true;
  }
}
