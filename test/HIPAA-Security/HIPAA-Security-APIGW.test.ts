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
import { HIPAASecurityChecks } from '../../src';

describe('Amazon API Gateway', () => {
  test('HIPAA.Security-APIGWCacheEnabledAndEncrypted: API Gateway stages have caching enabled and encrypted for all methods', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new RestApi(nonCompliant, 'rRestApi').root.addMethod('ANY');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-APIGWCacheEnabledAndEncrypted:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
    new RestApi(nonCompliant2, 'rRestApi', {
      deployOptions: { cachingEnabled: false },
    }).root.addMethod('ANY');
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-APIGWCacheEnabledAndEncrypted:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new HIPAASecurityChecks());
    new RestApi(nonCompliant3, 'rRestApi', {
      deployOptions: { cacheDataEncrypted: false },
    }).root.addMethod('ANY');
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-APIGWCacheEnabledAndEncrypted:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
    new RestApi(compliant, 'rRestApi', {
      deployOptions: { cacheDataEncrypted: true, cachingEnabled: true },
    }).root.addMethod('ANY');
    const messages4 = SynthUtils.synthesize(compliant).messages;
    expect(messages4).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-APIGWCacheEnabledAndEncrypted:'
          ),
        }),
      })
    );
  });

  test('HIPAA.Security-APIGWExecutionLoggingEnabled: API Gateway stages have logging enabled for all methods', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new RestApi(nonCompliant, 'rRestApi').root.addMethod('ANY');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-APIGWExecutionLoggingEnabled:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
    new RestApi(nonCompliant2, 'rRestApi', {
      deployOptions: { loggingLevel: MethodLoggingLevel.OFF },
    }).root.addMethod('ANY');
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-APIGWExecutionLoggingEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
    new RestApi(compliant, 'rRestApi', {
      deployOptions: { loggingLevel: MethodLoggingLevel.ERROR },
    }).root.addMethod('ANY');
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-APIGWExecutionLoggingEnabled:'
          ),
        }),
      })
    );
  });

  test('HIPAA.Security-APIGWSSLEnabled: API Gateway REST API stages are configured with SSL certificates', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new RestApi(nonCompliant, 'rRestApi').root.addMethod('ANY');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('HIPAA.Security-APIGWSSLEnabled:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
          data: expect.stringContaining('HIPAA.Security-APIGWSSLEnabled:'),
        }),
      })
    );
  });

  test('HIPAA.Security-APIGWXrayEnabled: API Gateway REST API stages have X-Ray tracing enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new RestApi(nonCompliant, 'rRestApi').root.addMethod('ANY');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('HIPAA.Security-APIGWXrayEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
    new RestApi(compliant, 'rRestApi', {
      deployOptions: { tracingEnabled: true },
    }).root.addMethod('ANY');
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('HIPAA.Security-APIGWXrayEnabled:'),
        }),
      })
    );
  });
});
