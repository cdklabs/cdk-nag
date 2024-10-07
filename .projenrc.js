/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
const { awscdk, vscode } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Arun Donti',
  authorAddress: 'donti@amazon.com',
  cdkVersion: '2.156.0',
  defaultReleaseBranch: 'main',
  majorVersion: 2,
  npmDistTag: 'latest',
  name: 'cdk-nag',
  description:
    'Check CDK v2 applications for best practices using a combination on available rule packs.',
  repositoryUrl: 'https://github.com/cdklabs/cdk-nag.git',
  devDeps: ['@aws-cdk/assert@^2.18'],
  publishToPypi: {
    distName: 'cdk-nag',
    module: 'cdk_nag',
  },
  publishToNuget: {
    packageId: 'Cdklabs.CdkNag',
    dotNetNamespace: 'Cdklabs.CdkNag',
  },
  publishToMaven: {
    mavenGroupId: 'io.github.cdklabs',
    javaPackage: 'io.github.cdklabs.cdknag',
    mavenArtifactId: 'cdknag',
    mavenEndpoint: 'https://s01.oss.sonatype.org',
  },
  publishToGo: {
    moduleName: 'github.com/cdklabs/cdk-nag-go',
    gitUserName: 'cdklabs-automation',
    gitUserEmail: 'cdklabs-automation@amazon.com',
  },
  projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN',
  autoApproveOptions: {
    allowedUsernames: ['cdklabs-automation', 'dontirun'],
    secret: 'GITHUB_TOKEN',
  },
  autoApproveUpgrades: true,
  depsUpgradeOptions: {
    ignoreProjen: false,
    workflowOptions: {
      labels: ['auto-approve'],
      secret: 'PROJEN_GITHUB_TOKEN',
    },
  },
  eslintOptions: { prettier: true },
  buildWorkflow: true,
  release: true,
  gitignore: ['.vscode', '**/.DS_Store'],
});
project.package.addField('prettier', {
  singleQuote: true,
  semi: true,
  trailingComma: 'es5',
});
project.eslint.addRules({
  'prettier/prettier': [
    'error',
    { singleQuote: true, semi: true, trailingComma: 'es5' },
  ],
});
eslint = project.tasks
  .tryFind('eslint')
  .prependExec('npx prettier --write RULES.md');
setup = project.addTask('dev-container-setup', {
  exec: 'sudo chown superchain . -R',
});
def = project.tasks.tryFind('default');
def.prependExec('python3 -m pip install pre-commit && pre-commit install');

new vscode.DevContainer(project, {
  features: [
    { name: 'docker-in-docker' },
    { name: 'ghcr.io/devcontainers/features/github-cli' },
  ],
  tasks: [setup, def],
  dockerImage: {
    containerUser: 'superchain',
    remoteUser: 'superchain',
    extensions: ['dbaeumer.vscode-eslint'],
    dockerFile: './Dockerfile',
  },
});
project.package.addField('resolutions', {
  'jsii-rosetta': '~5.0.7',
  '@babel/types': '7.25.7',
  '@types/babel__traverse': '7.18.2',
  '@types/prettier': '2.6.0',
});
project.synth();
