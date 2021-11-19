/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Aspects, CfnResource, Stack } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import {
  CfnLoadBalancer,
  LoadBalancer,
  LoadBalancingProtocol,
} from 'aws-cdk-lib/aws-elasticloadbalancing';
import {
  ApplicationLoadBalancer,
  NetworkLoadBalancer,
  ListenerAction,
  ApplicationProtocol,
  CfnLoadBalancer as CfnLoadBalancerV2,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { CfnWebACLAssociation } from 'aws-cdk-lib/aws-wafv2';
import { IConstruct } from 'constructs';
import { NagMessageLevel, NagPack, NagPackProps } from '../../src';
import {
  ALBHttpDropInvalidHeaderEnabled,
  ALBHttpToHttpsRedirection,
  ALBWAFEnabled,
  CLBConnectionDraining,
  CLBNoInboundHttpHttps,
  ELBACMCertificateRequired,
  ELBCrossZoneLoadBalancingEnabled,
  ELBDeletionProtectionEnabled,
  ELBLoggingEnabled,
  ELBTlsHttpsListenersOnly,
  ELBv2ACMCertificateRequired,
} from '../../src/rules/elb';

class TestPack extends NagPack {
  constructor(props?: NagPackProps) {
    super(props);
    this.packName = 'Test';
  }
  public visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      const rules = [
        ALBHttpDropInvalidHeaderEnabled,
        ALBHttpToHttpsRedirection,
        ALBWAFEnabled,
        CLBConnectionDraining,
        CLBNoInboundHttpHttps,
        ELBACMCertificateRequired,
        ELBCrossZoneLoadBalancingEnabled,
        ELBDeletionProtectionEnabled,
        ELBLoggingEnabled,
        ELBTlsHttpsListenersOnly,
        ELBv2ACMCertificateRequired,
      ];
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

describe('Elastic Load Balancing', () => {
  test('ALBHttpDropInvalidHeaderEnabled: Load balancers have invalid HTTP header dropping enabled', () => {
    const nonCompliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(nonCompliant).add(new TestPack());
    const alb1 = new ApplicationLoadBalancer(nonCompliant, 'rALB', {
      vpc: new Vpc(nonCompliant, 'rVPC'),
    });
    alb1.logAccessLogs(new Bucket(nonCompliant, 'rLogsBucket'));
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ALBHttpDropInvalidHeaderEnabled:'),
        }),
      })
    );

    const compliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(compliant).add(new TestPack());
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
          data: expect.stringContaining('ALBHttpDropInvalidHeaderEnabled:'),
        }),
      })
    );
  });

  test('ALBHttpToHttpsRedirection: HTTP ALB listeners are configured to redirect to HTTPS', () => {
    const nonCompliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(nonCompliant).add(new TestPack());
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
          data: expect.stringContaining('ALBHttpToHttpsRedirection:'),
        }),
      })
    );

    const compliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(compliant).add(new TestPack());
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
          data: expect.stringContaining('ALBHttpToHttpsRedirection:'),
        }),
      })
    );
  });

  test('ALBWAFEnabled: ALBs are associated with AWS WAFv2 web ACLs', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new ApplicationLoadBalancer(nonCompliant, 'rALB', {
      vpc: new Vpc(nonCompliant, 'rVPC'),
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ALBWAFEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
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
          data: expect.stringContaining('ALBWAFEnabled:'),
        }),
      })
    );
  });

  test('CLBConnectionDraining: CLBs have connection draining enabled', () => {
    const nonCompliant = new Stack();
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    Aspects.of(nonCompliant2).add(new TestPack());
    new LoadBalancer(nonCompliant, 'rELB', {
      vpc: new Vpc(nonCompliant, 'rVPC'),
    });
    new CfnLoadBalancer(nonCompliant2, 'rCfnElb', {
      listeners: [
        { instancePort: '42', loadBalancerPort: '42', protocol: 'TCP' },
      ],
      connectionDrainingPolicy: { enabled: false },
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CLBConnectionDraining:'),
        }),
      })
    );
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CLBConnectionDraining:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnLoadBalancer(compliant, 'rCfnElb', {
      listeners: [
        { instancePort: '42', loadBalancerPort: '42', protocol: 'TCP' },
      ],
      connectionDrainingPolicy: { enabled: true },
    });
    const messages3 = SynthUtils.synthesize(compliant).messages;
    expect(messages3).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CLBConnectionDraining:'),
        }),
      })
    );
  });

  test('CLBNoInboundHttpHttps: CLBs are not used for incoming HTTP/HTTPS traffic', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    const elb = new LoadBalancer(nonCompliant, 'rELB', {
      vpc: new Vpc(nonCompliant, 'rVPC'),
    });
    elb.addListener({ externalPort: 80 });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CLBNoInboundHttpHttps:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const elb2 = new LoadBalancer(compliant, 'rELB', {
      vpc: new Vpc(compliant, 'rVPC'),
    });
    elb2.addListener({
      externalPort: 42,
      externalProtocol: LoadBalancingProtocol.SSL,
    });
    const messages2 = SynthUtils.synthesize(compliant).messages;
    expect(messages2).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('CLBNoInboundHttpHttps:'),
        }),
      })
    );
  });

  test('ELBACMCertificateRequired: CLBs use ACM certificates', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
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
          data: expect.stringContaining('ELBACMCertificateRequired:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
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
          data: expect.stringContaining('ELBACMCertificateRequired:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    new CfnLoadBalancer(compliant, 'rELB', {
      listeners: [],
    });
    new CfnLoadBalancer(compliant, 'rELBLoggingEnabled', {
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
          data: expect.stringContaining('ELBACMCertificateRequired:'),
        }),
      })
    );
  });

  test('ELBCrossZoneLoadBalancingEnabled: CLBs are load balanced across AZs', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new LoadBalancer(nonCompliant, 'rELB', {
      vpc: new Vpc(nonCompliant, 'rVPC'),
      crossZone: false,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ELBCrossZoneLoadBalancingEnabled:'),
        }),
      })
    );
    const nonCompliant2 = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(nonCompliant2).add(new TestPack());
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
          data: expect.stringContaining('ELBCrossZoneLoadBalancingEnabled:'),
        }),
      })
    );

    const compliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(compliant).add(new TestPack());
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
          data: expect.stringContaining('ELBCrossZoneLoadBalancingEnabled:'),
        }),
      })
    );
  });

  test('ELBDeletionProtectionEnabled: ALB, NLB, and GLBs have deletion protection enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    new CfnLoadBalancerV2(nonCompliant, 'rELB', {
      loadBalancerAttributes: [],
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ELBDeletionProtectionEnabled:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
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
          data: expect.stringContaining('ELBDeletionProtectionEnabled:'),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new TestPack());
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
          data: expect.stringContaining('ELBDeletionProtectionEnabled:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
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
          data: expect.stringContaining('ELBDeletionProtectionEnabled:'),
        }),
      })
    );
  });

  test('ELBLoggingEnabled: Elastic Load Balancers have logging enabled', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
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
          data: expect.stringContaining('ELBLoggingEnabled:'),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new TestPack());
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
          data: expect.stringContaining('ELBLoggingEnabled:'),
        }),
      })
    );

    const compliant = new Stack(undefined, undefined, {
      env: { region: 'us-east-1' },
    });
    Aspects.of(compliant).add(new TestPack());
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
          data: expect.stringContaining('ELBLoggingEnabled:'),
        }),
      })
    );
  });

  test('ELBTlsHttpsListenersOnly: CLB listeners are configured for secure (HTTPs or SSL) protocols for client communication', () => {
    const nonCompliant = new Stack();
    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
    Aspects.of(nonCompliant2).add(new TestPack());
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
          data: expect.stringContaining('ELBTlsHttpsListenersOnly:'),
        }),
      })
    );
    const messages2 = SynthUtils.synthesize(nonCompliant2).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('ELBTlsHttpsListenersOnly:'),
        }),
      })
    );
    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
    const lb3 = new LoadBalancer(compliant, 'rELB', {
      vpc: new Vpc(compliant, 'rVPC'),
    });
    lb3.addListener({
      internalProtocol: LoadBalancingProtocol.SSL,
      externalPort: 42,
      externalProtocol: LoadBalancingProtocol.SSL,
    });
    const lb4 = new LoadBalancer(compliant, 'rELBLoggingEnabled', {
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
          data: expect.stringContaining('ELBTlsHttpsListenersOnly:'),
        }),
      })
    );
  });

  test('ELBv2ACMCertificateRequired: ALB, NLB, and GLB listeners use ACM-managed certificates', () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new TestPack());
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
          data: expect.stringContaining('ELBv2ACMCertificateRequired:'),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new TestPack());
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
          data: expect.stringContaining('ELBv2ACMCertificateRequired:'),
        }),
      })
    );
  });
});
