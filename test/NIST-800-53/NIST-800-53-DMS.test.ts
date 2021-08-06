/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { CfnReplicationInstance } from '@aws-cdk/aws-dms';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053Checks } from '../../src';
describe('AWS Database Migration Service (AWS DMS)', () => {
  test('nist80053DMSReplication: DMS replication instances are not public - (Control ID: AC-4)', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new NIST80053Checks());
    new CfnReplicationInstance(positive, 'rInstance', {
      replicationInstanceClass: 'dms.t2.micro',
      publiclyAccessible: true,
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53-DMSReplicationNotPublic:'),
        }),
      })
    );

    const negative = new Stack();
    Aspects.of(negative).add(new NIST80053Checks());
    new CfnReplicationInstance(negative, 'rInstance', {
      replicationInstanceClass: 'dms.t2.micro',
      publiclyAccessible: false,
    });
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53-DMSReplicationNotPublic:'),
        }),
      })
    );
  });
});