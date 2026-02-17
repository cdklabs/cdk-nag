/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
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
  CfnListener,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { CfnWebACLAssociation } from 'aws-cdk-lib/aws-wafv2';
import { Aspects, Stack } from 'aws-cdk-lib/core';
import { validateStack, TestType, TestPack } from './utils';
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

const testPack = new TestPack([
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
]);
let stack: Stack;

beforeEach(() => {
  stack = new Stack(undefined, undefined, { env: { region: 'us-east-1' } });
  Aspects.of(stack).add(testPack);
});

describe('Elastic Load Balancing', () => {
  describe('ALBHttpDropInvalidHeaderEnabled: Load balancers have invalid HTTP header dropping enabled', () => {
    const ruleId = 'ALBHttpDropInvalidHeaderEnabled';
    test('Noncompliance 1', () => {
      const alb1 = new ApplicationLoadBalancer(stack, 'rALB', {
        vpc: new Vpc(stack, 'rVPC'),
      });
      alb1.logAccessLogs(new Bucket(stack, 'rLogsBucket'));
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2: undefined loadBalancerAttributes', () => {
      new CfnLoadBalancerV2(stack, 'ALB', {
        type: 'application',
        loadBalancerAttributes: undefined,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const alb = new ApplicationLoadBalancer(stack, 'rALB', {
        vpc: new Vpc(stack, 'rVPC'),
      });
      alb.logAccessLogs(new Bucket(stack, 'rLogsBucket'));
      alb.setAttribute(
        'routing.http.drop_invalid_header_fields.enabled',
        'true'
      );
      new NetworkLoadBalancer(stack, 'rNLB', {
        vpc: new Vpc(stack, 'rVPC2'),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('ALBHttpToHttpsRedirection: HTTP ALB listeners are configured to redirect to HTTPS', () => {
    const ruleId = 'ALBHttpToHttpsRedirection';
    test('Noncompliance 1', () => {
      const myBalancer = new ApplicationLoadBalancer(stack, 'rALB', {
        vpc: new Vpc(stack, 'rVPC'),
      });
      myBalancer.logAccessLogs(new Bucket(stack, 'rLogsBucket'));
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
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const myBalancer2 = new ApplicationLoadBalancer(stack, 'rELB', {
        vpc: new Vpc(stack, 'rVPC'),
      });
      myBalancer2.logAccessLogs(new Bucket(stack, 'rLogsBucket'));
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
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('ALBWAFEnabled: ALBs are associated with AWS WAFv2 web ACLs', () => {
    const ruleId = 'ALBWAFEnabled';
    test('Noncompliance 1', () => {
      new ApplicationLoadBalancer(stack, 'rALB', {
        vpc: new Vpc(stack, 'rVPC'),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const compliantALB1 = new ApplicationLoadBalancer(stack, 'rALB1', {
        vpc: new Vpc(stack, 'rVPC1'),
      });
      new CfnWebACLAssociation(stack, 'rWebAClAssoc1', {
        webAclArn: 'bar',
        resourceArn: compliantALB1.loadBalancerArn,
      });
      new NetworkLoadBalancer(stack, 'rNLB', {
        vpc: new Vpc(stack, 'rVPC2'),
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('CLBConnectionDraining: CLBs have connection draining enabled', () => {
    const ruleId = 'CLBConnectionDraining';
    test('Noncompliance 1', () => {
      new LoadBalancer(stack, 'rELB', {
        vpc: new Vpc(stack, 'rVPC'),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnLoadBalancer(stack, 'rCfnElb', {
        listeners: [
          { instancePort: '42', loadBalancerPort: '42', protocol: 'TCP' },
        ],
        connectionDrainingPolicy: { enabled: false },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnLoadBalancer(stack, 'rCfnElb', {
        listeners: [
          { instancePort: '42', loadBalancerPort: '42', protocol: 'TCP' },
        ],
        connectionDrainingPolicy: { enabled: true },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('CLBNoInboundHttpHttps: CLBs are not used for incoming HTTP/HTTPS traffic', () => {
    const ruleId = 'CLBNoInboundHttpHttps';
    test('Noncompliance 1', () => {
      const elb = new LoadBalancer(stack, 'rELB', {
        vpc: new Vpc(stack, 'rVPC'),
      });
      elb.addListener({ externalPort: 80 });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });

    test('Compliance', () => {
      const elb2 = new LoadBalancer(stack, 'rELB', {
        vpc: new Vpc(stack, 'rVPC'),
      });
      elb2.addListener({
        externalPort: 42,
        externalProtocol: LoadBalancingProtocol.SSL,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('ELBACMCertificateRequired: CLBs use ACM certificates', () => {
    const ruleId = 'ELBACMCertificateRequired';
    test('Noncompliance 1', () => {
      new CfnLoadBalancer(stack, 'rELB', {
        listeners: [
          {
            instancePort: '1',
            loadBalancerPort: '1',
            protocol: 'ssl',
            sslCertificateId: 'myrandomsslcertarn',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnLoadBalancer(stack, 'rELB', {
        listeners: [
          {
            instancePort: '1',
            loadBalancerPort: '1',
            protocol: 'ssl',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnLoadBalancer(stack, 'rELB', {
        listeners: [],
      });
      new CfnLoadBalancer(stack, 'rELBLoggingEnabled', {
        listeners: [
          {
            instancePort: '1',
            loadBalancerPort: '1',
            protocol: 'ssl',
            sslCertificateId: 'arn:aws:acm:someacmcertid',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('ELBCrossZoneLoadBalancingEnabled: CLBs are load balanced across AZs', () => {
    const ruleId = 'ELBCrossZoneLoadBalancingEnabled';
    test('Noncompliance 1', () => {
      new LoadBalancer(stack, 'rELB', {
        vpc: new Vpc(stack, 'rVPC'),
        crossZone: false,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnLoadBalancer(stack, 'rCfnElb', {
        listeners: [
          { instancePort: '42', loadBalancerPort: '42', protocol: 'TCP' },
        ],
        crossZone: true,
        availabilityZones: [stack.availabilityZones[0]],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3: crossZone but single subnet', () => {
      new CfnLoadBalancer(stack, 'ELB', {
        crossZone: true,
        subnets: ['subnetId1'],
        listeners: [],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new LoadBalancer(stack, 'rELB', {
        vpc: new Vpc(stack, 'rVPC'),
        crossZone: true,
      });
      new CfnLoadBalancer(stack, 'rCfnElb', {
        listeners: [
          { instancePort: '42', loadBalancerPort: '42', protocol: 'TCP' },
        ],
        crossZone: true,
        availabilityZones: stack.availabilityZones,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('ELBDeletionProtectionEnabled: ALB, NLB, and GLBs have deletion protection enabled', () => {
    const ruleId = 'ELBDeletionProtectionEnabled';
    test('Noncompliance 1', () => {
      new CfnLoadBalancerV2(stack, 'rELB', {
        loadBalancerAttributes: [],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new CfnLoadBalancerV2(stack, 'rELB', {
        loadBalancerAttributes: [
          {
            key: 'deletion_protection.enabled',
            value: 'false',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 3', () => {
      new CfnLoadBalancerV2(stack, 'rELB', {
        loadBalancerAttributes: [
          {
            key: 'access_logs.s3.enabled',
            value: 'true',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 4: loadBalancerAttributes is undefined', () => {
      new CfnLoadBalancerV2(stack, 'rELB', {
        loadBalancerAttributes: undefined,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new CfnLoadBalancerV2(stack, 'rELB', {
        loadBalancerAttributes: [
          {
            key: 'deletion_protection.enabled',
            value: 'true',
          },
        ],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('ELBLoggingEnabled: Elastic Load Balancers have logging enabled', () => {
    const ruleId = 'ELBLoggingEnabled';
    test('Noncompliance 1', () => {
      new LoadBalancer(stack, 'rELB', {
        vpc: new Vpc(stack, 'rVPC'),
        accessLoggingPolicy: {
          s3BucketName: 'foo',
          enabled: false,
        },
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      const alb2 = new ApplicationLoadBalancer(stack, 'rALB', {
        vpc: new Vpc(stack, 'rVPC'),
      });
      alb2.setAttribute(
        'routing.http.drop_invalid_header_fields.enabled',
        'true'
      );
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      const alb = new ApplicationLoadBalancer(stack, 'rALB', {
        vpc: new Vpc(stack, 'rVPC'),
      });
      alb.logAccessLogs(new Bucket(stack, 'rLogsBucket'));
      const nlb = new NetworkLoadBalancer(stack, 'rNLB', {
        vpc: new Vpc(stack, 'rVPC2'),
      });
      nlb.logAccessLogs(new Bucket(stack, 'rLogsBucket2'));
      new LoadBalancer(stack, 'rELB', {
        vpc: new Vpc(stack, 'rVPC3'),
        accessLoggingPolicy: {
          s3BucketName: 'foo',
          enabled: true,
        },
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('ELBTlsHttpsListenersOnly: CLB listeners are configured for secure (HTTPs or SSL) protocols for client communication', () => {
    const ruleId = 'ELBTlsHttpsListenersOnly';
    test('Noncompliance 1', () => {
      new LoadBalancer(stack, 'rELB', {
        vpc: new Vpc(stack, 'rVPC'),
      }).addListener({
        internalProtocol: LoadBalancingProtocol.TCP,
        externalPort: 42,
        externalProtocol: LoadBalancingProtocol.SSL,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2', () => {
      new LoadBalancer(stack, 'rELB', {
        vpc: new Vpc(stack, 'rVPC'),
      }).addListener({
        internalProtocol: LoadBalancingProtocol.HTTP,
        externalPort: 443,
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new LoadBalancer(stack, 'rELB1', {
        vpc: new Vpc(stack, 'rVPC'),
      }).addListener({
        internalProtocol: LoadBalancingProtocol.SSL,
        externalPort: 42,
        externalProtocol: LoadBalancingProtocol.SSL,
      });
      new LoadBalancer(stack, 'rELB2', {
        vpc: new Vpc(stack, 'rVPC2'),
      }).addListener({
        internalProtocol: LoadBalancingProtocol.HTTPS,
        externalPort: 443,
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });

  describe('ELBv2ACMCertificateRequired: ALB, NLB, and GLB listeners use ACM-managed certificates', () => {
    const ruleId = 'ELBv2ACMCertificateRequired';
    test('Noncompliance 1', () => {
      new ApplicationLoadBalancer(stack, 'rALB', {
        vpc: new Vpc(stack, 'rVPC'),
      }).addListener('rALBListener', {
        protocol: ApplicationProtocol.HTTP,
        defaultAction: ListenerAction.fixedResponse(200, {
          contentType: 'string',
          messageBody: 'OK',
        }),
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Noncompliance 2: no certificates found', () => {
      new CfnListener(stack, 'Listener', {
        certificates: [],
        defaultActions: [],
        loadBalancerArn: 'lbArn',
      });
      validateStack(stack, ruleId, TestType.NON_COMPLIANCE);
    });
    test('Compliance', () => {
      new ApplicationLoadBalancer(stack, 'rALB', {
        vpc: new Vpc(stack, 'rVPC'),
      }).addListener('rALBListener', {
        protocol: ApplicationProtocol.HTTPS,
        defaultAction: ListenerAction.fixedResponse(200, {
          contentType: 'string',
          messageBody: 'OK',
        }),
        certificates: [
          Certificate.fromCertificateArn(stack, 'rCertificate2', 'notempty'),
        ],
      });
      validateStack(stack, ruleId, TestType.COMPLIANCE);
    });
  });
});
