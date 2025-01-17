import { BBTagRuntimeError, TooManyLoopsError } from '../errors';
import { GlobalLimit } from './GlobalLimit';
import { disabledRule, staffOnlyRule, UseCountRule } from './rules';

export class GeneralAutoResponseLimit extends GlobalLimit {
    public readonly scopeName = 'general autoresponses';

    public constructor() {
        super('generalAutoResponseLimit');

        this.addRules('ban', staffOnlyRule)
            .addRules('unban', staffOnlyRule)
            .addRules('guildbans', staffOnlyRule)
            .addRules('kick', staffOnlyRule)
            .addRules('timeout', staffOnlyRule)
            .addRules('modlog', staffOnlyRule)
            .addRules('pardon', staffOnlyRule)
            .addRules('warn', staffOnlyRule)
            .addRules('reason', staffOnlyRule)
            .addRules('slowmode', staffOnlyRule)
            .addRules('roleadd', staffOnlyRule)
            .addRules('rolecreate', staffOnlyRule)
            .addRules('roledelete', staffOnlyRule)
            .addRules('rolemention', staffOnlyRule)
            .addRules('roleremove', staffOnlyRule)
            .addRules('rolesetmentionable', staffOnlyRule)
            .addRules('rolesetperms', staffOnlyRule)
            .addRules('rolesetposition', staffOnlyRule)
            .addRules('guildseticon', staffOnlyRule, new UseCountRule(1))
            .addRules('emojicreate', staffOnlyRule)
            .addRules('emojidelete', staffOnlyRule)
            .addRules('channelcreate', staffOnlyRule)
            .addRules('channeldelete', staffOnlyRule)
            .addRules('channeledit', staffOnlyRule)
            .addRules('channelsetperms', staffOnlyRule)
            .addRules('channelsetpos', staffOnlyRule)
            .addRules('threadcreate', staffOnlyRule)
            .addRules('deletethread', staffOnlyRule)
            .addRules('dm', staffOnlyRule, new UseCountRule(1))
            .addRules('send', staffOnlyRule, new UseCountRule(1))
            .addRules('edit', staffOnlyRule, new UseCountRule(1))
            .addRules('delete', staffOnlyRule, new UseCountRule(2))
            .addRules('reactremove', new UseCountRule(1))
            .addRules('reactremove:requests', new UseCountRule(20, 'requests', 'Request'))
            .addRules('timer', disabledRule)
            .addRules('usersetnick', staffOnlyRule)
            .addRules('waitmessage', disabledRule)
            .addRules('waitreaction', disabledRule)
            .addRules([
                'for:loops',
                'repeat:loops',
                'while:loops'
            ], new UseCountRule(5000, 'loops', () => new TooManyLoopsError(5000)))
            .addRules('foreach:loops', new UseCountRule(50000, 'loops', () => new TooManyLoopsError(50000)))
            .addRules('map:loops', new UseCountRule(50000, 'loops', () => new TooManyLoopsError(50000)))
            .addRules('filter:loops', new UseCountRule(50000, 'loops', () => new BBTagRuntimeError('Max safeloops reached')))
            .addRules('dump', new UseCountRule(5));
    }
}
