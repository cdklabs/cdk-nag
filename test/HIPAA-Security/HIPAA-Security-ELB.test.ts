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
import { Aspects, Stack } from '@aws-cdk/core';
import { HIPAASecurityChecks } from '../../src';

describe('Elastic Load Balancing', () => {
  test('hipaaSecurityALBHttpDropInvalidHeaderEnabled: - Load balancers have invalid HTTP header dropping enabled - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(1), 164.312(e)(2)(i), 164.312(e)(2)(ii))', () => {
    const nonCompliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    const alb1 = new ApplicationLoadBalancer(nonCompliant, 'rALB', {
      vpc: new Vpc(nonCompliant, 'rVPC'),
    });
    alb1.logAccessLogs(new Bucket(nonCompliant, 'rLogsBucket'));
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-ALBHttpDropInvalidHeaderEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(compliant).add(new HIPAASecurityChecks());
    const alb = new ApplicationLoadBalancer(compliant, 'rALB', {
      vpc: new Vpc(compliant, 'rVPC'),
    });
    alb.logAccessLogs(new Bucket(compliant, 'rLogsBucket'));
    alb.setAttribute('routing.http.drop_invalid_header_fields.enabled', 'true');
    new NetworkLoadBalancer(compliant, 'rNLB', {
      vpc: new Vpc(compliant, 'rVPC2'),
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-ALBHttpDropInvalidHeaderEnabled:'
          ),
        }),
      })
    );
  });
  test('hipaaSecurityALBHttpToHttpsRedirection: - HTTP ALB listeners are configured to redirect to HTTPS - (Control IDs: AC-17(2), SC-7, SC-8, SC-8(1), SC-13, SC-23)', () => {
    const nonCompliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-ALBHttpToHttpsRedirection:'
          ),
        }),
      })
    );

    const compliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-ALBHttpToHttpsRedirection:'
          ),
        }),
      })
    );
  });
  test('hipaaSecurityELBACMCertificateRequired: - CLBs use ACM certificates - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(1), 164.312(e)(2)(i), 164.312(e)(2)(ii))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-ELBACMCertificateRequired:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-ELBACMCertificateRequired:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-ELBACMCertificateRequired:'
          ),
        }),
      })
    );
  });
  test('hipaaSecurityELBCrossZoneLoadBalancingEnabled: - CLBs are load balanced across AZs - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(C))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new LoadBalancer(nonCompliant, 'rELB', {
      vpc: new Vpc(nonCompliant, 'rVPC'),
      crossZone: false,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-ELBCrossZoneLoadBalancingEnabled:'
          ),
        }),
      })
    );
    const nonCompliant2 = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-ELBCrossZoneLoadBalancingEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-ELBCrossZoneLoadBalancingEnabled:'
          ),
        }),
      })
    );
  });
  test('hipaaSecurityELBDeletionProtectionEnabled: - ALB, NLB, and GLBs have deletion protection enabled - (Control IDs: 164.308(a)(7)(i), 164.308(a)(7)(ii)(C))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    new CfnLoadBalancerV2(nonCompliant, 'rELB', {
      loadBalancerAttributes: [],
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-ELBDeletionProtectionEnabled:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-ELBDeletionProtectionEnabled:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-ELBDeletionProtectionEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-ELBDeletionProtectionEnabled:'
          ),
        }),
      })
    );
  });
  test('hipaaSecurityELBLoggingEnabled: - Elastic Load Balancers have logging enabled - (Control ID: 164.312(b))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
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
          data: expect.stringContaining('HIPAA.Security-ELBLoggingEnabled:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
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
          data: expect.stringContaining('HIPAA.Security-ELBLoggingEnabled:'),
        }),
      })
    );

    const compliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
          data: expect.stringContaining('HIPAA.Security-ELBLoggingEnabled:'),
        }),
      })
    );
  });
  test('hipaaSecurityELBTlsHttpsListenersOnly: - CLB listeners are configured for secure (HTTPs or SSL) protocols for client communication - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(1), 164.312(e)(2)(i), 164.312(e)(2)(ii))', () => {
    const nonCompliant = new Stack();
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
    Aspects.of(nonCompliant2).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-ELBTlsHttpsListenersOnly:'
          ),
        }),
      })
    );
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'HIPAA.Security-ELBTlsHttpsListenersOnly:'
          ),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-ELBTlsHttpsListenersOnly:'
          ),
        }),
      })
    );
  });
  test('hipaaSecurityELBv2ACMCertificateRequired: - ALB, NLB, and GLB listeners use ACM-managed certificates - (Control IDs: 164.312(a)(2)(iv), 164.312(e)(2)(ii))', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-ELBv2ACMCertificateRequired:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new HIPAASecurityChecks());
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
            'HIPAA.Security-ELBv2ACMCertificateRequired:'
          ),
        }),
      })
    );
  });
});
