/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import {
  CfnCrawler,
  CfnJob,
  CfnSecurityConfiguration,
} from '@aws-cdk/aws-glue';
import { Aspects, CfnResource, IConstruct, Stack } from '@aws-cdk/core';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  GlueEncryptedCloudWatchLogs,
  GlueJobBookmarkEncrypted,
} from '../../src/rules/glue';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [GlueEncryptedCloudWatchLogs, GlueJobBookmarkEncrypted];
      rules.forEach((rule) => {
        this.applyRule({
          info: 'foo.',
          explanation: 'bar.',
          level: NagMessageLevel.ERROR,
          rule: rule,
          node: node,
        });
      });
    }
  }
}

describe('AWS Glue', () => {
  test('GlueEncryptedCloudWatchLogs: Glue crawlers and jobs have CloudWatch Log encryption enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnCrawler(nonCompliant, 'rCrawler', {
      role: 'foo',
      targets: {},
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('GlueEncryptedCloudWatchLogs:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnCrawler(nonCompliant2, 'rCrawler', {
      role: 'foo',
      targets: {},
      crawlerSecurityConfiguration: 'bar',
    });
    new CfnSecurityConfiguration(nonCompliant2, 'rSecurityConfig', {
      name: 'bar',
      encryptionConfiguration: {},
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('GlueEncryptedCloudWatchLogs:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    new CfnJob(nonCompliant3, 'rJob', {
      role: 'foo',
      command: {},
      securityConfiguration: new CfnSecurityConfiguration(
        nonCompliant3,
        'rSecurityConfig',
        {
          name: 'foo',
          encryptionConfiguration: {
            cloudWatchEncryption: { cloudWatchEncryptionMode: 'DISABLED' },
          },
        }
      ).ref,
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('GlueEncryptedCloudWatchLogs:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnCrawler(compliant, 'rCrawler', {
      role: 'foo',
      targets: {},
      crawlerSecurityConfiguration: 'bar',
    });
    new CfnJob(compliant, 'rJob', {
      role: 'foo',
      command: {},
      securityConfiguration: new CfnSecurityConfiguration(
        compliant,
        'rSecurityConfig',
        {
          name: 'bar',
          encryptionConfiguration: {
            cloudWatchEncryption: { cloudWatchEncryptionMode: 'SSE-KMS' },
          },
        }
      ).ref,
    });
    const messages4 = SynthUtils.synthesize(compliant).messages;
    expect(messages4).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('GlueEncryptedCloudWatchLogs:'),
        }),
      })
    );
  });
  test('GlueJobBookmarkEncrypted: Glue job bookmarks have encryption at rest enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnJob(nonCompliant, 'rJob', {
      role: 'foo',
      command: {},
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('GlueJobBookmarkEncrypted:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
    new CfnJob(nonCompliant2, 'rJob', {
      role: 'foo',
      command: {},
      securityConfiguration: 'bar',
    });
    new CfnSecurityConfiguration(nonCompliant2, 'rSecurityConfig', {
      name: 'bar',
      encryptionConfiguration: {},
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('GlueJobBookmarkEncrypted:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
    new CfnJob(nonCompliant3, 'rJob', {
      role: 'foo',
      command: {},
      securityConfiguration: new CfnSecurityConfiguration(
        nonCompliant3,
        'rSecurityConfig',
        {
          name: 'foo',
          encryptionConfiguration: {
            jobBookmarksEncryption: { jobBookmarksEncryptionMode: 'DISABLED' },
          },
        }
      ).ref,
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('GlueJobBookmarkEncrypted:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnJob(compliant, 'rJob1', {
      role: 'foo',
      command: {},
      securityConfiguration: 'bar',
    });
    new CfnJob(compliant, 'rJob2', {
      role: 'foo',
      command: {},
      securityConfiguration: new CfnSecurityConfiguration(
        compliant,
        'rSecurityConfig',
        {
          name: 'bar',
          encryptionConfiguration: {
            jobBookmarksEncryption: { jobBookmarksEncryptionMode: 'CSE-KMS' },
          },
        }
      ).ref,
    });
    const messages4 = SynthUtils.synthesize(compliant).messages;
    expect(messages4).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('GlueJobBookmarkEncrypted:'),
        }),
      })
    );
  });
});
