/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { Buffer } from 'buffer';
import { CfnResource, Stack } from 'aws-cdk-lib';
import {
  NagPackSuppression,
  NagPackSuppressionAppliesTo,
} from '../models/nag-suppression';
import { VALIDATION_FAILURE_ID } from '../nag-rules';

interface NagCfnMetadata {
  rules_to_suppress: NagCfnSuppression[];
}

interface NagCfnSuppression extends Omit<NagPackSuppression, 'appliesTo'> {
  applies_to?: NagPackSuppressionAppliesTo[];
  is_reason_encoded?: boolean;
}

export class NagSuppressionHelper {
  static toCfnFormat(suppression: NagPackSuppression): NagCfnSuppression {
    const { appliesTo, reason, ...result } = suppression;

    if (appliesTo) {
      (result as NagCfnSuppression).applies_to = appliesTo;
    }
    if (
      [...reason].some((c) =>
        c.codePointAt(0) === undefined ? false : c.codePointAt(0)! > 255
      )
    ) {
      (result as NagCfnSuppression).is_reason_encoded = true;
      return { reason: Buffer.from(reason).toString('base64'), ...result };
    }
    return { reason, ...result };
  }

  static toApiFormat(suppression: NagCfnSuppression): NagPackSuppression {
    const { applies_to, reason, is_reason_encoded, ...result } = suppression;

    if (applies_to) {
      (result as any).appliesTo = applies_to;
    }
    if (is_reason_encoded) {
      return { reason: Buffer.from(reason, 'base64').toString(), ...result };
    }
    return { reason, ...result };
  }

  static addRulesToMetadata(
    metadata: NagCfnMetadata,
    rules: NagPackSuppression[]
  ): NagCfnMetadata {
    const { rules_to_suppress } = metadata ?? {};
    const serialisedRules = [
      ...(rules_to_suppress ?? []).map((r) => JSON.stringify(r)),
      ...rules
        .map(NagSuppressionHelper.toCfnFormat)
        .map((r) => JSON.stringify(r)),
    ];
    const deduplicatedRules = Array.from(new Set(serialisedRules));
    return { rules_to_suppress: deduplicatedRules.map((r) => JSON.parse(r)) };
  }

  static getSuppressions(node: CfnResource): NagPackSuppression[] {
    const resourceIgnores =
      node.getMetadata('cdk_nag')?.rules_to_suppress ?? [];
    const stackIgnores =
      Stack.of(node).templateOptions.metadata?.cdk_nag?.rules_to_suppress ?? [];
    const result = [...resourceIgnores, ...stackIgnores].map(
      NagSuppressionHelper.toApiFormat
    );
    NagSuppressionHelper.assertSuppressionsAreValid(node.node.id, result);
    return result;
  }

  static assertSuppressionsAreValid(
    id: string,
    suppressions: NagPackSuppression[]
  ): void {
    const errors = suppressions
      .map(NagSuppressionHelper.getSuppressionFormatError)
      .filter((errorMessage) => !!errorMessage);

    if (errors.length) {
      throw Error(
        `${id}: ${errors.join(
          ''
        )}\nSee https://github.com/cdklabs/cdk-nag#suppressing-a-rule for information on suppressing a rule.`
      );
    }
  }

  static doesApply(
    suppression: NagPackSuppression,
    ruleId: string,
    findingId: string
  ): boolean {
    // Specific handling to automatically suppress errors on suppressed rules
    // Only applies if suppression is not granular, as error handling is not scoped to individual findings
    if (
      ruleId === VALIDATION_FAILURE_ID &&
      findingId === suppression.id &&
      !suppression.appliesTo
    ) {
      return true;
    }

    if (ruleId !== suppression.id) {
      return false;
    }

    if (!suppression.appliesTo) {
      // the rule is not granular so it always applies
      return true;
    }

    if (
      findingId &&
      suppression.appliesTo.some((appliesTo) => {
        if (typeof appliesTo === 'string') {
          return appliesTo === findingId;
        } else {
          const regex = NagSuppressionHelper.toRegEx(appliesTo.regex);
          return regex.test(findingId);
        }
      })
    ) {
      return true;
    }

    return false;
  }

  private static getSuppressionFormatError(
    suppression: NagPackSuppression
  ): string {
    let errors = '';
    const finding = suppression.id.match(/\[.*\]/);
    if (finding) {
      errors += `The suppression 'id' contains a finding '${finding}. A finding must be suppressed using 'applies_to'.`;
    }
    if (suppression.reason.length < 10) {
      errors +=
        "The suppression must have a 'reason' of 10 characters or more.";
    }
    (suppression.appliesTo ?? []).forEach((appliesTo) => {
      if (typeof appliesTo !== 'string') {
        try {
          NagSuppressionHelper.toRegEx(appliesTo.regex);
        } catch (err) {
          errors += (err as Error).message;
        }
      }
    });
    return errors
      ? `\n\tError(s) detected in suppression with 'id' ${suppression.id}. ${errors}`
      : '';
  }

  private static toRegEx(s: string): RegExp {
    try {
      // verify that the regex is correctly formatted
      const m = s.match(/\/(.*)\/(.*)?/);
      if (!m) {
        throw new Error();
      }
      return new RegExp(m[1], m[2] || '');
    } catch {
      throw new Error(`Invalid regular expression [${s}]`);
    }
  }
}
