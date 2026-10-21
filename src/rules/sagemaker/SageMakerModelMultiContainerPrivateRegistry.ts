/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnModel } from 'aws-cdk-lib/aws-sagemaker';
import { usesPrivateRegistry } from './utils';
import { NagRuleCompliance } from '../../nag-rules';
import { resolveIfNotIntrinsic } from '../../utils/resolve-if-not-intrinsic';

/**
 * SageMaker models with multi-container inference pipelines pull every container image from a private registry in a VPC
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnModel) {
      const containers: any[] =
        resolveIfNotIntrinsic(node, node.containers) ?? [];
      if (containers.length === 0) {
        return NagRuleCompliance.NOT_APPLICABLE;
      }
      if (
        !containers.every((container) => usesPrivateRegistry(node, container))
      ) {
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
