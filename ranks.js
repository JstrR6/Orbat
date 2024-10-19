const militaryRanks = {
  "General Officer": [
    {
      name: "General of the Armed Forces",
      description: "Highest possible rank, only in times of war"
    },
    {
      name: "General",
      description: "Most senior general officer rank, army commander"
    },
    {
      name: "Lieutenant General",
      description: "Corps commander or very senior staff officer"
    },
    {
      name: "Major General",
      description: "Division commander or senior staff officer"
    },
    {
      name: "Brigadier General",
      description: "Lowest general officer rank, often commands a brigade"
    }
  ],
  "Company Grade Officer": [
    {
      name: "Colonel",
      description: "Brigade commander or senior staff officer"
    },
    {
      name: "Lieutenant Colonel",
      description: "Battalion commander or senior staff officer"
    },
    {
      name: "Major",
      description: "Battalion executive officer or staff officer"
    }
  ],
  "Squadron Grade Officer": [
    {
      name: "Captain",
      description: "Company commander or staff officer"
    },
    {
      name: "First Lieutenant",
      description: "Company executive officer or platoon leader"
    },
    {
      name: "Second Lieutenant",
      description: "Entry-level commissioned officer"
    }
  ],
  "Senior Non-Commissioned Officer": [
    {
      name: "Sergeant Major of the Armed Forces",
      description: "Most senior enlisted member of the armed forces"
    },
    {
      name: "Command Sergeant Major",
      description: "Senior enlisted advisor to the commanding officer"
    },
    {
      name: "Sergeant Major",
      description: "Most senior non-commissioned officer rank"
    },
    {
      name: "First Sergeant",
      description: "Senior non-commissioned officer, principal advisor to the company commander"
    }
  ],
  "Non-Commissioned Officer": [
    {
      name: "Master Sergeant",
      description: "Senior non-commissioned officer, principal NCO at battalion level"
    },
    {
      name: "Sergeant First Class",
      description: "Senior non-commissioned officer, primary platoon advisor"
    },
    {
      name: "Staff Sergeant",
      description: "Senior non-commissioned officer, platoon sergeant"
    },
    {
      name: "Sergeant",
      description: "Non-commissioned officer, squad leader"
    }
  ],
  "Soldier": [
    {
      name: "Corporal",
      description: "Junior non-commissioned officer, team leader"
    },
    {
      name: "Specialist",
      description: "Experienced soldier with technical expertise"
    },
    {
      name: "Private First Class",
      description: "Experienced private with additional responsibilities"
    },
    {
      name: "Private",
      description: "Entry-level rank, basic trained soldier"
    }
  ]
};

module.exports = militaryRanks;