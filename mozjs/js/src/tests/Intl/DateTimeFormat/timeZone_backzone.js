// |reftest| skip-if(!this.hasOwnProperty("Intl"))

// Generated by make_intl_data.py. DO NOT EDIT.
// tzdata version = 2017b

const tzMapper = [
    x => x,
    x => x.toUpperCase(),
    x => x.toLowerCase(),
];

// This file was generated with historical, pre-1970 backzone information
// respected. Therefore, every zone key listed below is its own Zone, not
// a Link to a modern-day target as IANA ignoring backzones would say.

// Backzone zones derived from IANA Time Zone Database.
const links = {
    "Africa/Addis_Ababa": "Africa/Addis_Ababa",
    "Africa/Asmara": "Africa/Asmara",
    "Africa/Bamako": "Africa/Bamako",
    "Africa/Bangui": "Africa/Bangui",
    "Africa/Banjul": "Africa/Banjul",
    "Africa/Blantyre": "Africa/Blantyre",
    "Africa/Brazzaville": "Africa/Brazzaville",
    "Africa/Bujumbura": "Africa/Bujumbura",
    "Africa/Conakry": "Africa/Conakry",
    "Africa/Dakar": "Africa/Dakar",
    "Africa/Dar_es_Salaam": "Africa/Dar_es_Salaam",
    "Africa/Djibouti": "Africa/Djibouti",
    "Africa/Douala": "Africa/Douala",
    "Africa/Freetown": "Africa/Freetown",
    "Africa/Gaborone": "Africa/Gaborone",
    "Africa/Harare": "Africa/Harare",
    "Africa/Juba": "Africa/Juba",
    "Africa/Kampala": "Africa/Kampala",
    "Africa/Kigali": "Africa/Kigali",
    "Africa/Kinshasa": "Africa/Kinshasa",
    "Africa/Libreville": "Africa/Libreville",
    "Africa/Lome": "Africa/Lome",
    "Africa/Luanda": "Africa/Luanda",
    "Africa/Lubumbashi": "Africa/Lubumbashi",
    "Africa/Lusaka": "Africa/Lusaka",
    "Africa/Malabo": "Africa/Malabo",
    "Africa/Maseru": "Africa/Maseru",
    "Africa/Mbabane": "Africa/Mbabane",
    "Africa/Mogadishu": "Africa/Mogadishu",
    "Africa/Niamey": "Africa/Niamey",
    "Africa/Nouakchott": "Africa/Nouakchott",
    "Africa/Ouagadougou": "Africa/Ouagadougou",
    "Africa/Porto-Novo": "Africa/Porto-Novo",
    "Africa/Sao_Tome": "Africa/Sao_Tome",
    "Africa/Timbuktu": "Africa/Timbuktu",
    "America/Anguilla": "America/Anguilla",
    "America/Antigua": "America/Antigua",
    "America/Argentina/ComodRivadavia": "America/Argentina/ComodRivadavia",
    "America/Aruba": "America/Aruba",
    "America/Cayman": "America/Cayman",
    "America/Coral_Harbour": "America/Coral_Harbour",
    "America/Dominica": "America/Dominica",
    "America/Ensenada": "America/Ensenada",
    "America/Grenada": "America/Grenada",
    "America/Guadeloupe": "America/Guadeloupe",
    "America/Montreal": "America/Montreal",
    "America/Montserrat": "America/Montserrat",
    "America/Rosario": "America/Rosario",
    "America/St_Kitts": "America/St_Kitts",
    "America/St_Lucia": "America/St_Lucia",
    "America/St_Thomas": "America/St_Thomas",
    "America/St_Vincent": "America/St_Vincent",
    "America/Tortola": "America/Tortola",
    "Antarctica/McMurdo": "Antarctica/McMurdo",
    "Asia/Aden": "Asia/Aden",
    "Asia/Bahrain": "Asia/Bahrain",
    "Asia/Chongqing": "Asia/Chongqing",
    "Asia/Harbin": "Asia/Harbin",
    "Asia/Kashgar": "Asia/Kashgar",
    "Asia/Kuwait": "Asia/Kuwait",
    "Asia/Muscat": "Asia/Muscat",
    "Asia/Phnom_Penh": "Asia/Phnom_Penh",
    "Asia/Tel_Aviv": "Asia/Tel_Aviv",
    "Asia/Vientiane": "Asia/Vientiane",
    "Atlantic/Jan_Mayen": "Atlantic/Jan_Mayen",
    "Atlantic/St_Helena": "Atlantic/St_Helena",
    "Europe/Belfast": "Europe/Belfast",
    "Europe/Guernsey": "Europe/Guernsey",
    "Europe/Isle_of_Man": "Europe/Isle_of_Man",
    "Europe/Jersey": "Europe/Jersey",
    "Europe/Ljubljana": "Europe/Ljubljana",
    "Europe/Sarajevo": "Europe/Sarajevo",
    "Europe/Skopje": "Europe/Skopje",
    "Europe/Tiraspol": "Europe/Tiraspol",
    "Europe/Vaduz": "Europe/Vaduz",
    "Europe/Zagreb": "Europe/Zagreb",
    "Indian/Antananarivo": "Indian/Antananarivo",
    "Indian/Comoro": "Indian/Comoro",
    "Indian/Mayotte": "Indian/Mayotte",
    "Pacific/Johnston": "Pacific/Johnston",
    "Pacific/Midway": "Pacific/Midway",
    "Pacific/Saipan": "Pacific/Saipan",
};

for (let [linkName, target] of Object.entries(links)) {
    if (target === "Etc/UTC" || target === "Etc/GMT")
        target = "UTC";

    for (let map of tzMapper) {
        let dtf = new Intl.DateTimeFormat(undefined, {timeZone: map(linkName)});
        let resolvedTimeZone = dtf.resolvedOptions().timeZone;
        assertEq(resolvedTimeZone, target, `${linkName} -> ${target}`);
    }
}


if (typeof reportCompare === "function")
    reportCompare(0, 0, "ok");

