const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 8000;

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

client.once('ready', () => {
    console.log('Ready!');
});

client.on('guildMemberAdd', async member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === '대기방');
    if (!channel) return;
    const welcomeMessage = await channel.send(`환영합니다, ${member}! 길드원분은 "포포리" 입력해주시고 용병분은 "용병" 입력해주시면 역할이 설정됩니다.`);

    const filter = response => response.author.id === member.id && (response.content === '포포리' || response.content === '용병');
    const collector = channel.createMessageCollector({ filter, time: 60000 });

    collector.on('collect', async response => {
        if (response.content === '포포리') {
            await response.delete();
            let guildMemberRole = response.guild.roles.cache.find(role => role.name === '길드원');
            if (guildMemberRole && !response.member.roles.cache.has(guildMemberRole.id)) {
                await response.member.roles.add(guildMemberRole);
                const confirmationMessage = await channel.send(`길드원 역할 부여 완료`);
                setTimeout(() => {
                    confirmationMessage.delete();
                    welcomeMessage.delete();
                }, 5000);
            }
        } else if (response.content === '용병') {
            await response.delete();
            let mercenaryRole = response.guild.roles.cache.find(role => role.name === '용병');
            if (mercenaryRole && !response.member.roles.cache.has(mercenaryRole.id)) {
                await response.member.roles.add(mercenaryRole);
                const confirmationMessage = await channel.send(`용병 역할 부여 완료`);
                setTimeout(() => {
                    confirmationMessage.delete();
                    welcomeMessage.delete();
                }, 5000);
            }
        }
    });
});

client.on('messageCreate', async message => {
    if (message.channel.name !== '대기방') return;

    if (message.content === '포포리') {
        await message.delete();
        let guildMemberRole = message.guild.roles.cache.find(role => role.name === '길드원');
        let mercenaryRole = message.guild.roles.cache.find(role => role.name === '용병');
        if (guildMemberRole && mercenaryRole) {
            if (!message.member.roles.cache.has(mercenaryRole.id)) {
                if (!message.member.roles.cache.has(guildMemberRole.id)) {
                    await message.member.roles.add(guildMemberRole);
                    const confirmationMessage = await message.channel.send(`길드원 역할 부여 완료`);
                    setTimeout(() => {
                        confirmationMessage.delete();
                    }, 5000);
                } else {
                    const reply = await message.channel.send(`이미 ${guildMemberRole.name} 역할을 가지고 있습니다.`);
                    setTimeout(() => {
                        reply.delete();
                    }, 5000);
                }
            } else {
                const reply = await message.channel.send(`두 역할을 모두 가질 수 없습니다. 이미 ${mercenaryRole.name} 역할을 가지고 있습니다.`);
                setTimeout(() => {
                    reply.delete();
                }, 5000);
            }
        } else {
            const reply = await message.channel.send(`역할을 찾을 수 없습니다.`);
            setTimeout(() => {
                reply.delete();
            }, 5000);
        }
    }

    if (message.content === '용병') {
        await message.delete();
        let guildMemberRole = message.guild.roles.cache.find(role => role.name === '길드원');
        let mercenaryRole = message.guild.roles.cache.find(role => role.name === '용병');
        if (guildMemberRole && mercenaryRole) {
            if (!message.member.roles.cache.has(guildMemberRole.id)) {
                if (!message.member.roles.cache.has(mercenaryRole.id)) {
                    await message.member.roles.add(mercenaryRole);
                    const confirmationMessage = await message.channel.send(`용병 역할 부여 완료`);
                    setTimeout(() => {
                        confirmationMessage.delete();
                    }, 5000);
                } else {
                    const reply = await message.channel.send(`이미 ${mercenaryRole.name} 역할을 가지고 있습니다.`);
                    setTimeout(() => {
                        reply.delete();
                    }, 5000);
                }
            } else {
                const reply = await message.channel.send(`두 역할을 모두 가질 수 없습니다. 이미 ${guildMemberRole.name} 역할을 가지고 있습니다.`);
                setTimeout(() => {
                    reply.delete();
                }, 5000);
            }
        } else {
            const reply = await message.channel.send(`역할을 찾을 수 없습니다.`);
            setTimeout(() => {
                reply.delete();
            }, 5000);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
