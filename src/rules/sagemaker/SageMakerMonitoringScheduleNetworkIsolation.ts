/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnMonitoringSchedule } from 'aws-cdk-lib/aws-sagemaker';
import { resolveInlineMonitoringJobDefinition } from './utils';
import { NagRuleCompliance } from '../../nag-rules';
import { resolveNestedPrimitive } from '../../utils/resolve-nested-primitive';

/**
 * SageMaker monitoring schedules with an inline job definition have network isolation enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnMonitoringSchedule) {
      const monitoringJobDefinition =
        resolveInlineMonitoringJobDefinition(node);
      if (monitoringJobDefinition == undefined) {
        return NagRuleCompliance.NOT_APPLICABLE;
      }
      const enableNetworkIsolation = resolveNestedPrimitive(
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
