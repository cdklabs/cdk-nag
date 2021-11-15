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
import { PCIDSS321Checks } from '../../src';

describe('Amazon OpenSearch Service', () => {
  test('PCI.DSS.321-OpenSearchEncryptedAtRest: - OpenSearch Service domains have encryption at rest enabled - (Control IDs: 3.4, 8.2.1)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new LegacyCfnDomain(nonCompliant, 'rDomain', {});
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-OpenSearchEncryptedAtRest:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
    new CfnDomain(nonCompliant2, 'rDomain', {});
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-OpenSearchEncryptedAtRest:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-OpenSearchEncryptedAtRest:'
          ),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-OpenSearchEncryptedAtRest:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-OpenSearchEncryptedAtRest:'
          ),
        }),
      })
    );
  });

  test('PCI.DSS.321-OpenSearchErrorLogsToCloudWatch: - OpenSearch Service domains stream error logs to CloudWatch Logs - (Control IDs: 10.1, 10.2.1, 10.2.2, 10.2.3, 10.2.4, 10.2.5, 10.3.1, 10.3.2, 10.3.3, 10.3.4, 10.3.5, 10.3.6)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new LegacyDomain(nonCompliant, 'rDomain', {
      version: ElasticsearchVersion.V7_10,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-OpenSearchErrorLogsToCloudWatch:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
    new Domain(nonCompliant2, 'rDomain', {
      version: EngineVersion.OPENSEARCH_1_0,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-OpenSearchErrorLogsToCloudWatch:'
          ),
        }),
      })
    );
    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new PCIDSS321Checks());
    new LegacyDomain(nonCompliant3, 'rDomain', {
      version: ElasticsearchVersion.V7_10,
      logging: { slowIndexLogEnabled: true, slowSearchLogEnabled: true },
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-OpenSearchErrorLogsToCloudWatch:'
          ),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new PCIDSS321Checks());
    new Domain(nonCompliant4, 'rDomain', {
      version: EngineVersion.OPENSEARCH_1_0,
      logging: { slowIndexLogEnabled: true, slowSearchLogEnabled: true },
    });
    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-OpenSearchErrorLogsToCloudWatch:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-OpenSearchErrorLogsToCloudWatch:'
          ),
        }),
      })
    );
  });

  test('PCI.DSS.321-OpenSearchInVPCOnly: - OpenSearch Service domains are within VPCs - (Control IDs: 1.2, 1.2.1, 1.3, 1.3.1, 1.3.2, 1.3.4, 1.3.6, 2.2.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new LegacyCfnDomain(nonCompliant, 'rDomain', {});
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-OpenSearchInVPCOnly:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
    new CfnDomain(nonCompliant2, 'rDomain', {});
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-OpenSearchInVPCOnly:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new PCIDSS321Checks());
    new LegacyCfnDomain(nonCompliant3, 'rDomain', {
      vpcOptions: {
        subnetIds: [],
      },
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-OpenSearchInVPCOnly:'),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new PCIDSS321Checks());
    new CfnDomain(nonCompliant4, 'rDomain', {
      vpcOptions: {
        subnetIds: [],
      },
    });
    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-OpenSearchInVPCOnly:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
          data: expect.stringContaining('PCI.DSS.321-OpenSearchInVPCOnly:'),
        }),
      })
    );
  });

  test('PCI.DSS.321-OpenSearchNodeToNodeEncryption: - OpenSearch Service domains are node-to-node encrypted - (Control ID: 4.1)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new LegacyCfnDomain(nonCompliant, 'rDomain', {});
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-OpenSearchNodeToNodeEncryption:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
    new CfnDomain(nonCompliant2, 'rDomain', {});
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-OpenSearchNodeToNodeEncryption:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-OpenSearchNodeToNodeEncryption:'
          ),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-OpenSearchNodeToNodeEncryption:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
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
            'PCI.DSS.321-OpenSearchNodeToNodeEncryption:'
          ),
        }),
      })
    );
  });
});
