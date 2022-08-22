var Generators = {
	advancement: {
		new(elm) {
			elm.data = {
				display: {
					icon: {}
				},
				criteria: {
					requirement: {
						conditions: {}
					}
				},
				rewards: {
					recipes: [],
					loot: []
				}
			};
		},
		init(elm) {
			document.getElementById("edit-advancement-icon-item").setAttribute("value", elm.data.display.icon.item || "minecraft:air");
			ItemPicker.initItemInput(document.getElementById("edit-advancement-icon-item"));
			document.getElementById("edit-advancement-icon-nbt").value = elm.data.display.icon.nbt || "";
			document.getElementById("edit-advancement-title").value = elm.data.display.title || "";
			document.getElementById("edit-advancement-desc").value = elm.data.display.description || "";
			document.querySelector(`#edit-advancement-frame [value=${elm.data.display.frame || "task"}]`).setAttribute("selected", "");
			document.getElementById("edit-advancement-parent").value = elm.data.parent || "";
			if (elm.data.display.announce_to_chat == false)
				document.getElementById("edit-advancement-announce-to-chat").removeAttribute("checked");
			if (elm.data.display.hidden)
				document.getElementById("edit-advancement-hidden").setAttribute("checked", "");
			document.querySelector(`#edit-advancement-criteria [value="${elm.data.criteria.requirement.trigger || "minecraft:impossible"}"]`).setAttribute("selected", "");
			Generators.advancement.newCriteriaEditor(elm);
			document.getElementById("edit-advancement-rewards-loot").value = elm.data.rewards.loot.join("\n") || "";
			document.getElementById("edit-advancement-rewards-recipes").value = elm.data.rewards.recipes.join("\n") || "";
			document.getElementById("edit-advancement-rewards-xp").value = elm.data.rewards.experience || 0;
			document.getElementById("edit-advancement-rewards-function").value = elm.data.rewards.function || "";
		},
		compile(elm) {
			elm.data = {
				display: {
					icon: {
						item: document.getElementById("edit-advancement-icon-item").getAttribute("value") || undefined,
						nbt: document.getElementById("edit-advancement-icon-nbt").value || undefined
					},
					title: document.getElementById("edit-advancement-title").value,
					frame: document.getElementById("edit-advancement-frame").value,
					description: document.getElementById("edit-advancement-desc").value,
					announce_to_chat: Boolean(document.getElementById("edit-advancement-announce-to-chat").checked),
					hidden: Boolean(document.getElementById("edit-advancement-hidden").checked),
					background: document.getElementById("edit-advancement-parent").value ? document.getElementById("edit-advancement-background").value : undefined
				},
				parent: document.getElementById("edit-advancement-parent").value || undefined,
				criteria: {
					requirement: {
						trigger: document.getElementById("edit-advancement-criteria").value,
						conditions: Generators.advancement.criteriaEditor.getValue()
					}
				},
				rewards: {
					loot: document.getElementById("edit-advancement-rewards-loot").value.split("\n"),
					recipes: document.getElementById("edit-advancement-rewards-recipes").value.split("\n"),
					function: document.getElementById("edit-advancement-rewards-function").value || undefined,
					experience: parseInt(document.getElementById("edit-advancement-rewards-xp").value) || undefined
				}
			}
		},
		save(folder, elm) {
			folder.folder("advancements").file(elm.name + ".json", JSON.stringify(elm.data, null, "\t"));
		},
		newCriteriaEditor(elm) {
			document.getElementById("edit-advancement-criteria-conditions").innerHTML = "";
			Generators.advancement.criteriaEditor = new JSONEditor(document.getElementById("edit-advancement-criteria-conditions"), {
				disable_edit_json: true,
				disable_properties: true,
				schema: {
					type: "object",
					title: "Conditions",
					properties: {
						"minecraft:impossible": {},
						"minecraft:tick": {},
						"minecraft:placed_block": {
							block: {
								type: "string",
								default: elm.data.criteria.requirement.conditions.block || ""
							}
						},
						"minecraft:enter_block": {
							block: {
								type: "string",
								default: elm.data.criteria.requirement.conditions.block || ""
							}
						},
						"minecraft:levitation": {
							duration: {
								type: "number",
								default: elm.data.criteria.requirement.conditions.duration || 0
							}
						},
						"minecraft:item_durability_changed": {
							durability: {
								type: "number",
								default: elm.data.criteria.requirement.conditions.durability || 0
							},
							delta: {
								type: "number",
								default: elm.data.criteria.requirement.conditions.delta || 0
							}
						}
					}[elm.data.criteria.requirement.trigger || "minecraft:impossible"]
				}
			});
		},
		enableRootBackgroundInput(enable = true) {
			if (enable) {
				document.getElementById("edit-advancement-background").setAttribute("disabled", "");
			}
			else {
				document.getElementById("edit-advancement-background").removeAttribute("disabled");
			}
		}
	},
	function: {
		new(elm) {
			elm.data = new String;
		},
		init(elm) {
			document.getElementById("edit-function-text").value = elm.data ?? null;
		},
		compile(elm) {
			elm.data = document.getElementById("edit-function-text").value;
		},
		save(folder, elm) {
			folder.folder("functions").file(elm.name + ".mcfunction", elm.data);
		}
	},
	predicate: {
		new(elm) {
			elm.data = new Array;
		},
		init(elm) {
			elm.data.forEach(predicate => {
				Generators.predicate.newPredicateItem(predicate);
			});
		},
		compile(elm) {
			elm.data = new Array;
			document.querySelectorAll(".edit-predicate-predicate").forEach(predicate => {
				elm.data.push(Generators.predicate.domToPredicate(predicate));
			});
		},
		save(folder, elm) {
			folder.folder("predicates").file(elm.name + ".json", JSON.stringify(elm.data, null, "\t"));
		},
		newPredicateItem(data = new Object) {
			var predicateElm = document.createElement("li");
			predicateElm.className = "edit-predicate-predicate";
			predicateElm.setAttribute("condition", data.condition);
			predicateElm.innerHTML = `<p class=gray>${document.querySelector(`#edit-predicate-new [value="${data.condition}"]`).innerHTML}</p>`;
			switch (data.condition) {
				case "random_chance":
				predicateElm.innerHTML += `
					Chance:
					<br>
					<input type=range class=edit-predicate-predicate-random-chance min=0 max=1 step=any value=${data.chance ?? 1}>
				`;
				break;
				case "random_chance_with_looting":
				predicateElm.innerHTML += `
					Chance:
					<br>
					<input type=range class=edit-predicate-predicate-random-chance min=0 max=1 step=any value=${data.chance ?? 1}>
					<br>
					Looting multiplier:
					<br>
					<input type=range class=edit-predicate-predicate-random-chance-looting min=0 max=1 step=any value=${data.looting_multiplier ?? 1}>
				`;
				break;
				case "killed_by_player":
				predicateElm.innerHTML += `
					Inverse?
					<input type=checkbox class=edit-predicate-predicate-killed-by-player-inverse${data.inverse ? " checked" : ""}>
				`;
				break;
				case "time_check":
				predicateElm.innerHTML += `
					Modulus: <i class=gray>Unit: ticks</i> <input type=checkbox class=edit-predicate-predicate-time-check-mod-enable${data.period ? " checked" : ""}>
					<input type=number class=edit-predicate-predicate-time-check-mod min=0 value=${data.period || 0}>
					<br>
					From: <i class=gray>Unit: ticks</i>
					<input type=number class=edit-predicate-predicate-time-check-from min=0 value=${data.value ? (data.value.min || 0) : 0}>
					<br>
					To: <i class=gray>Unit: ticks</i>
					<input type=number class=edit-predicate-predicate-time-check-to min=0 value=${data.value ? (data.value.max || 0) : 0}>
				`;
				break;
				case "weather_check":
				predicateElm.innerHTML += `
					Status: <select class=edit-predicate-predicate-weather-check>
						<option value=0>Clear</option>
						<option value=1${data.raining ? " selected" : ""}>Rain</option>
						<option value=2${data.thundering ? " selected" : ""}>Thunder</option>
					</select>
				`;
				break;
			}
			document.getElementById("edit-predicate-predicates").appendChild(predicateElm);
		},
		domToPredicate(dom) {
			var type = dom.getAttribute("condition");
			switch (type) {
				case "random_chance":
				return {
					condition: type,
					chance: parseInt(dom.querySelector(".edit-predicate-predicate-random-chance"))
				};
				case "random_chance_with_looting":
				return {
					condition: type,
					chance: parseInt(dom.querySelector(".edit-predicate-predicate-random-chance")),
					looting_multiplier: parseInt(dom.querySelector(".edit-predicate-predicate-random-chance-looting"))
				};
				case "killed_by_player":
				return {
					condition: type,
					inverse: Boolean(dom.querySelector(".edit-predicate-predicate-killed-by-player-inverse"))
				};
				case "time_check":
				return {
					condition: type,
					value: {
						min: parseInt(dom.querySelector(".edit-predicate-predicate-time-check-from").value),
						max: parseInt(dom.querySelector(".edit-predicate-predicate-time-check-to").value)
					},
					period: dom.querySelector(".edit-predicate-predicate-time-check-mod-enable").checked ? (parseInt(dom.querySelector(".edit-predicate-predicate-time-check-mod").value) || 24000) : undefined
				};
				case "weather_check":
				return {
					condition: type,
					raining: dom.querySelector(".edit-predicate-predicate-weather-check").value == "1",
					thundering: dom.querySelector(".edit-predicate-predicate-weather-check").value == "2"
				};
				default:
				return {
					condition: type
				};
			}
		}
	},
	recipe: {
		new(elm) {
			elm.data = {type: "minecraft:crafting_shaped", group: ""};
		},
		init(elm) {
			document.querySelector(`#edit-recipe-type [value="${elm.data.type}"]`).setAttribute("selected", "");
			document.getElementById("edit-recipe-group").value = elm.data.group;
			Generators.recipe.generateRecipeEditor(elm.data);
		},
		compile(elm) {
			elm.data.type = document.getElementById("edit-recipe-type").value;
			elm.data.group = document.getElementById("edit-recipe-group").value;
			switch (elm.data.type) {
				case "minecraft:blasting":
				case "minecraft:campfire_cooking":
				case "minecraft:smelting":
				case "minecraft:smoking":
				Object.assign(elm.data, {
					ingredient: {
						item: document.getElementById("edit-recipe-crafting-ingredient").getAttribute("value")
					},
					result: document.getElementById("edit-recipe-crafting-result").getAttribute("value"),
					experience: parseFloat(document.getElementById("edit-recipe-xp").value),
					cookingtime: parseInt(document.getElementById("edit-recipe-cooking-time").value)
				});
				break;
				case "minecraft:crafting_shaped":
				elm.data = {
					type: elm.data.type,
					group: elm.data.group,
					pattern: [
						((document.getElementById("edit-recipe-crafting-table-1").getAttribute("value") == "minecraft:air") ? " " : "0") +
						((document.getElementById("edit-recipe-crafting-table-2").getAttribute("value") == "minecraft:air") ? " " : "1") +
						((document.getElementById("edit-recipe-crafting-table-3").getAttribute("value") == "minecraft:air") ? " " : "2"),
						((document.getElementById("edit-recipe-crafting-table-4").getAttribute("value") == "minecraft:air") ? " " : "3") +
						((document.getElementById("edit-recipe-crafting-table-5").getAttribute("value") == "minecraft:air") ? " " : "4") +
						((document.getElementById("edit-recipe-crafting-table-6").getAttribute("value") == "minecraft:air") ? " " : "5"),
						((document.getElementById("edit-recipe-crafting-table-7").getAttribute("value") == "minecraft:air") ? " " : "6") +
						((document.getElementById("edit-recipe-crafting-table-8").getAttribute("value") == "minecraft:air") ? " " : "7") +
						((document.getElementById("edit-recipe-crafting-table-9").getAttribute("value") == "minecraft:air") ? " " : "8")
					],
					key: {
						0: (document.getElementById("edit-recipe-crafting-table-1").getAttribute("value") == "minecraft:air") ? undefined : {item: document.getElementById("edit-recipe-crafting-table-1").getAttribute("value")},
						1: (document.getElementById("edit-recipe-crafting-table-2").getAttribute("value") == "minecraft:air") ? undefined : {item: document.getElementById("edit-recipe-crafting-table-2").getAttribute("value")},
						2: (document.getElementById("edit-recipe-crafting-table-3").getAttribute("value") == "minecraft:air") ? undefined : {item: document.getElementById("edit-recipe-crafting-table-3").getAttribute("value")},
						3: (document.getElementById("edit-recipe-crafting-table-4").getAttribute("value") == "minecraft:air") ? undefined : {item: document.getElementById("edit-recipe-crafting-table-4").getAttribute("value")},
						4: (document.getElementById("edit-recipe-crafting-table-5").getAttribute("value") == "minecraft:air") ? undefined : {item: document.getElementById("edit-recipe-crafting-table-5").getAttribute("value")},
						5: (document.getElementById("edit-recipe-crafting-table-6").getAttribute("value") == "minecraft:air") ? undefined : {item: document.getElementById("edit-recipe-crafting-table-6").getAttribute("value")},
						6: (document.getElementById("edit-recipe-crafting-table-7").getAttribute("value") == "minecraft:air") ? undefined : {item: document.getElementById("edit-recipe-crafting-table-7").getAttribute("value")},
						7: (document.getElementById("edit-recipe-crafting-table-8").getAttribute("value") == "minecraft:air") ? undefined : {item: document.getElementById("edit-recipe-crafting-table-8").getAttribute("value")},
						8: (document.getElementById("edit-recipe-crafting-table-9").getAttribute("value") == "minecraft:air") ? undefined : {item: document.getElementById("edit-recipe-crafting-table-9").getAttribute("value")},
					},
					result: {
						count: parseInt(document.getElementById("edit-recipe-crafting-result-count").value),
						item: document.getElementById("edit-recipe-crafting-result").getAttribute("value")
					}
				};
				break;
				case "minecraft:crafting_shapeless":
				elm.data = {
					type: elm.data.type,
					group: elm.data.group,
					ingredients: document.getElementById("edit-recipe-crafting-ingredients").value.split("\n"),
					result: {
						count: parseInt(document.getElementById("edit-recipe-crafting-result-count").value),
						item: document.getElementById("edit-recipe-crafting-result").getAttribute("value")
					}
				};
				break;
				case "minecraft:smithing":
				elm.data = {
					type: elm.data.type,
					group: elm.data.group,
					base: {
						item: document.getElementById("edit-recipe-crafting-base").getAttribute("value")
					},
					addition: {
						item: document.getElementById("edit-recipe-crafting-addition").getAttribute("value")
					},
					result: {
						item: document.getElementById("edit-recipe-crafting-result").getAttribute("value")
					}
				};
				break;
				case "minecraft:stonecutting":
				elm.data = {
					type: elm.data.type,
					group: elm.data.group,
					ingredient: {
						item: document.getElementById("edit-recipe-crafting-ingredient").getAttribute("value")
					},
					count: parseInt(document.getElementById("edit-recipe-crafting-result-count").value),
					result: document.getElementById("edit-recipe-crafting-result").getAttribute("value")
				}
				break;
			}
		},
		save(folder, elm) {
			folder.folder("recipes").file(elm.name + ".json", JSON.stringify(elm.data, null, "\t"));
		},
		generateRecipeEditor(dataArg) {
			var container = document.getElementById("edit-recipe-crafting"), data = JSON.parse(JSON.stringify(dataArg));
			switch (data.type) {
				case "minecraft:blasting":
				case "minecraft:campfire_cooking":
				case "minecraft:smelting":
				case "minecraft:smoking":
				data.ingredient = data.ingredient ?? new Object;
				container.innerHTML = `
					Ingredient:
					<div class=item-picker-item id=edit-recipe-crafting-ingredient value="${data.ingredient.item || "minecraft:air"}"></div>
					<br>
					Result:
					<div class=item-picker-item id=edit-recipe-crafting-result value="${data.result || "minecraft:air"}"></div>
					<br>
					Experience:
					<input type=number id=edit-recipe-xp value=${data.experience || 0} step=any min=0>
					<br>
					Cooking time:
					<input type=number id=edit-recipe-cooking-time value=${data.cookingtime || 0} min=0>
				`;
				break;
				case "minecraft:crafting_shaped":
				data.pattern = data.pattern || ["   ", "   ", "   "];
				data.key = data.key || {0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}};
				Object.assign(data.key, {" ": {}});
				data.result = data.result || {};
				container.innerHTML = `
					Recipe:
					<table id=edit-recipe-crafting-table>
						<tr>
							<td class=item-picker-item id=edit-recipe-crafting-table-1 value="${data.key[data.pattern[0][0]].item || "minecraft:air"}">
							<td class=item-picker-item id=edit-recipe-crafting-table-2 value="${data.key[data.pattern[0][1]].item || "minecraft:air"}">
							<td class=item-picker-item id=edit-recipe-crafting-table-3 value="${data.key[data.pattern[0][2]].item || "minecraft:air"}">
						</tr>
						<tr>
							<td class=item-picker-item id=edit-recipe-crafting-table-4 value="${data.key[data.pattern[1][0]].item || "minecraft:air"}">
							<td class=item-picker-item id=edit-recipe-crafting-table-5 value="${data.key[data.pattern[1][1]].item || "minecraft:air"}">
							<td class=item-picker-item id=edit-recipe-crafting-table-6 value="${data.key[data.pattern[1][2]].item || "minecraft:air"}">
						</tr>
						<tr>
							<td class=item-picker-item id=edit-recipe-crafting-table-7 value="${data.key[data.pattern[2][0]].item || "minecraft:air"}">
							<td class=item-picker-item id=edit-recipe-crafting-table-8 value="${data.key[data.pattern[2][1]].item || "minecraft:air"}">
							<td class=item-picker-item id=edit-recipe-crafting-table-9 value="${data.key[data.pattern[2][2]].item || "minecraft:air"}">
						</tr>
					</table>
					<br>
					Result:
					<br>
					<input type=number id=edit-recipe-crafting-result-count value="${data.result.count || 1}" min=1 max=127>
					<div class=item-picker-item id=edit-recipe-crafting-result value="${data.result.item || "minecraft:air"}"></div>
				`;
				break;
				case "minecraft:crafting_shapeless":
				data.ingredients = data.ingredients ?? [];
				data.result = data.result ?? {};
				container.innerHTML = `
					Recipe: <i class=gray>Write item IDs in separate lines</i>
					<br>
					<button onclick="(async() => document.getElementById('edit-recipe-crafting-ingredients').value += '\\n' + (await ItemPicker.openItemPicker()).id)()">+ New</button>
					<br>
					<textarea id=edit-recipe-crafting-ingredients>${data.ingredients.join("\n")}</textarea>
					<br>
					Result:
					<br>
					<input type=number id=edit-recipe-crafting-result-count value="${data.result.count || 1}" min=1 max=127>
					<div class=item-picker-item id=edit-recipe-crafting-result value="${data.result.item || "minecraft:air"}"></div>
				`;
				break;
				case "minecraft:smithing":
				data.base = data.base ?? {};
				data.addition = data.addition ?? {};
				data.result = data.result ?? {};
				container.innerHTML = `
					First item: <i class=gray>The item to be upgraded</i>
					<br>
					<div class=item-picker-item id=edit-recipe-crafting-base value="${data.base.item || "minecraft:air"}"></div>
					<br>
					Second item: <i class=gray>The upgrade ingredient</i>
					<br>
					<div class=item-picker-item id=edit-recipe-crafting-addition value="${data.addition.item || "minecraft:air"}"></div>
					<br>
					Result item: <i class=gray>The upgraded item</i>
					<br>
					<div class=item-picker-item id=edit-recipe-crafting-result value="${data.result.item || "minecraft:air"}"></div>
				`;
				break;
				case "minecraft:stonecutting":
				data.ingredient = data.ingredient ?? new Object;
				container.innerHTML = `
					Ingredient:
					<div class=item-picker-item id=edit-recipe-crafting-ingredient value="${data.ingredient.item || "minecraft:air"}"></div>
					<br>
					Result:
					<br>
					<input type=number id=edit-recipe-crafting-result-count value=${data.count || 1} min=0 max=127>
					<div class=item-picker-item id=edit-recipe-crafting-result value="${data.result || "minecraft:air"}"></div>
				`;
				break;
			}
			ItemPicker.initAllInputs();
		}
	},
	structure: {
		new(elm) {
			elm.data = "data:application/octet-stream,base64,";
		},
		init(elm) {},
		compile(elm) {},
		save(folder, elm) {
			folder.folder("structures").file(elm.name + ".nbt", elm.data.replace(/^data:(.+?);base64,/u, ""), {base64: true});
		},
		readStructure(elm) {
			var inp = document.createElement("input");
			inp.type = "file";
			inp.accept = ".nbt";
			inp.onchange = () => {
				var fr = new FileReader;
				fr.onload = () => {
					elm.data = fr.result;
				}
				fr.readAsDataURL(inp.files[0]);
			}
			inp.click();
		},
		saveStructure(elm) {
			var a = document.createElement("a");
			a.href = elm.data;
			a.download = elm.name + ".nbt";
			a.click();
		}
	},
	tag: {
		new(elm) {
			elm.data = new Object;
			elm.data.values = new Array;
			elm.data.replace = new Boolean;
			elm.folder = "blocks";
		},
		init(elm) {
			document.querySelector(`#edit-tag-folder option[value=${elm.folder}]`).setAttribute("selected", "");
			if (elm.data.replace)
				document.getElementById("edit-tag-replace").setAttribute("checked", "");
			document.getElementById("edit-tag-values").value = elm.data.values.join("\n");
		},
		compile(elm) {
			elm.folder = document.getElementById("edit-tag-folder").value;
			elm.data.replace = Boolean(document.getElementById("edit-tag-replace").checked);
			elm.data.values = document.getElementById("edit-tag-values").value.split("\n");
		},
		save(folder, elm) {
			folder.folder("tags").folder(elm.folder).file(elm.name + ".json", JSON.stringify(elm.data, null, "\t"));
		}
	}
};