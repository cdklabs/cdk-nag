/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
const { awscdk, DependencyType } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
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
  devDeps: ['constructs@^3.2.27'],
  publishToPypi: {
    distName: 'monocdk-nag',
    module: 'monocdk_nag',
  },
  publishToNuget: {
    packageId: 'Cdklabs.MonocdkNag',
    dotNetNamespace: 'Cdklabs.MonocdkNag',
  },
  publishToMaven: {
    mavenGroupId: 'io.github.cdklabs',
    javaPackage: 'io.github.cdklabs.monocdknag',
    mavenArtifactId: 'monocdknag',
    mavenEndpoint: 'https://s01.oss.sonatype.org',
  },
});
project.deps.removeDependency('@aws-cdk/core', DependencyType.PEER);
project.deps.removeDependency('@aws-cdk/core', DependencyType.RUNTIME);
project.deps.removeDependency('@aws-cdk/assert', DependencyType.TEST);
project.deps.removeDependency('@aws-cdk/assertions', DependencyType.TEST);
project.package.addField('resolutions', {
  'ansi-regex': '^5.0.1',
  'json-schema': '^0.4.0',
  '@types/prettier': '2.6.0',
});
project.synth();
