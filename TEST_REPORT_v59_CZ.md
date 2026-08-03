# Gym Tracker Pro v59 – testovací report

## Opravená chyba

Na iPhonu byla v aktivním tréninku vidět pouze pravá polovina tlačítka mínus.
Starší pravidlo nastavovalo tlačítku šířku 58 px, zatímco novější mřížka
pro něj rezervovala pouze 44 px.

## Implementace

- skutečná šířka tlačítka odpovídá šířce jeho sloupce,
- plus i mínus jsou symetrické,
- prostřední input má `min-width: 0`,
- oprava je vložená jako poslední CSS pravidlo, takže přepisuje starší styly,
- zvláštní rozložení pro 390 px a 350 px.

## Kontroly

- JavaScript syntax: OK
- Service worker syntax: OK
- Statický mobilní layout 430px: OK (tlačítko 58px, střední pole 246px)
- Statický mobilní layout 390px: OK (tlačítko 52px, střední pole 220px)
- Statický mobilní layout 375px: OK (tlačítko 52px, střední pole 205px)
- Statický mobilní layout 350px: OK (tlačítko 46px, střední pole 194px)
- Statický mobilní layout 320px: OK (tlačítko 46px, střední pole 164px)
- CSS pořadí/cascade: OK
- ZIP integrita: kontrolována
- Supabase cesta `exercise-guides/v58`: beze změny

Poznámka: V tomto prostředí nebyl dostupný stabilní plný headless Chromium render,
proto byly ověřeny syntaxe, CSS cascade a rozměrové scénáře pro mobilní šířky.
