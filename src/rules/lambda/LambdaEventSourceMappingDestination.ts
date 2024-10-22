import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnEventSourceMapping } from 'aws-cdk-lib/aws-lambda';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * Lambda event source mappings should have a failure destination configured
 *
 * @param node - The CfnResource to check
 */
export default function LambdaEventSourceMappingDestination(
  node: CfnResource
): NagRuleCompliance {
  if (node instanceof CfnEventSourceMapping) {
    const destinationConfig = Stack.of(node).resolve(node.destinationConfig);
    if (
      destinationConfig?.onFailure &&
      destinationConfig?.onFailure?.destination
    )
      return NagRuleCompliance.COMPLIANT;

    return NagRuleCompliance.NON_COMPLIANT;
  }
  return NagRuleCompliance.NOT_APPLICABLE;
}
