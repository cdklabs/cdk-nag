/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnBucket, CfnBucketPolicy } from '@aws-cdk/aws-s3';
import { CfnResource, Stack } from '@aws-cdk/core';
import { NagRuleCompliance, NagRules } from '../../nag-rules';

/**
 * S3 Buckets require requests to use SSL
 * @param node the CfnResource to check
 */

export default Object.defineProperty(
  (node: CfnResource): NagRuleCompliance => {
    if (node instanceof CfnBucket) {
      const bucketLogicalId = NagRules.resolveResourceFromInstrinsic(
        node,
        node.ref
      );
      const bucketName = Stack.of(node).resolve(node.bucketName);
      let found = false;
      for (const child of Stack.of(node).node.findAll()) {
        if (child instanceof CfnBucketPolicy) {
          if (isMatchingCompliantPolicy(child, bucketLogicalId, bucketName)) {
            found = true;
            break;
          }
        }
      }
      if (!found) {
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

/**
 * Helper function to check whether the Bucket Policy requires SSL on the given bucket.
 * @param node The CfnBucketPolicy to check.
 * @param bucketLogicalId The Cfn Logical ID of the bucket.
 * @param bucketName The name of the bucket.
 * @returns Whether the CfnBucketPolicy requires SSL on the given bucket.
 */
function isMatchingCompliantPolicy(
  node: CfnBucketPolicy,
  bucketLogicalId: string,
  bucketName: string | undefined
): boolean {
  const bucket = NagRules.resolveResourceFromInstrinsic(node, node.bucket);
  if (bucket !== bucketLogicalId && bucket !== bucketName) {
    return false;
  }
  const resolvedPolicyDocument = Stack.of(node).resolve(node.policyDocument);
  for (const statement of resolvedPolicyDocument.Statement) {
    const resolvedStatement = Stack.of(node).resolve(statement);
    const secureTransport =
      resolvedStatement?.Condition?.Bool?.['aws:SecureTransport'];
    if (
      resolvedStatement.Effect === 'Deny' &&
      checkMatchingAction(resolvedStatement.Action) === true &&
      checkMatchingPrincipal(resolvedStatement.Principal) === true &&
      (secureTransport === 'false' || secureTransport === false) &&
      checkMatchingResources(
        node,
        bucketLogicalId,
        bucketName,
        resolvedStatement.Resource
      ) === true
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Helper function to check whether the Bucket Policy applies to all actions
 * @param node The CfnBucketPolicy to check
 * @param actions The action in the bucket policy
 * @returns Whether the CfnBucketPolicy applies to all actions
 */
function checkMatchingAction(actions: any): boolean {
  if (Array.isArray(actions)) {
    for (const action of actions) {
      if (action === '*' || action.toLowerCase() === 's3:*') {
        return true;
      }
    }
  } else if (actions === '*' || actions.toLowerCase() === 's3:*') {
    return true;
  }
  return false;
}

/**
 * Helper function to check whether the Bucket Policy applies to all principals
 * @param node The CfnBucketPolicy to check
 * @param principal The principals in the bucket policy
 * @returns Whether the CfnBucketPolicy applies to all principals
 */
function checkMatchingPrincipal(principals: any): boolean {
  if (principals === '*') {
    return true;
  }
  const awsPrincipal = principals.AWS;
  if (Array.isArray(awsPrincipal)) {
    for (const account of awsPrincipal) {
      if (account === '*') {
        return true;
      }
    }
  } else if (awsPrincipal === '*') {
    return true;
  }
  return false;
}

/**
 * Helper function to check whether the Bucket Policy applies to the bucket and all of it's resources
 * @param node The CfnBucketPolicy to check
 * @param bucketLogicalId The Cfn Logical ID of the bucket
 * @param bucketName The name of the bucket
 * @param resources The resources in the bucket policy
 * @returns Whether the Bucket Policy applies to the bucket and all of it's resources
 */
function checkMatchingResources(
  node: CfnBucketPolicy,
  bucketLogicalId: string,
  bucketName: string | undefined,
  resources: any
): boolean {
  if (!Array.isArray(resources)) {
    return false;
  }
  const bucketResourceRegexes = Array<string>();
  const bucketObjectsRegexes = Array<string>();
  bucketResourceRegexes.push(`(${bucketLogicalId}(?![\\w\\-]))`);
  bucketObjectsRegexes.push(`(${bucketLogicalId}(?![\\w\\-]).*\\/\\*)`);
  if (bucketName !== undefined) {
    bucketResourceRegexes.push(`(${bucketName}(?![\\w\\-]))`);
    bucketObjectsRegexes.push(`(${bucketName}(?![\\w\\-]).*\\/\\*)`);
  }
  const fullBucketResourceRegex = new RegExp(bucketResourceRegexes.join('|'));
  const fullBucketObjectsRegex = new RegExp(bucketObjectsRegexes.join('|'));
  let matchedBucketResource = false;
  let matchedObjectsResource = false;
  for (const resource of resources) {
    const resolvedResourceString = JSON.stringify(
      Stack.of(node).resolve(resource)
    );
    if (
      matchedBucketResource === false &&
      fullBucketResourceRegex.test(resolvedResourceString) &&
      !resolvedResourceString.includes('/')
    ) {
      matchedBucketResource = true;
    } else if (
      matchedObjectsResource === false &&
      fullBucketObjectsRegex.test(resolvedResourceString) &&
      resolvedResourceString.indexOf('/') ===
        resolvedResourceString.lastIndexOf('/')
    ) {
      matchedObjectsResource = true;
    }
    if (matchedBucketResource === true && matchedObjectsResource === true) {
      return true;
    }
  }
  return false;
}
