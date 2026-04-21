require("dotenv").config();
const prompt = require("./prompt.json").prompt;
const discord = require("discord.js");

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
  ActivityType,
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
    let response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "inclusionai/ling-2.6-flash:free",
          messages: [
            {
              role: "user",
              content: `${prompt} ${code}`,
            },
          ],
          reasoning: { enabled: true },
        }),
      },
    );

    const data = await response.json();
    console.log(data);
    response = data.choices[0].message.content;
    response = JSON.parse(response);
    if (response.hasOwnProperty("failure")) {
      const failureEmbed = new EmbedBuilder()
        .setColor(colors.blue)
        .setTimestamp.setFooter({
          text: `Requested by ${interaction.user.displayName}`,
          iconURL: interaction.user.avatarURL({ extension: "png" }),
        })
        .setTitle("❌ Failed to analyse")
        .setDescription(response.failure);
      interaction.editReply({ components: [failureEmbed] });
      return;
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
  client.user.setActivity("Listening to /analyse");
});

const http = require("http");

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(process.env.PORT || 3000, () => {
  console.log(
    `Health check running on http://localhost:${process.env.PORT || 3000}/health`,
  );
});

client.login(process.env.TOKEN);
