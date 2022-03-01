/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { flattenCfnReference } from '../../src/utils/flatten-cfn-reference';

describe('Flatten CloudFormation Reference', () => {
  test('Test with real-world example', () => {
    const obj = {
      'Fn::Join': [
        '',
        [
          'arn:',
          {
            Ref: 'AWS::Partition',
          },
          ':s3:::',
          {
            'Fn::Sub': 'cdk-62b12fb5cc-assets-${AWS::AccountId}-eu-west-2',
          },
          '/*',
        ],
      ],
    };

    expect(flattenCfnReference(obj)).toBe(
      'arn:<AWS::Partition>:s3:::cdk-62b12fb5cc-assets-<AWS::AccountId>-eu-west-2/*'
    );
  });

  test('Test importvalue', () => {
    const obj = {
      'Fn::ImportValue': 'some-cross-stack-reference',
    };

    expect(flattenCfnReference(obj)).toBe('some-cross-stack-reference');
  });

  test('Test attribute', () => {
    const obj = {
      'Fn::GetAtt': ['another-resource', 'arn'],
    };

    expect(flattenCfnReference(obj)).toBe('<another-resource.arn>');
  });

  test('Test graceful reaction to invalid formats', () => {
    const obj = {
      'Fn::ImportValue': {
        'function-not-covered': 42,
      },
    };

    expect(flattenCfnReference(obj)).toBe('{"function-not-covered":42}');
  });

  test('Ordinary strings are unchanged', () => {
    const obj = 'test string';

    expect(flattenCfnReference(obj)).toBe('test string');
  });

  test('strings with template syntax are simplified', () => {
    const obj = 'test ${string}';

    expect(flattenCfnReference(obj)).toBe('test <string>');
  });

  test('Graceful reaction to undefined', () => {
    expect(flattenCfnReference(undefined)).toBe('');
  });
});
