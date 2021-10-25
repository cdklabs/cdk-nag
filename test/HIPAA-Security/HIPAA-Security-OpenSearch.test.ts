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
import { HIPAASecurityChecks } from '../../src';

describe('Amazon OpenSearch Service', () => {
  test('hipaaSecurityOpenSearchEncryptedAtRest: - OpenSearch Service domains have encryption at rest enabled - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new LegacyCfnDomain(nonCompliant, 'rDomain', {});
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-OpenSearchEncryptedAtRest:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
    new CfnDomain(nonCompliant2, 'rDomain', {});
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-OpenSearchEncryptedAtRest:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-OpenSearchEncryptedAtRest:'
          ),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-OpenSearchEncryptedAtRest:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-OpenSearchEncryptedAtRest:'
          ),
        }),
      })
    );
  });

  test('hipaaSecurityOpenSearchInVPCOnly: - OpenSearch Service domains are within VPCs - (Control IDs: 164.308(a)(3)(i), 164.308(a)(4)(ii)(A), 164.308(a)(4)(ii)(C), 164.312(a)(1), 164.312(e)(1))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new LegacyCfnDomain(nonCompliant, 'rDomain', {});
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('HIPAA.Security-OpenSearchInVPCOnly:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
    new CfnDomain(nonCompliant2, 'rDomain', {});
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('HIPAA.Security-OpenSearchInVPCOnly:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new HIPAASecurityChecks());
    new LegacyCfnDomain(nonCompliant3, 'rDomain', {
      vpcOptions: {
        subnetIds: [],
      },
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('HIPAA.Security-OpenSearchInVPCOnly:'),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new HIPAASecurityChecks());
    new CfnDomain(nonCompliant4, 'rDomain', {
      vpcOptions: {
        subnetIds: [],
      },
    });
    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('HIPAA.Security-OpenSearchInVPCOnly:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
          data: expect.stringContaining('HIPAA.Security-OpenSearchInVPCOnly:'),
        }),
      })
    );
  });

  test('hipaaSecurityOpenSearchLogsToCloudWatch: - OpenSearch Service domains stream error logs to CloudWatch Logs - (Control IDs: 164.308(a)(3)(ii)(A), 164.312(b))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new LegacyDomain(nonCompliant, 'rDomain', {
      version: ElasticsearchVersion.V7_10,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-OpenSearchLogsToCloudWatch:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
    new Domain(nonCompliant2, 'rDomain', {
      version: EngineVersion.OPENSEARCH_1_0,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-OpenSearchLogsToCloudWatch:'
          ),
        }),
      })
    );
    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new HIPAASecurityChecks());
    new LegacyDomain(nonCompliant3, 'rDomain', {
      version: ElasticsearchVersion.V7_10,
      logging: { slowIndexLogEnabled: true, slowSearchLogEnabled: true },
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-OpenSearchLogsToCloudWatch:'
          ),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new HIPAASecurityChecks());
    new Domain(nonCompliant4, 'rDomain', {
      version: EngineVersion.OPENSEARCH_1_0,
      logging: { slowIndexLogEnabled: true, slowSearchLogEnabled: true },
    });
    const messages4 = SynthUtils.synthesize(nonCompliant4).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-OpenSearchLogsToCloudWatch:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-OpenSearchLogsToCloudWatch:'
          ),
        }),
      })
    );
  });

  test('hipaaSecurityOpenSearchNodeToNodeEncryption: - OpenSearch Service domains are node-to-node encrypted - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(1), 164.312(e)(2)(i), 164.312(e)(2)(ii))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new LegacyCfnDomain(nonCompliant, 'rDomain', {});
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-OpenSearchNodeToNodeEncryption:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
    new CfnDomain(nonCompliant2, 'rDomain', {});
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-OpenSearchNodeToNodeEncryption:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-OpenSearchNodeToNodeEncryption:'
          ),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-OpenSearchNodeToNodeEncryption:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-OpenSearchNodeToNodeEncryption:'
          ),
        }),
      })
    );
  });
});
