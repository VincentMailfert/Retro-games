UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
ech=0
while read div code vid slug; do
  out="pages/$code-leistungsdaten.html"
  [ -s "$out" ] && [ $(stat -c%s "$out") -gt 40000 ] && continue
  url="https://www.transfermarkt.de/$slug/leistungsdaten/verein/$vid/reldata/%261993/plus/1"
  for dom in de com co.uk; do
    u=$(echo "$url" | sed "s|transfermarkt.de|transfermarkt.$dom|")
    ch=$(curl -s -o "$out" -w '%{http_code}' -H "User-Agent: $UA" "$u")
    if [ "$ch" = 200 ] && [ $(stat -c%s "$out") -gt 40000 ]; then break; fi
    rm -f "$out"; sleep 2
  done
  [ -s "$out" ] || { echo "ECHEC $code"; ech=$((ech+1)); }
done < clubs9394.txt
echo "echecs=$ech ; pages=$(ls pages/*-leistungsdaten.html 2>/dev/null | wc -l)"
