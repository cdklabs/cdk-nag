/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnCluster } from '@aws-cdk/aws-eks';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * EKS Cluster Kubernetes API server endpoints have public access disabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnCluster) {
      const resourcesVpcConfig = Stack.of(node).resolve(
        node.resourcesVpcConfig
      );
      const endpointPublicAccess = NagRules.resolveIfPrimitive(
        node,
        resourcesVpcConfig.endpointPublicAccess
      );
      if (endpointPublicAccess !== false) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else if (node.cfnResourceType === 'Custom::AWSCDK-EKS-Cluster') {
      // The CDK uses a Custom Resource with AWS SDK calls to create EKS Clusters
      const props = Stack.of(node).resolve((<any>node)._cfnProperties);
      const endpointPublicAccess = NagRules.resolveIfPrimitive(
        node,
        props?.Config?.resourcesVpcConfig?.endpointPublicAccess
      );
      if (endpointPublicAccess !== false) {
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
