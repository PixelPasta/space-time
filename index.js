require("dotenv").config();
const prompt = require("./prompt.json").prompt;
const discord = require("discord.js");
const { Ollama } = require("ollama");
const ollama = new Ollama({
  host: "https://ollama.com",
  headers: {
    Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
  },
});

const {
  Client,
  Events,
  GatewayIntentBits,
  EmbedBuilder,
  ButtonStyle,
  MessageFlags,
  ContainerBuilder,
  ComponentType,
  ButtonBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ModalBuilder,
  TextInputStyle,
  TextInputBuilder,
  LabelBuilder,
} = require("discord.js");
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
});
const colors = {
  white: "#EEEEEE",
  blue: "#00ADB5",
  gray: "#393E46",
  dark: "#222831",
};

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName == "ping") {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const message = await interaction.fetchReply();
    const embed = new EmbedBuilder()
      .setColor(colors.blue)
      .setTitle(`Latency:`)
      .setFooter({
        text: `Requested by ${interaction.user.displayName}`,
        iconURL: interaction.user.avatarURL({ extension: "png" }),
      }).setDescription(`Websocket latency: ${client.ws.ping}ms.
    Roundtrip latency: ${message.createdTimestamp - interaction.createdTimestamp}ms`);
    interaction.editReply({ embeds: [embed], content: "" });
  }
  if (interaction.commandName == "analyse") {
    const modal = new ModalBuilder()
      .setCustomId("codeModal")
      .setTitle("Enter Code");

    const codeInput = new TextInputBuilder()
      .setCustomId("codeInput")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Your code goes here")
      .setRequired(true);

    const codeLabel = new LabelBuilder()
      .setLabel("Enter code")
      .setDescription("to be analysed")
      .setTextInputComponent(codeInput);

    modal.addLabelComponents(codeLabel);
    await interaction.showModal(modal);
    // // const loadingEmbed = new EmbedBuilder()
    // //   .setColor(colors.blue)
    // //   .setDescription("Analysing Code <a:Loading:1495042568293974016>")
    // //   .setFooter({
    // //     text: `Requested by ${interaction.user.displayName}`,
    // //     iconURL: interaction.user.avatarURL({ extension: "png" }),
    // //   });
    // // await interaction.reply({
    // //   embeds: [loadingEmbed],
    // //   withResponse: true,
    // // });
    // // let code = await interaction.options.get("code");

    // // let response = await ollama.chat({
    // //   model: "deepseek-v3.2:cloud",
    // //   messages: [
    // //     {
    // //       role: "user",
    // //       content: `${prompt} ${code.value}`,
    // //     },
    // //   ],
    // // });
    // // console.log(response);
    // // response = JSON.parse(response.message.content);
    // response = {
    //   time_complexity: {
    //     overall: "O(n)",
    //     breakdown: [
    //       {
    //         operation: "length comparison",
    //         complexity: "O(1)",
    //         reason: "Single integer comparison",
    //       },
    //       {
    //         operation: "first for-loop (building frequency map)",
    //         complexity: "O(n)",
    //         reason:
    //           "Iterates through both strings simultaneously, n = length of strings",
    //       },
    //       {
    //         operation: "second for-loop (checking frequency map)",
    //         complexity: "O(k) where k ≤ n",
    //         reason:
    //           "Iterates through keys in count object; maximum unique characters = min(n, alphabet size)",
    //       },
    //     ],
    //     dominant_factor:
    //       "The two O(n) loops dominate, resulting in overall O(n)",
    //   },
    //   space_complexity: {
    //     overall: "O(k) where k ≤ n",
    //     breakdown: [
    //       {
    //         structure: "count object (frequency map)",
    //         complexity: "O(k) where k ≤ n",
    //         reason:
    //           "Stores frequency counts for each unique character; worst-case stores n unique characters",
    //       },
    //       {
    //         structure: "loop variables and parameters",
    //         complexity: "O(1)",
    //         reason: "Fixed space for indices and function parameters",
    //       },
    //     ],
    //   },
    //   optimizations: [
    //     {
    //       suggestion: "Use fixed-size array for known character set",
    //       improvement: "O(1) space if alphabet size is fixed",
    //       reason:
    //         "For lowercase English letters, use array[26] instead of object, reducing hash overhead",
    //     },
    //     {
    //       suggestion: "Early termination in first loop",
    //       improvement: "O(n) time with potential early exit",
    //       reason:
    //         "If strings differ in length, return false immediately (already implemented)",
    //     },
    //   ],
    // };
    // const timeEmbed = new EmbedBuilder()
    //   .setColor(colors.blue)
    //   .setTitle(`⏱️ Time Complexity Analysis`)
    //   .setDescription(
    //     `### **Overall: **${response.time_complexity.overall}\n**Dominant factor: **${response.time_complexity.dominant_factor}`,
    //   )
    //   .addFields(
    //     response.time_complexity.breakdown.map((b) => ({
    //       name: `\`${b.operation}\` — ${b.complexity}`,
    //       value: `${b.reason}\n\u200B`,
    //       inline: false,
    //     })),
    //   )
    //   .setTimestamp()
    //   .setFooter({
    //     text: `Requested by ${interaction.user.displayName}`,
    //     iconURL: interaction.user.avatarURL({ extension: "png" }),
    //   });
    // const summaryEmbed = new EmbedBuilder()
    //   .setColor(colors.blue)
    //   .setTitle(`<a:OldOfficeComputer:1495114999339683903> Analysis Summary`)
    //   .setDescription(
    //     `**Time Complexity:** ${response.time_complexity.overall}\n**Space Complexity:** ${response.space_complexity.overall}`,
    //   )
    //   .setTimestamp()
    //   .setFooter({
    //     text: `Requested by ${interaction.user.displayName}`,
    //     iconURL: interaction.user.avatarURL({ extension: "png" }),
    //   });
    // const selectMenu = new StringSelectMenuBuilder()
    //   .setCustomId("select")
    //   .setPlaceholder("📋Summary")
    //   .addOptions(
    //     new StringSelectMenuOptionBuilder()
    //       .setLabel("📋Summary")
    //       .setDescription("Summary of the analysis")
    //       .setValue("summary"),
    //     new StringSelectMenuOptionBuilder()
    //       .setLabel("⏱️Time Complexity Analysis")
    //       .setDescription("Breakdown of the time complexity")
    //       .setValue("timeComplexityAnalysis"),
    //     new StringSelectMenuOptionBuilder()
    //       .setLabel("💾Space Complexity Analysis")
    //       .setDescription("Breakdown of the space complexity")
    //       .setValue("spaceComplexityAnalysis"),
    //   );
    // const row = new ActionRowBuilder().addComponents(selectMenu);
    // const reply = await interaction.editReply({
    //   embeds: [summaryEmbed],
    //   components: [row],
    // });
    // const message = await interaction.fetchReply();
    // const collector = message.createMessageComponentCollector({
    //   componentType: ComponentType.StringSelect,
    //   time: 60000,
    // });
    // collector.on("collect", async (i) => {
    //   if (i.user.id !== interaction.user.id)
    //     await i.reply({
    //       flags: MessageFlags.Ephemeral,
    //       content: `This message is not intended for you.`,
    //     });
    //   if (i.values[0] == "timeComplexityAnalysis") {
    //     i.update({ embeds: [timeEmbed], components: [row] });
    //   }
    //   if (i.values[0] == "summary") {
    //     i.update({ embeds: [summaryEmbed], components: [row] });
    //   }
    // });
    // selectMenu.setDisabled(true);
    // const disabledRow = new ActionRowBuilder().addComponents(selectMenu);
    // collector.on("end", async () => {
    //   await message.edit({ components: [disabledRow] });
    // });
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  // ...
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId == "codeModal") {
    const code = interaction.fields.getTextInputValue("codeInput");
    const loadingEmbed = new EmbedBuilder()
      .setColor(colors.blue)
      .setDescription("Analysing Code <a:Loading:1495042568293974016>")
      .setFooter({
        text: `Requested by ${interaction.user.displayName}`,
        iconURL: interaction.user.avatarURL({ extension: "png" }),
      });
    await interaction.reply({
      embeds: [loadingEmbed],
      withResponse: true,
    });
    let response = await ollama.chat({
      model: "deepseek-v3.2:cloud",
      messages: [
        {
          role: "user",
          content: `${prompt} ${code}`,
        },
      ],
    });
    console.log(response);
    response = JSON.parse(response.message.content);
    if (response.hasOwnProperty("failure")) {
      const failureEmbed = new EmbedBuilder().setColor(colors.blue);
    }
    const timeEmbed = new EmbedBuilder()
      .setColor(colors.blue)
      .setTitle(`⏱️ Time Complexity Analysis`)
      .setDescription(
        `### **Overall: **${response.time_complexity.overall}\n**Dominant factor: **${response.time_complexity.dominant_factor}`,
      )
      .addFields(
        response.time_complexity.breakdown.map((b) => ({
          name: `\`${b.operation}\` — ${b.complexity}`,
          value: `${b.reason}\n\u200B`,
          inline: false,
        })),
      )
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.displayName}`,
        iconURL: interaction.user.avatarURL({ extension: "png" }),
      });
    const spaceEmbed = new EmbedBuilder()
      .setColor(colors.blue)
      .setTitle("💾 Space Complexity Analysis")
      .setDescription(`### **Overall: **${response.space_complexity.overall}`)
      .addFields(
        response.space_complexity.breakdown.map((b) => ({
          name: `\`${b.structure}\` — ${b.complexity}`,
          value: `${b.reason}\n\u200B`,
          inline: false,
        })),
      )
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.displayName}`,
        iconURL: interaction.user.avatarURL({ extension: "png" }),
      });
    const summaryEmbed = new EmbedBuilder()
      .setColor(colors.blue)
      .setTitle(`<a:OldOfficeComputer:1495114999339683903> Analysis Summary`)
      .setDescription(
        `**Time Complexity:** ${response.time_complexity.overall}\n**Space Complexity:** ${response.space_complexity.overall}`,
      )
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.displayName}`,
        iconURL: interaction.user.avatarURL({ extension: "png" }),
      });
    const optimizationEmbed = new EmbedBuilder()
      .setColor(colors.blue)
      .setTitle(`🧹 Optimizations`)
      .setTimestamp()
      .addFields(
        response.optimizations.map((b) => ({
          name: `**Suggestion:** — ${b.suggestion.length > 0 ? b.suggestion : "None"}`,
          value: `improvement: — ${b.improvement.length > 0 ? b.improvement : "None"}\nreason: — ${b.reason}\n\u200B`,
          inline: false,
        })),
      )
      .setFooter({
        text: `Requested by ${interaction.user.displayName}`,
        iconURL: interaction.user.avatarURL({ extension: "png" }),
      });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("select")
      .setPlaceholder("📋Summary")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("📋Summary")
          .setDescription("Summary of the analysis")
          .setValue("summary"),
        new StringSelectMenuOptionBuilder()
          .setLabel("⏱️Time Complexity Analysis")
          .setDescription("Breakdown of the time complexity")
          .setValue("timeComplexityAnalysis"),
        new StringSelectMenuOptionBuilder()
          .setLabel("💾Space Complexity Analysis")
          .setDescription("Breakdown of the space complexity")
          .setValue("spaceComplexityAnalysis"),
        new StringSelectMenuOptionBuilder()
          .setLabel("🧹Optimizations")
          .setDescription("Optimization suggestions")
          .setValue("optimizationSuggestions"),
      );
    const row = new ActionRowBuilder().addComponents(selectMenu);
    const reply = await interaction.editReply({
      embeds: [summaryEmbed],
      components: [row],
    });
    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 120000,
    });
    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id)
        return i.reply({
          flags: MessageFlags.Ephemeral,
          content: `This message is not intended for you.`,
        });
      if (i.values[0] == "timeComplexityAnalysis") {
        i.update({ embeds: [timeEmbed], components: [row] });
      }
      if (i.values[0] == "summary") {
        i.update({ embeds: [summaryEmbed], components: [row] });
      }
      if (i.values[0] == "spaceComplexityAnalysis") {
        i.update({ embeds: [spaceEmbed], components: [row] });
      }
      if (i.values[0] == "optimizationSuggestions") {
        i.update({ embeds: [optimizationEmbed], components: [row] });
      }
    });
    const selectMenuDisabled = new StringSelectMenuBuilder()
      .setDisabled(true)
      .setCustomId("select")
      .setPlaceholder("📋Summary")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("📋Summary")
          .setDescription("Summary of the analysis")
          .setValue("summary"),
        new StringSelectMenuOptionBuilder()
          .setLabel("⏱️Time Complexity Analysis")
          .setDescription("Breakdown of the time complexity")
          .setValue("timeComplexityAnalysis"),
        new StringSelectMenuOptionBuilder()
          .setLabel("💾Space Complexity Analysis")
          .setDescription("Breakdown of the space complexity")
          .setValue("spaceComplexityAnalysis"),
      );
    const disabledRow = new ActionRowBuilder().addComponents(
      selectMenuDisabled,
    );
    collector.on("end", async () => {
      await message.edit({ components: [disabledRow] });
    });
  }
});

client.on(Events.ClientReady, async (client) => {
  console.log(`Ready! Logged in as ${client.user.username}`);
  // let guild = await client.guilds.cache.get(`1288009125137223711`);
  // const command = new discord.SlashCommandBuilder()
  //   .setName("analyse")
  //   .setDescription("Analyze space time complexity of a code snippet");

  // await guild.commands.create(command);
});

client.login(process.env.TOKEN);

// const ping = new ButtonBuilder()
//   .setCustomId("ping")
//   .setLabel("ping")
//   .setStyle(ButtonStyle.Primary);
// const row = new ActionRowBuilder().addComponents(ping);
// const reply = await interaction.reply({
//   components: [row],
//   content: "test",
//   withResponse: true,
// });
// const collector = reply.resource.message.createMessageComponentCollector({
//   componentType: ComponentType.Button,
//   time: 60000,
// });
// collector.on("collect", async (i) => {
//   if (i.user.id !== interaction.user.id)
//     await i.reply({
//       flags: MessageFlags.Ephemeral,
//       content: `This message is not intended for you.`,
//     });
//   await i.update({ content: "pong", components: [] });
// });

//TODO
//add space time complexity and optimization pages
//fix slash command
//add safegaurds
