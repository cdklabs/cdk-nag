/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CdklabsConstructLibrary } from 'cdklabs-projen-project-types';
import { vscode, DevEnvironmentDockerImage, javascript } from 'projen';
const project = new CdklabsConstructLibrary({
  name: 'cdk-nag',
  majorVersion: 3,
  projenrcTs: true,
  private: false,
  packageManager: javascript.NodePackageManager.YARN_BERRY,

  author: 'Amazon Web Services',
  authorAddress: 'aws-cdk-dev@amazon.com',
  description:
    'Check CDK v2 applications for best practices using a combination on available rule packs.',
  repositoryUrl: 'https://github.com/cdklabs/cdk-nag.git',

  cdkVersion: '2.257.0',
  jsiiVersion: '6.0.x',
  typescriptVersion: '6.0.x',
  devDeps: ['@aws-cdk/assert@^2.18'],

  release: true,
  defaultReleaseBranch: 'main',
  npmDistTag: 'latest',
  enablePRAutoMerge: true,
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
  rosettaOptions: { strict: false },
  eslintOptions: { dirs: ['src'], prettier: true },
  buildWorkflow: true,
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
project.tasks.tryFind('eslint')!.prependExec('prettier --write RULES.md');
const setup = project.addTask('dev-container-setup', {
  exec: 'sudo chown superchain . -R',
});
const setupPreCommit = project.tasks.addTask('pre-commit', {
  condition: `node -e "process.exit(require('fs').existsSync('.git/hooks/pre-commit') ? 1 : 0)"`,
  steps: [
    { execArgs: ['python3', '-m', 'pip', 'install', 'pre-commit'] },
    { execArgs: ['pre-commit', 'install'] },
  ],
});
const def = project.tasks.tryFind('default')!;
def.prependSpawn(setupPreCommit);

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
