currentLocation="lobby";

player={
	"inventory" : {}
}

rooms={
	"lobby" : {
		"type" : "room",
		"name" : "the lobby",
		"title" : "Welcome to the game!",
		"directions" : {
			"south" : "town square"
		},
		"entrance text" : "You're in the lobby, old chap. The game is about to begin, just walk through that glowing portal thing over there."
	},
	"town square" : {
		"type" : "room",
		"name" : "the town square",
		"directions" : {
			"east" : "armory"
		},
		"entrance text" : "You're in the Delran town square, bustling with people and little horses and stuff."
	},
	"armory" : {
		"type" : "room",
		"name" : "the Delran Armory",
		"directions" : {
			"west" : "town square"
		},
		"entrance text" : "You push open the heavy wooden door and walk into the armory. The walls are lined with weapons: bludgeoning tools and some archery implements, for the most part, but several large swords glisten behind the counter, overseen by the armorer.",
		"items" : {
			"hammer" : {
				"name" : "battle hammer",
				"status" : "default",
				"states" : {
					"default" : {
						"descriptor" : "A battle hammer is hanging on a hook here."
					},
					"take" : {
						"descriptor" : "",
						"from" : {
							"default" : "When the armorer turns to adjust some insanely sharp implement behind him, you slip the battle hammer into your cloak."
						}
					}
				}
			},
			"axe" : {
				"name" : "swift axe",
				"status" : "default",
				"states" : {
					"default" : {
						"descriptor" : "A sleek, lightweight axe sits on a nearby shelf."
					},
					"take" : {
						"descriptor" : "",
						"from" : {
							"default" : "You quietly slide the axe off of the shelf and stow it in your cloak. The armorer doesn't seem to be paying very close attention."
						}
					}
				}
			}
		},
		"actions" : {
			"talk" : {
				"armorer" : {
					"move" : "armorer"
				}
			}
		}
	}
}

game={
	"title" : "The Countryside"
}