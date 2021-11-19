/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
const { AwsCdkConstructLibrary } = require('projen');
const project = new AwsCdkConstructLibrary({
  author: 'Arun Donti',
  authorAddress: 'donti@amazon.com',
  cdkVersion: '2.0.0-rc.22',
  defaultReleaseBranch: 'v2-main',
  majorVersion: '2',
  deps: ['constructs@^10.0.5', 'aws-cdk-lib@^2.0.0-rc.22'],
  devDeps: ['constructs@^10.0.5', 'aws-cdk-lib@^2.0.0-rc.22'],
  peerDeps: ['constructs@^10.0.5', 'aws-cdk-lib@^2.0.0-rc.22'],
  name: 'cdk-nag',
  description:
    'Check CDK v2 applications for best practices using a combination on available rule packs.',
  repositoryUrl: 'https://github.com/cdklabs/cdk-nag.git',
  publishToPypi: {
    distName: 'cdk-nag',
    module: 'cdk_nag',
  },
  projenUpgradeSecret: 'CDK_AUTOMATION_GITHUB_TOKEN',
  autoApproveOptions: {
    allowedUsernames: ['dontirun'],
    secret: 'GITHUB_TOKEN',
  },
  autoApproveUpgrades: true,
  depsUpgradeOptions: {
    ignoreProjen: false,
    workflowOptions: {
      labels: ['auto-approve'],
      secret: 'CDK_AUTOMATION_GITHUB_TOKEN',
      container: {
        image: 'jsii/superchain:1-buster-slim-node12',
      },
    },
  },
  eslintOptions: { prettier: true },
  buildWorkflow: true,
  release: true,
  gitignore: ['.vscode'],
});
project.package.addField('resolutions', {
  'ansi-regex': '^5.0.1',
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
project.synth();
