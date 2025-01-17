import { BBTagRuntimeError } from '@blargbot/bbtag/errors';
import { RoleDeleteSubtag } from '@blargbot/bbtag/subtags/role/roledelete';
import { ApiError, Constants } from 'eris';

import { runSubtagTests } from '../SubtagTestSuite';
import { createGetRolePropTestCases } from './_getRolePropTest';

runSubtagTests({
    subtag: new RoleDeleteSubtag(),
    argCountBounds: { min: 1, max: 2 },
    setup(ctx) {
        ctx.roles.authorizer.permissions = Constants.Permissions.manageRoles.toString();
        ctx.members.authorizer.roles.push(ctx.roles.top.id);
    },
    cases: [
        ...createGetRolePropTestCases({
            quiet: '',
            generateCode(...args) {
                return `{${['roledelete', ...args].join(';')}}`;
            },
            cases: [
                {
                    expected: '',
                    setup(role, ctx) {
                        ctx.discord.setup(m => m.deleteRole(ctx.guild.id, role.id, 'Command User#0000')).thenResolve(undefined);
                    }
                }
            ]
        }),
        {
            code: '{roledelete;3298746326924}',
            expected: '`Author cannot delete roles`',
            errors: [
                { start: 0, end: 26, error: new BBTagRuntimeError('Author cannot delete roles') }
            ],
            setup(ctx) {
                ctx.roles.authorizer.permissions = '0';
            }
        },
        {
            code: '{roledelete;3298746326924}',
            expected: '`Role above author`',
            errors: [
                { start: 0, end: 26, error: new BBTagRuntimeError('Role above author') }
            ],
            setup(ctx) {
                ctx.roles.top.id = '3298746326924';
            },
            postSetup(bbctx, ctx) {
                const role = bbctx.guild.roles.get('3298746326924');
                if (role === undefined)
                    throw new Error('Unable to locate role under test');

                ctx.util.setup(m => m.findRoles(bbctx.guild, '3298746326924'))
                    .thenResolve([role]);
            }
        },
        {
            code: '{roledelete;3298746326924}',
            expected: '`Failed to delete role: no perms`',
            errors: [
                { start: 0, end: 26, error: new BBTagRuntimeError('Failed to delete role: no perms', 'Test REST error') }
            ],
            setup(ctx) {
                ctx.roles.other.id = '3298746326924';
            },
            postSetup(bbctx, ctx) {
                const err = ctx.createRESTError(ApiError.MISSING_PERMISSIONS);
                const role = bbctx.guild.roles.get('3298746326924');
                if (role === undefined)
                    throw new Error('Unable to locate role under test');

                ctx.util.setup(m => m.findRoles(bbctx.guild, '3298746326924'))
                    .thenResolve([role]);
                ctx.discord.setup(m => m.deleteRole(ctx.guild.id, role.id, 'Command User#0000'))
                    .thenReject(err);
            }
        },
        {
            code: '{roledelete;3298746326924}',
            expected: '`Failed to delete role: no perms`',
            errors: [
                { start: 0, end: 26, error: new BBTagRuntimeError('Failed to delete role: no perms', 'Some other error message') }
            ],
            setup(ctx) {
                ctx.roles.other.id = '3298746326924';
            },
            postSetup(bbctx, ctx) {
                const err = ctx.createRESTError(ApiError.NOT_AUTHORIZED, 'Some other error message');
                const role = bbctx.guild.roles.get('3298746326924');
                if (role === undefined)
                    throw new Error('Unable to locate role under test');

                ctx.util.setup(m => m.findRoles(bbctx.guild, '3298746326924'))
                    .thenResolve([role]);
                ctx.discord.setup(m => m.deleteRole(ctx.guild.id, role.id, 'Command User#0000'))
                    .thenReject(err);
            }
        }
    ]
});
