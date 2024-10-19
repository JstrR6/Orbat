const militaryRanks = {
  "General Officer": [
    {
      name: "General of the Armed Forces",
      description: "Commander of the Armed Forces"
    },
    {
      name: "General",
      description: "Corps Commander"
    },
    {
      name: "Lieutenant General",
      description: "Corps Deputy Commander"
    },
    {
      name: "Major General",
      description: "Division Commander"
    },
    {
      name: "Brigadier General",
      description: "Division Deputy Commander"
    }
  ],
  "Company Grade Officer": [
    {
      name: "Colonel",
      description: "Company Commander"
    },
    {
      name: "Lieutenant Colonel",
      description: "Company Deputy Commander"
    },
    {
      name: "Major",
      description: "Company First Officer or Squadron Commander"
    }
  ],
  "Squadron Grade Officer": [
    {
      name: "Captain",
      description: "Squadron Commander"
    },
    {
      name: "First Lieutenant",
      description: "Squadron Deputy Commander"
    },
    {
      name: "Second Lieutenant",
      description: "Squadron First Officer"
    }
  ],
  "Senior Non-Commissioned Officer": [
    {
      name: "Sergeant Major of the Armed Forces",
      description: "Senior Enlisted Leader of the Armed Forces"
    },
    {
      name: "Command Sergeant Major",
      description: "Company Senior Enlisted Leader"
    },
    {
      name: "Sergeant Major",
      description: "Squadron Senior Enlisted Leader"
    },
    {
      name: "First Sergeant",
      description: "Advisor of the Squadron Commander"
    }
  ],
  "Non-Commissioned Officer": [
    {
      name: "Master Sergeant",
      description: "Section Chief"
    },
    {
      name: "Sergeant First Class",
      description: "Squadron Chief"
    },
    {
      name: "Staff Sergeant",
      description: "Squadron Non-Commissioned Officer In Charge"
    },
    {
      name: "Sergeant",
      description: "Squadron Sergeant"
    }
  ],
  "Soldier": [
    {
      name: "Corporal",
      description: "Team Leader"
    },
    {
      name: "Specialist",
      description: "Private First Class with additional responsibilities"
    },
    {
      name: "Private First Class",
      description: "Private with additional responsibilities"
    },
    {
      name: "Private",
      description: "Entry-level rank"
    }
  ]
};

module.exports = militaryRanks;