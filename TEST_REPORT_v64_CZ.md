# Gym Tracker Pro v64 – testovací report

## Příčina chyby

V63 používala pro karty částí těla relativní soubory `assets/categories/*.webp`. Když složka `assets` nebyla na GitHub Pages dostupná nebo zůstala stará cache, karty se zobrazily bez obrázků.

## Oprava

- 10 obrázků částí těla je vloženo přímo do `index.html` jako WebP Data URI.
- Aplikace už pro tyto obrázky nepotřebuje složku `assets`.
- Do Supabase se nemusí nic nového nahrávat.
- Opravena Historie tréninků (`window.history` konflikt).
- Doplněna chybějící funkce `showToast()`.

## Kontroly

- JavaScript syntax: OK
- Service worker syntax: OK
- Vložené obrázky kategorií: 10/10
- Odkazy na `assets/categories`: 0
- ZIP integrita: OK
