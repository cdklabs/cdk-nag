/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnFunction, Runtime } from '@aws-cdk/aws-lambda';
import { CfnResource } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * Non-container Lambda functions are configured to use the latest runtime version
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnFunction) {
      const runtime = NagRules.resolveIfPrimitive(node, node.runtime);
      if (!runtime) {
        // Runtime is not required for container lambdas, in this case, not applicable
        return NagRuleCompliance.NOT_APPLICABLE;
      }

      const exp = /^([a-z]+)(\d+(\.?\d+|\.x)?)?.*$/;
      const m = runtime.match(exp);

      if (!m) {
        throw Error(
          `The Lambda runtime "${runtime}" does not match the expected regular expression, therefore the rule could not be validated.`
        );
      }

      const runtimeFamily = m[1];
      if (runtimeFamily === 'provided') {
        return NagRuleCompliance.NOT_APPLICABLE;
      }

      // We'll pull the versions which CDK knows about to ensure we don't throw complaints
      // about a runtime version which isn't available for use in the users CDK library.
      const familyVersions = Runtime.ALL.filter(
        (rt) => rt.toString().indexOf(runtimeFamily) === 0
      )
        .map((rt) => {
          let match = rt.toString().match(exp);
          return {
            value: rt.toString(),
            family: match![1],
            version: parseFloat(match![2]),
          };
        })
        .sort((a, b) => {
          if (a.version < b.version) return -1;
          else if (a.version > b.version) return 1;
          else return 0;
        });

      if (familyVersions.length === 0) {
        throw Error(
          `Unable to find families for Lambda runtime "${runtime}", therefore the rule could not be validated.`
        );
      }

      const latestFamilyVersion = familyVersions.pop()!.value;

      if (runtime !== latestFamilyVersion!.toString()) {
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
