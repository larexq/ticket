module.exports = {
    name: 'ping',

    execute(client, message) {
        message.channel.send(`Ping: **${client.ws.ping}ms**`);
    },
};