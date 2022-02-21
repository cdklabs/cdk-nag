/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagPackSuppression } from '../models/nag-suppression';

interface NagCfnMetadata {
  rules_to_suppress: NagCfnSuppression[];
}

interface NagCfnSuppression extends Omit<NagPackSuppression, 'appliesTo'> {
  applies_to?: string[];
}

export class NagSuppressionHelper {
  static toCfnFormat(suppression: NagPackSuppression): NagCfnSuppression {
    const { appliesTo, ...result } = suppression;
    if (appliesTo) {
      (result as NagCfnSuppression).applies_to = appliesTo;
    }
    return result;
  }

  static toApiFormat(suppression: NagCfnSuppression): NagPackSuppression {
    const { applies_to, ...result } = suppression as any;
    if (applies_to) {
      (result as any).appliesTo = applies_to;
    }
    return result;
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
    return [...resourceIgnores, ...stackIgnores].map(
      NagSuppressionHelper.toApiFormat
    );
  }
}
