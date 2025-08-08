/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnStateMachine, LogLevel } from 'aws-cdk-lib/aws-stepfunctions';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Step Function log "ERROR" events to CloudWatch Logs
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnStateMachine) {
      const loggingConfiguration = Stack.of(node).resolve(
        node.loggingConfiguration
      );
      if (loggingConfiguration == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const level = NagRules.resolveIfPrimitive(
        node,
        loggingConfiguration.level
      );
      if (level == undefined || level != LogLevel.ERROR) {
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
