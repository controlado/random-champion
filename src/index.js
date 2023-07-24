import { layerManager, request, addRoutines } from "https://cdn.skypack.dev/balaclava-utils@latest";
import "./assets/styles.css";

/**
 * @author balaclava
 * @name random-champion
 * @link https://github.com/controlado/random-champion
 * @description Pick and ban a random champion in champion select! 🐧
 */

async function setupElement(selector, attribute) {
    const iconsContainer = document.querySelector(selector);
    if (!iconsContainer || iconsContainer.hasAttribute(attribute)) { return; }
    iconsContainer.setAttribute(attribute, "true");
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
    setTooltip(randomChampionIcon, "top", "Select random champion in selected role.");
    return randomChampionIcon;
}

function setTooltip(element, position, text) {
    const tooltip = document.createElement("div");
    tooltip.setAttribute("id", "lol-uikit-tooltip-root");
    tooltip.classList.add("tooltip", "tooltip-random-champion");

    const tooltipContent = document.createElement("lol-uikit-tooltip");
    tooltipContent.setAttribute("data-tooltip-position", position);
    tooltipContent.setAttribute("type", "system");

    const tooltipBlock = document.createElement("lol-uikit-content-block");
    tooltipBlock.setAttribute("type", "tooltip-system");

    const tooltipText = document.createElement("p");
    tooltipText.innerText = text;

    tooltipBlock.appendChild(tooltipText);
    tooltipContent.appendChild(tooltipBlock);
    tooltip.appendChild(tooltipContent);

    element.onmouseenter = () => {
        const rect = element.getBoundingClientRect();
        tooltip.style.top = `${rect.top - 48}px`;
        tooltip.style.left = `${rect.left - 116}px`;
        layerManager.appendChild(tooltip);
    };

    element.onmouseleave = () => {
        layerManager.removeChild(tooltip);
    };
}

function getAvailableChampions() {
    const championsData = document.querySelectorAll(".champion-container > div > div > div > div");
    const championIds = [];

    for (const championData of championsData) {
        if (championData.parentNode.style.display || championData.hasAttribute("disabled")) { continue; }
        const championId = championData.getAttribute("data-id");
        if (championId !== "-2") { championIds.push(championId); }
    }

    return championIds;
}

window.addEventListener("load", () => {
    addRoutines(() => setupElement(".filter-icons", "random-champion-setup"));
    console.debug("random-champion: Report bugs to Balaclava#1912");
});
