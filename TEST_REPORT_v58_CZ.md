# Gym Tracker Pro v58 – testovací report

## Architektura

- Aplikace: GitHub Pages
- Obrázky cviků: veřejný Supabase Storage bucket `exercise-guides`
- Verze obrázků: `v58`
- Database/Auth: stávající Supabase projekt

## Implementované změny

- 88 velkých návodů přesunuto na Supabase URL.
- 88 náhledů přesunuto na Supabase URL.
- `index.html` již neobsahuje Base64 WebP obrázky.
- Service worker ukládá cross-origin Supabase obrázky do samostatné offline cache.
- Dnešní náhledy a první dva návody se automaticky přednačítají.
- Přidán automatický test dostupnosti obrázků.
- Přidán banner při chybějícím nebo nenahraném bucketu.
- Přidáno tlačítko „Test obrázků Supabase“ v Nastavení.
- Zachovaná denní váha, týdenní průměr a týdenní pas.

## Upload balíček

- Windows uploader nevyžaduje Node ani npm.
- Klíč se zadává do skrytého PowerShell promptu.
- Skript vytvoří/aktualizuje veřejný bucket.
- Nahraje a následně ověří všech 176 souborů.
- SERVICE ROLE klíč není vložen do aplikace ani do upload souborů.

## Automatické kontroly

- JavaScript syntax: OK
- Service worker syntax: OK
- Cviky v databázi: 88
- Supabase URL v aplikaci: 176/176
- Upload manifest: 176/176
- App URL ↔ manifest shoda: OK
- WebP čitelnost: 176/176
- SHA-256 kontrola upload souborů: OK
- Base64 WebP v index.html: odstraněno
- Velikost obrázků: 4.6 MB
- Velikost nového index.html: 275 KB

## Omezení

Přímé nahrání do uživatelova Supabase projektu nebylo možné provést z tohoto prostředí bez administrátorského SERVICE ROLE klíče a síťového přístupu k projektu. Proto je připravený jednorázový bezpečný Windows uploader.
