import { CfnTable } from '@aws-cdk/aws-dynamodb';
import { CfnResource, Stack } from '@aws-cdk/core';

/**
 * DynamoDB tables have Point-in-time Recovery enabled - (Control IDs: CP-9(b), CP-10, SI-12)
 * @param node the CfnResource to check
 */

export default function (node: CfnResource): boolean {
  if (node instanceof CfnTable) {
    if (node.pointInTimeRecoverySpecification == undefined) {
      return false;
    }
    const pitr = Stack.of(node).resolve(node.pointInTimeRecoverySpecification);
    const enabled = Stack.of(node).resolve(pitr.pointInTimeRecoveryEnabled);
    if (!enabled) {
      return false;
    }
  }
  return true;
}
