/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

/**
 * Check a resolved property in every branch of a CloudFormation condition.
 */
export function isConfigured(value: any, path: string[] = []): boolean {
  if (value == undefined || value === '' || value.Ref === 'AWS::NoValue') {
    return false;
  }
  if (value['Fn::If'] !== undefined) {
    return value['Fn::If']
      .slice(1)
      .every((branch: any) => isConfigured(branch, path));
  }
  if (path.length > 0) {
    return isConfigured(value[path[0]], path.slice(1));
  }
  return true;
}
