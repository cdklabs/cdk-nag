/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnDomain as LegacyCfnDomain } from 'aws-cdk-lib/aws-elasticsearch';
import { CfnDomain } from 'aws-cdk-lib/aws-opensearchservice';
import { NagRuleCompliance } from '../..';

/**
 * OpenSearch Service domains stream error logs to CloudWatch Logs
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof LegacyCfnDomain || node instanceof CfnDomain) {
      const logPublishingOptions = Stack.of(node).resolve(
        node.logPublishingOptions
      );
      if (logPublishingOptions === undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const resolvedLog = Stack.of(node).resolve(
        logPublishingOptions?.ES_APPLICATION_LOGS
      );
      if (resolvedLog === undefined) {
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
