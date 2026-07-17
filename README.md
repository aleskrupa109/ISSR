# ISSŘ Maketa

Klikací maketa Informačního systému stavebního řízení (ISSŘ) pro testování a prezentace — pohled úředníka stavebního úřadu: příjem a kontrola dokumentu, kontrola příslušnosti, vedení řízení o povolení stavby, koordinované stanovisko a agendy dotčených orgánů. Maketa neběží proti žádnému reálnému systému; demo dokumenty jsou uloženy jako PDF ve složce `docs/`.

## Struktura projektu

```
ISSR/
├── index.html                    # Přihlašovací stránka
├── css/styles.css                # Styly pro index, detail-rizeni a kontrola-prislusnost
├── images/                       # Loga a podkladové obrázky (ÚRP, katastrální snímky, BIM)
├── docs/                         # Demo PDF dokumenty
│   ├── zadost/                   # PDF žádosti
│   ├── prilohy/                  # Přílohy žádosti (plné moci, pověření…)
│   ├── dokumentace/              # Projektová dokumentace (části A, B, C)
│   └── dokladova-cast/           # Dokladová část (stanoviska, vyjádření, souhlasy)
├── js/
│   ├── demo-helper.js            # Nápověda k prototypu (FAB, anotace, panel „O prototypu")
│   └── issr-case-header.js       # Sdílená hlavička případu (povoleni-3)
└── pages/
    ├── dashboard.html            # Nástěnka úředníka
    ├── zamery.html               # Přehled záměrů
    ├── detail-zameru.html        # Detail záměru
    ├── rizeni.html               # Přehled řízení
    ├── detail-rizeni.html        # Detail řízení s kontrolním panelem
    ├── dokumenty.html            # Seznam dokumentů
    ├── detail-dokumentu.html     # Detail dokumentu, kontrola, duplicity záměrů
    ├── kontrola-prislusnost.html # Kontrola příslušnosti
    ├── povoleni-2.html           # Řízení o povolení — kontrola žádosti (největší stránka)
    ├── povoleni-3.html           # Řízení o povolení — projednání
    ├── koordinator-1.html        # Koordinované stanovisko — koordinátor
    ├── ochrana-prirody-1.html    # Agenda DO — ochrana přírody
    ├── ochrana-lesa-1.html       # Agenda DO — ochrana lesa
    ├── doc-modals.js             # Sdílené modaly a prohlížeče dokumentů (žádost, přílohy, dokumentace, doklady)
    ├── issr-state.js             # Sdílený stav (localStorage)
    ├── role-switcher.js          # Přepínání rolí (úředník / koordinátor / DO)
    └── verejne-zajmy-shared.js   # Sdílený modul veřejných zájmů (povoleni-2, koordinator-1)
```

## Architektura

- **Sdílené moduly stránek** leží přímo v `pages/` a načítají se relativně (`<script src="doc-modals.js">`), moduly v `js/` cestou `../js/…`.
- **doc-modals.js** poskytuje modaly a vestavěné prohlížeče PDF; soubory hledá v `../docs/<podsložka>/` podle atributu `data-file`. Názvy v `data-file` musí přesně odpovídat souborům na disku (bez diakritiky — diakritika v názvech rozbíjí URL na GitHub Pages).
- **issr-state.js** drží stav kontrol a formulářů v localStorage, **role-switcher.js** přepíná pohledy rolí.
- **demo-helper.js** vykresluje na každé stránce plovoucí tlačítko Nápověda a vysvětlivky z `window.DEMO_CONFIG`.

## Lokální testování

Stačí otevřít `index.html` v prohlížeči. Pro korektní náhledy PDF v `<object>` doporučujeme lokální server:

```bash
python -m http.server 8000
# poté http://localhost:8000
```

## Publikování na GitHub Pages

1. Nahrajte obsah do repozitáře (root = tato složka).
2. Settings → Pages → Source: branch **main**, folder **/ (root)** → Save.
3. Maketa bude do 1–2 minut na `https://UZIVATEL.github.io/NAZEV-REPOZITARE/`.

## Přidání nových demo dokumentů

1. Uložte PDF do příslušné podsložky `docs/` — **bez diakritiky v názvu souboru**.
2. Přidejte položku do příslušného seznamu v `pages/doc-modals.js` (`embeddedPrilohy`, `embeddedDokumentace`, `embeddedDoklady`) — `data-file` musí odpovídat názvu souboru na disku.
3. Odkazuje-li na dokument strom dokladů v `povoleni-2.html` (`dokladyTree`), musí hodnota `soubor:` odpovídat témuž názvu.
