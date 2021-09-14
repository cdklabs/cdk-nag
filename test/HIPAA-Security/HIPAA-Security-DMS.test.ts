/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { CfnReplicationInstance } from '@aws-cdk/aws-dms';
import { Aspects, Stack } from '@aws-cdk/core';
import { HIPAASecurityChecks } from '../../src';

describe('AWS Database Migration Service (AWS DMS)', () => {
  test('hipaaSecurityDMSReplicationNotPublic: DMS replication instances are not public - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1))', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new HIPAASecurityChecks());
    new CfnReplicationInstance(positive, 'rInstance', {
      replicationInstanceClass: 'dms.t2.micro',
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-DMSReplicationNotPublic:'
          ),
        }),
      })
    );

    const negative = new Stack();
    Aspects.of(negative).add(new HIPAASecurityChecks());
    new CfnReplicationInstance(negative, 'rInstance', {
      replicationInstanceClass: 'dms.t2.micro',
      publiclyAccessible: false,
    });
    const messages2 = SynthUtils.synthesize(negative).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-DMSReplicationNotPublic:'
          ),
        }),
      })
    );
  });
});
