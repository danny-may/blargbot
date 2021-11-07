import { BaseSubtag, BBTagContext } from '@cluster/bbtag';
import { SubtagCall } from '@cluster/types';
import { parse, SubtagType } from '@cluster/utils';

export class SuppressLookupSubtag extends BaseSubtag {
    public constructor() {
        super({
            name: 'suppresslookup',
            category: SubtagType.BOT,
            definition: [
                {
                    parameters: ['value?'],
                    description: 'Sets whether error messages in the lookup system (query canceled, nothing found) should be suppressed. `value` must be a boolean, and defaults to `true`.',
                    exampleCode: '{suppresslookup}',
                    exampleOut: '',
                    execute: (ctx, [value], subtag) => this.suppress(ctx, value.value, subtag)
                }
            ]
        });
    }

    public suppress(
        context: BBTagContext,
        value: string,
        subtag: SubtagCall
    ): string | void {
        let suppress: boolean | undefined = true;
        if (value !== '') {
            suppress = parse.boolean(value);
            if (typeof suppress !== 'boolean')
                return this.notABoolean(context, subtag);
        }

        context.scopes.local.noLookupErrors = suppress;
    }
}
