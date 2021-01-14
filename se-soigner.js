main()

async function main(){

  if(canvas.tokens.controlled.length == 0 || canvas.tokens.controlled.length > 1){
    ui.notifications.error("Choisissez un seul token !");
    return;
  }
  let selected_actor = canvas.tokens.controlled[0].actor
  let actorHeal = selected_actor.items.filter(item => item.data.data.subtype == "consumable")
  console.log(actorHeal)
  if(actorHeal == null || actorHeal == undefined || actorHeal == 0){
    ui.notifications.error(`${selected_actor.data.name} ne possède aucun consommable !`);
    return;
  }
  
  let healOptions = ""
  for(let item of actorHeal){
    healOptions += `<option value=${item.id}>${item.data.name} (x${item.data.data.qty})</option>`
  }
  let dialogTemplate = `
  <div class="red">
    <div class="center">
        <h3>Choisir un soin de l'inventaire</h3>
    </div>
</div>
<div class="flexrow" style="margin-bottom: 1px;">
    <div class="center bg-red">
        <label for="dice">Consommable</label>
    </div>
    <div class="center cell">
        <select class="flex1" style="border: none" data-type="String" id="heal">${healOptions}</select>
    </div>
</div>
<div class="flexrow" style="margin-bottom: 5px;">
    <div class="center bg-red">
        <label for="dice">Effet</label>
    </div>
    <div class="center cell">
        <input class="field-value" style="border: none" id="effect" name="effect" type="text" value="" data-dtype="String"/>
    </div>
</div>
<hr/>
  `
  new Dialog({
    title: "Se soigner", 
    content: dialogTemplate,
    buttons: {
      submit: {
        label: "Utiliser", 
        callback: (html) => {
          let healID = html.find("#heal")[0].value;
          let heal = selected_actor.items.find(item => item.id == healID)
          if (heal.data.data.properties.heal == false){
            ui.notifications.error('Impossible de se soigner avec ça !');
            return;
          }
          let newRollString = html.find("#effect")[0].value;
          let roll = new Roll(newRollString).roll();
          let result = roll.total
          let oldHealth = selected_actor.data.data.attributes.hp.value
          let newHealth = selected_actor.data.data.attributes.hp.value + result
          if(newHealth > selected_actor.data.data.attributes.hp.max){
            newHealth = selected_actor.data.data.attributes.hp.max
          }
          selected_actor.update({"data.attributes.hp.value": newHealth});
          ui.notifications.info(`${selected_actor.data.name} a pris un soin.`)
          roll.toMessage({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker({actor: selected_actor}),
            flavor: `${selected_actor.data.name} récupère ${result} PV`
          });
          heal.update({"data.qty": heal.data.data.qty - 1});
          if(heal.data.data.qty - 1 == 0){
            selected_actor.deleteOwnedItem(heal._id);
          }
          
        }
      }, 
      close: {
        label: "Close"
      }
    }
  }).render(true)
}
