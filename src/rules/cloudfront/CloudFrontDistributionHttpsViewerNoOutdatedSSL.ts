/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnDistribution } from 'aws-cdk-lib/aws-cloudfront';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { NagRuleCompliance } from '../../nag-rules';

/**
 *  CloudFront distributions use a security policy with minimum TLSv1.1 or TLSv1.2 and appropriate security ciphers for HTTPS viewer connections
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnDistribution) {
      const distributionConfig = Stack.of(node).resolve(
        node.distributionConfig
      );
      const viewerCertificate = Stack.of(node).resolve(
        distributionConfig.viewerCertificate
      );
      if (viewerCertificate === undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const minimumProtocolVersion = Stack.of(node).resolve(
        viewerCertificate.minimumProtocolVersion
      );
      const sslSupportMethod = Stack.of(node).resolve(
        viewerCertificate.sslSupportMethod
      );
      const cloudFrontDefaultCertificate = Stack.of(node).resolve(
        viewerCertificate.cloudFrontDefaultCertificate
      );
      const outdatedProtocols = ['SSLv3', 'TLSv1', 'TLSv1_2016'];
      if (
        cloudFrontDefaultCertificate === true ||
        sslSupportMethod === undefined ||
        sslSupportMethod.toLowerCase() === 'vip' ||
        minimumProtocolVersion === undefined ||
        outdatedProtocols
          .map((x) => x.toLowerCase())
          .includes(minimumProtocolVersion.toLowerCase())
      ) {
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
