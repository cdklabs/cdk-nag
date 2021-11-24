/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnNetworkAcl, CfnNetworkAclEntry } from '@aws-cdk/aws-ec2';
import { CfnResource } from '@aws-cdk/core';
import { NagRuleCompliance } from '../../nag-pack';

/**
 * VPCs do not implement network ACLs
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnNetworkAcl || node instanceof CfnNetworkAclEntry) {
      return NagRuleCompliance.NON_COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);
