# Kidamooz Backend — راهنمای پیاده‌سازی با .NET و SQL Server

این سند قرارداد **Backend** را برای اتصال به:
- **پنل ادمین Angular** (`D:\Projects\Kidamooz\Admin`)
- **اپ موبایل** (`D:\Projects\Kidamooz\android`)

تعریف می‌کند. فرانت ادمین الان با `useMock: true` کار می‌کند؛ بعد از پیاده‌سازی API کافی است `useMock: false` شود.

---

## معماری

```text
┌─────────────────┐     JWT      ┌──────────────────────────┐
│  Admin Panel    │─────────────▶│  Admin API               │
│  (Angular)      │              │  /api/v1/admin/*       │
└─────────────────┘              └───────────┬──────────────┘
                                             │
┌─────────────────┐   read-only  ┌───────────▼──────────────┐
│  Mobile App     │─────────────▶│  Public API              │
│  (Ionic/Angular)│              │  /api/v1/*               │
└─────────────────┘              └───────────┬──────────────┘
                                             │
                                 ┌───────────▼──────────────┐
                                 │  SQL Server              │
                                 └───────────┬──────────────┘
                                             │
                                 ┌───────────▼──────────────┐
                                 │  Liara Object Storage    │
                                 │  (S3-compatible bucket)  │
                                 └──────────────────────────┘
```

| API | Base Path | Auth |
|-----|-----------|------|
| Admin | `/api/v1/admin` | JWT Bearer |
| Public | `/api/v1` | بدون auth (فقط GET) |

---

## استک پیشنهادی

| لایه | انتخاب |
|------|--------|
| Runtime | .NET 8 یا 9 |
| API | ASP.NET Core Web API |
| ORM | Entity Framework Core 8+ |
| DB | SQL Server 2019+ (یا Azure SQL) |
| Auth | ASP.NET Core Identity + JWT |
| Storage | **Liara Object Storage** + `AWSSDK.S3` |
| Logging | Serilog |
| Validation | FluentValidation |

### ساختار Solution پیشنهادی

```text
Kidamooz.Api/
├── Kidamooz.Api/              # Web host, controllers
├── Kidamooz.Application/      # DTOs, services, validators
├── Kidamooz.Domain/           # Entities, enums
├── Kidamooz.Infrastructure/   # EF, storage, auth
└── Kidamooz.Tests/
```

---

## قرارداد JSON (هم‌راستا با فرانت ادمین)

### LocalizedText

```json
{ "fa": "عنوان فارسی", "en": "English title" }
```

### StoryAccess

```json
{
  "visibility": "public",
  "audience": {
    "segmentIds": [],
    "userIds": []
  }
}
```

`visibility`: `public` | `restricted`

---

## اسکیمای SQL Server

```sql
-- ========== Auth ==========
CREATE TABLE users (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    email           NVARCHAR(256)    NOT NULL UNIQUE,
    password_hash   NVARCHAR(512)    NOT NULL,
    display_name    NVARCHAR(200)    NOT NULL,
    role            NVARCHAR(50)     NOT NULL DEFAULT 'editor', -- editor | admin
    is_active       BIT              NOT NULL DEFAULT 1,
    created_at      DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at      DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE refresh_tokens (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    user_id         UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    token_hash      NVARCHAR(256)    NOT NULL,
    expires_at      DATETIMEOFFSET   NOT NULL,
    revoked_at      DATETIMEOFFSET   NULL,
    created_at      DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

-- ========== Catalog ==========
CREATE TABLE catalog_meta (
    id              INT              NOT NULL DEFAULT 1 PRIMARY KEY,
    version         NVARCHAR(128)    NOT NULL,
    updated_at      DATETIMEOFFSET   NOT NULL,
    CONSTRAINT CK_catalog_meta_singleton CHECK (id = 1)
);

INSERT INTO catalog_meta (id, version, updated_at)
VALUES (1, CONVERT(NVARCHAR(128), SYSDATETIMEOFFSET(), 127), SYSDATETIMEOFFSET());

-- ========== Categories ==========
CREATE TABLE categories (
    id              NVARCHAR(64)     NOT NULL PRIMARY KEY,  -- slug-like: forest
    slug            NVARCHAR(64)     NOT NULL UNIQUE,
    title_fa        NVARCHAR(300)    NOT NULL,
    title_en        NVARCHAR(300)    NOT NULL,
    icon_url        NVARCHAR(1000)   NOT NULL,
    color           NVARCHAR(16)     NOT NULL,             -- #7bc950
    sort_order      INT              NOT NULL DEFAULT 0,
    published       BIT              NOT NULL DEFAULT 0,
    deleted_at      DATETIMEOFFSET   NULL,
    created_at      DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at      DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

CREATE INDEX IX_categories_sort ON categories (sort_order) WHERE deleted_at IS NULL;

-- ========== Stories ==========
CREATE TABLE stories (
    id                  NVARCHAR(64)     NOT NULL PRIMARY KEY,
    category_id         NVARCHAR(64)     NOT NULL REFERENCES categories(id),
    title_fa            NVARCHAR(300)    NOT NULL,
    title_en            NVARCHAR(300)    NOT NULL,
    description_fa      NVARCHAR(2000)   NOT NULL,
    description_en      NVARCHAR(2000)   NOT NULL,
    cover_url           NVARCHAR(1000)   NOT NULL,
    audio_url           NVARCHAR(1000)   NOT NULL,
    duration_seconds    INT              NOT NULL,
    age_min             INT              NOT NULL,
    age_max             INT              NOT NULL,
    featured            BIT              NOT NULL DEFAULT 0,
    sort_order          INT              NOT NULL DEFAULT 0,
    published           BIT              NOT NULL DEFAULT 0,
    published_at        DATETIMEOFFSET   NULL,
    visibility          NVARCHAR(20)     NOT NULL DEFAULT 'public', -- public | restricted
    deleted_at          DATETIMEOFFSET   NULL,
    created_at          DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    updated_at          DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT CK_stories_visibility CHECK (visibility IN ('public', 'restricted'))
);

CREATE INDEX IX_stories_category ON stories (category_id) WHERE deleted_at IS NULL;
CREATE INDEX IX_stories_sort ON stories (sort_order) WHERE deleted_at IS NULL;
CREATE INDEX IX_stories_published ON stories (published) WHERE deleted_at IS NULL;

-- ========== Chapters ==========
CREATE TABLE story_chapters (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    story_id        NVARCHAR(64)     NOT NULL REFERENCES stories(id),
    title_fa        NVARCHAR(300)    NOT NULL,
    title_en        NVARCHAR(300)    NOT NULL,
    start_seconds   INT              NOT NULL,
    image_url       NVARCHAR(1000)   NOT NULL,
    sort_order      INT              NOT NULL DEFAULT 0
);

CREATE INDEX IX_story_chapters_story ON story_chapters (story_id, sort_order);

-- ========== Audience (دسترسی محدود) ==========
CREATE TABLE audience_segments (
    id              NVARCHAR(64)     NOT NULL PRIMARY KEY,  -- premium, beta, family
    label           NVARCHAR(200)    NOT NULL,
    description     NVARCHAR(500)    NOT NULL,
    is_active       BIT              NOT NULL DEFAULT 1
);

CREATE TABLE app_users (
    id              NVARCHAR(64)     NOT NULL PRIMARY KEY,  -- u-1001 یا GUID اپ
    display_name    NVARCHAR(200)    NOT NULL,
    email           NVARCHAR(256)    NOT NULL,
    is_active       BIT              NOT NULL DEFAULT 1
);

CREATE TABLE story_audience_segments (
    story_id        NVARCHAR(64)     NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    segment_id      NVARCHAR(64)     NOT NULL REFERENCES audience_segments(id),
    PRIMARY KEY (story_id, segment_id)
);

CREATE TABLE story_audience_users (
    story_id        NVARCHAR(64)     NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id         NVARCHAR(64)     NOT NULL REFERENCES app_users(id),
    PRIMARY KEY (story_id, user_id)
);

-- ========== Analytics (بازدید — mock فعلی داشبورد) ==========
CREATE TABLE story_views_daily (
    view_date       DATE             NOT NULL,
    story_id        NVARCHAR(64)     NOT NULL REFERENCES stories(id),
    view_count      INT              NOT NULL DEFAULT 0,
    PRIMARY KEY (view_date, story_id)
);

-- ========== Audit ==========
CREATE TABLE audit_logs (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID() PRIMARY KEY,
    action          NVARCHAR(50)     NOT NULL,
    entity_type     NVARCHAR(50)     NOT NULL,
    entity_id       NVARCHAR(128)    NOT NULL,
    entity_title    NVARCHAR(300)    NOT NULL,
    actor_email     NVARCHAR(256)    NOT NULL,
    details         NVARCHAR(1000)   NULL,
    created_at      DATETIMEOFFSET   NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

CREATE INDEX IX_audit_logs_created ON audit_logs (created_at DESC);
```

### Seed اولیه

```sql
INSERT INTO audience_segments (id, label, description) VALUES
('premium', N'اشتراک ویژه', N'کاربران با اشتراک پریمیوم'),
('family',  N'پلن خانوادگی', N'خانواده‌های با چند پروفایل کودک'),
('beta',    N'تسترهای بتا',   N'گروه تست داخلی'),
('school',  N'مدارس همکار',  N'مدارس طرف قرارداد');

INSERT INTO app_users (id, display_name, email) VALUES
('u-1001', N'سارا احمدی', 'sara@example.com'),
('u-1002', N'علی رضایی',  'ali@example.com');
```

---

## Admin API — قرارداد کامل (فرانت ادمین)

Base: `https://localhost:5001/api/v1/admin`  
Header: `Authorization: Bearer <accessToken>`

### Auth

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/auth/login` | `{ email, password }` | `{ accessToken, refreshToken }` |
| POST | `/auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| POST | `/auth/logout` | `{ refreshToken }` | `204` |

### Dashboard

| Method | Path | Response |
|--------|------|----------|
| GET | `/dashboard` | `DashboardStats` (پایین) |

```json
{
  "totalStories": 10,
  "publishedStories": 7,
  "draftStories": 3,
  "featuredStories": 2,
  "totalCategories": 4,
  "publishedCategories": 3,
  "views": {
    "total": 12840,
    "today": 342,
    "thisWeek": 2156
  },
  "catalogVersion": {
    "version": "2026-07-09T12:00:00Z-7-3",
    "updatedAt": "2026-07-09T12:00:00Z"
  },
  "lastPublishedAt": "2026-07-05T09:00:00Z"
}
```

محاسبه `views`:
- `total` → `SUM(view_count)` از `story_views_daily`
- `today` → فیلتر `view_date = CAST(GETDATE() AS DATE)`
- `thisWeek` → ۷ روز اخیر

### Categories

| Method | Path | توضیح |
|--------|------|-------|
| GET | `/categories` | همه (شامل draft)، مرتب بر `sortOrder` |
| GET | `/categories/{id}` | جزئیات |
| POST | `/categories` | ایجاد |
| PUT | `/categories/{id}` | ویرایش |
| DELETE | `/categories/{id}` | soft delete (`deleted_at`) |
| POST | `/categories/{id}/publish` | `{ published: true/false }` |
| PUT | `/categories/reorder` | `{ ids: ["forest","space",...] }` |

### Stories

| Method | Path | توضیح |
|--------|------|-------|
| GET | `/stories` | لیست + فیلتر |
| GET | `/stories/{id}` | جزئیات + chapters |
| POST | `/stories` | ایجاد |
| PUT | `/stories/{id}` | ویرایش |
| DELETE | `/stories/{id}` | soft delete |
| POST | `/stories/{id}/publish` | `{ published: true/false }` |
| POST | `/stories/{id}/featured` | `{ featured: true/false }` |
| PUT | `/stories/{id}/chapters` | `{ chapters: StoryChapter[] }` |
| PUT | `/stories/reorder` | `{ ids: ["1","2",...] }` |

**Query پارامترهای `GET /stories`:**

| Param | Type | |
|-------|------|--|
| categoryId | string | |
| ageMin | int | سن کاربر باید `ageMax >= ageMin` |
| ageMax | int | سن کاربر باید `ageMin <= ageMax` |
| featured | bool | |
| published | bool | |
| visibility | string | `public` \| `restricted` |
| page | int | default: 1 |
| limit | int | default: 50 |
| sortBy | string | `sortOrder` \| `title` \| `publishedAt` |

**نمونه پاسخ Story:**

```json
{
  "id": "1",
  "title": { "fa": "...", "en": "..." },
  "description": { "fa": "...", "en": "..." },
  "coverUrl": "https://cdn.../cover.webp",
  "audioUrl": "https://cdn.../audio.mp3",
  "durationSeconds": 420,
  "ageMin": 3,
  "ageMax": 6,
  "categoryId": "forest",
  "featured": true,
  "sortOrder": 1,
  "published": true,
  "publishedAt": "2026-07-01T10:00:00Z",
  "access": {
    "visibility": "restricted",
    "audience": {
      "segmentIds": ["premium"],
      "userIds": ["u-1001"]
    }
  },
  "chapters": [
    {
      "title": { "fa": "شروع", "en": "Start" },
      "startSeconds": 0,
      "imageUrl": "https://cdn.../ch1.webp"
    }
  ]
}
```

### Audience (برای فرم دسترسی محدود)

| Method | Path | Response |
|--------|------|----------|
| GET | `/audience/segments` | `AudienceSegment[]` |
| GET | `/audience/users` | `AudienceUser[]` (جستجو: `?q=sara`) |

### Media

> **فایل‌ها (کاور، صوت، آیکون، تصویر فصل) روی [Liara Object Storage](https://docs.liara.ir/object-storage/how-tos/connect-via-platform/dotnet/) ذخیره می‌شوند — نه روی دیسک سرور API.**

| Method | Path | Body |
|--------|------|------|
| POST | `/media/upload-url` | `{ fileName, contentType, mediaType }` |
| POST | `/media/confirm` | `{ publicUrl, mediaType }` |

`mediaType`: `cover` | `audio` | `icon`

**پاسخ upload-url:**

```json
{
  "uploadUrl": "https://storage.iran.liara.space/bucket/...?X-Amz-...",
  "publicUrl": "https://kidamooz-media.storage.iran.liara.space/covers/abc.webp",
  "expiresAt": "2026-07-09T12:15:00Z"
}
```

- `uploadUrl` → presigned PUT از Liara (فرانت مستقیم آپلود می‌کند)
- `publicUrl` → URL دائم فایل در باکت (در DB ذخیره می‌شود)

محدودیت‌ها:
- کاور/icon: `image/webp`, `image/jpeg`, `image/png` — max 2MB
- صوت: `audio/mpeg`, `audio/mp4` — max 50MB

### Catalog

| Method | Path |
|--------|------|
| GET | `/catalog/version` |
| POST | `/catalog/rebuild-version` |

### Audit Log

| Method | Path | Query |
|--------|------|-------|
| GET | `/audit-logs` | `entityType`, `limit` |

**action values:** `create`, `update`, `delete`, `publish`, `unpublish`, `reorder`, `rebuild_version`

---

## Public API — اپ موبایل

Base: `/api/v1` — **بدون JWT، فقط GET**

| Method | Path | توضیح |
|--------|------|-------|
| GET | `/catalog/version` | نسخه کاتالوگ |
| GET | `/categories` | فقط `published = true` و `deleted_at IS NULL` |
| GET | `/stories` | فقط published + فیلتر دسترسی کاربر |
| GET | `/stories/{id}` | جزئیات + chapters |

### فیلتر دسترسی در Public API

وقتی کاربر لاگین کرده (header اختیاری `X-User-Id` یا JWT اپ):

```text
visibility = 'public'
OR
(visibility = 'restricted' AND (
    user در story_audience_users
    OR segment کاربر در story_audience_segments
))
```

اگر اپ هنوز auth ندارد، فقط `visibility = 'public'` برگردانده شود.

### نگاشت دو زبانه برای اپ قدیمی

تا اپ کامل به `LocalizedText` مهاجرت کند، Public API می‌تواند **هر دو** برگرداند:

```json
{
  "title": "خرگوش کوچولو",
  "titleFa": "خرگوش کوچولو",
  "titleEn": "Sleepy Rabbit"
}
```

---

## ذخیره‌سازی فایل — Liara Object Storage

**همه فایل‌های رسانه‌ای پروژه باید روی Liara Object Storage بروند.**

مستندات رسمی: [اتصال Object Storage به .NET در لیارا](https://docs.liara.ir/object-storage/how-tos/connect-via-platform/dotnet/)

### چه فایل‌هایی کجا بروند؟

| نوع | `mediaType` فرانت | مسیر پیشنهادی در باکت | فرمت |
|-----|-------------------|------------------------|------|
| کاور قصه | `cover` | `covers/{storyId}/{uuid}.webp` | webp, jpg, png |
| صوت قصه | `audio` | `audio/{storyId}/{uuid}.mp3` | mp3, m4a |
| آیکون دسته | `icon` | `icons/{categoryId}/{uuid}.webp` | webp, jpg, png |
| تصویر فصل | `cover` | `chapters/{storyId}/{uuid}.webp` | webp, jpg, png |

فقط **URL دائم** (`publicUrl`) در SQL ذخیره می‌شود — نه خود فایل.

### ساختار باکت

```text
kidamooz-media/          ← BUCKET_NAME
├── covers/
├── audio/
├── icons/
└── chapters/
```

### نصب پکیج

```bash
cd Kidamooz.Infrastructure
dotnet add package AWSSDK.S3
```

### تنظیمات (appsettings / متغیر محیطی)

از پنل لیارا → باکت → **تنظیمات** → **دسترسی با SDK**:

```json
{
  "Liara": {
    "EndpointUrl": "https://storage.iran.liara.site",
    "AccessKey": "YOUR_ACCESS_KEY",
    "SecretKey": "YOUR_SECRET_KEY",
    "BucketName": "kidamooz-media",
    "PublicBaseUrl": "https://kidamooz-media.storage.iran.liara.site"
  }
}
```

یا متغیر محیطی (طبق [مستندات لیارا](https://docs.liara.ir/object-storage/how-tos/connect-via-platform/dotnet/)):

```text
LIARA_ENDPOINT_URL=https://storage.iran.liara.site
LIARA_ACCESS_KEY=...
LIARA_SECRET_KEY=...
BUCKET_NAME=kidamooz-media
```

### ثبت S3 Client در Program.cs

```csharp
using Amazon.Runtime;
using Amazon.S3;

builder.Services.AddSingleton<IAmazonS3>(_ =>
{
    var config = new AmazonS3Config
    {
        ServiceURL = builder.Configuration["Liara:EndpointUrl"],
        ForcePathStyle = true  // الزامی برای S3-compatible مثل لیارا
    };

    var credentials = new BasicAWSCredentials(
        builder.Configuration["Liara:AccessKey"],
        builder.Configuration["Liara:SecretKey"]
    );

    return new AmazonS3Client(credentials, config);
});
```

### سرویس Media — presigned upload (برای فرانت ادمین)

```csharp
public sealed class LiaraMediaStorageService : IMediaStorageService
{
    private readonly IAmazonS3 _s3;
    private readonly string _bucket;
    private readonly string _publicBaseUrl;

    public UploadUrlResponse CreateUploadUrl(string fileName, string contentType, string mediaType)
    {
        var key = BuildObjectKey(mediaType, fileName); // covers/... یا audio/...

        var uploadUrl = _s3.GetPreSignedURL(new GetPreSignedUrlRequest
        {
            BucketName = _bucket,
            Key = key,
            Verb = HttpVerb.PUT,
            ContentType = contentType,
            Expires = DateTime.UtcNow.AddMinutes(15)
        });

        var publicUrl = $"{_publicBaseUrl.TrimEnd('/')}/{key}";

        return new UploadUrlResponse(uploadUrl, publicUrl, DateTime.UtcNow.AddMinutes(15));
    }

    public string GetPermanentUrl(string key) =>
        $"{_publicBaseUrl.TrimEnd('/')}/{key}";

    private static string BuildObjectKey(string mediaType, string fileName)
    {
        var ext = Path.GetExtension(fileName);
        var id = Guid.NewGuid().ToString("N");

        return mediaType switch
        {
            "cover"   => $"covers/{id}{ext}",
            "audio"   => $"audio/{id}{ext}",
            "icon"    => $"icons/{id}{ext}",
            _         => $"misc/{id}{ext}"
        };
    }
}
```

### فلو آپلود (همان چیزی که فرانت ادمین انتظار دارد)

```text
1. ادمین فایل را انتخاب می‌کند
2. POST /media/upload-url  →  backend کلید باکت می‌سازد + presigned PUT URL لیارا
3. فرانت: PUT مستقیم به uploadUrl  (بدون عبور از API)
4. POST /media/confirm  →  backend صحت key را چک می‌کند
5. publicUrl در story/category ذخیره می‌شود
```

### آپلود مستقیم از backend (اختیاری — مثلاً seed یا migration)

```csharp
await _s3.PutObjectAsync(new PutObjectRequest
{
    BucketName = _bucketName,
    Key = "covers/sample.webp",
    InputStream = stream,
    ContentType = "image/webp"
});
```

### حذف فایل هنگام حذف قصه (اختیاری)

```csharp
await _s3.DeleteObjectAsync(new DeleteObjectRequest
{
    BucketName = _bucketName,
    Key = objectKey
});
```

### نکات Liara

- باکت باید **public read** باشد تا اپ موبایل بدون auth فایل را stream کند (یا دامنه CDN جلوی باکت)
- `ForcePathStyle = true` در `AmazonS3Config` الزامی است
- برای لینک موقت دانلود (ادمین preview خصوصی) از `GetPreSignedURL` با `HttpVerb.GET` استفاده کن
- جزئیات بیشتر: [مستندات .NET لیارا](https://docs.liara.ir/object-storage/how-tos/connect-via-platform/dotnet/)

---

هر عملیات زیر باید `catalog_meta.version` را به‌روز کند:

- publish / unpublish قصه یا دسته
- ویرایش قصه/دسته publish‌شده
- حذف قصه/دسته publish‌شده
- reorder
- تغییر chapters قصه publish‌شده
- تغییر access قصه publish‌شده

**فرمول پیشنهادی:**

```csharp
version = $"{DateTimeOffset.UtcNow:O}-{publishedStoryCount}-{publishedCategoryCount}";
```

یا hash از `updated_at + counts`.

---

## Audit Log — ثبت خودکار

در سرویس‌های Application بعد از هر mutation:

```csharp
await _audit.LogAsync(new AuditLogEntry {
    Action = "publish",
    EntityType = "story",
    EntityId = story.Id,
    EntityTitle = story.TitleFa,
    ActorEmail = _currentUser.Email
});
```

---

## CORS

```csharp
builder.Services.AddCors(o => o.AddPolicy("Admin", p => p
    .WithOrigins("http://localhost:4200", "https://admin.kidamooz.com")
    .AllowAnyHeader()
    .AllowAnyMethod()));
```

---

## appsettings.json نمونه

```json
{
  "ConnectionStrings": {
    "Default": "Server=localhost;Database=Kidamooz;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Jwt": {
    "Issuer": "kidamooz",
    "Audience": "kidamooz-admin",
    "AccessTokenMinutes": 60,
    "RefreshTokenDays": 14,
    "Secret": "CHANGE-ME-min-32-chars-long-secret-key"
  },
  "Liara": {
    "EndpointUrl": "https://storage.iran.liara.site",
    "AccessKey": "YOUR_ACCESS_KEY",
    "SecretKey": "YOUR_SECRET_KEY",
    "BucketName": "kidamooz-media",
    "PublicBaseUrl": "https://kidamooz-media.storage.iran.liara.site"
  },
  "Cors": {
    "AdminOrigins": ["http://localhost:4200"]
  }
}
```

---

## اتصال فرانت ادمین

فایل `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'https://localhost:5001/api/v1/admin',
  useMock: false,
  mobileAppDeepLink: 'kidamooz://story',
};
```

---

## ترتیب پیاده‌سازی پیشنهادی

```text
فاز 1 — پایه
  [ ] Solution + EF Core + migrations
  [ ] users + JWT login/refresh
  [ ] categories CRUD + publish + reorder
  [ ] stories CRUD + publish + featured + reorder
  [ ] chapters
  [ ] catalog_meta + bump version
  [ ] CORS

فاز 2 — رسانه و داشبورد
  [ ] Liara Object Storage + AWSSDK.S3
  [ ] media upload-url (presigned PUT) + confirm
  [ ] GET /dashboard + story_views_daily
  [ ] audit_logs

فاز 3 — دسترسی محدود
  [ ] audience_segments + app_users
  [ ] story_audience_* + access در story payload
  [ ] GET /audience/segments + /audience/users

فاز 4 — Public API
  [ ] GET /api/v1/catalog/version
  [ ] GET /api/v1/categories (published)
  [ ] GET /api/v1/stories + فیلتر access
  [ ] GET /api/v1/stories/{id}
  [ ] تست با اپ: useMock=false

فاز 5 — production
  [ ] Rate limit روی login
  [ ] HTTPS + secrets در env لیارا
  [ ] دامنه CDN روی باکت Liara (اختیاری)
  [ ] backup SQL
```

---

## Entity نمونه (C#)

```csharp
public class Story
{
    public string Id { get; set; } = default!;
    public string CategoryId { get; set; } = default!;
    public string TitleFa { get; set; } = default!;
    public string TitleEn { get; set; } = default!;
    public string DescriptionFa { get; set; } = default!;
    public string DescriptionEn { get; set; } = default!;
    public string CoverUrl { get; set; } = default!;
    public string AudioUrl { get; set; } = default!;
    public int DurationSeconds { get; set; }
    public int AgeMin { get; set; }
    public int AgeMax { get; set; }
    public bool Featured { get; set; }
    public int SortOrder { get; set; }
    public bool Published { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }
    public string Visibility { get; set; } = "public";
    public DateTimeOffset? DeletedAt { get; set; }
    public Category Category { get; set; } = default!;
    public ICollection<StoryChapter> Chapters { get; set; } = [];
    public ICollection<StoryAudienceSegment> AudienceSegments { get; set; } = [];
    public ICollection<StoryAudienceUser> AudienceUsers { get; set; } = [];
}
```

---

## DTO Mapper نمونه (LocalizedText + Access)

```csharp
public static StoryDto ToDto(Story s) => new()
{
    Id = s.Id,
    Title = new LocalizedTextDto(s.TitleFa, s.TitleEn),
    Description = new LocalizedTextDto(s.DescriptionFa, s.DescriptionEn),
    CoverUrl = s.CoverUrl,
    AudioUrl = s.AudioUrl,
    DurationSeconds = s.DurationSeconds,
    AgeMin = s.AgeMin,
    AgeMax = s.AgeMax,
    CategoryId = s.CategoryId,
    Featured = s.Featured,
    SortOrder = s.SortOrder,
    Published = s.Published,
    PublishedAt = s.PublishedAt,
    Access = new StoryAccessDto
    {
        Visibility = s.Visibility,
        Audience = new StoryAudienceDto
        {
            SegmentIds = s.AudienceSegments.Select(x => x.SegmentId).ToList(),
            UserIds = s.AudienceUsers.Select(x => x.UserId).ToList()
        }
    },
    Chapters = s.Chapters.OrderBy(c => c.SortOrder).Select(c => new StoryChapterDto
    {
        Title = new LocalizedTextDto(c.TitleFa, c.TitleEn),
        StartSeconds = c.StartSeconds,
        ImageUrl = c.ImageUrl
    }).ToList()
};
```

---

## چک‌لیست یکپارچگی

- [ ] همه endpointهای بالا با همان path و JSON shape پیاده شده
- [ ] `POST /categories/{id}/publish` body: `{ published: bool }`
- [ ] `POST /stories/{id}/publish` body: `{ published: bool }`
- [ ] `POST /stories/{id}/featured` body: `{ featured: bool }`
- [ ] `PUT /stories/reorder` body: `{ ids: string[] }`
- [ ] `PUT /categories/reorder` body: `{ ids: string[] }`
- [ ] publish → `catalog.version` عوض می‌شود
- [ ] فرانت با `useMock: false` تست شده
- [ ] Public API فقط published برمی‌گرداند
- [ ] URLهای media از Liara Object Storage (HTTPS)

---

## فایل‌های مرجع در فرانت ادمین

| فایل | موضوع |
|------|--------|
| `src/app/core/services/*.service.ts` | قرارداد HTTP |
| `src/app/core/models/*.model.ts` | DTOها |
| `src/environments/environment.ts` | base URL |
| `../android/docs/ADMIN_PANEL.md` | قرارداد اپ موبایل |

---

## دستور شروع سریع

```bash
dotnet new sln -n Kidamooz
dotnet new webapi -n Kidamooz.Api
dotnet new classlib -n Kidamooz.Domain
dotnet new classlib -n Kidamooz.Application
dotnet new classlib -n Kidamooz.Infrastructure
dotnet sln add **/*.csproj

cd Kidamooz.Infrastructure
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add package AWSSDK.S3
```

SQL Server LocalDB برای dev کافی است:

```text
Server=(localdb)\mssqllocaldb;Database=Kidamooz;Trusted_Connection=True
```
