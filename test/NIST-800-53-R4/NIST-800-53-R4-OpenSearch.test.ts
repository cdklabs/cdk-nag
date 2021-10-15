/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { CfnDomain as LegacyCfnDomain } from '@aws-cdk/aws-elasticsearch';
import { CfnDomain } from '@aws-cdk/aws-opensearchservice';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R4Checks } from '../../src';

describe('Amazon OpenSearch', () => {
  test('nist80053r4OpenSearchNodeToNodeEncrypted: - OpenSearch domains are node-to-node encrypted - (Control IDs: SC-7, SC-8, SC-8(1)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R4Checks());
    new LegacyCfnDomain(nonCompliant, 'rDomain', {});
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-OpenSearchNodeToNodeEncrypted:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R4Checks());
    new CfnDomain(nonCompliant2, 'rDomain', {});
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-OpenSearchNodeToNodeEncrypted:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new NIST80053R4Checks());
    new LegacyCfnDomain(nonCompliant3, 'rDomain', {
      nodeToNodeEncryptionOptions: {
        enabled: false,
      },
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-OpenSearchNodeToNodeEncrypted:'
          ),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new NIST80053R4Checks());
    new CfnDomain(nonCompliant4, 'rDomain', {
      nodeToNodeEncryptionOptions: {
        enabled: false,
      },
    });
    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-OpenSearchNodeToNodeEncrypted:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R4Checks());
    new LegacyCfnDomain(compliant, 'rDomain', {
      nodeToNodeEncryptionOptions: {
        enabled: true,
      },
    });
    new CfnDomain(compliant, 'rDomain2', {
      nodeToNodeEncryptionOptions: {
        enabled: true,
      },
    });
    const messages5 = SynthUtils.synthesize(compliant).messages;
    expect(messages5).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-OpenSearchNodeToNodeEncrypted:'
          ),
        }),
      })
    );
  });

  test('nist80053r4OpenSearchRunningWithinVPC: - OpenSearch domains are running within a VPC - (Control IDs: AC-4, SC-7, SC-7(3))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R4Checks());
    new LegacyCfnDomain(nonCompliant, 'rDomain', {});
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-OpenSearchRunningWithinVPC:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R4Checks());
    new CfnDomain(nonCompliant2, 'rDomain', {});
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-OpenSearchRunningWithinVPC:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new NIST80053R4Checks());
    new LegacyCfnDomain(nonCompliant3, 'rDomain', {
      vpcOptions: {
        subnetIds: [],
      },
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-OpenSearchRunningWithinVPC:'
          ),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new NIST80053R4Checks());
    new CfnDomain(nonCompliant4, 'rDomain', {
      vpcOptions: {
        subnetIds: [],
      },
    });
    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-OpenSearchRunningWithinVPC:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R4Checks());
    new LegacyCfnDomain(compliant, 'rDomain', {
      vpcOptions: {
        subnetIds: ['mycoolsubnet'],
      },
    });
    new CfnDomain(compliant, 'rDomain2', {
      vpcOptions: {
        subnetIds: ['mycoolsubnet'],
      },
    });
    const messages5 = SynthUtils.synthesize(compliant).messages;
    expect(messages5).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-OpenSearchRunningWithinVPC:'
          ),
        }),
      })
    );
  });

  test('nist80053r4OpenSearchEncryptedAtRest: - OpenSearch domains are encrypted at rest - (Control IDs: SC-13, SC-28)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R4Checks());
    new LegacyCfnDomain(nonCompliant, 'rDomain', {});
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-OpenSearchEncryptedAtRest:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R4Checks());
    new CfnDomain(nonCompliant2, 'rDomain', {});
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-OpenSearchEncryptedAtRest:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new NIST80053R4Checks());
    new LegacyCfnDomain(nonCompliant3, 'rDomain', {
      encryptionAtRestOptions: {
        enabled: false,
      },
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-OpenSearchEncryptedAtRest:'
          ),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new NIST80053R4Checks());
    new CfnDomain(nonCompliant4, 'rDomain', {
      encryptionAtRestOptions: {
        enabled: false,
      },
    });
    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-OpenSearchEncryptedAtRest:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R4Checks());
    new LegacyCfnDomain(compliant, 'rDomain', {
      encryptionAtRestOptions: {
        enabled: true,
      },
    });
    new CfnDomain(compliant, 'rDomain2', {
      encryptionAtRestOptions: {
        enabled: true,
      },
    });
    const messages5 = SynthUtils.synthesize(compliant).messages;
    expect(messages5).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-OpenSearchEncryptedAtRest:'
          ),
        }),
      })
    );
  });
});
