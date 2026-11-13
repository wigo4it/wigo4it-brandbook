# Brandbook

Woordenlijst van het Wigo4it-brandbook en zijn tools.

## Termen

**Presentatie**
Een opgeslagen deck: de markdown-bron plus de paneelopties. Wordt bij elke weergave opnieuw gerenderd met de actuele builder, dus een presentatie gaat mee met het brandbook en is geen bevroren momentopname.
_Niet:_ geëxporteerde HTML (dat is een **export**).

**Export**
Een zelfstandig HTML- of PDF-bestand dat uit een deck wordt gemaakt. Wordt niet opgeslagen of beheerd door het brandbook.

**Permalink**
Het vaste adres van een presentatie: `/present/<id>`, met een id van 5 tekens uit kleine letters en cijfers, zonder de verwarrende tekens `0`, `1`, `o`, `i` en `l`. Hoofdletters in een opgevraagd id worden als kleine letters gelezen. Het id blijft gelijk als de presentatie wordt vervangen.

**Eigenaar**
De persoon of map waar een presentatie bij hoort. Met wachtwoord-login is de eigenaar altijd **gedeeld**. Met SSO is het de ingelogde Entra-gebruiker.

**Gedeeld**
De gezamenlijke eigenaar uit de wachtwoordfase. Blijft bestaan na de overstap naar SSO: elke ingelogde gebruiker mag presentaties in `gedeeld` zien en beheren, en kan er een **overnemen** naar zichzelf.

**Zichtbaarheid**
**Publiek**: iedereen met de permalink kan de presentatie bekijken, zonder in te loggen. **Privé**: alleen de eigenaar kan hem bekijken (bij `gedeeld`: iedere ingelogde gebruiker).

**API-sleutel**
Een geheim waarmee een tool (bijvoorbeeld een AI-assistent) namens een eigenaar presentaties beheert, zonder browserlogin. Heeft een naam, kan worden ingetrokken en geeft precies de rechten van zijn eigenaar.
