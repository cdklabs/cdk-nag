/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnModelExplainabilityJobDefinition } from 'aws-cdk-lib/aws-sagemaker';
import { resolveNetworkConfigSetting } from './utils';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * SageMaker model explainability job definitions have inter-container traffic encryption enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnModelExplainabilityJobDefinition) {
      const enableInterContainerTrafficEncryption = resolveNetworkConfigSetting(
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
