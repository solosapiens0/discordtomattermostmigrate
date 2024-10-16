import os

import aiohttp
from dotenv import load_dotenv, find_dotenv
import requests
from PIL import Image
from io import BytesIO
import datetime
import time
import re
import discord
import asyncio




# .env dosyasını manuel olarak bul ve yükle
load_dotenv(find_dotenv())

# Değişkenleri kontrol et
discord_token = os.getenv('DISCORD_TOKEN')
guild_id = os.getenv('GUILD_ID')
mattermost_url = os.getenv('MATTERMOST_URL')
mattermost_token = os.getenv('MATTERMOST_TOKEN')

intents = discord.Intents.default()
intents.messages = True

client = discord.Client(intents=intents)
loop = asyncio.get_event_loop()

# Kullanıcı Eşleme
user_mapping = [
    {"discord_user_name": "<discord_user_name>", "discord_user_id": "<discord_user_id>", "mattermost_user_name": "<mattermost_user_name>", "mattermost_user_id": "<mattermost_user_id>" },

    # Örnek kullanım:

    {"discord_user_name": "muhittin.topalak34, "discord_user_id": "123456789", "mattermost_user_name": "muhittin.topalak", "mattermost_user_id": "987654321" },

]


####################################################################################################################

def update_env_token(new_token):
    env_path = find_dotenv()
    if env_path:
        with open(env_path, 'r') as file:
            lines = file.readlines()

        # MATTERMOST_TOKEN satırını bul ve güncelle
        with open(env_path, 'w') as file:
            for line in lines:
                if line.startswith('MATTERMOST_TOKEN='):
                    file.write(f'MATTERMOST_TOKEN={new_token}\n')
                else:
                    file.write(line)

        # Değişiklikten sonra .env'yi yeniden yükle
        load_dotenv(env_path)

####################################################################################################################

def get_user_token_by_mattermost_id(mattermost_user_id):
    # Kullanıcı ID'lerine göre tokenların saklandığı bir dictionary
    user_tokens = {
        'admin': 'token',
        'murat.genc': 'token',

    }
    # Kullanıcı tokenını sözlükten çekiyoruz
    return user_tokens.get(mattermost_user_id, None)


####################################################################################################################

async def match_user(discord_user_id):
    # Eşleşen kullanıcıyı bulmaya çalış
    try:
        matched_user = next((user for user in user_mapping if user.get('discord_user_id') == discord_user_id), None)

        if matched_user:
            print(
                f"Eşleşen kullanıcı bulundu: Discord ID: {discord_user_id}, Mattermost ID: {matched_user['mattermost_user_id']}, Mattermost Username: {matched_user['mattermost_user_name']}")
            return matched_user['mattermost_user_id']
        else:
            print(f"Kullanıcı eşleşmedi: Discord ID: {discord_user_id}")
            support_bot_user = next((user for user in user_mapping if user.get('discord_user_name') == 'Support Bot'),
                                    None)
            if support_bot_user:
                return support_bot_user['mattermost_user_id']
            else:
                print(f"Support bot bulunamadı, discord_user_id: {discord_user_id}")
                return None
    except KeyError as e:
        print(f"KeyError: {e}. Hatalı kullanıcı verisi: {discord_user_id}")
        return None


####################################################################################################################

# Discord rollerini çek
def get_discord_roles():
    url = f'https://discord.com/api/v10/guilds/{guild_id}/roles'
    headers = {
        'Authorization': f'Bot {discord_token}'
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        roles = response.json()
        print(f"Discord'dan {len(roles)} rol başarıyla çekildi.")
        return roles
    except requests.exceptions.RequestException as e:
        print(f"Discord rolleri alınırken hata: {e}")
        return []

####################################################################################################################
# Verilen bir role sahip tüm kullanıcıları bulma
def get_members_by_role(role_id, all_members):
    role_members = [member for member in all_members if role_id in member['roles']]
    return role_members


# Mattermost kullanıcılarını çekmek için fonksiyon
def get_mattermost_users():
    url = f'{mattermost_url}/api/v4/users'
    headers = {
        'Authorization': f'Bearer {mattermost_token}'
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        users = response.json()
        print(f"Mattermost'tan {len(users)} kullanıcı başarıyla çekildi.")
        return users
    except requests.exceptions.RequestException as e:
        print(f"Mattermost kullanıcıları alınırken hata: {e}")
        return []


####################################################################################################################

def get_discord_channels_with_categories():
    url = f"https://discord.com/api/v10/guilds/{guild_id}/channels"
    headers = {
        'Authorization': f'Bot {discord_token}'
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        all_channels = response.json()

        # Kategorileri ve kanalları gruplandırmak
        categories = [channel for channel in all_channels if channel['type'] == 4]
        channels = [channel for channel in all_channels if channel['type'] != 4]

        categorized_channels = [
            {
                'category_name': category['name'],
                'category_id': category['id'],
                'channels': [channel for channel in channels if channel['parent_id'] == category['id']]
            } for category in categories
        ]

        uncategorized_channels = {
            'category_name': 'Uncategorized',
            'category_id': None,
            'channels': [channel for channel in channels if channel['parent_id'] is None]
        }

        categorized_channels.append(uncategorized_channels)
        return categorized_channels

    except requests.exceptions.RequestException as e:
        print(f"Discord kanalları alınırken hata: {e}")
        return []


###################################################################################################################

def get_discord_guild_members():
    url = f'https://discord.com/api/v10/guilds/{guild_id}/members?limit=1000'
    headers = {
        'Authorization': f'Bot {discord_token}'
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        members = response.json()
        return members
    except requests.exceptions.RequestException as e:
        print(f"Discord üyeleri alınırken hata: {e}")
        return []


###################################################################################################################

def get_discord_channel_members(channel_id):
    url = f"https://discord.com/api/v10/channels/{channel_id}/members"
    headers = {
        'Authorization': f'Bot {discord_token}'
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()  # Üyeleri döndür
    except requests.exceptions.RequestException as e:
        print(f"Discord kanal üyeleri alınırken hata (channelId: {channel_id}): {e}")
        return []


###################################################################################################################

def get_discord_members_in_category(category):
    members_in_category = []

    # Her bir kanalın üyelerini alıyoruz
    for channel in category['channels']:
        discord_members = get_discord_channel_members(channel['id'])
        members_in_category.extend(discord_members)  # Üyeleri topluyoruz

    # Aynı kullanıcı birden fazla kanalda olabilir, benzersiz kullanıcılar için filtreleme yapıyoruz
    unique_members = {member['user']['id']: member for member in members_in_category}.values()

    return list(unique_members)


###################################################################################################################

def format_name(name):
    # Tüm karakterleri küçük harfe çevir
    formatted_name = name.lower()

    # Boşlukları '-' ile değiştir
    formatted_name = re.sub(r'\s+', '-', formatted_name)

    # Alfanumerik olmayan karakterleri ve '-' işaretlerini temizle
    formatted_name = re.sub(r'[^a-z0-9-]', '', formatted_name)

    # '-' işaretlerinin başta veya sonda olmasını engelle
    formatted_name = formatted_name.strip('-')

    return formatted_name


###################################################################################################################


def create_mattermost_team_if_not_exists(team_name):
    formatted_team_name = format_name(team_name)  # format_name fonksiyonu ile isim formatlama
    url = f"{mattermost_url}/api/v4/teams/name/{formatted_team_name}"
    headers = {
        'Authorization': f'Bearer {mattermost_token}'
    }

    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            print(f"Takım zaten var: {formatted_team_name}")
            return response.json()['id']
        else:
            create_url = f"{mattermost_url}/api/v4/teams"
            team_data = {
                'name': formatted_team_name,
                'display_name': team_name,
                'type': 'O'  # Public team
            }
            create_response = requests.post(create_url, json=team_data, headers=headers)
            create_response.raise_for_status()
            print(f"Takım başarıyla oluşturuldu: {create_response.json()['name']}")
            return create_response.json()['id']
    except requests.exceptions.RequestException as e:
        print(f"Takım oluşturulurken hata: {e}")
        raise


###################################################################################################################

def create_mattermost_channel_if_not_exists(team_id, channel_name):
    formatted_channel_name = format_name(channel_name)
    url = f"{mattermost_url}/api/v4/teams/{team_id}/channels/name/{formatted_channel_name}"
    headers = {'Authorization': f'Bearer {mattermost_token}'}

    # Kanal zaten mevcut mu? Kontrol et
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            print(f"Kanal zaten mevcut: {formatted_channel_name}")
            return response.json()['id']  # Mevcut kanalın ID'sini döndür
    except requests.RequestException as e:
        print(f"Kanal kontrol edilirken hata oluştu: {e}")

    # Eğer kanal yoksa oluştur
    create_url = f"{mattermost_url}/api/v4/channels"
    channel_data = {
        'team_id': team_id,
        'name': formatted_channel_name,  # Benzersiz ve küçük harflerle yazılmış olmalı
        'display_name': channel_name,  # Kullanıcıya gösterilecek ad
        'type': 'O'  # O: public, P: private
    }

    try:
        create_response = requests.post(create_url, json=channel_data, headers=headers)
        create_response.raise_for_status()  # Hataları tetikler
        print(f"Kanal başarıyla oluşturuldu: {create_response.json()['name']}")
        return create_response.json()['id']
    except requests.RequestException as e:
        print(f"Kanal oluşturulurken hata: {e}")
        print(f"Hata mesajı: {create_response.text}")
        return None


###################################################################################################################

def add_user_to_mattermost_team(team_id, discord_user_id):
    matched_user = next((user for user in user_mapping if user['discord_user_id'] == discord_user_id), None)
    if not matched_user:
        return

    url = f"{mattermost_url}/api/v4/teams/{team_id}/members"
    headers = {
        'Authorization': f'Bearer {mattermost_token}',
        'Content-Type': 'application/json'
    }

    data = {
        'team_id': team_id,
        'user_id': matched_user['mattermost_user_id']
    }

    try:
        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 400:
            print(f"Kullanıcı zaten takımda: {matched_user['mattermost_user_name']}")
        else:
            print(f"Kullanıcı başarıyla takıma eklendi: {matched_user['mattermost_user_name']}")
    except requests.exceptions.RequestException as e:
        print(f"Kullanıcı takıma eklenirken hata: {e}")


###################################################################################################################

def add_user_to_mattermost_channel(channel_id, discord_user_id):
    matched_user = next((user for user in user_mapping if user['discord_user_id'] == discord_user_id), None)
    if not matched_user:
        print(f"Kullanıcı bulunamadı: {discord_user_id}")
        return None  # Kullanıcı bulunamazsa None döndürüyoruz

    user_id = matched_user['mattermost_user_id']  # Kullanıcı ID'si buradan alınıyor

    # API çağrısı buraya geliyor
    url = f"{mattermost_url}/api/v4/channels/{channel_id}/members"
    headers = {
        'Authorization': f'Bearer {mattermost_token}',
        'Content-Type': 'application/json'
    }
    data = {'user_id': user_id}

    try:
        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 400:
            print(f"Kullanıcı zaten kanalda: {matched_user['mattermost_user_name']}")
        else:
            print(f"Kullanıcı başarıyla kanala eklendi: {matched_user['mattermost_user_name']}")
        return user_id  # Kullanıcı ID'sini döndürüyoruz
    except requests.exceptions.RequestException as e:
        print(f"Kullanıcı kanala eklenirken hata: {e}")
        return None  # Hata durumunda None döndürülüyor


###################################################################################################################


def set_user_permissions(user_id, channel_id):
    """
    Mattermost kanalında kullanıcıya gerekli izinleri atamak için kullanılır.
    :param user_id: Kullanıcının Mattermost ID'si
    :param channel_id: Kanalın Mattermost ID'si
    """
    # API URL'sini oluşturuyoruz
    url = f"{mattermost_url}/api/v4/channels/{channel_id}/members/{user_id}/roles"

    # Gerekli başlıklar (headers)
    headers = {
        'Authorization': f'Bearer {mattermost_token}',
        'Content-Type': 'application/json'
    }

    # Kullanıcıya atanacak rolleri belirliyoruz
    data = {
        'roles': 'system_user channel_user channel_post'  # Gerekli roller burada veriliyor
    }

    try:
        # API'ye PUT isteği gönderiyoruz
        response = requests.put(url, json=data, headers=headers)

        # Eğer yanıt başarılıysa
        if response.status_code == 200:
            print(f"Kullanıcı izinleri başarıyla güncellendi: {user_id}")
        else:
            print(f"Kullanıcı izinleri güncellenirken hata: {response.status_code} - {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"Kullanıcı izinleri güncellenirken hata: {e}")


###################################################################################################################

async def get_discord_messages(channel_id, limit=100, before=None):
    """
    Asenkron olarak Discord kanalından mesajları çeker.
    """
    url = f"https://discord.com/api/v10/channels/{channel_id}/messages?limit={limit}"
    if before:
        url += f"&before={before}"

    headers = {
        'Authorization': f'Bot {discord_token}'
    }

    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(url, headers=headers) as response:
                if response.status == 429:
                    retry_after = int(response.headers.get("Retry-After", 5))
                    print(f"Rate limit, {retry_after} saniye bekleniyor...")
                    await asyncio.sleep(retry_after + 1)
                    return await get_discord_messages(channel_id, limit, before)

                if response.status != 200:
                    print(f"Discord mesajları alınırken hata: {response.status}")
                    return []

                return await response.json()

        except Exception as e:
            print(f"Discord mesajları alınırken hata (channelId: {channel_id}): {e}")
            return []


async def get_all_discord_messages(channel_id):
    all_messages = []
    last_message_id = None
    limit = 100

    while True:
        messages = await get_discord_messages(channel_id, limit=limit, before=last_message_id)

        if not messages:
            break  # Eğer mesaj yoksa döngüden çık

        all_messages.extend(messages)
        last_message_id = messages[-1]['id']  # Son çekilen mesajın ID'sini güncelle

        if len(messages) < limit:
            break

        await asyncio.sleep(1)  # Her istekten sonra bir süre bekleyerek rate limit'i azaltıyoruz

    return all_messages


###################################################################################################################

def get_discord_channel_members(channel_id):
    url = f"https://discord.com/api/v10/guilds/{guild_id}/members?limit=1000"
    headers = {
        'Authorization': f'Bot {discord_token}'
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()  # Kanal üyelerini döndür
    except requests.exceptions.RequestException as error:
        # Eğer rate limit sorunu varsa
        if response.status_code == 429:  # Rate limited
            retry_after = response.json().get('retry_after', 5)  # Yeniden deneme süresi
            print(f"Rate limited, {retry_after} saniye bekleniyor...")
            time.sleep(retry_after)  # Belirtilen süre kadar bekle
            return get_discord_channel_members(channel_id)  # İsteği tekrar dene
        else:
            # Diğer hatalar için
            print(f"Discord kanal üyeleri alınırken hata (channelId: {channel_id}): {error}")
            return []  # Hata olursa boş liste döndür


###################################################################################################################

def resize_image_if_needed(file_path, output_file_path):
    try:
        with Image.open(file_path) as img:
            if img.format.lower() not in ['jpeg', 'png', 'webp', 'tiff', 'gif']:
                print(f"Desteklenmeyen görsel formatı: {img.format}")
                return file_path  # Desteklenmeyen formatlarda boyutlandırma yapma

            # Sadece 5000 piksellik genişlik veya yükseklikten büyükse yeniden boyutlandır
            if img.width > 5000 or img.height > 5000:
                img.thumbnail((5000, 5000), Image.ANTIALIAS)
                img.save(output_file_path)
                print(f"Görsel yeniden boyutlandırıldı: {output_file_path}")
                return output_file_path
            else:
                print('Görsel boyutlandırmaya gerek yok.')
                return file_path
    except Exception as e:
        print(f"Görsel boyutlandırılırken hata: {str(e)}")
        return file_path  # Hata olsa bile orijinal dosyayı döndür


###################################################################################################################


def download_discord_attachment(url, filename):
    directory = 'downloads/'

    # Eğer dosya adı çok uzunsa, sadece ilk 50 karakterini kullan
    if len(filename) > 50:
        filename = filename[:50] + filename[-10:]  # İlk 50 ve son 10 karakterini al

    file_path = os.path.join(directory, filename)

    try:
        if not os.path.exists(directory):
            os.makedirs(directory)

        response = requests.get(url, stream=True)
        response.raise_for_status()

        with open(file_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        print(f"Dosya başarıyla indirildi: {file_path}")
        return file_path
    except Exception as e:
        print(f"Dosya indirilirken hata: {str(e)}")
        return None


###################################################################################################################


async def upload_file_to_mattermost_channel(channel_id, file_path, user_token):
    url = f"{mattermost_url}/api/v4/files"
    headers = {
        'Authorization': f'Bearer {user_token}',
    }

    try:
        file_size = os.path.getsize(file_path)
        if file_size > 50 * 1024 * 1024:  # 50 MB limiti kontrol ediliyor
            print(f"Dosya boyutu {file_size / (1024 * 1024):.2f} MB ve yükleme limiti aşıldı.")
            return None

        with open(file_path, 'rb') as file_data:
            form_data = {
                'channel_id': (None, channel_id),  # Channel ID'yi multipart form-data olarak göndermeliyiz
                'files': file_data  # Dosya verisini burada gönderiyoruz
            }
            response = requests.post(url, files=form_data, headers=headers)
            response.raise_for_status()  # Hataları tetikler

            print(f"Yükleme başarılı: {response.json()}")
            return response.json()['file_infos'][0]['id']
    except requests.exceptions.RequestException as e:
        print(f"Dosya yüklenirken hata: {e}")
        print(f"Hata yanıtı: {e.response.text}")  # Hata durumunda API yanıtını daha ayrıntılı loglayın
        return None
    except OSError as e:
        print(f"Dosya boyutu alınırken hata: {e}")
        return None


async def handle_discord_attachment(url, filename, channel_id):
    try:
        # Dosyayı indir
        downloaded_file_path = download_discord_attachment(url, filename)

        if not downloaded_file_path:
            return None

        # Yeniden boyutlandırmayı kontrol et ve gerekirse uygula
        resized_file_path = resize_image_if_needed(downloaded_file_path,
                                                   os.path.join('downloads', f"resized_{filename}"))

        # Dosyayı Mattermost kanalına yükle
        file_id = await upload_file_to_mattermost_channel(channel_id, resized_file_path)  # Burada await ekleniyor
        return file_id
    except Exception as e:
        print(f"Dosya işlenirken hata: {str(e)}")
        return None


#################################################################################################################

# Admin add all teams and channels
def add_admin_to_team_and_channel(team_id, channel_id):
    # Admin kullanıcısının Mattermost ID'si (Discord ile eşleşmeden doğrudan Mattermost'tan)

    user_ids = [
        "mattermost_user_id",  # Admin kullanıcısının ID'si
        "mattermost_user_id"  # 'murat.genc' kullanıcısının ID'si

    ]
    for user_id in user_ids:
        if not user_id:
            print(f"Kullanıcı bulunamadı: {user_id}")
            continue

        # Admin kullanıcısını takıma ekle
        add_user_directly_to_mattermost_team(team_id, user_id)

        if channel_id:
            # Admin kullanıcısını kanala ekle
            add_user_directly_to_mattermost_channel(channel_id, user_id)

        print(f"Admin  kullanıcısı başarıyla takıma ve kanala eklendi: {user_id}")


def add_user_directly_to_mattermost_team(team_id, user_id):
    """
    Admin gibi Mattermost ID'si direkt bilinen kullanıcıları takıma eklemek için kullanılır.
    """
    url = f"{mattermost_url}/api/v4/teams/{team_id}/members"
    headers = {
        'Authorization': f'Bearer {mattermost_token}',
        'Content-Type': 'application/json'
    }

    data = {
        'team_id': team_id,
        'user_id': user_id
    }

    try:
        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 201:
            print(f"Kullanıcı başarıyla takıma eklendi: {user_id}")
        elif response.status_code == 400:
            print(f"Kullanıcı zaten takımda: {user_id}")
        else:
            print(f"Kullanıcı takıma eklenemedi, hata kodu: {response.status_code}, Detay: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"Kullanıcı takıma eklenirken hata: {e}")


def add_user_directly_to_mattermost_channel(channel_id, user_id):
    """
    Admin gibi Mattermost ID'si direkt bilinen kullanıcıları kanala eklemek için kullanılır.
    """
    url = f"{mattermost_url}/api/v4/channels/{channel_id}/members"
    headers = {
        'Authorization': f'Bearer {mattermost_token}',
        'Content-Type': 'application/json'
    }
    data = {'user_id': user_id}

    try:
        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 201:
            print(f"Kullanıcı başarıyla kanala eklendi: {user_id}")
        elif response.status_code == 400:
            print(f"Kullanıcı zaten kanalda: {user_id}")
        else:
            print(f"Kullanıcı kanala eklenemedi, hata kodu: {response.status_code}, Detay: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"Kullanıcı kanala eklenirken hata: {e}")


#################################################################################################################

async def sync_discord_to_mattermost():
    # Discord'dan kategoriler, kanallar, roller ve üyeleri çekiyoruz
    categorized_channels = get_discord_channels_with_categories()  # await kaldırıldı çünkü bu async değil
    discord_members = get_discord_guild_members()  # await kaldırıldı
    discord_roles = get_discord_roles()  # await kaldırıldı

    # Her kategori için işlemler yapılacak
    for category in categorized_channels:
        # 1. Kategoriye karşılık gelen takım oluşturuluyor
        team_id = create_mattermost_team_if_not_exists(category['category_name'])  # await kaldırıldı

        # Support bot'u sadece takıma ekle (kanalsız)
        add_admin_to_team_and_channel(team_id, None)  # await kaldırıldı

        # 2. Kanalları oluşturduktan sonra takım üyelerini ekliyoruz
        all_channel_members = set()  # Her kategorideki benzersiz üyeler
        for channel in category['channels']:
            channel_roles = channel.get('permission_overwrites', [])
            channel_members = []

            # Kanal rollerine göre üyeleri buluyoruz
            for role in channel_roles:
                if role['type'] == 0:  # 0: rol anlamına gelir
                    role_id = role['id']
                    members_in_role = get_members_by_role(role_id, discord_members)
                    channel_members.extend(members_in_role)

            # Kanal üyelerini topluyoruz
            all_channel_members.update(member['user']['id'] for member in channel_members)

        # 3. Toplanan üyeler takıma ekleniyor
        for member_id in all_channel_members:
            add_user_to_mattermost_team(team_id, member_id)  # await kaldırıldı

        # 4. Kanalları oluşturuyor ve üye ekliyoruz
        for channel in category['channels']:
            mattermost_channel_id = create_mattermost_channel_if_not_exists(team_id,
                                                                            channel['name'])  # await kaldırıldı

            # Support bot kanallara ekle
            add_admin_to_team_and_channel(team_id, mattermost_channel_id)  # await kaldırıldı

            channel_roles = channel.get('permission_overwrites', [])
            channel_members = []

            # Rol bazında kullanıcıları bul
            for role in channel_roles:
                if role['type'] == 0:  # 0: rol demektir
                    role_id = role['id']
                    members_in_role = get_members_by_role(role_id, discord_members)
                    channel_members.extend(members_in_role)

            # Kullanıcıları kanala ekle
            for member in channel_members:
                add_user_to_mattermost_channel(mattermost_channel_id, member['user']['id'])  # await kaldırıldı

            # 5. Mesajları çek ve ekle
            discord_messages = await get_all_discord_messages(channel['id'])  # await
            if discord_messages:
                await sync_messages_with_users(mattermost_channel_id, discord_messages)  # await kaldırıldı

        print(f"Kategori '{category['category_name']}' başarıyla tamamlandı.")

    print("Tüm kategoriler başarıyla aktarıldı.")


#################################################################################################################

async def sync_messages_with_users(mattermost_channel_id, discord_messages):
    reversed_messages = list(reversed(discord_messages))  # Mesajları ters sırayla işlemek

    for message in reversed_messages:
        discord_user_id = message['author']['id']  # Discord'daki mesaj sahibinin ID'sini al
        discord_username = message.get('author', {}).get('username', 'Bilinmeyen Kullanıcı')  # Discord kullanıcı adı
        mattermost_user_id = await match_user(discord_user_id)  # Discord kullanıcısını Mattermost ile eşle

        mattermost_username = None
        if mattermost_user_id:
            mattermost_username = next((user['mattermost_user_name'] for user in user_mapping if
                                        user.get('mattermost_user_id') == mattermost_user_id), 'Bilinmiyor')

        # Her kullanıcı için token'ı çekiyoruz
        user_token = get_user_token_by_mattermost_id(mattermost_username)

        if not mattermost_user_id:
            print(f"Kullanıcı bulunamadı, support.bot kullanıcısına atanıyor: {discord_username}")
            mattermost_user_id = await match_user(
                '816422484449951754')  # support.bot kullanıcı ID'si ile eşleşme yapılır
            mattermost_username = 'support.bot'
            user_token = get_user_token_by_mattermost_id(mattermost_user_id)

        file_ids = []
        # Mesaja bağlı dosyalar varsa onları Mattermost'a yükleyelim
        if 'attachments' in message and message['attachments']:
            for attachment in message['attachments']:
                file_path = download_discord_attachment(attachment['url'], attachment['filename'])
                if not file_path:
                    print(f"Dosya indirme başarısız: {attachment['filename']}")
                    continue  # Bir sonraki işleme geç, çünkü dosya indirilemedi
                file_id = await upload_file_to_mattermost_channel(mattermost_channel_id, file_path, user_token)
                if file_id:
                    file_ids.append(file_id)

        # Mesajı Mattermost'a ekle
        await add_message_to_mattermost_channel(
            mattermost_channel_id,
            mattermost_user_id,
            message['content'],
            message['timestamp'],
            file_ids,
            discord_username=discord_username,
            mattermost_username=mattermost_username,
            user_token=user_token  # Her mesaj için doğru kullanıcı token'ını kullan
        )


#################################################################################################################

def ensure_user_in_channel(channel_id, user_id):
    url = f"{mattermost_url}/api/v4/channels/{channel_id}/members/{user_id}"
    headers = {
        'Authorization': f'Bearer {mattermost_token}',
        'Content-Type': 'application/json'
    }

    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 404:
            print(f"Kullanıcı kanalda değil, kanala ekleniyor: User ID: {user_id}")
            add_user_to_mattermost_channel(channel_id, user_id)
        elif response.status_code == 200:
            print(f"Kullanıcı zaten kanalda: User ID: {user_id}")
        else:
            print(f"Kullanıcı kanalda değil ve eklenemedi: {response.status_code}")
    except requests.RequestException as e:
        print(f"Kullanıcı kanal üyeliği kontrol edilirken hata: {e}")


#################################################################################################################


async def add_message_to_mattermost_channel(channel_id, user_id, message, timestamp, file_ids=[], discord_username=None,
                                            mattermost_username=None, user_token=None):
    if not user_id:
        print(f"Kullanıcı bulunamadı, mesaj atanacak kullanıcı yok: {message}")
        return

    url = f"{mattermost_url}/api/v4/posts"
    headers = {
        'Authorization': f'Bearer {user_token}' if user_token else f'Bearer {mattermost_token}',
        'Content-Type': 'application/json'
    }

    try:
        # ISO 8601 formatındaki timestamp'i Python datetime objesine çeviriyoruz
        create_at_timestamp = int(datetime.datetime.fromisoformat(timestamp).timestamp() * 1000)

        post_data = {
            'channel_id': channel_id,
            'message': message,
            'create_at': create_at_timestamp,
            'file_ids': file_ids
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=post_data, headers=headers) as response:
                if response.status != 201:
                    print(f"Mesaj Mattermost'a eklenemedi: {response.status}")
                    return

                print(f"Mesaj başarıyla eklendi: {message}, Mattermost Mesaj Sahibi: {mattermost_username}")

    except Exception as e:
        print(f"Mesaj eklenirken hata: {e}")


# Sync işlemini başlat
# sync_discord_to_mattermost()

async def sync_messages(mattermost_channel_id, discord_messages):
    # Mesajları ters sırada eklemek için reverse() kullanıyoruz
    reversed_messages = list(reversed(discord_messages))

    for message in reversed_messages:
        user_id = match_user(message['author']['id'])  # Discord'daki kullanıcıyı Mattermost'taki kullanıcıya eşle
        file_ids = []

        # Mesajdaki dosyaları indir ve Mattermost'a yükle
        if 'attachments' in message and message['attachments']:
            for attachment in message['attachments']:
                file_path = download_discord_attachment(attachment['url'], attachment['filename'])
                if not file_path:
                    print(f"Dosya indirme başarısız: {attachment['filename']}")
                    continue
                    # Doğru user_token ile dosya yüklemeyi asenkron yapıyoruz
                user_token = get_user_token_by_mattermost_id(user_id)
                file_id = await upload_file_to_mattermost_channel(mattermost_channel_id, file_path, user_token)
                if file_id:
                    file_ids.append(file_id)

        # Mesajı Mattermost'a ekle, user_id doğru kullanıcıyla ilişkilendirildi
        await add_message_to_mattermost_channel(mattermost_channel_id, user_id, message['content'],
                                                message['timestamp'], file_ids)


if __name__ == "__main__":
    try:
        loop.run_until_complete(sync_discord_to_mattermost())  # Tüm asenkron işlemleri tamamla
    finally:
        loop.close()
