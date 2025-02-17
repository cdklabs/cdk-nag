/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnBot, CfnBotAlias } from 'aws-cdk-lib/aws-lex';
import { CfnLogGroup } from 'aws-cdk-lib/aws-logs';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Lex Bot conversation logs are encrypted with KMS keys
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnBotAlias || node instanceof CfnBot) {
      const settingLocation =
        node instanceof CfnBotAlias
          ? node
          : Stack.of(node).resolve(node.testBotAliasSettings);
      const conversationLogSettings = Stack.of(node).resolve(
        settingLocation?.conversationLogSettings
      );
      if (conversationLogSettings !== undefined) {
        const audioLogSettings =
          Stack.of(node).resolve(conversationLogSettings.audioLogSettings) ??
          [];
        for (const log of audioLogSettings) {
          const resolvedLog = Stack.of(node).resolve(log);
          if (Stack.of(node).resolve(resolvedLog.enabled) === true) {
            const resolvedDestination = Stack.of(node).resolve(
              resolvedLog.destination
            );
            const s3Bucket = Stack.of(node).resolve(
              resolvedDestination.s3Bucket
            );
            const kmsKeyArn = Stack.of(node).resolve(s3Bucket.kmsKeyArn);
            if (kmsKeyArn === undefined) {
              return NagRuleCompliance.NON_COMPLIANT;
            }
          }
        }
        const textLogSettings =
          Stack.of(node).resolve(conversationLogSettings.textLogSettings) ?? [];
        for (const log of textLogSettings) {
          const resolvedLog = Stack.of(node).resolve(log);
          if (Stack.of(node).resolve(resolvedLog.enabled) === true) {
            const resolvedDestination = Stack.of(node).resolve(
              resolvedLog.destination
            );
            const cloudwatch = Stack.of(node).resolve(
              resolvedDestination.cloudWatch
            );
            const logGroupLogicalId = NagRules.resolveResourceFromIntrinsic(
              node,
              cloudwatch.cloudWatchLogGroupArn
            );
            let found = false;
            for (const child of Stack.of(node).node.findAll()) {
              if (child instanceof CfnLogGroup) {
                if (
                  logGroupLogicalId ===
                  NagRules.resolveResourceFromIntrinsic(child, child.logicalId)
                ) {
                  found = true;
                  if (child.kmsKeyId === undefined) {
                    return NagRuleCompliance.NON_COMPLIANT;
                  }
                  break;
                }
              }
            }
            if (!found) {
              throw Error(
                `Unable to find the CloudWatch Log group "${JSON.stringify(
                  logGroupLogicalId
                )}" used in one of Text Log Destinations in the CDK Application. Therefore the rule could not be validated.`
              );
            }
          }
        }
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);
