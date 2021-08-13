import { BaseSubtag, BBTagContext } from '@cluster/bbtag';
import { SubtagType } from '@cluster/utils';

export class RolesSubtag extends BaseSubtag {
    public constructor() {
        super({
            name: 'roles',
            category: SubtagType.API,
            definition: [
                {
                    parameters: [],
                    description: 'Returns an array of roles on the current guild.',
                    exampleCode: 'The roles on this guild are: {roles}.',
                    exampleOut: 'The roles on this guild are: ["11111111111111111","22222222222222222"].',
                    execute: (ctx) => this.getGuildRoles(ctx)
                },
                {
                    parameters: ['user', 'quiet?'],
                    description: 'Returns `user`\'s roles in the current guild. If `quiet` is specified, if `user` can\'t be found it will simply return nothing.',
                    exampleCode: 'Stupid cat has the roles: {roles;Stupid cat}',
                    exampleOut: 'Stupid cat has the roles: ["11111111111111111","22222222222222222"]',
                    execute: (ctx, [userId, quietStr]) => this.getUserRoles(ctx, userId.value, quietStr.value)
                }
            ]
        });
    }

    public getGuildRoles(
        context: BBTagContext
    ): string {
        return JSON.stringify(context.member.roles.cache.sort((a, b) => b.position - a.position).map(r => r.id));
    }

    public async getUserRoles(
        context: BBTagContext,
        userId: string,
        quietStr: string
    ): Promise<string> {
        const quiet = context.scope.quiet !== undefined ? context.scope.quiet : quietStr.length > 0;
        const user = await context.getUser(userId, {
            quiet, suppress: context.scope.suppressLookup,
            label: `${context.isCC ? 'custom command' : 'tag'} \`${context.rootTagName}\``
        });

        if (user !== undefined) {
            const member = await context.util.getMemberById(context.guild, user.id);
            if (member !== undefined) {
                return JSON.stringify(member.roles.cache.sort((a, b) => b.position - a.position).map(r => r.id));
            }
        }

        return quiet ? '' : ''; //TODO add behaviour for this????
    }
}
