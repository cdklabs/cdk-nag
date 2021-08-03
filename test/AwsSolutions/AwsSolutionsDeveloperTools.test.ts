/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { CfnEnvironmentEC2, Ec2Environment } from '@aws-cdk/aws-cloud9';
import { BuildSpec, LinuxBuildImage, Project } from '@aws-cdk/aws-codebuild';
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  Vpc,
} from '@aws-cdk/aws-ec2';
import { Key } from '@aws-cdk/aws-kms';
import { Aspects, Stack } from '@aws-cdk/core';
import { AwsSolutionsChecks } from '../../src';

describe('AWS CodeBuild', () => {
  test('awsSolutionsCb3: Codebuild projects have privileged mode disabled', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new AwsSolutionsChecks());
    new Project(positive, 'rBuildProject', {
      buildSpec: BuildSpec.fromObjectToYaml({
        version: 0.2,
        phases: {
          build: {
            commands: ['echo "foo"'],
          },
        },
      }),
      environment: {
        privileged: true,
      },
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-CB3:'),
        }),
      })
    );
    const negative = new Stack();
    Aspects.of(negative).add(new AwsSolutionsChecks());
    new Project(negative, 'rBuildProject', {
      buildSpec: BuildSpec.fromObjectToYaml({
        version: 0.2,
        phases: {
          build: {
            commands: ['echo "foo"'],
          },
        },
      }),
    });
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-CB3:'),
        }),
      })
    );
  });
  test('awsSolutionsCb4: Codebuild projects use a CMK for encryption', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new AwsSolutionsChecks());
    new Project(positive, 'rBuildProject', {
      buildSpec: BuildSpec.fromObjectToYaml({
        version: 0.2,
        phases: {
          build: {
            commands: ['echo "foo"'],
          },
        },
      }),
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-CB4:'),
        }),
      })
    );
    const negative = new Stack();
    Aspects.of(negative).add(new AwsSolutionsChecks());
    new Project(negative, 'rBuildProject', {
      buildSpec: BuildSpec.fromObjectToYaml({
        version: 0.2,
        phases: {
          build: {
            commands: ['echo "foo"'],
          },
        },
      }),
      encryptionKey: new Key(negative, 'rBuildKey'),
    });
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-CB4:'),
        }),
      })
    );
  });
  test('awsSolutionsCb5: Codebuild projects use images provided by the CodeBuild service or have a cdk_nag suppression rule explaining the need for a custom image', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new AwsSolutionsChecks());
    new Project(positive, 'rBuildProject', {
      buildSpec: BuildSpec.fromObjectToYaml({
        version: 0.2,

        phases: {
          build: {
            commands: ['echo "foo"'],
          },
        },
      }),
      environment: {
        buildImage: LinuxBuildImage.fromDockerRegistry('foo/bar:baz'),
      },
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-CB5:'),
        }),
      })
    );
    const negative = new Stack();
    Aspects.of(negative).add(new AwsSolutionsChecks());
    new Project(negative, 'rBuildProject', {
      buildSpec: BuildSpec.fromObjectToYaml({
        version: 0.2,

        phases: {
          build: {
            commands: ['echo "foo"'],
          },
        },
      }),
    });
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-CB5:'),
        }),
      })
    );
  });
});

describe('AWS Cloud9', () => {
  test('awsSolutionsC91: Cloud9 instances use no-ingress EC2 instances with AWS Systems Manager', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new AwsSolutionsChecks());
    new Ec2Environment(positive, 'rC9Env', {
      vpc: new Vpc(positive, 'rC9Vpc'),
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-C91:'),
        }),
      })
    );
    const negative = new Stack();
    Aspects.of(negative).add(new AwsSolutionsChecks());
    new CfnEnvironmentEC2(negative, 'rC9Env', {
      instanceType: InstanceType.of(
        InstanceClass.T2,
        InstanceSize.MICRO
      ).toString(),
      connectionType: 'CONNECT_SSM',
    });
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('AwsSolutions-C91:'),
        }),
      })
    );
  });
});
