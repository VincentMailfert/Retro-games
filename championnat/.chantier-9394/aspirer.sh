UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
ech=0
while read div code vid slug; do
  for genre in kader leistungsdaten; do
    out="pages/$code-$genre.html"
    [ -s "$out" ] && continue
    if [ "$genre" = kader ]; then
      url="https://www.transfermarkt.de/$slug/kader/verein/$vid/saison_id/1993/plus/1"
    else
      url="https://www.transfermarkt.de/$slug/leistungsdaten/verein/$vid/reldata/%261993/plus/1"
    fi
    for dom in de com co.uk; do
      u=$(echo "$url" | sed "s|transfermarkt.de|transfermarkt.$dom|")
      code_http=$(curl -s -o "$out" -w '%{http_code}' -H "User-Agent: $UA" "$u")
      if [ "$code_http" = 200 ] && [ $(stat -c%s "$out") -gt 40000 ]; then break; fi
      rm -f "$out"; sleep 1
    done
    [ -s "$out" ] || { echo "ECHEC $code $genre"; ech=$((ech+1)); }
  done
done < clubs9394.txt
echo "echecs=$ech"; ls pages | wc -l
