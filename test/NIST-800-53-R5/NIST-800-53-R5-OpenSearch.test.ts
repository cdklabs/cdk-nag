/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import {
  CfnDomain as LegacyCfnDomain,
  Domain as LegacyDomain,
  ElasticsearchVersion,
} from '@aws-cdk/aws-elasticsearch';
import {
  CfnDomain,
  Domain,
  EngineVersion,
} from '@aws-cdk/aws-opensearchservice';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R5Checks } from '../../src';

describe('Amazon OpenSearch', () => {
  test('NIST.800.53.R5-OpenSearchEncryptedAtRest: - OpenSearch Service domains have encryption at rest enabled - (Control IDs: AU-9(3), CP-9d, SC-8(3), SC-8(4), SC-13a, SC-28(1), SI-19(4))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new LegacyCfnDomain(nonCompliant, 'rDomain', {});
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-OpenSearchEncryptedAtRest:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new CfnDomain(nonCompliant2, 'rDomain', {});
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-OpenSearchEncryptedAtRest:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new NIST80053R5Checks());
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
            'NIST.800.53.R5-OpenSearchEncryptedAtRest:'
          ),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new NIST80053R5Checks());
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
            'NIST.800.53.R5-OpenSearchEncryptedAtRest:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
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
            'NIST.800.53.R5-OpenSearchEncryptedAtRest:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-OpenSearchInVPCOnly: - OpenSearch Service domains are within VPCs - (Control IDs: AC-2(6), AC-3, AC-3(7), AC-4(21), AC-6, AC-17b, AC-17(1), AC-17(1), AC-17(4)(a), AC-17(9), AC-17(10), MP-2, SC-7a, SC-7b, SC-7c, SC-7(2), SC-7(3), SC-7(9)(a), SC-7(11), SC-7(12), SC-7(16), SC-7(20), SC-7(21), SC-7(24)(b), SC-25)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new LegacyCfnDomain(nonCompliant, 'rDomain', {});
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-OpenSearchInVPCOnly:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new CfnDomain(nonCompliant2, 'rDomain', {});
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-OpenSearchInVPCOnly:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new NIST80053R5Checks());
    new LegacyCfnDomain(nonCompliant3, 'rDomain', {
      vpcOptions: {
        subnetIds: [],
      },
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-OpenSearchInVPCOnly:'),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new NIST80053R5Checks());
    new CfnDomain(nonCompliant4, 'rDomain', {
      vpcOptions: {
        subnetIds: [],
      },
    });
    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-OpenSearchInVPCOnly:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-OpenSearchInVPCOnly:'),
        }),
      })
    );
  });

  test('NIST.800.53.R5-OpenSearchLogsToCloudWatch: - OpenSearch Service domains stream error logs to CloudWatch Logs - (Control ID: AU-10)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new LegacyDomain(nonCompliant, 'rDomain', {
      version: ElasticsearchVersion.V7_10,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-OpenSearchLogsToCloudWatch:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new Domain(nonCompliant2, 'rDomain', {
      version: EngineVersion.OPENSEARCH_1_0,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-OpenSearchLogsToCloudWatch:'
          ),
        }),
      })
    );
    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new NIST80053R5Checks());
    new LegacyDomain(nonCompliant3, 'rDomain', {
      version: ElasticsearchVersion.V7_10,
      logging: { slowIndexLogEnabled: true, slowSearchLogEnabled: true },
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-OpenSearchLogsToCloudWatch:'
          ),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new NIST80053R5Checks());
    new Domain(nonCompliant4, 'rDomain', {
      version: EngineVersion.OPENSEARCH_1_0,
      logging: { slowIndexLogEnabled: true, slowSearchLogEnabled: true },
    });
    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-OpenSearchLogsToCloudWatch:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new LegacyDomain(compliant, 'rDomain', {
      version: ElasticsearchVersion.V7_10,
      logging: { appLogEnabled: true },
    });
    new Domain(compliant, 'rDomain2', {
      version: EngineVersion.OPENSEARCH_1_0,
      logging: { appLogEnabled: true },
    });
    const messages5 = SynthUtils.synthesize(compliant).messages;
    expect(messages5).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-OpenSearchLogsToCloudWatch:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-OpenSearchNodeToNodeEncryption: - OpenSearch Service domains are node-to-node encrypted - (Control IDs: AC-4, AC-4(22), AC-24(1), AU-9(3), CA-9b, PM-17b, SC-7(4)(b), SC-7(4)(g), SC-8, SC-8(1), SC-8(2), SC-8(3), SC-8(4), SC-8(5), SC-13a, SC-23, SI-1a.2, SI-1a.2, SI-1c.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new LegacyCfnDomain(nonCompliant, 'rDomain', {});
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-OpenSearchNodeToNodeEncryption:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new CfnDomain(nonCompliant2, 'rDomain', {});
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-OpenSearchNodeToNodeEncryption:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new NIST80053R5Checks());
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
            'NIST.800.53.R5-OpenSearchNodeToNodeEncryption:'
          ),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new NIST80053R5Checks());
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
            'NIST.800.53.R5-OpenSearchNodeToNodeEncryption:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
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
            'NIST.800.53.R5-OpenSearchNodeToNodeEncryption:'
          ),
        }),
      })
    );
  });
});
