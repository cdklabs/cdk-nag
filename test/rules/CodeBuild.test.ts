/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Aspects, CfnResource, Stack } from 'aws-cdk-lib';
import {
  BuildSpec,
  CfnProject,
  LinuxBuildImage,
  Project,
} from 'aws-cdk-lib/aws-codebuild';
import { Key } from 'aws-cdk-lib/aws-kms';
import { IConstruct } from 'constructs';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  CodeBuildProjectEnvVarAwsCred,
  CodeBuildProjectKMSEncryptedArtifacts,
  CodeBuildProjectManagedImages,
  CodeBuildProjectPrivilegedModeDisabled,
  CodeBuildProjectSourceRepoUrl,
} from '../../src/rules/codebuild';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        CodeBuildProjectEnvVarAwsCred,
        CodeBuildProjectKMSEncryptedArtifacts,
        CodeBuildProjectManagedImages,
        CodeBuildProjectPrivilegedModeDisabled,
        CodeBuildProjectSourceRepoUrl,
      ];
      rules.forEach((rule) => {
        this.applyRule({
          info: 'foo.',
          explanation: 'bar.',
          level: NagMessageLevel.ERROR,
          rule: rule,
          node: node,
        });
      });
    }
  }
}

describe('Amazon CodeBuild', () => {
  test('CodeBuildProjectEnvVarAwsCred: CodeBuild projects do not store AWS credentials as plaintext environment variables', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnProject(nonCompliant, 'rProject1', {
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

    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CodeBuildProjectEnvVarAwsCred:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnProject(nonCompliant2, 'rProject1', {
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

    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CodeBuildProjectEnvVarAwsCred:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    new CfnProject(nonCompliant3, 'rProject1', {
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

    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CodeBuildProjectEnvVarAwsCred:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnProject(compliant, 'rProject1', {
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

    new CfnProject(compliant, 'rProject2', {
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

    new CfnProject(compliant, 'rProject3', {
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

    const messages4 = SynthUtils.synthesize(compliant).messages;
    expect(messages4).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CodeBuildProjectEnvVarAwsCred:'),
        }),
      })
    );
  });

  test('CodeBuildProjectKMSEncryptedArtifacts: Codebuild projects use an AWS KMS key for encryption', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Project(nonCompliant, 'rBuildProject', {
      buildSpec: BuildSpec.fromObjectToYaml({
        version: 0.2,
        phases: {
          build: {
            commands: ['echo "foo"'],
          },
        },
      }),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'CodeBuildProjectKMSEncryptedArtifacts:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Project(compliant, 'rBuildProject', {
      buildSpec: BuildSpec.fromObjectToYaml({
        version: 0.2,
        phases: {
          build: {
            commands: ['echo "foo"'],
          },
        },
      }),
      encryptionKey: new Key(compliant, 'rBuildKey'),
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'CodeBuildProjectKMSEncryptedArtifacts:'
          ),
        }),
      })
    );
  });

  test('CodeBuildProjectManagedImages: Codebuild projects use images provided by the CodeBuild service or have a cdk_nag suppression rule explaining the need for a custom image', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Project(nonCompliant, 'rBuildProject', {
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
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CodeBuildProjectManagedImages:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Project(compliant, 'rBuildProject', {
      buildSpec: BuildSpec.fromObjectToYaml({
        version: 0.2,

        phases: {
          build: {
            commands: ['echo "foo"'],
          },
        },
      }),
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CodeBuildProjectManagedImages:'),
        }),
      })
    );
  });

  test('CodeBuildProjectPrivilegedModeDisabled: Codebuild projects have privileged mode disabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new Project(nonCompliant, 'rBuildProject', {
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
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'CodeBuildProjectPrivilegedModeDisabled:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new Project(compliant, 'rBuildProject', {
      buildSpec: BuildSpec.fromObjectToYaml({
        version: 0.2,
        phases: {
          build: {
            commands: ['echo "foo"'],
          },
        },
      }),
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'CodeBuildProjectPrivilegedModeDisabled:'
          ),
        }),
      })
    );
  });

  test('CodeBuildProjectSourceRepoUrl: Codebuild projects with a GitHub or BitBucket source repository utilize OAUTH', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnProject(nonCompliant, 'rProject1', {
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

    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CodeBuildProjectSourceRepoUrl:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnProject(compliant, 'rProject1', {
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

    const messages6 = SynthUtils.synthesize(compliant).messages;
    expect(messages6).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CodeBuildProjectSourceRepoUrl:'),
        }),
      })
    );
  });
});
