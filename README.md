# TBS CMS API v2

### Example .env config

```env
# NodeJS config
NODE_ENV=production

# Application config
APP_NAME=TBS CMS API v2
APP_VERSION=2.0.0
APP_PORT=4000
APP_SECURITY_CORS=true
APP_USERNAME=v9rw6G4Cx29qwONB
APP_PASSWORD=E6LgE9Eou9ZkxqJX

# JWT
APP_JWT_SECRET=1TChMaPiobcublokySrMeS
APP_JWT_EXPIRES_IN=28800
APP_JWT_ISS=https://1moby.com
APP_JWT_AUD=AuBVwynK

# Database config (TYPEORM)
TYPEORM_HOST=127.0.0.1
TYPEORM_USERNAME=xxx
TYPEORM_PASSWORD=xxx
TYPEORM_DATABASE=xxx
TYPEORM_PORT=3306
TYPEORM_LOGGING=false
TYPEORM_MIGRATIONS_RUN=false
TYPEORM_SYNCHRONIZE=false

# Redis config
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

# SMS API Gateway v2
SMS_V2_URL=http://localhost:8080
SMS_V2_BE_USERNAME=xxx
SMS_V2_BE_PASSWORD=xxx
```

### Deploy Step

1. สร้างไฟล์ `.env` ที่ root path project และเอา env ด้านบนไปใส่ (อย่าลืมแก้ database config ครับ)

- APP_USERNAME, APP_PASSWORD เอาไว้ใช้ auth เบื้องต้น
- APP_JWT_EXPIRES_IN: Jwt token expiry ตั้งไว้ 8 ชม.

2. `yarn` เพื่อ install package

3. `yarn prebuild` เพื่อลบบิ้วก่อนหน้า

4. `yarn build`

5. `yarn start:prod`
# projectnestintern
