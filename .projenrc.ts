/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CdklabsConstructLibrary } from 'cdklabs-projen-project-types';
import { vscode, DevEnvironmentDockerImage } from 'projen';
const project = new CdklabsConstructLibrary({
  projenrcTs: true,
  private: false,
  author: 'Amazon Web Services',
  authorAddress: 'aws-cdk-dev@amazon.com',
  defaultReleaseBranch: 'main',
  cdkVersion: '2.176.0',
  jsiiVersion: '5.8',
  majorVersion: 2,
  npmDistTag: 'latest',
  name: 'cdk-nag',
  description:
    'Check CDK v2 applications for best practices using a combination on available rule packs.',
  repositoryUrl: 'https://github.com/cdklabs/cdk-nag.git',
  devDeps: ['@aws-cdk/assert@^2.18'],
  publishToMaven: {
    mavenGroupId: 'io.github.cdklabs',
    javaPackage: 'io.github.cdklabs.cdknag',
    mavenArtifactId: 'cdknag',
    mavenServerId: 'central-ossrh',
  },
  publishToNuget: {
    packageId: 'Cdklabs.CdkNag',
    dotNetNamespace: 'Cdklabs.CdkNag',
  },
  eslintOptions: { dirs: ['src'], prettier: true },
  buildWorkflow: true,
  release: true,
  gitignore: ['.vscode', '**/.DS_Store'],
});
project.package.addField('prettier', {
  singleQuote: true,
  semi: true,
  trailingComma: 'es5',
});
project.eslint!.addRules({
  'prettier/prettier': [
    'error',
    { singleQuote: true, semi: true, trailingComma: 'es5' },
  ],
});
project.tasks
  .tryFind('eslint')!
  .prependExec('npx prettier --write RULES.md');
const setup = project.addTask('dev-container-setup', {
  exec: 'sudo chown superchain . -R',
});
const def = project.tasks.tryFind('default')!;
def.prependExec('python3 -m pip install pre-commit && pre-commit install');

const devContainer = new vscode.DevContainer(project, {
  features: [
    { name: 'docker-in-docker' },
    { name: 'ghcr.io/devcontainers/features/github-cli' },
  ],
  tasks: [setup, def],
  dockerImage: DevEnvironmentDockerImage.fromFile('./Dockerfile'),
  vscodeExtensions: ['dbaeumer.vscode-eslint'],
});
devContainer.config.containerUser = 'superchain';
devContainer.config.remoteUser = 'superchain';
project.synth();
