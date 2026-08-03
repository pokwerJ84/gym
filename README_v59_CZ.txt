GYM TRACKER PRO v59 – OPRAVA TLAČÍTKA MÍNUS NA IPHONU

Opraveno:
- Tlačítko mínus v aktivním tréninku už není oříznuté.
- Plus a mínus mají stejnou rezervovanou i skutečnou šířku.
- Prostřední pole pro kg/opakování se může bezpečně zmenšit.
- Oprava platí pro váhu, opakování a jednostranné cviky.
- Přidané rozložení pro iPhone 390 px, 350 px a užší.

Příčina:
Starší mobilní CSS nastavovalo tlačítku šířku 58 px, zatímco novější
mřížka pro něj rezervovala jen 44 px. Tlačítko proto přetékalo doleva.

Supabase obrázky zůstávají ve složce exercise-guides/v58.
