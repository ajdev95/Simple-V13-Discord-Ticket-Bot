# Simple Ticket Bot [ One Bot **Guild** Only ]

# 🆘 Help 🆘

**Support:** [discord.gg/black-h](https://discord.gg/black-h)


# Change log 1.0.2

The ability to get answered with a "Yes/No" when closing a ticket.
Added a pin button that pins the ticket.

# Installation

<details>
<summary>Windows Installation</summary>
<br>

1. Install [Node.js](https://nodejs.org/en) [ 1.16.6+ ]
2. Install [Visual Studio Code](https://code.visualstudio.com/)
```bash
3. Download this Project
4. npm init
5. npm i discord.js@13
6. node .
```

and done!
</details>

# Changes that YOU have to change!

```js
27.    const ticketCategoryID = 'categoryid'; // Add the ticket category ID
28.    const adminRoleID = 'supportroleid'; // Add your Support's role ID
29.    const idserver = 'idserver'; // Add your GUILD's ID
30.    const titleMsg = 'titleHere'; // Add the title of the opened ticket message
31.    const descMsg = 'descriptionHere'; // Add the description of the opened ticket message
32.    const panelMsg = 'panelMsghere'; // Add the panel msg of the ticket panel message
258.   client.login("yourbottoken") // Add your bot token here

```

if you don't change these it will not work!
