/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
const { awscdk } = require('projen');
const MAJOR = 1;
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Arun Donti',
  authorAddress: 'donti@amazon.com',
  cdkVersion: '1.123.0',
  defaultReleaseBranch: 'main',
  majorVersion: MAJOR,
  npmDistTag: 'latest-1',
  releaseBranches: { 'v2-main': { majorVersion: 2 } },
  name: 'cdk-nag',
  description:
    'Check CDK applications for best practices using a combination on available rule packs.',
  repositoryUrl: 'https://github.com/cdklabs/cdk-nag.git',
  cdkDependencies: [
    '@aws-cdk/aws-apigateway',
    '@aws-cdk/aws-apigatewayv2',
    '@aws-cdk/aws-apigatewayv2-authorizers',
    '@aws-cdk/aws-apigatewayv2-integrations',
    '@aws-cdk/aws-applicationautoscaling',
    '@aws-cdk/aws-appsync',
    '@aws-cdk/aws-athena',
    '@aws-cdk/aws-autoscaling',
    '@aws-cdk/aws-backup',
    '@aws-cdk/aws-certificatemanager',
    '@aws-cdk/aws-codebuild',
    '@aws-cdk/aws-cloud9',
    '@aws-cdk/aws-cloudfront',
    '@aws-cdk/aws-cloudfront-origins',
    '@aws-cdk/aws-cloudtrail',
    '@aws-cdk/aws-cloudwatch',
    '@aws-cdk/aws-cloudwatch-actions',
    '@aws-cdk/aws-cognito',
    '@aws-cdk/aws-dax',
    '@aws-cdk/aws-dms',
    '@aws-cdk/aws-docdb',
    '@aws-cdk/aws-dynamodb',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-ecr',
    '@aws-cdk/aws-ecs',
    '@aws-cdk/aws-efs',
    '@aws-cdk/aws-eks',
    '@aws-cdk/aws-elasticache',
    '@aws-cdk/aws-elasticbeanstalk',
    '@aws-cdk/aws-elasticloadbalancing',
    '@aws-cdk/aws-elasticloadbalancingv2',
    '@aws-cdk/aws-elasticsearch',
    '@aws-cdk/aws-emr',
    '@aws-cdk/aws-glue',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-kinesis',
    '@aws-cdk/aws-kinesisanalytics',
    '@aws-cdk/aws-kinesisfirehose',
    '@aws-cdk/aws-kms',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-logs',
    '@aws-cdk/aws-mediastore',
    '@aws-cdk/aws-msk',
    '@aws-cdk/aws-neptune',
    '@aws-cdk/aws-opensearchservice',
    '@aws-cdk/aws-quicksight',
    '@aws-cdk/aws-rds',
    '@aws-cdk/aws-redshift',
    '@aws-cdk/aws-sagemaker',
    '@aws-cdk/aws-secretsmanager',
    '@aws-cdk/aws-sns',
    '@aws-cdk/aws-sqs',
    '@aws-cdk/aws-stepfunctions',
    '@aws-cdk/aws-s3',
    '@aws-cdk/aws-timestream',
    '@aws-cdk/aws-wafv2',
    '@aws-cdk/core',
  ],
  devDeps: ['@aws-cdk/assert@^1.123'],
  pullRequestTemplateContents: [
    '',
    '----',
    '',
    '*By submitting this pull request, I confirm that my contribution is made under the terms of the Apache-2.0 license*',
  ],
  eslintOptions: { prettier: true },
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
        image: 'jsii/superchain:1-buster-slim-node14',
      },
    },
  },
  githubOptions: {
    mergify: false,
  },
  buildWorkflow: true,
  workflowContainerImage: 'jsii/superchain:1-buster-slim-node14',
  release: true,
  postBuildSteps: [
    {
      name: 'remove changelog',
      run: 'rm dist/changelog.md',
    },
    {
      name: 'Setup for monocdk build',
      run: "rm yarn.lock\nrm .projenrc.js\nmv .projenrc.monocdk.js .projenrc.js\nfind ./src -type f | xargs sed -i  's,@aws-cdk/core,monocdk,g'\nfind ./test -type f | xargs sed -i  's,@aws-cdk/core,monocdk,g'\nfind ./src -type f | xargs sed -i  's,@aws-cdk,monocdk,g'\nfind ./test -type f | xargs sed -i  's,@aws-cdk,monocdk,g'\nfind ./test -type f | xargs sed -i  's,monocdk/assert,@monocdk-experiment/assert,g'",
    },
    {
      name: 'Bump to next version',
      run: 'npx projen bump',
    },
    {
      name: 'Build for monocdk',
      run: 'npx projen build',
    },
    {
      name: 'Unbump',
      run: 'npx projen unbump',
    },
  ],
  gitignore: ['.vscode'],
  projenVersion: '0.45.4',
});
project.package.addField('resolutions', {
  'ansi-regex': '^5.0.1',
  'json-schema': '^0.4.0',
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
const monocdkTask = project.addTask('release:monocdk', {
  env: {
    RELEASE: 'true',
    MAJOR: MAJOR,
  },
});
monocdkTask.exec('git reset --hard', { name: 'reset changes' });
monocdkTask.exec('[ -e dist/changelog.md ] && rm dist/changelog.md', {
  name: 'remove changelog',
});
monocdkTask.exec(
  "rm yarn.lock\nrm .projenrc.js\nmv .projenrc.monocdk.js .projenrc.js\nfind ./src -type f | xargs sed -i  's,@aws-cdk/core,monocdk,g'\nfind ./test -type f | xargs sed -i  's,@aws-cdk/core,monocdk,g'\nfind ./src -type f | xargs sed -i  's,@aws-cdk,monocdk,g'\nfind ./test -type f | xargs sed -i  's,@aws-cdk,monocdk,g'\nfind ./test -type f | xargs sed -i  's,monocdk/assert,@monocdk-experiment/assert,g'",
  { name: 'Setup for monocdk build' }
);
monocdkTask.spawn('bump');
monocdkTask.spawn('build');
monocdkTask.spawn('unbump');
monocdkTask.exec('git reset --hard', { name: 'reset changes' });
const releaseWorkflow = project.tryFindObjectFile(
  '.github/workflows/release.yml'
);
releaseWorkflow.addOverride('jobs.release.env.RELEASE', 'true');
releaseWorkflow.addOverride('jobs.release.env.MAJOR', 1);
project.buildWorkflow.file.addOverride(
  'jobs.build.steps',
  project.buildWorkflow.jobs.build.steps.concat([
    {
      name: 'Setup for monocdk build',
      run: "rm yarn.lock\nrm .projenrc.js\nmv .projenrc.monocdk.js .projenrc.js\nfind ./src -type f | xargs sed -i  's,@aws-cdk/core,monocdk,g'\nfind ./test -type f | xargs sed -i  's,@aws-cdk/core,monocdk,g'\nfind ./src -type f | xargs sed -i  's,@aws-cdk,monocdk,g'\nfind ./test -type f | xargs sed -i  's,@aws-cdk,monocdk,g'\nfind ./test -type f | xargs sed -i  's,monocdk/assert,@monocdk-experiment/assert,g'",
    },
    {
      name: 'Build for monocdk',
      run: 'npx projen build',
    },
  ])
);
project.synth();
