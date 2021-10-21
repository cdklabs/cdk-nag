/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { CfnReplicationInstance } from '@aws-cdk/aws-dms';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R5Checks } from '../../src';

describe('AWS Database Migration Service (AWS DMS)', () => {
  test('NIST.800.53.R5-DMSReplicationNotPublic: -  DMS replication instances are not public - (Control IDs: AC-2(6), AC-3, AC-3(7), AC-4(21), AC-6, AC-17b, AC-17(1), AC-17(1), AC-17(4)(a), AC-17(9), AC-17(10), MP-2, SC-7a, SC-7b, SC-7c, SC-7(2), SC-7(3), SC-7(7), SC-7(9)(a), SC-7(11), SC-7(12), SC-7(16), SC-7(20), SC-7(21), SC-7(24)(b), SC-7(25), SC-7(26), SC-7(27), SC-7(28), SC-25)', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new NIST80053R5Checks());
    new CfnReplicationInstance(positive, 'rInstance', {
      replicationInstanceClass: 'dms.t2.micro',
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-DMSReplicationNotPublic:'
          ),
        }),
      })
    );

    const negative = new Stack();
    Aspects.of(negative).add(new NIST80053R5Checks());
    new CfnReplicationInstance(negative, 'rInstance', {
      replicationInstanceClass: 'dms.t2.micro',
      publiclyAccessible: false,
    });
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-DMSReplicationNotPublic:'
          ),
        }),
      })
    );
  });
});
