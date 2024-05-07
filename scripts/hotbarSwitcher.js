import { world, system, ItemStack } from "@minecraft/server"

const players = new Map()
const cooldowns = new Map()

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
async function wait(ticks) {
	return new Promise((resolve) => {
		let a = system.runInterval(() => {
			system.clearRun(a)
			return resolve()
		}, ticks)
	})
}

world.afterEvents.entityHitEntity.subscribe((entity) => {
    const itemName = "minecraft:dirt" // the item to hit the player with to trigger hits
    const cooldown = 30 // the cooldown until the player can use this event again
    const hitsUntilTrigger = 3 // the amount of hits with "itemName" to trigger the event

    let attacker = entity.damagingEntity
    let victim = entity.hitEntity

    if (attacker.typeId !== "minecraft:player" && victim.typeId != "minecraft:player") return

    const inventory = attacker.getComponent("inventory").container
    const mainHand = inventory.getItem(attacker.selectedSlot)

    if (mainHand.typeId == itemName) {
        if (cooldowns.get(attacker.id) > Date.now()) {
            return
        }

        players.set(attacker.id, (players.get(attacker.id) || 0) + 1)
    } else {
        players.delete(attacker.id)
    }

    if (players.get(attacker.id) >= hitsUntilTrigger) {
        players.delete(attacker.id)
        cooldowns.set(attacker.id, (Date.now() + (cooldown*1000)))
    }
})

async function hotbarScramble(victim) {
    let i = 0
    while (i < 5) {
        victim.sendMessage(`§6You will be §eHotbar Shuffled §6in ${5-i}s!`)
        i++
        await wait(20)
    }
    victim.sendMessage('§eYou have been Hotbar Shuffled!')
    const inventory = victim.getComponent("inventory").container

    let newInv = []

    for (let i = 0; i < 8; i++) {
        newInv.push(inventory?.getItem(i))
    }
    shuffleArray(newInv)
    for (let i = 0; i < 8; i++) {
        inventory.setItem(i, newInv[i])
    }
}