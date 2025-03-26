export interface Translations {
  features: {
    survival: {
      title: string;
      description: string;
    };
    economy: {
      title: string;
      description: string;
    };
    towny: {
      title: string;
      description: string;
    };
    mcmmo: {
      title: string;
      description: string;
    };
    customEnchants: {
      title: string;
      description: string;
    };
    customEvents: {
      title: string;
      description: string;
    };
  };
  navigation: {
    home: string;
    news: string;
    info: string;
    contact: string;
    ranks: string;
  };
  server: {
    status: string;
    players: string;
    joinServer: string;
    copy: string;
    copied: string;
    uptime: string;
    serverInfo: string;
  };
  serverDescription: string;
  serverDetails: {
    worldBorder: string;
    worldBorderValue: string;
    mapReset: string;
    mapResetValue: string;
    difficulty: string;
    difficultyValue: string;
  };
  discord: string;
  news: {
    latestNews: string;
    readMore: string;
  };
  footer: {
    copyright: string;
    disclaimer: string;
    terms: string;
    privacy: string;
    rules: string;
  };
  errors: {
    pageNotFound: string;
    goHome: string;
  };

  info: {
    title: string;
    subtitle: string;
    welcome: string;
    welcomeText1: string;
    welcomeText2: string;
    serverAddress: string;
    howToJoin: string;
    onlinePlayers: string;
    registeredPlayers: string;
    serverUptime: string;
    featuresTitle: string;
    serverSpecifications: string;
    serverRules: string;
    rulesNote: string;
    staffTeam: string;
    howToJoinSection: string;
    joinDiscord: string;
    joinDiscordText: string;
  };
  
  serverSpecs: {
    hardware: {
      label: string;
      value: string;
    };
    uptime: {
      label: string;
      value: string;
    };
    location: {
      label: string;
      value: string;
    };
    version: {
      label: string;
      value: string;
    };
    slots: {
      label: string;
      value: string;
    };
    antiCheat: {
      label: string;
      value: string;
    };
  };
  rules: {
    respectful: {
      title: string;
      description: string;
    };
    noGriefing: {
      title: string;
      description: string;
    };
    noCheating: {
      title: string;
      description: string;
    };
    pvpGuidelines: {
      title: string;
      description: string;
    };
    appropriateBuilds: {
      title: string;
      description: string;
    };
    staffDecisions: {
      title: string;
      description: string;
    };
  };
  staffRoles: {
    owner: string;
    administrators: string;
    moderators: string;
    helpers: string;
  };
  joinSteps: {
    step1: {
      title: string;
      description: string;
    };
    step2: {
      title: string;
      description: string;
    };
    step3: {
      title: string;
      description: string;
    };
    step4: {
      title: string;
      description: string;
    };
  };
  

  contact: {
    title: string;
    heroTitle: string;
    heroSubtitle: string;
    form: {
      title: string;
      name: string;
      namePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      subject: string;
      subjectSelect: string;
      subjects: {
        general: string;
        support: string;
        feedback: string;
        report: string;
        bug: string;
        business: string;
      };
      message: string;
      messagePlaceholder: string;
      captcha: string;
      send: string;
      sent: string;
    };
    discord: {
      title: string;
      description: string;
      members: string;
      online: string;
      joinButton: string;
    };
    social: {
      discord: {
        name: string;
        label: string;
      };
      email: {
        name: string;
        label: string;
      };
      twitter: {
        name: string;
        label: string;
      };
    };
    faq: {
      title: string;
      items: Array<{
        question: string;
        answer: string;
      }>;
    };
  };
}