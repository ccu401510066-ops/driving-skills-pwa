export type Ref = {
  k: string
  v: string
}

export type Step = {
  /** 判斷：要對到什麼（灰卡）。沒有就不顯示 */
  judge?: string
  /** 方向盤轉向 */
  turn?: 'L' | 'R'
  /** 方向盤圈數：半圈／一圈／滿 */
  amount?: string
  /** 車輛行進方向 */
  move?: 'fwd' | 'rev'
  /** 方向盤／停車動作，排在行進方向前面 */
  action?: string
  /** 行進中的補充說明，排在行進方向後面 */
  note?: string
  /** 這一步的圖，顯示在文字右側 */
  image?: string
}

export type Compare = {
  head: string[]
  rows: string[][]
  note?: string
}

export type Variant = {
  id: string
  name: string
  /** 外擺幅度／一句差異 */
  sway?: string
  /** 什麼情況用這個打法 */
  when: string
  /** 起始對位一句話 */
  start?: string
  /** 總示意圖（俯視），有圖才顯示 */
  overview?: string
  /** 圖說，說明圖上各段是什麼 */
  overviewNote?: string
  refs?: Ref[]
  steps?: Step[]
  rescue?: string[]
  limits?: string[]
  /** 打法比較表 */
  compare?: Compare
  /** 子打法：有這一層就是「先選庫位，再選打法」 */
  variants?: Variant[]
}

export type Trick = {
  id: string
  no: string
  name: string
  tag: string
  /** 首頁卡片右上角的小標，例如「4 種打法」 */
  badge?: string
  /** 一句心法：上車前只看這句 */
  oneLiner: string
  /** 什麼時候用 */
  situation: string
  /** 參照點 */
  refs: Ref[]
  steps: Step[]
  /** 卡住時怎麼辦 */
  rescue: string[]
  /** 適用與不適用 */
  limits: string[]
  /** 打法比較表 */
  compare?: Compare
  /** 選打法那一頁的標題，沒給就用預設 */
  pickTitle?: string
  /** 同一招的多種打法（有的話，點進來先選） */
  variants?: Variant[]
}

const PARK_RESCUE = [
  '轉太早（車尾偏外側、車頭會掃到旁邊的車）→ 往前開回原位重來，不要原地扭方向盤。',
  '轉太晚（車尾偏內側）→ 先倒到底、回正，再小幅修正。',
  '車位太窄（比車寬多不到 60 cm）→ 換車位，硬停最容易刮傷。',
  '有倒車顯影也要看兩側後照鏡，廣角畫面會把距離壓縮。'
]

const PARK_LIMITS = [
  '車位長度至少車長 + 1 m 才好停。',
  '另一側車位把左右全部對調（打方向、看後照鏡都反過來）。',
  '斜線車位、機械車位的角度不同，不適用這套步驟。'
]

export const tricks: Trick[] = [
  {
    id: 'front-distance',
    no: '01',
    name: '車前距離判斷',
    tag: '車距',
    oneLiner: '看得到前車的輪胎，才是安全距離。',
    situation: '路口停等、跟著前車、窄巷會車、車頭靠近牆面或柱子的時候。',
    refs: [
      { k: '停等前車', v: '看得到後輪接地　≈ 3 m（安全）' },
      { k: '只看到後保桿', v: '≈ 2 m（夠了，別再前進）' },
      { k: '只看得到車尾牌以上', v: '≈ 1 m 以內（太近）' },
      { k: '車頭盲區', v: '車頭前 1.5–2 m 的地面看不見' }
    ],
    steps: [
      {
        judge: '前車後輪接地點　⟷　看得見',
        action: '停在這個位置'
      },
      {
        judge: '停止線／路緣石／前車輪胎接地點',
        move: 'fwd',
        note: '盯住它，別盯車頭'
      },
      {
        judge: '參照點消失　⟷　車頭下緣',
        action: '停'
      },
      {
        judge: '障礙物　⟷　車頭右角外側',
        action: '過彎走外側'
      },
      {
        action: '下車看'
      }
    ],
    rescue: [
      '已經太近、看不到前車距離 → 倒車退 1 公尺重新判斷，不要賭。',
      '夜間或雨天看不清地面線 → 改用柱腳、路緣石、停止線的立面當參照。',
      '跟在大型車後面看不到更前面 → 距離再拉大，至少看得到它的後輪接地。'
    ],
    limits: [
      '參照距離依車型、座椅高度、駕駛身高而不同，換車請在空地重新校準一次。',
      '這是小型車的視線；貨車、公車的盲區完全不同，不能套用。',
      '倒車顯影與倒車雷達是輔助，不是判準。'
    ]
  },
  {
    id: 'reverse-parking',
    no: '02',
    name: '倒車入庫',
    tag: '停車',
    badge: '左右兩側',
    oneLiner: '',
    situation: '',
    refs: [],
    steps: [],
    rescue: PARK_RESCUE,
    limits: PARK_LIMITS,
    pickTitle: '選車位在哪一側',
    variants: [
      {
        id: 'left',
        name: '左側庫位',
        sway: '',
        when: '',
        start: '左後視鏡對齊庫位中間（擺幅大）～庫位左鄰車中間（擺幅小）',
        refs: [
          { k: '起點', v: '左後視鏡對齊庫位中間（擺幅大）～庫位左鄰車中間（擺幅小），車身與車格平行' },
          { k: '轉向點', v: '左後視鏡看到目標庫位左庫角' },
          { k: '回正點', v: '車身與車位線平行' }
        ],
        steps: [
          {
            move: 'fwd',
            note: '順著車格往前開'
          },
          {
            judge: '左側後視鏡　⟷　庫位中間（擺幅大）～左鄰車中間（擺幅小）',
            turn: 'R',
            amount: '滿',
            move: 'fwd',
            image: './diagrams/revleft-step2.jpg'
          },
          {
            judge: '左側後視鏡　⟷　目標庫位左庫角',
            turn: 'L',
            amount: '滿',
            move: 'rev',
            image: './diagrams/revleft-step3.jpg'
          },
          {
            judge: '車身　⟷　車位線平行',
            action: '方向盤回正',
            move: 'rev'
          }
        ],
        rescue: PARK_RESCUE,
        limits: PARK_LIMITS
      },
      {
        id: 'right',
        name: '右側庫位',
        sway: '',
        when: '',
        start: '右後視鏡對齊目標庫位右庫線～右鄰車中間',
        refs: [
          { k: '起點', v: '右後視鏡對齊目標庫位右庫線～右鄰車中間，車身與車格平行' },
          { k: '轉向點', v: '右後視鏡看到目標庫位右庫角' },
          { k: '回正點', v: '車身與車位線平行' }
        ],
        steps: [
          {
            move: 'fwd',
            note: '順著車格往前開'
          },
          {
            judge: '右側後視鏡　⟷　目標庫位右庫線～右鄰車中間',
            turn: 'L',
            amount: '滿',
            move: 'fwd'
          },
          {
            judge: '右側後視鏡　⟷　目標庫位右庫角',
            turn: 'R',
            amount: '滿',
            move: 'rev',
            note: '繞過右鄰車左前角'
          },
          {
            judge: '車身　⟷　車位線平行',
            action: '方向盤回正',
            move: 'rev'
          }
        ],
        rescue: PARK_RESCUE,
        limits: PARK_LIMITS
      }
    ]
  },
  {
    id: 'parallel-parking',
    no: '03',
    name: '路邊停車',
    tag: '停車',
    badge: '4 種打法',
    oneLiner: '四種打法只差三件事：起點對哪裡、第一把幾圈、什麼時候回打。',
    situation: '路邊平行車位，前後都停了車。先選一種打法，再照步驟做。',
    refs: [],
    steps: [],
    rescue: [
      '打太早（車尾撞路緣）→ 打左回一點，再倒。',
      '打太晚（車尾停不進去）→ 往前開一點重來，不要原地硬扭。',
      '卡在前後車中間 → 前後各留 60 cm 以上；空間不夠就換車位。'
    ],
    limits: [
      '以下以 Fit 級中型車（車長 4.0 m、軸距 2.53 m）計算，換車請在空地校準 B 柱與門把手的位置。',
      '車位長度至少車長 + 1.5 m；前後車貼很近時，選「打滿」或「車頭先進」。',
      '路緣高於 15 cm 或沒有路緣 → 改用車道線判斷，不要硬壓上去。'
    ],
    compare: {
      head: ['打法', '起點對位', '第一把'],
      rows: [
        ['半圈', 'B 柱對前車車頭', '右半圈'],
        ['一圈', '車尾對前車車尾', '右一圈'],
        ['打滿', '車尾對前車車尾', '右打滿'],
        ['車頭先進', 'B 柱對後車車頭', '右打滿駛入']
      ],
      note: '共同收尾：左後視鏡看到後車完整車頭就回正直倒；右後視鏡看到右前門把手與路邊重合就左打滿；車身平行後前後微調。'
    },
    variants: [
      {
        id: 'half',
        name: '右打半圈',
        sway: '車頭左側外擺幅度：小',
        when: '最常用。旁邊有車、有牆，不想讓車頭擺出去太多。',
        start: '右側 B 柱對齊前車車頭',
        refs: [
          { k: '起點', v: '右側 B 柱對齊前車車頭（車身與前車平行）' },
          { k: '回打點', v: '右後視鏡：右前門把手與路邊重合' },
          { k: '收尾', v: '車身與路邊平行' }
        ],
        steps: [
          {
            move: 'fwd',
            note: '順著前車平行開'
          },
          {
            judge: '右側 B 柱　⟷　前車車頭',
            turn: 'R',
            amount: '半圈',
            move: 'rev',
            image: './diagrams/half-step1.jpg'
          },
          {
            judge: '右後視鏡　右前門把手　⟷　路邊',
            turn: 'L',
            amount: '滿',
            move: 'rev',
            image: './diagrams/half-step3.jpg'
          },
          {
            judge: '車身　⟷　路邊平行',
            action: '方向盤回正・前後微調'
          }
        ],
        rescue: [
          '門把手太早壓到路邊（車尾還沒進）→ 左打時機太早，下一把等門把手到路邊再打。',
          '車尾一直進不去 → 起點再往後退一點（B 柱超前車車頭更多）重來。'
        ],
        limits: [
          '車位長度 6 m 以上最順，太短的車位用「打滿」或「車頭先進」。',
          '半圈之後車頭離前車很近，出車時要先確認左前方。'
        ]
      },
      {
        id: 'full',
        name: '右打一圈',
        sway: '車頭左側外擺幅度：中',
        when: '標準情況。車位長度一般、前後車距離正常。',
        start: '車尾對齊前車車尾',
        refs: [
          { k: '起點', v: '車尾對齊前車車尾（車身與前車平行）' },
          { k: '回打點', v: '右後視鏡：右前門把手與路邊重合' },
          { k: '收尾', v: '車身與路邊平行' }
        ],
        steps: [
          {
            move: 'fwd',
            note: '順著前車平行開'
          },
          {
            judge: '車尾　⟷　前車車尾',
            turn: 'R',
            amount: '一圈',
            move: 'rev',
            image: './diagrams/full-step1.jpg'
          },
          {
            judge: '右後視鏡　右前門把手　⟷　路邊',
            turn: 'L',
            amount: '滿',
            move: 'rev',
            image: './diagrams/half-step3.jpg'
          },
          {
            judge: '車身　⟷　路邊平行',
            action: '方向盤回正・前後微調'
          }
        ],
        rescue: [
          '車尾偏出路緣 → 第二把左打滿的時機略晚，門把手一重合就要打。',
          '車頭掃到前車 → 起點太前、太靠近前車，退回一點重來。'
        ],
        limits: [
          '車位比車長多不到 2 m 時，改用「打滿」。',
          '車道很窄時車頭外擺會佔到對向，先確認來車。'
        ]
      },
      {
        id: 'lock',
        name: '右打滿',
        sway: '車頭左側外擺幅度：大',
        when: '車位較短、前後車貼很近，需要一次轉到位。',
        start: '車尾對齊前車車尾',
        refs: [
          { k: '起點', v: '車尾對齊前車車尾' },
          { k: '回正點', v: '左後視鏡看到車格後車完整車頭' },
          { k: '回打點', v: '右後視鏡：右前門把手與路邊重合' }
        ],
        steps: [
          {
            move: 'fwd',
            note: '順著前車平行開'
          },
          {
            judge: '車尾　⟷　前車車尾',
            turn: 'R',
            amount: '滿',
            move: 'rev',
            image: './diagrams/full-step1.jpg'
          },
          {
            judge: '左後視鏡　⟷　後車完整車頭',
            move: 'rev',
            action: '方向盤回正',
            image: './diagrams/lock-step2.jpg'
          },
          {
            judge: '右後視鏡　右前門把手　⟷　路邊',
            turn: 'L',
            amount: '滿',
            move: 'rev',
            image: './diagrams/half-step3.jpg'
          },
          {
            judge: '車身　⟷　路邊平行',
            action: '方向盤回正・前後微調'
          }
        ],
        rescue: [
          '左後視鏡一直看不到後車車頭 → 還在車位外，繼續慢慢倒，不要提早回正。',
          '車尾擦到路緣 → 立即回正、往前開一點重來，別硬壓。'
        ],
        limits: [
          '車頭外擺最大，車道要夠寬、對向沒有來車。',
          '車位長度接近車長 + 1.2 m 時，這是最保險的打法。'
        ]
      },
      {
        id: 'nose',
        name: '車頭先進',
        sway: '防止被搶車位',
        when: '後面有車在等、怕被搶位；或車位前後空間不足以倒車進去。',
        start: '右側 B 柱對齊後車車頭',
        refs: [
          { k: '起點', v: '右側 B 柱對齊車格後車車頭' },
          { k: '轉向點', v: '左側 A 柱與車格左側白線重合' },
          { k: '回正點', v: '左後視鏡看到車格後車完整車頭' },
          { k: '回打點', v: '右後視鏡：右前門把手與路邊重合' }
        ],
        steps: [
          {
            move: 'fwd',
            note: '順著後車平行開'
          },
          {
            judge: '右側 B 柱　⟷　後車車頭',
            turn: 'R',
            amount: '滿',
            move: 'fwd',
            note: '駛入車格',
            image: './diagrams/nose-step1.jpg'
          },
          {
            judge: '左 A 柱　⟷　車格左側白線',
            turn: 'L',
            amount: '滿',
            move: 'fwd',
            note: '駛出車格',
            image: './diagrams/nose-step3.jpg'
          },
          {
            judge: '左後視鏡　⟷　後車完整車頭',
            move: 'rev',
            action: '方向盤回正',
            image: './diagrams/lock-step2.jpg'
          },
          {
            judge: '右後視鏡　右前門把手　⟷　路邊',
            turn: 'L',
            amount: '滿',
            move: 'rev',
            image: './diagrams/half-step3.jpg'
          },
          {
            judge: '車身　⟷　路邊平行',
            action: '方向盤回正・前後微調'
          }
        ],
        rescue: [
          '車頭進得太深、左前角快碰到前車 → 立刻停住，回正倒車一點再修。',
          '第二把左打滿往前時車尾快撞後車 → 往前開的距離再短一點，早點回正直倒。'
        ],
        limits: [
          '動作最多、最花時間，後方有來車時先打方向燈。',
          '車位左側沒有白線（只有路緣）時，改用「A 柱對路緣」判斷。'
        ]
      }
    ]
  }
]

export const tricksById = Object.fromEntries(tricks.map((t) => [t.id, t])) as Record<string, Trick>
