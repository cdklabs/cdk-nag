/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
const { AwsCdkConstructLibrary } = require('projen');
const project = new AwsCdkConstructLibrary({
  author: 'Arun Donti',
  authorAddress: 'donti@amazon.com',
  cdkVersion: '1.123.0',
  defaultReleaseBranch: 'main',
  name: 'monocdk-nag',
  description:
    'Check CDK applications for best practices using a combination on available rule packs.',
  repositoryUrl: 'https://github.com/cdklabs/cdk-nag.git',

  cdkDependencies: ['monocdk'],
  cdkTestDependencies: ['@monocdk-experiment/assert'],
  publishToPypi: {
    distName: 'monocdk-nag',
    module: 'monocdk_nag',
  },
});

project.synth();
