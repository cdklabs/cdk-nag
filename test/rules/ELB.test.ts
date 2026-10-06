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
import {
  CfnDelivery,
  CfnDeliveryDestination,
  CfnDeliverySource,
} from 'aws-cdk-lib/aws-logs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { CfnWebACLAssociation } from 'aws-cdk-lib/aws-wafv2';
import { App, CfnCondition, Fn, NestedStack, Stack } from 'aws-cdk-lib/core';
import { validateStack, TestType, TestPack, setActivePack } from './utils';
import { NagRuleCompliance } from '../../src/nag-rules';
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
  setActivePack(testPack);
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
    function vendedLogs(type = 'application') {
      const lb = new CfnLoadBalancerV2(stack, 'VendedLB', { type });
      const source = new CfnDeliverySource(stack, 'Source', {
        name: 'access-logs',
        logType: 'ACCESS_LOGS',
        resourceArn: lb.ref,
      });
      const destination = new CfnDeliveryDestination(stack, 'Destination', {
        name: 'destination',
        destinationResourceArn:
          'arn:aws:logs:us-east-1:123456789012:log-group:access',
      });
      const delivery = new CfnDelivery(stack, 'Delivery', {
        deliverySourceName: source.name,
        deliveryDestinationArn: destination.attrArn,
      });
      delivery.addDependency(source);
      return { lb, source, destination, delivery };
    }

    test.each(['application', 'network'])(
      'Vended access logs for %s load balancer',
      (type) => {
        vendedLogs(type);
        validateStack(stack, ruleId, TestType.COMPLIANCE);
      }
    );

    test('Vended access logs using the load balancer ARN attribute', () => {
      const { lb, source } = vendedLogs();
      source.resourceArn = lb.attrLoadBalancerArn;
      expect(ELBLoggingEnabled(lb)).toBe(NagRuleCompliance.COMPLIANT);
    });

    test('Vended access logs using a source name Ref', () => {
      const { lb, source, delivery } = vendedLogs();
      delivery.deliverySourceName = source.ref;
      expect(ELBLoggingEnabled(lb)).toBe(NagRuleCompliance.COMPLIANT);
    });

    test.each([
      'arn:aws:s3:::access-logs',
      'arn:aws:firehose:us-east-1:123456789012:deliverystream/access',
    ])('Vended delivery to %s', (arn) => {
      const { lb, destination } = vendedLogs();
      destination.destinationResourceArn = arn;
      expect(ELBLoggingEnabled(lb)).toBe(NagRuleCompliance.COMPLIANT);
    });

    test.each(['source', 'delivery', 'destination'] as const)(
      'Conditional %s is not proof of logging',
      (key) => {
        const chain = vendedLogs();
        chain[key].cfnOptions.condition = new CfnCondition(stack, 'Disabled', {
          expression: Fn.conditionEquals('enabled', 'disabled'),
        });
        expect(ELBLoggingEnabled(chain.lb)).toBe(
          NagRuleCompliance.NON_COMPLIANT
        );
      }
    );

    test('The destination name Ref is not its ARN', () => {
      const { lb, delivery, destination } = vendedLogs();
      delivery.deliveryDestinationArn = destination.ref;
      expect(ELBLoggingEnabled(lb)).toBe(NagRuleCompliance.NON_COMPLIANT);
    });

    test('A destination without a target is not accepted', () => {
      const { lb, destination } = vendedLogs();
      destination.destinationResourceArn = undefined;
      expect(ELBLoggingEnabled(lb)).toBe(NagRuleCompliance.NON_COMPLIANT);
    });

    test('A source without a resource ARN is not accepted', () => {
      const { lb, source } = vendedLogs();
      source.resourceArn = undefined;
      expect(ELBLoggingEnabled(lb)).toBe(NagRuleCompliance.NON_COMPLIANT);
    });

    test('An imported load balancer ARN is not accepted', () => {
      const { lb, source } = vendedLogs();
      source.resourceArn = Fn.importValue('external-lb');
      expect(ELBLoggingEnabled(lb)).toBe(NagRuleCompliance.NON_COMPLIANT);
    });

    test('A reference to a non-ARN source attribute is not its name', () => {
      const { lb, source, delivery } = vendedLogs();
      delivery.deliverySourceName = source.attrArn;
      expect(ELBLoggingEnabled(lb)).toBe(NagRuleCompliance.NON_COMPLIANT);
    });

    test('A nested stack with colliding logical IDs cannot satisfy the parent', () => {
      stack = new Stack(new App(), 'Parent');
      const parent = new CfnLoadBalancerV2(stack, 'LB', {
        type: 'application',
      });
      parent.overrideLogicalId('SharedLB');
      stack = new NestedStack(stack, 'Nested');
      const { lb } = vendedLogs();
      lb.overrideLogicalId('SharedLB');
      expect(ELBLoggingEnabled(lb)).toBe(NagRuleCompliance.COMPLIANT);
      expect(ELBLoggingEnabled(parent)).toBe(NagRuleCompliance.NON_COMPLIANT);
    });

    test('No log attributes or delivery is noncompliant without throwing', () => {
      const lb = new CfnLoadBalancerV2(stack, 'LB', { type: 'application' });
      expect(ELBLoggingEnabled(lb)).toBe(NagRuleCompliance.NON_COMPLIANT);
    });

    test('Gateway load balancers cannot use the vended fallback', () => {
      const { lb } = vendedLogs('gateway');
      expect(ELBLoggingEnabled(lb)).toBe(NagRuleCompliance.NON_COMPLIANT);
    });

    test('A source without a delivery does not enable logging', () => {
      const { lb } = vendedLogs();
      stack.node.tryRemoveChild('Delivery');
      expect(ELBLoggingEnabled(lb)).toBe(NagRuleCompliance.NON_COMPLIANT);
    });

    test('A delivery for a different source does not enable logging', () => {
      const { lb, delivery } = vendedLogs();
      delivery.deliverySourceName = 'another-source';
      expect(ELBLoggingEnabled(lb)).toBe(NagRuleCompliance.NON_COMPLIANT);
    });

    test('Logging applies only to the referenced load balancer', () => {
      const { lb } = vendedLogs();
      const other = new CfnLoadBalancerV2(stack, 'OtherLB', {
        type: 'application',
      });
      expect(ELBLoggingEnabled(lb)).toBe(NagRuleCompliance.COMPLIANT);
      expect(ELBLoggingEnabled(other)).toBe(NagRuleCompliance.NON_COMPLIANT);
    });

    test.each(['CONNECTION_LOGS', 'HEALTH_CHECK_LOGS', undefined])(
      'Log type %s is not access logging',
      (logType) => {
        const { lb, source } = vendedLogs();
        source.logType = logType;
        expect(ELBLoggingEnabled(lb)).toBe(NagRuleCompliance.NON_COMPLIANT);
      }
    );

    test('A delivery without a local destination is not accepted', () => {
      const { lb } = vendedLogs();
      stack.node.tryRemoveChild('Destination');
      expect(ELBLoggingEnabled(lb)).toBe(NagRuleCompliance.NON_COMPLIANT);
    });

    test('A non-ARN load balancer attribute is not accepted', () => {
      const { lb, source } = vendedLogs();
      source.resourceArn = lb.attrDnsName;
      expect(ELBLoggingEnabled(lb)).toBe(NagRuleCompliance.NON_COMPLIANT);
    });

    test('Repeated validation observes changes to delivery configuration', () => {
      const { lb, delivery } = vendedLogs();
      expect(ELBLoggingEnabled(lb)).toBe(NagRuleCompliance.COMPLIANT);
      expect(ELBLoggingEnabled(lb)).toBe(NagRuleCompliance.COMPLIANT);
      delivery.deliverySourceName = 'another-source';
      expect(ELBLoggingEnabled(lb)).toBe(NagRuleCompliance.NON_COMPLIANT);
    });
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
