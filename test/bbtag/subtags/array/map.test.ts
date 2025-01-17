import { BBTagRuntimeError } from '@blargbot/bbtag/errors';
import { MapSubtag } from '@blargbot/bbtag/subtags/array/map';
import { GetSubtag } from '@blargbot/bbtag/subtags/bot/get';
import { ReturnSubtag } from '@blargbot/bbtag/subtags/bot/return';
import { IfSubtag } from '@blargbot/bbtag/subtags/misc/if';
import { BBTagRuntimeState } from '@blargbot/bbtag/types';
import { TagVariableType } from '@blargbot/domain/models';
import { expect } from 'chai';

import { runSubtagTests } from '../SubtagTestSuite';

runSubtagTests({
    subtag: new MapSubtag(),
    argCountBounds: { min: { count: 3, noEval: [2] }, max: { count: 3, noEval: [2] } },
    cases: [
        {
            code: '{map;a;b;c{fail}}',
            expected: '[]'
        },
        {
            code: '{map;a;arr1;<{get;a}>}',
            expected: '["<this>","<is>","<arr1>"]',
            subtags: [new GetSubtag()],
            setup(ctx) {
                ctx.options.tagName = 'testTag';
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.arr1`] = ['this', 'is', 'arr1'];
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.a`] = 'initial';
            },
            postSetup(bbctx, ctx) {
                ctx.limit.setup(m => m.check(bbctx, 'map:loops')).verifiable(3).thenResolve(undefined);
            },
            async assert(bbctx, _, ctx) {
                expect((await bbctx.variables.get('a')).value).to.equal('initial');
                expect(ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.a`]).to.equal('initial');
            }
        },
        {
            code: '{map;a;{get;arr1};<{get;a}>}',
            expected: '["<this>","<is>","<arr1>"]',
            subtags: [new GetSubtag()],
            setup(ctx) {
                ctx.options.tagName = 'testTag';
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.arr1`] = ['this', 'is', 'arr1'];
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.a`] = 'initial';
            },
            postSetup(bbctx, ctx) {
                ctx.limit.setup(m => m.check(bbctx, 'map:loops')).verifiable(3).thenResolve(undefined);
            },
            async assert(bbctx, _, ctx) {
                expect((await bbctx.variables.get('a')).value).to.equal('initial');
                expect(ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.a`]).to.equal('initial');
            }
        },
        {
            code: '{map;a;var1;<{get;a}>}',
            expected: '["<t>","<h>","<i>","<s>","< >","<i>","<s>","< >","<v>","<a>","<r>","<1>"]',
            subtags: [new GetSubtag()],
            setup(ctx) {
                ctx.options.tagName = 'testTag';
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.var1`] = 'this is var1';
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.a`] = 'initial';
            },
            postSetup(bbctx, ctx) {
                ctx.limit.setup(m => m.check(bbctx, 'map:loops')).verifiable(12).thenResolve(undefined);
            },
            async assert(bbctx, _, ctx) {
                expect((await bbctx.variables.get('a')).value).to.equal('initial');
                expect(ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.a`]).to.equal('initial');
            }
        },
        {
            code: '{map;a;var1;<{get;a}>{if;{get;a};==;s;{return}}}',
            expected: '["<t>","<h>","<i>","<s>"]',
            subtags: [new GetSubtag(), new IfSubtag(), new ReturnSubtag()],
            setup(ctx) {
                ctx.options.tagName = 'testTag';
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.var1`] = 'this is var1';
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.a`] = 'initial';
            },
            postSetup(bbctx, ctx) {
                ctx.limit.setup(m => m.check(bbctx, 'map:loops')).verifiable(4).thenResolve(undefined);
            },
            async assert(bbctx, _, ctx) {
                expect((await bbctx.variables.get('a')).value).to.equal('initial');
                expect(ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.a`]).to.equal('initial');
                expect(bbctx.data.state).to.equal(BBTagRuntimeState.ABORT);
            }
        },
        {
            code: '{map;a;{get;arr1};<{get;a}>}',
            expected: '["<this>","`Too many loops`"]',
            errors: [
                { start: 0, end: 28, error: new BBTagRuntimeError('Too many loops') }
            ],
            subtags: [new GetSubtag()],
            setup(ctx) {
                ctx.options.tagName = 'testTag';
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.arr1`] = ['this', 'is', 'arr1'];
                ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.a`] = 'initial';
            },
            postSetup(bbctx, ctx) {
                let i = 0;
                ctx.limit.setup(m => m.check(bbctx, 'map:loops')).verifiable(2).thenCall(() => {
                    if (i++ >= 1)
                        throw new BBTagRuntimeError('Too many loops');
                    return undefined;
                });
            },
            async assert(bbctx, _, ctx) {
                expect((await bbctx.variables.get('a')).value).to.equal('initial');
                expect(ctx.tagVariables[`${TagVariableType.LOCAL}.testTag.a`]).to.equal('initial');
            }
        }
    ]
});
