const { WebhookClient } = require('discord.js');

const notificationService = {
  async notifyFormSubmission(form) {
    try {
      const webhook = new WebhookClient({ url: process.env.DISCORD_WEBHOOK_URL });
      
      await webhook.send({
        content: `New ${form.type} form submitted by <@${form.submittedBy.discordId}>`,
        embeds: [{
          title: `${form.type.toUpperCase()} Form Submission`,
          fields: [
            { name: 'Status', value: form.status, inline: true },
            { name: 'Submitted', value: new Date(form.createdAt).toLocaleString(), inline: true }
          ]
        }]
      });
    } catch (error) {
      console.error('Notification error:', error);
    }
  },

  async notifyFormUpdate(form) {
    try {
      const webhook = new WebhookClient({ url: process.env.DISCORD_WEBHOOK_URL });
      
      await webhook.send({
        content: `Form update: ${form.type} form has been ${form.status}`,
        embeds: [{
          title: `Form Status Update`,
          fields: [
            { name: 'Type', value: form.type, inline: true },
            { name: 'Status', value: form.status, inline: true },
            { name: 'Updated', value: new Date(form.updatedAt).toLocaleString(), inline: true }
          ]
        }]
      });
    } catch (error) {
      console.error('Notification error:', error);
    }
  }
};

module.exports = notificationService;