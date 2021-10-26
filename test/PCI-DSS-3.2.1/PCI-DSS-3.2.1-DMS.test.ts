/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { CfnReplicationInstance } from '@aws-cdk/aws-dms';
import { Aspects, Stack } from '@aws-cdk/core';
import { PCIDSS321Checks } from '../../src';

describe('AWS Database Migration Service (AWS DMS)', () => {
  test('PCI.DSS.321-DMSReplicationNotPublic: - DMS replication instances are not public - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2.2)', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new PCIDSS321Checks());
    new CfnReplicationInstance(positive, 'rInstance', {
      replicationInstanceClass: 'dms.t2.micro',
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-DMSReplicationNotPublic:'),
        }),
      })
    );

    const negative = new Stack();
    Aspects.of(negative).add(new PCIDSS321Checks());
    new CfnReplicationInstance(negative, 'rInstance', {
      replicationInstanceClass: 'dms.t2.micro',
      publiclyAccessible: false,
    });
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-DMSReplicationNotPublic:'),
        }),
      })
    );
  });
});
