/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import {
  MethodLoggingLevel,
  RestApi,
  CfnClientCertificate,
} from '@aws-cdk/aws-apigateway';
import { Aspects, Stack } from '@aws-cdk/core';
import { PCIDSS321Checks } from '../../src';

describe('Amazon API Gateway', () => {
  test('PCI.DSS.321-APIGWCacheEnabledAndEncrypted: - API Gateway stages have caching enabled and encrypted for all methods - (Control ID: 3.4)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new RestApi(nonCompliant, 'rRestApi').root.addMethod('ANY');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-APIGWCacheEnabledAndEncrypted:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
    new RestApi(nonCompliant2, 'rRestApi', {
      deployOptions: { cachingEnabled: false },
    }).root.addMethod('ANY');
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-APIGWCacheEnabledAndEncrypted:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new PCIDSS321Checks());
    new RestApi(nonCompliant3, 'rRestApi', {
      deployOptions: { cacheDataEncrypted: false },
    }).root.addMethod('ANY');
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-APIGWCacheEnabledAndEncrypted:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
    new RestApi(compliant, 'rRestApi', {
      deployOptions: { cacheDataEncrypted: true, cachingEnabled: true },
    }).root.addMethod('ANY');
    const messages4 = SynthUtils.synthesize(compliant).messages;
    expect(messages4).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-APIGWCacheEnabledAndEncrypted:'
          ),
        }),
      })
    );
  });

  test('PCI.DSS.321-APIGWExecutionLoggingEnabled: - API Gateway stages have logging enabled for all methods - (Control IDs: 10.1, 10.3.1, 10.3.2, 10.3.3, 10.3.4, 10.3.5, 10.3.6, 10.5.4)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new RestApi(nonCompliant, 'rRestApi').root.addMethod('ANY');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-APIGWExecutionLoggingEnabled:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
    new RestApi(nonCompliant2, 'rRestApi', {
      deployOptions: { loggingLevel: MethodLoggingLevel.OFF },
    }).root.addMethod('ANY');
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-APIGWExecutionLoggingEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
    new RestApi(compliant, 'rRestApi', {
      deployOptions: { loggingLevel: MethodLoggingLevel.ERROR },
    }).root.addMethod('ANY');
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-APIGWExecutionLoggingEnabled:'
          ),
        }),
      })
    );
  });

  test('PCI.DSS.321-APIGWSSLEnabled: - API Gateway REST API stages are configured with SSL certificates - (Control IDs: 2.3, 4.1, 8.2.1)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new RestApi(nonCompliant, 'rRestApi').root.addMethod('ANY');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-APIGWSSLEnabled:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
    new RestApi(compliant, 'rRestApi', {
      deployOptions: {
        clientCertificateId: new CfnClientCertificate(
          compliant,
          'rClientCertificate'
        ).attrClientCertificateId,
      },
    }).root.addMethod('ANY');
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-APIGWSSLEnabled:'),
        }),
      })
    );
  });
});
