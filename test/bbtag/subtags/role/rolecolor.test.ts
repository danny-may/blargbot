import { RoleColorSubtag } from '@blargbot/bbtag/subtags/role/rolecolor';

import { runSubtagTests } from '../SubtagTestSuite';
import { createGetRolePropTestCases } from './_getRolePropTest';

runSubtagTests({
    subtag: new RoleColorSubtag(),
    argCountBounds: { min: 1, max: 2 },
    cases: [
        ...createGetRolePropTestCases({
            quiet: '',
            generateCode(...args) {
                return `{${['rolecolor', ...args].join(';')}}`;
            },
            cases: [
                {
                    expected: '4488cc',
                    setup(role) {
                        role.color = 0x4488cc;
                    }
                },
                {
                    expected: '000000',
                    setup(role) {
                        role.color = 0;
                    }
                },
                {
                    expected: 'ffffff',
                    setup(role) {
                        role.color = 0xffffff;
                    }
                }
            ]
        })
    ]
});
