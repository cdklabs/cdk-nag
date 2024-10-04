/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { SynthUtils } from '@aws-cdk/assert';
import { Aspects, CfnResource, Stack } from 'aws-cdk-lib';
import {
  INagSuppressionIgnore,
  NagMessageLevel,
  NagRuleCompliance,
  NagSuppressions,
  SuppressionIgnoreAlways,
  SuppressionIgnoreAnd,
  SuppressionIgnoreErrors,
  SuppressionIgnoreOr,
} from '../src';
import { TestPack } from './rules/utils';

describe('Rule Suppression Condition Core Functionality', () => {
  const IGNORE = new SuppressionIgnoreAlways('IGNORED.');
  const NOT_IGNORE = new (class NeverIgnore implements INagSuppressionIgnore {
    createMessage(): string {
      return '';
    }
  })();
  test('Not ignored no suppression', () => {
    const testPack = new TestPack(
      [
        function (_node: CfnResource): NagRuleCompliance {
          return NagRuleCompliance.NON_COMPLIANT;
        },
      ],
      NOT_IGNORE,
      'Condition'
    );
    const stack = new Stack();
    Aspects.of(stack).add(testPack);
    new CfnResource(stack, 'nice', { type: 'AWS::Infinidash::Meme' });
    const messages = SynthUtils.synthesize(stack).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('Test-Condition'),
        }),
      })
    );
    expect(messages).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'was ignored for the following reason(s)'
          ),
        }),
      })
    );
  });
  test('Not ignored with suppression', () => {
    const testPack = new TestPack(
      [
        function (_node: CfnResource): NagRuleCompliance {
          return NagRuleCompliance.NON_COMPLIANT;
        },
      ],
      NOT_IGNORE,
      'Condition'
    );
    const stack = new Stack();
    new CfnResource(stack, 'nice', { type: 'AWS::Infinidash::Meme' });
    Aspects.of(stack).add(testPack);
    NagSuppressions.addStackSuppressions(stack, [
      {
        id: 'Test-Condition',
        reason: 'Everything is fine.',
      },
    ]);
    const messages = SynthUtils.synthesize(stack).messages;
    expect(messages).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('Test-Condition'),
        }),
      })
    );
    expect(messages).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'was ignored for the following reason(s)'
          ),
        }),
      })
    );
  });
  test('Ignored no suppression', () => {
    const testPack = new TestPack(
      [
        function (_node: CfnResource): NagRuleCompliance {
          return NagRuleCompliance.NON_COMPLIANT;
        },
      ],
      IGNORE,
      'Condition'
    );
    const stack = new Stack();
    new CfnResource(stack, 'nice', { type: 'AWS::Infinidash::Meme' });
    Aspects.of(stack).add(testPack);
    const messages = SynthUtils.synthesize(stack).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('Test-Condition'),
        }),
      })
    );
    expect(messages).not.toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'was ignored for the following reason(s)'
          ),
        }),
      })
    );
  });
  test('Ignored with suppression', () => {
    const testPack = new TestPack(
      [
        function (_node: CfnResource): NagRuleCompliance {
          return NagRuleCompliance.NON_COMPLIANT;
        },
      ],
      IGNORE,
      'Condition'
    );
    const stack = new Stack();
    new CfnResource(stack, 'nice', { type: 'AWS::Infinidash::Meme' });
    Aspects.of(stack).add(testPack);
    NagSuppressions.addStackSuppressions(stack, [
      {
        id: 'Test-Condition',
        reason: 'Everything is fine.',
      },
    ]);
    const messages = SynthUtils.synthesize(stack).messages;
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining('Test-Condition'),
        }),
      })
    );
    expect(messages).toContainEqual(
      expect.objectContaining({
        entry: expect.objectContaining({
          data: expect.stringContaining(
            'was ignored for the following reason(s)'
          ),
        }),
      })
    );
  });
});

describe('Prebuilt Rule Suppression Conditions', () => {
  const IGNORE = new SuppressionIgnoreAlways('IGNORED.');
  const NOT_IGNORE = new (class NeverIgnore implements INagSuppressionIgnore {
    createMessage(): string {
      return '';
    }
  })();
  describe('IgnoreAnd', () => {
    test('Should Ignore Suppression', () => {
      const testPack = new TestPack(
        [
          function (_node: CfnResource): NagRuleCompliance {
            return NagRuleCompliance.NON_COMPLIANT;
          },
        ],
        new SuppressionIgnoreAnd(IGNORE, IGNORE),
        'Condition'
      );
      const stack = new Stack();
      new CfnResource(stack, 'nice', { type: 'AWS::Infinidash::Meme' });
      Aspects.of(stack).add(testPack);
      NagSuppressions.addStackSuppressions(stack, [
        {
          id: 'Test-Condition',
          reason: 'Everything is fine.',
        },
      ]);
      const messages = SynthUtils.synthesize(stack).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('Test-Condition'),
          }),
        })
      );
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('IGNORED.\n\tIGNORED.'),
          }),
        })
      );
    });
    test('Should Not Ignore Suppression', () => {
      const testPack = new TestPack(
        [
          function (_node: CfnResource): NagRuleCompliance {
            return NagRuleCompliance.NON_COMPLIANT;
          },
        ],
        new SuppressionIgnoreAnd(IGNORE, NOT_IGNORE),
        'Condition'
      );
      const stack = new Stack();
      new CfnResource(stack, 'nice', { type: 'AWS::Infinidash::Meme' });
      Aspects.of(stack).add(testPack);
      NagSuppressions.addStackSuppressions(stack, [
        {
          id: 'Test-Condition',
          reason: 'Everything is fine.',
        },
      ]);
      const messages = SynthUtils.synthesize(stack).messages;
      expect(messages).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('Test-Condition'),
          }),
        })
      );
      expect(messages).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('IGNORED.'),
          }),
        })
      );
    });
  });
  describe('IgnoreOr', () => {
    test('Should Ignore Suppression', () => {
      const testPack = new TestPack(
        [
          function (_node: CfnResource): NagRuleCompliance {
            return NagRuleCompliance.NON_COMPLIANT;
          },
        ],
        new SuppressionIgnoreOr(IGNORE, NOT_IGNORE),
        'Condition'
      );
      const stack = new Stack();
      new CfnResource(stack, 'nice', { type: 'AWS::Infinidash::Meme' });
      Aspects.of(stack).add(testPack);
      NagSuppressions.addStackSuppressions(stack, [
        {
          id: 'Test-Condition',
          reason: 'Everything is fine.',
        },
      ]);
      const messages = SynthUtils.synthesize(stack).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('Test-Condition'),
          }),
        })
      );
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('IGNORED.'),
          }),
        })
      );
    });
    test('Should Not Ignore Suppression', () => {
      const testPack = new TestPack(
        [
          function (_node: CfnResource): NagRuleCompliance {
            return NagRuleCompliance.NON_COMPLIANT;
          },
        ],
        new SuppressionIgnoreOr(NOT_IGNORE, NOT_IGNORE),
        'Condition'
      );
      const stack = new Stack();
      new CfnResource(stack, 'nice', { type: 'AWS::Infinidash::Meme' });
      Aspects.of(stack).add(testPack);
      NagSuppressions.addStackSuppressions(stack, [
        {
          id: 'Test-Condition',
          reason: 'Everything is fine.',
        },
      ]);
      const messages = SynthUtils.synthesize(stack).messages;
      expect(messages).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('Test-Condition'),
          }),
        })
      );
      expect(messages).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining(
              'was ignored for the following reason(s)'
            ),
          }),
        })
      );
    });
  });
  describe('SuppressionIgnoreErrors', () => {
    test('Should Ignore Suppression', () => {
      const testPack = new TestPack(
        [
          function (_node: CfnResource): NagRuleCompliance {
            return NagRuleCompliance.NON_COMPLIANT;
          },
        ],
        new SuppressionIgnoreErrors(),
        'Condition',
        NagMessageLevel.ERROR
      );
      const stack = new Stack();
      new CfnResource(stack, 'nice', { type: 'AWS::Infinidash::Meme' });
      Aspects.of(stack).add(testPack);
      NagSuppressions.addStackSuppressions(stack, [
        {
          id: 'Test-Condition',
          reason: 'Everything is fine.',
        },
      ]);
      const messages = SynthUtils.synthesize(stack).messages;
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('Test-Condition'),
          }),
        })
      );
      expect(messages).toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('categorized as an ERROR'),
          }),
        })
      );
    });
    test('Should Not Ignore Suppression', () => {
      const testPack = new TestPack(
        [
          function (_node: CfnResource): NagRuleCompliance {
            return NagRuleCompliance.NON_COMPLIANT;
          },
        ],
        new SuppressionIgnoreErrors(),
        'Condition',
        NagMessageLevel.WARN
      );
      const stack = new Stack();
      new CfnResource(stack, 'nice', { type: 'AWS::Infinidash::Meme' });
      Aspects.of(stack).add(testPack);
      NagSuppressions.addStackSuppressions(stack, [
        {
          id: 'Test-Condition',
          reason: 'Everything is fine.',
        },
      ]);
      const messages = SynthUtils.synthesize(stack).messages;
      expect(messages).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('Test-Condition'),
          }),
        })
      );
      expect(messages).not.toContainEqual(
        expect.objectContaining({
          entry: expect.objectContaining({
            data: expect.stringContaining('categorized as an ERROR'),
          }),
        })
      );
    });
  });
});
