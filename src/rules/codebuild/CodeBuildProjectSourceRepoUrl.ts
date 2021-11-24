/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnProject } from 'aws-cdk-lib/aws-codebuild';
import { NagRuleCompliance, resolveIfPrimitive } from '../../nag-pack';

/**
 * Codebuild projects with a GitHub or BitBucket source repository utilize OAUTH
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnProject) {
      //Check for the presence of OAUTH
      const projectSource = Stack.of(node).resolve(node.source);
      const projectAuth = Stack.of(node).resolve(projectSource.auth);
      if (projectAuth == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      } else {
        const projectAuthType = resolveIfPrimitive(node, projectAuth.type);
        if (projectAuthType != 'OAUTH') {
          return NagRuleCompliance.NON_COMPLIANT;
        }
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);
