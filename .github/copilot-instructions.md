# Project Copilot Instructions

## Pravilo za kvarove i greske

- Kada nesto ne radi, ne izmisljati i ne dodavati nove podatke (u kodu, maperima, fallback vrednostima ili bazi).
- Umesto toga koristiti iskljucivo podatke koji stvarno postoje u API odgovoru/bazi i jasno prijaviti nedostajuce polje ili gresku.

## Obavezna lokalizacija (SR/EN/DE)

- Svaka nova stranica ili komponenta mora imati prevode na sva 3 jezika: `sr`, `en`, `de`.
- Nije dozvoljeno ostavljati hardkodovan korisnicki tekst u template-u bez i18n kljuca.
- Pri dodavanju novog UI teksta obavezno dodati odgovarajuci kljuc u:
  - `public/i18n/sr.json`
  - `public/i18n/en.json`
  - `public/i18n/de.json`
- U komponentama koristiti prevode preko `translate` pipe-a (ili `TranslateService` u TS kodu za poruke i potvrde).
- Toast poruke, confirm dialog poruke i validacione poruke takodje moraju ici kroz prevode na sva 3 jezika.
- PR/izmena nije kompletna dok svi novi tekstovi nisu prevedeni na sva 3 jezika.

## Kratka i18n check-lista za svaku novu komponentu

1. Dodati sve nove i18n kljuceve u `sr/en/de` JSON fajlove.
2. Zameniti hardkodovane stringove u template-u i TS kodu i18n kljucevima.
3. Proveriti da promena jezika (SR/EN/DE) menja sve nove tekstove bez fallback praznina.
