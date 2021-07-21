# cdk-nag

Check CDK applications for best practices. Choose from a variety of available rule packs. Inspired by [cfn_nag](https://github.com/stelligent/cfn_nag)

![](cdk_nag.gif)

## Video tutorial

See cdk-nag in action [here](https://broadcast.amazon.com/videos/365169?ref=GitLab)

## Available Packs

See [RULES](./RULES.md) for more information on all the available packs.

1. [AWS Solutions](./RULES.md#awssolutions)
2. [NIST 800-53](./RULES.md#nist-800-53) (In Progress)

## Usage

### cdk

```typescript
import * as cdk from '@aws-cdk/core';
import { AwsSolutionsChecks } from '@donti/cdk-nag';
import { MyStack } from '../lib/my-stack';

const app = new cdk.App();
const stack = new MyStack(app, 'MyStack');
// Simple rule informational messages
cdk.Aspects.of(app).add(new AwsSolutionsChecks());
// Additional explanations on the purpose of triggered rules
// cdk.Aspects.of(stack).add(new AwsSolutionsChecks({ verbose: true }));
```

### monocdk

```typescript
import * as cdk from 'monocdk';
import { AwsSolutionsChecks } from '@donti/monocdk-nag';
import { MyStack } from '../lib/my-stack';

const app = new cdk.App();
const stack = new MyStack(app, 'MyStack');
// Simple rule informational messages
cdk.Aspects.of(app).add(new AwsSolutionsChecks());
// Additional explanations on the purpose of triggered rules
// cdk.Aspects.of(stack).add(new AwsSolutionsChecks({ verbose: true }));
```

## Suppressing a Rule

<details>
  <summary>Example 1) Default Construct</summary>

```typescript
const test = new SecurityGroup(this, 'test', {
  vpc: new Vpc(this, 'vpc'),
});
test.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
const testCfn = test.node.defaultChild as CfnSecurityGroup;
testCfn.addMetadata('cdk_nag', {
  rules_to_suppress: [
    { id: 'AwsSolutions-EC23', reason: 'at least 10 characters' },
  ],
});
```

</details>

<details>
  <summary>Example 2) Dependent Constructs</summary>

```typescript
const user = new User(this, 'rUser');
user.addToPolicy(
  new PolicyStatement({
    actions: ['s3:PutObject'],
    resources: [new Bucket(this, 'rBucket').arnForObjects('*')],
  }),
);
const cfnUser = user.node.children;
for (const child of cfnUser) {
  const resource = child.node.defaultChild as CfnResource;
  if (resource != undefined && resource.cfnResourceType == 'AWS::IAM::Policy') {
    resource.addMetadata('cdk_nag', {
      rules_to_suppress: [
        {
          id: 'AwsSolutions-IAM5',
          reason:
            'The user is allowed to put objects on all prefixes in the specified bucket.',
        },
      ],
    });
  }
}
```

</details>

## Rules and Property Overrides

In some cases L2 Constructs do not have a native option to remediate an issue and must be fixed via [Raw Overrides](https://docs.aws.amazon.com/cdk/latest/guide/cfn_layer.html#cfn_layer_raw). Since raw overrides take place after template synthesis these fixes are not caught by the cdk_nag. In this case you should remediate the issue and suppress the issue like in the following example.

<details>
  <summary>Example) Property Overrides</summary>

```typescript
const instance = new Instance(stack, 'rInstance', {
  vpc: new Vpc(stack, 'rVpc'),
  instanceType: new InstanceType(InstanceClass.T3),
  machineImage: MachineImage.latestAmazonLinux(),
});
const cfnIns = instance.node.defaultChild as CfnInstance;
cfnIns.addPropertyOverride('DisableApiTermination', true);
cfnIns.addMetadata('cdk_nag', {
  rules_to_suppress: [
    {
      id: 'AwsSolutions-EC29',
      reason: 'Remediated through property override ',
    },
  ],
});
```

</details>

## Install

<details>
  <summary>Python</summary>

#### GitLab Registry

1. If you have not already done so, setup authentication to the GitLab server
   - Generate a [personal access](https://gitlab.aws.dev/-/profile/personal_access_tokens) token with at least `read_api` access
2. Activate your python virtual environment
3. Install the latest version of the package
   - cdk
     - `pip install cdk-nag --extra-index-url https://__token__:<your_token>@gitlab.aws.dev/api/v4/projects/6854/packages/pypi/simple`
   - monocdk
     - `pip install monocdk-nag --extra-index-url https://__token__:<your_token>@gitlab.aws.dev/api/v4/projects/6854/packages/pypi/simple`
4. In your local CDK application add the following to `setup.py`

   - cdk

     ```python
       install_requires=[
             "aws-cdk.core>=1.110.0",
             "cdk-nag",
             ...
       ]
     ```

   - monocdk

     ```python
       install_requires=[
             "monocdk>=1.110.0",
             "monocdk-nag",
             ...
       ]
     ```

Unfortunately setuptools does not have a way to conceal secrets. There are many solutions to creating a local file and loading the variable from a file, just make sure you add that file to you `.gitignore`

#### Local File Configuration

1. Download the latest [release](https://gitlab.aws.dev/wwps-natsec/cdk/cdk_nag/-/releases) for python
2. In your local CDK application, add the absolute path of the `.whl` to `setup.py`. **(note the localhost in filepath)**

   - cdk

     ```python
       install_requires=[
             "aws-cdk.core>=1.110.0",
             "cdk-nag @ file://localhost/path/to/cdk_nag-x.x.x-py3-none-any.whl",
             ...
       ]
     ```

   - monocdk

     ```python
       install_requires=[
             "monocdk>=1.110.0",
             "monocdk-nag @ file://localhost/path/to/cdk_nag-x.x.x-py3-none-any.whl",
             ...
       ]
     ```

</details>

<details>
  <summary>NodeJs</summary>

#### GitLab Registry

1. If you have not already done so, setup authentication to the GitLab server
   - Generate a [personal access](https://gitlab.aws.dev/-/profile/personal_access_tokens) token with at least `read_api` access
2. Set the registry for the @donti namespace
   - `npm config set @donti:registry https://gitlab.aws.dev/api/v4/projects/6854/packages/npm/`
   - `echo "//gitlab.aws.dev/api/v4/projects/6854/packages/npm/:_authToken="<your_token>"`
3. In your local CDK application, add the package to `package.json`.

   - cdk

     ```json
       "dependencies": {
         "@aws-cdk/core": "^1.110.0",
         "@donti/cdk-nag": "^x.x.x",
         ...
       },
     ```

   - monocdk

     ```json
       "dependencies": {
         "@monocdk": "^1.110.0",
         "@donti/monocdk-nag": "^x.x.x",
         ...
       },
     ```

#### Local File Configuration

1. Download the latest [release](https://gitlab.aws.dev/wwps-natsec/cdk/cdk_nag/-/releases) for node
2. In your local CDK application, add the absolute path of the `.jsii.tgz` to `package.json`.

   - cdk

     ```json
       "dependencies": {
         "@aws-cdk/core": "^1.110.0",
         "@donti/cdk-nag": "file:cdk-nag@x.x.x.jsii.tgz",
         ...
       },
     ```

   - monocdk

     ```json
       "dependencies": {
         "monocdk": "^1.110.0",
         "@donti/monocdk-nag": "file:monocdk-nag@x.x.x.jsii.tgz",
         ...
       },
     ```

   </details>

<details>
  <summary>Java</summary>

#### GitLab Registry

_I haven't figured out the GitLab registry for Maven yet. Let me know if you know how!_

#### Local File Configuration

1. Download the latest [release](https://gitlab.aws.dev/wwps-natsec/cdk/cdk_nag/-/releases) for java
2. In your local CDK application, add the absolute path of the `.jar` to `pom.xml`.

   - cdk

     ```xml
     <dependencies>
         <dependency>
             <groupId>software.amazon.awscdk</groupId>
             <artifactId>core</artifactId>
             <version>${cdk.version}</version>
         </dependency>
         <dependency>
             <groupId>com.donti.awscdk</groupId>
             <artifactId>cdknag</artifactId>
             <systemPath>path/to/com/donti/awscdk/cdknag/x.x.x/cdknag-x.x.x.jar</systemPath>
         </dependency>
         ...
     </dependencies>
     ```

   - monocdk

     ```xml
     <dependencies>
         <dependency>
             <groupId>software.amazon.awscdk</groupId>
             <artifactId>monocdk</artifactId>
             <version>${cdk.version}</version>
         </dependency>
         <dependency>
             <groupId>com.donti.awscdk</groupId>
             <artifactId>monocdknag</artifactId>
             <systemPath>path/to/com/donti/awscdk/monocdknag/x.x.x/monocdknag-x.x.x.jar</systemPath>
         </dependency>
         ...
     </dependencies>
     ```

   </details>

<details>
  <summary>.NET Setup</summary>

#### GitLab Registry

1. If you have not already done so, setup authentication to the GitLab server
   - Generate a [personal access](https://gitlab.aws.dev/-/profile/personal_access_tokens) token with at least `read_api` access
   - `nuget source Add -Name "GitLab" -Source "https://gitlab.aws.dev/api/v4/projects/6854/packages/nuget/index.json" -UserName <your_username> -Password <your_token>"`
2. In your local CDK application in the same directory as the Visual Studio project `.csproj` file, run the following
   - cdk
     `dotnet add CdkNag --source "GitLab"`
   - monocdk
     `dotnet add MonocdkNag --source "GitLab"`

#### Local File Configuration

1. Download the latest [release](https://gitlab.aws.dev/wwps-natsec/cdk/cdk_nag/-/releases) for .NET
2. _I have the binaries built, haven't figured out the local install yet. Let me know if you know how!_

</details>

## Contributing

See [CONTRIBUTING](./CONTRIBUTING.md) for more information.

## License

This project will hopefully licensed under the Apache-2.0 License.
