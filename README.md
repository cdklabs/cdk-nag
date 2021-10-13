<!--
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
-->

# cdk-nag

| Language   | cdk-nag                                                                                   | monocdk-nag                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Python     | [![PyPI version](https://badge.fury.io/py/cdk-nag.svg)](https://badge.fury.io/py/cdk-nag) | [![PyPI version](https://badge.fury.io/py/monocdk-nag.svg)](https://badge.fury.io/py/monocdk-nag) |
| TypeScript | [![npm version](https://badge.fury.io/js/cdk-nag.svg)](https://badge.fury.io/js/cdk-nag)  | [![npm version](https://badge.fury.io/js/monocdk-nag.svg)](https://badge.fury.io/js/monocdk-nag)  |

Check CDK applications for best practices using a combination of available rule packs. Inspired by [cfn_nag](https://github.com/stelligent/cfn_nag)

![](cdk_nag.gif)

## Available Packs

See [RULES](./RULES.md) for more information on all the available packs.

1. [AWS Solutions](./RULES.md#awssolutions)
2. [HIPAA Security](./RULES.md#hipaa-security)
3. [NIST 800-53](./RULES.md#nist-800-53)

## Usage

### cdk

```typescript
import { App, Aspects } from '@aws-cdk/core';
import { CdkTestStack } from '../lib/cdk-test-stack';
import { AwsSolutionsChecks } from 'cdk-nag';

const app = new App();
new CdkTestStack(app, 'CdkNagDemo');
// Simple rule informational messages
Aspects.of(app).add(new AwsSolutionsChecks());
// Additional explanations on the purpose of triggered rules
// Aspects.of(stack).add(new AwsSolutionsChecks({ verbose: true }));
```

### monocdk

```typescript
import { App, Aspects } from 'monocdk';
import { AwsSolutionsChecks } from 'monocdk-nag';
import { MyStack } from '../lib/my-stack';

const app = new App();
new CdkTestStack(app, 'CdkNagDemo');
// Simple rule informational messages
Aspects.of(app).add(new AwsSolutionsChecks());
// Additional explanations on the purpose of triggered rules
// Aspects.of(stack).add(new AwsSolutionsChecks({ verbose: true }));
```

## Suppressing a Rule

<details>
  <summary>Example 1) Default Construct</summary>

```typescript
import { SecurityGroup, Vpc, Peer, Port } from '@aws-cdk/aws-ec2';
import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { addResourceSuppressions } from 'cdk-nag';

export class CdkTestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const test = new SecurityGroup(this, 'test', {
      vpc: new Vpc(this, 'vpc'),
    });
    test.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    addResourceSuppressions(test, [
      { id: 'AwsSolutions-EC23', reason: 'lorem ipsum' },
    ]);
  }
}
```

</details>

<details>
  <summary>Example 2) Child Constructs</summary>

```typescript
import { User, PolicyStatement } from '@aws-cdk/aws-iam';
import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { addResourceSuppressions } from 'cdk-nag';

export class CdkTestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const user = new User(this, 'rUser');
    user.addToPolicy(
      new PolicyStatement({
        actions: ['s3:PutObject'],
        resources: ['arn:aws:s3:::bucket_name/*'],
      })
    );
    // Enable adding suppressions to child constructs
    addResourceSuppressions(
      user,
      [{ id: 'AwsSolutions-IAM5', reason: 'lorem ipsum' }],
      true
    );
  }
}
```

</details>

<details>
  <summary>Example 3) Stack Level </summary>

```typescript
import { App, Aspects } from '@aws-cdk/core';
import { CdkTestStack } from '../lib/cdk-test-stack';
import { AwsSolutionsChecks, addStackSuppressions } from 'cdk-nag';

const app = new App();
const stack = new CdkTestStack(app, 'CdkNagDemo');
Aspects.of(app).add(new AwsSolutionsChecks());
addStackSuppressions(stack, [
  { id: 'AwsSolutions-EC23', reason: 'lorem ipsum' },
]);
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

## Contributing

See [CONTRIBUTING](./CONTRIBUTING.md) for more information.

## License

This project is licensed under the Apache-2.0 License.
