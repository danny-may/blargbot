import { BBTagContext, Subtag } from '@cluster/bbtag';
import { UserNotFoundError } from '@cluster/bbtag/errors';
import { SubtagType } from '@cluster/utils';
import { GuildMember } from 'discord.js';

export class IsUserBoostingSubtag extends Subtag {
    public constructor() {
        super({
            name: 'isuserboosting',
            category: SubtagType.USER,
            definition: [
                {
                    parameters: [],
                    description: 'Returns `true` if the executing user is boosting the guild and `false` if not.',
                    exampleCode: '{if;{isuserboosting};Yes you are boosting;You should consider boosting}',
                    exampleOut: 'You should consider boosting',
                    returns: 'boolean',
                    execute: (ctx) => this.isUserBoosting(ctx.member)
                },
                {
                    parameters: ['user', 'quiet?'],
                    description: 'Returns `true` if the `user` is boosting the guild and `false` if not. ' +
                        'If `quiet` is specified, if `user` can\'t be found it will simply return nothing.',
                    exampleCode: '{if;{isuserboosting;stupid cat};stupid cat is boosting!; no boosting here :(}',
                    exampleOut: 'stupid cat is boosting!',
                    returns: 'boolean',
                    execute: (ctx, [user, quiet]) => this.findIsUserBoosting(ctx, user.value, quiet.value !== '')
                }
            ]
        });
    }

    public async findIsUserBoosting(context: BBTagContext, userStr: string, quiet: boolean): Promise<boolean> {
        quiet ||= context.scopes.local.quiet ?? false;
        const member = await context.queryMember(userStr, { noLookup: quiet });

        if (member === undefined) {
            // We dont want this error to appear in the output
            context.scopes.local.fallback = '';
            throw new UserNotFoundError(userStr);
        }

        return this.isUserBoosting(member);
    }

    public isUserBoosting(member: GuildMember): boolean {
        return member.premiumSinceTimestamp !== null;
    }
}
