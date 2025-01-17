import { HereMentionSubtag } from '@blargbot/bbtag/subtags/message/heremention';
import { expect } from 'chai';

import { runSubtagTests } from '../SubtagTestSuite';

runSubtagTests({
    subtag: new HereMentionSubtag(),
    argCountBounds: { min: 0, max: 1 },
    cases: [
        {
            code: '{heremention}',
            expected: '@here',
            assert(ctx) {
                expect(ctx.data.allowedMentions.everybody).to.be.true;
            }
        },
        {
            code: '{heremention;true}',
            expected: '@here',
            assert(ctx) {
                expect(ctx.data.allowedMentions.everybody).to.be.true;
            }
        },
        {
            code: '{heremention;false}',
            expected: '@here',
            assert(ctx) {
                expect(ctx.data.allowedMentions.everybody).to.be.false;
            }
        }
    ]
});
