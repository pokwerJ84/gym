# Gym Tracker Pro v64 – podrobný testovací report

## Opravené chyby

### 1. Historie tréninků

Původní kód zapisoval do `history.innerHTML`, což kolidovalo s vestavěným
objektem prohlížeče `window.history`.

Oprava:

- používá se `document.getElementById("history")`,
- silové tréninky se zobrazují,
- kardio záznamy se zobrazují,
- částečné tréninky mají vlastní štítek,
- u kardia se zobrazí správná hodnota i jednotka.

### 2. Chybějící `showToast()`

Přidána kompletní toast komponenta:

- potvrzení uložení váhy,
- potvrzení uložení pasu,
- potvrzení uložení kardia,
- potvrzení upravené série,
- potvrzení částečného nebo dokončeného tréninku,
- automatické skrytí.

### 3. Částečné tréninky

- Trénink bez jediné uložené série nelze uložit.
- Před uložením se zobrazí počet hotových a plánovaných sérií.
- Nedokončený trénink se uloží jako `partial`.
- Částečný trénink se nezapočítává do cíle 3/3.
- Částečný trénink neposouvá rotaci Síla → Stabilita → Kontrola.
- V týdenním kalendáři se zobrazí symbolem `◐`.
- V Historii je štítek „Částečný“ a počet sérií.

### 4. Kardio

Metrika se mění podle vybraného typu:

- běžecký pás a chůze: rychlost v km/h,
- rotoped a eliptický trenažér: úroveň / odpor,
- schodový trenažér: úroveň,
- veslovací trenažér: tempo / intenzita,
- jiné kardio: intenzita.

## Zachované funkce

- 88 cviků,
- 176 Supabase URL pro návody a náhledy,
- 10 nových obrázků svalových kategorií,
- tmavé karty cviků po otevření kategorie,
- denní váha a týdenní průměr,
- pas jednou týdně,
- flexibilní přesun tréninku,
- oprava tlačítka mínus na iPhonu,
- offline service worker.

## Provedené kontroly

### Statické kontroly

- JavaScript syntax: OK
- Service worker syntax: OK
- Konfliktní `history.innerHTML`: odstraněno
- `showToast()` je definovaná: OK
- Databáze cviků: 88/88
- Supabase URL: 176/176
- Obrázky kategorií: 10/10
- Manifest: OK

### Logické scénáře

- rotoped používá úroveň/odpor: OK
- pás používá km/h: OK
- kardio se nepočítá jako silový trénink: OK
- partial se nepočítá do 3/3: OK
- partial neposouvá rotaci: OK
- celý trénink posouvá rotaci: OK
- partial marker v kalendáři: OK
- výpočet dokončených sérií: OK
- Historie vykreslí partial: OK
- Historie vykreslí kardio metriku: OK

### Vizuální komponentové testy v Chromium 390 × 844

- toast je viditelný: OK
- text toastu: OK
- kardio label pro rotoped: OK
- jednotka pro rotoped: OK
- partial štítek v Historii: OK
- kardio hodnota v Historii: OK
- runtime chyby komponent: 0

## Omezení

Bez přístupu k fyzickému iPhonu nebylo možné ověřit skutečnou starou PWA cache
na tvém telefonu. Živý Supabase login a cloudový přenos nebyly během testu
použity. Struktura všech Supabase URL, stavová logika a service worker byly
zkontrolovány.

## Výsledek

Všechny konkrétní chyby a upozornění z předchozího reportu byly opraveny.
