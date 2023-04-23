const Discord = require("discord.js")
const { Client, Intents } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');
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

const ticketCategoryID = '1097497598228697128';
const adminRoleID = '1097497641702666280';
const idserver = '1096779820202991679';

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
      message.channel.send({ content: `**لشراء كريدت أرجوا فتح تكت, الاسعار موجودة في الرومات**` , components: [button] });
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
      title: 'تكت الشراء',
      description: '**أرجوا انتظار اداري لمسك التكت.**',
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
      content: `**تم انشاء التكت ${ticketChannel}.**`,
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
      await interaction.reply({ content: "**فقط الادارة الي معاها رتبة سبورت تقدر تمسك التكت.**", ephemeral: true });
      return;
    }
    
    const claimedButton = 
    new MessageActionRow().addComponents(
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
      content: `لقد استلمت تكت ${interaction.channel}`,
      ephemeral: true
    });
  } else if (interaction.customId === 'delete_ticket') {
    const adminRole = interaction.guild.roles.cache.get(adminRoleID);
    if (!interaction.member.roles.cache.some(e=> e.id === adminRole.id)){
      await interaction.reply({ content: "**فقط الادارة الي معاها رتبة سبورت تقدر تحذف التكت.**", ephemeral: true });
      return;
    }
    const ticketChannel = interaction.channel;
    interaction.reply({embeds: [new MessageEmbed() .setDescription(`**سوف يتم حذف التكت بعد 5 ثواني**`) .setColor('RED') ]})
    setTimeout(async() => {
      await ticketChannel.delete();
    }, 5000);
  }

});
  client.login("token here");
