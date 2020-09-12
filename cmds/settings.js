'use strict';

const settings = require('../functions/settings'),
    prefixes = require('../functions/managePrefixes'),
    owners = require('../functions/getOwners'),
    ms = require('ms');

module.exports = {
    name: 'settings',

    exec: (client, msg, args) => {
        if (!msg.channel.permissionsOf(client.user.id).has('manageMessages')) {
            msg.channel.createMessage('I\'m sorry, but I need the permission `MANAGE_MESSAGES` for this command to work!');
            return;
        }
        msg.channel.createMessage({
            embed: {
                title: 'Settings',
                thumbnail: {
                    url: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/twitter/248/gear_2699.png'
                },
                description: 'Manage any setting for yourself or the server!',
                fields: [{
                    name: '🌆',
                    value: 'Manage settings for the server/channel!',
                    inline: false
                }, {
                    name: '👤',
                    value: 'Manage settings for yourself!',
                    inline: false
                }, {
                    name: '⏹',
                    value: 'Exit settings.'
                }]
            }
        }).then(message => {
            function addReactions(msgObj, emojis) {
                emojis.forEach(e => {
                    msgObj.addReaction(e);
                });
            }
            let state = 'idle',
                selection = 0,
                channelSelection = msg.channel.id,
                timeout = null;

            timeout = setTimeout(() => {
                message.channel.createMessage(`${msg.member.mention} the menu was cancelled due to inactivity!`).then(mesg => {
                    client.off('messageReactionAdd', handleReactions);
                    msg.delete();
                    message.delete();
                    setTimeout(() => {
                        mesg.delete();
                    }, ms('5sec'));
                });
            }, ms('1min'));
            
            function handleReactions(mesg, emoji, userID) {
                if (!client.users.get(userID).bot) {
                    message.removeReaction(emoji.name, userID).catch(() => {});
                }
                if (userID !== msg.author.id || mesg.id !== message.id) return;
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    message.channel.createMessage(`${msg.member.mention} the menu was cancelled due to inactivity!`).then(mesg => {
                        client.off('messageReactionAdd', handleReactions);
                        msg.delete();
                        message.delete();
                        setTimeout(() => {
                            mesg.delete();
                        }, ms('5sec'));
                    });
                }, ms('1min'));
                switch (state) {
                    case 'idle':
                        switch (emoji.name) {
                            case '🌆':
                                if (msg.member.permission.has('manageServer') || msg.member.permission.has('administrator') || owners.isAdmin(msg.author.id)) {
                                    message.removeReactions().then(() => {
                                        state = 'serversettings';
                                        settings.getValueByID(msg.channel.guild.id).then(setngs => {
                                            
                                            message.edit({
                                                embed: {
                                                    title: 'Server Settings',
                                                    description: 'Use ⬆️ and ⬇️ to select what to change and use ⏺ to toggle your selection! Use #️⃣ to switch to channel settings! Use ❗ to change the bots prefix! Use ⏹ to go back to the main menu.',
                                                    thumbnail: {
                                                        url: msg.channel.guild.dynamicIconURL(msg.channel.guild.icon ? (msg.channel.guild.icon.startsWith('a_') ? 'gif' : 'png') : 'png', 256)
                                                    },
                                                    fields: [...settings.flags.map((i, o, s) => {
                                                        return {
                                                            name: `${selection === o ? '> ' : ''}${i}`,
                                                            value: `is currently set to \`${settings.getFlags(setngs.flags).includes(i) ? 'ENABLED' : 'DISABLED'}\``
                                                        }
                                                    }),
                                                        {
                                                            name: 'Prefix',
                                                            value: client.guildPrefixes[msg.channel.guild.id] ? client.guildPrefixes[msg.channel.guild.id] : client.commandOptions.prefix
                                                        }
                                                    ]
                                                }
                                            }).then(() => {
                                                addReactions(message, ['⬆️', '⬇️', '⏺', '#️⃣', '⏹', '❗']);
                                            });
                                        });
                                    });
                                } else {
                                    message.edit({
                                        embed: {
                                            title: 'Insufficient Permissions!',
                                            description: 'You need `MANAGE_SERVER` or higher to edit server settings!',
                                            color: parseInt('0xff0000')
                                        }
                                    }).then(() => {
                                        setTimeout(() => {
                                            message.edit({
                                                embed: {
                                                    title: 'Settings',
                                                    thumbnail: {
                                                        url: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/twitter/248/gear_2699.png'
                                                    },
                                                    description: 'Manage any setting for yourself or the server! (The bot requires manage message permissions for the menu to work)',
                                                    fields: [{
                                                        name: '🌆',
                                                        value: 'Manage settings for the server!',
                                                        inline: false
                                                    }, {
                                                        name: '👤',
                                                        value: 'Manage settings for yourself!',
                                                        inline: false
                                                    }, {
                                                        name: '⏹',
                                                        value: 'Exit settings.'
                                                    }]
                                                }
                                            });
                                        }, 5000);
                                    });
                                }
                                break;
                            case '👤':
                                message.removeReactions().then(() => {
                                    state = 'usersettings';
                                    settings.getValueByID(msg.author.id).then(setngs => {
                                        message.edit({
                                            embed: {
                                                title: 'User Settings',
                                                description: 'Use ⬆️ and ⬇️ to select what to change and use ⏺ to toggle your selection! Use ⏹ to go back to the main menu. PASTA_MODE in this menu means pasta mode Immunity.',
                                                thumbnail: {
                                                    url: msg.author.dynamicAvatarURL(msg.author.avatar ? (msg.author.avatar.startsWith('a_') ? 'gif' : 'png') : 'png', 256)
                                                },
                                                fields: [...settings.flags.map((i, o, s) => {
                                                    return {
                                                        name: `${selection === o ? '> ' : ''}${i}`,
                                                        value: `is currently set to \`${settings.getFlags(setngs.flags).includes(i) ? 'ENABLED' : 'DISABLED'}\``
                                                    }
                                                })
                                                ]
                                            }
                                        }).then(() => {
                                            addReactions(message, ['⬆️', '⬇️', '⏺', '⏹']);
                                        });
                                    });
                                });
                                break;
                            case '⏹':
                                message.delete();
                                msg.delete();
                                clearTimeout(timeout);
                                client.off('messageReactionAdd', handleReactions);
                                break;
                        }
                        break;
                    case 'serversettings':
                        switch (emoji.name) {
                            case '⏹':
                                state = 'idle';
                                selection = 0;
                                message.removeReactions().then(() => {
                                    message.edit({
                                        embed: {
                                            title: 'Settings',
                                            thumbnail: {
                                                url: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/twitter/248/gear_2699.png'
                                            },
                                            description: 'Manage any setting for yourself or the server! (The bot requires manage message permissions for the menu to work)',
                                            fields: [{
                                                name: '🌆',
                                                value: 'Manage settings for the server/channel!',
                                                inline: false
                                            }, {
                                                name: '👤',
                                                value: 'Manage settings for yourself!',
                                                inline: false
                                            }, {
                                                name: '⏹',
                                                value: 'Exit settings.'
                                            }]
                                        }
                                    });
                                    addReactions(message, ['🌆', '👤', '⏹']);
                                });
                                break;
                            case '⬆️':
                                if (--selection < 0) selection = settings.flags.length - 1;
                                settings.getValueByID(msg.channel.guild.id).then(setngs => {
                                    message.edit({
                                        embed: {
                                            title: 'Server Settings',
                                            description: 'Use ⬆️ and ⬇️ to select what to change and use ⏺ to toggle your selection! Use #️⃣ to switch to channel settings! Use ❗ to change the bots prefix! Use ⏹ to go back to the main menu.',
                                            thumbnail: {
                                                url: msg.channel.guild.dynamicIconURL(msg.channel.guild.icon ? (msg.channel.guild.icon.startsWith('a_') ? 'gif' : 'png') : 'png', 256)
                                            },
                                            fields: [...settings.flags.map((i, o, s) => {
                                                return {
                                                    name: `${selection === o ? '> ' : ''}${i}`,
                                                    value: `is currently set to \`${settings.getFlags(setngs.flags).includes(i) ? 'ENABLED' : 'DISABLED'}\``
                                                }
                                            }),
                                                {
                                                    name: 'Prefix',
                                                    value: client.guildPrefixes[msg.channel.guild.id] ? client.guildPrefixes[msg.channel.guild.id] : client.commandOptions.prefix
                                                }
                                            ]
                                        }
                                    });
                                });
                                break;
                            case '⬇️':
                                if (++selection > settings.flags.length - 1) selection = 0;
                                settings.getValueByID(msg.channel.guild.id).then(setngs => {
                                    message.edit({
                                        embed: {
                                            title: 'Server Settings',
                                            description: 'Use ⬆️ and ⬇️ to select what to change and use ⏺ to toggle your selection! Use #️⃣ to switch to channel settings! Use ❗ to change the bots prefix! Use ⏹ to go back to the main menu.',
                                            thumbnail: {
                                                url: msg.channel.guild.dynamicIconURL(msg.channel.guild.icon ? (msg.channel.guild.icon.startsWith('a_') ? 'gif' : 'png') : 'png', 256)
                                            },
                                            fields: [...settings.flags.map((i, o, s) => {
                                                return {
                                                    name: `${selection === o ? '> ' : ''}${i}`,
                                                    value: `is currently set to \`${settings.getFlags(setngs.flags).includes(i) ? 'ENABLED' : 'DISABLED'}\``
                                                }
                                            }),
                                                {
                                                    name: 'Prefix',
                                                    value: client.guildPrefixes[msg.channel.guild.id] ? client.guildPrefixes[msg.channel.guild.id] : client.commandOptions.prefix
                                                }
                                            ]
                                        }
                                    });
                                });
                                break;
                            case '⏺':
                                settings.getValueByID(msg.channel.guild.id).then(newSettings => {
                                    let newFlags = settings.getFlags(newSettings.flags);
                                    if (settings.getFlags(newSettings.flags).includes(settings.flags[selection])) {
                                        delete newFlags[newFlags.indexOf(settings.flags[selection])];
                                    } else {
                                        newFlags.push(settings.flags[selection]);
                                    }
                                    newSettings.flags = settings.toFlags(newFlags);
                                    settings.updateValue({id: newSettings.id, flags: newSettings.flags, RNG: newSettings.RNG});
                                    settings.getValueByID(msg.channel.guild.id).then(setngs => {
                                        message.edit({
                                            embed: {
                                                title: 'Server Settings',
                                                description: 'Use ⬆️ and ⬇️ to select what to change and use ⏺ to toggle your selection! Use #️⃣ to switch to channel settings! Use ❗ to change the bots prefix! Use ⏹ to go back to the main menu.',
                                                thumbnail: {
                                                    url: msg.channel.guild.dynamicIconURL(msg.channel.guild.icon ? (msg.channel.guild.icon.startsWith('a_') ? 'gif' : 'png') : 'png', 256)
                                                },
                                                fields: [...settings.flags.map((i, o, s) => {
                                                    return {
                                                        name: `${selection === o ? '> ' : ''}${i}`,
                                                        value: `is currently set to \`${settings.getFlags(setngs.flags).includes(i) ? 'ENABLED' : 'DISABLED'}\``
                                                    }
                                                }),
                                                    {
                                                        name: 'Prefix',
                                                        value: client.guildPrefixes[msg.channel.guild.id] ? client.guildPrefixes[msg.channel.guild.id] : client.commandOptions.prefix
                                                    }
                                                ]
                                            }
                                        });
                                    });
                                });
                                break;
                            case '#️⃣':
                                state = 'channelsettings';
                                message.addReaction('🔃');
                                message.removeReaction('❗');
                                selection = 0;
                                settings.getValueByID(channelSelection).then(setngs => {
                                    message.edit({
                                        embed: {
                                            title: `Channel Settings for #${msg.channel.guild.channels.get(channelSelection).name}`,
                                            description: 'Use ⬆️ and ⬇️ to select what to change and use ⏺ to toggle your selection! Use #️⃣ to switch to server settings! Use 🔃 to change what channel you are editing! Use ⏹ to go back to the main menu.',
                                            thumbnail: {
                                                url: msg.channel.guild.dynamicIconURL(msg.channel.guild.icon ? (msg.channel.guild.icon.startsWith('a_') ? 'gif' : 'png') : 'png', 256)
                                            },
                                            fields: [...settings.flags.map((i, o, s) => {
                                                return {
                                                    name: `${selection === o ? '> ' : ''}${i}`,
                                                    value: `is currently set to \`${settings.getFlags(setngs.flags).includes(i) ? 'ENABLED' : 'DISABLED'}\``
                                                }
                                            })
                                            ]
                                        }
                                    });
                                });
                                break;
                                case '❗':
                                    state = 'setprefix';
                                    msg.channel.createMessage('Say what you want the prefix to be surrounded like this: `d!` or `dad ` using this symbol ` (yes you can have spaces in the prefix)').then(messg => {
                                        function setPrefix(messag) {
                                            if (messag.author.id !== msg.author.id || messag.channel.id !== msg.channel.id) return;
                                            let prefix = messag.content.replace(/^`([\s\S]+)`$/, '$1');
                                            if(prefix === client.commandOptions.prefix) {
                                                prefixes.managePrefixes({ action: 'remove', serverID: msg.channel.guild.id }).then(() => {
                                                    messag.channel.createMessage(`Prefix is now set to \`${client.commandOptions.prefix}\`!`).then(mesag => {
                                                        messg.delete();
                                                        messag.delete();
                                                        state = 'serversettings';
                                                        settings.getValueByID(msg.channel.guild.id).then(setngs => {
                                                            message.edit({
                                                                embed: {
                                                                    title: `Server Settings`,
                                                                    description: 'Use ⬆️ and ⬇️ to select what to change and use ⏺ to toggle your selection! Use #️⃣ to switch to channel settings! Use ❗ to change the bots prefix! Use ⏹ to go back to the main menu.',
                                                                    thumbnail: {
                                                                        url: msg.channel.guild.dynamicIconURL(msg.channel.guild.icon ? (msg.channel.guild.icon.startsWith('a_') ? 'gif' : 'png') : 'png', 256)
                                                                    },
                                                                    fields: [...settings.flags.map((i, o, s) => {
                                                                        return {
                                                                            name: `${selection === o ? '> ' : ''}${i}`,
                                                                            value: `is currently set to \`${settings.getFlags(setngs.flags).includes(i) ? 'ENABLED' : 'DISABLED'}\``
                                                                        }
                                                                    }),
                                                                        {
                                                                            name: 'Prefix',
                                                                            value: client.guildPrefixes[msg.channel.guild.id] ? client.guildPrefixes[msg.channel.guild.id] : client.commandOptions.prefix
                                                                        }
                                                                    ]
                                                                }
                                                            });
                                                        });
                                                        client.off('messageCreate', setPrefix);
                                                        setTimeout(() => {
                                                            mesag.delete();
                                                        }, 5000);
                                                    });
                                                });
                                            }else {
                                                prefixes.managePrefixes({ action: 'add', prefix, serverID: msg.channel.guild.id }).then(() => {
                                                    messag.channel.createMessage(`Prefix is now set to \`${prefix}\`!`).then(mesag => {
                                                        messg.delete();
                                                        messag.delete();
                                                        state = 'serversettings';
                                                        settings.getValueByID(msg.channel.guild.id).then(setngs => {
                                                            message.edit({
                                                                embed: {
                                                                    title: `Server Settings`,
                                                                    description: 'Use ⬆️ and ⬇️ to select what to change and use ⏺ to toggle your selection! Use #️⃣ to switch to channel settings! Use ❗ to change the bots prefix! Use ⏹ to go back to the main menu.',
                                                                    thumbnail: {
                                                                        url: msg.channel.guild.dynamicIconURL(msg.channel.guild.icon ? (msg.channel.guild.icon.startsWith('a_') ? 'gif' : 'png') : 'png', 256)
                                                                    },
                                                                    fields: [...settings.flags.map((i, o, s) => {
                                                                        return {
                                                                            name: `${selection === o ? '> ' : ''}${i}`,
                                                                            value: `is currently set to \`${settings.getFlags(setngs.flags).includes(i) ? 'ENABLED' : 'DISABLED'}\``
                                                                        }
                                                                    }),
                                                                        {
                                                                            name: 'Prefix',
                                                                            value: client.guildPrefixes[msg.channel.guild.id] ? client.guildPrefixes[msg.channel.guild.id] : client.commandOptions.prefix
                                                                        }
                                                                    ]
                                                                }
                                                            });
                                                        });
                                                        client.off('messageCreate', setPrefix);
                                                        setTimeout(() => {
                                                            mesag.delete();
                                                        }, 5000);
                                                    });
                                                });
                                            }
                                        }
                                        client.on('messageCreate', setPrefix);
                                    });
                                break;
                        }
                        break;
                    case 'channelsettings':
                        switch (emoji.name) {
                            case '#️⃣':
                                state = 'serversettings';
                                message.removeReaction('🔃');
                                message.addReaction('❗');
                                selection = 0;
                                settings.getValueByID(msg.channel.guild.id).then(setngs => {
                                    message.edit({
                                        embed: {
                                            title: `Server Settings`,
                                            description: 'Use ⬆️ and ⬇️ to select what to change and use ⏺ to toggle your selection! Use #️⃣ to switch to channel settings! Use ❗ to change the bots prefix! Use ⏹ to go back to the main menu.',
                                            thumbnail: {
                                                url: msg.channel.guild.dynamicIconURL(msg.channel.guild.icon ? (msg.channel.guild.icon.startsWith('a_') ? 'gif' : 'png') : 'png', 256)
                                            },
                                            fields: [...settings.flags.map((i, o, s) => {
                                                return {
                                                    name: `${selection === o ? '> ' : ''}${i}`,
                                                    value: `is currently set to \`${settings.getFlags(setngs.flags).includes(i) ? 'ENABLED' : 'DISABLED'}\``
                                                }
                                            }),
                                                {
                                                    name: 'Prefix',
                                                    value: client.guildPrefixes[msg.channel.guild.id] ? client.guildPrefixes[msg.channel.guild.id] : client.commandOptions.prefix
                                                }
                                            ]
                                        }
                                    });
                                });
                                break;
                            case '⏺':
                                settings.getValueByID(channelSelection).then(newSettings => {
                                    let newFlags = settings.getFlags(newSettings.flags);
                                    if (settings.getFlags(newSettings.flags).includes(settings.flags[selection])) {
                                        delete newFlags[newFlags.indexOf(settings.flags[selection])];
                                    } else {
                                        newFlags.push(settings.flags[selection]);
                                    }
                                    newSettings.flags = settings.toFlags(newFlags);
                                    settings.updateValue({id: newSettings.id, flags: newSettings.flags, RNG: newSettings.RNG});
                                    settings.getValueByID(channelSelection).then(setngs => {
                                        message.edit({
                                            embed: {
                                                title: `Channel Settings for #${msg.channel.guild.channels.get(channelSelection).name}`,
                                                description: 'Use ⬆️ and ⬇️ to select what to change and use ⏺ to toggle your selection! Use #️⃣ to switch to server settings! Use 🔃 to change what channel you are editing! Use ⏹ to go back to the main menu.',
                                                thumbnail: {
                                                    url: msg.channel.guild.dynamicIconURL(msg.channel.guild.icon ? (msg.channel.guild.icon.startsWith('a_') ? 'gif' : 'png') : 'png', 256)
                                                },
                                                fields: [...settings.flags.map((i, o, s) => {
                                                    return {
                                                        name: `${selection === o ? '> ' : ''}${i}`,
                                                        value: `is currently set to \`${settings.getFlags(setngs.flags).includes(i) ? 'ENABLED' : 'DISABLED'}\``
                                                    }
                                                })
                                                ]
                                            }
                                        });
                                    });
                                });
                                break;
                            case '⬆️':
                                if (--selection < 0) selection = settings.flags.length - 1;
                                settings.getValueByID(channelSelection).then(setngs => {
                                    message.edit({
                                        embed: {
                                            title: `Channel Settings for #${msg.channel.guild.channels.get(channelSelection).name}`,
                                            description: 'Use ⬆️ and ⬇️ to select what to change and use ⏺ to toggle your selection! Use #️⃣ to switch to server settings! Use 🔃 to change what channel you are editing! Use ⏹ to go back to the main menu.',
                                            thumbnail: {
                                                url: msg.channel.guild.dynamicIconURL(msg.channel.guild.icon ? (msg.channel.guild.icon.startsWith('a_') ? 'gif' : 'png') : 'png', 256)
                                            },
                                            fields: [...settings.flags.map((i, o, s) => {
                                                return {
                                                    name: `${selection === o ? '> ' : ''}${i}`,
                                                    value: `is currently set to \`${settings.getFlags(setngs.flags).includes(i) ? 'ENABLED' : 'DISABLED'}\``
                                                }
                                            })
                                            ]
                                        }
                                    });
                                });
                                break;
                            case '⬇️':
                                if (++selection > settings.flags.length - 1) selection = 0;
                                settings.getValueByID(channelSelection).then(setngs => {
                                    message.edit({
                                        embed: {
                                            title: `Channel Settings for #${msg.channel.guild.channels.get(channelSelection).name}`,
                                            description: 'Use ⬆️ and ⬇️ to select what to change and use ⏺ to toggle your selection! Use #️⃣ to switch to server settings! Use 🔃 to change what channel you are editing! Use ⏹ to go back to the main menu.',
                                            thumbnail: {
                                                url: msg.channel.guild.dynamicIconURL(msg.channel.guild.icon ? (msg.channel.guild.icon.startsWith('a_') ? 'gif' : 'png') : 'png', 256)
                                            },
                                            fields: [...settings.flags.map((i, o, s) => {
                                                return {
                                                    name: `${selection === o ? '> ' : ''}${i}`,
                                                    value: `is currently set to \`${settings.getFlags(setngs.flags).includes(i) ? 'ENABLED' : 'DISABLED'}\``
                                                }
                                            })
                                            ]
                                        }
                                    });
                                });
                                break;
                            case '🔃':
                                state = 'selectnewchannel';
                                message.removeReactions().then(() => {
                                    msg.channel.createMessage('Say a mention of a channel (#channel) or the channel ID to edit that channel!').then(messg => {
                                        function selectNewChannel(messag) {
                                            if (messag.author.id !== msg.author.id || messag.channel.id !== msg.channel.id) return;
                                            let chanID = messag.content.replace(/^<?#?(\d+)>? ?$/, '$1');
                                            if (!messag.channel.guild.channels.get(chanID)) {
                                                messag.channel.createMessage('That isn\'t a valid channel! Try again!').then(mesag => {
                                                    messag.delete();
                                                    setTimeout(() => {
                                                        mesag.delete()
                                                    }, 5000);
                                                });
                                            } else {
                                                client.off('messageCreate', selectNewChannel);
                                                messag.channel.createMessage(`The channel: <#${chanID}> has been selected!`).then(mesag => {
                                                    channelSelection = chanID;
                                                    state = 'channelsettings';
                                                    settings.getValueByID(channelSelection).then(setngs => {
                                                        message.edit({
                                                            embed: {
                                                                title: `Channel Settings for #${msg.channel.guild.channels.get(channelSelection).name}`,
                                                                description: 'Use ⬆️ and ⬇️ to select what to change and use ⏺ to toggle your selection! Use #️⃣ to switch to server settings! Use 🔃 to change what channel you are editing! Use ⏹ to go back to the main menu.',
                                                                thumbnail: {
                                                                    url: msg.channel.guild.dynamicIconURL(msg.channel.guild.icon ? (msg.channel.guild.icon.startsWith('a_') ? 'gif' : 'png') : 'png', 256)
                                                                },
                                                                fields: [...settings.flags.map((i, o, s) => {
                                                                    return {
                                                                        name: `${selection === o ? '> ' : ''}${i}`,
                                                                        value: `is currently set to \`${settings.getFlags(setngs.flags).includes(i) ? 'ENABLED' : 'DISABLED'}\``
                                                                    }
                                                                })
                                                                ]
                                                            }
                                                        });
                                                    });
                                                    messag.delete();
                                                    messg.delete();
                                                    addReactions(message, ['⬆️', '⬇️', '⏺', '#️⃣', '⏹', '🔃']);
                                                    setTimeout(() => {
                                                        mesag.delete();
                                                    }, 5000);

                                                });
                                            }
                                        }
                                        client.on('messageCreate', selectNewChannel);
                                    });
                                });
                            break;
                            case '⏹':
                                state = 'idle';
                                selection = 0;
                                message.removeReactions().then(() => {
                                    message.edit({
                                        embed: {
                                            title: 'Settings',
                                            thumbnail: {
                                                url: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/twitter/248/gear_2699.png'
                                            },
                                            description: 'Manage any setting for yourself or the server! (The bot requires manage message permissions for the menu to work)',
                                            fields: [{
                                                name: '🌆',
                                                value: 'Manage settings for the server/channel!',
                                                inline: false
                                            }, {
                                                name: '👤',
                                                value: 'Manage settings for yourself!',
                                                inline: false
                                            }, {
                                                name: '⏹',
                                                value: 'Exit settings.'
                                            }]
                                        }
                                    });
                                    addReactions(message, ['🌆', '👤', '⏹']);
                                });
                                break;
                        }
                        break;
                    case 'usersettings':
                        switch(emoji.name) {
                            case '⏹':
                                state = 'idle';
                                selection = 0;
                                message.removeReactions().then(() => {
                                    message.edit({
                                        embed: {
                                            title: 'Settings',
                                            thumbnail: {
                                                url: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/twitter/248/gear_2699.png'
                                            },
                                            description: 'Manage any setting for yourself or the server! (The bot requires manage message permissions for the menu to work)',
                                            fields: [{
                                                name: '🌆',
                                                value: 'Manage settings for the server/channel!',
                                                inline: false
                                            }, {
                                                name: '👤',
                                                value: 'Manage settings for yourself!',
                                                inline: false
                                            }, {
                                                name: '⏹',
                                                value: 'Exit settings.'
                                            }]
                                        }
                                    });
                                    addReactions(message, ['🌆', '👤', '⏹']);
                                });
                            break;
                            case '⬇️':
                                if (++selection > settings.flags.length - 1) selection = 0;
                                settings.getValueByID(msg.author.id).then(setngs => {
                                    message.edit({
                                        embed: {
                                            title: 'User Settings',
                                            description: 'Use ⬆️ and ⬇️ to select what to change and use ⏺ to toggle your selection! Use ⏹ to go back to the main menu. PASTA_MODE in this menu means pasta mode Immunity.',
                                            thumbnail: {
                                                url: msg.author.dynamicAvatarURL(msg.author.avatar ? (msg.author.avatar.startsWith('a_') ? 'gif' : 'png') : 'png', 256)
                                            },
                                            fields: [...settings.flags.map((i, o, s) => {
                                                return {
                                                    name: `${selection === o ? '> ' : ''}${i}`,
                                                    value: `is currently set to \`${settings.getFlags(setngs.flags).includes(i) ? 'ENABLED' : 'DISABLED'}\``
                                                }
                                            })
                                            ]
                                        }
                                    });
                                });
                            break;
                            case '⬆️':
                                if (--selection < 0) selection = settings.flags.length - 1;
                                settings.getValueByID(msg.author.id).then(setngs => {
                                    message.edit({
                                        embed: {
                                            title: 'User Settings',
                                            description: 'Use ⬆️ and ⬇️ to select what to change and use ⏺ to toggle your selection! Use ⏹ to go back to the main menu. PASTA_MODE in this menu means pasta mode Immunity.',
                                            thumbnail: {
                                                url: msg.author.dynamicAvatarURL(msg.author.avatar ? (msg.author.avatar.startsWith('a_') ? 'gif' : 'png') : 'png', 256)
                                            },
                                            fields: [...settings.flags.map((i, o, s) => {
                                                return {
                                                    name: `${selection === o ? '> ' : ''}${i}`,
                                                    value: `is currently set to \`${settings.getFlags(setngs.flags).includes(i) ? 'ENABLED' : 'DISABLED'}\``
                                                }
                                            })
                                            ]
                                        }
                                    });
                                });
                                break;

                            case '⏺':
                                settings.getValueByID(msg.author.id).then(newSettings => {
                                    let newFlags = settings.getFlags(newSettings.flags);
                                    if (settings.getFlags(newSettings.flags).includes(settings.flags[selection])) {
                                        delete newFlags[newFlags.indexOf(settings.flags[selection])];
                                    } else {
                                        newFlags.push(settings.flags[selection]);
                                    }
                                    newSettings.flags = settings.toFlags(newFlags);
                                    settings.updateValue({id: newSettings.id, flags: newSettings.flags, RNG: newSettings.RNG});
                                    settings.getValueByID(msg.author.id).then(setngs => {
                                        message.edit({
                                            embed: {
                                                title: 'User Settings',
                                                description: 'Use ⬆️ and ⬇️ to select what to change and use ⏺ to toggle your selection! Use ⏹ to go back to the main menu. PASTA_MODE in this menu means pasta mode Immunity.',
                                                thumbnail: {
                                                    url: msg.author.dynamicAvatarURL(msg.author.avatar ? (msg.author.avatar.startsWith('a_') ? 'gif' : 'png') : 'png', 256)
                                                },
                                                fields: [...settings.flags.map((i, o, s) => {
                                                    return {
                                                        name: `${selection === o ? '> ' : ''}${i}`,
                                                        value: `is currently set to \`${settings.getFlags(setngs.flags).includes(i) ? 'ENABLED' : 'DISABLED'}\``
                                                    }
                                                })
                                                ]
                                            }
                                        });
                                    });
                                });
                        }
                }
            }
            addReactions(message, ['🌆', '👤', '⏹']);
            client.on('messageReactionAdd', handleReactions);
        });
    },

    options: {
        description: 'manage settings here!'
    }
}