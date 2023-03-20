/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnResource } from 'aws-cdk-lib';
import { NagMessageLevel } from './nag-rules';

/**
 * Information about the NagRule and the relevant NagSuppression for the INagSuppressionIgnore
 * @param resource The resource the suppression is applied to.
 * @param reason The reason given for the suppression.
 * @param ruleId The id of the rule to ignore.
 * @param findingId The id of the finding that is being checked.
 * @param ruleLevel The severity level of the rule.
 */
export interface SuppressionIgnoreInput {
  readonly resource: CfnResource;
  readonly reason: string;
  readonly ruleId: string;
  readonly findingId: string;
  readonly ruleLevel: NagMessageLevel;
}

/**
 * Interface for creating NagSuppression Ignores
 */
export interface INagSuppressionIgnore {
  createMessage(input: SuppressionIgnoreInput): string;
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

  createMessage(input: SuppressionIgnoreInput): string {
    let messages = [];
    for (const i of this.andSuppressionIgnores) {
      const m = i.createMessage(input);
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

  createMessage(input: SuppressionIgnoreInput): string {
    let messages = [];
    for (const i of this.SuppressionIgnoreOrs) {
      const m = i.createMessage(input);
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
  createMessage(_input: SuppressionIgnoreInput): string {
    return this.triggerMessage;
  }
}

/**
 * Don't ignore the suppression
 */
export class SuppressionIgnoreNever implements INagSuppressionIgnore {
  createMessage(_input: SuppressionIgnoreInput): string {
    return '';
  }
}

/**
 * Ignore Suppressions for Rules with a NagMessageLevel.ERROR
 */
export class SuppressionIgnoreErrors implements INagSuppressionIgnore {
  createMessage(input: SuppressionIgnoreInput): string {
    return input.ruleLevel == NagMessageLevel.ERROR
      ? `${input.ruleId} is categorized as an ERROR and may not be suppressed`
      : '';
  }
}
