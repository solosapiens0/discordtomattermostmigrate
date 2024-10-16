require('dotenv').config();
const axios = require('axios');

// Discord Token ve Guild ID bilgileri
const discordToken = process.env.DISCORD_TOKEN;
const guildId = process.env.GUILD_ID;

// Discord sunucusundaki kullanıcıları al
async function getDiscordUsers() {
    const url = `https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`;  // 1000 kişiye kadar kullanıcı al
    const headers = {
        'Authorization': `Bot ${discordToken}`
    };

    try {
        const response = await axios.get(url, { headers });
        return response.data;  // Discord'daki kullanıcıları JSON formatında döndürür
    } catch (error) {
        console.error('Discord kullanıcıları alınırken hata:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Discord kullanıcılarını consola yazdır
async function printDiscordUsers() {
    const discordUsers = await getDiscordUsers();

    console.log('Discord kullanıcıları:');
    discordUsers.forEach(user => {
        console.log(`Kullanıcı adı: ${user.user.username}, ID: ${user.user.id}, Email: ${user.user.email || 'Email yok'}`);
    });
}

// Kullanıcıları yazdır
printDiscordUsers()
    .then(() => console.log('Discord kullanıcıları başarıyla yazdırıldı'))
    .catch(error => console.error('Hata:', error));
