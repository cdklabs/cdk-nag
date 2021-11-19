/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnResource, Stack } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';

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
   * Apply cdk-nag suppressions to a Stack and optionally nested stacks
   * @param stack The Stack to apply the suppression to
   * @param suppressions A list of suppressions to apply to the stack
   * @param applyToNestedStacks Apply the suppressions to children stacks (default:false)
   */
  static addStackSuppressions(
    stack: Stack,
    suppressions: NagPackSuppression[],
    applyToNestedStacks: boolean = false
  ): void {
    const stacks = applyToNestedStacks
      ? stack.node.findAll().filter((x): x is Stack => x instanceof Stack)
      : [stack];
    stacks.forEach((s) => {
      const newSuppressions = [];
      for (const suppression of suppressions) {
        if (suppression.reason.length >= 10) {
          newSuppressions.push(suppression);
        } else {
          throw Error(
            `${s.node.id}: The cdk_nag suppression for ${suppression.id} must have a reason of 10 characters or more. See https://github.com/cdklabs/cdk-nag#suppressing-a-rule for information on suppressing a rule.`
          );
        }
      }
      const currentSuppressions = s.templateOptions.metadata?.cdk_nag;
      if (Array.isArray(currentSuppressions?.rules_to_suppress)) {
        newSuppressions.unshift(...currentSuppressions.rules_to_suppress);
      }
      if (s.templateOptions.metadata) {
        s.templateOptions.metadata.cdk_nag = {
          rules_to_suppress: newSuppressions,
        };
      } else {
        s.templateOptions.metadata = {
          cdk_nag: { rules_to_suppress: newSuppressions },
        };
      }
    });
  }

  /**
   * Add cdk-nag suppressions to a CfnResource and optionally its children
   * @param construct The IConstruct to apply the suppression to
   * @param suppressions A list of suppressions to apply to the resource
   * @param applyToChildren Apply the suppressions to children CfnResources  (default:false)
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
      const possibleL1 = child.node.defaultChild
        ? child.node.defaultChild
        : child;
      if (possibleL1 instanceof CfnResource) {
        const resource = possibleL1 as CfnResource;
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

  /**
   * Add cdk-nag suppressions to a CfnResource and optionally its children via its path
   * @param stack The Stack the construct belongs to
   * @param path The path to the construct in the provided stack
   * @param suppressions A list of suppressions to apply to the resource
   * @param applyToChildren Apply the suppressions to children CfnResources  (default:false)
   */
  static addResourceSuppressionsByPath(
    stack: Stack,
    path: string,
    suppressions: NagPackSuppression[],
    applyToChildren: boolean = false
  ): void {
    for (const child of stack.node.findAll()) {
      const fixedPath = path.replace(/^\//, '');
      if (
        child.node.path === fixedPath ||
        child.node.path + '/Resource' === fixedPath
      ) {
        NagSuppressions.addResourceSuppressions(
          child,
          suppressions,
          applyToChildren
        );
      }
    }
  }
}
