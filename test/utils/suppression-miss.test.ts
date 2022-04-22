/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { Stack } from '@aws-cdk/core';
import { NagSuppressions } from '../../src/nag-suppressions';

describe('Suppression misses throws error', () => {
  test('Test path miss', () => {
    const stack = new Stack();
    try {
      NagSuppressions.addResourceSuppressionsByPath(stack, '/No/Such/Path', [
        { id: 'NA', reason: '............' },
      ]);
      throw new Error('Did not fail');
    } catch (err) {
      expect(err + '').toBe(
        'Error: Suppression path did not match any resource'
      );
    }
  });
});
