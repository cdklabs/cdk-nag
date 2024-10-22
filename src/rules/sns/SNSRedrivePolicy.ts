import { parse } from 'path';
import { CfnResource } from 'aws-cdk-lib';
import { CfnSubscription } from 'aws-cdk-lib/aws-sns';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * SNS subscriptions should specify a redrive policy
 *
 * @see https://docs.aws.amazon.com/sns/latest/dg/sns-dead-letter-queues.html
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnSubscription) {
      if (node.redrivePolicy === undefined)
        return NagRuleCompliance.NON_COMPLIANT;
      return NagRuleCompliance.COMPLIANT;
    }
    return NagRuleCompliance.NOT_APPLICABLE;
  },
  'name',
  { value: parse(__filename).name }
);
