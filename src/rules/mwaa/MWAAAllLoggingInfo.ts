/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnEnvironment } from 'aws-cdk-lib/aws-mwaa';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * webserverLogs are enabled on at least INFO level to be able to detect
 * Apache Airflow user privilege changes
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnEnvironment) {
      const loggingConfiguration = Stack.of(node).resolve(
        node.loggingConfiguration
      );
      if (loggingConfiguration == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }

      const dagProcessingLogs = Stack.of(node).resolve(
        loggingConfiguration.dagProcessingLogs
      );
      if (!logTypeEnabledAtLeastInfoLevel(node, dagProcessingLogs)) {
        return NagRuleCompliance.NON_COMPLIANT;
      }

      const schedulerLogs = Stack.of(node).resolve(
        loggingConfiguration.schedulerLogs
      );
      if (!logTypeEnabledAtLeastInfoLevel(node, schedulerLogs)) {
        return NagRuleCompliance.NON_COMPLIANT;
      }

      const taskLogs = Stack.of(node).resolve(loggingConfiguration.taskLogs);
      if (!logTypeEnabledAtLeastInfoLevel(node, taskLogs)) {
        return NagRuleCompliance.NON_COMPLIANT;
      }

      const webserverLogs = Stack.of(node).resolve(
        loggingConfiguration.webserverLogs
      );
      if (!logTypeEnabledAtLeastInfoLevel(node, webserverLogs)) {
        return NagRuleCompliance.NON_COMPLIANT;
      }

      const workerLogs = Stack.of(node).resolve(
        loggingConfiguration.workerLogs
      );
      if (!logTypeEnabledAtLeastInfoLevel(node, workerLogs)) {
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

/**
 * Determines whether an MWAA log type is enabled and configured
 * at a minimum verbosity level of INFO.
 *
 * This function resolves potentially tokenized CloudFormation values
 * and evaluates both the `enabled` flag and the `logLevel` setting.
 * A log type is considered valid only if logging is explicitly enabled
 * and the log level is INFO or more verbose (DEBUG).
 *
 * @param node - The MWAA CloudFormation environment resource used to
 * resolve tokenized or intrinsic values.
 * @param logTypeConfig - The log type configuration object from the
 * MWAA environment definition (e.g., scheduler, webserver, worker).
 * @returns True if the log type is enabled and configured at INFO or
 * higher verbosity; otherwise, false.
 */
function logTypeEnabledAtLeastInfoLevel(
  node: CfnEnvironment,
  logTypeConfig: any
): boolean {
  if (logTypeConfig == undefined) {
    return false;
  }
  const logEnabled = NagRules.resolveIfPrimitive(node, logTypeConfig.enabled);
  if (logEnabled !== true) {
    return false;
  }
  const logLevel = NagRules.resolveIfPrimitive(node, logTypeConfig.logLevel);
  if (!['INFO', 'DEBUG'].includes(logLevel)) {
    return false;
  }
  return true;
}
