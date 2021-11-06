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
  CfnLoadBalancer as CfnLoadBalancerV2,
} from '@aws-cdk/aws-elasticloadbalancingv2';
import { Bucket } from '@aws-cdk/aws-s3';
import { CfnWebACLAssociation } from '@aws-cdk/aws-wafv2';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R5Checks } from '../../src';

describe('Elastic Load Balancing', () => {
  test('NIST.800.53.R5-ALBHttpToHttpsRedirection: - HTTP ALB listeners are configured to redirect to HTTPS - (Control IDs: AC-4, AC-4(22), AC-17(2), AC-24(1), AU-9(3), CA-9b, IA-5(1)(c), PM-17b, SC-7(4)(b), SC-7(4)(g), SC-8, SC-8(1), SC-8(2), SC-8(3), SC-8(4), SC-8(5), SC-13a, SC-23, SI-1a.2, SI-1a.2, SI-1c.2)', () => {
    const nonCompliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
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
            'NIST.800.53.R5-ALBHttpToHttpsRedirection:'
          ),
        }),
      })
    );

    const compliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(compliant).add(new NIST80053R5Checks());
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
            'NIST.800.53.R5-ALBHttpToHttpsRedirection:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-ALBWAFEnabled: - ALBs are associated with AWS WAFv2 web ACLs - (Control ID: AC-4(21))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new ApplicationLoadBalancer(nonCompliant, 'rALB', {
      vpc: new Vpc(nonCompliant, 'rVPC'),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-ALBWAFEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    const compliantALB1 = new ApplicationLoadBalancer(compliant, 'rALB1', {
      vpc: new Vpc(compliant, 'rVPC1'),
    });
    new CfnWebACLAssociation(compliant, 'rWebAClAssoc1', {
      webAclArn: 'bar',
      resourceArn: compliantALB1.loadBalancerArn,
    });
    new NetworkLoadBalancer(compliant, 'rNLB', {
      vpc: new Vpc(compliant, 'rVPC2'),
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R5-ALBWAFEnabled:'),
        }),
      })
    );
  });

  test('NIST.800.53.R5-ELBACMCertificateRequired: - CLBs use ACM-managed certificates - (Control IDs: AC-4, AC-4(22), AC-17(2), AC-24(1), AU-9(3), CA-9b, IA-5(1)(c), PM-17b, SC-7(4)(b), SC-7(4)(g), SC-8, SC-8(1), SC-8(2), SC-8(3), SC-8(4), SC-8(5), SC-13a, SC-23, SC-23(5), SI-1a.2, SI-1a.2, SI-1c.2)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
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
            'NIST.800.53.R5-ELBACMCertificateRequired:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
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
            'NIST.800.53.R5-ELBACMCertificateRequired:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
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
            'NIST.800.53.R5-ELBACMCertificateRequired:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-ELBCrossZoneLoadBalancingEnabled: - CLBs use at least two AZs with the Cross-Zone Load Balancing feature enabled - (Control IDs: CP-1a.1(b), CP-1a.2, CP-2a, CP-2a.6, CP-2a.7, CP-2d, CP-2e, CP-2(5), CP-2(6), CP-6(2), CP-10, SC-5(2), SC-6, SC-22, SC-36, SI-13(5))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new LoadBalancer(nonCompliant, 'rELB', {
      vpc: new Vpc(nonCompliant, 'rVPC'),
      crossZone: false,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-ELBCrossZoneLoadBalancingEnabled:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new CfnLoadBalancer(nonCompliant2, 'rCfnElb', {
      listeners: [
        { instancePort: '42', loadBalancerPort: '42', protocol: 'TCP' },
      ],
      crossZone: true,
      availabilityZones: [nonCompliant2.availabilityZones[0]],
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-ELBCrossZoneLoadBalancingEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new LoadBalancer(compliant, 'rELB', {
      vpc: new Vpc(compliant, 'rVPC'),
      crossZone: true,
    });
    new CfnLoadBalancer(compliant, 'rCfnElb', {
      listeners: [
        { instancePort: '42', loadBalancerPort: '42', protocol: 'TCP' },
      ],
      crossZone: true,
      availabilityZones: compliant.availabilityZones,
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-ELBCrossZoneLoadBalancingEnabled:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-ELBDeletionProtectionEnabled: - ALBs, NLBs, and GLBs have deletion protection enabled - (Control IDs: CA-7(4)(c), CM-2a, CM-2(2), CM-3a, CM-8(6), CP-1a.1(b), CP-1a.2, CP-2a, CP-2a.6, CP-2a.7, CP-2d, CP-2e, CP-2(5), SA-15a.4, SC-5(2), SC-22)', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new CfnLoadBalancerV2(nonCompliant, 'rELB', {
      loadBalancerAttributes: [],
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-ELBDeletionProtectionEnabled:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new CfnLoadBalancerV2(nonCompliant2, 'rELB', {
      loadBalancerAttributes: [
        {
          key: 'deletion_protection.enabled',
          value: 'false',
        },
      ],
    });
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-ELBDeletionProtectionEnabled:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new NIST80053R5Checks());
    new CfnLoadBalancerV2(nonCompliant3, 'rELB', {
      loadBalancerAttributes: [
        {
          key: 'access_logs.s3.enabled',
          value: 'true',
        },
      ],
    });
    const messages3 = SynthUtils.synthesize(nonCompliant3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-ELBDeletionProtectionEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new CfnLoadBalancerV2(compliant, 'rELB', {
      loadBalancerAttributes: [
        {
          key: 'deletion_protection.enabled',
          value: 'true',
        },
      ],
    });
    const messages4 = SynthUtils.synthesize(compliant).messages;
    expect(messages4).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-ELBDeletionProtectionEnabled:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-ELBLoggingEnabled: - ELBs have access logs enabled - (Control IDs: AC-4(26), AU-2b, AU-3a, AU-3b, AU-3c, AU-3d, AU-3e, AU-3f, AU-6(3), AU-6(4), AU-6(6), AU-6(9), AU-8b, AU-10, AU-12a, AU-12c, AU-12(1), AU-12(2), AU-12(3), AU-12(4), AU-14a, AU-14b, AU-14b, AU-14(3), CA-7b, CM-5(1)(b), IA-3(3)(b), MA-4(1)(a), PM-14a.1, PM-14b, PM-31, SC-7(9)(b), SI-4(17), SI-7(8))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-ELBLoggingEnabled:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-ELBLoggingEnabled:'),
        }),
      })
    );

    const compliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(compliant).add(new NIST80053R5Checks());
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
          data: expect.stringContaining('NIST.800.53.R5-ELBLoggingEnabled:'),
        }),
      })
    );
  });

  test('NIST.800.53.R5-ELBTlsHttpsListenersOnly: - CLB listeners are configured for secure (HTTPs or SSL) protocols for client communication - (Control IDs: AC-4, AC-4(22), AC-17(2), AC-24(1), AU-9(3), CA-9b, IA-5(1)(c), PM-17b, PM-17b, SC-7(4)(b), SC-7(4)(g), SC-8, SC-8(1), SC-8(2), SC-8(2), SC-8(3), SC-8(4), SC-8(5), SC-13a, SC-23, SI-1a.2, SI-1a.2, SI-1a.2, SI-1a.2, SI-1c.2, SI-1c.2)', () => {
    const nonCompliant = new Stack();
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
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
            'NIST.800.53.R5-ELBTlsHttpsListenersOnly:'
          ),
        }),
      })
    );
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-ELBTlsHttpsListenersOnly:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
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
            'NIST.800.53.R5-ELBTlsHttpsListenersOnly:'
          ),
        }),
      })
    );
  });

  test('NIST.800.53.R5-ELBv2ACMCertificateRequired: - ALB, NLB, and GLB listeners use ACM-managed certificates - (Control IDs: SC-8(1), SC-23(5))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
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
            'NIST.800.53.R5-ELBv2ACMCertificateRequired:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
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
            'NIST.800.53.R5-ELBv2ACMCertificateRequired:'
          ),
        }),
      })
    );
  });
});
