/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
/**
 * Interface for creating a rule suppression
 */
export interface NagPackSuppression {
  /**
   * The id of the rule to ignore
   */
  readonly id: string;
  /**
   * The reason to ignore the rule (minimum 10 characters)
   */
  readonly reason: string;
  /**
   * Rule specific granular suppressions
   */
  readonly appliesTo?: string[];
}
