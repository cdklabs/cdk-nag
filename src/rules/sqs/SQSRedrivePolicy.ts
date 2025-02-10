import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnQueue } from 'aws-cdk-lib/aws-sqs';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * SQS queues have a redrive policy configured
 *
 * @param node - the CfnResource to check
 */
export default function SQSRedrivePolicy(node: CfnResource): NagRuleCompliance {
  if (node instanceof CfnQueue) {
    const redrivePolicy = Stack.of(node).resolve(node.redrivePolicy);
    if (redrivePolicy !== undefined) return NagRuleCompliance.COMPLIANT;
    return NagRuleCompliance.NON_COMPLIANT;
  }
  return NagRuleCompliance.NOT_APPLICABLE;
}
