#!/bin/bash
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
for dom in de co.uk com; do
  code=$(curl -s -L --compressed -o "$2" -w '%{http_code}' -H "User-Agent: $UA" "https://www.transfermarkt.$dom/spieler/profil/spieler/$1")
  sz=$(stat -c%s "$2" 2>/dev/null || echo 0)
  if [ "$code" = 200 ] && [ "$sz" -gt 20000 ] && ! grep -q 'Human Verification' "$2"; then echo ok; exit 0; fi
  sleep 1
done
echo echec; exit 1
