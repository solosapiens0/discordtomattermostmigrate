require('dotenv').config();
const axios = require('axios');

// Mattermost bilgileri
const mattermostUrl = process.env.MATTERMOST_URL;
const mattermostToken = process.env.MATTERMOST_TOKEN;

// Tüm takımları (teams) getir
const fetchTeams = async () => {
    try {
        const response = await axios.get(`${mattermostUrl}/api/v4/teams`, {
            headers: {
                Authorization: `Bearer ${mattermostToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Takımlar alınırken hata:', error);
        throw error;
    }
};

// Bir takımın altındaki kanalları getir
const fetchChannelsForTeam = async (teamId) => {
    try {
        const response = await axios.get(`${mattermostUrl}/api/v4/teams/${teamId}/channels`, {
            headers: {
                Authorization: `Bearer ${mattermostToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Takım ${teamId} kanalları alınırken hata:`, error);
        throw error;
    }
};

// Bir kanalı sil
const deleteChannel = async (channelId, channelName) => {
    if (channelName === 'town-square' || channelName === 'off-topic') {
        console.log(`Kanal ${channelName} sistem kanalı olduğu için silinmedi.`);
        return; // Sistem kanalları atlanır
    }
    try {
        await axios.delete(`${mattermostUrl}/api/v4/channels/${channelId}`, {
            headers: {
                Authorization: `Bearer ${mattermostToken}`
            }
        });
        console.log(`Kanal ${channelName} (${channelId}) silindi.`);
    } catch (error) {
        console.error(`Kanal ${channelId} (${channelName}) silinirken hata:`, error);
        throw error;
    }
};

// Bir takımı ve altındaki kanalları sil
const deleteTeamAndChannels = async (teamId) => {
    try {
        // Takıma ait kanalları getir
        const channels = await fetchChannelsForTeam(teamId);
        for (const channel of channels) {
            await deleteChannel(channel.id, channel.name); // Her kanalı sil
        }
        // Son olarak takımı sil
        await deleteTeam(teamId);
        console.log(`Takım ${teamId} ve tüm kanalları silindi.`);
    } catch (error) {
        console.error(`Takım ${teamId} ve kanalları silinirken hata oluştu:`, error);
    }
};

// Bir takımı sil
const deleteTeam = async (teamId) => {
    try {
        await axios.delete(`${mattermostUrl}/api/v4/teams/${teamId}`, {
            headers: {
                Authorization: `Bearer ${mattermostToken}`
            }
        });
        console.log(`Takım ${teamId} silindi.`);
    } catch (error) {
        console.error(`Takım ${teamId} silinirken hata:`, error);
        throw error;
    }
};

// Genel takım hariç tüm takımları ve kanalları sil
const deleteNonGeneralTeamsAndChannels = async () => {
    try {
        const teams = await fetchTeams();
        for (const team of teams) {
            if (team.display_name.toLowerCase() !== 'genel') {  // Genel takımını koruyoruz
                await deleteTeamAndChannels(team.id); // Takım ve altındaki kanalları sil
            } else {
                console.log(`Takım ${team.display_name} silinmeyecek, bu genel takım.`);
            }
        }
    } catch (error) {
        console.error('Takımlar ve kanallar silinirken hata oluştu:', error);
    }
};

// Silme işlemini başlat
deleteNonGeneralTeamsAndChannels();
