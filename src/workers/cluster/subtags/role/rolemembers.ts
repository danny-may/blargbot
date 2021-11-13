import { BBTagContext, Subtag } from '@cluster/bbtag';
import { RoleNotFoundError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';

export class RoleMembersSubtag extends Subtag {
    public constructor() {
        super({
            name: 'rolemembers',
            category: SubtagType.ROLE,
            definition: [
                {
                    parameters: ['role', 'quiet?'],
                    description: 'Returns an array of members in `role`. If `quiet` is specified, if `role` can\'t be found it will simply return nothing.',
                    exampleCode: 'The admins are: {rolemembers;Admin}.',
                    exampleOut: 'The admins are: ["11111111111111111","22222222222222222"].',
                    returns: 'id[]',
                    execute: (ctx, [roleId, quiet]) => this.getRoleMembers(ctx, roleId.value, quiet.value !== '')
                }
            ]
        });
    }

    public async getRoleMembers(
        context: BBTagContext,
        roleId: string,
        quiet: boolean
    ): Promise<string[]> {
        quiet ||= context.scopes.local.quiet ?? false;
        const role = await context.queryRole(roleId, { noLookup: quiet });

        if (role === undefined) {
            // We dont want this error to appear in the output
            context.scopes.local.fallback = '';
            throw new RoleNotFoundError(roleId);
        }

        const membersInRole = (await context.guild.roles.fetch(role.id))?.members;
        return membersInRole?.map(m => m.user.id) ?? [];
    }
}
