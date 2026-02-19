/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import {
  BuildSpec,
  CfnProject,
  LinuxBuildImage,
  Project,
} from 'aws-cdk-lib/aws-codebuild';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import { TestPack, TestType, validateStack } from './utils';
import {
  CodeBuildProjectEnvVarAwsCred,
  CodeBuildProjectKMSEncryptedArtifacts,
  CodeBuildProjectManagedImages,
  CodeBuildProjectSourceRepoUrl,
} from '../../src/rules/codebuild';

const testPack = new TestPack([
  CodeBuildProjectEnvVarAwsCred,
  CodeBuildProjectKMSEncryptedArtifacts,
  CodeBuildProjectManagedImages,
  CodeBuildProjectSourceRepoUrl,
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack();
  Aspects.of(stack).add(testPack);
});

describe('Amazon CodeBuild', () => {
  describe('CodeBuildProjectEnvVarAwsCred: CodeBuild projects do not store AWS credentials as plaintext environment variables', () => {
    const ruleId = 'CodeBuildProjectEnvVarAwsCred';
    test('Noncompliance 1', () => {
      new CfnProject(stack, 'rProject1', {
        artifacts: {
          type: 'no_artifacts',
        },
        environment: {
          computeType: 'BUILD_GENERAL1_SMALL',
          image: 'aws/CodeBuild/standard:4.0',
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
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnProject(stack, 'rProject1', {
        artifacts: {
          type: 'no_artifacts',
        },
        environment: {
          computeType: 'BUILD_GENERAL1_SMALL',
          image: 'aws/CodeBuild/standard:4.0',
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
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new CfnProject(stack, 'rProject1', {
        artifacts: {
          type: 'no_artifacts',
        },
        environment: {
          computeType: 'BUILD_GENERAL1_SMALL',
          image: 'aws/CodeBuild/standard:4.0',
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
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new CfnProject(stack, 'rProject1', {
        artifacts: {
          type: 'no_artifacts',
        },
        environment: {
          computeType: 'BUILD_GENERAL1_SMALL',
          image: 'aws/CodeBuild/standard:4.0',
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

      new CfnProject(stack, 'rProject2', {
        artifacts: {
          type: 'no_artifacts',
        },
        environment: {
          computeType: 'BUILD_GENERAL1_SMALL',
          image: 'aws/CodeBuild/standard:4.0',
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

      new CfnProject(stack, 'rProject3', {
        artifacts: {
          type: 'no_artifacts',
        },
        environment: {
          computeType: 'BUILD_GENERAL1_SMALL',
          image: 'aws/CodeBuild/standard:4.0',
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
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('CodeBuildProjectKMSEncryptedArtifacts: Codebuild projects use an AWS KMS key for encryption', () => {
    const ruleId = 'CodeBuildProjectKMSEncryptedArtifacts';
    test('Noncompliance 1', () => {
      new Project(stack, 'rBuildProject', {
        buildSpec: BuildSpec.fromObjectToYaml({
          version: 0.2,
          phases: {
            build: {
              commands: ['echo "foo"'],
            },
          },
        }),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new Project(stack, 'rBuildProject', {
        buildSpec: BuildSpec.fromObjectToYaml({
          version: 0.2,
          phases: {
            build: {
              commands: ['echo "foo"'],
            },
          },
        }),
        encryptionKey: new Key(stack, 'rBuildKey'),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('CodeBuildProjectManagedImages: Codebuild projects use images provided by the CodeBuild service or have a cdk-nag suppression rule explaining the need for a custom image', () => {
    const ruleId = 'CodeBuildProjectManagedImages';
    test('Noncompliance ', () => {
      new Project(stack, 'rBuildProject', {
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
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new Project(stack, 'rBuildProject', {
        buildSpec: BuildSpec.fromObjectToYaml({
          version: 0.2,

          phases: {
            build: {
              commands: ['echo "foo"'],
            },
          },
        }),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('CodeBuildProjectSourceRepoUrl: Codebuild projects with a GitHub or BitBucket source repository utilize OAUTH', () => {
    const ruleId = 'CodeBuildProjectSourceRepoUrl';
    test('Noncompliance 1', () => {
      new CfnProject(stack, 'rProject1', {
        artifacts: {
          type: 'no_artifacts',
        },
        environment: {
          computeType: 'BUILD_GENERAL1_SMALL',
          image: 'aws/CodeBuild/standard:4.0',
          type: 'LINUX_CONTAINER',
        },
        serviceRole: 'someservicerole',
        source: {
          type: 'NO_SOURCE',
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Noncompliance 2', () => {
      new CfnProject(stack, 'Project1', {
        artifacts: {
          type: 'no_artifacts',
        },
        environment: {
          computeType: 'BUILD_GENERAL1_SMALL',
          image: 'aws/CodeBuild/standard:4.0',
          type: 'LINUX_CONTAINER',
        },
        serviceRole: 'someservicerole',
        source: {
          type: 'NO_SOURCE',
          auth: {
            type: 'PERSONAL_ACCESS_TOKEN',
          },
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      new CfnProject(stack, 'rProject1', {
        artifacts: {
          type: 'no_artifacts',
        },
        environment: {
          computeType: 'BUILD_GENERAL1_SMALL',
          image: 'aws/CodeBuild/standard:4.0',
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
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});
