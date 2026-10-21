/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnBrowserCustom } from 'aws-cdk-lib/aws-bedrockagentcore';
import { NagRuleCompliance, NagRules } from '../../nag-rules';
import { resolveIfNotIntrinsic } from '../../utils/resolve-if-not-intrinsic';

/**
 * Bedrock AgentCore custom browsers have session recording enabled with an S3 destination
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnBrowserCustom) {
      const recordingConfig = resolveIfNotIntrinsic(node, node.recordingConfig);
      if (recordingConfig == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const enabled = NagRules.resolveIfPrimitive(
        node,
        recordingConfig.enabled
      );
      const s3Location = resolveIfNotIntrinsic(
        node,
        recordingConfig.s3Location
      );
      if (enabled !== true || !s3Location?.bucket) {
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
