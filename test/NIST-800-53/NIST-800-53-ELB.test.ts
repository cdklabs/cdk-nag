/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import { Vpc } from '@aws-cdk/aws-ec2';
import { Bucket } from '@aws-cdk/aws-s3';
import {
  CfnLoadBalancer,
  LoadBalancer,
  LoadBalancingProtocol,
} from '@aws-cdk/aws-elasticloadbalancing';
import { CfnLoadBalancer as CfnLoadBalancerV2 } from '@aws-cdk/aws-elasticloadbalancingv2';
import {
  ApplicationLoadBalancer,
  ApplicationListener,
  ListenerAction,
  ApplicationProtocol,
} from '@aws-cdk/aws-elasticloadbalancingv2';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053Checks } from '../../src';

describe('NIST-800-53 Compute Checks', () => {
  describe('Amazon ELB', () => {

    //Test whether ELBs have deletion protection enabled
    test('nist80053ELBDeletionProtectionEnabled: - ELBs have deletion protection enabled - (Control IDs: CM-2, CP-10)', () => {
      
      //Expect a POSITIVE response because deletion protection is not set
      const positive = new Stack();
      Aspects.of(positive).add(new NIST80053Checks());
      new CfnLoadBalancerV2(positive, 'newelb', {
        loadBalancerAttributes: [],
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-ELBDeletionProtectionEnabled:'
            ),
          }),
        })
      );

      //Expect a POSITIVE response because deletion protection is disabled
      const positive2 = new Stack();
      Aspects.of(positive2).add(new NIST80053Checks());
      new CfnLoadBalancerV2(positive2, 'newelb', {
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
              'NIST.800.53-ELBDeletionProtectionEnabled:'
            ),
          }),
        })
      );

      //Expect a POSITIVE response an attribute other than deletion protection is enabled
      const positive3 = new Stack();
      Aspects.of(positive3).add(new NIST80053Checks());
      new CfnLoadBalancerV2(positive3, 'newelb', {
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
              'NIST.800.53-ELBDeletionProtectionEnabled:'
            ),
          }),
        })
      );

      //Create stack for negative checks
      const negative = new Stack();
      Aspects.of(negative).add(new NIST80053Checks());

      //Expect a NEGATIVE response because deletion protection is enabled
      new CfnLoadBalancerV2(negative, 'newelb', {
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
              'NIST.800.53-ELBDeletionProtectionEnabled:'
            ),
          }),
        })
      );
    });

    //Ensure ELBs are only listening for SSL and HTTPS traffic
    //These tests are taken from AWS Solutions' tests for rule "ELB5"
    test('nist80053ELBListenersUseSSLOrHTTPSOnly: - ELBs are only listening for SSL and HTTPS traffic - (Control IDs: AC-17(2), SC-7, SC-8, SC-8(1), SC-23)', () => {
      const positive = new Stack();
      const positive2 = new Stack();
      Aspects.of(positive).add(new NIST80053Checks());
      Aspects.of(positive2).add(new NIST80053Checks());
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
              'NIST.800.53-ELBListenersUseSSLOrHTTPS:'
            ),
          }),
        })
      );
      const messages2 = SynthUtils.synthesize(positive2).messages;
      expect(messages2).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-ELBListenersUseSSLOrHTTPS:'
            ),
          }),
        })
      );
      const negative = new Stack();
      const negative2 = new Stack();
      Aspects.of(negative).add(new NIST80053Checks());
      Aspects.of(negative2).add(new NIST80053Checks());
      const lb3 = new LoadBalancer(negative, 'rELB', {
        vpc: new Vpc(negative, 'rVPC'),
      });
      lb3.addListener({
        internalProtocol: LoadBalancingProtocol.SSL,
        externalPort: 42,
        externalProtocol: LoadBalancingProtocol.SSL,
      });
      const lb4 = new LoadBalancer(negative2, 'rELB', {
        vpc: new Vpc(negative2, 'rVPC'),
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
              'NIST.800.53-ELBListenersUseSSLOrHTTPS:'
            ),
          }),
        })
      );
      const messages4 = SynthUtils.synthesize(negative2).messages;
      expect(messages4).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-ELBListenersUseSSLOrHTTPS:'
            ),
          }),
        })
      );
    });

    //Ensure ELBs are load balanced across AZs
    //These tests are taken form AWS Solutions' tests for rule "ELB4"
    test('nist80053ELBCrossZoneBalancing: - ELBs are load balanced across AZs - (Control IDs: SC-5, CP-10)', () => {
      const positive = new Stack();
      Aspects.of(positive).add(new NIST80053Checks());
      new LoadBalancer(positive, 'rELB', {
        vpc: new Vpc(positive, 'rVPC'),
        crossZone: false,
      });
      const messages = SynthUtils.synthesize(positive).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-ELBCrossZoneBalancing:'),
          }),
        })
      );
      const positive2 = new Stack(undefined, undefined, {
        env: { region: 'us-east-1' },
      });
      Aspects.of(positive2).add(new NIST80053Checks());
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
            data: expect.stringContaining('NIST.800.53-ELBCrossZoneBalancing:'),
          }),
        })
      );

      const negative = new Stack();
      Aspects.of(negative).add(new NIST80053Checks());
      new LoadBalancer(negative, 'rELB', {
        vpc: new Vpc(negative, 'rVPC'),
        crossZone: true,
      });
      const messages3 = SynthUtils.synthesize(negative).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-ELBCrossZoneBalancing:'),
          }),
        })
      );
      const negative2 = new Stack(undefined, undefined, {
        env: { region: 'us-east-1' },
      });
      Aspects.of(negative2).add(new NIST80053Checks());
      new CfnLoadBalancer(negative2, 'rCfnElb', {
        listeners: [
          { instancePort: '42', loadBalancerPort: '42', protocol: 'TCP' },
        ],
        crossZone: true,
        availabilityZones: negative2.availabilityZones,
      });
      const messages4 = SynthUtils.synthesize(negative2).messages;
      expect(messages4).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('NIST.800.53-ELBCrossZoneBalancing:'),
          }),
        })
      );
    });

    //Test whether ELBs use ACM certs
    test('nist80053ELBUseACMCerts: - ELBs use ACM certificates - (Control IDs: AC-17(2), SC-7, SC-8, SC-8(1), SC-13)', () => {
      
      //Expect a POSITIVE response because the ELB listener does not use an ACM certificate
      const positive = new Stack();
      Aspects.of(positive).add(new NIST80053Checks());
      new CfnLoadBalancer(positive, 'newelb', {
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
            data: expect.stringContaining('NIST.800.53-ELBUseACMCerts:'),
          }),
        })
      );

      //Expect a POSITIVE response because there is no certificate ARN given
      const positive2 = new Stack();
      Aspects.of(positive2).add(new NIST80053Checks());
      new CfnLoadBalancer(positive2, 'newelb', {
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
            data: expect.stringContaining('NIST.800.53-ELBUseACMCerts:'),
          }),
        })
      );

      //Create stack for negative checks
      const negative = new Stack();
      Aspects.of(negative).add(new NIST80053Checks());

      //Expect a NEGATIVE response because there are no listeners in the ELB
      new CfnLoadBalancer(negative, 'newelb', {
        listeners: [],
      });

      //Expect a NEGATIVE response because the certificate ARN is a valid ACM resource
      new CfnLoadBalancer(negative, 'newelb2', {
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
            data: expect.stringContaining('NIST.800.53-ELBUseACMCerts:'),
          }),
        })
      );
    });


    test('NIST.800.53-ALBHttpDropInvalidHeaderEnabled: Load balancers have invalid http header dropping enabled', () => {
      const nonCompliant = new Stack(undefined, undefined, {
        env: { region: 'us-east-1' },
      });
      Aspects.of(nonCompliant).add(new NIST80053Checks());
      const alb1 = new ApplicationLoadBalancer(nonCompliant, 'rALB', {
        vpc: new Vpc(nonCompliant, 'rVPC'),
      });
      alb1.logAccessLogs(new Bucket(nonCompliant, 'rLogsBucket'));
      const messages = SynthUtils.synthesize(nonCompliant).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-ALBHttpDropInvalidHeaderEnabled:'
            ),
          }),
        })
      );

      const compliant = new Stack(undefined, undefined, {
        env: { region: 'us-east-1' },
      });
      Aspects.of(compliant).add(new NIST80053Checks());
      const alb = new ApplicationLoadBalancer(compliant, 'rALB', {
        vpc: new Vpc(compliant, 'rVPC'),
      });

      alb.logAccessLogs(new Bucket(compliant, 'rLogsBucket'));
      alb.setAttribute(
        'routing.http.drop_invalid_header_fields.enabled',
        'true'
      );
      const messages2 = SynthUtils.synthesize(compliant).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-ALBHttpDropInvalidHeaderEnabled:'
            ),
          }),
        })
      );
    });

    test('NIST.800.53-ALBHttpToHttpsRedirection: Http ALB listeners are configured to redirect to https', () => {
      //test for non-compliant application listener
      const nonCompliant = new Stack(undefined, undefined, {
        env: { region: 'us-east-1' },
      });
      Aspects.of(nonCompliant).add(new NIST80053Checks());

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
              'NIST.800.53-ALBHttpToHttpsRedirection:'
            ),
          }),
        })
      );

      const compliant = new Stack(undefined, undefined, {
        env: { region: 'us-east-1' },
      });
      Aspects.of(compliant).add(new NIST80053Checks());

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
              'NIST.800.53-ALBHttpToHttpsRedirection:'
            ),
          }),
        })
      );

      const compliant2 = new Stack(undefined, undefined, {
        env: { region: 'us-east-1' },
      });
      Aspects.of(compliant2).add(new NIST80053Checks());

      new Vpc(compliant2, 'rVPC');

      const messages3 = SynthUtils.synthesize(compliant2).messages;
      expect(messages3).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-ALBHttpToHttpsRedirection:'
            ),
          }),
        })
      );
    });

    test('NIST.800.53-nist80053ALBLoggingEnabled: Application Load Balancers have logging enabled', () => {
      const nonCompliant = new Stack();
      Aspects.of(nonCompliant).add(new NIST80053Checks());
      const alb2 = new ApplicationLoadBalancer(nonCompliant, 'rALB', {
        vpc: new Vpc(nonCompliant, 'rVPC'),
      });
      alb2.setAttribute(
        'routing.http.drop_invalid_header_fields.enabled',
        'true'
      );

      const messages = SynthUtils.synthesize(nonCompliant).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-nist80053ALBLoggingEnabled:'
            ),
          }),
        })
      );
      const compliant = new Stack(undefined, undefined, {
        env: { region: 'us-east-1' },
      });
      Aspects.of(compliant).add(new NIST80053Checks());
      const alb = new ApplicationLoadBalancer(compliant, 'rALB', {
        vpc: new Vpc(compliant, 'rVPC'),
      });
      alb.logAccessLogs(new Bucket(compliant, 'rLogsBucket'));
      const messages2 = SynthUtils.synthesize(compliant).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-nist80053ALBLoggingEnabled:'
            ),
          }),
        })
      );
    });

    test('NIST.800.53-nist80053ELBLoggingEnabled: Elastic Load Balancers have logging enabled', () => {
      const nonCompliant = new Stack();
      Aspects.of(nonCompliant).add(new NIST80053Checks());
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
            data: expect.stringContaining(
              'NIST.800.53-nist80053ELBLoggingEnabled:'
            ),
          }),
        })
      );
      const compliant = new Stack();
      Aspects.of(compliant).add(new NIST80053Checks());
      new LoadBalancer(compliant, 'rELB', {
        vpc: new Vpc(compliant, 'rVPC'),
        accessLoggingPolicy: {
          s3BucketName: 'foo',
          enabled: true,
        },
      });
      const messages2 = SynthUtils.synthesize(compliant).messages;
      expect(messages2).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'NIST.800.53-nist80053ELBLoggingEnabled:'
            ),
          }),
        })
      );


  
    });
  });
});
