import { ArgsArraySubtag } from '@blargbot/bbtag/subtags/simple/argsarray';

import { runSubtagTests } from '../SubtagTestSuite';

runSubtagTests({
    subtag: new ArgsArraySubtag(),
    argCountBounds: { min: 0, max: 0 },
    cases: [
        {
            code: '{argsarray}',
            expected: '[]',
            setup(ctx) { ctx.options.inputRaw = ''; }
        },
        {
            code: '{argsarray}',
            expected: '["this","is","a","test"]',
            setup(ctx) { ctx.options.inputRaw = 'this is a test'; }
        },
        {
            code: '{argsarray}',
            expected: '["this","is a","test"]',
            setup(ctx) { ctx.options.inputRaw = 'this "is a" test'; }
        }
    ]
});
