# Gym Tracker Pro v60 – testovací report

## Změny

- Denní váha a týdenní pas jsou v rozbalovací kartě.
- Karta je standardně sbalená.
- Před uložením dnešní váhy je karta nahoře.
- Po uložení váhy se při novém renderu přesune pod plán a zůstane sbalená.
- Sbalené shrnutí ukazuje váhu, průměr týdne a stav pasu.
- Prázdný vstup se už nepřevádí na `0`.
- Staré nulové hodnoty jsou považované za neplatné.
- Přidána sanitizace desetinného vstupu s tečkou i čárkou.

## Kontroly

- JavaScript syntax: OK
- Service worker syntax: OK
- Prázdná hodnota → null: OK
- Nula → null: OK
- 88,4 → 88.4: OK
- Stará velká measurement karta odstraněna: OK
- ZIP integrita: kontrolována
- Supabase cesta `exercise-guides/v58`: beze změny
