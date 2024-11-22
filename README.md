
# Discord to Mattermost Migrate

## Project Description

This project is designed to migrate messages, users, and channels from a Discord server to the Mattermost platform. It provides full integration between the two platforms, enabling seamless transfer and management of data from Discord to Mattermost. The goal is to synchronize users, messages, and channels across these platforms effectively.

## Project Features:

- **User Mapping:** Discord users are mapped to Mattermost users. If a user cannot be matched, a general user like `support.bot` is assigned automatically.
- **Channel and Category Mapping:** Discord categories and channels are automatically transferred to Mattermost, with users added to Mattermost channels based on their roles in Discord.
- **Message Synchronization:** Messages from Discord channels are transferred to Mattermost, preserving the correct user attribution. Attachments, timestamps, and other content are accurately migrated.
- **Duplicate Message Prevention:** The project avoids re-uploading previously migrated messages, eliminating redundancy and improving efficiency.
- **File Upload and Processing:** Attachments (e.g., images, videos) from Discord messages are downloaded and uploaded to corresponding Mattermost channels.
- **Token Management:** Messages are added on behalf of users using their Mattermost API tokens, ensuring accurate representation of message authorship.

## Technologies Used:

- **Python:** Primary programming language used for REST API integration, file handling, and data processing.
- **Discord API:** Used to fetch user, message, channel, and file data from Discord.
- **Mattermost API:** Used to upload users, channels, and messages to Mattermost.
- **Requests Library:** For handling HTTP requests and API calls.
- **dotenv Library:** To manage tokens and sensitive information from `.env` configuration files.
- **PIL (Python Imaging Library):** To resize and optimize large image files from Discord.
- **Discord and asyncio Libraries:** For asynchronous fetching of all messages from Discord API.

## Problems Addressed by the Project:

- **Cross-Platform Management:** Many teams struggle with data synchronization across different platforms. This project provides seamless data transfer from Discord to Mattermost, solving this challenge.
- **Duplicate Message Prevention:** Avoids re-uploading messages, preventing performance loss and data redundancy.
- **Automatic User and Channel Addition:** Users and channels are transferred automatically, eliminating manual effort.

# Setup and Execution:

1. Clone the project from GitHub.
2. Install dependencies with the following command:

```sh
pip install -r requirements.txt
```

3. Create a `.env` file and add your Discord and Mattermost tokens, as well as server IDs:

```env
DISCORD_TOKEN=<discord_token>
GUILD_ID=<guild_id>  # Discord Server ID
MATTERMOST_URL=<mattermost_url>
MATTERMOST_TOKEN=<mattermost_token>
```

4. Run the project:

```sh
python main.py
```

## Important Notes

### JavaScript Utility Files in the Project

1. **`getMattermostUsers.js`**  
   Fetches usernames and IDs of Mattermost users.

2. **`getDiscordUsers.js`**  
   Fetches usernames and IDs of Discord users.

#### Outputs from `getMattermostUsers` and `getDiscordUsers`

Run these files, copy the console outputs, and format them as shown below. Paste the formatted output into the relevant section of `main.py`.

```python
user_mapping = [
    {"discord_user_name": "<discord_user_name>", "discord_user_id": "<discord_user_id>", "mattermost_user_name": "<mattermost_user_name>", "mattermost_user_id": "<mattermost_user_id>"},
    
    # Example:
    {"discord_user_name": "muhittin.topalak34", "discord_user_id": "123456789", "mattermost_user_name": "muhittin.topalak", "mattermost_user_id": "987654321"},
    ...
]
```

3. **`clearMattermost.js`**  
   This script archives all created teams and channels in Mattermost. Mattermost does not allow deletion of teams and channels, leading to potential data clutter. Run this script to archive all existing teams and channels. Follow it by connecting to your Mattermost database and executing the commands below to delete archived teams and channels.

### Cleaning Up Mattermost:

```sh
## Navigate to the Mattermost installation directory
cd /opt/docker

## Find the PostgreSQL container ID
docker ps -a

## Enter the container
docker exec -it <postgresql-container-id> psql -U <postgresql-user> -d <postgresql-db-name>

## Delete messages and channels linked to archived teams
DELETE FROM Posts WHERE ChannelId IN (SELECT Id FROM Channels WHERE TeamId IN (SELECT Id FROM Teams WHERE DeleteAt != 0));
DELETE FROM Channels WHERE TeamId IN (SELECT Id FROM Teams WHERE DeleteAt != 0);
DELETE FROM Teams WHERE DeleteAt != 0;

## Delete archived channels in non-archived teams
DELETE FROM Posts WHERE ChannelId IN (SELECT Id FROM Channels WHERE DeleteAt != 0 AND TeamId IN (SELECT Id FROM Teams WHERE DeleteAt = 0));
DELETE FROM Channels WHERE DeleteAt != 0 AND TeamId IN (SELECT Id FROM Teams WHERE DeleteAt = 0);

exit

## Restart Docker containers
docker compose -f docker-compose.yml -f docker-compose.without-nginx.yml down
docker compose -f docker-compose.yml -f docker-compose.without-nginx.yml up -d

## Bonus

## Total number of messages in unarchived teams:

SELECT COUNT(*) AS TotalMessages FROM Posts WHERE ChannelId IN (SELECT Id FROM Channels WHERE DeleteAt = 0 AND TeamId IN (SELECT Id FROM Teams WHERE DeleteAt = 0));

## Total number of messages in Mattermost

SELECT COUNT(*) AS TotalMessages FROM Posts;

```

---

## Running the Project

### Discord API

#### Access the Discord Developer Portal
First, you need to access the Discord Developer Portal:

1. Navigate to the [Discord Developer Portal](https://discord.com/developers/applications).

#### Create a New Application
1. Log in to the Discord Developer Portal.
2. Click the “New Application” button, located at the top-right corner of the page.
3. Name your application and click “Create” (this will also serve as the bot's name, which can be changed later).

You now have a new Discord application and can proceed to add the bot.

#### Create a Bot
1. In the left menu, select the “Bot” tab.
2. Click “Add Bot” and confirm.
    - This will add a bot to your application, allowing it to interact in Discord servers.

#### Retrieve the Bot Token
Once the bot is created, its token will be accessible. This token enables the bot to interact with the Discord API. **Keep this token secure and do not share it with anyone.**

1. Click “Click to Reveal Token” to copy your bot token.
2. This token allows the bot to access Discord servers, send messages, and perform other actions.
3. If your token is accidentally exposed, immediately regenerate it by clicking the “Regenerate” button in the Developer Portal.

#### OAuth2 and Adding the Bot to a Server
To add the bot to your server, use OAuth2 authorization:

1. Navigate to the OAuth2 section in the left menu.
2. Click on the “OAuth2 URL Generator.”
3. Under Scopes, check the “bot” option.
4. Under Bot Permissions, select the permissions your bot needs, such as:
    - “Send Messages”
    - “Manage Channels”
    - “Manage Messages”

   If your bot only needs to send and receive messages, select the minimum required permissions.

5. At the bottom, a URL will be generated. Copy this URL and open it in your browser.
6. Select the server where you want to add the bot and authorize it.

The bot will now be added to your server.

---

### Mattermost Token

To enable Mattermost integration, you need to generate personal access tokens.

1. Navigate to:
   - **System Console** > **Integrations** > **Integration Management** > Enable **Personal Access Tokens**.
2. Go to:
   - **Profile** > **Security** > **Personal Access Tokens** > Click “Create.”

Provide the following details:
- Token description: `test`
- Token ID: `mffdfds5d3mc6ypeioo7o`
- Access token: `dsfdsfzurpfdsfds9ni7igoaorra4h`

You will use this **Access Token** value in your project.

---

### Recommendations for a Smooth Migration

During the migration, several issues were encountered when synchronizing messages from Discord to Mattermost. To resolve these issues, follow these steps:

1. Temporarily assign the **System Administrator** role to all Mattermost users during the migration process.
2. Disable email verification by navigating to:
   - **System Console** > **Authentication** > **Email Settings** > Uncheck “Require Email Verification.”

This ensures a smoother migration without user or message conflicts.

---

## Discord Message Attribution in Mattermost

To ensure messages from Discord are correctly attributed in Mattermost, generate tokens for all users in Mattermost. Add these tokens to the following section in `main.py`:

```python
def get_user_token_by_mattermost_id(mattermost_user_id):
    user_tokens = {
        'admin': 'token',
        'murat.genc': 'token',
        ...
    }
    return user_tokens.get(mattermost_user_id, None)
```

---

## Adding Default Users to All Teams and Channels

To ensure all teams and channels are accessible, add specific users to all teams and channels:

```python
def add_admin_to_team_and_channel(team_id, channel_id):
    user_ids = [
        "mattermost_user_id",  # Admin user ID
        "mattermost_user_id"  # Example: 'murat.genc' user ID
    ]
```

## Result:

This project enables seamless data migration between Discord and Mattermost. It provides a robust solution for teams needing unified collaboration environments.

---

## Need Help?

If you encounter any issues, feel free to reach out via LinkedIn:  
[https://www.linkedin.com/in/murat-gen%C3%A7-775745b5/](https://www.linkedin.com/in/murat-gen%C3%A7-775745b5/)
