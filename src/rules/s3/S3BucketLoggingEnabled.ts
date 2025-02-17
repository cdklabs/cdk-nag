/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnBucket } from 'aws-cdk-lib/aws-s3';
import { NagRuleCompliance, NagRules } from '../../nag-rules';
import { flattenCfnReference } from '../../utils/flatten-cfn-reference';

/**
 * S3 Buckets have server access logs enabled
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnBucket) {
      const logging = Stack.of(node).resolve(node.loggingConfiguration);
      if (
        logging == undefined ||
        (logging.destinationBucketName == undefined &&
          logging.logFilePrefix == undefined)
      ) {
        let found = false;
        const bucketLogicalId = NagRules.resolveResourceFromIntrinsic(
          node,
          node.ref
        );
        const bucketName = Stack.of(node).resolve(node.bucketName);
        for (const child of Stack.of(node).node.findAll()) {
          if (child instanceof CfnBucket) {
            if (isMatchingBucket(child, bucketLogicalId, bucketName)) {
              found = true;
              break;
            }
          }
        }
        if (!found) {
          return NagRuleCompliance.NON_COMPLIANT;
        }
      }
      return NagRuleCompliance.COMPLIANT;
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  'name',
  { value: parse(__filename).name }
);

/**
 * Helper function to check whether a given S3 Bucket uses the target S3 bucket for access logs
 * @param node the CfnBucket to check
 * @param bucketLogicalId the Cfn Logical ID of the target bucket
 * @param bucketName the name of the target bucket
 * returns whether the CfnBucket uses the target S3 bucket for access logs
 */
function isMatchingBucket(
  node: CfnBucket,
  bucketLogicalId: string,
  bucketName: string | undefined
): boolean {
  const destinationBucketName = flattenCfnReference(
    Stack.of(node).resolve(
      Stack.of(node).resolve(node.loggingConfiguration)?.destinationBucketName
    )
  );
  if (
    new RegExp(`${bucketLogicalId}(?![\\w])`).test(destinationBucketName) ||
    bucketName === destinationBucketName
  ) {
    return true;
  }
  return false;
}
