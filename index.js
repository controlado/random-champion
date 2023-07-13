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
        const pickableChampions = getAvailableChampions();
        const championSelectRes = await request("GET", "/lol-champ-select/v1/session");
        const championSelect = await championSelectRes.json();
        for (const action of championSelect.actions) {
            for (const subAction of action) {
                if (subAction.completed === false && subAction.actorCellId === championSelect.localPlayerCellId) {
                    const body = { championId: pickableChampions[Math.floor(Math.random() * pickableChampions.length)] };
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

function getAvailableChampions() {
    const championsData = document.querySelectorAll(".champion-container > div > div > div > div");
    const championIds = [];

    for (const championData of championsData) {
        if (championData.parentElement.style.display) { continue; }
        const championId = championData.getAttribute("data-id");
        if (championId !== "-2") { championIds.push(championId); }
    }

    return championIds;
}

window.addEventListener("load", function () {
    addRoutines(() => {
        setupElement(".filter-icons");
    });
});
