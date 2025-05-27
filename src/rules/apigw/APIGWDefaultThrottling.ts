import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnStage } from 'aws-cdk-lib/aws-apigateway';
import { CfnStage as CfnHttpStage } from 'aws-cdk-lib/aws-apigatewayv2';
import { NagRuleCompliance } from '../../nag-rules';

/**
 * API Gateway stages are not using default throttling settings
 * @param node The CfnStage or CfnHttpStage to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnStage) {
      // Check REST API
      const methodSettings = Stack.of(node).resolve(node.methodSettings);
      if (
        Array.isArray(methodSettings) &&
        methodSettings.some(
          (setting) =>
            setting.throttlingBurstLimit !== undefined &&
            setting.throttlingRateLimit !== undefined &&
            setting.httpMethod === '*' &&
            setting.resourcePath === '/*'
        )
      ) {
        return NagRuleCompliance.COMPLIANT;
      }
      return NagRuleCompliance.NON_COMPLIANT;
    } else if (node instanceof CfnHttpStage) {
      // Check HTTP API
      const defaultRouteSettings = Stack.of(node).resolve(
        node.defaultRouteSettings
      );
      if (
        defaultRouteSettings &&
        defaultRouteSettings.throttlingBurstLimit !== undefined &&
        defaultRouteSettings.throttlingRateLimit !== undefined
      ) {
        return NagRuleCompliance.COMPLIANT;
      }
      return NagRuleCompliance.NON_COMPLIANT;
    }
    return NagRuleCompliance.NOT_APPLICABLE;
  },
  'name',
  { value: 'APIGWDefaultThrottling' }
);
