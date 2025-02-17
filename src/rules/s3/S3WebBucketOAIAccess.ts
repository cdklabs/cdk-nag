/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnBucket, CfnBucketPolicy } from 'aws-cdk-lib/aws-s3';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * S3 static website buckets do not have an open world bucket policy and use CloudFront Origin Access Identities in the bucket policy for limited getObject and/or putObject permissions
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnBucket) {
      if (node.websiteConfiguration !== undefined) {
        const bucketLogicalId = NagRules.resolveResourceFromIntrinsic(
          node,
          node.ref
        );
        const bucketName = Stack.of(node).resolve(node.bucketName);
        let found = false;
        for (const child of Stack.of(node).node.findAll()) {
          if (child instanceof CfnBucketPolicy) {
            if (isMatchingCompliantPolicy(child, bucketLogicalId, bucketName)) {
              found = true;
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
 * Helper function to check whether the Bucket Policy does not allow for open access  and uses a restricted OAI Policy for access on the given bucket.
 * @param node The CfnBucketPolicy to check.
 * @param bucketLogicalId The Cfn Logical ID of the bucket.
 * @param bucketName The name of the bucket.
 * @returns Whether the CfnBucketPolicy allows for open access on the given bucket.
 */
function isMatchingCompliantPolicy(
  node: CfnBucketPolicy,
  bucketLogicalId: string,
  bucketName: string | undefined
): boolean {
  const bucket = NagRules.resolveResourceFromIntrinsic(node, node.bucket);
  if (bucket !== bucketLogicalId && bucket !== bucketName) {
    return false;
  }
  const resolvedPolicyDocument = Stack.of(node).resolve(node.policyDocument);
  let found = false;
  for (const statement of resolvedPolicyDocument.Statement) {
    const resolvedStatement = Stack.of(node).resolve(statement);
    if (resolvedStatement.Effect === 'Allow') {
      if (checkStarPrincipals(resolvedStatement.Principal)) {
        return false;
      }
      if (checkOAIPrincipal(resolvedStatement.Principal)) {
        if (checkMatchingActions(normalizeArray(resolvedStatement.Action))) {
          found = true;
        } else {
          return false;
        }
      }
    }
  }
  return found;
}

/**
 * Helper function to check whether the Bucket Policy applies to all principals
 * @param node The CfnBucketPolicy to check
 * @param principal The principals in the bucket policy
 * @returns Whether the CfnBucketPolicy applies to all principals
 */
function checkStarPrincipals(principals: any): boolean {
  return JSON.stringify(principals ?? '').includes('*');
}

/**
 * Helper function to check whether the Bucket Policy applies to a CloudFront OAI
 * @param node The CfnBucketPolicy to check
 * @param principal The principals in the bucket policy
 * @returns Whether the CfnBucketPolicy applies to a CloudFront OAI
 */
function checkOAIPrincipal(principals: any): boolean {
  const usesAWSPrincipalOAI = JSON.stringify(principals.AWS ?? '').includes(
    'CloudFront Origin Access Identity'
  );
  const usesCanonicalUserPrincipal = !!principals?.CanonicalUser;
  return usesAWSPrincipalOAI || usesCanonicalUserPrincipal;
}

/**
 * Helper function to check whether the statement applies to only GetObject and/or PutObject actions
 * @param node The statement to check
 * @param actions The action in the bucket statement
 * @returns Whether the statement applies to only GetObject and/or PutObject actions
 */
function checkMatchingActions(actions: string[]): boolean {
  for (const action of actions) {
    if (
      action.toLowerCase() !== 's3:getobject' &&
      action.toLowerCase() !== 's3:putobject'
    ) {
      return false;
    }
  }
  return true;
}

function normalizeArray<T>(arrOrStr: T[] | T): T[] {
  return Array.isArray(arrOrStr) ? arrOrStr : [arrOrStr];
}
