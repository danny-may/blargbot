import { parse } from '@blargbot/core/utils';

import { BBTagContext } from '../../BBTagContext';
import { CompiledSubtag } from '../../compilation';
import { NotANumberError, UserNotFoundError } from '../../errors';
import { SubtagType } from '../../utils';

export class PardonSubtag extends CompiledSubtag {
    public constructor() {
        super({
            name: 'pardon',
            category: SubtagType.USER,
            description: '`user` defaults to the executing user. Returns the new warning count',
            definition: [
                {
                    parameters: ['user?'],
                    description: 'Gives `user` one pardon.',
                    exampleCode: 'Be pardoned! {pardon}',
                    exampleOut: 'Be pardoned! 0',
                    returns: 'number',
                    execute: (ctx, [user]) => this.pardon(ctx, user.value, '1', '')
                },
                {
                    parameters: ['user', 'count:1', 'reason?'],
                    description: 'Gives `user` `count` pardons with `reason`.',
                    exampleCode: 'Be pardoned 9001 times, Stupid cat! {pardon;Stupid cat;9001}',
                    exampleOut: 'Be pardoned 9001 times, Stupid cat! 0',
                    returns: 'number',
                    execute: (ctx, [user, count, reason]) => this.pardon(ctx, user.value, count.value, reason.value)
                }
            ]
        });
    }

    public async pardon(
        context: BBTagContext,
        userStr: string,
        countStr: string,
        reason: string
    ): Promise<number> {
        const member = await context.queryMember(userStr);
        if (member === undefined)
            throw new UserNotFoundError(userStr);

        const count = parse.int(countStr);
        if (count === undefined)
            throw new NotANumberError(countStr);

        return await context.util.pardon(member, context.user, count, reason === '' ? 'Tag Pardon' : reason);
    }
}
