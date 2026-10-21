/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnMonitoringSchedule } from 'aws-cdk-lib/aws-sagemaker';
import { resolveNetworkConfigSetting } from './utils';
import { NagRuleCompliance } from '../../nag-rules';
import { resolveIfNotIntrinsic } from '../../utils/resolve-if-not-intrinsic';

/**
 * SageMaker monitoring schedules with an inline job definition have network isolation enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnMonitoringSchedule) {
      const monitoringJobDefinition = resolveIfNotIntrinsic(
        node,
        resolveIfNotIntrinsic(node, node.monitoringScheduleConfig)
          ?.monitoringJobDefinition
      );
      if (monitoringJobDefinition == undefined) {
        return NagRuleCompliance.NOT_APPLICABLE;
      }
      const enableNetworkIsolation = resolveNetworkConfigSetting(
        node,
        monitoringJobDefinition.networkConfig,
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
