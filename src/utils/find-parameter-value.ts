/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { Stack } from 'aws-cdk-lib';
import { CfnParameter, StringParameter } from 'aws-cdk-lib/aws-ssm';
import { flattenCfnReference } from './flatten-cfn-reference';

export const findParameterValue = (stack: Stack, parameterName: string) => {
  for (const child of stack.node.findAll()) {
    if (child instanceof CfnParameter) {
      const name = flattenCfnReference(
        stack.resolve(
          StringParameter.valueForStringParameter(stack, child.name as string)
        )
      );
      if (parameterName === name) {
        return flattenCfnReference(stack.resolve(child.value));
      }
    }
  }
  return undefined;
};
