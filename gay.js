const express = require('express');
const app = express();
app.get('/', (req, res) => {
  res.send('THE PAIN')
});
app.listen(3000, () =>{('POWER');
});
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

const ticketCategoryID = '1080965620205633638';
const adminRoleID = '1080956907260498020';
const idserver = '1080952839934844950';
const dev = "984384328391868476"

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });
  


  client.on('messageCreate', (message) => {
    if (message.content ==='send-ticket' && message.author.id === dev) {
      const embed = new MessageEmbed()
      .setColor('DARK_GREY')
      .setTitle('فتح تذكرة')
      .setDescription('**لطلب الدعم الفني, الرجاء فتح تذكرة.\n\n رجاء عدم ازعاج الادارة\nسنرد في اسرع وقت ممكن.**')
      .addFields(
        { name: 'طلب الدعم', value: '**اضغط على الزر في الاسفل لطلب الدعم الفني.**' },
      )
      .setTimestamp()
      .setFooter('🪐 Black Hole')
      .setThumbnail('https://cdn.discordapp.com/emojis/1098743830829875271.webp?size=96&quality=lossless')
      .setImage('https://cdn.discordapp.com/banners/1080952839934844950/6c8698a968cb3e7c69cf40965ad6c578.webp?size=4096')
   
      const button = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('PRIMARY')
        .setLabel('افتح تذكرة')
        .setCustomId('create_ticket')
        .setEmoji("<:wa_ticket:1098743830829875271>")
      )
      message.channel.send({ embeds: [embed] , components: [button] });
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
          allow: ['VIEW_CHANNEL','SEND_MESSAGES']
        },
        {
          id: adminRole.id,
          allow: ['VIEW_CHANNEL']
        }
      ]
    });
    
    const ticketEmbed = {
      title: 'تكت الدعم الفني',
      description: `**${interaction.user}\n\n رجاءً قُم بشرح مشكلتك الى طاقم الدعم الفني الخاص بنا حتى نتمكن من مساعدتك على الفور\n\nواذا بامكناك انتظار احد الادارة حتى يستلم التذكرة. 
**`,
      color: 'DARK_GREY',
      image: {
        url: 'https://cdn.discordapp.com/banners/1080952839934844950/6c8698a968cb3e7c69cf40965ad6c578.webp?size=4096'
      },
      thumbnail: {
        url: 'https://cdn.discordapp.com/emojis/1098743830829875271.webp?size=96&quality=lossless'
      }
    };
    const ticketMessage = await ticketChannel.send({embeds: [ticketEmbed] });
    const send1 = await ticketChannel.send(`<@&${adminRoleID}> ${interaction.user}`)
    await send1.delete()
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
        .setEmoji('🔒')

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
    ticketChannel.permissionOverwrites.edit(adminRole, { SEND_MESSAGES: false });
    const user = ticketChannel.guild.members.cache.get(interaction.user.id);
    ticketChannel.permissionOverwrites.edit(user, {
    VIEW_CHANNEL: true,
    SEND_MESSAGES: true,
    READ_MESSAGE_HISTORY: true,
  });
    if (!interaction.member.roles.cache.some(e=> e.id === adminRole.id)){
      await interaction.reply({ content: "**فقط الادارة الي معاها رتبة سبورت تقدر تمسك التكت.**", ephemeral: true });
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
      .setLabel('delete')
      .setStyle('DANGER')
      .setEmoji('🔒')
    )
    const buttonRow = new MessageActionRow().addComponents(claimedButton)
    await interaction.update({ components: [claimedButton] });
    const claim_message = await ticketChannel.send(`**Claimed by ${interaction.user.tag}**`);
    setTimeout(() => {
    claim_message.delete();
    }, 5000);
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
      interaction.reply({embeds: [new MessageEmbed() .setDescription(`**هل انت متأكد؟**`) .setColor('BLURPLE')], components: [Row1]})
  }
});






client.on("interactionCreate", (message) => {
  if (!message.isButton()) return;
  if (message.customId === 'yes') {
    const adminRole = message.guild.roles.cache.get(adminRoleID);
    if (!message.member.roles.cache.some(e=> e.id === adminRole.id)){
      message.reply({ content: `**فقط ${adminRole} يمكنهم غلق التكت.**`, ephemeral: true });
      return;
    }
    const ticketChannel = message.channel;

    let yesEmbed = new MessageEmbed() 
    .setDescription(`**سوف يتم حذف التكت خلال 5 ثواني**`)
    .setColor('RED')

    message.reply({embeds: [yesEmbed]})
  setTimeout(async() => {
    await ticketChannel.delete();
  }, 5000);
  } else if(message.customId === 'no'){
    const adminRole = message.guild.roles.cache.get(adminRoleID);
    if (!message.member.roles.cache.some(e=> e.id === adminRole.id)){
      message.reply({ content: `**فقط ${adminRole} يمكنهم غلق التكت.**`, ephemeral: true });
      return;
    }
    
    let noEmbed = new MessageEmbed()
    .setDescription(`**تم توقيف عملية الاغلاق**`)
    .setColor('GREEN')
    .setFooter({text: `سوف يتم حذف الرسالة خلال 7 ثواني`, iconURL: message.user.avatarURL()})

    message.update({embeds: [noEmbed]})
    setTimeout(async() => {
      await message.deleteReply();
    }, 7000);
  } else if(message.customId === 'pin'){
    const ticketChannel = message.channel;
    const adminRole = message.guild.roles.cache.get(adminRoleID);
    if (!message.member.roles.cache.some(e=> e.id === adminRole.id)){
      message.reply({ content: `**فقط ${adminRole} يمكنهم تثبيت التكت.**`, ephemeral: true });
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
    .setDescription(`تم تثبيت التكت بنجاح!`)
    .setColor('GREEN')

    message.reply({embeds: [pinEmbed], components: []})
    setTimeout(async() => {
      await ticketChannel.setName(ticketChannelName);
    });
  }
  })








client.on('messageCreate', (message, interaction) => {
  if(message.content.startsWith("#stats")){
    let user = message.author;
    let point = db.fetch(`points_${user.id}`)
    let tclaims = db.fetch(`claims_${user.id}`)
    if (point === null) point = 0;
    if (tclaims === null) tclaims = 0;
    const Embed = new MessageEmbed()
    .setAuthor({name: `${message.author.tag}`, iconURL: message.author.avatarURL()})
    .setThumbnail(message.author.avatarURL({dynamic: true}))
    .setDescription(`لقد استلمت تكتات: \`${tclaims}\`\nمعاك نقطة: \`${point}\``)
    .setFooter({text: `${message.guild.name}`, iconURL: message.guild.iconURL()})
    .setColor('BLURPLE')
    message.reply({embeds: [Embed]})
  }
})



client.on('messageCreate', message => {
  if(message.author.bot) return;
  if(message.content.startsWith(".")){
  if(message.channel.id !== '1101574532122296361') return;
    let user = message.author;
    let dot = db.fetch(`dotTime_${user.id}`);
    let timeout = 86400000;
    if(dot !== null && timeout - (Date.now() - dot) > 0) {
      let time = ms(timeout - (Date.now() - dot))
      message.channel.send({content: `ماتقدر يابنت انت, تعال بعد ${time}`})
    } else { 
      let embed = new MessageEmbed()
      .setDescription(`استلمت نقطة <@${user.id}>`)
      .setColor('BLURPLE')
      db.add(`points_${user.id}`, 1)
      db.set(`dotTime_${user.id}`, Date.now())
      message.channel.send({embeds: [embed]})
    }
  }
})







//////////////





client.on('messageCreate', async message => {
  const mentionedUser = message.mentions.users.first();  
  const mentionedMember = await message.guild.members.fetch(mentionedUser);
  const channelName = message.channel.name;
  const match = channelName.match(/^ticket-(\d+)$/);
  if (message.content.startsWith('$add') && !message.author.bot) {
    if (match) {
      const ticketCount = parseInt(match[1]);
      try {
        const data = fs.readFileSync('ticketCount.json');
        const jsonData = JSON.parse(data);
        if (ticketCount <= jsonData.ticketCount) {
          const ticketChannel = message.guild.channels.cache.find(channel => channel.name === channelName);
          if (ticketChannel) {
            await ticketChannel.permissionOverwrites.edit(mentionedMember, { SEND_MESSAGES: true, VIEW_CHANNEL: true });
            message.channel.send(`**${mentionedUser.username} تم اضافة بارمشن للعضو**`);
          } else {
            message.channel.send(`خطأ : لم نستطع ايجاد التيكت ${channelName}.`);
          }
        } else {
          message.channel.send(`Error: Invalid ticket count: ${ticketCount}`);
        }
      } catch (error) {
        message.channel.send('Error reading ticketCount.json.');
      }
    } else {
      message.channel.send('Error: This command can only be used in a ticket channel.');
    }
  }
});
















































































































client.login(process.env['token']);
