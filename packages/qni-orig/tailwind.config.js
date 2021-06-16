module.exports = {
  mode: "jit",
  purge: {
    enabled: ["production"].includes(process.env.NODE_ENV),
    content: [
      "./**/*.html.erb",
      "./app/helpers/**/*.rb",
      "./app/javascript/**/*.js",
    ],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    scale: {
      "0": "0",
      "1": ".01",
      "2": ".02",
      "3": ".03",
      "4": ".04",
      "5": ".05",
      "6": ".06",
      "7": ".07",
      "8": ".08",
      "9": ".09",
      "10": ".10",
      "11": ".11",
      "12": ".12",
      "13": ".13",
      "14": ".14",
      "15": ".15",
      "16": ".16",
      "17": ".17",
      "18": ".18",
      "19": ".19",
      "20": ".20",
      "21": ".21",
      "22": ".22",
      "23": ".23",
      "24": ".24",
      "25": ".25",
      "26": ".26",
      "27": ".27",
      "28": ".28",
      "29": ".29",
      "30": ".30",
      "31": ".31",
      "32": ".32",
      "33": ".33",
      "34": ".34",
      "35": ".35",
      "36": ".36",
      "37": ".37",
      "38": ".38",
      "39": ".39",
      "40": ".40",
      "41": ".41",
      "42": ".42",
      "43": ".43",
      "44": ".44",
      "45": ".45",
      "46": ".46",
      "47": ".47",
      "48": ".48",
      "49": ".49",
      "50": ".50",
      "51": ".51",
      "52": ".52",
      "53": ".53",
      "54": ".54",
      "55": ".55",
      "56": ".56",
      "57": ".57",
      "58": ".58",
      "59": ".59",
      "60": ".60",
      "61": ".61",
      "62": ".62",
      "63": ".63",
      "64": ".64",
      "65": ".65",
      "66": ".66",
      "67": ".67",
      "68": ".68",
      "69": ".69",
      "70": ".70",
      "71": ".71",
      "72": ".72",
      "73": ".73",
      "74": ".74",
      "75": ".75",
      "76": ".76",
      "77": ".77",
      "78": ".78",
      "79": ".79",
      "80": ".80",
      "81": ".81",
      "82": ".82",
      "83": ".83",
      "84": ".84",
      "85": ".85",
      "86": ".86",
      "87": ".87",
      "88": ".88",
      "89": ".89",
      "90": ".90",
      "91": ".91",
      "92": ".92",
      "93": ".93",
      "94": ".94",
      "95": ".95",
      "96": ".96",
      "97": ".97",
      "98": ".98",
      "99": ".99",
      "100": "1",
      "125": "1.25",
      "150": "1.5",
    },
    rotate: {
      "0": "0",
      "1": "1deg",
      "2": "2deg",
      "3": "3deg",
      "4": "4deg",
      "5": "5deg",
      "6": "6deg",
      "7": "7deg",
      "8": "8deg",
      "9": "9deg",
      "10": "10deg",
      "11": "11deg",
      "12": "12deg",
      "13": "13deg",
      "14": "14deg",
      "15": "15deg",
      "16": "16deg",
      "17": "17deg",
      "18": "18deg",
      "19": "19deg",
      "20": "20deg",
      "21": "21deg",
      "22": "22deg",
      "23": "23deg",
      "24": "24deg",
      "25": "25deg",
      "26": "26deg",
      "27": "27deg",
      "28": "28deg",
      "29": "29deg",
      "30": "30deg",
      "31": "31deg",
      "32": "32deg",
      "33": "33deg",
      "34": "34deg",
      "35": "35deg",
      "36": "36deg",
      "37": "37deg",
      "38": "38deg",
      "39": "39deg",
      "40": "40deg",
      "41": "41deg",
      "42": "42deg",
      "43": "43deg",
      "44": "44deg",
      "45": "45deg",
      "46": "46deg",
      "47": "47deg",
      "48": "48deg",
      "49": "49deg",
      "50": "50deg",
      "51": "51deg",
      "52": "52deg",
      "53": "53deg",
      "54": "54deg",
      "55": "55deg",
      "56": "56deg",
      "57": "57deg",
      "58": "58deg",
      "59": "59deg",
      "60": "60deg",
      "61": "61deg",
      "62": "62deg",
      "63": "63deg",
      "64": "64deg",
      "65": "65deg",
      "66": "66deg",
      "67": "67deg",
      "68": "68deg",
      "69": "69deg",
      "70": "70deg",
      "71": "71deg",
      "72": "72deg",
      "73": "73deg",
      "74": "74deg",
      "75": "75deg",
      "76": "76deg",
      "77": "77deg",
      "78": "78deg",
      "79": "79deg",
      "80": "80deg",
      "81": "81deg",
      "82": "82deg",
      "83": "83deg",
      "84": "84deg",
      "85": "85deg",
      "86": "86deg",
      "87": "87deg",
      "88": "88deg",
      "89": "89deg",
      "90": "90deg",
      "91": "91deg",
      "92": "92deg",
      "93": "93deg",
      "94": "94deg",
      "95": "95deg",
      "96": "96deg",
      "97": "97deg",
      "98": "98deg",
      "99": "99deg",
      "100": "100deg",
      "101": "101deg",
      "102": "102deg",
      "103": "103deg",
      "104": "104deg",
      "105": "105deg",
      "106": "106deg",
      "107": "107deg",
      "108": "108deg",
      "109": "109deg",
      "110": "110deg",
      "111": "111deg",
      "112": "112deg",
      "113": "113deg",
      "114": "114deg",
      "115": "115deg",
      "116": "116deg",
      "117": "117deg",
      "118": "118deg",
      "119": "119deg",
      "120": "120deg",
      "121": "121deg",
      "122": "122deg",
      "123": "123deg",
      "124": "124deg",
      "125": "125deg",
      "126": "126deg",
      "127": "127deg",
      "128": "128deg",
      "129": "129deg",
      "130": "130deg",
      "131": "131deg",
      "132": "132deg",
      "133": "133deg",
      "134": "134deg",
      "135": "135deg",
      "136": "136deg",
      "137": "137deg",
      "138": "138deg",
      "139": "139deg",
      "140": "140deg",
      "141": "141deg",
      "142": "142deg",
      "143": "143deg",
      "144": "144deg",
      "145": "145deg",
      "146": "146deg",
      "147": "147deg",
      "148": "148deg",
      "149": "149deg",
      "150": "150deg",
      "151": "151deg",
      "152": "152deg",
      "153": "153deg",
      "154": "154deg",
      "155": "155deg",
      "156": "156deg",
      "157": "157deg",
      "158": "158deg",
      "159": "159deg",
      "160": "160deg",
      "161": "161deg",
      "162": "162deg",
      "163": "163deg",
      "164": "164deg",
      "165": "165deg",
      "166": "166deg",
      "167": "167deg",
      "168": "168deg",
      "169": "169deg",
      "170": "170deg",
      "171": "171deg",
      "172": "172deg",
      "173": "173deg",
      "174": "174deg",
      "175": "175deg",
      "176": "176deg",
      "177": "177deg",
      "178": "178deg",
      "179": "179deg",
      "180": "180deg",
      "181": "181deg",
      "182": "182deg",
      "183": "183deg",
      "184": "184deg",
      "185": "185deg",
      "186": "186deg",
      "187": "187deg",
      "188": "188deg",
      "189": "189deg",
      "190": "190deg",
      "191": "191deg",
      "192": "192deg",
      "193": "193deg",
      "194": "194deg",
      "195": "195deg",
      "196": "196deg",
      "197": "197deg",
      "198": "198deg",
      "199": "199deg",
      "200": "200deg",
      "201": "201deg",
      "202": "202deg",
      "203": "203deg",
      "204": "204deg",
      "205": "205deg",
      "206": "206deg",
      "207": "207deg",
      "208": "208deg",
      "209": "209deg",
      "210": "210deg",
      "211": "211deg",
      "212": "212deg",
      "213": "213deg",
      "214": "214deg",
      "215": "215deg",
      "216": "216deg",
      "217": "217deg",
      "218": "218deg",
      "219": "219deg",
      "220": "220deg",
      "221": "221deg",
      "222": "222deg",
      "223": "223deg",
      "224": "224deg",
      "225": "225deg",
      "226": "226deg",
      "227": "227deg",
      "228": "228deg",
      "229": "229deg",
      "230": "230deg",
      "231": "231deg",
      "232": "232deg",
      "233": "233deg",
      "234": "234deg",
      "235": "235deg",
      "236": "236deg",
      "237": "237deg",
      "238": "238deg",
      "239": "239deg",
      "240": "240deg",
      "241": "241deg",
      "242": "242deg",
      "243": "243deg",
      "244": "244deg",
      "245": "245deg",
      "246": "246deg",
      "247": "247deg",
      "248": "248deg",
      "249": "249deg",
      "250": "250deg",
      "251": "251deg",
      "252": "252deg",
      "253": "253deg",
      "254": "254deg",
      "255": "255deg",
      "256": "256deg",
      "257": "257deg",
      "258": "258deg",
      "259": "259deg",
      "260": "260deg",
      "261": "261deg",
      "262": "262deg",
      "263": "263deg",
      "264": "264deg",
      "265": "265deg",
      "266": "266deg",
      "267": "267deg",
      "268": "268deg",
      "269": "269deg",
      "270": "270deg",
      "271": "271deg",
      "272": "272deg",
      "273": "273deg",
      "274": "274deg",
      "275": "275deg",
      "276": "276deg",
      "277": "277deg",
      "278": "278deg",
      "279": "279deg",
      "280": "280deg",
      "281": "281deg",
      "282": "282deg",
      "283": "283deg",
      "284": "284deg",
      "285": "285deg",
      "286": "286deg",
      "287": "287deg",
      "288": "288deg",
      "289": "289deg",
      "290": "290deg",
      "291": "291deg",
      "292": "292deg",
      "293": "293deg",
      "294": "294deg",
      "295": "295deg",
      "296": "296deg",
      "297": "297deg",
      "298": "298deg",
      "299": "299deg",
      "300": "300deg",
      "301": "301deg",
      "302": "302deg",
      "303": "303deg",
      "304": "304deg",
      "305": "305deg",
      "306": "306deg",
      "307": "307deg",
      "308": "308deg",
      "309": "309deg",
      "310": "310deg",
      "311": "311deg",
      "312": "312deg",
      "313": "313deg",
      "314": "314deg",
      "315": "315deg",
      "316": "316deg",
      "317": "317deg",
      "318": "318deg",
      "319": "319deg",
      "320": "320deg",
      "321": "321deg",
      "322": "322deg",
      "323": "323deg",
      "324": "324deg",
      "325": "325deg",
      "326": "326deg",
      "327": "327deg",
      "328": "328deg",
      "329": "329deg",
      "330": "330deg",
      "331": "331deg",
      "332": "332deg",
      "333": "333deg",
      "334": "334deg",
      "335": "335deg",
      "336": "336deg",
      "337": "337deg",
      "338": "338deg",
      "339": "339deg",
      "340": "340deg",
      "341": "341deg",
      "342": "342deg",
      "343": "343deg",
      "344": "344deg",
      "345": "345deg",
      "346": "346deg",
      "347": "347deg",
      "348": "348deg",
      "349": "349deg",
      "350": "350deg",
      "351": "351deg",
      "352": "352deg",
      "353": "353deg",
      "354": "354deg",
      "355": "355deg",
      "356": "356deg",
      "357": "357deg",
      "358": "358deg",
      "359": "359deg",
      "360": "360deg",
    },
    extend: {
      spacing: {
        9: "2.25rem",
        13: "3.25rem",
        15: "3.75rem",
        18: "4.5rem",
        38: "9.5rem",
        68: "17rem",
        84: "21rem",
        108: "27rem",
      },
      fontSize: {
        "xxs": ".5rem",
      },
      borderWidth: {
        "1": "1px",
      },
      strokeWidth: {
        "3": "3",
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
