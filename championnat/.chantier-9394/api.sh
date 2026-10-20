#!/bin/bash
# api.sh <chemin> <sortie> : API Transfermarkt, trois domaines, repli anti-robot
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
for dom in de co.uk com; do
  code=$(curl -s --compressed -o "$2" -w '%{http_code}' -H "User-Agent: $UA" -H 'Accept: application/json' \
         -H "Referer: https://www.transfermarkt.$dom/" "https://www.transfermarkt.$dom$1")
  if [ "$code" = 200 ] && head -c1 "$2" | grep -q '[{[]'; then echo "ok:$dom"; exit 0; fi
  sleep 1
done
echo echec; exit 1
