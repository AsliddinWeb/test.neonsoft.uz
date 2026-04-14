# Deploy qo'llanmasi

## Serverda birinchi marta

```bash
cd /home/projects/test.neonsoft.uz

# 1. Git pull
git pull

# 2. .env yarating
cat > .env <<'EOF'
ADMIN_USER=admin
ADMIN_PASS=ilhom2025
PORT=3001
EOF

# 3. Dependencies
npm install

# 4. Frontend build
npm run build

# 5. PM2 o'rnatish (agar yo'q bo'lsa)
npm i -g pm2

# 6. API server ishga tushirish
mkdir -p /var/log/pm2
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup systemd   # chiqargan buyruqni ko'chirib ishga tushiring

# 7. Nginx
sudo cp deploy/nginx.conf /etc/nginx/sites-available/test.neonsoft.uz
sudo ln -sf /etc/nginx/sites-available/test.neonsoft.uz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 8. SSL (birinchi marta)
sudo certbot --nginx -d test.neonsoft.uz -d www.test.neonsoft.uz
```

## Keyingi deploy (kod yangilangandan keyin)

```bash
cd /home/projects/test.neonsoft.uz
git pull
npm install         # yangi paketlar bo'lsa
npm run build       # frontend qayta build
pm2 restart ilhom-api
```

## Foydali buyruqlar

```bash
pm2 logs ilhom-api          # API loglarni ko'rish
pm2 status                  # holat
pm2 restart ilhom-api       # qayta ishga tushirish
pm2 stop ilhom-api          # to'xtatish

# DB backup
cp data/ilhom.db data/ilhom.backup.$(date +%Y%m%d).db
```

## Ma'lumotlar bazasi

SQLite fayli: `/home/projects/test.neonsoft.uz/data/ilhom.db`

Natijalarni qo'lda ko'rish:

```bash
sqlite3 data/ilhom.db
sqlite> SELECT name, percent, at FROM results ORDER BY at DESC;
sqlite> .exit
```
