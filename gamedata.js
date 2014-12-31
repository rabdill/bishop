currentRoom="lobby"

rooms={
	"lobby" : {
		"type" : "room",
		"name" : "the lobby",
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
		"entrance text" : "You push open the heavy wooden door and walk into the armory. The walls are lined with weapons: Hammers, maces and archery accoutrements for the most part, but several large swords glisten behind the counter, overseen by the armorer."
	}
}

game={
	"title" : "The Countryside"
}