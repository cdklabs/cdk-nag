/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { SynthUtils } from '@aws-cdk/assert';
import {
  TaskDefinition,
  Compatibility,
  NetworkMode,
  EcsOptimizedImage,
} from '@aws-cdk/aws-ecs';
import { Aspects, Stack } from '@aws-cdk/core';
import { NIST80053R5Checks } from '../../src';

describe('Amazon Elastic Container Service (Amazon ECS)', () => {
  test("NIST.800.53.R5-ECSTaskDefinitionUserForHostMode: - Containers in ECS task definitions configured for host networking have 'privileged' set to true and a non-empty non-root 'user' - (Control IDs: AC-3, AC-5b, CM-5(1)(a))", () => {
    const nonCompliant = new Stack();
    Aspects.of(nonCompliant).add(new NIST80053R5Checks());
    new TaskDefinition(nonCompliant, 'rTaskDef', {
      compatibility: Compatibility.EC2,
      networkMode: NetworkMode.HOST,
    }).addContainer('rContainer', {
      image: EcsOptimizedImage,
      memoryReservationMiB: 42,
    });
    const messages = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-ECSTaskDefinitionUserForHostMode:'
          ),
        }),
      })
    );

    const nonCompliant2 = new Stack();
    Aspects.of(nonCompliant2).add(new NIST80053R5Checks());
    new TaskDefinition(nonCompliant2, 'rTaskDef', {
      compatibility: Compatibility.EC2,
      networkMode: NetworkMode.HOST,
    }).addContainer('rContainer', {
      image: EcsOptimizedImage,
      memoryReservationMiB: 42,
      user: 'ec2-user',
    });
    const messages2 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages2).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-ECSTaskDefinitionUserForHostMode:'
          ),
        }),
      })
    );

    const nonCompliant3 = new Stack();
    Aspects.of(nonCompliant3).add(new NIST80053R5Checks());
    new TaskDefinition(nonCompliant3, 'rTaskDef', {
      compatibility: Compatibility.EC2,
      networkMode: NetworkMode.HOST,
    }).addContainer('rContainer', {
      image: EcsOptimizedImage,
      memoryReservationMiB: 42,
      privileged: true,
      user: '0',
    });
    const messages3 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages3).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-ECSTaskDefinitionUserForHostMode:'
          ),
        }),
      })
    );

    const nonCompliant4 = new Stack();
    Aspects.of(nonCompliant4).add(new NIST80053R5Checks());
    new TaskDefinition(nonCompliant4, 'rTaskDef', {
      compatibility: Compatibility.EC2,
      networkMode: NetworkMode.HOST,
    }).addContainer('rContainer', {
      image: EcsOptimizedImage,
      memoryReservationMiB: 42,
      privileged: true,
      user: '0:root',
    });
    const messages4 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages4).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-ECSTaskDefinitionUserForHostMode:'
          ),
        }),
      })
    );

    const nonCompliant5 = new Stack();
    Aspects.of(nonCompliant5).add(new NIST80053R5Checks());
    const taskDef = new TaskDefinition(nonCompliant5, 'rTaskDef', {
      compatibility: Compatibility.EC2,
      networkMode: NetworkMode.HOST,
    });
    taskDef.addContainer('rContainer', {
      image: EcsOptimizedImage,
      memoryReservationMiB: 42,
      privileged: true,
      user: 'not-root',
    });
    taskDef.addContainer('rContainer2', {
      image: EcsOptimizedImage,
      memoryReservationMiB: 42,
    });
    const messages5 = SynthUtils.synthesize(nonCompliant).messages;
    expect(messages5).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-ECSTaskDefinitionUserForHostMode:'
          ),
        }),
      })
    );

    const compliant = new Stack();
    Aspects.of(compliant).add(new NIST80053R5Checks());
    new TaskDefinition(compliant, 'rTaskDef', {
      compatibility: Compatibility.EC2,
      networkMode: NetworkMode.HOST,
    });
    new TaskDefinition(compliant, 'rTaskDef2', {
      compatibility: Compatibility.EC2,
      networkMode: NetworkMode.HOST,
    }).addContainer('rContainer2', {
      image: EcsOptimizedImage,
      memoryReservationMiB: 42,
      privileged: true,
      user: 'not-root',
    });
    new TaskDefinition(compliant, 'rTaskDef3', {
      compatibility: Compatibility.EC2,
      networkMode: NetworkMode.BRIDGE,
    }).addContainer('rContainer3', {
      image: EcsOptimizedImage,
      memoryReservationMiB: 42,
    });
    const messages6 = SynthUtils.synthesize(compliant).messages;
    expect(messages6).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'NIST.800.53.R5-ECSTaskDefinitionUserForHostMode:'
          ),
        }),
      })
    );
  });
});
