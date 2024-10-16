require('dotenv').config();
const axios = require('axios');

// Mattermost Token bilgileri
const mattermostUrl = process.env.MATTERMOST_URL;
const mattermostToken = process.env.MATTERMOST_TOKEN;

// Mattermost'taki kullanıcıları al
async function getMattermostUsers() {
    const url = `${mattermostUrl}/api/v4/users`;
    const headers = {
        'Authorization': `Bearer ${mattermostToken}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.get(url, { headers });
        return response.data;  // Mattermost'taki kullanıcıları JSON formatında döndürür
    } catch (error) {
        console.error('Mattermost kullanıcıları alınırken hata:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Mattermost kullanıcılarını consola yazdır
async function printMattermostUsers() {
    const mattermostUsers = await getMattermostUsers();

    console.log('Mattermost kullanıcıları:');
    mattermostUsers.forEach(user => {
        console.log(`Kullanıcı adı: ${user.username}, ID: ${user.id}, Email: ${user.email}`);
    });
}

// Kullanıcıları yazdır
printMattermostUsers()
    .then(() => console.log('Mattermost kullanıcıları başarıyla yazdırıldı'))
    .catch(error => console.error('Hata:', error));
