import { SetSubtag } from '@blargbot/bbtag/subtags/bot/set';
import { guard, snowflake } from '@blargbot/core/utils';
import { TagVariableScope, TagVariableType } from '@blargbot/domain/models';
import { expect } from 'chai';

import { argument } from '../../mock';
import { runSubtagTests, SubtagTestCase } from '../SubtagTestSuite';

runSubtagTests({
    subtag: new SetSubtag(),
    argCountBounds: { min: 1, max: Infinity },
    cases: [
        ...createTestCases([
            {
                prefix: '~',
                varName: 'varName'
            },
            {
                prefix: '',
                db: { name: 'testTag', type: TagVariableType.LOCAL },
                varName: 'varName',
                setup(ctx) {
                    ctx.options.tagName = 'testTag';
                }
            },
            {
                prefix: '',
                db: { entityId: '234983689742643223984', name: 'testTag', type: TagVariableType.GUILDLOCAL },
                varName: 'varName',
                setup(ctx) {
                    ctx.options.tagName = 'testTag';
                    ctx.guild.id = ctx.roles.everyone.id = '234983689742643223984';
                    ctx.options.isCC = true;
                }
            },
            {
                prefix: '@',
                db: { entityId: '23987462839463642947', type: TagVariableType.AUTHOR },
                varName: 'varName',
                setup(ctx) {
                    ctx.users.command.id = '23987462839463642947';
                }
            },
            {
                prefix: '*',
                db: { type: TagVariableType.GLOBAL },
                varName: 'varName'
            },
            {
                prefix: '_',
                db: { entityId: '234983689742643223984', type: TagVariableType.GUILD },
                varName: 'varName',
                setup(ctx) {
                    ctx.guild.id = ctx.roles.everyone.id = '234983689742643223984';
                    ctx.options.isCC = true;
                }
            },
            {
                prefix: '_',
                db: { entityId: '234983689742643223984', type: TagVariableType.TAGGUILD },
                varName: 'varName',
                setup(ctx) {
                    ctx.guild.id = ctx.roles.everyone.id = '234983689742643223984';
                }
            }
        ], [
            { args: [], value: undefined },
            { args: ['a'], value: 'a' },
            { args: ['a', 'b', 'c'], value: ['a', 'b', 'c'] },
            { args: ['[1,2,3]'], value: [1, 2, 3] },
            { args: ['[a,b,c]'], value: '[a,b,c]' },
            { args: ['["a","b","c"]'], value: ['a', 'b', 'c'] },
            { args: ['[1,2,3]', 'a', 'b'], value: ['[1,2,3]', 'a', 'b'] }
        ])
    ]
});

function* createTestCases(setups: Array<{ varName: string; prefix: string; db?: TagVariableScope; setup?: SubtagTestCase['setup']; }>, cases: Array<{ args: string[]; value: JToken | undefined; }>): Generator<SubtagTestCase> {
    for (const { varName, prefix, db, setup } of setups) {
        for (const { args, value } of cases) {
            yield {
                title: 'When the value isnt forced',
                code: `{set;${prefix}${[varName, ...args].join(';')}}`,
                expected: '',
                setupSaveVariables: false,
                setup,
                async assert(bbctx) {
                    expect((await bbctx.variables.get(`${prefix}${varName}`)).value).to.deep.equal(value);
                }
            };
            yield {
                title: 'When the value has changed',
                code: `{set;!${prefix}${[varName, ...args].join(';')}}`,
                expected: '',
                setupSaveVariables: false,
                async setup(ctx, ...args) {
                    if (db !== undefined) {
                        ctx.tagVariablesTable.setup(m => m.upsert(argument.isDeepEqual({ [varName]: value }), argument.isDeepEqual(db)))
                            .thenResolve(undefined);
                        ctx.tagVariables[`${db.type}.${[db.entityId, db.name].filter(guard.hasValue).join('_')}.${varName}`] = snowflake.create().toString();
                    }
                    await setup?.call(this, ctx, ...args);
                },
                async assert(bbctx) {
                    expect((await bbctx.variables.get(`${prefix}${varName}`)).value).to.deep.equal(value);
                }
            };
            yield {
                title: 'When the value hasnt changed',
                code: `{set;!${prefix}${[varName, ...args].join(';')}}`,
                expected: '',
                setupSaveVariables: false,
                async setup(ctx, ...args) {
                    if (db !== undefined) {
                        ctx.tagVariables[`${db.type}.${[db.entityId, db.name].filter(guard.hasValue).join('_')}.${varName}`] = value === undefined ? undefined : JSON.parse(JSON.stringify(value));
                    }
                    await setup?.call(this, ctx, ...args);
                },
                async assert(bbctx) {
                    expect((await bbctx.variables.get(`${prefix}${varName}`)).value).to.deep.equal(value);
                }
            };
        }
    }
}
