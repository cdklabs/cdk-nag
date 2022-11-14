/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnResource, Stack } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
import { NagPackSuppression } from './models/nag-suppression';
import { NagSuppressionHelper } from './utils/nag-suppression-helper';

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
      NagSuppressionHelper.assertSuppressionsAreValid(s.node.id, suppressions);
      let metadata = s.templateOptions.metadata?.cdk_nag ?? {};
      metadata = NagSuppressionHelper.addRulesToMetadata(
        metadata,
        suppressions
      );
      if (!s.templateOptions.metadata) {
        s.templateOptions.metadata = {};
      }
      s.templateOptions.metadata.cdk_nag = metadata;
    });
  }

  /**
   * Add cdk-nag suppressions to a CfnResource and optionally its children
   * @param construct The IConstruct(s) to apply the suppression to
   * @param suppressions A list of suppressions to apply to the resource
   * @param applyToChildren Apply the suppressions to children CfnResources  (default:false)
   */
  static addResourceSuppressions(
    construct: IConstruct | IConstruct[],
    suppressions: NagPackSuppression[],
    applyToChildren: boolean = false
  ): void {
    const constructArray: IConstruct[] = Array.isArray(construct)
      ? construct
      : [construct];
    if (constructArray.length === 0) {
      throw new Error(`Construct cannot be an empty array.`);
    }

    constructArray.forEach((c) => {
      NagSuppressionHelper.assertSuppressionsAreValid(c.node.id, suppressions);
      const constructs = applyToChildren ? c.node.findAll() : [c];
      for (const child of constructs) {
        const possibleL1 = child.node.defaultChild
          ? child.node.defaultChild
          : child;
        if (possibleL1 instanceof CfnResource) {
          const resource = possibleL1 as CfnResource;
          let metadata = resource.getMetadata('cdk_nag');
          metadata = NagSuppressionHelper.addRulesToMetadata(
            metadata,
            suppressions
          );
          resource.addMetadata('cdk_nag', metadata);
        }
      }
    });
  }

  /**
   * Add cdk-nag suppressions to a CfnResource and optionally its children via its path
   * @param stack The Stack the construct belongs to
   * @param path The path(s) to the construct in the provided stack
   * @param suppressions A list of suppressions to apply to the resource
   * @param applyToChildren Apply the suppressions to children CfnResources  (default:false)
   */
  static addResourceSuppressionsByPath(
    stack: Stack,
    path: string | string[],
    suppressions: NagPackSuppression[],
    applyToChildren: boolean = false
  ): void {
    const pathArray: string[] = Array.isArray(path) ? path : [path];
    if (pathArray.length === 0) {
      throw new Error(`Path cannot be an empty array.`);
    }

    pathArray.forEach((p) => {
      let added = false;
      for (const child of stack.node.findAll()) {
        const fixedPath = p.replace(/^\//, '');
        if (
          child.node.path === fixedPath ||
          child.node.path + '/Resource' === fixedPath
        ) {
          NagSuppressions.addResourceSuppressions(
            child,
            suppressions,
            applyToChildren
          );
          added = true;
        }
      }
      if (!added) {
        throw new Error(
          `Suppression path "${p}" did not match any resource. This can occur when a resource does not exist or if a suppression is applied before a resource is created.`
        );
      }
    });
  }
}
