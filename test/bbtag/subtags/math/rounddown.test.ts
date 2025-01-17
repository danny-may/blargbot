import { NotANumberError } from '@blargbot/bbtag/errors';
import { RoundDownSubtag } from '@blargbot/bbtag/subtags/math/rounddown';

import { runSubtagTests } from '../SubtagTestSuite';

runSubtagTests({
    subtag: new RoundDownSubtag(),
    argCountBounds: { min: 1, max: 1 },
    cases: [
        { code: '{rounddown;5}', expected: '5' },
        { code: '{rounddown;9.2}', expected: '9' },
        { code: '{rounddown;3.6}', expected: '3' },
        { code: '{rounddown;4.5}', expected: '4' },
        { code: '{rounddown;22.499999}', expected: '22' },
        {
            code: '{rounddown;abc}',
            expected: '`Not a number`',
            errors: [
                { start: 0, end: 15, error: new NotANumberError('abc') }
            ]
        }
    ]
});
