/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnProject } from 'aws-cdk-lib/aws-codebuild';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Codebuild projects use images provided by the CodeBuild service or have a cdk_nag suppression rule explaining the need for a custom image
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnProject) {
      const environment = Stack.of(node).resolve(node.environment);
      const image = NagRules.resolveIfPrimitive(node, environment.image);
      if (!image.startsWith('aws/codebuild/')) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);
