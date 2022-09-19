module.exports = (client) => console.log(`${client.user.username} Bot Active`);

client.on('ready', () => {
    client.user.setActivity(`You Can Open Support`);
   });