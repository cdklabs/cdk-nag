/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * The compliance level of a resource in relation to a rule.
 */
export enum NagRuleCompliance {
  COMPLIANT = 'Compliant',
  NON_COMPLIANT = 'Non-Compliant',
  NOT_APPLICABLE = 'N/A',
}

/**
 * Helper class with methods for rule creation
 */
export class NagRules {
  /**
   * Use in cases where a primitive value must be known to pass a rule.
   * https://developer.mozilla.org/en-US/docs/Glossary/Primitive
   * @param node The CfnResource to check.
   * @param parameter The value to attempt to resolve.
   * @returns Return a value if resolves to a primitive data type, otherwise throw an error.
   */
  static resolveIfPrimitive(node: CfnResource, parameter: any): any {
    const resolvedValue = Stack.of(node).resolve(parameter);
    if (resolvedValue === Object(resolvedValue)) {
      throw Error(
        `The parameter resolved to to a non-primitive value "${JSON.stringify(
          resolvedValue
        )}", therefore the rule could not be validated.`
      );
    } else {
      return resolvedValue;
    }
  }

  /**
   * Use in cases where a token resolves to an intrinsic function and the referenced resource must be known to pass a rule.
   * @param node The CfnResource to check.
   * @param parameter The value to attempt to resolve.
   * @returns Return the Logical resource Id if resolves to a intrinsic function, otherwise the resolved provided value.
   */
  static resolveResourceFromInstrinsic(node: CfnResource, parameter: any): any {
    const resolvedValue = Stack.of(node).resolve(parameter);
    const ref = resolvedValue?.Ref;
    const getAtt = resolvedValue?.['Fn::GetAtt'];
    if (ref != undefined) {
      return ref;
    } else if (Array.isArray(getAtt) && getAtt.length > 0) {
      return getAtt[0];
    }
    return resolvedValue;
  }
}
