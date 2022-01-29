import { BBTagRuntimeError, ChannelNotFoundError, NotEnoughArgumentsError, TooManyArgumentsError } from '@cluster/bbtag/errors';
import { SendSubtag } from '@cluster/subtags/message/send';
import { EscapeBbtagSubtag } from '@cluster/subtags/misc/escapebbtag';
import { expect } from 'chai';
import { KnownGuildTextableChannel, Message } from 'eris';

import { argument } from '../../../../mock';
import { MarkerError, runSubtagTests, SubtagTestContext } from '../SubtagTestSuite';

runSubtagTests({
    subtag: new SendSubtag(),
    cases: [
        {
            code: '{send}',
            expected: '`Not enough arguments`',
            errors: [
                { start: 0, end: 6, error: new NotEnoughArgumentsError(2, 0) }
            ]
        },
        {
            code: '{send;{eval}}',
            expected: '`Not enough arguments`',
            errors: [
                { start: 6, end: 12, error: new MarkerError('eval', 6) },
                { start: 0, end: 13, error: new NotEnoughArgumentsError(2, 1) }
            ]
        },
        {
            code: '{send;1923681361978632931;abc}',
            expected: '`No channel found`',
            errors: [
                { start: 0, end: 30, error: new ChannelNotFoundError('1923681361978632931') }
            ],
            postSetup(bbctx, ctx) {
                ctx.util.setup(m => m.findChannels(bbctx.guild, '1923681361978632931')).thenResolve([]);
            }
        },
        {
            code: '{send;1923681361978632931;abc}',
            expected: '`Test error`',
            errors: [
                { start: 0, end: 30, error: new BBTagRuntimeError('Test error') }
            ],
            setup(ctx) {
                ctx.options.isCC = false;
            },
            postSetup(bbctx, ctx) {
                const roleMentions = ['56789043764325674', '345678238285862342'];
                const userMentions = ['23946265743358573', '234926342423437987'];
                const general = bbctx.guild.channels.get(ctx.channels.general.id);
                if (general === undefined)
                    throw new Error('Unable to locate the mocked channel');

                bbctx.state.nsfw = 'This is a nsfw message';
                bbctx.state.allowedMentions.everybody = true;
                bbctx.state.allowedMentions.roles = roleMentions;
                bbctx.state.allowedMentions.users = userMentions;

                ctx.util.setup(m => m.findChannels(bbctx.guild, '1923681361978632931')).thenResolve([general]);
                ctx.util.setup(m => m.send(general as KnownGuildTextableChannel, argument.isDeepEqual({
                    content: 'abc',
                    embeds: undefined,
                    files: undefined,
                    nsfw: 'This is a nsfw message',
                    allowedMentions: {
                        everyone: false
                    }
                }))).thenReject(new BBTagRuntimeError('Test error'));
            },
            assert(bbctx) {
                expect(bbctx.state.ownedMsgs).to.be.empty;
            }
        },
        {
            code: '{send;1923681361978632931;abc}',
            expected: '`Failed to send: Test error`',
            errors: [
                { start: 0, end: 30, error: new BBTagRuntimeError('Failed to send: Test error') }
            ],
            setup(ctx) {
                ctx.options.isCC = false;
            },
            postSetup(bbctx, ctx) {
                const roleMentions = ['56789043764325674', '345678238285862342'];
                const userMentions = ['23946265743358573', '234926342423437987'];
                const general = bbctx.guild.channels.get(ctx.channels.general.id);
                if (general === undefined)
                    throw new Error('Unable to locate the mocked channel');

                bbctx.state.nsfw = 'This is a nsfw message';
                bbctx.state.allowedMentions.everybody = true;
                bbctx.state.allowedMentions.roles = roleMentions;
                bbctx.state.allowedMentions.users = userMentions;

                ctx.util.setup(m => m.findChannels(bbctx.guild, '1923681361978632931')).thenResolve([general]);
                ctx.util.setup(m => m.send(general as KnownGuildTextableChannel, argument.isDeepEqual({
                    content: 'abc',
                    embeds: undefined,
                    files: undefined,
                    nsfw: 'This is a nsfw message',
                    allowedMentions: {
                        everyone: false
                    }
                }))).thenReject(ctx.createRESTError(0, 'Test error'));
            },
            assert(bbctx) {
                expect(bbctx.state.ownedMsgs).to.be.empty;
            }
        },
        {
            code: '{send;1923681361978632931;abc}',
            expected: '`Failed to send: UNKNOWN`',
            errors: [
                { start: 0, end: 30, error: new BBTagRuntimeError('Failed to send: UNKNOWN') }
            ],
            setup(ctx) {
                ctx.options.isCC = false;
            },
            postSetup(bbctx, ctx) {
                const roleMentions = ['56789043764325674', '345678238285862342'];
                const userMentions = ['23946265743358573', '234926342423437987'];
                const general = bbctx.guild.channels.get(ctx.channels.general.id);
                const error = new Error('This error should have been caught, not thrown!');

                if (general === undefined)
                    throw new Error('Unable to locate the mocked channel');

                bbctx.state.nsfw = 'This is a nsfw message';
                bbctx.state.allowedMentions.everybody = true;
                bbctx.state.allowedMentions.roles = roleMentions;
                bbctx.state.allowedMentions.users = userMentions;

                ctx.logger.setup(m => m.error('Failed to send!', error)).thenReturn(undefined);
                ctx.util.setup(m => m.findChannels(bbctx.guild, '1923681361978632931')).thenResolve([general]);
                ctx.util.setup(m => m.send(general as KnownGuildTextableChannel, argument.isDeepEqual({
                    content: 'abc',
                    embeds: undefined,
                    files: undefined,
                    nsfw: 'This is a nsfw message',
                    allowedMentions: {
                        everyone: false
                    }
                }))).thenReject(error);
            },
            assert(bbctx) {
                expect(bbctx.state.ownedMsgs).to.be.empty;
            }
        },
        {
            title: 'Custom command',
            code: '{send;1923681361978632931;abc}',
            expected: '239476239742340234',
            setup(ctx) {
                ctx.options.isCC = true;
                ctx.guildTable.setup(m => m.getSetting(ctx.guild.id, 'disableeveryone')).thenResolve(false);
            },
            postSetup(bbctx, ctx) {
                const roleMentions = ['56789043764325674', '345678238285862342'];
                const userMentions = ['23946265743358573', '234926342423437987'];
                const message: Message<KnownGuildTextableChannel> = ctx.createMessage(SubtagTestContext.createApiMessage({
                    id: '239476239742340234',
                    channel_id: bbctx.channel.id
                }, ctx.users.command));

                const general = bbctx.guild.channels.get(ctx.channels.general.id);
                if (general === undefined)
                    throw new Error('Unable to locate the mocked channel');

                bbctx.state.nsfw = 'This is a nsfw message';
                bbctx.state.allowedMentions.everybody = true;
                bbctx.state.allowedMentions.roles = roleMentions;
                bbctx.state.allowedMentions.users = userMentions;

                ctx.util.setup(m => m.findChannels(bbctx.guild, '1923681361978632931')).thenResolve([general]);
                ctx.util.setup(m => m.send(general as KnownGuildTextableChannel, argument.isDeepEqual({
                    content: 'abc',
                    embeds: undefined,
                    files: undefined,
                    nsfw: 'This is a nsfw message',
                    allowedMentions: {
                        everyone: true,
                        roles: roleMentions,
                        users: userMentions
                    }
                }))).thenResolve(message);
            },
            assert(bbctx) {
                expect(bbctx.state.ownedMsgs).to.include('239476239742340234');
            }
        },
        {
            title: 'Custom command',
            code: '{send;1923681361978632931;{escapebbtag;{"title":"New embed!"}}}',
            subtags: [new EscapeBbtagSubtag()],
            expected: '239476239742340234',
            setup(ctx) {
                ctx.options.isCC = true;
                ctx.guildTable.setup(m => m.getSetting(ctx.guild.id, 'disableeveryone')).thenResolve(false);
            },
            postSetup(bbctx, ctx) {
                const roleMentions = ['56789043764325674', '345678238285862342'];
                const userMentions = ['23946265743358573', '234926342423437987'];
                const message: Message<KnownGuildTextableChannel> = ctx.createMessage(SubtagTestContext.createApiMessage({
                    id: '239476239742340234',
                    channel_id: bbctx.channel.id
                }, ctx.users.command));

                const general = bbctx.guild.channels.get(ctx.channels.general.id);
                if (general === undefined)
                    throw new Error('Unable to locate the mocked channel');

                bbctx.state.nsfw = 'This is a nsfw message';
                bbctx.state.allowedMentions.everybody = true;
                bbctx.state.allowedMentions.roles = roleMentions;
                bbctx.state.allowedMentions.users = userMentions;

                ctx.util.setup(m => m.findChannels(bbctx.guild, '1923681361978632931')).thenResolve([general]);
                ctx.util.setup(m => m.send(general as KnownGuildTextableChannel, argument.isDeepEqual({
                    content: undefined,
                    embeds: [{ title: 'New embed!' }],
                    files: undefined,
                    nsfw: 'This is a nsfw message',
                    allowedMentions: {
                        everyone: true,
                        roles: roleMentions,
                        users: userMentions
                    }
                }))).thenResolve(message);
            },
            assert(bbctx) {
                expect(bbctx.state.ownedMsgs).to.include('239476239742340234');
            }
        },
        {
            title: 'Tag command',
            code: '{send;1923681361978632931;abc}',
            expected: '239476239742340234',
            setup(ctx) {
                ctx.options.isCC = false;
            },
            postSetup(bbctx, ctx) {
                const roleMentions = ['56789043764325674', '345678238285862342'];
                const userMentions = ['23946265743358573', '234926342423437987'];
                const message: Message<KnownGuildTextableChannel> = ctx.createMessage(SubtagTestContext.createApiMessage({
                    id: '239476239742340234',
                    channel_id: bbctx.channel.id
                }, ctx.users.command));

                const general = bbctx.guild.channels.get(ctx.channels.general.id);
                if (general === undefined)
                    throw new Error('Unable to locate the mocked channel');

                bbctx.state.nsfw = 'This is a nsfw message';
                bbctx.state.allowedMentions.everybody = true;
                bbctx.state.allowedMentions.roles = roleMentions;
                bbctx.state.allowedMentions.users = userMentions;

                ctx.util.setup(m => m.findChannels(bbctx.guild, '1923681361978632931')).thenResolve([general]);
                ctx.util.setup(m => m.send(general as KnownGuildTextableChannel, argument.isDeepEqual({
                    content: 'abc',
                    embeds: undefined,
                    files: undefined,
                    nsfw: 'This is a nsfw message',
                    allowedMentions: {
                        everyone: false
                    }
                }))).thenResolve(message);
            },
            assert(bbctx) {
                expect(bbctx.state.ownedMsgs).to.include('239476239742340234');
            }
        },
        {
            title: 'Tag command',
            code: '{send;1923681361978632931;{escapebbtag;{"title":"New embed!"}}}',
            subtags: [new EscapeBbtagSubtag()],
            expected: '239476239742340234',
            setup(ctx) {
                ctx.options.isCC = false;
            },
            postSetup(bbctx, ctx) {
                const roleMentions = ['56789043764325674', '345678238285862342'];
                const userMentions = ['23946265743358573', '234926342423437987'];
                const message: Message<KnownGuildTextableChannel> = ctx.createMessage(SubtagTestContext.createApiMessage({
                    id: '239476239742340234',
                    channel_id: bbctx.channel.id
                }, ctx.users.command));

                const general = bbctx.guild.channels.get(ctx.channels.general.id);
                if (general === undefined)
                    throw new Error('Unable to locate the mocked channel');

                bbctx.state.nsfw = 'This is a nsfw message';
                bbctx.state.allowedMentions.everybody = true;
                bbctx.state.allowedMentions.roles = roleMentions;
                bbctx.state.allowedMentions.users = userMentions;

                ctx.util.setup(m => m.findChannels(bbctx.guild, '1923681361978632931')).thenResolve([general]);
                ctx.util.setup(m => m.send(general as KnownGuildTextableChannel, argument.isDeepEqual({
                    content: undefined,
                    embeds: [{ title: 'New embed!' }],
                    files: undefined,
                    nsfw: 'This is a nsfw message',
                    allowedMentions: {
                        everyone: false
                    }
                }))).thenResolve(message);
            },
            assert(bbctx) {
                expect(bbctx.state.ownedMsgs).to.include('239476239742340234');
            }
        },
        {
            title: 'Custom command',
            code: '{send;1923681361978632931;abc;{escapebbtag;{"title":"New embed!"}}}',
            subtags: [new EscapeBbtagSubtag()],
            expected: '239476239742340234',
            setup(ctx) {
                ctx.options.isCC = true;
                ctx.guildTable.setup(m => m.getSetting(ctx.guild.id, 'disableeveryone')).thenResolve(false);
            },
            postSetup(bbctx, ctx) {
                const roleMentions = ['56789043764325674', '345678238285862342'];
                const userMentions = ['23946265743358573', '234926342423437987'];
                const message: Message<KnownGuildTextableChannel> = ctx.createMessage(SubtagTestContext.createApiMessage({
                    id: '239476239742340234',
                    channel_id: bbctx.channel.id
                }, ctx.users.command));

                const general = bbctx.guild.channels.get(ctx.channels.general.id);
                if (general === undefined)
                    throw new Error('Unable to locate the mocked channel');

                bbctx.state.nsfw = 'This is a nsfw message';
                bbctx.state.allowedMentions.everybody = true;
                bbctx.state.allowedMentions.roles = roleMentions;
                bbctx.state.allowedMentions.users = userMentions;

                ctx.util.setup(m => m.findChannels(bbctx.guild, '1923681361978632931')).thenResolve([general]);
                ctx.util.setup(m => m.send(general as KnownGuildTextableChannel, argument.isDeepEqual({
                    content: 'abc',
                    embeds: [{ title: 'New embed!' }],
                    files: undefined,
                    nsfw: 'This is a nsfw message',
                    allowedMentions: {
                        everyone: true,
                        roles: roleMentions,
                        users: userMentions
                    }
                }))).thenResolve(message);
            },
            assert(bbctx) {
                expect(bbctx.state.ownedMsgs).to.include('239476239742340234');
            }
        },
        {
            title: 'Tag command',
            code: '{send;1923681361978632931;abc;{escapebbtag;{"title":"New embed!"}}}',
            subtags: [new EscapeBbtagSubtag()],
            expected: '239476239742340234',
            setup(ctx) {
                ctx.options.isCC = false;
            },
            postSetup(bbctx, ctx) {
                const roleMentions = ['56789043764325674', '345678238285862342'];
                const userMentions = ['23946265743358573', '234926342423437987'];
                const message: Message<KnownGuildTextableChannel> = ctx.createMessage(SubtagTestContext.createApiMessage({
                    id: '239476239742340234',
                    channel_id: bbctx.channel.id
                }, ctx.users.command));

                const general = bbctx.guild.channels.get(ctx.channels.general.id);
                if (general === undefined)
                    throw new Error('Unable to locate the mocked channel');

                bbctx.state.nsfw = 'This is a nsfw message';
                bbctx.state.allowedMentions.everybody = true;
                bbctx.state.allowedMentions.roles = roleMentions;
                bbctx.state.allowedMentions.users = userMentions;

                ctx.util.setup(m => m.findChannels(bbctx.guild, '1923681361978632931')).thenResolve([general]);
                ctx.util.setup(m => m.send(general as KnownGuildTextableChannel, argument.isDeepEqual({
                    content: 'abc',
                    embeds: [{ title: 'New embed!' }],
                    files: undefined,
                    nsfw: 'This is a nsfw message',
                    allowedMentions: {
                        everyone: false
                    }
                }))).thenResolve(message);
            },
            assert(bbctx) {
                expect(bbctx.state.ownedMsgs).to.include('239476239742340234');
            }
        },
        {
            title: 'Custom command',
            code: '{send;1923681361978632931;abc;{escapebbtag;{"title":"New embed!"}};my file content}',
            subtags: [new EscapeBbtagSubtag()],
            expected: '239476239742340234',
            setup(ctx) {
                ctx.options.isCC = true;
                ctx.guildTable.setup(m => m.getSetting(ctx.guild.id, 'disableeveryone')).thenResolve(false);
            },
            postSetup(bbctx, ctx) {
                const roleMentions = ['56789043764325674', '345678238285862342'];
                const userMentions = ['23946265743358573', '234926342423437987'];
                const message: Message<KnownGuildTextableChannel> = ctx.createMessage(SubtagTestContext.createApiMessage({
                    id: '239476239742340234',
                    channel_id: bbctx.channel.id
                }, ctx.users.command));

                const general = bbctx.guild.channels.get(ctx.channels.general.id);
                if (general === undefined)
                    throw new Error('Unable to locate the mocked channel');

                bbctx.state.nsfw = 'This is a nsfw message';
                bbctx.state.allowedMentions.everybody = true;
                bbctx.state.allowedMentions.roles = roleMentions;
                bbctx.state.allowedMentions.users = userMentions;

                ctx.util.setup(m => m.findChannels(bbctx.guild, '1923681361978632931')).thenResolve([general]);
                ctx.util.setup(m => m.send(general as KnownGuildTextableChannel, argument.isDeepEqual({
                    content: 'abc',
                    embeds: [{ title: 'New embed!' }],
                    files: [{ file: 'my file content', name: 'file.txt' }],
                    nsfw: 'This is a nsfw message',
                    allowedMentions: {
                        everyone: true,
                        roles: roleMentions,
                        users: userMentions
                    }
                }))).thenResolve(message);
            },
            assert(bbctx) {
                expect(bbctx.state.ownedMsgs).to.include('239476239742340234');
            }
        },
        {
            title: 'Tag command',
            code: '{send;1923681361978632931;abc;{escapebbtag;{"title":"New embed!"}};my file content}',
            subtags: [new EscapeBbtagSubtag()],
            expected: '239476239742340234',
            setup(ctx) {
                ctx.options.isCC = false;
            },
            postSetup(bbctx, ctx) {
                const roleMentions = ['56789043764325674', '345678238285862342'];
                const userMentions = ['23946265743358573', '234926342423437987'];
                const message: Message<KnownGuildTextableChannel> = ctx.createMessage(SubtagTestContext.createApiMessage({
                    id: '239476239742340234',
                    channel_id: bbctx.channel.id
                }, ctx.users.command));

                const general = bbctx.guild.channels.get(ctx.channels.general.id);
                if (general === undefined)
                    throw new Error('Unable to locate the mocked channel');

                bbctx.state.nsfw = 'This is a nsfw message';
                bbctx.state.allowedMentions.everybody = true;
                bbctx.state.allowedMentions.roles = roleMentions;
                bbctx.state.allowedMentions.users = userMentions;

                ctx.util.setup(m => m.findChannels(bbctx.guild, '1923681361978632931')).thenResolve([general]);
                ctx.util.setup(m => m.send(general as KnownGuildTextableChannel, argument.isDeepEqual({
                    content: 'abc',
                    embeds: [{ title: 'New embed!' }],
                    files: [{ file: 'my file content', name: 'file.txt' }],
                    nsfw: 'This is a nsfw message',
                    allowedMentions: {
                        everyone: false
                    }
                }))).thenResolve(message);
            },
            assert(bbctx) {
                expect(bbctx.state.ownedMsgs).to.include('239476239742340234');
            }
        },
        {
            title: 'Custom command',
            code: '{send;1923681361978632931;abc;{escapebbtag;{"title":"New embed!"}};buffer:abcdef}',
            subtags: [new EscapeBbtagSubtag()],
            expected: '239476239742340234',
            setup(ctx) {
                ctx.options.isCC = true;
                ctx.guildTable.setup(m => m.getSetting(ctx.guild.id, 'disableeveryone')).thenResolve(false);
            },
            postSetup(bbctx, ctx) {
                const roleMentions = ['56789043764325674', '345678238285862342'];
                const userMentions = ['23946265743358573', '234926342423437987'];
                const message: Message<KnownGuildTextableChannel> = ctx.createMessage(SubtagTestContext.createApiMessage({
                    id: '239476239742340234',
                    channel_id: bbctx.channel.id
                }, ctx.users.command));

                const general = bbctx.guild.channels.get(ctx.channels.general.id);
                if (general === undefined)
                    throw new Error('Unable to locate the mocked channel');

                bbctx.state.nsfw = 'This is a nsfw message';
                bbctx.state.allowedMentions.everybody = true;
                bbctx.state.allowedMentions.roles = roleMentions;
                bbctx.state.allowedMentions.users = userMentions;

                ctx.util.setup(m => m.findChannels(bbctx.guild, '1923681361978632931')).thenResolve([general]);
                ctx.util.setup(m => m.send(general as KnownGuildTextableChannel, argument.isDeepEqual({
                    content: 'abc',
                    embeds: [{ title: 'New embed!' }],
                    files: [{
                        file: argument.assert<Buffer>(value => {
                            expect(value).to.be.instanceOf(Buffer)
                                .and.to.equalBytes([0x69, 0xb7, 0x1d, 0x79]);
                        }).value,
                        name: 'file.txt'
                    }],
                    nsfw: 'This is a nsfw message',
                    allowedMentions: {
                        everyone: true,
                        roles: roleMentions,
                        users: userMentions
                    }
                }))).thenResolve(message);
            },
            assert(bbctx) {
                expect(bbctx.state.ownedMsgs).to.include('239476239742340234');
            }
        },
        {
            title: 'Tag command',
            code: '{send;1923681361978632931;abc;{escapebbtag;{"title":"New embed!"}};buffer:abcdef}',
            subtags: [new EscapeBbtagSubtag()],
            expected: '239476239742340234',
            setup(ctx) {
                ctx.options.isCC = false;
            },
            postSetup(bbctx, ctx) {
                const roleMentions = ['56789043764325674', '345678238285862342'];
                const userMentions = ['23946265743358573', '234926342423437987'];
                const message: Message<KnownGuildTextableChannel> = ctx.createMessage(SubtagTestContext.createApiMessage({
                    id: '239476239742340234',
                    channel_id: bbctx.channel.id
                }, ctx.users.command));

                const general = bbctx.guild.channels.get(ctx.channels.general.id);
                if (general === undefined)
                    throw new Error('Unable to locate the mocked channel');

                bbctx.state.nsfw = 'This is a nsfw message';
                bbctx.state.allowedMentions.everybody = true;
                bbctx.state.allowedMentions.roles = roleMentions;
                bbctx.state.allowedMentions.users = userMentions;

                ctx.util.setup(m => m.findChannels(bbctx.guild, '1923681361978632931')).thenResolve([general]);
                ctx.util.setup(m => m.send(general as KnownGuildTextableChannel, argument.isDeepEqual({
                    content: 'abc',
                    embeds: [{ title: 'New embed!' }],
                    files: [{
                        file: argument.assert<Buffer>(value => {
                            expect(value).to.be.instanceOf(Buffer)
                                .and.to.equalBytes([0x69, 0xb7, 0x1d, 0x79]);
                        }).value,
                        name: 'file.txt'
                    }],
                    nsfw: 'This is a nsfw message',
                    allowedMentions: {
                        everyone: false
                    }
                }))).thenResolve(message);
            },
            assert(bbctx) {
                expect(bbctx.state.ownedMsgs).to.include('239476239742340234');
            }
        },
        {
            title: 'Custom command',
            code: '{send;1923681361978632931;abc;{escapebbtag;{"title":"New embed!"}};my file content;test.zip}',
            subtags: [new EscapeBbtagSubtag()],
            expected: '239476239742340234',
            setup(ctx) {
                ctx.options.isCC = true;
                ctx.guildTable.setup(m => m.getSetting(ctx.guild.id, 'disableeveryone')).thenResolve(false);
            },
            postSetup(bbctx, ctx) {
                const roleMentions = ['56789043764325674', '345678238285862342'];
                const userMentions = ['23946265743358573', '234926342423437987'];
                const message: Message<KnownGuildTextableChannel> = ctx.createMessage(SubtagTestContext.createApiMessage({
                    id: '239476239742340234',
                    channel_id: bbctx.channel.id
                }, ctx.users.command));

                const general = bbctx.guild.channels.get(ctx.channels.general.id);
                if (general === undefined)
                    throw new Error('Unable to locate the mocked channel');

                bbctx.state.nsfw = 'This is a nsfw message';
                bbctx.state.allowedMentions.everybody = true;
                bbctx.state.allowedMentions.roles = roleMentions;
                bbctx.state.allowedMentions.users = userMentions;

                ctx.util.setup(m => m.findChannels(bbctx.guild, '1923681361978632931')).thenResolve([general]);
                ctx.util.setup(m => m.send(general as KnownGuildTextableChannel, argument.isDeepEqual({
                    content: 'abc',
                    embeds: [{ title: 'New embed!' }],
                    files: [{ file: 'my file content', name: 'test.zip' }],
                    nsfw: 'This is a nsfw message',
                    allowedMentions: {
                        everyone: true,
                        roles: roleMentions,
                        users: userMentions
                    }
                }))).thenResolve(message);
            },
            assert(bbctx) {
                expect(bbctx.state.ownedMsgs).to.include('239476239742340234');
            }
        },
        {
            title: 'Tag command',
            code: '{send;1923681361978632931;abc;{escapebbtag;{"title":"New embed!"}};my file content;test.zip}',
            subtags: [new EscapeBbtagSubtag()],
            expected: '239476239742340234',
            setup(ctx) {
                ctx.options.isCC = false;
            },
            postSetup(bbctx, ctx) {
                const roleMentions = ['56789043764325674', '345678238285862342'];
                const userMentions = ['23946265743358573', '234926342423437987'];
                const message: Message<KnownGuildTextableChannel> = ctx.createMessage(SubtagTestContext.createApiMessage({
                    id: '239476239742340234',
                    channel_id: bbctx.channel.id
                }, ctx.users.command));

                const general = bbctx.guild.channels.get(ctx.channels.general.id);
                if (general === undefined)
                    throw new Error('Unable to locate the mocked channel');

                bbctx.state.nsfw = 'This is a nsfw message';
                bbctx.state.allowedMentions.everybody = true;
                bbctx.state.allowedMentions.roles = roleMentions;
                bbctx.state.allowedMentions.users = userMentions;

                ctx.util.setup(m => m.findChannels(bbctx.guild, '1923681361978632931')).thenResolve([general]);
                ctx.util.setup(m => m.send(general as KnownGuildTextableChannel, argument.isDeepEqual({
                    content: 'abc',
                    embeds: [{ title: 'New embed!' }],
                    files: [{ file: 'my file content', name: 'test.zip' }],
                    nsfw: 'This is a nsfw message',
                    allowedMentions: {
                        everyone: false
                    }
                }))).thenResolve(message);
            },
            assert(bbctx) {
                expect(bbctx.state.ownedMsgs).to.include('239476239742340234');
            }
        },
        {
            title: 'Custom command',
            code: '{send;1923681361978632931;abc;{escapebbtag;{"title":"New embed!"}};buffer:abcdef;test.zip}',
            subtags: [new EscapeBbtagSubtag()],
            expected: '239476239742340234',
            setup(ctx) {
                ctx.options.isCC = true;
                ctx.guildTable.setup(m => m.getSetting(ctx.guild.id, 'disableeveryone')).thenResolve(false);
            },
            postSetup(bbctx, ctx) {
                const roleMentions = ['56789043764325674', '345678238285862342'];
                const userMentions = ['23946265743358573', '234926342423437987'];
                const message: Message<KnownGuildTextableChannel> = ctx.createMessage(SubtagTestContext.createApiMessage({
                    id: '239476239742340234',
                    channel_id: bbctx.channel.id
                }, ctx.users.command));

                const general = bbctx.guild.channels.get(ctx.channels.general.id);
                if (general === undefined)
                    throw new Error('Unable to locate the mocked channel');

                bbctx.state.nsfw = 'This is a nsfw message';
                bbctx.state.allowedMentions.everybody = true;
                bbctx.state.allowedMentions.roles = roleMentions;
                bbctx.state.allowedMentions.users = userMentions;

                ctx.util.setup(m => m.findChannels(bbctx.guild, '1923681361978632931')).thenResolve([general]);
                ctx.util.setup(m => m.send(general as KnownGuildTextableChannel, argument.isDeepEqual({
                    content: 'abc',
                    embeds: [{ title: 'New embed!' }],
                    files: [{
                        file: argument.assert<Buffer>(value => {
                            expect(value).to.be.instanceOf(Buffer)
                                .and.to.equalBytes([0x69, 0xb7, 0x1d, 0x79]);
                        }).value,
                        name: 'test.zip'
                    }],
                    nsfw: 'This is a nsfw message',
                    allowedMentions: {
                        everyone: true,
                        roles: roleMentions,
                        users: userMentions
                    }
                }))).thenResolve(message);
            },
            assert(bbctx) {
                expect(bbctx.state.ownedMsgs).to.include('239476239742340234');
            }
        },
        {
            title: 'Tag command',
            code: '{send;1923681361978632931;abc;{escapebbtag;{"title":"New embed!"}};buffer:abcdef;test.zip}',
            subtags: [new EscapeBbtagSubtag()],
            expected: '239476239742340234',
            setup(ctx) {
                ctx.options.isCC = false;
            },
            postSetup(bbctx, ctx) {
                const roleMentions = ['56789043764325674', '345678238285862342'];
                const userMentions = ['23946265743358573', '234926342423437987'];
                const message: Message<KnownGuildTextableChannel> = ctx.createMessage(SubtagTestContext.createApiMessage({
                    id: '239476239742340234',
                    channel_id: bbctx.channel.id
                }, ctx.users.command));

                const general = bbctx.guild.channels.get(ctx.channels.general.id);
                if (general === undefined)
                    throw new Error('Unable to locate the mocked channel');

                bbctx.state.nsfw = 'This is a nsfw message';
                bbctx.state.allowedMentions.everybody = true;
                bbctx.state.allowedMentions.roles = roleMentions;
                bbctx.state.allowedMentions.users = userMentions;

                ctx.util.setup(m => m.findChannels(bbctx.guild, '1923681361978632931')).thenResolve([general]);
                ctx.util.setup(m => m.send(general as KnownGuildTextableChannel, argument.isDeepEqual({
                    content: 'abc',
                    embeds: [{ title: 'New embed!' }],
                    files: [{
                        file: argument.assert<Buffer>(value => {
                            expect(value).to.be.instanceOf(Buffer)
                                .and.to.equalBytes([0x69, 0xb7, 0x1d, 0x79]);
                        }).value,
                        name: 'test.zip'
                    }],
                    nsfw: 'This is a nsfw message',
                    allowedMentions: {
                        everyone: false
                    }
                }))).thenResolve(message);
            },
            assert(bbctx) {
                expect(bbctx.state.ownedMsgs).to.include('239476239742340234');
            }
        },
        {
            code: '{send;{eval};{eval};{eval};{eval};{eval};{eval}}',
            expected: '`Too many arguments`',
            errors: [
                { start: 6, end: 12, error: new MarkerError('eval', 6) },
                { start: 13, end: 19, error: new MarkerError('eval', 13) },
                { start: 20, end: 26, error: new MarkerError('eval', 20) },
                { start: 27, end: 33, error: new MarkerError('eval', 27) },
                { start: 34, end: 40, error: new MarkerError('eval', 34) },
                { start: 41, end: 47, error: new MarkerError('eval', 41) },
                { start: 0, end: 48, error: new TooManyArgumentsError(5, 6) }
            ]
        }
    ]
});
