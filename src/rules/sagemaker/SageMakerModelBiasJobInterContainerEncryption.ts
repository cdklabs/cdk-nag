/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnModelBiasJobDefinition } from 'aws-cdk-lib/aws-sagemaker';
import { NagRuleCompliance, NagRules } from '../../nag-rules';
import { resolveNestedPrimitive } from '../../utils/resolve-nested-primitive';

/**
 * SageMaker model bias job definitions that use multiple instances have inter-container traffic encryption enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnModelBiasJobDefinition) {
      const clusterConfig = NagRules.resolveIfNotIntrinsic(
        node,
        NagRules.resolveIfNotIntrinsic(node, node.jobResources)?.clusterConfig
      );
      const instanceCount = NagRules.resolveIfPrimitive(
        node,
        clusterConfig?.instanceCount
      );
      if (instanceCount == undefined || instanceCount < 2) {
        return NagRuleCompliance.NOT_APPLICABLE;
      }
      const enableInterContainerTrafficEncryption = resolveNestedPrimitive(
        node,
        node.networkConfig,
        'enableInterContainerTrafficEncryption'
      );
      if (enableInterContainerTrafficEncryption !== true) {
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
