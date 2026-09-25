export const COURSE_SCORE_MANIFEST = {
  "castle-in-the-sky": {
    "file": "/scores/castle-in-the-sky.musicxml",
    "timeSignature": "4/4",
    "bpm": 90,
    "tempoUnit": "quarter",
    "tunedStringsTopToBottom": ["A4", "E4", "C4", "G4"],
    "attribution": "薇小咩 · 曲：久石让",
    "sourceUrl": "https://www.bilibili.com/cheese/play/ss14671",
    "sourceStatus": "依据用户提供的两页截图转写；节奏按横向排版间距估算，品位与时值待逐项校对",
    "parts": Array.from({ length: 15 }, (_, index) => ({
      id: "line-" + (index + 1),
      label: "第 " + (index + 1) + " 行",
      bars: Array.from({ length: 3 }, (_, offset) => index * 3 + offset + 1),
    })),
    "playOrder": [
      "bar-01",
      ...Array.from({ length: 33 }, (_, index) => "bar-" + String(index + 2).padStart(2, "0")),
      ...Array.from({ length: 32 }, (_, index) => "bar-" + String(index + 2).padStart(2, "0")),
      ...Array.from({ length: 11 }, (_, index) => "bar-" + String(index + 35).padStart(2, "0")),
    ],
    "barCount": 45
  },
  "always-with-me": {
    "file": "/scores/always-with-me.musicxml",
    "timeSignature": "4/4",
    "bpm": 72,
    "tempoUnit": "quarter",
    "tunedStringsTopToBottom": [
      "A4",
      "E4",
      "C4",
      "G4"
    ],
    "attribution": "拾艺教学编配",
    "sourceUrl": "https://www.ukuleleba.com/14714.html",
    "sourceStatus": "自制教学音型；旋律逐音待核对",
    "parts": [
      {
        "id": "intro",
        "label": "前奏动机",
        "bars": [
          1,
          2
        ]
      },
      {
        "id": "theme-a",
        "label": "主题 A",
        "bars": [
          3,
          4,
          5,
          6
        ]
      },
      {
        "id": "theme-b",
        "label": "主题 B",
        "bars": [
          7,
          8,
          9,
          10
        ]
      },
      {
        "id": "bridge",
        "label": "连接句",
        "bars": [
          11,
          12
        ]
      },
      {
        "id": "outro",
        "label": "收尾",
        "bars": [
          13,
          14
        ]
      }
    ],
    "playOrder": [
      "intro-1",
      "intro-2",
      "theme-a-1",
      "theme-a-2",
      "theme-a-3",
      "theme-a-4",
      "theme-b-1",
      "theme-b-2",
      "theme-b-3",
      "theme-b-4",
      "theme-a-1",
      "theme-a-2",
      "theme-a-3",
      "theme-a-4",
      "theme-b-1",
      "theme-b-2",
      "theme-b-3",
      "theme-b-4",
      "bridge-1",
      "bridge-2",
      "theme-a-1",
      "theme-a-2",
      "theme-a-3",
      "theme-a-4",
      "outro-1",
      "outro-2"
    ],
    "barCount": 14
  },
  "canon-in-c": {
    "file": "/scores/canon-in-c.musicxml",
    "timeSignature": "4/4",
    "bpm": 72,
    "tempoUnit": "quarter",
    "tunedStringsTopToBottom": [
      "A4",
      "E4",
      "C4",
      "G4"
    ],
    "attribution": "拾艺教学编配",
    "sourceUrl": "https://ukulele-pdf.com/canon-in-c-mr-pook/",
    "sourceStatus": "自制教学音型；旋律逐音待核对",
    "parts": [
      {
        "id": "intro",
        "label": "分解和弦引子",
        "bars": [
          1,
          2
        ]
      },
      {
        "id": "theme-a",
        "label": "主题 A",
        "bars": [
          3,
          4,
          5,
          6
        ]
      },
      {
        "id": "theme-b",
        "label": "主题 B",
        "bars": [
          7,
          8,
          9,
          10
        ]
      },
      {
        "id": "bridge",
        "label": "连接段",
        "bars": [
          11,
          12
        ]
      },
      {
        "id": "outro",
        "label": "尾声",
        "bars": [
          13,
          14
        ]
      }
    ],
    "playOrder": [
      "intro-1",
      "intro-2",
      "theme-a-1",
      "theme-a-2",
      "theme-a-3",
      "theme-a-4",
      "theme-a-1",
      "theme-a-2",
      "theme-a-3",
      "theme-a-4",
      "theme-b-1",
      "theme-b-2",
      "theme-b-3",
      "theme-b-4",
      "theme-a-1",
      "theme-a-2",
      "theme-a-3",
      "theme-a-4",
      "theme-b-1",
      "theme-b-2",
      "theme-b-3",
      "theme-b-4",
      "bridge-1",
      "bridge-2",
      "theme-a-1",
      "theme-a-2",
      "theme-a-3",
      "theme-a-4",
      "outro-1",
      "outro-2"
    ],
    "barCount": 14
  },
  "summer": {
    "file": "/scores/summer.musicxml",
    "timeSignature": "4/4",
    "bpm": 96,
    "tempoUnit": "quarter",
    "tunedStringsTopToBottom": [
      "A4",
      "E4",
      "C4",
      "G4"
    ],
    "attribution": "拾艺教学编配",
    "sourceUrl": "https://ukulelehunt.com/2022/05/05/joe-hisaishi-summer-from-kikujiro-tabs/",
    "sourceStatus": "自制教学音型；旋律逐音待核对",
    "parts": [
      {
        "id": "intro",
        "label": "琶音前奏",
        "bars": [
          1,
          2
        ]
      },
      {
        "id": "theme-a",
        "label": "主题 A",
        "bars": [
          3,
          4,
          5,
          6
        ]
      },
      {
        "id": "theme-b",
        "label": "主题 B",
        "bars": [
          7,
          8,
          9,
          10
        ]
      },
      {
        "id": "bridge",
        "label": "低音连接",
        "bars": [
          11,
          12
        ]
      },
      {
        "id": "outro",
        "label": "尾声",
        "bars": [
          13,
          14
        ]
      }
    ],
    "playOrder": [
      "intro-1",
      "intro-2",
      "theme-a-1",
      "theme-a-2",
      "theme-a-3",
      "theme-a-4",
      "theme-b-1",
      "theme-b-2",
      "theme-b-3",
      "theme-b-4",
      "theme-a-1",
      "theme-a-2",
      "theme-a-3",
      "theme-a-4",
      "theme-b-1",
      "theme-b-2",
      "theme-b-3",
      "theme-b-4",
      "bridge-1",
      "bridge-2",
      "theme-a-1",
      "theme-a-2",
      "theme-a-3",
      "theme-a-4",
      "outro-1",
      "outro-2"
    ],
    "barCount": 14
  },
  "anheqiao": {
    "file": "/scores/anheqiao.musicxml",
    "timeSignature": "4/4",
    "bpm": 65,
    "tempoUnit": "quarter",
    "tunedStringsTopToBottom": [
      "A4",
      "E4",
      "C4",
      "G4"
    ],
    "attribution": "拾艺教学编配",
    "sourceUrl": "https://www.ukuleleba.com/22127.html",
    "sourceStatus": "自制教学音型；旋律逐音待核对",
    "parts": [
      {
        "id": "intro",
        "label": "前奏",
        "bars": [
          1,
          2
        ]
      },
      {
        "id": "verse",
        "label": "主歌",
        "bars": [
          3,
          4,
          5,
          6
        ]
      },
      {
        "id": "chorus",
        "label": "副歌",
        "bars": [
          7,
          8,
          9,
          10
        ]
      },
      {
        "id": "bridge",
        "label": "间奏",
        "bars": [
          11,
          12
        ]
      },
      {
        "id": "outro",
        "label": "尾奏",
        "bars": [
          13,
          14
        ]
      }
    ],
    "playOrder": [
      "intro-1",
      "intro-2",
      "verse-1",
      "verse-2",
      "verse-3",
      "verse-4",
      "chorus-1",
      "chorus-2",
      "chorus-3",
      "chorus-4",
      "verse-1",
      "verse-2",
      "verse-3",
      "verse-4",
      "chorus-1",
      "chorus-2",
      "chorus-3",
      "chorus-4",
      "bridge-1",
      "bridge-2",
      "chorus-1",
      "chorus-2",
      "chorus-3",
      "chorus-4",
      "outro-1",
      "outro-2"
    ],
    "barCount": 14
  },
  "chengdu": {
    "file": "/scores/chengdu.musicxml",
    "timeSignature": "6/8",
    "bpm": 61,
    "tempoUnit": "dotted-quarter",
    "tunedStringsTopToBottom": [
      "A4",
      "E4",
      "C4",
      "G4"
    ],
    "attribution": "拾艺教学编配",
    "sourceUrl": "https://www.ukuleleba.com/22137.html",
    "sourceStatus": "自制教学音型；旋律逐音待核对",
    "parts": [
      {
        "id": "intro",
        "label": "前奏",
        "bars": [
          1,
          2
        ]
      },
      {
        "id": "verse-a",
        "label": "主歌 A",
        "bars": [
          3,
          4,
          5,
          6
        ]
      },
      {
        "id": "verse-b",
        "label": "主歌 B",
        "bars": [
          7,
          8,
          9,
          10
        ]
      },
      {
        "id": "chorus",
        "label": "副歌",
        "bars": [
          11,
          12,
          13,
          14
        ]
      },
      {
        "id": "bridge",
        "label": "间奏",
        "bars": [
          15,
          16
        ]
      },
      {
        "id": "outro",
        "label": "尾奏",
        "bars": [
          17,
          18
        ]
      }
    ],
    "playOrder": [
      "intro-1",
      "intro-2",
      "verse-a-1",
      "verse-a-2",
      "verse-a-3",
      "verse-a-4",
      "verse-b-1",
      "verse-b-2",
      "verse-b-3",
      "verse-b-4",
      "chorus-1",
      "chorus-2",
      "chorus-3",
      "chorus-4",
      "intro-1",
      "intro-2",
      "verse-a-1",
      "verse-a-2",
      "verse-a-3",
      "verse-a-4",
      "verse-b-1",
      "verse-b-2",
      "verse-b-3",
      "verse-b-4",
      "chorus-1",
      "chorus-2",
      "chorus-3",
      "chorus-4",
      "bridge-1",
      "bridge-2",
      "chorus-1",
      "chorus-2",
      "chorus-3",
      "chorus-4",
      "outro-1",
      "outro-2"
    ],
    "barCount": 18
  },
  "nanshannan": {
    "file": "/scores/nanshannan.musicxml",
    "timeSignature": "4/4",
    "bpm": 65,
    "tempoUnit": "quarter",
    "tunedStringsTopToBottom": [
      "A4",
      "E4",
      "C4",
      "G4"
    ],
    "attribution": "拾艺教学编配",
    "sourceUrl": "https://www.ukuleleba.com/915.html",
    "sourceStatus": "自制教学音型；旋律逐音待核对",
    "parts": [
      {
        "id": "intro",
        "label": "前奏",
        "bars": [
          1,
          2
        ]
      },
      {
        "id": "verse-a",
        "label": "主歌一",
        "bars": [
          3,
          4,
          5,
          6
        ]
      },
      {
        "id": "verse-b",
        "label": "主歌二",
        "bars": [
          7,
          8,
          9,
          10
        ]
      },
      {
        "id": "verse-c",
        "label": "主歌三",
        "bars": [
          11,
          12,
          13,
          14
        ]
      },
      {
        "id": "outro",
        "label": "尾声",
        "bars": [
          15,
          16
        ]
      }
    ],
    "playOrder": [
      "intro-1",
      "intro-2",
      "verse-a-1",
      "verse-a-2",
      "verse-a-3",
      "verse-a-4",
      "verse-b-1",
      "verse-b-2",
      "verse-b-3",
      "verse-b-4",
      "verse-c-1",
      "verse-c-2",
      "verse-c-3",
      "verse-c-4",
      "verse-a-1",
      "verse-a-2",
      "verse-a-3",
      "verse-a-4",
      "verse-b-1",
      "verse-b-2",
      "verse-b-3",
      "verse-b-4",
      "verse-c-1",
      "verse-c-2",
      "verse-c-3",
      "verse-c-4",
      "outro-1",
      "outro-2"
    ],
    "barCount": 16
  }
} as const
