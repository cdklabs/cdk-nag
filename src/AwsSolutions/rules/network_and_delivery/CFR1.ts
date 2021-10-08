/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnDistribution } from '@aws-cdk/aws-cloudfront';
import { CfnResource, Stack } from '@aws-cdk/core';
import { resolveIfPrimitive } from '../../../common';

/**
 * CloudFront distributions may require Geo restrictions
 * @param node the CfnResource to check
 */
export default function (node: CfnResource): boolean {
  if (node instanceof CfnDistribution) {
    const distributionConfig = Stack.of(node).resolve(node.distributionConfig);
    if (distributionConfig.restrictions == undefined) {
      return false;
    } else {
      const restrictions = Stack.of(node).resolve(
        distributionConfig.restrictions
      );
      const geoRestrictions = Stack.of(node).resolve(
        restrictions.geoRestriction
      );
      const restrictionType = resolveIfPrimitive(
        node,
        geoRestrictions.restrictionType
      );
      if (restrictionType == 'none') {
        return false;
      }
    }
  }
  return true;
}
