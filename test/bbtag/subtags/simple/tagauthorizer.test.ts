import { TagAuthorizerSubtag } from '@blargbot/bbtag/subtags/simple/tagauthorizer';

import { runSubtagTests } from '../SubtagTestSuite';

runSubtagTests({
    subtag: new TagAuthorizerSubtag(),
    argCountBounds: { min: 0, max: 0 },
    cases: [
        {
            code: '{tagauthorizer}',
            expected: '1234567',
            setup(ctx) { ctx.options.authorId = '1234567'; }
        },
        {
            code: '{ccauthorizer}',
            expected: 'abcdefg',
            setup(ctx) { ctx.options.authorId = 'abcdefg'; }
        }
    ]
});
