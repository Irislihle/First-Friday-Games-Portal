export const rosters = [
    {
        id:1,
        name: "Team Red",
        color: "#ff0000",
        players: [
            {id:"r1-1", name:"Mothibedi"},
            {id:"r1-2", name:"Mokgadi"},
            {id:"r1-3", name:"Thatego"},
            {id:"r1-4", name:"Stanton"},
            {id:"r1-5", name:"Elmarie"},
            {id:"r1-6", name:"Mathapelo"}
        ],
        points:110,
        Division: "B"
    },
    {
        id:2,
        name: "Team White",
        color: "#a8b9c5",
        players: [
            {id:"r2-1", name:"JoeL"},
            {id:"r2-2", name:"Confidence"},
            {id:"r2-3", name:"Martinus"},
            {id:"r2-4", name:"Bongiwe"},
            {id:"r2-5", name:"Taki"},
            {id:"r2-6", name:"Clifford"}
        ],
        points:142,
        Division: "A"
    },
    {
        id:3,
        name: "Team Black",
        color: "#000000",
        players: [
            {id:"r3-1", name:"Joel"},
            {id:"r3-2", name:"Thabiso"},
            {id:"r3-3", name:"Khaya"},
            {id:"r3-4", name:"Khumo"},
            {id:"r3-5", name:"Wiseman"},
            {id:"r3-6", name:"Vincent"}
        ],
        points:95,
        Division: "C"
    },
];

export const liveGame = {
    name: "Maths Quiz",
    status: "LIVE",
    teams:[{name:'Team Red', points:50},
           {name:'Team White', points:45},
           {name:'Team Black', points:30}
   ],
};

export const leaderboard =[
    {rank:1, name: "Team Red", points: 260},
    {rank:2, name: "Team White", points: 246},
    {rank:3, name: "Team Black", points: 249}
];

export const stats = {
    totalTeams:3,
    players: 18,
    gamesPlayed: 5,
    leader: {name:"Team Red", points: 260},
    division: "A",
    AvgPerTeam: 120,
    season: "2026",
    week:"week 3"

};

export const chartData = [
    {season: 'FFG 1', 'Team Red':110, 'Team White':142, 'Team Black':95},
    {season: 'FFG 2', 'Team Red':70, 'Team White':44, 'Team Black':95},
    {season: 'FFG 3', 'Team Red':80, 'Team White':60, 'Team Black':59},
    {season: 'FFG 4', 'Team Red': 40, 'Team White': 44, 'Team Black': 12 },
    {season: 'FFG 5', 'Team Red': 30, 'Team White': 76, 'Team Black': 20 }, 
    {season: 'FFG 6', 'Team Red': 145, 'Team White': 120, 'Team Black': 180 }
]

