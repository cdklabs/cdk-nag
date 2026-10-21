/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnModelQualityJobDefinition } from 'aws-cdk-lib/aws-sagemaker';
import { resolveNetworkConfigSetting } from './utils';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * SageMaker model quality job definitions have network isolation enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnModelQualityJobDefinition) {
      const enableNetworkIsolation = resolveNetworkConfigSetting(
        node,
        node.networkConfig,
        'enableNetworkIsolation'
      );
      if (enableNetworkIsolation !== true) {
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
