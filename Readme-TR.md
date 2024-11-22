# Discord to Mattermost Migrate

## Proje Tanımı

Bu proje, Discord sunucusundaki mesajları, kullanıcıları ve kanalları Mattermost platformuna aktarmak amacıyla geliştirilmiştir. Proje, iki platform arasında tam bir entegrasyon sağlayarak Discord’daki verileri Mattermost’a taşır ve yönetimini kolaylaştırır. Amaç, iki farklı platformda aynı kullanıcıların, mesajların ve kanalların senkronize edilmesini sağlamaktır.

## Proje Özellikleri:

- Kullanıcı Eşleme: Discord kullanıcıları Mattermost kullanıcılarıyla eşleştirilir. Eğer bir kullanıcı eşleşmezse, otomatik olarak support.bot gibi genel bir kullanıcı atanır.
- Kanal ve Kategori Eşleme: Discord’daki kategoriler ve kanallar Mattermost’a otomatik olarak taşınır ve her bir kanalın kullanıcıları, Discord’daki rollerine göre Mattermost kanallarına eklenir.
- Mesaj Senkronizasyonu: Discord kanallarındaki mesajlar, Mattermost’ta aynı kullanıcıya ait olacak şekilde aktarılır. Mesajlarda dosya ekleri, zaman damgaları ve diğer içerikler doğru şekilde taşınır.
- Yinelenen Mesajların Engellenmesi: Proje, daha önce yüklenmiş mesajları tekrar yüklemez. Böylece yinelenen veri problemleri önlenir.
- Dosya Yükleme ve İşleme: Mesajlara eklenen dosyalar (resim, video vb.) Discord’dan indirilip Mattermost kanallarına yüklenir.
- Token Yönetimi: Her bir kullanıcının Mattermost API token’ı kullanılarak mesajlar kullanıcı adına eklenir, böylece mesajların doğru kişiden geliyormuş gibi gözükmesi sağlanır.

## Kullanılan Teknolojiler:

- **Python:** Projenin ana programlama dili olarak kullanıldı. REST API entegrasyonu, dosya indirme, veri işleme gibi işlemleri gerçekleştiriyor.
- **Discord API:** Discord’dan kullanıcı, mesaj, kanal ve dosya verilerini çekmek için kullanıldı.
- **Mattermost API:** Kullanıcıları, kanalları ve mesajları Mattermost’a yüklemek için kullanıldı.
- **Requests Kütüphanesi:** HTTP isteklerini yönetmek ve API çağrılarını gerçekleştirmek için kullanıldı.
- **dotenv Kütüphanesi:** Proje yapılandırması için .env dosyalarından token’lar ve hassas bilgileri yönetmek amacıyla kullanıldı.
- **PIL (Python Imaging Library):** Discord’dan gelen büyük boyutlu görsellerin boyutlandırılması ve optimize edilmesi için kullanıldı.
- **Discord ve asyncio Kütüphanesi:** Discord api ile tüm mesajları asenkron bir şekilde çekmek için kullanıldı.

## Projenin Çözüm Getirdiği Sorunlar:

- **Çapraz Platform Yönetimi:** Birçok ekip, farklı platformlarda çalışıyor ve verileri senkronize etmekte zorlanıyor. Bu proje, Discord’dan Mattermost’a tam bir veri aktarımı sağlayarak bu sorunu çözüyor.
- **Yinelenen Mesajların Önlenmesi:** Mesajların tekrar tekrar yüklenmesi engellenerek performans kaybı ve veri kirliliği önlenmiş oluyor.
- **Otomatik Kullanıcı ve Kanal Ekleme:** Kullanıcıların manuel olarak eklenmesine gerek kalmadan, tüm kullanıcılar ve kanallar otomatik olarak Mattermost’a aktarılıyor.

# Kurulum ve Çalıştırma:

- Proje dosyalarını GitHub’dan klonlayın.
- Gereksinimlerinizi yüklemek için aşağıdaki komutu çalıştırın:

```sh
  pip install -r requirements.txt
```
- .env dosyasını oluşturun ve Discord ve Mattermost token’larınızı, sunucu ID’lerinizi girin:
```env
DISCORD_TOKEN=<discord_token>
GUILD_ID=<guild_id> # Discord Sunucu ID
MATTERMOST_URL=<mattermost_url>
MATTERMOST_TOKEN=<mattermost_token>
```

```sh
python main.py
```
# Önemli Notlar

Projede 3 adet .js dosyası mevcut.

## getMattermostUsers.js
- Mattermosttaki kullanıcıların kullanıcı adı ve id değerlerini çeker.
## getDiscordUsers
- Discord sunucunuzdaki kullanıcıları ve id değerlerini çeker.

### getMettermostUsers ve getDiscordUsers dosyalarının çıktıları

- Bu iki js dosyasını çalıştırıp console da verilen çıktıyı kopyalayın ve aşağıdaki hale getirin. Daha sonra main.py dosyanızdaki ilgili yere yapıştırın.
```python

user_mapping = [
    {"discord_user_name": "<discord_user_name>", "discord_user_id": "<discord_user_id>", "mattermost_user_name": "<mattermost_user_name>", "mattermost_user_id": "<mattermost_user_id>" },

    # Örnek kullanım:

    {"discord_user_name": "muhittin.topalak34, "discord_user_id": "123456789", "mattermost_user_name": "muhittin.topalak", "mattermost_user_id": "987654321" },
    ...
]

```

## clearMattermost.js
- Mattermost eklenen kanal ve takımları silmez sadece arşivler. Discorddan Mattermosta taşıma yaparken bazen işler yolunda gitmeyebilir. Böyle durumlarda Mattermostta oluşturulan takım ve kanalları silmek isteyebilirsiniz. Ama mattermost buna izin vermez. Sadece arşivler. Bu da veri kirliğine yol açabilir. Bu durumda clearMatterMost.js dosyasını çalıştırın. Bu dosya mevcuttaki tüm takım ve kanalları arşivleyecektir. Ardından sunucuza bağlanın ve sırasıyla aşağıdaki komutları uygulayın. Bu komutlar arşivlenen tüm mattermost takım ve kanalları veritabanından silecektir.


## Mattermost Temizleme
```sh
## Lütfen tüm kodları sırasıyla çalıştırın.


## Sizde mattermost hangi dizindeyse oraya gidin

cd /opt/docker

## Çalışan postgresql konteynar id bulun

docker ps -a

## Konteynarın içine girin.

docker exec -it <postgresql-container-id> psql -U <postgresql-user> -d <postgresql-db-name>

## Arşivlenmiş Takımların tüm kanallarını mesajlarını siler

DELETE FROM Posts WHERE ChannelId IN (SELECT Id FROM Channels WHERE TeamId IN (SELECT Id FROM Teams WHERE DeleteAt != 0)); # Arşivlenen tüm takımlara bağlı arşivlenmiş kanallardaki mesajları sile
DELETE FROM Channels WHERE TeamId IN (SELECT Id FROM Teams WHERE DeleteAt != 0); # Arşivlenen tüm kanalları siler
DELETE FROM Teams WHERE DeleteAt != 0; # Arşivlenen tüm takımları siler

## Arşivlenmemiş takımların arşivlenene tüm kanallarındaki mesajları ve kanalları siler.

SELECT * FROM Channels WHERE DeleteAt != 0 AND TeamId IN (SELECT Id FROM Teams WHERE DeleteAt = 0); # Arşivlenmemiş takımdaki arşivlenmiş kanallardaki mesajları getirir
DELETE FROM Posts WHERE ChannelId IN (SELECT Id FROM Channels WHERE DeleteAt != 0 AND TeamId IN (SELECT Id FROM Teams WHERE DeleteAt = 0)); # Arşivlenmemiş takımdaki arşivlenmiş kanallardaki mesajları siler
DELETE FROM Channels WHERE DeleteAt != 0 AND TeamId IN (SELECT Id FROM Teams WHERE DeleteAt = 0); # Arşivlenmemiş takımdaki arşivlenmiş kanalları siler

exit

## Tüm işler bitince docker container dan çıkış yapıp docker containerlarını yeniden başlatın.

docker compose -f docker-compose.yml -f docker-compose.without-nginx.yml down

docker compose -f docker-compose.yml -f docker-compose.without-nginx.yml up -d

## Bonus

## Arşivlenmemiş takımlardaki toplam mesaj sayısı:

SELECT COUNT(*) AS TotalMessages FROM Posts WHERE ChannelId IN (SELECT Id FROM Channels WHERE DeleteAt = 0 AND TeamId IN (SELECT Id FROM Teams WHERE DeleteAt = 0));

## Mattermosttaki toplam mesaj sayısı

SELECT COUNT(*) AS TotalMessages FROM Posts;

```

# Projenin Çalıştırılması

## Discord API

1. Discord Developer Portal’a Git

Öncelikle, Discord Developer Portal’a erişmen gerekiyor:

- Discord Developer Portal adresine git.

2. Yeni Uygulama (Application) Oluştur

- Discord Developer Portal’da oturum aç.
- “New Application” butonuna tıkla.
- Bu buton sayfanın sağ üst köşesinde bulunur.
- Uygulamana bir isim ver ve “Create” butonuna bas. (Bu, botun adıdır ve daha sonra değiştirilebilir.)

Artık yeni bir Discord uygulaman var ve botu bu uygulamaya ekleyebilirsin.

3. Bot Oluşturma

- Sol tarafta bulunan menüde “Bot” sekmesine tıkla.
- “Add Bot” butonuna tıkla ve onayla.
    - Bu işlem, uygulamana bir bot ekleyecek ve bu botun Discord sunucularında çalışmasına izin verecektir.

4. Bot Tokenini Alma

Botu oluşturduktan sonra botun tokeni görüntülenebilir hale gelecektir. Bu token, botunun Discord API’sine erişimini sağlayacak ve çok önemlidir, kimseyle paylaşmamalısın.

- "Click to Reveal Token” kısmına tıklayarak bot tokenini kopyala. Bu token, botunun Discord sunucularına erişmesi ve mesajları alıp gönderebilmesi için kullanılacak.
- Bu tokeni güvende tutmalısın. Eğer bu tokeni yanlışlıkla paylaşırsan, hemen Developer Portal’a gidip “Regenerate” (Yenile) butonuna basarak yeni bir token oluşturabilirsin.

5. OAuth2 ve Botu Sunucuya Eklemek

Botu oluşturduktan sonra, botu sunucuna eklemek için OAuth2 yetkilendirmesi kullanman gerekecek.

- Sol menüden OAuth2 sekmesine git.
- “OAuth2 URL Generator” kısmına tıkla.
- Scopes bölümünde “bot” seçeneğini işaretle.
- Bot Permissions kısmında botunun hangi izinlere sahip olacağını seçebilirsin. Örneğin:
    - “Send Messages” (Mesaj Gönderme)
    - “Manage Channels” (Kanal Yönetme)
    - “Manage Messages” (Mesajları Yönetme)

Seçtiğin izinlere göre botun yetkilerini ayarlayabilirsin. Eğer sadece mesaj gönderip almak istersen, minimum izinleri seçebilirsin.

- Sayfanın alt kısmında oluşturulmuş bir URL göreceksin. Bu URL’yi kopyala ve tarayıcıda aç.
- Açılan sayfada botunu hangi sunucuya eklemek istediğini seç ve yetkilendir.

Bot artık sunucuna eklenmiş olacak.

## Mattermost Token

Sistem Panosu > Bütünleştirmeler > Bütünleştirme Yönetimi > Kişisel erişim kodları kullanılsın > Doğru

Profil > Güvenlik > Kişisel Erişim kodları > Ekle

Kod açıklaması: test
Kod kimliği: mffdfds5d3mc6ypeioo7o
Erişim kodu: dsfdsfzurpfdsfds9ni7igoaorra4h
Projemizde **Erişim kodu** değerini kullanacağız.

Aktarımın düzgün çalışması için bir çok denemeler yaptım. Sonuç olarak şöyle bir yola başvurmam gerekti. Discorddaki tüm kullanıcılara ait mesajları mattermosta senkronize ederken çok fazla hata ile karşılaştım. Bu hataları çözmek için mattermosttaki tüm kullanıcıları aktarım bitene kadar sistem yöneticisi rolüne çektim. Sizde hatasız bir kurulum için bunu yapmayı unutmayın. Ek olarak Sistem Yöneticisi > Kimlik Doğrulama > E-Posta > E-posta doğrulaması istensin bu ayarı aktarım bitene kadar kapatın.

## Discord Mesajlarının Mattermostta doğru kişiye atanması.

Bu işlem için mattermosttaki tüm kullanıcılara token oluşturmalısınız. Mantık şu; main.py de mesajlari içeri aktarılırken kullanıcıların tokenlarından oturum açıp mesajları onlar gönderiyormuş gibi mesjaları içeri aktarıyor. Oluşturduğunuz tokenları da main.py de aşağıda alana yerleştirin.

```python 
def get_user_token_by_mattermost_id(mattermost_user_id):
    # Kullanıcı ID'lerine göre tokenların saklandığı bir dictionary
    user_tokens = {
            'admin': 'token',
            'murat.genc': 'token',
            ....
    }
    # Kullanıcı tokenını sözlükten çekiyoruz
    return user_tokens.get(mattermost_user_id, None)
```

Mattermostta support.bot adında bir kullanıcı oluşturdum. Bu kullanıcı Discordda mesaj gönderenler arasında olup mattermostta olmayan kullanıcılar var ise otomatik olarak support.bot kullanıcısına atıyor.

## Her takıma ve kanala default user atama
Mattermostta sistem yöneticisi olsanız bile ekli olmadığınız takımı yada kanalı göremezsiniz. Discorddan mattermostta aktarım yaparken discorddaki kullanıcıların yanı sıra seçtiğim kullanıcıları mattermosttaki tüm takım ve kanallara otomatik olarak ekletiyorum.

```python
def add_admin_to_team_and_channel(team_id, channel_id):

    # Admin kullanıcısının Mattermost ID'si (Discord ile eşleşmeden doğrudan Mattermost'tan)
   
    user_ids = [
        "mattermost_user_id",  # Admin kullanıcısının ID'si
        "mattermost_user_id"  # 'murat.genc' kullanıcısının ID'si
        
    ]
```

## Sonuç:

Bu proje, iki farklı platform arasında sorunsuz bir veri aktarımı sağlar. Discord’daki kullanıcılar, mesajlar ve kanallar başarılı bir şekilde Mattermost’a taşınır. Çalışma ortamlarının birleştirilmesi gereken durumlar için güçlü bir çözüm sunar.

# Takıldığınız veya yapamadığınız bir durumda bana linkedin üzerinden ulaşabilirsiniz. 
https://www.linkedin.com/in/murat-gen%C3%A7-775745b5/
