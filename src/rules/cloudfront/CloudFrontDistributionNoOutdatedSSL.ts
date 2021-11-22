/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import {
  CfnDistribution,
  OriginProtocolPolicy,
  SecurityPolicyProtocol,
} from '@aws-cdk/aws-cloudfront';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive, NagRuleCompliance } from '../../nag-pack';

/**
 * CloudFront distributions do not use SSLv3 or TLSv1 for communication to the origin
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnDistribution) {
      const distributionConfig = Stack.of(node).resolve(
        node.distributionConfig
      );
      if (distributionConfig.origins != undefined) {
        const origins = Stack.of(node).resolve(distributionConfig.origins);
        for (const origin of origins) {
          const resolvedOrigin = Stack.of(node).resolve(origin);
          if (resolvedOrigin.customOriginConfig != undefined) {
            const customOriginConfig = Stack.of(node).resolve(
              resolvedOrigin.customOriginConfig
            );
            const originProtocolPolicy = resolveIfPrimitive(
              node,
              customOriginConfig.originProtocolPolicy
            );
            if (originProtocolPolicy != OriginProtocolPolicy.HTTPS_ONLY) {
              return NagRuleCompliance.NON_COMPLIANT;
            }
            if (customOriginConfig.originSslProtocols == undefined) {
              return NagRuleCompliance.NON_COMPLIANT;
            }
            const outdatedValues = [
              SecurityPolicyProtocol.SSL_V3,
              SecurityPolicyProtocol.TLS_V1,
            ];
            const originSslProtocols = <string[]>(
              Stack.of(node).resolve(customOriginConfig.originSslProtocols)
            );
            const lowerCaseProtocols = originSslProtocols.map((i) => {
              return i.toLowerCase();
            });
            for (const outdated of outdatedValues) {
              if (lowerCaseProtocols.includes(outdated.toLowerCase())) {
                return NagRuleCompliance.NON_COMPLIANT;
              }
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
