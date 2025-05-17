#!/bin/sh
echo "Menjalankan migrasi database..."
npx prisma migrate deploy

echo "Memulai aplikasi..."
npm start
