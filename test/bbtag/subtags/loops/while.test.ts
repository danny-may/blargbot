import { BBTagRuntimeError } from '@blargbot/bbtag/errors';
import { GetSubtag } from '@blargbot/bbtag/subtags/bot/get';
import { ReturnSubtag } from '@blargbot/bbtag/subtags/bot/return';
import { SetSubtag } from '@blargbot/bbtag/subtags/bot/set';
import { WhileSubtag } from '@blargbot/bbtag/subtags/loops/while';
import { DecrementSubtag } from '@blargbot/bbtag/subtags/math/decrement';
import { IncrementSubtag } from '@blargbot/bbtag/subtags/math/increment';
import { IfSubtag } from '@blargbot/bbtag/subtags/misc/if';
import { OperatorSubtag } from '@blargbot/bbtag/subtags/misc/operator';
import { BBTagRuntimeState } from '@blargbot/bbtag/types';
import { TagVariableType } from '@blargbot/domain/models';
import { expect } from 'chai';

import { runSubtagTests } from '../SubtagTestSuite';

runSubtagTests({
    subtag: new WhileSubtag(),
    argCountBounds: { min: { count: 2, noEval: [0, 1] }, max: { count: 4, noEval: [0, 1, 2, 3] } },
    cases: [
        {
            code: '{while;{<;{get;index};10};{increment;index},}',
            expected: '1,2,3,4,5,6,7,8,9,10,',
            subtags: [new GetSubtag(), new IncrementSubtag(), new OperatorSubtag()],
            setup(ctx) {
                ctx.options.tagName = 'testTag';
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.index`] = '0';
            },
            postSetup(bbctx, ctx) {
                ctx.limit.setup(m => m.check(bbctx, 'while:loops')).verifiable(10).thenResolve(undefined);
            },
            async assert(bbctx, _, ctx) {
                expect((await bbctx.variables.get('index')).value).to.equal(10);
                expect(ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.index`]).to.equal(10);
            }
        },
        {
            code: '{while;{get;index};<;10;{increment;index},}',
            expected: '1,2,3,4,5,6,7,8,9,10,',
            subtags: [new GetSubtag(), new IncrementSubtag()],
            setup(ctx) {
                ctx.options.tagName = 'testTag';
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.index`] = '0';
            },
            postSetup(bbctx, ctx) {
                ctx.limit.setup(m => m.check(bbctx, 'while:loops')).verifiable(10).thenResolve(undefined);
            },
            async assert(bbctx, _, ctx) {
                expect((await bbctx.variables.get('index')).value).to.equal(10);
                expect(ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.index`]).to.equal(10);
            }
        },
        {
            code: '{while;<;{get;index};10;{increment;index},}',
            expected: '1,2,3,4,5,6,7,8,9,10,',
            subtags: [new GetSubtag(), new IncrementSubtag()],
            setup(ctx) {
                ctx.options.tagName = 'testTag';
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.index`] = '0';
            },
            postSetup(bbctx, ctx) {
                ctx.limit.setup(m => m.check(bbctx, 'while:loops')).verifiable(10).thenResolve(undefined);
            },
            async assert(bbctx, _, ctx) {
                expect((await bbctx.variables.get('index')).value).to.equal(10);
                expect(ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.index`]).to.equal(10);
            }
        },
        {
            code: '{while;{get;index};10;<;{increment;index},}',
            expected: '1,2,3,4,5,6,7,8,9,10,',
            subtags: [new GetSubtag(), new IncrementSubtag()],
            setup(ctx) {
                ctx.options.tagName = 'testTag';
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.index`] = '0';
            },
            postSetup(bbctx, ctx) {
                ctx.limit.setup(m => m.check(bbctx, 'while:loops')).verifiable(10).thenResolve(undefined);
            },
            async assert(bbctx, _, ctx) {
                expect((await bbctx.variables.get('index')).value).to.equal(10);
                expect(ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.index`]).to.equal(10);
            }
        },
        {
            code: '{while;{get;index};<;10;{increment;index;2},}',
            expected: '2,4,6,8,10,',
            subtags: [new GetSubtag(), new IncrementSubtag()],
            setup(ctx) {
                ctx.options.tagName = 'testTag';
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.index`] = '0';
            },
            postSetup(bbctx, ctx) {
                ctx.limit.setup(m => m.check(bbctx, 'while:loops')).verifiable(5).thenResolve(undefined);
            },
            async assert(bbctx, _, ctx) {
                expect((await bbctx.variables.get('index')).value).to.equal(10);
                expect(ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.index`]).to.equal(10);
            }
        },
        {
            code: '{while;{get;index};>;0;{decrement;index},}',
            expected: '9,8,7,6,5,4,3,2,1,0,',
            subtags: [new GetSubtag(), new DecrementSubtag()],
            setup(ctx) {
                ctx.options.tagName = 'testTag';
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.index`] = '10';
            },
            postSetup(bbctx, ctx) {
                ctx.limit.setup(m => m.check(bbctx, 'while:loops')).verifiable(10).thenResolve(undefined);
            },
            async assert(bbctx, _, ctx) {
                expect((await bbctx.variables.get('index')).value).to.equal(0);
                expect(ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.index`]).to.equal(0);
            }
        },
        {
            code: '{while;{get;index};<;513;{get;index},{set;index;{*;{get;index};2}}}',
            expected: '1,2,4,8,16,32,64,128,256,512,',
            subtags: [new GetSubtag(), new SetSubtag(), new OperatorSubtag()],
            setup(ctx) {
                ctx.options.tagName = 'testTag';
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.index`] = '1';
            },
            postSetup(bbctx, ctx) {
                ctx.limit.setup(m => m.check(bbctx, 'while:loops')).verifiable(10).thenResolve(undefined);
            },
            async assert(bbctx, _, ctx) {
                expect((await bbctx.variables.get('index')).value).to.equal('1024');
                expect(ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.index`]).to.equal('1024');
            }
        },
        {
            code: '{while;{get;index};<;10;{increment;index},}',
            expected: '1,2,3,4,`Too many loops`',
            errors: [
                { start: 0, end: 43, error: new BBTagRuntimeError('Too many loops') }
            ],
            subtags: [new GetSubtag(), new IncrementSubtag()],
            setup(ctx) {
                ctx.options.tagName = 'testTag';
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.index`] = '0';
            },
            postSetup(bbctx, ctx) {
                let i = 0;
                ctx.limit.setup(m => m.check(bbctx, 'while:loops')).verifiable(5).thenCall(() => {
                    if (i++ >= 4)
                        throw new BBTagRuntimeError('Too many loops');
                    return undefined;
                });
            },
            async assert(bbctx, _, ctx) {
                expect((await bbctx.variables.get('index')).value).to.equal(4);
                expect(ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.index`]).to.equal(4);
            }
        },
        {
            code: '{while;abc;def;ghi;{increment;index},}',
            expected: '1,2,3,4,`Too many loops`',
            errors: [
                { start: 0, end: 38, error: new BBTagRuntimeError('Too many loops') }
            ],
            subtags: [new GetSubtag(), new IncrementSubtag()],
            setup(ctx) {
                ctx.options.tagName = 'testTag';
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.index`] = '0';
            },
            postSetup(bbctx, ctx) {
                let i = 0;
                ctx.limit.setup(m => m.check(bbctx, 'while:loops')).verifiable(5).thenCall(() => {
                    if (i++ >= 4)
                        throw new BBTagRuntimeError('Too many loops');
                    return undefined;
                });
            },
            async assert(bbctx, _, ctx) {
                expect((await bbctx.variables.get('index')).value).to.equal(4);
                expect(ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.index`]).to.equal(4);
            }
        },
        {
            code: '{while;true;{increment;index},}',
            expected: '1,2,3,4,`Too many loops`',
            errors: [
                { start: 0, end: 31, error: new BBTagRuntimeError('Too many loops') }
            ],
            subtags: [new GetSubtag(), new IncrementSubtag()],
            setup(ctx) {
                ctx.options.tagName = 'testTag';
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.index`] = '0';
            },
            postSetup(bbctx, ctx) {
                let i = 0;
                ctx.limit.setup(m => m.check(bbctx, 'while:loops')).verifiable(5).thenCall(() => {
                    if (i++ >= 4)
                        throw new BBTagRuntimeError('Too many loops');
                    return undefined;
                });
            },
            async assert(bbctx, _, ctx) {
                expect((await bbctx.variables.get('index')).value).to.equal(4);
                expect(ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.index`]).to.equal(4);
            }
        },
        {
            code: '{while;{get;index};<;10;{increment;index}{if;{get;index};==;6;{return}},}',
            expected: '1,2,3,4,5,6',
            subtags: [new GetSubtag(), new IfSubtag(), new ReturnSubtag(), new IncrementSubtag()],
            setup(ctx) {
                ctx.options.tagName = 'testTag';
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.index`] = '0';
            },
            postSetup(bbctx, ctx) {
                ctx.limit.setup(m => m.check(bbctx, 'while:loops')).verifiable(6).thenResolve(undefined);
            },
            async assert(bbctx, _, ctx) {
                expect((await bbctx.variables.get('index')).value).to.equal(6);
                expect(ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.index`]).to.equal(6);
                expect(bbctx.data.state).to.equal(BBTagRuntimeState.ABORT);
            }
        }
    ]
});
