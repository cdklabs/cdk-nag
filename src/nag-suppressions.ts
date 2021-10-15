/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { IConstruct, CfnResource, Stack } from '@aws-cdk/core';

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
}

/**
 * Helper class with methods to add cdk-nag suppressions to cdk resources
 */
export class NagSuppressions {
  /**
   * Add cdk-nag suppressions to the Stack
   * @param stack the Stack to apply the suppression to
   * @param suppressions a list of suppressions to apply to the stack
   */
  static addStackSuppressions(
    stack: Stack,
    suppressions: NagPackSuppression[]
  ): void {
    const newSuppressions = [];
    for (const suppression of suppressions) {
      if (suppression.reason.length >= 10) {
        newSuppressions.push(suppression);
      } else {
        throw Error(
          `${stack.node.id}: The cdk_nag suppression for ${suppression.id} must have a reason of 10 characters or more. See https://github.com/cdklabs/cdk-nag#suppressing-a-rule for information on suppressing a rule.`
        );
      }
    }
    const currentSuppressions = stack.templateOptions.metadata?.cdk_nag;
    if (Array.isArray(currentSuppressions?.rules_to_suppress)) {
      newSuppressions.unshift(...currentSuppressions.rules_to_suppress);
    }
    if (stack.templateOptions.metadata) {
      stack.templateOptions.metadata.cdk_nag = {
        rules_to_suppress: newSuppressions,
      };
    } else {
      stack.templateOptions.metadata = {
        cdk_nag: { rules_to_suppress: newSuppressions },
      };
    }
  }

  /**
   * Add cdk-nag suppressions to the Construct if it is a CfnResource
   * @param construct the IConstruct to apply the suppression to
   * @param suppressions a list of suppressions to apply to the resource
   * @param applyToChildren apply the suppressions to this construct and all of its children if they exist (default:false)
   */
  static addResourceSuppressions(
    construct: IConstruct,
    suppressions: NagPackSuppression[],
    applyToChildren: boolean = false
  ): void {
    const newSuppressions = [];
    for (const suppression of suppressions) {
      if (suppression.reason.length >= 10) {
        newSuppressions.push(suppression);
      } else {
        throw Error(
          `${construct.node.id}: The cdk_nag suppression for ${suppression.id} must have a reason of 10 characters or more. See https://github.com/cdklabs/cdk-nag#suppressing-a-rule for information on suppressing a rule.`
        );
      }
    }
    const constructs = applyToChildren ? construct.node.findAll() : [construct];
    for (const child of constructs) {
      if (child.node.defaultChild instanceof CfnResource) {
        const resource = child.node.defaultChild as CfnResource;
        const currentSuppressions = resource.getMetadata('cdk_nag');
        if (Array.isArray(currentSuppressions?.rules_to_suppress)) {
          newSuppressions.unshift(...currentSuppressions.rules_to_suppress);
        }
        resource.addMetadata('cdk_nag', {
          rules_to_suppress: newSuppressions,
        });
      }
    }
  }
}
