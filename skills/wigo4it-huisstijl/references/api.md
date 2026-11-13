# Deck-API

Hiermee zet je een presentatie online met een vaste link. De volledige uitleg voor mensen staat op
https://wigo4it-brandbook.azurewebsites.net/api.html.

## Omgeving

| Variabele | Waarde |
| --- | --- |
| `W4_BRANDBOOK_KEY` | API-sleutel (`w4_…`), gemaakt op `/api.html`. Nooit tonen, loggen of in een bestand zetten. |
| `W4_BRANDBOOK_URL` | Optioneel. Standaard `https://wigo4it-brandbook.azurewebsites.net`. |

Gebruik in elke aanroep `${W4_BRANDBOOK_URL:-https://wigo4it-brandbook.azurewebsites.net}`.

## Publiceren

`jq` zet het markdown-bestand veilig om naar JSON (aanhalingstekens, regeleinden):

```bash
BASE="${W4_BRANDBOOK_URL:-https://wigo4it-brandbook.azurewebsites.net}"
jq -n --rawfile md deck.md \
  '{markdown: $md, visibility: "private", title: "Jaarplan 2026"}' \
  | curl -sS -X POST "$BASE/api/presentations" \
      -H "Authorization: Bearer $W4_BRANDBOOK_KEY" \
      -H "Content-Type: application/json" --data @-
```

Geen `jq`? Gebruik Python:

```bash
python -c "import json,sys; print(json.dumps({'markdown': open(sys.argv[1], encoding='utf-8').read(), 'visibility': 'private'}))" deck.md \
  | curl -sS -X POST "$BASE/api/presentations" \
      -H "Authorization: Bearer $W4_BRANDBOOK_KEY" \
      -H "Content-Type: application/json" --data @-
```

Antwoord `201`:

```json
{ "id": "k7m2q", "title": "Jaarplan 2026", "visibility": "private",
  "url": "https://wigo4it-brandbook.azurewebsites.net/present/k7m2q", "...": "..." }
```

Velden in de body:

| Veld | Verplicht | Waarde |
| --- | --- | --- |
| `markdown` | ja | Het hele deck, inclusief front matter |
| `visibility` | nee | `private` (standaard) of `public` |
| `title` | nee | Gebruik de `title:` uit de front matter |
| `options` | nee | `{"footerText": "...", "transition": "slide"}`; `transition` is `slide`, `fade`, `convex` of `none`. Een `footer:` in de front matter werkt ook. |

## Vervangen

Link blijft gelijk. Stuur alleen wat verandert:

```bash
jq -n --rawfile md deck.md '{markdown: $md}' \
  | curl -sS -X PUT "$BASE/api/presentations/k7m2q" \
      -H "Authorization: Bearer $W4_BRANDBOOK_KEY" \
      -H "Content-Type: application/json" --data @-

# alleen de zichtbaarheid
curl -sS -X PUT "$BASE/api/presentations/k7m2q" \
  -H "Authorization: Bearer $W4_BRANDBOOK_KEY" \
  -H "Content-Type: application/json" -d '{"visibility":"public"}'
```

## Lijst, ophalen, verwijderen

```bash
curl -sS "$BASE/api/presentations" -H "Authorization: Bearer $W4_BRANDBOOK_KEY"
curl -sS "$BASE/api/presentations/k7m2q" -H "Authorization: Bearer $W4_BRANDBOOK_KEY"
curl -sS -X DELETE "$BASE/api/presentations/k7m2q" -H "Authorization: Bearer $W4_BRANDBOOK_KEY"
```

De lijst geeft geen markdown terug, ophalen wel.

## Fouten

| Status | Betekenis | Wat jij doet |
| --- | --- | --- |
| `400` | Ongeldige invoer; reden in `error` | Herstel en probeer opnieuw |
| `401` | Geen of ingetrokken sleutel | Zeg de gebruiker dat er een nieuwe sleutel nodig is op `/api.html` |
| `404` | Bestaat niet, of niet van deze eigenaar | Vraag naar het juiste id of de link |

## Permalinks

`/present/` plus 5 tekens: kleine letters en cijfers zonder `0 1 o i l`. Uit een link haal je het id
met het laatste padstuk.
