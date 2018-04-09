const WebClient = require('@slack/client').WebClient;

class SlackBotController {
  constructor () {
    this.botTokens = [];
    if (process.env.SLACK_API_TOKEN) {
      this.botTokens = process.env.SLACK_API_TOKEN.split('|');
    }

    this.init();
  }

  init () {
    this.webClients = [];
    this.botTokens.forEach((botToken) => {
      this.webClients.push(new WebClient(botToken));
    });
  }

  getSlackUsers (teams) {
    let users = [];
    
    const getTeamMembers = (webClient) => {
      return new Promise((resolve, reject) => {
        webClient.users.list().then((data) => {
          resolve({
            type: 'team',
            teamId: webClient.teamId,
            data: data
          });
        }).catch((err) => reject(err));
      });
    }

    const getChannelMembers = (webClient, channelId) => {
      return new Promise((resolve, reject) => {
        webClient.channels.info(channelId).then((data) => {
          resolve({
            type: 'channel',
            teamId: webClient.teamId,
            data: data
          });
        }).catch((err) => reject(err));
      });
    }

    const getTeamInfo = (webClient) => {
      return webClient.team.info();
    }

    const getUniqueValues = (array) => {
      const uniques = [];
      array.forEach((item) => {
        if (uniques.indexOf(item) === -1) {
          uniques.push(item);
        }
      });

      return uniques;
    }

    return new Promise((resolve, reject) => {
      const promisesTeamInfo = this.webClients.map(getTeamInfo);
      const getAllTeamInfo = Promise.all(promisesTeamInfo);
      getAllTeamInfo.then((infos) => {
        const userPromises = [];

        infos.forEach((info, i) => {
          this.webClients[i].teamId = info.team.id;
        });

        teams.forEach((team) => {
          const webClient = this.webClients.find((webClient) => {
            return webClient.teamId === team.teamId;
          })
          userPromises.push(getTeamMembers(webClient));
          team.channelIds && team.channelIds.forEach((channelId) => {
            userPromises.push(getChannelMembers(webClient, channelId));
          });
        });

        Promise.all(userPromises).then((userGroups) => {
          const teams = {};
          userGroups.forEach((userGroup) => {
            switch (userGroup.type) {
              case 'team':
                teams[userGroup.teamId] = {
                  members: userGroup.data.members,
                  channelMembers: []
                }
                break;
              case 'channel':
                const team = teams[userGroup.teamId];
                team.channelMembers = team.channelMembers.concat(userGroup.data.channel.members);
            }
          });

          for (let teamId in teams) {
            const team = teams[teamId];
            if (team.channelMembers.length > 0) {
              const newMembers = []; 
              team.channelMembers = getUniqueValues(team.channelMembers);
              team.members.forEach((member) => {
                if (team.channelMembers.indexOf(member.id) >= 0) {
                  newMembers.push(member);
                }
              });
              team.members = newMembers;
            }
            users = users.concat(team.members);
          }
          users = users.filter((user) => {
            return !user.deleted && user.profile.email;
          });
          resolve(users);
        }).catch((err) => {reject(err)});
      }).catch((err) => {reject(err)});
    });
  }

  getSlackChannels (query) {
    const queryString = {
      exclude_archived: true,
      exclude_members: true
    };

    const getChannels = (webClient) => {
      return new Promise((resolve, reject) => {
        const resultsArray = Promise.all([webClient.team.info(), webClient.channels.list(queryString)]);
        resultsArray.then((results) => {
          resolve({
            teamInfo: results[0],
            channelInfo: results[1]
          });
        }).catch((err) => reject(err));
      });
    }

    return new Promise((resolve, reject) => {
      const promises = this.webClients.map(getChannels);
      const resultArray = Promise.all(promises);
      resultArray.then((results) => {
        const teams = [];
        results.forEach((result) => {
          const team = {
            id: result.teamInfo.team.id,
            name: result.teamInfo.team.name,
            channels: []
          }
          result.channelInfo.channels.forEach((channel) => {
            const channelFormatted = {
              id: channel.id,
              name: channel.name_normalized
            };
            team.channels.push(channelFormatted);
          });
          teams.push(team);
        });
        resolve(teams);
      }).catch((err) => reject(err));
    });
  }

}

exports.SlackBotController = new SlackBotController();

