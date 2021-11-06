/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import {
  MethodLoggingLevel,
  RestApi,
  CfnClientCertificate,
  CfnStage,
} from '@aws-cdk/aws-apigateway';
import { CfnWebACLAssociation } from '@aws-cdk/aws-wafv2';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R5Checks } from '../../src';

describe('Amazon API Gateway', () => {
  test('NIST.800.53.R5-APIGWAssociatedWithWAF: - Rest API stages are associated with AWS WAFv2 web ACLs - (Control ID: AC-4(21))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    const nonCompliantRestApi = new RestApi(nonCompliant, 'rRestApi', {
      deploy: false,
    });
    nonCompliantRestApi.root.addMethod('ANY');
    new CfnStage(nonCompliant, 'rRestStage', {
      restApiId: nonCompliantRestApi.restApiId,
      stageName: 'foo',
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-APIGWAssociatedWithWAF:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    const nonCompliant2RestApi = new RestApi(nonCompliant2, 'rRestApi', {
      deploy: false,
    });
    nonCompliant2RestApi.root.addMethod('ANY');
    new CfnStage(nonCompliant2, 'rRestStage', {
      restApiId: nonCompliant2RestApi.restApiId,
      stageName: 'foo',
    });
    new CfnWebACLAssociation(nonCompliant2, 'rWebAClAssoc', {
      webAclArn: 'bar',
      resourceArn: `${nonCompliant2RestApi.restApiId}`,
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-APIGWAssociatedWithWAF:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new NIST80053R5Checks());
    const nonCompliant3RestApi = new RestApi(nonCompliant3, 'rRestApi', {
      deploy: false,
    });
    nonCompliant3RestApi.root.addMethod('ANY');
    const nonCompliant3Stage = new CfnStage(nonCompliant3, 'rRestStage', {
      restApiId: nonCompliant3RestApi.restApiId,
      stageName: 'foo',
    });
    new CfnWebACLAssociation(nonCompliant3, 'rWebAClAssoc', {
      webAclArn: 'bar',
      resourceArn: `${nonCompliant3Stage.restApiId}/baz`,
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-APIGWAssociatedWithWAF:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    const compliantRestApi = new RestApi(compliant, 'rRestApi', {
      deploy: false,
    });
    compliantRestApi.root.addMethod('ANY');
    new CfnStage(compliant, 'rRestStage', {
      restApiId: compliantRestApi.restApiId,
      stageName: 'foo',
    });
    new CfnWebACLAssociation(compliant, 'rWebAClAssoc', {
      webAclArn: 'bar',
      resourceArn: `${compliantRestApi.restApiId}/stage/foo`,
    });
    const compliantRestApi2 = new RestApi(compliant, 'rRestApi2', {
      deploy: false,
    });
    compliantRestApi2.root.addMethod('ANY');
    const compliantStage2 = new CfnStage(compliant, 'rRestStage2', {
      restApiId: compliantRestApi2.restApiId,
      stageName: 'foo',
    });
    new CfnWebACLAssociation(compliant, 'rWebAClAssoc2', {
      webAclArn: 'bar',
      resourceArn: `${compliantRestApi2.restApiId}/stage/${compliantStage2.stageName}`,
    });
    const compliantRestApi3 = new RestApi(compliant, 'rRestApi3', {
      deploy: false,
    });
    compliantRestApi3.root.addMethod('ANY');
    new CfnStage(compliant, 'rRestStage3', {
      restApiId: 'baz',
      stageName: 'foo',
    });
    new CfnWebACLAssociation(compliant, 'rWebAClAssoc3', {
      webAclArn: 'bar',
      resourceArn: `baz/stage/${compliantStage2.ref}`,
    });
    const compliantRestApi4 = new RestApi(compliant, 'rRestApi4', {
      deploy: false,
    });
    compliantRestApi4.root.addMethod('ANY');
    const compliantStage4 = new CfnStage(compliant, 'rRestStage4', {
      restApiId: 'baz',
      stageName: 'foo',
    });
    new CfnWebACLAssociation(compliant, 'rWebAClAssoc4', {
      webAclArn: 'bar',
      resourceArn: `${compliantStage4.restApiId}/stage/foo`,
    });
    const messages4 = SynthUtils.synthesize(compliant).messages;
    expect(messages4).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-APIGWAssociatedWithWAF:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-APIGWCacheEnabledAndEncrypted: - API Gateway stages have caching enabled and encrypted for all methods - (Control IDs: AU-9(3), CP-9d, SC-8(3), SC-8(4), SC-13a, SC-28(1), SI-19(4))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new RestApi(nonCompliant, 'rRestApi').root.addMethod('ANY');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-APIGWCacheEnabledAndEncrypted:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new RestApi(nonCompliant2, 'rRestApi', {
      deployOptions: { cachingEnabled: false },
    }).root.addMethod('ANY');
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-APIGWCacheEnabledAndEncrypted:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new NIST80053R5Checks());
    new RestApi(nonCompliant3, 'rRestApi', {
      deployOptions: { cacheDataEncrypted: false },
    }).root.addMethod('ANY');
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-APIGWCacheEnabledAndEncrypted:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new RestApi(compliant, 'rRestApi', {
      deployOptions: { cacheDataEncrypted: true, cachingEnabled: true },
    }).root.addMethod('ANY');
    const messages4 = SynthUtils.synthesize(compliant).messages;
    expect(messages4).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-APIGWCacheEnabledAndEncrypted:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-APIGWExecutionLoggingEnabled: - API Gateway stages have logging enabled for all methods - (Control IDs: AC-4(26), AU-2b, AU-3a, AU-3b, AU-3c, AU-3d, AU-3e, AU-3f, AU-6(3), AU-6(4), AU-6(6), AU-6(9), AU-8b, AU-10, AU-12a, AU-12c, AU-12(1), AU-12(2), AU-12(3), AU-12(4), AU-14a, AU-14b, AU-14b, AU-14(3), CA-7b, CM-5(1)(b), IA-3(3)(b), MA-4(1)(a), PM-14a.1, PM-14b, PM-31, SC-7(9)(b), SI-4(17), SI-7(8))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new RestApi(nonCompliant, 'rRestApi').root.addMethod('ANY');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-APIGWExecutionLoggingEnabled:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new RestApi(nonCompliant2, 'rRestApi', {
      deployOptions: { loggingLevel: MethodLoggingLevel.OFF },
    }).root.addMethod('ANY');
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-APIGWExecutionLoggingEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new RestApi(compliant, 'rRestApi', {
      deployOptions: { loggingLevel: MethodLoggingLevel.ERROR },
    }).root.addMethod('ANY');
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-APIGWExecutionLoggingEnabled:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-APIGWSSLEnabled: - API Gateway REST API stages are configured with SSL certificates - (Control IDs: AC-4, AC-4(22), AC-17(2), AC-24(1), AU-9(3), CA-9b, IA-5(1)(c), PM-17b, SC-7(4)(b), SC-7(4)(g), SC-8, SC-8(1), SC-8(2), SC-8(3), SC-8(4), SC-8(5), SC-13a, SC-23, SI-1a.2, SI-1a.2, SI-1c.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new RestApi(nonCompliant, 'rRestApi').root.addMethod('ANY');
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-APIGWSSLEnabled:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-APIGWSSLEnabled:'),
        }),
      })
    );
  });
});
