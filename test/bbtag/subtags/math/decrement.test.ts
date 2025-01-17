import { NotABooleanError, NotANumberError } from '@blargbot/bbtag/errors';
import { DecrementSubtag } from '@blargbot/bbtag/subtags/math/decrement';
import { expect } from 'chai';

import { runSubtagTests } from '../SubtagTestSuite';

runSubtagTests({
    subtag: new DecrementSubtag(),
    argCountBounds: { min: 1, max: 3 },
    cases: [
        {
            code: '{decrement;_myVariable}',
            expected: '17',
            setup(ctx) {
                ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`] = 18;
            },
            assert(_, __, ctx) {
                expect(ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`]).to.equal(17);
            }
        },
        {
            code: '{decrement;_myVariable}',
            expected: '17',
            setup(ctx) {
                ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`] = 18.1;
            },
            assert(_, __, ctx) {
                expect(ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`]).to.equal(17);
            }
        },
        {
            code: '{decrement;_myVariable}',
            expected: '17',
            setup(ctx) {
                ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`] = 18.9999;
            },
            assert(_, __, ctx) {
                expect(ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`]).to.equal(17);
            }
        },
        {
            code: '{decrement;_myVariable}',
            expected: '17',
            setup(ctx) {
                ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`] = '18';
            },
            assert(_, __, ctx) {
                expect(ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`]).to.equal(17);
            }
        },
        {
            code: '{decrement;_myVariable}',
            expected: '`Not a number`',
            setup(ctx) {
                ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`] = 'abc';
                Object.freeze(ctx.tagVariables);
            },
            errors: [
                { start: 0, end: 23, error: new NotANumberError('abc') }
            ]
        },
        {
            code: '{decrement;_myVariable;3}',
            expected: '19',
            setup(ctx) {
                ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`] = 22;
            },
            assert(_, __, ctx) {
                expect(ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`]).to.equal(19);
            }
        },
        {
            code: '{decrement;_myVariable;3}',
            expected: '19',
            setup(ctx) {
                ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`] = 22.1;
            },
            assert(_, __, ctx) {
                expect(ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`]).to.equal(19);
            }
        },
        {
            code: '{decrement;_myVariable;3.6}',
            expected: '19',
            setup(ctx) {
                ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`] = 22;
            },
            assert(_, __, ctx) {
                expect(ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`]).to.equal(19);
            }
        },
        {
            code: '{decrement;_myVariable;xyz}',
            expected: '`Not a number`',
            setup(ctx) {
                ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`] = 22;
                Object.freeze(ctx.tagVariables);
            },
            errors: [
                { start: 0, end: 27, error: new NotANumberError('xyz') }
            ]
        },
        {
            code: '{decrement;_myVariable;9;true}',
            expected: '7',
            setup(ctx) {
                ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`] = 16;
            },
            assert(_, __, ctx) {
                expect(ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`]).to.equal(7);
            }
        },
        {
            code: '{decrement;_myVariable;9;true}',
            expected: '7',
            setup(ctx) {
                ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`] = 16.1;
            },
            assert(_, __, ctx) {
                expect(ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`]).to.equal(7);
            }
        },
        {
            code: '{decrement;_myVariable;9.6;true}',
            expected: '7',
            setup(ctx) {
                ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`] = 16;
            },
            assert(_, __, ctx) {
                expect(ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`]).to.equal(7);
            }
        },
        {
            code: '{decrement;_myVariable;9;false}',
            expected: '7',
            setup(ctx) {
                ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`] = 16;
            },
            assert(_, __, ctx) {
                expect(ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`]).to.equal(7);
            }
        },
        {
            code: '{decrement;_myVariable;9;false}',
            expected: '7.100000000000001',
            setup(ctx) {
                ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`] = 16.1;
            },
            assert(_, __, ctx) {
                expect(ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`]).to.equal(7.100000000000001);
            }
        },
        {
            code: '{decrement;_myVariable;9.6;false}',
            expected: '6.4',
            setup(ctx) {
                ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`] = 16;
            },
            assert(_, __, ctx) {
                expect(ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`]).to.equal(6.4);
            }
        },
        {
            code: '{decrement;_myVariable;;abc}',
            expected: '`Not a boolean`',
            setup(ctx) {
                ctx.tagVariables[`GUILD_TAG.${ctx.guild.id}.myVariable`] = 22;
                Object.freeze(ctx.tagVariables);
            },
            errors: [
                { start: 0, end: 28, error: new NotABooleanError('abc') }
            ]
        }
    ]
});
