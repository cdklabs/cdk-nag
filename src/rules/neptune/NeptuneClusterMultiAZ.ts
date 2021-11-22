/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnDBCluster } from '@aws-cdk/aws-neptune';
import { CfnResource } from '@aws-cdk/core';
import { NagRuleCompliance } from '../../nag-pack';

/**
 * Neptune DB clusters are deployed in a Multi-AZ configuration
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnDBCluster) {
      if (node.dbSubnetGroupName == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      if (
        node.availabilityZones != undefined &&
        node.availabilityZones.length < 2
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
