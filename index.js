const Discord = require("discord.js")
const { Client, Intents } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');
const db = require('quick.db')
const client = new Client({ 
    intents:[
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_WEBHOOKS,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING] 
});


// Do these:

const ticketCategoryID = 'categoryid'; // Add the ticket category ID
const adminRoleID = 'supportroleid'; // Add your Support's role ID
const idserver = 'idserver'; // Add your GUILD's ID
const titleMsg = ''; // Add the title of the opened ticket message
const descMsg = ''; // Add the description of the opened ticket message
const panelMsg = ''; // Add the panel msg of the ticket panel message





client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });
  


  client.on('messageCreate', (message) => {
    if (message.content ==='send-ticket') {
   
      const button = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('PRIMARY')
        .setLabel('Create Ticket')
        .setCustomId('create_ticket')
        .setEmoji("🎟️")
      )
      message.channel.send({ content: `${panelMsg || 'No panel msg has been set'}` , components: [button] });
    }
  
  });
  const fs = require('fs');

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;
  let ticketCount = 0;
  try {
    const data = fs.readFileSync('ticketCount.json');
    const jsonData = JSON.parse(data);
    ticketCount = jsonData.ticketCount;
  } catch (error) {
    console.error(error);
  }

  const ticketChannelName = `ticket-${ticketCount}`;

  if (interaction.customId === 'create_ticket') {
    const guild = client.guilds.cache.get(idserver);
    const adminRole = guild.roles.cache.get(adminRoleID);
    const ticketCategory = guild.channels.cache.get(ticketCategoryID);
    const ticketChannel = await guild.channels.create(ticketChannelName, {
      parent: ticketCategory,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: ['VIEW_CHANNEL']
        },
        {
          id: interaction.user.id,
          allow: ['VIEW_CHANNEL']
        },
        {
          id: adminRole.id,
          allow: ['VIEW_CHANNEL']
        }
      ]
    });
    
    const ticketEmbed = {
      title: `${titleMsg || 'No title has been setted'}`,
      description: `${descMsg || '**Please wait for a Support member to come.**'}`,
      color: '#4e5d94'
    };
    const ticketMessage = await ticketChannel.send({ embeds: [ticketEmbed] });

    const buttonRow = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('receive_ticket')
        .setLabel('Claim')
        .setEmoji('🔗')
        .setStyle('PRIMARY'),
        new MessageButton()
        .setCustomId('delete_ticket')
        .setLabel('Close')
        .setStyle('DANGER')
        .setEmoji('🗑️')

    );

    await ticketMessage.edit({ components: [buttonRow] });

    await interaction.reply({
      content: `**Successfully opened a ticket ${ticketChannel}.**`,
      ephemeral: true
    });
    ticketCount++;

    const jsonData = { ticketCount };
    fs.writeFile('ticketCount.json', JSON.stringify(jsonData), (error) => {
      if (error) console.error(error);
    });   
  } else if (interaction.customId === 'receive_ticket') {
    const ticketChannel = interaction.channel;
    const adminRole = interaction.guild.roles.cache.get(adminRoleID);
    if (!interaction.member.roles.cache.some(e=> e.id === adminRole.id)){
      await interaction.reply({ content: `**Only ${adminRoleID} can claim the ticket**`, ephemeral: true });
      return;
    }
    
    const claimedButton =
    new MessageActionRow().addComponents(
          new MessageButton()
      .setStyle('SECONDARY')
      .setCustomId('pin')
      .setEmoji('📌'),
    new MessageButton()
      .setCustomId('receive_ticket')
      .setLabel(`By ${interaction.user.tag}`)
      .setStyle('PRIMARY')
      .setEmoji('✅')
      .setDisabled(true),

      new MessageButton()
      .setCustomId('delete_ticket')
      .setLabel('Close')
      .setStyle('DANGER')
      .setEmoji('🗑️')
    )
    const buttonRow = new MessageActionRow().addComponents(claimedButton)
    await interaction.update({ components: [claimedButton] });

    await interaction.followUp({
      content: `:white_check_mark: **Successfully claimed ${interaction.channel}**`,
      ephemeral: true
    });
  } else if (interaction.customId === 'delete_ticket') {
    const adminRole = interaction.guild.roles.cache.get(adminRoleID);
    if (!interaction.member.roles.cache.some(e=> e.id === adminRole.id)){
      await interaction.reply({ content: `**Only ${adminRoleID} can close the ticket.**`, ephemeral: true });
      return;
    }
    const ticketChannel = interaction.channel;
      const Row1 = new MessageActionRow().addComponents(
      new MessageButton()
      .setStyle('SUCCESS')
      .setLabel('Yes')
      .setCustomId('yes')
      .setEmoji('✅'),
      new MessageButton()
      .setStyle('DANGER')
      .setLabel('No')
      .setCustomId('no')
      .setEmoji('🗑️')
      )
    interaction.reply({embeds: [new MessageEmbed() .setDescription(`**The ticket is going to be deleted after 5 seconds**`) .setColor('RED') ]})
    setTimeout(async() => {
      await ticketChannel.delete();
    }, 5000);
  }

});


client.on("interactionCreate", (message) => {
  if (!message.isButton()) return;
  if (message.customId === 'yes') {
    const adminRole = message.guild.roles.cache.get(adminRoleID);
    if (!message.member.roles.cache.some(e=> e.id === adminRole.id)){
      message.reply({ content: `**Only ${adminRole} can close this ticket.**`, ephemeral: true });
      return;
    }
    const ticketChannel = message.channel;

    let yesEmbed = new MessageEmbed() 
    .setDescription(`**This ticket will be deleted in 7 seconds by <@${message.author.id}>**`)
    .setColor('RED')

    message.reply({embeds: [yesEmbed]})
  setTimeout(async() => {
    await ticketChannel.delete();
  }, 5000);
  } else if(message.customId === 'no'){
    const adminRole = message.guild.roles.cache.get(adminRoleID);
    if (!message.member.roles.cache.some(e=> e.id === adminRole.id)){
      message.reply({ content: `**Only ${adminRole} can close this ticket.**`, ephemeral: true });
      return;
    }
    
    let noEmbed = new MessageEmbed()
    .setDescription(`**Successfully stopped the closing progress**`)
    .setColor('GREEN')
    .setFooter({text: `This message will be deleted in 7 seconds`, iconURL: message.user.avatarURL()})

    message.update({embeds: [noEmbed]})
    setTimeout(async() => {
      await message.deleteReply();
    }, 7000);
  } else if(message.customId === 'pin'){
    const ticketChannel = message.channel;
    const adminRole = message.guild.roles.cache.get(adminRoleID);
    if (!message.member.roles.cache.some(e=> e.id === adminRole.id)){
      message.reply({ content: `**Only ${adminRole} can pin this ticket.**`, ephemeral: true });
      return;
    }
    let ticketCount = 0;
    try {
      const data = fs.readFileSync('ticketCount.json');
      const jsonData = JSON.parse(data);
      ticketCount = jsonData.ticketCount;
    } catch (error) {
      console.error(error);
    }
  
    const ticketChannelName = `📌-ticket-${ticketCount}`;
  
    
    let pinEmbed = new MessageEmbed()
    .setDescription(`Successfully pinned the ticket!`)
    .setColor('GREEN')
    .setTimestamp()

    message.reply({embeds: [pinEmbed], components: []})
    setTimeout(async() => {
      await ticketChannel.setName(ticketChannelName);
    });
  }
  })



 client.login("yourbottoken");
