# Gym Tracker Pro v56 – podrobný testovací report

## Opravy a změny

### Načítání obrázků na telefonu

- Původní service worker se při instalaci pokoušel stáhnout všech 176 obrázků jedním krokem. Selhání jediného souboru mohlo zablokovat celou aktualizaci PWA.
- v56 při instalaci ukládá pouze základ aplikace, manifest a ikony.
- Obrázky cviků se načítají postupně při otevření a potom se ukládají do runtime cache pro offline použití.
- Neúspěšně načtený obrázek se nahradí čitelnou kartou. Klepnutím na kartu se cache daného obrázku odstraní a načtení zopakuje.
- Přidána viditelná verze aplikace, kontrola aktualizace a aktualizační banner.

### Tréninkový kalendář

- Kardio se již nepočítá mezi silové tréninky.
- Tečka znamená doporučený silový den, srdce uložené kardio a fajfka dokončený silový trénink.
- Volný den již není označen zavádějícím plusem.
- Přidán předchozí týden, další týden a návrat na dnešek.
- Přesun rozpracovaného tréninku na jiné datum vyžaduje potvrzení.
- Po dokončení aplikace vybere další trénink v rotaci a nejbližší doporučený silový den.
- Když vynecháš středu, Stabilita zůstane další v pořadí a lze ji odcvičit ve čtvrtek.

### Zjednodušení rozhraní

- Hlavní obrazovka má tři hlavní akce: Zahájit trénink, Jen kardio, Změnit datum.
- Seznam cviků je ve výchozím stavu sbalený pod „Zobrazit cviky“.
- Tréninky jsou označené jako rotace 1 Síla, 2 Stabilita, 3 Kontrola.
- Na kartě zůstává pouze první cvik, čas, počet cviků a stav připravenosti.
- Spodní navigace je nižší a méně zakrývá hlavní tlačítka na telefonu.

## Automatické kontroly souborů

- JavaScript syntax: OK
- Service worker syntax: OK
- ZIP integrita: OK
- Databáze: 88 cviků
- Velké návody: 88/88
- Náhledy: 88/88
- HTTP test obrázků: 176/176 odpovědělo stavem 200 a správným image content-type
- `cache.addAll()` odstraněno
- Obrázky nejsou součástí instalačního pre-cache seznamu

## Testy v mobilním Chromium – 390 × 844, časové pásmo Asia/Tokyo

- Aplikace se spustila bez JavaScript runtime chyby: OK
- Datum na zařízení v Japonsku: pondělí 3. srpna 2026 – OK
- Tři hlavní akce jsou dostupné: OK
- Plán je při spuštění sbalený: OK
- Rozbalení plánu: OK
- Náhledy aktuálního tréninku: 8/8 načteno
- Otevření obrázkového návodu: OK
- Velký obrázek Hack Squat: načten
- Uložení týdenního měření a odemčení Start: OK
- Spuštění živého tréninku: OK
- Obrázek v živém tréninku: načten
- Přesun rozpracovaného tréninku z pondělí na čtvrtek po potvrzení: OK
- Uložení 25 minut kardia a zobrazení srdce v kalendáři: OK
- Kardio nezvýšilo počítadlo silových tréninků: OK
- Předchozí a další týden: OK
- Tlačítko Aktualizovat aplikaci a číslo verze: OK

## Test chybějícího obrázku

- Simulovaná odpověď 404 pro Hack Squat thumbnail.
- Aplikace zobrazila náhradní obrázek bez pádu stránky.
- Po obnovení souboru a klepnutí se obrázek znovu načetl: OK

## Omezení

Service worker byl staticky a syntakticky ověřen, ale bezpečnostní omezení testovacího prostředí nedovolila spustit PWA pod běžnou veřejnou HTTPS adresou. Stav staré cache na konkrétním iPhonu nelze vzdáleně přečíst. Po nahrání v56 na GitHub Pages aplikaci jednou otevři v Safari a v Nastavení použij „Aktualizovat aplikaci“.
