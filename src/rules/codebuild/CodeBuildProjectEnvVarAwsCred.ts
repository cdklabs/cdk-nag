/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { parse } from 'path';
import { CfnResource, Stack } from 'aws-cdk-lib';
import { CfnProject } from 'aws-cdk-lib/aws-codebuild';
import { resolveIfPrimitive } from '../../nag-pack';

/**
 * CodeBuild projects do not store AWS credentials as plaintext environment variables
 * @param node the CfnResource to check
 */
export default Object.defineProperty(
  (node: CfnResource): boolean => {
    if (node instanceof CfnProject) {
      //Check for the presence of OAUTH
      const environment = Stack.of(node).resolve(node.environment);
      const environmentVars = Stack.of(node).resolve(
        environment.environmentVariables
      );
      if (environmentVars != undefined) {
        //For each envvar, check if its a sensitive credential being stored
        for (const envVar of environmentVars) {
          const resolvedEnvVar = Stack.of(node).resolve(envVar);
          const name = resolveIfPrimitive(node, resolvedEnvVar.name);
          const type = resolveIfPrimitive(node, resolvedEnvVar.type);
          if (name == 'AWS_ACCESS_KEY_ID' || name == 'AWS_SECRET_ACCESS_KEY') {
            //is this credential being stored as plaintext?
            if (type == undefined || type == 'PLAINTEXT') {
              return false;
            }
          }
        }
      }
    }
    return true;
  },
  'name',
  { value: parse(__filename).name }
);
