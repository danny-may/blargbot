import { NotAnArrayError } from '@blargbot/bbtag/errors';
import { JoinSubtag } from '@blargbot/bbtag/subtags/array/join';
import { GetSubtag } from '@blargbot/bbtag/subtags/bot/get';
import { TagVariableType } from '@blargbot/domain/models';

import { runSubtagTests } from '../SubtagTestSuite';

runSubtagTests({
    subtag: new JoinSubtag(),
    argCountBounds: { min: 2, max: 2 },
    cases: [
        {
            code: '{join;a;b}',
            expected: '`Not an array`',
            errors: [
                { start: 0, end: 10, error: new NotAnArrayError('a') }
            ]
        },
        { code: '{join;[1,2,3];x}', expected: '1x2x3' },
        { code: '{join;[1];x}', expected: '1' },
        { code: '{join;["a","b","c"];_}', expected: 'a_b_c' },
        {
            code: '{join;arr1;~}',
            expected: 'this~is~arr1',
            setup(ctx) {
                ctx.options.tagName = 'testTag';
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.arr1`] = ['this', 'is', 'arr1'];
            }
        },
        {
            code: '{join;var1;~}',
            expected: '`Not an array`',
            errors: [
                { start: 0, end: 13, error: new NotAnArrayError('var1') }
            ],
            setup(ctx) {
                ctx.options.tagName = 'testTag';
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.var1`] = 'This is var1';
            }
        },
        {
            code: '{join;{get;arr1};~}',
            expected: 'this~is~arr1',
            subtags: [new GetSubtag()],
            setup(ctx) {
                ctx.options.tagName = 'testTag';
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.arr1`] = ['this', 'is', 'arr1'];
            }
        }
    ]
});
