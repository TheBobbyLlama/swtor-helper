const styleStorageToken = "SWTOR_Style";
const noteStorageToken = "SWTOR_Notes";
const sectionStorageToken = "SWTOR_Sections";
const emoteStorageToken = "SWTOR_Emotes";

const inputText = document.getElementById("text-input");
const outputText = document.getElementById("text-output");

const btnStyleRepublic = document.getElementById("button-style-republic");
const btnStyleEmpire = document.getElementById("button-style-empire");
const btnPanelBack = document.getElementById("button-panel-back");
const btnPanelForward = document.getElementById("button-panel-forward");
const btnCopyOutput = document.getElementById("button-copy-output");
const btnEmoteFree = document.getElementById("button-emote-free");
const btnEmoteSub = document.getElementById("button-emote-sub");
const btnEmoteMarket = document.getElementById("button-emote-market");
const btnEmoteUnlocked = document.getElementById("button-emote-unlocked");

const outputTracker = document.getElementById("output-tracker");

const notesField = document.getElementById("notes");
const emoteSection = document.getElementById("emote-display");

let docStyle = localStorage.getItem(styleStorageToken) || "empire";
let sectionStatus = localStorage.getItem(sectionStorageToken) || 0;
let emoteHidden = JSON.parse(localStorage.getItem(emoteStorageToken)) || [];

let textPrefix;
let textChunks;
let curPanel;

function setCurrentPanel(newPanel) {
	if ((newPanel < 0) || (newPanel >= textChunks.length)) {
		return;
	}

	curPanel = newPanel;

	if (curPanel > 0) {
		btnPanelBack.removeAttribute("disabled");
	} else {
		btnPanelBack.setAttribute("disabled", true);
	}

	if (curPanel < textChunks.length - 1) {
		btnPanelForward.removeAttribute("disabled");
	} else {
		btnPanelForward.setAttribute("disabled", true);
	}

	outputTracker.innerHTML = (curPanel + 1) + "/" + textChunks.length;

	let tmpOutput = textPrefix;

	if (curPanel > 0) {
		tmpOutput += "+ ";
	}

	tmpOutput += textChunks[curPanel];

	if (curPanel < textChunks.length - 1) {
		tmpOutput += " +";
	}

	outputText.value = tmpOutput;
}

function processInput(e) {
	if (e.target.value) {
		textPrefix = "/s ";
		let inputMe = e.target.value;
		textChunks = [];

		// Determine which slash prefix we should be using.
		if (inputMe.startsWith("/")) {
			textPrefix = inputMe.substring(0, inputMe.indexOf(" ") + 1);

			if (textPrefix.match(/^\/(e|ops|p|ra|s|y) $/g)?.length) {
				inputMe = inputMe.substring(textPrefix.length).trim();
			} else {
				if (textPrefix.length > 4) {
					textPrefix = "/e ";
					inputMe = inputMe.substring(1).trim();
				} else {
					inputMe = inputMe.substring(textPrefix.length).trim();
					textPrefix = "/s ";
				}
			}
		}

		let start = 0;
		let end = start + 253 - textPrefix.length;

		// Loop to break apart input text...
		while (end < inputMe.length - 1) {
			// Find end of last word, or if we can't, bite off the whole chunk.
			while (inputMe[end] !== " ") {
				end--;

				if (end === start) {
					end = start + 251 - textPrefix.length;
					break;
				}
			}

			textChunks.push(inputMe.substring(start, end).trim());

			// Set up the next go in the loop.
			start = end;

			while ((start < inputMe.length - 1) && (inputMe[start] === " ")) {
				start++;
			}

			end = start + 251 - textPrefix.length;
		}

		// Finally, grab the last piece.
		textChunks.push(inputMe.substring(start));

		setCurrentPanel(0);
		btnCopyOutput.removeAttribute("disabled");
	} else {
		btnPanelBack.setAttribute("disabled", true);
		btnPanelForward.setAttribute("disabled", true);
		btnCopyOutput.setAttribute("disabled", true);
		outputTracker.innerHTML = "0/0";
		outputText.value = "";
	}
}

function setDocStyle(newStyle) {
	docStyle = newStyle;
	document.body.className = newStyle;
	localStorage.setItem(styleStorageToken, newStyle);

	if (newStyle === "empire") {
		document.title = "Imperial Equinox RP Helper";
	} else {
		document.title = "Republic Equinox RP Helper";
	}
}

function initializeSections() {
	const closeButtons = document.querySelectorAll(".close-button button");

	closeButtons.forEach((element, index) => {
		element.addEventListener("click", () => { toggleSection(index); });

		if (sectionStatus & (1 << index)) {
			toggleSection(index, false);
		}
	});
}

function toggleSection(index, doUpdate = true) {
	const currentSection = document.querySelectorAll(".close-button")[index].parentElement;
	const currentClasses = currentSection.className.split(" ");

	if (currentClasses.indexOf("closed") > -1) {
		currentSection.className = currentClasses.filter(element => element !== "closed").join(" ");
		currentSection.querySelector(".close-button button").innerHTML = "-";

		sectionStatus &= ~(1 << index);
	} else {
		currentSection.className = currentClasses.join(" ") + " closed";
		currentSection.querySelector(".close-button button").innerHTML = "+";

		sectionStatus |= (1 << index);
	}

	if (doUpdate) {
		localStorage.setItem(sectionStorageToken, sectionStatus);
	}
}

function setEmoteDisplay() {
	[ "Free", "Sub", "Market", "Unlocked" ].forEach(emoteType => {
		if (emoteHidden.indexOf(emoteType) > -1) {
			emoteSection.setAttribute("hide" + emoteType, emoteHidden.length);
		} else {
			emoteSection.removeAttribute("hide" + emoteType);
		}
	})
}

function toggleEmoteType(emoteType) {
	if (emoteHidden.indexOf(emoteType) > -1) {
		emoteHidden = emoteHidden.filter(emote => emote !== emoteType);
	} else {
		emoteHidden.push(emoteType);
	}

	setEmoteDisplay();

	localStorage.setItem(emoteStorageToken, JSON.stringify(emoteHidden));
}

btnStyleRepublic.addEventListener("click", () => { setDocStyle("republic") });
btnStyleEmpire.addEventListener("click", () => { setDocStyle("empire") });

inputText.addEventListener("change", processInput);

btnPanelBack.addEventListener("click", () => { setCurrentPanel(curPanel - 1); });
btnPanelForward.addEventListener("click", () => { setCurrentPanel(curPanel + 1); });
btnCopyOutput.addEventListener("click", () => { navigator.clipboard.writeText(outputText.value); });

notesField.value = localStorage.getItem(noteStorageToken);

notesField.addEventListener("change", () => { localStorage.setItem(noteStorageToken, notesField.value); });

btnEmoteFree.addEventListener("click", () => { toggleEmoteType("Free") });
btnEmoteSub.addEventListener("click", () => { toggleEmoteType("Sub") });
btnEmoteMarket.addEventListener("click", () => { toggleEmoteType("Market") });
btnEmoteUnlocked.addEventListener("click", () => { toggleEmoteType("Unlocked") });

setDocStyle(docStyle);
initializeSections();
setEmoteDisplay();