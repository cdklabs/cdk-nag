/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Arun Donti',
  authorAddress: 'donti@amazon.com',
  cdkVersion: '2.45.0',
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
      container: {
        image: 'jsii/superchain:1-buster-slim-node14',
      },
    },
  },
  workflowContainerImage: 'jsii/superchain:1-buster-slim-node14',
  eslintOptions: { prettier: true },
  buildWorkflow: true,
  release: true,
  gitignore: ['.vscode'],
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
project.synth();
