/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { Vpc } from '@aws-cdk/aws-ec2';
import {
  CfnLoadBalancer,
  LoadBalancer,
  LoadBalancingProtocol,
} from '@aws-cdk/aws-elasticloadbalancing';
import {
  ApplicationLoadBalancer,
  NetworkLoadBalancer,
  ApplicationListener,
  ListenerAction,
  ApplicationProtocol,
  CfnLoadBalancer as CfnLoadBalancerV2,
} from '@aws-cdk/aws-elasticloadbalancingv2';
import { Bucket } from '@aws-cdk/aws-s3';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R4Checks } from '../../src';

describe('Elastic Load Balancing', () => {
  //Test whether ALB, NLB, and GLBs have deletion protection enabled
  test('nist80053r4ELBDeletionProtectionEnabled: - ALB, NLB, and GLBs have deletion protection enabled - (Control IDs: CM-2, CP-10)', () => {
    //Expect a POSITIVE response because deletion protection is not set
    const positive = new Stack();
    Aspects.of(positive).add(new NIST80053R4Checks());
    new CfnLoadBalancerV2(positive, 'rELB', {
      loadBalancerAttributes: [],
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-ELBDeletionProtectionEnabled:'
          ),
        }),
      })
    );

    //Expect a POSITIVE response because deletion protection is disabled
    const positive2 = new Stack();
    Aspects.of(positive2).add(new NIST80053R4Checks());
    new CfnLoadBalancerV2(positive2, 'rELB', {
      loadBalancerAttributes: [
        {
          key: 'deletion_protection.enabled',
          value: 'false',
        },
      ],
    });
    const messages2 = SynthUtils.synthesize(positive2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-ELBDeletionProtectionEnabled:'
          ),
        }),
      })
    );

    //Expect a POSITIVE response an attribute other than deletion protection is enabled
    const positive3 = new Stack();
    Aspects.of(positive3).add(new NIST80053R4Checks());
    new CfnLoadBalancerV2(positive3, 'rELB', {
      loadBalancerAttributes: [
        {
          key: 'access_logs.s3.enabled',
          value: 'true',
        },
      ],
    });
    const messages3 = SynthUtils.synthesize(positive3).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-ELBDeletionProtectionEnabled:'
          ),
        }),
      })
    );

    //Create stack for negative checks
    const negative = new Stack();
    Aspects.of(negative).add(new NIST80053R4Checks());

    //Expect a NEGATIVE response because deletion protection is enabled
    new CfnLoadBalancerV2(negative, 'rELB', {
      loadBalancerAttributes: [
        {
          key: 'deletion_protection.enabled',
          value: 'true',
        },
      ],
    });

    //Check cdk-nag response
    const messages6 = SynthUtils.synthesize(negative).messages;
    expect(messages6).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-ELBDeletionProtectionEnabled:'
          ),
        }),
      })
    );
  });

  //Ensure CLBs are only listening for SSL and HTTPS traffic
  //These tests are taken from AWS Solutions' tests for rule "ELB5"
  test('nist80053r4ELBListenersUseSSLOrHTTPSOnly: - CLBs are only listening for SSL and HTTPS traffic - (Control IDs: AC-17(2), SC-7, SC-8, SC-8(1), SC-23)', () => {
    const positive = new Stack();
    const positive2 = new Stack();
    Aspects.of(positive).add(new NIST80053R4Checks());
    Aspects.of(positive2).add(new NIST80053R4Checks());
    const lb = new LoadBalancer(positive, 'rELB', {
      vpc: new Vpc(positive, 'rVPC'),
    });
    lb.addListener({
      internalProtocol: LoadBalancingProtocol.TCP,
      externalPort: 42,
      externalProtocol: LoadBalancingProtocol.SSL,
    });
    const lb2 = new LoadBalancer(positive2, 'rELB', {
      vpc: new Vpc(positive2, 'rVPC'),
    });
    lb2.addListener({
      internalProtocol: LoadBalancingProtocol.HTTP,
      externalPort: 443,
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-ELBListenersUseSSLOrHTTPS:'
          ),
        }),
      })
    );
    const messages2 = SynthUtils.synthesize(positive2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-ELBListenersUseSSLOrHTTPS:'
          ),
        }),
      })
    );
    const negative = new Stack();
    Aspects.of(negative).add(new NIST80053R4Checks());
    const lb3 = new LoadBalancer(negative, 'rELB', {
      vpc: new Vpc(negative, 'rVPC'),
    });
    lb3.addListener({
      internalProtocol: LoadBalancingProtocol.SSL,
      externalPort: 42,
      externalProtocol: LoadBalancingProtocol.SSL,
    });
    const lb4 = new LoadBalancer(negative, 'rELB2', {
      vpc: new Vpc(negative, 'rVPC2'),
    });
    lb4.addListener({
      internalProtocol: LoadBalancingProtocol.HTTPS,
      externalPort: 443,
    });
    const messages3 = SynthUtils.synthesize(negative).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-ELBListenersUseSSLOrHTTPS:'
          ),
        }),
      })
    );
  });

  //Ensure CLBs are load balanced across AZs
  //These tests are taken form AWS Solutions' tests for rule "ELB4"
  test('nist80053r4ELBCrossZoneBalancing: - CLBs are load balanced across AZs - (Control IDs: SC-5, CP-10)', () => {
    const positive = new Stack();
    Aspects.of(positive).add(new NIST80053R4Checks());
    new LoadBalancer(positive, 'rELB', {
      vpc: new Vpc(positive, 'rVPC'),
      crossZone: false,
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-ELBCrossZoneBalancing:'
          ),
        }),
      })
    );
    const positive2 = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(positive2).add(new NIST80053R4Checks());
    new CfnLoadBalancer(positive2, 'rCfnElb', {
      listeners: [
        { instancePort: '42', loadBalancerPort: '42', protocol: 'TCP' },
      ],
      crossZone: true,
      availabilityZones: [positive2.availabilityZones[0]],
    });
    const messages2 = SynthUtils.synthesize(positive2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-ELBCrossZoneBalancing:'
          ),
        }),
      })
    );

    const negative = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(negative).add(new NIST80053R4Checks());
    new LoadBalancer(negative, 'rELB', {
      vpc: new Vpc(negative, 'rVPC'),
      crossZone: true,
    });
    new CfnLoadBalancer(negative, 'rCfnElb', {
      listeners: [
        { instancePort: '42', loadBalancerPort: '42', protocol: 'TCP' },
      ],
      crossZone: true,
      availabilityZones: negative.availabilityZones,
    });
    const messages3 = SynthUtils.synthesize(negative).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-ELBCrossZoneBalancing:'
          ),
        }),
      })
    );
  });

  //Test whether CLBs use ACM certs
  test('nist80053r4ELBUseACMCerts: - CLBs use ACM certificates - (Control IDs: AC-17(2), SC-7, SC-8, SC-8(1), SC-13)', () => {
    //Expect a POSITIVE response because The CLB listener does not use an ACM certificate
    const positive = new Stack();
    Aspects.of(positive).add(new NIST80053R4Checks());
    new CfnLoadBalancer(positive, 'rELB', {
      listeners: [
        {
          instancePort: '1',
          loadBalancerPort: '1',
          protocol: 'ssl',
          sslCertificateId: 'myrandomsslcertarn',
        },
      ],
    });
    const messages = SynthUtils.synthesize(positive).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-ELBUseACMCerts:'),
        }),
      })
    );

    //Expect a POSITIVE response because there is no certificate ARN given
    const positive2 = new Stack();
    Aspects.of(positive2).add(new NIST80053R4Checks());
    new CfnLoadBalancer(positive2, 'rELB', {
      listeners: [
        {
          instancePort: '1',
          loadBalancerPort: '1',
          protocol: 'ssl',
        },
      ],
    });
    const messages2 = SynthUtils.synthesize(positive2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-ELBUseACMCerts:'),
        }),
      })
    );

    //Create stack for negative checks
    const negative = new Stack();
    Aspects.of(negative).add(new NIST80053R4Checks());

    //Expect a NEGATIVE response because there are no listeners in The CLB
    new CfnLoadBalancer(negative, 'rELB', {
      listeners: [],
    });

    //Expect a NEGATIVE response because the certificate ARN is a valid ACM resource
    new CfnLoadBalancer(negative, 'rELB2', {
      listeners: [
        {
          instancePort: '1',
          loadBalancerPort: '1',
          protocol: 'ssl',
          sslCertificateId: 'arn:aws:acm:someacmcertid',
        },
      ],
    });

    //Check cdk-nag response
    const messages6 = SynthUtils.synthesize(negative).messages;
    expect(messages6).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('NIST.800.53.R4-ELBUseACMCerts:'),
        }),
      })
    );
  });

  test('nist80053r4ALBHttpDropInvalidHeaderEnabled: Load balancers have invalid http header dropping enabled', () => {
    const nonCompliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(nonCompliant).add(new NIST80053R4Checks());
    const alb1 = new ApplicationLoadBalancer(nonCompliant, 'rALB', {
      vpc: new Vpc(nonCompliant, 'rVPC'),
    });
    alb1.logAccessLogs(new Bucket(nonCompliant, 'rLogsBucket'));
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-ALBHttpDropInvalidHeaderEnabled:'
          ),
        }),
      })
    );

    const compliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(compliant).add(new NIST80053R4Checks());
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
            'NIST.800.53.R4-ALBHttpDropInvalidHeaderEnabled:'
          ),
        }),
      })
    );
  });

  test('nist80053r4ALBHttpToHttpsRedirection: Http ALB listeners are configured to redirect to https', () => {
    //test for non-compliant application listener
    const nonCompliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(nonCompliant).add(new NIST80053R4Checks());

    const myBalancer = new ApplicationLoadBalancer(nonCompliant, 'rALB', {
      vpc: new Vpc(nonCompliant, 'rVPC'),
    });

    myBalancer.logAccessLogs(new Bucket(nonCompliant, 'rLogsBucket'));
    myBalancer.setAttribute(
      'routing.http.drop_invalid_header_fields.enabled',
      'true'
    );

    new ApplicationListener(nonCompliant, 'rALBListener', {
      loadBalancer: myBalancer,
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
            'NIST.800.53.R4-ALBHttpToHttpsRedirection:'
          ),
        }),
      })
    );

    const compliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(compliant).add(new NIST80053R4Checks());

    const myBalancer2 = new ApplicationLoadBalancer(compliant, 'rELB', {
      vpc: new Vpc(compliant, 'rVPC'),
    });

    myBalancer2.logAccessLogs(new Bucket(compliant, 'rLogsBucket'));
    myBalancer2.setAttribute(
      'routing.http.drop_invalid_header_fields.enabled',
      'true'
    );

    new ApplicationListener(compliant, 'rALBListener', {
      loadBalancer: myBalancer2,
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
            'NIST.800.53.R4-ALBHttpToHttpsRedirection:'
          ),
        }),
      })
    );

    const compliant2 = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(compliant2).add(new NIST80053R4Checks());

    new Vpc(compliant2, 'rVPC');

    const messages3 = SynthUtils.synthesize(compliant2).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R4-ALBHttpToHttpsRedirection:'
          ),
        }),
      })
    );
  });

  test('nist80053r4ELBLoggingEnabled: Elastic Load Balancers have logging enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R4Checks());
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
          data: expect.stringContaining('NIST.800.53.R4-ELBLoggingEnabled:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R4Checks());
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
          data: expect.stringContaining('NIST.800.53.R4-ELBLoggingEnabled:'),
        }),
      })
    );

    const compliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(compliant).add(new NIST80053R4Checks());
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
          data: expect.stringContaining('NIST.800.53.R4-ELBLoggingEnabled:'),
        }),
      })
    );
  });
});
