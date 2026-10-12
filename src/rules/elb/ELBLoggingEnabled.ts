/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { isDeepStrictEqual } from 'util';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancing';
import { CfnLoadBalancer as CfnLoadBalancerV2 } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import {
  CfnDelivery,
  CfnDeliveryDestination,
  CfnDeliverySource,
} from 'aws-cdk-lib/aws-logs';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * ELBs have access logs enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnLoadBalancer) {
      if (node.accessLoggingPolicy == undefined) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      const accessLoggingPolicy = Stack.of(node).resolve(
        node.accessLoggingPolicy
      );
      const enabled = NagRules.resolveIfPrimitive(
        node,
        accessLoggingPolicy.enabled
      );

      if (enabled == false) {
        return NagRuleCompliance.NON_COMPLIANT;
      }
      return NagRuleCompliance.COMPLIANT;
    } else if (node instanceof CfnLoadBalancerV2) {
      const attributes = Stack.of(node).resolve(node.loadBalancerAttributes);
      const reg = /"access_logs\.s3\.enabled","value":"true"/gm;

      if (reg.test(JSON.stringify(attributes) ?? '')) {
        return NagRuleCompliance.COMPLIANT;
      }
      return hasVendedAccessLogDelivery(node)
        ? NagRuleCompliance.COMPLIANT
        : NagRuleCompliance.NON_COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);

/** Check the complete, unconditional delivery chain within the load balancer's stack. */
function hasVendedAccessLogDelivery(node: CfnLoadBalancerV2): boolean {
  const stack = Stack.of(node);
  const type = stack.resolve(node.type);
  if (type !== undefined && type !== 'application' && type !== 'network') {
    return false;
  }
  const resources = stack.node
    .findAll()
    .filter(
      (child): child is CfnResource =>
        child instanceof CfnResource &&
        Stack.of(child) === stack &&
        child.cfnOptions.condition === undefined
    );
  const sources = resources.filter(
    (child): child is CfnDeliverySource => child instanceof CfnDeliverySource
  );
  const deliveries = resources.filter(
    (child): child is CfnDelivery => child instanceof CfnDelivery
  );
  const destinations = resources.filter(
    (child): child is CfnDeliveryDestination =>
      child instanceof CfnDeliveryDestination
  );
  return sources.some((source) => {
    if (
      stack.resolve(source.logType) !== 'ACCESS_LOGS' ||
      ![node.ref, node.attrLoadBalancerArn].some((arn) =>
        sameReference(stack, source.resourceArn, arn)
      )
    ) {
      return false;
    }
    return deliveries.some(
      (delivery) =>
        [source.name, source.ref].some((name) =>
          sameReference(stack, delivery.deliverySourceName, name)
        ) &&
        destinations.some(
          (destination) =>
            destination.destinationResourceArn !== undefined &&
            sameReference(
              stack,
              delivery.deliveryDestinationArn,
              destination.attrArn
            )
        )
    );
  });
}

/** Preserve GetAtt attributes: a DNS name must not match a load balancer ARN. */
function sameReference(
  stack: Stack,
  actual: unknown,
  expected: unknown
): boolean {
  return (
    actual !== undefined &&
    expected !== undefined &&
    isDeepStrictEqual(stack.resolve(actual), stack.resolve(expected))
  );
}
