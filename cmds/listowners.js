'use strict';

const owners = require('../functions/getOwners');

module.exports = {
    name: 'owners',

    exec: (client, msg, args) => {
        let output = [];
        owners.Owners.findAll().then(users => {
            let ownerNames = users.map(o => client.users.get(o.id))
            output.push(`NAME${' '.repeat(ownerNames.map(e => `${e.username}#${e.discriminator}`.length).sort((a, b) => a - b).reverse()[0] - 4)}|USERID${' '.repeat(ownerNames.map(e => e.id.length).sort((a, b) => a - b).reverse()[0] - 6)}|ADMIN`)
            output.push(`${'-'.repeat(ownerNames.map(e => `${e.username}#${e.discriminator}`.length).sort((a, b) => a - b).reverse()[0])}+${'-'.repeat(ownerNames.map(e => e.id.length).sort((a, b) => a - b).reverse()[0])}+-----`)
            ownerNames.forEach(e => output.push(`${e.username}#${e.discriminator}${' '.repeat(ownerNames.map(e => `${e.username}#${e.discriminator}`.length).sort((a, b) => a - b).reverse()[0] - `${e.username}#${e.discriminator}`.length)}|${e.id}${' '.repeat(ownerNames.map(e => e.id.length).sort((a, b) => a - b).reverse()[0] - e.id.length)}|${users.filter(o => o.id === e.id)[0].admin}${' '.repeat(users.filter(o => o.id === e.id)[0].admin ? 1 : 0)}`));
            msg.channel.createMessage(`\`\`\`${output.join('\n')}\`\`\``);
        })

    },

    options: {
        description: 'Lists the owners of Dad Bot!'
    }
}