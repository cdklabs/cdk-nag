/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { CfnProject } from '@aws-cdk/aws-codebuild';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053Checks } from '../../src';


describe('NIST-800-53 Compute Checks', () => {
  describe('Amazon Codebuild', () => {


    //Test whether Codebuild resources store sensitive credentials as environment variables
    test('nist80053CodebuildCheckEnvVars: - Codebuild projects DO NOT store sensitive data as environment variables - (Control IDs: AC-6, IA-5(7), SA-3(a))', () => {

      //Expect a POSITIVE response because AWS_ACCESS_KEY_ID is defined as a plaintext env var
      const positive = new Stack();
      Aspects.of(positive).add(new NIST80053Checks());
      new CfnProject(positive, 'project1', {
        artifacts: {
          type: 'no_artifacts',
        },
        environment: {
          computeType: 'BUILD_GENERAL1_SMALL',
          image: 'aws/codebuild/standard:4.0',
          type: 'LINUX_CONTAINER',
          environmentVariables: [
            {
              name: 'AWS_ACCESS_KEY_ID',
              type: 'PLAINTEXT',
              value: 'myawsaccesskeyid',
            },
          ],
        },
        serviceRole: 'someservicerole',
        source: {
          type: 'NO_SOURCE',
          auth: {
            type: 'OAUTH',
          },
        },
      });

      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-CodebuildCheckEnvVars:'),
          }),
        }),
      );

      //Expect a POSITIVE response because AWS_ACCESS_KEY_ID is defined without ensuring that its not plaintext (the default)
      const positive2 = new Stack();
      Aspects.of(positive2).add(new NIST80053Checks());
      new CfnProject(positive2, 'project1', {
        artifacts: {
          type: 'no_artifacts',
        },
        environment: {
          computeType: 'BUILD_GENERAL1_SMALL',
          image: 'aws/codebuild/standard:4.0',
          type: 'LINUX_CONTAINER',
          environmentVariables: [
            {
              name: 'AWS_ACCESS_KEY_ID',
              value: 'myawsaccesskeyid',
            },
          ],
        },
        serviceRole: 'someservicerole',
        source: {
          type: 'NO_SOURCE',
          auth: {
            type: 'OAUTH',
          },
        },
      });

      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-CodebuildCheckEnvVars:'),
          }),
        }),
      );

      //Expect a POSITIVE response because AWS_SECRET_ACCESS_KEY is defined without ensuring that its not plaintext (the default)
      const positive3 = new Stack();
      Aspects.of(positive3).add(new NIST80053Checks());
      new CfnProject(positive3, 'project1', {
        artifacts: {
          type: 'no_artifacts',
        },
        environment: {
          computeType: 'BUILD_GENERAL1_SMALL',
          image: 'aws/codebuild/standard:4.0',
          type: 'LINUX_CONTAINER',
          environmentVariables: [
            {
              name: 'AWS_SECRET_ACCESS_KEY',
              value: 'myawsaccesskeyid',
            },
          ],
        },
        serviceRole: 'someservicerole',
        source: {
          type: 'NO_SOURCE',
          auth: {
            type: 'OAUTH',
          },
        },
      });

      const messages3 = SynthUtils.synthesize(positive3).messages;
      expect(messages3).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-CodebuildCheckEnvVars:'),
          }),
        }),
      );


      //Create stack for negative checks
      const negative = new Stack();
      Aspects.of(negative).add(new NIST80053Checks());

      //expect a negative response because no environment variables are defined
      new CfnProject(negative, 'project1', {
        artifacts: {
          type: 'no_artifacts',
        },
        environment: {
          computeType: 'BUILD_GENERAL1_SMALL',
          image: 'aws/codebuild/standard:4.0',
          type: 'LINUX_CONTAINER',

        },
        serviceRole: 'someservicerole',
        source: {
          type: 'NO_SOURCE',
          auth: {
            type: 'OAUTH',
          },
        },
      });

      //expect a negative response because the credentials are stored using PARAMETER_STORE
      new CfnProject(negative, 'project2', {
        artifacts: {
          type: 'no_artifacts',
        },
        environment: {
          computeType: 'BUILD_GENERAL1_SMALL',
          image: 'aws/codebuild/standard:4.0',
          type: 'LINUX_CONTAINER',
          environmentVariables: [
            {
              name: 'AWS_ACCESS_KEY_ID',
              type: 'PARAMETER_STORE',
              value: 'myawsaccesskeyid',
            },
            {
              name: 'AWS_SECRET_ACCESS_KEY',
              type: 'PARAMETER_STORE',
              value: 'myawssecretaccesskey',
            },
          ],
        },
        serviceRole: 'someservicerole',
        source: {
          type: 'NO_SOURCE',
          auth: {
            type: 'OAUTH',
          },
        },
      });

      //expect a negative response because the credentials are stored using SECRETS_MANAGER
      new CfnProject(negative, 'project3', {
        artifacts: {
          type: 'no_artifacts',
        },
        environment: {
          computeType: 'BUILD_GENERAL1_SMALL',
          image: 'aws/codebuild/standard:4.0',
          type: 'LINUX_CONTAINER',
          environmentVariables: [
            {
              name: 'AWS_ACCESS_KEY_ID',
              type: 'SECRETS_MANAGER',
              value: 'myawsaccesskeyid',
            },
            {
              name: 'AWS_SECRET_ACCESS_KEY',
              type: 'SECRETS_MANAGER',
              value: 'myawssecretaccesskey',
            },
          ],
        },
        serviceRole: 'someservicerole',
        source: {
          type: 'NO_SOURCE',
          auth: {
            type: 'OAUTH',
          },
        },
      });


      //Check cdk-nag response
      const messages6 = SynthUtils.synthesize(negative).messages;
      expect(messages6).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-CodebuildCheckEnvVars:'),
          }),
        }),
      );
    });


    //Test whether Codebuild resources use OAUTH
    test('nist80053CodebuildURLCheck: - Codebuild functions use OAUTH - (Control IDs: SA-3(a))', () => {

      //Expect a POSITIVE response because OAUTH is not used
      const positive = new Stack();
      Aspects.of(positive).add(new NIST80053Checks());
      new CfnProject(positive, 'project1', {
        artifacts: {
          type: 'no_artifacts',
        },
        environment: {
          computeType: 'BUILD_GENERAL1_SMALL',
          image: 'aws/codebuild/standard:4.0',
          type: 'LINUX_CONTAINER',
        },
        serviceRole: 'someservicerole',
        source: {
          type: 'NO_SOURCE',
        },
      });

      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-CodebuildURLCheck:'),
          }),
        }),
      );


      //Create stack for negative checks
      const negative = new Stack();
      Aspects.of(negative).add(new NIST80053Checks());
      new CfnProject(negative, 'project1', {
        artifacts: {
          type: 'no_artifacts',
        },
        environment: {
          computeType: 'BUILD_GENERAL1_SMALL',
          image: 'aws/codebuild/standard:4.0',
          type: 'LINUX_CONTAINER',
        },
        serviceRole: 'someservicerole',
        source: {
          type: 'NO_SOURCE',
          auth: {
            type: 'OAUTH',
          },
        },
      });


      //Check cdk-nag response
      const messages6 = SynthUtils.synthesize(negative).messages;
      expect(messages6).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-CodebuildURLCheck:'),
          }),
        }),
      );
    });


  });
});
