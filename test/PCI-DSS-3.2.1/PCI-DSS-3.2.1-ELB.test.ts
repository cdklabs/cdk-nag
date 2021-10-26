/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { Certificate } from '@aws-cdk/aws-certificatemanager';
import { Vpc } from '@aws-cdk/aws-ec2';
import {
  CfnLoadBalancer,
  LoadBalancer,
  LoadBalancingProtocol,
} from '@aws-cdk/aws-elasticloadbalancing';
import {
  ApplicationLoadBalancer,
  NetworkLoadBalancer,
  ListenerAction,
  ApplicationProtocol,
} from '@aws-cdk/aws-elasticloadbalancingv2';
import { Bucket } from '@aws-cdk/aws-s3';
import { Aspects, Stack } from '@aws-cdk/core';
import { PCIDSS321Checks } from '../../src';

describe('Elastic Load Balancing', () => {
  test('PCI.DSS.321-ALBHttpToHttpsRedirection: - HTTP ALB listeners are configured to redirect to HTTPS - (Control IDs: 2.3, 4.1, 8.2.1)', () => {
    const nonCompliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    const myBalancer = new ApplicationLoadBalancer(nonCompliant, 'rALB', {
      vpc: new Vpc(nonCompliant, 'rVPC'),
    });
    myBalancer.logAccessLogs(new Bucket(nonCompliant, 'rLogsBucket'));
    myBalancer.setAttribute(
      'routing.http.drop_invalid_header_fields.enabled',
      'true'
    );
    myBalancer.addListener('rALBListener', {
      protocol: ApplicationProtocol.HTTP,
      defaultAction: ListenerAction.fixedResponse(200, {
        contentType: 'string',
        messageBody: 'OK',
      }),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-ALBHttpToHttpsRedirection:'
          ),
        }),
      })
    );

    const compliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(compliant).add(new PCIDSS321Checks());
    const myBalancer2 = new ApplicationLoadBalancer(compliant, 'rELB', {
      vpc: new Vpc(compliant, 'rVPC'),
    });
    myBalancer2.logAccessLogs(new Bucket(compliant, 'rLogsBucket'));
    myBalancer2.setAttribute(
      'routing.http.drop_invalid_header_fields.enabled',
      'true'
    );
    myBalancer2.addListener('rALBListener', {
      protocol: ApplicationProtocol.HTTP,
      defaultAction: ListenerAction.redirect({
        protocol: ApplicationProtocol.HTTPS,
      }),
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-ALBHttpToHttpsRedirection:'
          ),
        }),
      })
    );
  });

  test('PCI.DSS.321-ELBACMCertificateRequired: - CLBs use ACM-managed certificates - (Control IDs: 4.1, 8.2.1)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new CfnLoadBalancer(nonCompliant, 'rELB', {
      listeners: [
        {
          instancePort: '1',
          loadBalancerPort: '1',
          protocol: 'ssl',
          sslCertificateId: 'myrandomsslcertarn',
        },
      ],
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-ELBACMCertificateRequired:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
    new CfnLoadBalancer(nonCompliant2, 'rELB', {
      listeners: [
        {
          instancePort: '1',
          loadBalancerPort: '1',
          protocol: 'ssl',
        },
      ],
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-ELBACMCertificateRequired:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
    new CfnLoadBalancer(compliant, 'rELB', {
      listeners: [],
    });
    new CfnLoadBalancer(compliant, 'rELB2', {
      listeners: [
        {
          instancePort: '1',
          loadBalancerPort: '1',
          protocol: 'ssl',
          sslCertificateId: 'arn:aws:acm:someacmcertid',
        },
      ],
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-ELBACMCertificateRequired:'
          ),
        }),
      })
    );
  });

  test('PCI.DSS.321-ELBLoggingEnabled: - ELBs have access logs enabled - (Control IDs: 10.1, 10.3.1, 10.3.2, 10.3.3, 10.3.4, 10.3.5, 10.3.6, 10.5.4)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new LoadBalancer(nonCompliant, 'rELB', {
      vpc: new Vpc(nonCompliant, 'rVPC'),
      accessLoggingPolicy: {
        s3BucketName: 'foo',
        enabled: false,
      },
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-ELBLoggingEnabled:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
    const alb2 = new ApplicationLoadBalancer(nonCompliant2, 'rALB', {
      vpc: new Vpc(nonCompliant2, 'rVPC'),
    });
    alb2.setAttribute(
      'routing.http.drop_invalid_header_fields.enabled',
      'true'
    );
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-ELBLoggingEnabled:'),
        }),
      })
    );

    const compliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(compliant).add(new PCIDSS321Checks());
    const alb = new ApplicationLoadBalancer(compliant, 'rALB', {
      vpc: new Vpc(compliant, 'rVPC'),
    });
    alb.logAccessLogs(new Bucket(compliant, 'rLogsBucket'));
    const nlb = new NetworkLoadBalancer(compliant, 'rNLB', {
      vpc: new Vpc(compliant, 'rVPC2'),
    });
    nlb.logAccessLogs(new Bucket(compliant, 'rLogsBucket2'));
    new LoadBalancer(compliant, 'rELB', {
      vpc: new Vpc(compliant, 'rVPC3'),
      accessLoggingPolicy: {
        s3BucketName: 'foo',
        enabled: true,
      },
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('PCI.DSS.321-ELBLoggingEnabled:'),
        }),
      })
    );
  });

  test('PCI.DSS.321-ELBTlsHttpsListenersOnly: - CLB listeners are configured for secure (HTTPs or SSL) protocols for client communication - (Control IDs: 2.3, 4.1, 8.2.1)', () => {
    const nonCompliant = new Stack();
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    Aspects.of(nonCompliant2).add(new PCIDSS321Checks());
    const lb = new LoadBalancer(nonCompliant, 'rELB', {
      vpc: new Vpc(nonCompliant, 'rVPC'),
    });
    lb.addListener({
      internalProtocol: LoadBalancingProtocol.TCP,
      externalPort: 42,
      externalProtocol: LoadBalancingProtocol.SSL,
    });
    const lb2 = new LoadBalancer(nonCompliant2, 'rELB', {
      vpc: new Vpc(nonCompliant2, 'rVPC'),
    });
    lb2.addListener({
      internalProtocol: LoadBalancingProtocol.HTTP,
      externalPort: 443,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-ELBTlsHttpsListenersOnly:'
          ),
        }),
      })
    );
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-ELBTlsHttpsListenersOnly:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
    const lb3 = new LoadBalancer(compliant, 'rELB', {
      vpc: new Vpc(compliant, 'rVPC'),
    });
    lb3.addListener({
      internalProtocol: LoadBalancingProtocol.SSL,
      externalPort: 42,
      externalProtocol: LoadBalancingProtocol.SSL,
    });
    const lb4 = new LoadBalancer(compliant, 'rELB2', {
      vpc: new Vpc(compliant, 'rVPC2'),
    });
    lb4.addListener({
      internalProtocol: LoadBalancingProtocol.HTTPS,
      externalPort: 443,
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-ELBTlsHttpsListenersOnly:'
          ),
        }),
      })
    );
  });

  test('PCI.DSS.321-ELBv2ACMCertificateRequired: - ALB, NLB, and GLB listeners use ACM-managed certificates - (Control ID: 4.1)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new PCIDSS321Checks());
    new ApplicationLoadBalancer(nonCompliant, 'rALB', {
      vpc: new Vpc(nonCompliant, 'rVPC'),
    }).addListener('rALBListener', {
      protocol: ApplicationProtocol.HTTP,
      defaultAction: ListenerAction.fixedResponse(200, {
        contentType: 'string',
        messageBody: 'OK',
      }),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-ELBv2ACMCertificateRequired:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new PCIDSS321Checks());
    new ApplicationLoadBalancer(compliant, 'rALB', {
      vpc: new Vpc(compliant, 'rVPC'),
    }).addListener('rALBListener', {
      protocol: ApplicationProtocol.HTTPS,
      defaultAction: ListenerAction.fixedResponse(200, {
        contentType: 'string',
        messageBody: 'OK',
      }),
      certificates: [
        Certificate.fromCertificateArn(compliant, 'rCertificate2', 'notempty'),
      ],
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'PCI.DSS.321-ELBv2ACMCertificateRequired:'
          ),
        }),
      })
    );
  });
});
