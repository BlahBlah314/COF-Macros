main()

async function main(){
  
  //Is a token selected ? if not, return error
  if(canvas.tokens.controlled.length == 0 || canvas.tokens.controlled.length > 1){
    ui.notifications.error("Choisissez un seul token.");
    return;
  }
  
  //Does the actor got RP ?
  let selected_actor = canvas.tokens.controlled[0].actor
  if (selected_actor.data.data.attributes.rp.value == 0){
    ui.notifications.error(`${selected_actor.data.name} n'a plus de point de récupération !`);
    return;
  }

  //Roll to determine HP gain
  let newRollString = `${selected_actor.data.data.attributes.hd.value} + ${selected_actor.data.data.stats.con.mod} + ${selected_actor.data.data.level.value}`
  let roll = new Roll(newRollString).roll();
  let result = roll.total

  //Update actor HP
  let oldHealth = selected_actor.data.data.attributes.hp.value
  let newHealth = selected_actor.data.data.attributes.hp.value + result
  if(newHealth > selected_actor.data.data.attributes.hp.max){
    newHealth = selected_actor.data.data.attributes.hp.max
  }
  await selected_actor.update({"data.attributes.hp.value": newHealth});
  ui.notifications.info(`${selected_actor.data.name} a pris un point de récupération.`)

  //Chat message
  roll.toMessage({
    user: game.user._id,
    flavor: `${selected_actor.data.name} consomme un PR et récupère ${result} PV, passant de ${oldHealth} PV à ${newHealth} PV.`,
    speaker: ChatMessage.getSpeaker({actor: selected_actor})
  });

  //Update actor RP
  let newRP = selected_actor.data.data.attributes.rp.value - 1
  if(newRP < 0){
    newRP = 0;
  }
  await selected_actor.update({"data.attributes.rp.value": newRP});

}