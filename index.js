import { addRoutines, request } from "../controladoUtils";
import "./assets/styles.css";

/**
 * @author balaclava
 * @name random-champion
 * @link https://github.com/controlado/random-champion
 * @description Pick and ban a random champion in champion select.
 */

async function setupElement(selector) {
    const iconsContainer = document.querySelector(selector);
    if (!iconsContainer || iconsContainer.hasAttribute("random-champion-setup")) { return; }

    iconsContainer.setAttribute("random-champion-setup", "true");
    iconsContainer.insertBefore(newButton(), iconsContainer.firstChild);
}

function newButton() {
    const randomChampionIcon = document.createElement("div");
    randomChampionIcon.classList.add("filter", "reroll-champion-button");
    randomChampionIcon.onclick = async () => {
        const [ownedChampionsRes, championSelectRes] = await Promise.all([
            request("GET", "/lol-champ-select/v1/pickable-champion-ids"),
            request("GET", "/lol-champ-select/v1/session")
        ]);
        const [ownedChampions, championSelect] = await Promise.all([
            ownedChampionsRes.json(),
            championSelectRes.json()
        ]);
        for (const action of championSelect.actions) {
            for (const subAction of action) {
                if (subAction.completed === false && subAction.actorCellId === championSelect.localPlayerCellId) {
                    const body = { championId: ownedChampions[Math.floor(Math.random() * ownedChampions.length)] };
                    const selectRes = await request("PATCH", `/lol-champ-select/v1/session/actions/${subAction.id}`, { body });
                    if (selectRes.ok) {
                        return;
                    }
                }
            }
        }
    };
    return randomChampionIcon;
}

window.addEventListener("load", function () {
    addRoutines(() => {
        setupElement(".filter-icons");
    });
});