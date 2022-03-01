/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
/**
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-join.html
 */
interface CfnFnJoin {
  'Fn::Join': [string, unknown[]];
}

/**
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-sub.html
 */
interface CfnFnSub {
  'Fn::Sub': unknown;
}

/**
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html
 */
interface CfnFnGetAtt {
  'Fn::GetAtt': [unknown, unknown];
}

/**
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-importvalue.html
 */
interface CfnFnImportValue {
  'Fn::ImportValue': unknown;
}

/**
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-ref.html
 */
interface CfnFnRef {
  Ref: unknown;
}

/**
 * Turns a CloudFormation reference object into a flat string for easy suppression
 * @param node The reference object
 * @returns Flattened string
 */
export const flattenCfnReference = (reference: unknown): string => {
  const visit = (node: unknown): string => {
    if (typeof node === 'undefined') {
      return '';
    }
    if (typeof node === 'string') {
      // Replace the template syntax that Fn::Sub uses with round brackets for easier suppression
      return node.replace(/\${/g, '<').replace(/}/g, '>');
    }
    if (isCfnFnJoin(node)) {
      const [delimiter, items] = node['Fn::Join'];
      return items.map(visit).join(delimiter);
    }

    if (isCfnFnSub(node)) {
      return visit(node['Fn::Sub']);
    }

    if (isCfnFnGetAtt(node)) {
      const [resource, attribute] = node['Fn::GetAtt'];
      return `<${visit(resource)}.${visit(attribute)}>`;
    }

    if (isCfnFnImportValue(node)) {
      return visit(node['Fn::ImportValue']);
    }

    if (isCfnRef(node)) {
      return `<${visit(node.Ref)}>`;
    }

    // fallback
    return JSON.stringify(node);
  };

  return visit(reference);
};

// Checks if an object is a certain type by testing for the existence of a field
const checkType =
  <T>(field: keyof T) =>
  (node: unknown): node is T =>
    !!(node as T)[field];

const isCfnFnJoin = checkType<CfnFnJoin>('Fn::Join');
const isCfnFnSub = checkType<CfnFnSub>('Fn::Sub');
const isCfnFnGetAtt = checkType<CfnFnGetAtt>('Fn::GetAtt');
const isCfnFnImportValue = checkType<CfnFnImportValue>('Fn::ImportValue');
const isCfnRef = checkType<CfnFnRef>('Ref');
