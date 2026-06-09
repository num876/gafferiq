const fs = require('fs');

const data = [
  // Serbian SuperLiga (16)
  { id: "redstar", name: "Red Star Belgrade", shortName: "Red Star", league: "Serbian SuperLiga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 74, stadium: "Rajko Mitić", capacity: 51755, budget: 15000 },
  { id: "partizan", name: "Partizan Belgrade", shortName: "Partizan", league: "Serbian SuperLiga", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 72, stadium: "Partizan Stadium", capacity: 29775, budget: 10000 },
  { id: "tsc", name: "TSC Bačka Topola", shortName: "TSC", league: "Serbian SuperLiga", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 68, stadium: "TSC Arena", capacity: 4500, budget: 5000 },
  { id: "cukaricki", name: "Čukarički", shortName: "Čukarički", league: "Serbian SuperLiga", primaryColor: "#ffffff", secondaryColor: "#000000", reputation: 67, stadium: "Čukarički Stadium", capacity: 4070, budget: 4000 },
  { id: "vojvodina", name: "Vojvodina", shortName: "Vojvodina", league: "Serbian SuperLiga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 68, stadium: "Karađorđe Stadium", capacity: 14458, budget: 4500 },
  { id: "radnicki1923", name: "Radnički 1923", shortName: "Radnički", league: "Serbian SuperLiga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 65, stadium: "Čika Dača", capacity: 15100, budget: 2000 },
  { id: "novipazar", name: "Novi Pazar", shortName: "Novi Pazar", league: "Serbian SuperLiga", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 64, stadium: "City Stadium Novi Pazar", capacity: 12000, budget: 1500 },
  { id: "spartak", name: "Spartak Subotica", shortName: "Spartak", league: "Serbian SuperLiga", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 64, stadium: "Subotica City Stadium", capacity: 13000, budget: 1500 },
  { id: "napredak", name: "Napredak Kruševac", shortName: "Napredak", league: "Serbian SuperLiga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 63, stadium: "Mladost Stadium", capacity: 10331, budget: 1200 },
  { id: "radnickinis", name: "Radnički Niš", shortName: "Radnički N", league: "Serbian SuperLiga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 64, stadium: "Čair Stadium", capacity: 18151, budget: 1500 },
  { id: "imt", name: "IMT", shortName: "IMT", league: "Serbian SuperLiga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 62, stadium: "Shopping Center Stadium", capacity: 5175, budget: 1000 },
  { id: "javor", name: "Javor Ivanjica", shortName: "Javor", league: "Serbian SuperLiga", primaryColor: "#ffffff", secondaryColor: "#dc2626", reputation: 62, stadium: "Ivanjica Stadium", capacity: 3000, budget: 1000 },
  { id: "zeleznicar", name: "Železničar Pančevo", shortName: "Železničar", league: "Serbian SuperLiga", primaryColor: "#ffffff", secondaryColor: "#1d4ed8", reputation: 61, stadium: "SC Mladost", capacity: 1200, budget: 800 },
  { id: "radnik", name: "Radnik Surdulica", shortName: "Radnik", league: "Serbian SuperLiga", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 62, stadium: "Surdulica City Stadium", capacity: 3312, budget: 900 },
  { id: "vozdovac", name: "Voždovac", shortName: "Voždovac", league: "Serbian SuperLiga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 63, stadium: "Voždovac Stadium", capacity: 5175, budget: 1100 },
  { id: "mladost", name: "Mladost Lučani", shortName: "Mladost", league: "Serbian SuperLiga", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 63, stadium: "Mladost Stadium", capacity: 5944, budget: 1000 },

  // Swiss Super League (12)
  { id: "youngboys", name: "Young Boys", shortName: "Young Boys", league: "Swiss Super League", primaryColor: "#facc15", secondaryColor: "#000000", reputation: 75, stadium: "Stadion Wankdorf", capacity: 31500, budget: 20000 },
  { id: "basel", name: "FC Basel", shortName: "Basel", league: "Swiss Super League", primaryColor: "#dc2626", secondaryColor: "#1d4ed8", reputation: 73, stadium: "St. Jakob-Park", capacity: 38512, budget: 15000 },
  { id: "servette", name: "Servette FC", shortName: "Servette", league: "Swiss Super League", primaryColor: "#7f1d1d", secondaryColor: "#ffffff", reputation: 71, stadium: "Stade de Genève", capacity: 30084, budget: 10000 },
  { id: "lugano", name: "FC Lugano", shortName: "Lugano", league: "Swiss Super League", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 70, stadium: "Stadio Cornaredo", capacity: 6330, budget: 8000 },
  { id: "zurich", name: "FC Zürich", shortName: "Zürich", league: "Swiss Super League", primaryColor: "#ffffff", secondaryColor: "#1d4ed8", reputation: 71, stadium: "Letzigrund", capacity: 26104, budget: 9000 },
  { id: "stgallen", name: "FC St. Gallen", shortName: "St. Gallen", league: "Swiss Super League", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 69, stadium: "Kybunpark", capacity: 19456, budget: 6000 },
  { id: "winterthur", name: "FC Winterthur", shortName: "Winterthur", league: "Swiss Super League", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 66, stadium: "Schützenwiese", capacity: 8400, budget: 4000 },
  { id: "luzern", name: "FC Luzern", shortName: "Luzern", league: "Swiss Super League", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 68, stadium: "Swissporarena", capacity: 16490, budget: 5500 },
  { id: "yverdon", name: "Yverdon-Sport FC", shortName: "Yverdon", league: "Swiss Super League", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 64, stadium: "Stade Municipal", capacity: 6600, budget: 3000 },
  { id: "lausanne", name: "FC Lausanne-Sport", shortName: "Lausanne", league: "Swiss Super League", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 67, stadium: "Stade de la Tuilière", capacity: 12544, budget: 5000 },
  { id: "grasshoppers", name: "Grasshopper Club", shortName: "Grasshoppers", league: "Swiss Super League", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 68, stadium: "Letzigrund", capacity: 26104, budget: 6000 },
  { id: "sion", name: "FC Sion", shortName: "Sion", league: "Swiss Super League", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 67, stadium: "Stade Tourbillon", capacity: 14283, budget: 4500 },

  // Ukrainian Premier League (16)
  { id: "shakhtar", name: "Shakhtar Donetsk", shortName: "Shakhtar", league: "Ukrainian Premier League", primaryColor: "#f97316", secondaryColor: "#000000", reputation: 78, stadium: "Olimpiyskiy", capacity: 70050, budget: 25000 },
  { id: "dynamokyiv", name: "Dynamo Kyiv", shortName: "Dynamo", league: "Ukrainian Premier League", primaryColor: "#ffffff", secondaryColor: "#1d4ed8", reputation: 76, stadium: "Olimpiyskiy", capacity: 70050, budget: 20000 },
  { id: "kryvbas", name: "Kryvbas Kryvyi Rih", shortName: "Kryvbas", league: "Ukrainian Premier League", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 70, stadium: "Hirnyk Stadium", capacity: 2500, budget: 7000 },
  { id: "dnipro1", name: "SC Dnipro-1", shortName: "Dnipro-1", league: "Ukrainian Premier League", primaryColor: "#facc15", secondaryColor: "#000000", reputation: 68, stadium: "Dnipro-Arena", capacity: 31003, budget: 5000 },
  { id: "polissya", name: "Polissya Zhytomyr", shortName: "Polissya", league: "Ukrainian Premier League", primaryColor: "#16a34a", secondaryColor: "#facc15", reputation: 69, stadium: "Tsentralnyi Stadion", capacity: 5928, budget: 6000 },
  { id: "rukh", name: "Rukh Lviv", shortName: "Rukh", league: "Ukrainian Premier League", primaryColor: "#facc15", secondaryColor: "#000000", reputation: 68, stadium: "Arena Lviv", capacity: 34915, budget: 5500 },
  { id: "lnz", name: "LNZ Cherkasy", shortName: "LNZ", league: "Ukrainian Premier League", primaryColor: "#6b21a8", secondaryColor: "#ffffff", reputation: 65, stadium: "Cherkasy Arena", capacity: 10321, budget: 4000 },
  { id: "oleksandriya", name: "FC Oleksandriya", shortName: "Oleksandriya", league: "Ukrainian Premier League", primaryColor: "#16a34a", secondaryColor: "#facc15", reputation: 67, stadium: "Nika Stadium", capacity: 7000, budget: 4500 },
  { id: "vorskla", name: "Vorskla Poltava", shortName: "Vorskla", league: "Ukrainian Premier League", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 66, stadium: "Oleksiy Butovsky", capacity: 24795, budget: 4000 },
  { id: "zorya", name: "Zorya Luhansk", shortName: "Zorya", league: "Ukrainian Premier League", primaryColor: "#000000", secondaryColor: "#ffffff", reputation: 67, stadium: "Slavutych-Arena", capacity: 11883, budget: 4500 },
  { id: "kolos", name: "Kolos Kovalivka", shortName: "Kolos", league: "Ukrainian Premier League", primaryColor: "#ffffff", secondaryColor: "#000000", reputation: 65, stadium: "Kolos Stadium", capacity: 5000, budget: 3500 },
  { id: "chornomorets", name: "Chornomorets Odesa", shortName: "Chornomorets", league: "Ukrainian Premier League", primaryColor: "#1d4ed8", secondaryColor: "#000000", reputation: 66, stadium: "Chornomorets Stadium", capacity: 34164, budget: 4000 },
  { id: "veres", name: "Veres Rivne", shortName: "Veres", league: "Ukrainian Premier League", primaryColor: "#dc2626", secondaryColor: "#000000", reputation: 64, stadium: "Avanhard Stadium", capacity: 4650, budget: 3000 },
  { id: "obolon", name: "Obolon Kyiv", shortName: "Obolon", league: "Ukrainian Premier League", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 64, stadium: "Obolon Arena", capacity: 5100, budget: 3000 },
  { id: "inhulets", name: "Inhulets Petrove", shortName: "Inhulets", league: "Ukrainian Premier League", primaryColor: "#facc15", secondaryColor: "#dc2626", reputation: 63, stadium: "Inhulets Stadium", capacity: 1869, budget: 2500 },
  { id: "karpaty", name: "Karpaty Lviv", shortName: "Karpaty", league: "Ukrainian Premier League", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 66, stadium: "Ukraina Stadium", capacity: 27925, budget: 4000 },

  // Danish Superliga (12)
  { id: "midtjylland", name: "FC Midtjylland", shortName: "Midtjylland", league: "Danish Superliga", primaryColor: "#000000", secondaryColor: "#dc2626", reputation: 75, stadium: "MCH Arena", capacity: 11800, budget: 18000 },
  { id: "brondby", name: "Brøndby IF", shortName: "Brøndby", league: "Danish Superliga", primaryColor: "#facc15", secondaryColor: "#1d4ed8", reputation: 73, stadium: "Brøndby Stadium", capacity: 28000, budget: 14000 },
  { id: "copenhagen", name: "FC Copenhagen", shortName: "Copenhagen", league: "Danish Superliga", primaryColor: "#ffffff", secondaryColor: "#1d4ed8", reputation: 76, stadium: "Parken", capacity: 38065, budget: 22000 },
  { id: "nordsjaelland", name: "FC Nordsjælland", shortName: "Nordsjælland", league: "Danish Superliga", primaryColor: "#dc2626", secondaryColor: "#facc15", reputation: 72, stadium: "Right to Dream Park", capacity: 10300, budget: 12000 },
  { id: "agf", name: "AGF", shortName: "AGF", league: "Danish Superliga", primaryColor: "#ffffff", secondaryColor: "#1d4ed8", reputation: 70, stadium: "Ceres Park", capacity: 19433, budget: 8000 },
  { id: "silkeborg", name: "Silkeborg IF", shortName: "Silkeborg", league: "Danish Superliga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 69, stadium: "JYSK Park", capacity: 10000, budget: 6000 },
  { id: "randers", name: "Randers FC", shortName: "Randers", league: "Danish Superliga", primaryColor: "#000000", secondaryColor: "#38bdf8", reputation: 68, stadium: "Cepheus Park", capacity: 10300, budget: 5000 },
  { id: "viborg", name: "Viborg FF", shortName: "Viborg", league: "Danish Superliga", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 68, stadium: "Energi Viborg Arena", capacity: 9566, budget: 5000 },
  { id: "aab", name: "AaB", shortName: "AaB", league: "Danish Superliga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 69, stadium: "Aalborg Portland Park", capacity: 13797, budget: 5500 },
  { id: "sonderjyske", name: "SønderjyskE", shortName: "SønderjyskE", league: "Danish Superliga", primaryColor: "#38bdf8", secondaryColor: "#ffffff", reputation: 66, stadium: "Sydbank Park", capacity: 10100, budget: 4000 },
  { id: "vejle", name: "Vejle Boldklub", shortName: "Vejle", league: "Danish Superliga", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 65, stadium: "Vejle Stadium", capacity: 10418, budget: 3500 },
  { id: "lyngby", name: "Lyngby BK", shortName: "Lyngby", league: "Danish Superliga", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 65, stadium: "Lyngby Stadium", capacity: 10100, budget: 3500 },

  // Allsvenskan (16)
  { id: "malmo", name: "Malmö FF", shortName: "Malmö", league: "Allsvenskan", primaryColor: "#38bdf8", secondaryColor: "#ffffff", reputation: 74, stadium: "Eleda Stadion", capacity: 22500, budget: 16000 },
  { id: "elfsborg", name: "IF Elfsborg", shortName: "Elfsborg", league: "Allsvenskan", primaryColor: "#facc15", secondaryColor: "#000000", reputation: 71, stadium: "Borås Arena", capacity: 16200, budget: 9000 },
  { id: "hacken", name: "BK Häcken", shortName: "Häcken", league: "Allsvenskan", primaryColor: "#facc15", secondaryColor: "#000000", reputation: 70, stadium: "Bravida Arena", capacity: 6316, budget: 8000 },
  { id: "djurgarden", name: "Djurgårdens IF", shortName: "Djurgården", league: "Allsvenskan", primaryColor: "#1d4ed8", secondaryColor: "#38bdf8", reputation: 72, stadium: "Tele2 Arena", capacity: 30000, budget: 11000 },
  { id: "varnamo", name: "IFK Värnamo", shortName: "Värnamo", league: "Allsvenskan", primaryColor: "#ffffff", secondaryColor: "#1d4ed8", reputation: 65, stadium: "Finnvedsvallen", capacity: 5000, budget: 3000 },
  { id: "kalmar", name: "Kalmar FF", shortName: "Kalmar", league: "Allsvenskan", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 67, stadium: "Guldfågeln Arena", capacity: 12150, budget: 4500 },
  { id: "hammarby", name: "Hammarby IF", shortName: "Hammarby", league: "Allsvenskan", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 71, stadium: "Tele2 Arena", capacity: 30000, budget: 10000 },
  { id: "sirius", name: "IK Sirius", shortName: "Sirius", league: "Allsvenskan", primaryColor: "#1d4ed8", secondaryColor: "#000000", reputation: 66, stadium: "Studenternas IP", capacity: 10250, budget: 3500 },
  { id: "norrkoping", name: "IFK Norrköping", shortName: "Norrköping", league: "Allsvenskan", primaryColor: "#ffffff", secondaryColor: "#1d4ed8", reputation: 68, stadium: "PlatinumCars Arena", capacity: 16000, budget: 5000 },
  { id: "mjallby", name: "Mjällby AIF", shortName: "Mjällby", league: "Allsvenskan", primaryColor: "#facc15", secondaryColor: "#000000", reputation: 66, stadium: "Strandvallen", capacity: 6000, budget: 3500 },
  { id: "aik", name: "AIK", shortName: "AIK", league: "Allsvenskan", primaryColor: "#000000", secondaryColor: "#facc15", reputation: 72, stadium: "Friends Arena", capacity: 50000, budget: 11000 },
  { id: "halmstad", name: "Halmstads BK", shortName: "Halmstad", league: "Allsvenskan", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 65, stadium: "Örjans Vall", capacity: 10873, budget: 3000 },
  { id: "goteborg", name: "IFK Göteborg", shortName: "Göteborg", league: "Allsvenskan", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 70, stadium: "Gamla Ullevi", capacity: 18416, budget: 7000 },
  { id: "brommapojkarna", name: "IF Brommapojkarna", shortName: "Brommapojkarna", league: "Allsvenskan", primaryColor: "#dc2626", secondaryColor: "#000000", reputation: 65, stadium: "Grimsta IP", capacity: 5000, budget: 2500 },
  { id: "gais", name: "GAIS", shortName: "GAIS", league: "Allsvenskan", primaryColor: "#16a34a", secondaryColor: "#000000", reputation: 66, stadium: "Gamla Ullevi", capacity: 18416, budget: 3500 },
  { id: "vasteras", name: "Västerås SK", shortName: "Västerås", league: "Allsvenskan", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 64, stadium: "Hitachi Energy Arena", capacity: 7000, budget: 2500 },

  // Russian Premier League (16)
  { id: "zenit", name: "Zenit Saint Petersburg", shortName: "Zenit", league: "Russian Premier League", primaryColor: "#38bdf8", secondaryColor: "#ffffff", reputation: 77, stadium: "Gazprom Arena", capacity: 67800, budget: 30000 },
  { id: "krasnodar", name: "FC Krasnodar", shortName: "Krasnodar", league: "Russian Premier League", primaryColor: "#16a34a", secondaryColor: "#000000", reputation: 74, stadium: "Krasnodar Stadium", capacity: 35179, budget: 18000 },
  { id: "dynamomoscow", name: "Dynamo Moscow", shortName: "Dynamo", league: "Russian Premier League", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 73, stadium: "VTB Arena", capacity: 25716, budget: 15000 },
  { id: "lokomotiv", name: "Lokomotiv Moscow", shortName: "Lokomotiv", league: "Russian Premier League", primaryColor: "#dc2626", secondaryColor: "#16a34a", reputation: 73, stadium: "RZD Arena", capacity: 27320, budget: 15000 },
  { id: "spartakmoscow", name: "Spartak Moscow", shortName: "Spartak", league: "Russian Premier League", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 74, stadium: "Otkritie Bank Arena", capacity: 45360, budget: 17000 },
  { id: "cska", name: "CSKA Moscow", shortName: "CSKA", league: "Russian Premier League", primaryColor: "#dc2626", secondaryColor: "#1d4ed8", reputation: 74, stadium: "VEB Arena", capacity: 30114, budget: 16000 },
  { id: "rostov", name: "FC Rostov", shortName: "Rostov", league: "Russian Premier League", primaryColor: "#facc15", secondaryColor: "#1d4ed8", reputation: 71, stadium: "Rostov Arena", capacity: 43472, budget: 10000 },
  { id: "rubin", name: "Rubin Kazan", shortName: "Rubin", league: "Russian Premier League", primaryColor: "#7f1d1d", secondaryColor: "#16a34a", reputation: 70, stadium: "Ak Bars Arena", capacity: 45379, budget: 8000 },
  { id: "krylia", name: "Krylia Sovetov", shortName: "Krylia", league: "Russian Premier League", primaryColor: "#38bdf8", secondaryColor: "#ffffff", reputation: 69, stadium: "Solidarnost Arena", capacity: 44918, budget: 7000 },
  { id: "akhmat", name: "Akhmat Grozny", shortName: "Akhmat", league: "Russian Premier League", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 68, stadium: "Akhmat-Arena", capacity: 30597, budget: 6000 },
  { id: "fakel", name: "Fakel Voronezh", shortName: "Fakel", league: "Russian Premier League", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 67, stadium: "Tsentralnyi Profsoyuz", capacity: 31793, budget: 5000 },
  { id: "orenburg", name: "FC Orenburg", shortName: "Orenburg", league: "Russian Premier League", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 67, stadium: "Gazovik Stadium", capacity: 10046, budget: 5000 },
  { id: "parinn", name: "Pari Nizhny Novgorod", shortName: "Pari NN", league: "Russian Premier League", primaryColor: "#38bdf8", secondaryColor: "#ffffff", reputation: 68, stadium: "Nizhny Novgorod", capacity: 44899, budget: 5500 },
  { id: "dynamomakhachkala", name: "Dynamo Makhachkala", shortName: "Dynamo M", league: "Russian Premier League", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 66, stadium: "Anzhi Arena", capacity: 26500, budget: 4500 },
  { id: "khimki", name: "FC Khimki", shortName: "Khimki", league: "Russian Premier League", primaryColor: "#dc2626", secondaryColor: "#000000", reputation: 65, stadium: "Arena Khimki", capacity: 18636, budget: 4000 },
  { id: "akron", name: "Akron Tolyatti", shortName: "Akron", league: "Russian Premier League", primaryColor: "#dc2626", secondaryColor: "#000000", reputation: 66, stadium: "Kristall Stadium", capacity: 3000, budget: 4500 },

  // Ekstraklasa (18)
  { id: "jagiellonia", name: "Jagiellonia Białystok", shortName: "Jagiellonia", league: "Ekstraklasa", primaryColor: "#facc15", secondaryColor: "#dc2626", reputation: 71, stadium: "Białystok City Stadium", capacity: 22386, budget: 7000 },
  { id: "slask", name: "Śląsk Wrocław", shortName: "Śląsk", league: "Ekstraklasa", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 70, stadium: "Tarczyński Arena", capacity: 42771, budget: 6000 },
  { id: "legia", name: "Legia Warsaw", shortName: "Legia", league: "Ekstraklasa", primaryColor: "#ffffff", secondaryColor: "#000000", reputation: 74, stadium: "Stadion Wojska Polskiego", capacity: 31103, budget: 14000 },
  { id: "pogon", name: "Pogoń Szczecin", shortName: "Pogoń", league: "Ekstraklasa", primaryColor: "#1d4ed8", secondaryColor: "#7f1d1d", reputation: 71, stadium: "Stadion Miejski im. Floriana", capacity: 21163, budget: 7000 },
  { id: "lech", name: "Lech Poznań", shortName: "Lech", league: "Ekstraklasa", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 73, stadium: "Stadion Miejski", capacity: 42837, budget: 11000 },
  { id: "gornik", name: "Górnik Zabrze", shortName: "Górnik", league: "Ekstraklasa", primaryColor: "#ffffff", secondaryColor: "#dc2626", reputation: 69, stadium: "Stadion im. Ernesta Pohla", capacity: 24563, budget: 5500 },
  { id: "rakow", name: "Raków Częstochowa", shortName: "Raków", league: "Ekstraklasa", primaryColor: "#dc2626", secondaryColor: "#1d4ed8", reputation: 72, stadium: "Miejski Stadion Piłkarski", capacity: 5500, budget: 9000 },
  { id: "zaglebie", name: "Zagłębie Lubin", shortName: "Zagłębie", league: "Ekstraklasa", primaryColor: "#f97316", secondaryColor: "#16a34a", reputation: 68, stadium: "Stadion Zagłębia", capacity: 16068, budget: 4500 },
  { id: "widzew", name: "Widzew Łódź", shortName: "Widzew", league: "Ekstraklasa", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 69, stadium: "Stadion Miejski Widzewa", capacity: 18018, budget: 5000 },
  { id: "piast", name: "Piast Gliwice", shortName: "Piast", league: "Ekstraklasa", primaryColor: "#1d4ed8", secondaryColor: "#dc2626", reputation: 68, stadium: "Stadion Miejski", capacity: 10037, budget: 4500 },
  { id: "stal", name: "Stal Mielec", shortName: "Stal", league: "Ekstraklasa", primaryColor: "#ffffff", secondaryColor: "#38bdf8", reputation: 66, stadium: "Stadion MOSiR", capacity: 6864, budget: 3000 },
  { id: "puszcza", name: "Puszcza Niepołomice", shortName: "Puszcza", league: "Ekstraklasa", primaryColor: "#facc15", secondaryColor: "#16a34a", reputation: 65, stadium: "Stadion Miejski", capacity: 2118, budget: 2500 },
  { id: "cracovia", name: "Cracovia", shortName: "Cracovia", league: "Ekstraklasa", primaryColor: "#ffffff", secondaryColor: "#dc2626", reputation: 68, stadium: "Stadion Cracovii", capacity: 15016, budget: 4500 },
  { id: "korona", name: "Korona Kielce", shortName: "Korona", league: "Ekstraklasa", primaryColor: "#facc15", secondaryColor: "#dc2626", reputation: 66, stadium: "Suzuki Arena", capacity: 15550, budget: 3000 },
  { id: "radomiak", name: "Radomiak Radom", shortName: "Radomiak", league: "Ekstraklasa", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 67, stadium: "Stadion im. Braci Czachorów", capacity: 8840, budget: 3500 },
  { id: "lechia", name: "Lechia Gdańsk", shortName: "Lechia", league: "Ekstraklasa", primaryColor: "#16a34a", secondaryColor: "#ffffff", reputation: 69, stadium: "Polsat Plus Arena", capacity: 41620, budget: 5500 },
  { id: "gks", name: "GKS Katowice", shortName: "GKS", league: "Ekstraklasa", primaryColor: "#facc15", secondaryColor: "#000000", reputation: 66, stadium: "Stadion GKS Katowice", capacity: 6710, budget: 3000 },
  { id: "motor", name: "Motor Lublin", shortName: "Motor", league: "Ekstraklasa", primaryColor: "#facc15", secondaryColor: "#1d4ed8", reputation: 66, stadium: "Arena Lublin", capacity: 15243, budget: 3500 },

  // Prva HNL (10)
  { id: "dinamozagreb", name: "Dinamo Zagreb", shortName: "Dinamo", league: "Prva HNL", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 76, stadium: "Stadion Maksimir", capacity: 35123, budget: 20000 },
  { id: "rijeka", name: "HNK Rijeka", shortName: "Rijeka", league: "Prva HNL", primaryColor: "#ffffff", secondaryColor: "#38bdf8", reputation: 72, stadium: "Stadion Rujevica", capacity: 8279, budget: 8000 },
  { id: "hajduk", name: "Hajduk Split", shortName: "Hajduk", league: "Prva HNL", primaryColor: "#ffffff", secondaryColor: "#1d4ed8", reputation: 73, stadium: "Stadion Poljud", capacity: 33987, budget: 11000 },
  { id: "osijek", name: "NK Osijek", shortName: "Osijek", league: "Prva HNL", primaryColor: "#ffffff", secondaryColor: "#1d4ed8", reputation: 70, stadium: "Opus Arena", capacity: 13005, budget: 6000 },
  { id: "lokomotiva", name: "Lokomotiva Zagreb", shortName: "Lokomotiva", league: "Prva HNL", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 67, stadium: "Stadion Kranjčevićeva", capacity: 5350, budget: 3000 },
  { id: "varazdin", name: "NK Varaždin", shortName: "Varaždin", league: "Prva HNL", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 66, stadium: "Stadion Varteks", capacity: 8850, budget: 2500 },
  { id: "gorica", name: "HNK Gorica", shortName: "Gorica", league: "Prva HNL", primaryColor: "#dc2626", secondaryColor: "#ffffff", reputation: 66, stadium: "Stadion Radnik", capacity: 5200, budget: 2500 },
  { id: "istra", name: "Istra 1961", shortName: "Istra", league: "Prva HNL", primaryColor: "#16a34a", secondaryColor: "#facc15", reputation: 65, stadium: "Stadion Aldo Drosina", capacity: 8923, budget: 2000 },
  { id: "slaven", name: "Slaven Belupo", shortName: "Slaven", league: "Prva HNL", primaryColor: "#1d4ed8", secondaryColor: "#ffffff", reputation: 65, stadium: "Gradski Stadion Ivan Kušek-Apaš", capacity: 3205, budget: 1500 },
  { id: "sibenik", name: "HNK Šibenik", shortName: "Šibenik", league: "Prva HNL", primaryColor: "#f97316", secondaryColor: "#000000", reputation: 64, stadium: "Stadion Šubićevac", capacity: 3412, budget: 1500 }
];

let out = "";
let currentLeague = "";
for (const c of data) {
    if (c.league !== currentLeague) {
        currentLeague = c.league;
        out += `\n  // ${currentLeague}\n`;
    }
    const transfer = c.budget * 1000;
    const wage = Math.floor(transfer * 0.05);
    const bank = transfer * 2.5;
    const cond = 60 + Math.floor(Math.random() * 35);
    const ticket = 20 + Math.floor(c.reputation / 2) - 10;
    
    out += `  { id: "${c.id}", name: "${c.name}", shortName: "${c.shortName}", league: "${c.league}", primaryColor: "${c.primaryColor}", secondaryColor: "${c.secondaryColor}", reputation: ${c.reputation}, stadium: "${c.stadium}", capacity: ${c.capacity}, transferBudget: ${transfer}, wageBudget: ${wage}, bankBalance: ${bank}, ticketPrice: ${ticket}, stadiumCondition: ${cond}, sponsorships: [] },\n`;
}

let existing = fs.readFileSync('src/config/seededData.ts', 'utf8');

// Insert out just before the final ]; of CLUBS_DATA
existing = existing.replace('];\n\nexport const STAR_PLAYERS_PRESET', out + '];\n\nexport const STAR_PLAYERS_PRESET');

fs.writeFileSync('src/config/seededData.ts', existing);
console.log("Successfully injected all 116 clubs!");
