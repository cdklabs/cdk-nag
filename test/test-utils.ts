/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthesisMessage } from 'aws-cdk-lib/cx-api';

interface ExpectMessageConditions {
  readonly containing?: string[];
  readonly notContaining?: string[];
  readonly length?: number;
}
export function expectMessages(
  messages: SynthesisMessage[],
  conditions: ExpectMessageConditions
) {
  if (conditions.containing) {
    for (const condition of conditions.containing) {
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(condition),
          }),
        })
      );
    }
  }
  if (conditions.notContaining) {
    for (const condition of conditions.notContaining) {
      expect(messages).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(condition),
          }),
        })
      );
    }
  }
  if (conditions.length) {
    expect(messages.length).toEqual(conditions.length);
  }
}
