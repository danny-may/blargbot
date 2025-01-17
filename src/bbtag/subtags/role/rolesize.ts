import { BBTagContext } from '../../BBTagContext';
import { CompiledSubtag } from '../../compilation';
import { RoleNotFoundError } from '../../errors';
import { /*parse,*/ SubtagType } from '../../utils';

export class RoleSizeSubtag extends CompiledSubtag {
    public constructor() {
        super({
            name: 'rolesize',
            category: SubtagType.ROLE,
            aliases: ['inrole'],
            definition: [
                {
                    parameters: ['role'/*, 'quiet?:false'*/], //TODO uncomment quiet parameter for new code
                    description: 'Returns the amount of people in role `role`',
                    exampleCode: 'There are {rolesize;11111111111111111} people in the role!',
                    exampleOut: 'There are 5 people in the role!',
                    returns: 'number',
                    execute: (ctx, [role/*, quiet */]) => this.getRoleSize(ctx, role.value/*, quiet.value !== '' */)
                }
            ]
        });
    }

    public async getRoleSize(context: BBTagContext, roleStr: string/*, quiet: boolean*/): Promise<number> {
        /* quiet ||= context.scopes.local.quiet ?? false */
        /* const role = await context.queryRole(roleStr, {
            quiet
        }) */
        const role = await context.queryRole(roleStr, { noLookup: true, noErrors: true });
        if (role === undefined)
            throw new RoleNotFoundError(roleStr);

        await context.util.ensureMemberCache(context.guild);
        return context.guild.members.filter(m => m.roles.includes(role.id)).length;
    }
}
