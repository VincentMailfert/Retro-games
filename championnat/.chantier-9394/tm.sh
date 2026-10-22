#!/bin/bash
# tm.sh <chemin-url> <fichier-sortie> : essaie les trois domaines, repli sur anti-robot
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
for dom in de com co.uk; do
  code=$(curl -s --compressed -o "$2" -w '%{http_code}' -H "User-Agent: $UA" "https://www.transfermarkt.$dom$1")
  sz=$(stat -c%s "$2" 2>/dev/null || echo 0)
  if [ "$code" = 200 ] && [ "$sz" -gt 8000 ] && ! grep -q 'Human Verification' "$2"; then echo "ok:$dom:$sz"; exit 0; fi
  sleep 1
done
echo "echec"; exit 1
