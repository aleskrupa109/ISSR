/**
 * issr-state.js
 * Sdílený stavový modul pro ISSŘ prototyp — localStorage persistence.
 *
 * Umožňuje synchronizaci stavu VZ workflow mezi různými rolemi/stránkami:
 *   - povoleni-2.html (úředník / zpracovatel)
 *   - koordinator-1.html (koordinátor)
 *   - ochrana-prirody-1.html, ochrana-lesa-1.html (DO přispěvatelé)
 *
 * Stavy se ukládají do localStorage a čtou při otevření/refreshi stránky.
 *
 * Použití:
 *   <script src="issr-state.js"></script>   // PŘED verejne-zajmy-shared.js
 *   ...
 *   ISSRState.getPhase()           // 'ready' | 'sent' | 'kontrola' | 'vyjadreni' | 'done'
 *   ISSRState.setPhase('sent')
 *   ISSRState.getDO('PAK')         // { dotcenost: 'dotcen', podklady: 'kompletni', ... }
 *   ISSRState.updateDO('PAK', { dotcenost: 'dotcen' })
 *   ISSRState.reset()              // smaže vše, vrátí výchozí stav
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'issr_vz_state';
    var VERSION = 1;

    // Úseky DO — klíč pro identifikaci v celém systému
    var DO_USEKY = ['PAK', 'LES', 'VOD', 'PAM', 'ODP', 'HYG', 'UUP', 'ZAV'];

    /** Výchozí stav jednoho DO */
    function defaultDOState() {
        return {
            // Fáze: Kontrola podkladů (posouzení dotčenosti)
            dotcenost: null,         // 'dotcen' | 'nedotcen' | null
            podklady: null,          // 'kompletni' | 'chybi' | null
            podkladyMissing: '',     // text — jaké podklady chybí
            forma: null,             // 'interni' | 'externi' | 'prilozeno' | null
            kontrolaNote: '',        // poznámka ke kontrole
            kontrolaSaved: false,    // rozpracováno (uloženo, ale neodesláno)
            kontrolaSubmitted: false,// odesláno koordinátorovi

            // Fáze: Vyjádření
            vyrok: null,             // 'souhlas' | 'nesouhlas' | null
            podminky: '',            // text podmínek
            oduvodneni: '',          // text odůvodnění
            vyjadreniSaved: false,   // rozpracováno
            vyjadreniSubmitted: false // odesláno
        };
    }

    /** Výchozí stav celého workflow */
    function defaultState() {
        var state = {
            version: VERSION,
            workflow: {
                phase: 'ready'  // ready → sent → kontrola → vyjadreni → done
            },
            dos: {},
            views: {}  // stav jednotlivých pohledů (officer, coordinator, ...)
        };
        DO_USEKY.forEach(function (usek) {
            state.dos[usek] = defaultDOState();
        });
        return state;
    }

    /** Načte stav z localStorage */
    function getState() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                // Kontrola verze
                if (parsed.version === VERSION) {
                    // Doplnit chybějící DO
                    DO_USEKY.forEach(function (usek) {
                        if (!parsed.dos[usek]) parsed.dos[usek] = defaultDOState();
                    });
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('ISSRState: nepodařilo se načíst stav', e);
        }
        return defaultState();
    }

    /** Uloží stav do localStorage */
    function saveState(state) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('ISSRState: nepodařilo se uložit stav', e);
        }
    }

    /** Smaže stav, vrátí výchozí */
    function resetState() {
        localStorage.removeItem(STORAGE_KEY);
        return defaultState();
    }

    /** Vrátí stav jednoho DO */
    function getDOState(usek) {
        var state = getState();
        return state.dos[usek] || defaultDOState();
    }

    /** Aktualizuje stav jednoho DO (merge) */
    function updateDOState(usek, updates) {
        var state = getState();
        if (!state.dos[usek]) state.dos[usek] = defaultDOState();
        var keys = Object.keys(updates);
        for (var i = 0; i < keys.length; i++) {
            state.dos[usek][keys[i]] = updates[keys[i]];
        }
        saveState(state);
        return state.dos[usek];
    }

    /** Vrátí aktuální fázi workflow */
    function getPhase() {
        return getState().workflow.phase;
    }

    /** Nastaví fázi workflow */
    function setPhase(phase) {
        var state = getState();
        state.workflow.phase = phase;
        saveState(state);
    }

    /**
     * Aplikuje uložený stav DO na data z VZ_BROADCAST_DOS.
     * Vrátí nový objekt s přepsanými dynamickými poli.
     */
    function applyDOStateToEntry(doEntry) {
        var usek = doEntry.usek;
        if (!usek) return doEntry;
        var s = getDOState(usek);

        // Kopie entry
        var out = {};
        var entryKeys = Object.keys(doEntry);
        for (var i = 0; i < entryKeys.length; i++) {
            out[entryKeys[i]] = doEntry[entryKeys[i]];
        }

        // Přepsat kontrola stav
        if (s.kontrolaSubmitted || s.kontrolaSaved) {
            if (s.dotcenost === 'dotcen') {
                out.kontrola = 'dotcen';
                out.kontrolaForma = s.forma || out.kontrolaForma;
            } else if (s.dotcenost === 'nedotcen') {
                out.kontrola = 'nedotcen';
            }
            // poznámka
            if (s.kontrolaNote) out.kontrolaNote = s.kontrolaNote;
        }

        // Přepsat vyjadreni stav
        if (s.vyjadreniSubmitted) {
            out.vyjadreni = 'hotovo';
            out.vyjadreniNote = s.oduvodneni || s.kontrolaNote || out.vyjadreniNote;
        } else if (s.vyjadreniSaved) {
            out.vyjadreni = 'ceka'; // rozpracováno
        } else if (s.kontrolaSubmitted && s.dotcenost === 'dotcen') {
            out.vyjadreni = 'ceka'; // kontrola hotová, vyjádření čeká
        }

        return out;
    }

    /**
     * Vrátí true, pokud je stav v localStorage neprázdný (existují nějaká uložená data).
     */
    function hasState() {
        try {
            return localStorage.getItem(STORAGE_KEY) !== null;
        } catch (e) {
            return false;
        }
    }

    /**
     * Uloží stav pohledu (view) — generické úložiště pro libovolnou stránku.
     * @param {string} viewId - identifikátor pohledu ('officer', 'coordinator', ...)
     * @param {object} data - data k uložení
     */
    function setView(viewId, data) {
        var state = getState();
        if (!state.views) state.views = {};
        state.views[viewId] = data;
        saveState(state);
    }

    /**
     * Načte stav pohledu.
     * @param {string} viewId - identifikátor pohledu
     * @returns {object|null}
     */
    function getView(viewId) {
        var state = getState();
        return (state.views && state.views[viewId]) || null;
    }

    // Globální API
    window.ISSRState = {
        get: getState,
        save: saveState,
        reset: resetState,
        getDO: getDOState,
        updateDO: updateDOState,
        getPhase: getPhase,
        setPhase: setPhase,
        applyToEntry: applyDOStateToEntry,
        hasState: hasState,
        defaultDO: defaultDOState,
        getView: getView,
        setView: setView,
        DO_USEKY: DO_USEKY,
        STORAGE_KEY: STORAGE_KEY
    };

})();
