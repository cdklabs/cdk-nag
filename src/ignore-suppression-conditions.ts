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
   * Create a message to ignore a suppression or an empty string to allow a suppression.
   * @param resource The resource the suppression is applied to.
   * @param reason The reason given for the suppression.
   * @param ruleId The id of the rule to ignore.
   * @param findingId The id of the finding that is being checked.
   */
  createMessage(
    resource: CfnResource,
    reason: string,
    ruleId: string,
    findingId: string
  ): string;
}

/**
 * Ignore the suppression if all of the given INagSuppressionIgnore return a non-empty message
 */
export class SuppressionIgnoreAnd implements INagSuppressionIgnore {
  private andSuppressionIgnores: INagSuppressionIgnore[];

  constructor(...SuppressionIgnoreAnds: INagSuppressionIgnore[]) {
    if (SuppressionIgnoreAnds.length === 0) {
      throw new Error(
        'SuppressionIgnoreAnd needs at least one INagSuppressionIgnore'
      );
    }
    this.andSuppressionIgnores = SuppressionIgnoreAnds;
  }

  createMessage(
    resource: CfnResource,
    reason: string,
    ruleId: string,
    findingId: string
  ): string {
    let messages = [];
    for (const i of this.andSuppressionIgnores) {
      const m = i.createMessage(resource, reason, ruleId, findingId);
      messages.push(m);
      if (!m) {
        return '';
      }
    }
    return messages.join('\n\t');
  }
}

/**
 * Ignore the suppression if any of the given INagSuppressionIgnore return a non-empty message
 */
export class SuppressionIgnoreOr implements INagSuppressionIgnore {
  private SuppressionIgnoreOrs: INagSuppressionIgnore[];

  constructor(...orSuppressionIgnores: INagSuppressionIgnore[]) {
    if (orSuppressionIgnores.length === 0) {
      throw new Error(
        'SuppressionIgnoreOr needs at least one INagSuppressionIgnore'
      );
    }
    this.SuppressionIgnoreOrs = orSuppressionIgnores;
  }

  createMessage(
    resource: CfnResource,
    reason: string,
    ruleId: string,
    findingId: string
  ): string {
    let messages = [];
    for (const i of this.SuppressionIgnoreOrs) {
      const m = i.createMessage(resource, reason, ruleId, findingId);
      if (m) {
        messages.push(m);
      }
    }
    return messages ? messages.join('\n\t') : '';
  }
}

/**
 * Always ignore the suppression
 */
export class SuppressionIgnoreAlways implements INagSuppressionIgnore {
  private triggerMessage: string;
  constructor(triggerMessage: string) {
    if (triggerMessage.length === 0) {
      throw new Error(
        'provide a triggerMessage for the SuppressionIgnoreAlways'
      );
    }
    this.triggerMessage = triggerMessage;
  }
  createMessage(
    _resource: CfnResource,
    _reason: string,
    _ruleId: string,
    _findingId: string
  ): string {
    return this.triggerMessage;
  }
}
