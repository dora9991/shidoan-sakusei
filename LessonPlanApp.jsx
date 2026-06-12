import { useState, useCallback, useMemo } from "react";

// =====================================================================
// 中学校数学科　学習指導案作成ソフト
//   手順①エンジン部 / ②文言データ（学習指導要領ベース）/ ③見やすい枠組 / ④動作テスト
// =====================================================================

// =====================
// データベース（中学校数学に集約）
// =====================
const GRADES = ["1年", "2年", "3年"];

const UNITS = {
  "1年": ["正負の数", "文字と式", "一次方程式", "比例と反比例", "平面図形", "空間図形", "データの活用"],
  "2年": ["式の計算", "連立方程式", "一次関数", "平行と合同", "三角形と四角形", "確率", "データの分布（箱ひげ図）"],
  "3年": ["多項式（展開と因数分解）", "平方根", "二次方程式", "関数 y=ax²", "相似な図形", "円", "三平方の定理", "標本調査"],
};

// 領域（学習指導要領の4領域）
const UNIT_DOMAIN = {
  "正負の数": "A 数と式", "文字と式": "A 数と式", "一次方程式": "A 数と式",
  "比例と反比例": "C 関数", "平面図形": "B 図形", "空間図形": "B 図形", "データの活用": "D データの活用",
  "式の計算": "A 数と式", "連立方程式": "A 数と式", "一次関数": "C 関数",
  "平行と合同": "B 図形", "三角形と四角形": "B 図形", "確率": "D データの活用", "データの分布（箱ひげ図）": "D データの活用",
  "多項式（展開と因数分解）": "A 数と式", "平方根": "A 数と式", "二次方程式": "A 数と式",
  "関数 y=ax²": "C 関数", "相似な図形": "B 図形", "円": "B 図形", "三平方の定理": "B 図形", "標本調査": "D データの活用",
};

// =====================
// 単元目標 文例（学習指導要領の3つの柱に対応）
// =====================
const UNIT_GOALS = {
  "正負の数": [
    "正の数と負の数の必要性と意味を理解し、正負の数の四則計算を正確に行うことができるようにする。",
    "数の範囲が拡張されたことのよさに気づき、正負の数を用いて事象を考察し表現する力を養う。",
    "正負の数を用いて身のまわりの事象を数学的に捉えようとする態度を養う。",
  ],
  "文字と式": [
    "文字を用いることの必要性と意味を理解し、文字式の計算や式による表現ができるようにする。",
    "数量や数量の関係を文字式を用いて表現したり、式の意味を読み取ったりする力を養う。",
    "文字式を用いて事象を簡潔・明瞭・的確に表現しようとする態度を養う。",
  ],
  "一次方程式": [
    "方程式の必要性と意味、等式の性質を理解し、一次方程式を解くことができるようにする。",
    "一次方程式を具体的な場面で活用し、問題を解決する方法を考察し表現する力を養う。",
    "方程式を用いて問題を解決しようとする態度を養う。",
  ],
  "比例と反比例": [
    "比例・反比例の意味を理解し、表・式・グラフを用いて表すことができるようにする。",
    "比例・反比例を用いて具体的な事象を捉え考察し表現する力を養う。",
    "関数関係に着目して事象を捉えようとする態度を養う。",
  ],
  "平面図形": [
    "基本的な作図の方法や図形の移動の意味を理解し、作図することができるようにする。",
    "図形の性質や関係を直観的に捉え、論理的に考察し表現する力を養う。",
    "図形の性質を見いだそうとする態度を養う。",
  ],
  "空間図形": [
    "空間図形の構成や見方を理解し、表面積や体積を求めることができるようにする。",
    "空間図形を平面上に表現したり、図形の性質を多面的に考察したりする力を養う。",
    "空間図形の性質を見いだし活用しようとする態度を養う。",
  ],
  "データの活用": [
    "ヒストグラムや相対度数などの意味を理解し、データを整理し表すことができるようにする。",
    "目的に応じてデータを収集・整理し、傾向を読み取り判断する力を養う。",
    "データに基づいて判断しようとする態度を養う。",
  ],
  "式の計算": [
    "単項式・多項式の四則計算の方法を理解し、正確に計算することができるようにする。",
    "文字式を用いて数量の関係や図形の性質を説明する力を養う。",
    "文字式を活用して事象を説明しようとする態度を養う。",
  ],
  "連立方程式": [
    "連立二元一次方程式の意味と解き方を理解し、解くことができるようにする。",
    "連立方程式を具体的な場面で活用し、問題を解決する方法を考察し表現する力を養う。",
    "連立方程式を用いて問題を解決しようとする態度を養う。",
  ],
  "一次関数": [
    "一次関数の意味を理解し、表・式・グラフを相互に関連づけて表すことができるようにする。",
    "一次関数を用いて具体的な事象を捉え、変化や対応を考察し表現する力を養う。",
    "関数関係に着目し、事象を数学的に捉えようとする態度を養う。",
  ],
  "平行と合同": [
    "平行線の性質や三角形の合同条件を理解し、説明に用いることができるようにする。",
    "図形の性質を論理的に確かめ、根拠を明らかにして証明する力を養う。",
    "図形の性質を論理的に考察しようとする態度を養う。",
  ],
  "三角形と四角形": [
    "三角形や平行四辺形の性質と、その証明の方法を理解できるようにする。",
    "図形の性質を見通しをもって証明したり、条件を変えて考察したりする力を養う。",
    "図形の性質を統合的・発展的に考えようとする態度を養う。",
  ],
  "確率": [
    "確率の意味と求め方を理解し、簡単な場合について確率を求めることができるようにする。",
    "確率を用いて不確定な事象を捉え、根拠をもって判断し表現する力を養う。",
    "確率を用いて事象を考察しようとする態度を養う。",
  ],
  "データの分布（箱ひげ図）": [
    "四分位範囲や箱ひげ図の意味を理解し、データを整理し表すことができるようにする。",
    "複数のデータの分布を比較し、傾向を読み取り批判的に考察する力を養う。",
    "データの分布に着目して判断しようとする態度を養う。",
  ],
  "多項式（展開と因数分解）": [
    "乗法公式や因数分解の方法を理解し、式の展開・因数分解ができるようにする。",
    "式の計算を活用して数や図形の性質を説明する力を養う。",
    "式を目的に応じて変形し活用しようとする態度を養う。",
  ],
  "平方根": [
    "平方根の必要性と意味を理解し、根号を含む式の計算ができるようにする。",
    "数の範囲を有理数から実数へ拡張し、平方根を用いて事象を考察する力を養う。",
    "数を拡張して事象を捉えようとする態度を養う。",
  ],
  "二次方程式": [
    "二次方程式の意味と解き方（因数分解・平方完成・解の公式）を理解できるようにする。",
    "二次方程式を具体的な場面で活用し、問題を解決する方法を考察し表現する力を養う。",
    "二次方程式を用いて問題を解決しようとする態度を養う。",
  ],
  "関数 y=ax²": [
    "関数 y=ax² の意味を理解し、表・式・グラフを関連づけて表すことができるようにする。",
    "関数 y=ax² を用いて具体的な事象を捉え、変化の割合などを考察し表現する力を養う。",
    "関数関係に着目し、事象を数学的に捉えようとする態度を養う。",
  ],
  "相似な図形": [
    "図形の相似の意味と三角形の相似条件を理解し、説明に用いることができるようにする。",
    "相似を用いて図形の性質を証明したり、長さや面積・体積の比を考察したりする力を養う。",
    "相似な図形の性質を活用しようとする態度を養う。",
  ],
  "円": [
    "円周角と中心角の関係を理解し、図形の性質を説明に用いることができるようにする。",
    "円の性質を用いて図形の性質を論理的に考察し証明する力を養う。",
    "円の性質を見いだし活用しようとする態度を養う。",
  ],
  "三平方の定理": [
    "三平方の定理の意味を理解し、それを用いて長さを求めることができるようにする。",
    "三平方の定理を平面図形や空間図形、日常の場面に活用し考察する力を養う。",
    "三平方の定理を活用して問題を解決しようとする態度を養う。",
  ],
  "標本調査": [
    "全数調査と標本調査の意味を理解し、標本調査の方法を理解できるようにする。",
    "標本調査の結果から母集団の傾向を推定し、判断し表現する力を養う。",
    "標本調査を用いて事象を捉え判断しようとする態度を養う。",
  ],
};

// =====================
// 単元別バンク：本時で扱う問題・例題 / 予想されるつまずき・誤答と手立て
// =====================
const UNIT_BANK = {
  "正負の数": {
    problems: ["異符号の加法 (+5)+(−8) を計算する", "減法 (+3)−(−2) を加法に直して計算する", "四則混合 −3+(−4)×2 を計算する", "気温や得失点の変化を正負の数で表す"],
    mistakes: ["(+3)−(−2)=+1 とひく数の符号処理を誤る → 符号を変えて加法に直す途中式を必ず書かせる", "異符号の加法で絶対値の大きい方の符号を取り違える → 数直線で確かめさせる", "「−」を引き算と負の符号で混同する → 言葉と式を対応させて確認する"],
  },
  "文字と式": {
    problems: ["「1個x円のパン3個と100円の牛乳」の代金を式に表す", "x=−2 のとき 3x+5 の値を求める", "2(x+3) を分配法則で計算する"],
    mistakes: ["3×x を x3、a×a を 2a と書く表記の誤り → 文字式の表し方を確認する", "−2² を 4 と計算する符号・累乗の誤り → 計算の順序を確認する"],
  },
  "一次方程式": {
    problems: ["3x+5=2x−1 を解く", "移項を用いて 2x−7=5 を解く", "代金や個数の文章題を方程式で解く"],
    mistakes: ["移項のときに符号を変え忘れる → 等式の性質に戻して確認する", "両辺を割るとき一部の項だけ割る → 全体に同じ操作をすることを徹底する"],
  },
  "比例と反比例": {
    problems: ["y=3x の表とグラフをかく", "反比例 y=12/x で x=4 のときの y を求める", "身のまわりの比例の関係を式に表す"],
    mistakes: ["比例定数 a を求めず原点を通る直線にできない → 1組の値から a を求める手順を確認する", "反比例のグラフを直線でかく → 表から曲線になることを確認する"],
  },
  "平面図形": {
    problems: ["線分の垂直二等分線を作図する", "角の二等分線を作図する", "図形を平行移動・回転移動・対称移動する"],
    mistakes: ["作図でコンパスの半径を途中で変える → 作図の根拠（等距離）を意識させる", "回転移動と対称移動を混同する → 操作を実際に確かめさせる"],
  },
  "空間図形": {
    problems: ["円柱の表面積を求める", "角錐・円錐の体積を求める", "展開図から立体を組み立てる"],
    mistakes: ["表面積で側面（展開図）を忘れる → 展開図をかいて確認する", "錐体の体積で 1/3 を掛け忘れる → 角柱・円柱との関係を確認する"],
  },
  "データの活用": {
    problems: ["度数分布表からヒストグラムをつくる", "相対度数を求める", "代表値（平均値・中央値・最頻値）を読み取る"],
    mistakes: ["階級値と度数を取り違える → 表の見方を確認する", "相対度数の合計が1にならない → 計算を見直させる"],
  },
  "式の計算": {
    problems: ["3a+2b−(a−4b) を計算する", "単項式の乗除 6ab÷2a を計算する", "等式 2x+y=6 を y について解く"],
    mistakes: ["かっこの前のマイナスを全項に分配し忘れる → 符号の変化を確認する", "係数と文字の処理を混同する → 同類項の意味を確認する"],
  },
  "連立方程式": {
    problems: ["加減法で解く（2x+y=7, x−y=2）", "代入法で解く", "速さや割合の文章題を連立方程式で解く"],
    mistakes: ["加減法で係数をそろえずに足し引きする → 係数をそろえる手順を確認する", "代入後にかっこを外すときの符号ミス → 途中式を書かせる"],
  },
  "一次関数": {
    problems: ["y=2x+3 のグラフをかく", "変化の割合を求める", "2点を通る直線の式を求める"],
    mistakes: ["切片と傾きを取り違える → y=ax+b の各文字の意味を確認する", "変化の割合を y の増加量だけで求める →（yの増加量)/(xの増加量)を徹底する"],
  },
  "平行と合同": {
    problems: ["平行線の同位角・錯角から角の大きさを求める", "三角形の合同条件を使って証明する", "多角形の内角の和を求める"],
    mistakes: ["合同条件を取り違える（2辺と1角の位置など）→ 3つの条件を確認する", "証明で根拠（仮定・定理）を書かない → 理由を必ず明記させる"],
  },
  "三角形と四角形": {
    problems: ["二等辺三角形の底角が等しいことを証明する", "平行四辺形になる条件を使って証明する", "図形の性質を使って角を求める"],
    mistakes: ["仮定と結論を取り違える → 何を示すのかを明確にさせる", "図の見た目に頼り根拠なく等しいとする → 定理を引用させる"],
  },
  "確率": {
    problems: ["さいころ1個を投げるときの確率を求める", "2個のさいころで和が7になる確率を求める", "樹形図で場合の数を数える"],
    mistakes: ["全事象の数え落としや重複 → 樹形図・表で整理させる", "「同様に確からしい」前提を確認しない → 条件をおさえさせる"],
  },
  "データの分布（箱ひげ図）": {
    problems: ["データから四分位数を求める", "箱ひげ図をかく", "2つのデータの分布を箱ひげ図で比較する"],
    mistakes: ["中央値と平均値を混同する → それぞれの定義を確認する", "四分位数の位置を誤る → データを順に並べて求めさせる"],
  },
  "多項式（展開と因数分解）": {
    problems: ["(x+3)(x−2) を展開する", "x²+5x+6 を因数分解する", "乗法公式 (x+a)² を使って展開する"],
    mistakes: ["(x+3)²=x²+9 と中央の項を落とす → 公式の展開過程を確認する", "因数分解で和と積の符号を取り違える → 2数の組を表にして探させる"],
  },
  "平方根": {
    problems: ["√12 を a√b の形に簡単にする", "√2×√3 を計算する", "近似値を使って √3 と1.7の大小を比べる"],
    mistakes: ["√a+√b=√(a+b) と誤る → 計算の決まりを確認する", "根号の中を素因数分解せず簡約できない → √(a²b)=a√b を確認する"],
  },
  "二次方程式": {
    problems: ["x²−5x+6=0 を因数分解で解く", "x²=7 を解く", "解の公式で 2x²+3x−1=0 を解く"],
    mistakes: ["x²=9 で x=3 のみとする（±の落とし）→ 解が2つあることを確認する", "解の公式で符号や分母を誤る → 公式を正確に書かせる"],
  },
  "関数 y=ax²": {
    problems: ["y=2x² の表とグラフをかく", "x=−3 のときの y を求める", "区間における変化の割合を求める"],
    mistakes: ["放物線を直線でかく → 表から曲線になることを確認する", "a の符号と上に凸・下に凸の関係を取り違える → 具体例で確認する"],
  },
  "相似な図形": {
    problems: ["相似比から辺の長さを求める", "三角形の相似条件を使って証明する", "平行線と線分の比を使って長さを求める"],
    mistakes: ["対応する辺・角を取り違える → 対応を記号で対応づけさせる", "面積比＝相似比としてしまう → 面積比は相似比の2乗であることを確認する"],
  },
  "円": {
    problems: ["円周角と中心角の関係から角を求める", "同じ弧に対する円周角が等しいことを使う", "円周角の定理を使って証明する"],
    mistakes: ["中心角を円周角と同じ大きさにする → 中心角は円周角の2倍を確認する", "弧と角の対応を取り違える → 図に印をつけて対応させる"],
  },
  "三平方の定理": {
    problems: ["直角三角形の斜辺の長さを求める", "座標平面上の2点間の距離を求める", "直方体の対角線の長さを求める"],
    mistakes: ["斜辺とほかの辺を取り違える → どこが斜辺かを必ず確認する", "a²+b²=c² の c を斜辺以外にあてる → 直角の対辺が斜辺であることを確認する"],
  },
  "標本調査": {
    problems: ["全数調査と標本調査を区別する", "標本の結果から母集団の数量を推定する", "無作為に抽出する方法を考える"],
    mistakes: ["標本の偏りを考えない → 無作為抽出の必要性を確認する", "母集団の推定で比例の立式を誤る → 割合の関係を確認する"],
  },
};

// =====================
// 本時の目標 文例（タイプ別・汎用）
// =====================
const GOALS = {
  知識習得型: [
    "〇〇の意味を理解し、その内容を言葉や式で説明することができる。",
    "〇〇の性質を理解し、具体例を挙げて確かめることができる。",
    "〇〇の計算（手順）を理解し、正確に求めることができる。",
  ],
  思考活用型: [
    "既習事項と関連づけながら、〇〇の解き方や考え方を見いだすことができる。",
    "図・式・言葉を用いて、自分の考えを筋道立てて説明することができる。",
    "〇〇を日常生活や他の場面に活用して、問題を解決することができる。",
  ],
  態度育成型: [
    "粘り強く問題に取り組み、解決の見通しをもとうとしている。",
    "友達の考えを聞き、よりよい方法を協働して見いだそうとしている。",
    "学習を振り返り、わかったことや疑問を言葉でまとめようとしている。",
  ],
};

// =====================
// 単元について：単元観（教材観）・生徒観・指導観 文例
//   ※学習指導要領・各種指導案の記述を参考にした汎用テンプレート（複数選択可）
// =====================
const UNIT_VIEW = [ // 単元観（教材観）
  "本単元は、数学的な見方・考え方を働かせて課題を解決する力を育てる上で重要な単元である。",
  "本単元の内容は、既習事項を基礎とし、上学年や次単元の学習へと発展していく系統的な位置づけにある。",
  "日常生活や社会の事象との関連が深く、数学を活用するよさを実感させやすい教材である。",
  "生徒がつまずきやすい内容を含むため、具体物・図・ICTを用いて視覚的に理解を促す工夫が求められる。",
  "既習の知識や方法と関連づけることで、新しい概念や手順の意味を深く理解させることができる教材である。",
  "数学的活動を通して、根拠を明らかにして説明し合う言語活動を充実させやすい単元である。",
  "本単元では、具体的な操作や観察を通して、数学的な性質を帰納的に見いだす活動を大切にしたい。",
  "本単元で身につける見方・考え方は、今後の学習や他の場面でも活用できる汎用性の高いものである。",
  "抽象度が高く形式的な処理に陥りやすいため、意味理解を重視して指導する必要がある教材である。",
  "問題解決の過程を振り返り、よりよい方法を考える統合的・発展的な考察を促しやすい単元である。",
  "言葉・式・図・表・グラフなど複数の表現を関連づけて、理解を深めることができる教材である。",
  "誤答やつまずきが生じやすく、それらを取り上げることで思考を深める展開が組みやすい単元である。",
  "数学のよさや考えることの楽しさを味わわせ、学ぶ意義を実感させることができる教材である。",
  "根拠を基に筋道を立てて説明する力（論理的に考える力）を育てる上で適した題材である。",
];

const STUDENT_VIEW = [ // 生徒観
  "基礎的・基本的な技能はおおむね身についているが、その意味を説明することには課題が見られる。",
  "学習意欲は高く、課題に対して粘り強く取り組もうとする生徒が多い。",
  "自分の考えをもつことはできるが、根拠を明確にして説明することを苦手とする生徒が多い。",
  "ペアやグループでの対話的な活動には意欲的に取り組むことができる。",
  "既習事項の定着に個人差があり、つまずきに対する個別の支援を必要とする生徒もいる。",
  "図や式を用いて考えることに慣れておらず、多様な表現方法を広げる指導が求められる。",
  "計算などの技能は身についているが、それを活用して問題を解決する場面では戸惑う生徒が多い。",
  "間違いを恐れて発言をためらう生徒もおり、安心して考えを表現できる学級づくりが必要である。",
  "友達の考えを聞くことはできるが、自分の考えと比べて深めることには課題がある。",
  "ICT機器の操作には慣れており、考えを共有したり試行錯誤したりする活動に適応できる。",
  "既習事項を新しい場面で活用しようとする意識は、まだ十分に育っていない生徒が多い。",
  "数学を学ぶ意義を実感できず、学習に苦手意識をもっている生徒も一部に見られる。",
  "自力解決の場面では、見通しをもてずに手が止まってしまう生徒が見られる。",
  "学習を振り返り、わかったことや次の課題を言葉でまとめる経験を重ねてきている。",
];

const TEACHING_VIEW = [ // 指導観
  "具体的な事象を課題として取り上げ、生徒が興味をもって主体的に取り組めるようにする。",
  "自力解決の時間を十分に確保した上で、ペア・グループでの交流を通して考えを深めさせる。",
  "図・式・言葉を関連づけて表現させ、根拠を明確にして説明する力を育てる。",
  "つまずきが予想される場面では、具体物やICTを活用して視覚的に理解を支援する。",
  "既習事項と関連づけて考えさせることで、新しい概念や方法の意味を実感させる。",
  "学習を振り返る場面を設け、わかったことや次の課題を自分の言葉でまとめさせる。",
  "多様な考えを意図的に取り上げ、比較・検討する活動を通して理解を深めさせる。",
  "誤答やつまずきを肯定的に取り上げ、考えを深める手がかりとして生かす。",
  "解決の見通しをもたせるため、既習の方法を想起させる発問を工夫する。",
  "一人一人の考えを把握するため机間指導を行い、必要に応じて個別に支援する。",
  "考えを共有・可視化するためにICTを活用し、対話的な学びを促す。",
  "本時のめあてと振り返りを対応させ、学習の達成感をもたせるようにする。",
  "数学的な見方・考え方が働く場面を価値づけ、考えるよさを実感させる。",
  "根拠を問い返す発問を通して、筋道を立てて説明する力を高めていく。",
];

// =====================
// 学習活動
// =====================
const INTRO_ACTIVITIES = [
  "前時の内容を復習する（演習問題）",
  "本時の課題（問題）を提示する",
  "生活場面と結びつけて興味を引く",
  "既習事項との違いに気づかせる発問をする",
  "具体物・教具を使って問題意識をもたせる",
  "本時のめあてを板書・確認する",
  "課題について気づいたことや疑問を出し合う",
  "解決の見通し（方針）を全体で確認する",
  "前時の振り返りや誤答を取り上げる",
  "ICTで問題場面を提示する",
];
const MAIN_ACTIVITIES = [
  "個人で考える時間を確保する（自力解決）",
  "ペアで考えを共有する",
  "グループで話し合い、解法をまとめる",
  "全体で解法を発表・比較する",
  "教師が解説し、板書でまとめる",
  "練習問題に取り組む",
  "ICTを活用して考えを可視化・共有する",
  "ノートに自分の考えを整理してまとめる",
  "複数の解法を比較し、共通点や相違点を考える",
  "考えの根拠を説明し合う",
  "条件を変えて発展的に考える",
  "見いだした性質や手順を一般化する",
  "図や具体物を操作して性質を確かめる",
  "間違いやつまずきを取り上げて検討する",
];
const CLOSING_ACTIVITIES = [
  "本時のまとめを板書・確認する",
  "振り返りシートに記入する",
  "練習問題・宿題を確認する",
  "次時の学習内容を予告する",
  "学んだことを一言でまとめる（ひとこと発表）",
  "本時のめあてに対する自己評価をする",
  "学んだことが使える場面を考える",
  "適用問題（確認問題）に取り組む",
];

// =====================
// 指導上の留意点
// =====================
const TEACHER_NOTES = {
  導入: [
    "既習事項との関連を意識させ、見通しをもって取り組めるようにする。",
    "全員が課題を理解できるよう、丁寧に確認する。",
    "前時の誤答や疑問点を取り上げ、本時の学習につなげる。",
    "めあてを生徒自身の言葉で確認させる。",
  ],
  展開: [
    "個人思考の時間を十分に確保し、自分の考えをもてるようにする。",
    "グループ活動では、全員が発言できるよう役割を明確にする。",
    "つまずきが予想される場面では、机間指導で個別に支援する。",
    "多様な考えを比較・検討し、理解を深めさせる。",
    "発表の際は、根拠を明確にして説明するよう促す。",
    "誤答を肯定的に取り上げ、考える材料にする。",
  ],
  まとめ: [
    "本時の学習内容を振り返り、自分の言葉でまとめさせる。",
    "次時の学習への見通しをもたせる。",
    "学習の達成感が得られるよう、肯定的なフィードバックを行う。",
    "めあてに対する自己評価をさせる。",
  ],
};

// =====================
// 本時の展開：選べる「項目（列）」とその中身の選択肢
// =====================
const PHASES = ["導入", "展開", "まとめ"];

const ITEM_TYPES = [
  { id: "katsudo", label: "学習活動", color: "#2ecc71" },
  { id: "naiyou", label: "学習内容", color: "#16a085" },
  { id: "hatsumon", label: "主な発問", color: "#e67e22" },
  { id: "hannou", label: "予想される生徒の反応", color: "#d4ac0d" },
  { id: "ryuiten", label: "指導上の留意点", color: "#3498db" },
  { id: "tedate", label: "教師の手立て・支援", color: "#9b59b6" },
  { id: "hyouka", label: "評価（観点・方法）", color: "#e74c3c" },
  { id: "keitai", label: "学習形態", color: "#1abc9c" },
];

// 全フェーズ共通の選択肢（評価・学習形態）
const EVAL_CELL = [
  "【知】〇〇を理解している。（ノート・発言）",
  "【知】〇〇を正確に求めている。（ノート・小テスト）",
  "【思】根拠を明確にして考えを説明している。（ノート・発表）",
  "【思】既習と関連づけて解法を見いだしている。（ノート・観察）",
  "【態】粘り強く課題に取り組もうとしている。（行動観察）",
  "【態】学習を振り返り次に生かそうとしている。（振り返りシート）",
  "（本時はこの場面では評価しない）",
];
const KEITAI_CELL = ["一斉", "個人（自力解決）", "ペア", "グループ", "全体交流"];

const ITEM_OPTIONS = {
  katsudo: {
    導入: INTRO_ACTIVITIES,
    展開: MAIN_ACTIVITIES,
    まとめ: CLOSING_ACTIVITIES,
  },
  naiyou: {
    導入: ["前時の学習内容の確認", "本時の課題の把握", "めあての設定", "解決の見通しをもつ", "既習事項との関連の確認"],
    展開: ["新しい概念・性質の理解", "解法の考察と一般化", "考えの交流・比較・検討", "練習による技能の習熟", "根拠を明確にした説明", "発展的な問題の考察"],
    まとめ: ["本時のまとめ（一般化）", "学習内容の振り返り", "次時への見通し", "学習内容の活用場面の確認"],
  },
  hatsumon: {
    導入: ["前の時間は何を学んだかな？", "今日はどんな問題に取り組むだろう？", "これまでの方法で解けるだろうか？", "気づいたことはあるかな？", "どんなことが分かればよいだろう？"],
    展開: ["どうしてそう考えたのか説明できるかな？", "ほかの考え方はないだろうか？", "共通していることは何だろう？", "この方法のよさは何かな？", "いつでも成り立つと言えるかな？", "どの考えが分かりやすいだろう？", "なぜそう言えるのか根拠は？"],
    まとめ: ["今日わかったことは何かな？", "どんなときに使えそうかな？", "次はどんなことを考えてみたい？", "前の問題とどこが違ったかな？"],
  },
  hannou: {
    導入: ["既習の方法を思い出そうとする", "問題の意味を捉えようとする", "解決の見通しをもとうとする", "課題に疑問や見通しをもつ"],
    展開: ["自分なりの方法で解こうとする", "友達の考えと比べる", "共通点や相違点に気づく", "別の解法を見いだす", "つまずいて悩む", "根拠をもって説明しようとする", "性質を一般化して捉える"],
    まとめ: ["自分の言葉でまとめる", "学習を振り返る", "活用できる場面を考える", "新たな疑問をもつ"],
  },
  ryuiten: TEACHER_NOTES,
  tedate: {
    導入: ["既習事項を想起できるよう掲示物を用意する", "具体物や図を提示して問題意識をもたせる", "めあてを全員で確認する", "解決の見通しをもてるよう発問する"],
    展開: ["机間指導で個別に支援する", "つまずく生徒にヒントカードを与える", "複数の考えを意図的に取り上げる", "ICTで考えを共有・可視化する", "考えを比較する視点を与える", "発表の前にペアで説明し合わせる", "根拠を問い返して思考を促す"],
    まとめ: ["キーワードを使ってまとめさせる", "振り返りの観点を示す", "次時とのつながりを示す", "肯定的なフィードバックを行う"],
  },
  hyouka: { 導入: EVAL_CELL, 展開: EVAL_CELL, まとめ: EVAL_CELL },
  keitai: { 導入: KEITAI_CELL, 展開: KEITAI_CELL, まとめ: KEITAI_CELL },
};

// =====================
// 評価規準 文例（3観点）
// =====================
const EVAL_TEMPLATES = {
  知識技能: [
    "〇〇の意味や性質を理解している。",
    "〇〇を用いた計算や処理を正確に行うことができる。",
    "〇〇について、用語や記号を正しく用いて表すことができる。",
    "自由入力",
  ],
  思考判断表現: [
    "既習事項を活用して、課題解決の見通しをもつことができる。",
    "図・式・言葉を用いて、自分の考えを根拠を明確にして説明することができる。",
    "複数の解法を比較し、より簡潔で適切な方法を選ぶことができる。",
    "〇〇を具体的な場面に活用して、問題を解決することができる。",
    "自由入力",
  ],
  主体的態度: [
    "〇〇の学習に粘り強く取り組み、解決しようとしている。",
    "友達の考えを参考にしながら、自分の考えを深めようとしている。",
    "学習を振り返り、学んだことを次の学習に生かそうとしている。",
    "自由入力",
  ],
};

const TIME_OPTIONS = [45, 50];
const LESSON_NUMS = Array.from({ length: 25 }, (_, i) => String(i + 1));

// =====================================================================
// メインコンポーネント
// =====================================================================
export default function LessonPlanApp() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    grade: "1年",
    unit: "正負の数",
    lessonNum: "1",
    totalLessons: "6",
    duration: 50,
    teacher: "",
    school: "",
    date: "",
    classroom: "",
    studentCount: "",
    unitGoal: "",
    unitGoalCustom: "",
    topic: "", // 「〇〇」に入れる語句（空なら単元名を使用）
    // 本時で扱う問題・想定されるつまずき
    problems: [],
    problemsCustom: "",
    mistakes: [],
    mistakesCustom: "",
    // 単元について（必要な項目だけチェック）
    useUnitView: false,
    useStudentView: false,
    useTeachingView: false,
    unitView: [],
    studentView: [],
    teachingView: [],
    unitViewCustom: "",
    studentViewCustom: "",
    teachingViewCustom: "",
    // 本時の目標
    goalType: "思考活用型",
    goalText: "",
    goalCustom: "",
    // 学習過程
    introMin: 10,
    closingMin: 10,
    columns: ["katsudo", "ryuiten"], // 展開表に表示する項目（列）
    cells: { 導入: {}, 展開: {}, まとめ: {} }, // cells[phase][itemId] = [選択肢...]
    boardPlan: "",
    materials: "",
    useICT: false,
    // 評価規準
    eval1: "", eval1Custom: "",
    eval2: "", eval2Custom: "",
    eval3: "", eval3Custom: "",
  });

  const update = useCallback((key, val) => setForm(f => ({ ...f, [key]: val })), []);
  const toggleArr = useCallback((key, val) => {
    setForm(f => {
      const arr = f[key];
      return { ...f, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
    });
  }, []);
  // 展開セル（順序つき・重複可）の編集
  const mutateSeq = useCallback((phase, itemId, fn) => {
    setForm(f => {
      const phaseObj = f.cells[phase] || {};
      const arr = [...(phaseObj[itemId] || [])];
      return { ...f, cells: { ...f.cells, [phase]: { ...phaseObj, [itemId]: fn(arr) } } };
    });
  }, []);
  const seqAdd = useCallback((p, i, val) => mutateSeq(p, i, a => { a.push(val); return a; }), [mutateSeq]);
  const seqInsert = useCallback((p, i, idx, val) => mutateSeq(p, i, a => { a.splice(idx, 0, val); return a; }), [mutateSeq]);
  const seqRemove = useCallback((p, i, idx) => mutateSeq(p, i, a => { a.splice(idx, 1); return a; }), [mutateSeq]);
  const seqMove = useCallback((p, i, from, to) => mutateSeq(p, i, a => {
    if (to < 0 || to >= a.length) return a;
    const [x] = a.splice(from, 1); a.splice(to, 0, x); return a;
  }), [mutateSeq]);

  const unitList = UNITS[form.grade] || [];
  const goalList = GOALS[form.goalType];
  const mainAuto = form.duration - form.introMin - form.closingMin;
  const unitGoalList = UNIT_GOALS[form.unit] || [];

  const topicWord = (form.topic && form.topic.trim()) || form.unit;
  const fillBlank = (s) => (s || "").replace(/〇〇/g, topicWord);
  const getEval = (key, customKey) => fillBlank(form[key] === "自由入力" ? form[customKey] : form[key]);
  const getUnitGoal = () => fillBlank(form.unitGoal === "自由入力" ? form.unitGoalCustom : form.unitGoal);
  const getGoal = () => fillBlank(form.goalText === "自由入力" ? form.goalCustom : form.goalText);

  const steps = ["基本情報", "単元について", "学習過程", "評価規準", "指導案"];

  // 入力充足チェック（簡易バリデーション）
  const stepWarnings = useMemo(() => {
    const w = {};
    if (!form.unit) w[1] = "単元名を選択してください";
    if (mainAuto <= 0) w[3] = "展開の時間が0以下です。導入・まとめの時間を見直してください";
    return w;
  }, [form.unit, mainAuto]);

  return (
    <div style={S.app}>
      {/* ヘッダー */}
      <div style={S.header}>
        <div>
          <div style={S.headerKicker}>Lesson Plan Builder</div>
          <div style={S.headerTitle}>📐 中学校数学　学習指導案サポート</div>
        </div>
        <div style={S.versionBadge}>中学校数学科 専用</div>
      </div>

      {/* ステップ */}
      <div style={S.stepBar}>
        {steps.map((s, i) => {
          const n = i + 1;
          const state = step === n ? "current" : step > n ? "done" : "todo";
          return (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div
                onClick={() => n < step && setStep(n)}
                style={{
                  ...S.stepDot,
                  background: state === "current" ? "#3d7ab5" : state === "done" ? "#2ecc71" : "rgba(255,255,255,0.08)",
                  border: state === "current" ? "2px solid #7ab3d4" : "2px solid transparent",
                  color: state === "todo" ? "#667" : "#fff",
                  cursor: n < step ? "pointer" : "default",
                }}
              >
                {state === "done" ? "✓" : n}
              </div>
              <div style={{ ...S.stepLabel, color: state === "current" ? "#9fd0ec" : state === "done" ? "#7fcf9e" : "#5a6b78" }}>{s}</div>
              {i < steps.length - 1 && <div style={{ ...S.stepLine, background: step > n ? "#2ecc71" : "#2a3a4a" }} />}
            </div>
          );
        })}
      </div>

      <div style={S.container}>
        {/* ====================== STEP 1 基本情報 ====================== */}
        {step === 1 && (
          <Card title="📚 基本情報">
            <Row label="学年">
              <ToggleGroup options={GRADES} value={form.grade}
                onChange={v => { update("grade", v); update("unit", UNITS[v][0]); update("unitGoal", ""); update("problems", []); update("mistakes", []); }} />
            </Row>
            <Row label="単元名">
              <Select options={unitList} value={form.unit} onChange={v => { update("unit", v); update("unitGoal", ""); update("problems", []); update("mistakes", []); }} />
              {form.unit && <div style={S.tag}>{UNIT_DOMAIN[form.unit]}</div>}
            </Row>
            <Row label="「〇〇」に入れる語句">
              <TextInput value={form.topic} onChange={v => update("topic", v)} placeholder={`未入力なら単元名「${form.unit}」を使用`} />
              <div style={{ fontSize: 10, color: "#67737d" }}>目標・評価規準の「〇〇」がこの語句に置き換わります</div>
            </Row>

            <div style={{ display: "flex", gap: 16, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
              <div style={S.rowLabel}>授業時数</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                <span style={S.inlineText}>第</span>
                <Select options={LESSON_NUMS} value={form.lessonNum} onChange={v => update("lessonNum", v)} small />
                <span style={S.inlineText}>時　/　全</span>
                <Select options={LESSON_NUMS} value={form.totalLessons} onChange={v => update("totalLessons", v)} small />
                <span style={S.inlineText}>時間扱い</span>
              </div>
            </div>

            <Row label="授業時間">
              <ToggleGroup options={TIME_OPTIONS.map(t => `${t}分`)} value={`${form.duration}分`}
                onChange={v => update("duration", parseInt(v))} />
            </Row>

            <Divider />
            <SectionTitle>🏫 実施情報（任意）</SectionTitle>
            <Row label="授業者"><TextInput value={form.teacher} onChange={v => update("teacher", v)} placeholder="例：山田 太郎" /></Row>
            <Row label="学校名"><TextInput value={form.school} onChange={v => update("school", v)} placeholder="例：〇〇市立△△中学校" /></Row>
            <Row label="実施日時"><TextInput value={form.date} onChange={v => update("date", v)} placeholder="例：令和8年6月10日（水）第3校時" /></Row>
            <Row label="場所"><TextInput value={form.classroom} onChange={v => update("classroom", v)} placeholder="例：1年2組教室" /></Row>
            <Row label="生徒数"><TextInput value={form.studentCount} onChange={v => update("studentCount", v)} placeholder="例：32名（男子16名・女子16名）" /></Row>

            <Divider />
            <SectionTitle>🎯 単元の目標</SectionTitle>
            <RadioList items={unitGoalList} value={form.unitGoal} onChange={v => update("unitGoal", v)}
              customValue={form.unitGoalCustom} onCustomChange={v => update("unitGoalCustom", v)}
              emptyNote="この単元の文例は準備中です。自由入力をご利用ください。" />

            <NextBtn onClick={() => setStep(2)} />
          </Card>
        )}

        {/* ====================== STEP 2 単元について ====================== */}
        {step === 2 && (
          <Card title="📝 単元について（単元観・生徒観・指導観）">
            <Hint>記載が必要な項目にチェックを入れると、文例が表示されます。当てはまるものを選び（複数可）、必要に応じて自由記述で具体化してください。「教材観→生徒観→指導観」の順が一般的です。</Hint>

            <ViewSection
              title="単元観（教材観）" color="#3498db"
              desc="単元・教材の価値や意義、系統性、つまずきやすい点など"
              enabled={form.useUnitView} onToggleEnabled={() => update("useUnitView", !form.useUnitView)}
              templates={UNIT_VIEW} selected={form.unitView} onToggle={v => toggleArr("unitView", v)}
              custom={form.unitViewCustom} onCustom={v => update("unitViewCustom", v)} />

            <ViewSection
              title="生徒観" color="#e67e22"
              desc="生徒の実態。よい面（伸ばしたい力）と課題を分析的に"
              enabled={form.useStudentView} onToggleEnabled={() => update("useStudentView", !form.useStudentView)}
              templates={STUDENT_VIEW} selected={form.studentView} onToggle={v => toggleArr("studentView", v)}
              custom={form.studentViewCustom} onCustom={v => update("studentViewCustom", v)} />

            <ViewSection
              title="指導観" color="#2ecc71"
              desc="単元観・生徒観を受けた、具体的な指導の手だて"
              enabled={form.useTeachingView} onToggleEnabled={() => update("useTeachingView", !form.useTeachingView)}
              templates={TEACHING_VIEW} selected={form.teachingView} onToggle={v => toggleArr("teachingView", v)}
              custom={form.teachingViewCustom} onCustom={v => update("teachingViewCustom", v)} />

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <BackBtn onClick={() => setStep(1)} />
              <NextBtn onClick={() => setStep(3)} />
            </div>
          </Card>
        )}

        {/* ====================== STEP 3 学習過程 ====================== */}
        {step === 3 && (
          <Card title="⏱ 本時の学習過程">
            <SectionTitle>🎯 本時の目標</SectionTitle>
            <Row label="目標タイプ">
              <ToggleGroup options={["知識習得型", "思考活用型", "態度育成型"]} value={form.goalType}
                onChange={v => { update("goalType", v); update("goalText", ""); }} />
            </Row>
            <Row label="目標文例">
              <RadioList items={goalList} value={form.goalText} onChange={v => update("goalText", v)}
                customValue={form.goalCustom} onCustomChange={v => update("goalCustom", v)} radioName="goalText" />
            </Row>

            <Divider />
            {/* 時間配分 */}
            <div style={S.timeBox}>
              <div style={S.timeBoxTitle}>時間配分（合計 {form.duration}分）</div>
              <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <TimeSlider label="導入" value={form.introMin} onChange={v => update("introMin", v)} min={3} max={20} color="#e74c3c" />
                <div style={S.plus}>＋</div>
                <div style={S.mainTimeBox}>
                  <div style={{ fontSize: 11, color: "#2ecc71", marginBottom: 4 }}>展開（自動）</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: mainAuto > 0 ? "#2ecc71" : "#e74c3c" }}>{mainAuto}分</div>
                </div>
                <div style={S.plus}>＋</div>
                <TimeSlider label="まとめ" value={form.closingMin} onChange={v => update("closingMin", v)} min={3} max={15} color="#9b59b6" />
              </div>
              {mainAuto <= 0 && <div style={S.warn}>⚠ 展開の時間が確保できません。導入・まとめを短くしてください。</div>}
            </div>

            {/* 表示する項目（列）を選ぶ */}
            <SectionTitle>📋 指導案に表示する項目（列）を選ぶ</SectionTitle>
            <Hint>チェックした項目が展開表の列になります。各段階（導入・展開・まとめ）ごとに中身を選べます。</Hint>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
              {ITEM_TYPES.map(it => {
                const on = form.columns.includes(it.id);
                return (
                  <label key={it.id} onClick={() => toggleArr("columns", it.id)} style={{
                    ...S.checkChip, padding: "6px 12px", alignItems: "center",
                    border: on ? `1px solid ${it.color}` : "1px solid #2a3a4a",
                    background: on ? `${it.color}22` : "rgba(255,255,255,0.03)",
                  }}>
                    <span style={{ color: on ? it.color : "#556", fontWeight: 700 }}>{on ? "✓" : "＋"}</span>
                    <span style={{ fontSize: 12.5, color: on ? "#dfe8ee" : "#9aa" }}>{it.label}</span>
                  </label>
                );
              })}
            </div>

            <Hint>右の「選択肢リスト」をクリック、またはドラッグして左の「組み込み済み」へ入れてください。同じ項目を何度でも追加でき、↑↓やドラッグで順番を入れ替えられます。</Hint>
            {PHASES.map(phase => {
              const color = phase === "導入" ? "#e74c3c" : phase === "展開" ? "#2ecc71" : "#9b59b6";
              const minutes = phase === "導入" ? form.introMin : phase === "まとめ" ? form.closingMin : mainAuto;
              const orderedCols = ITEM_TYPES.filter(it => form.columns.includes(it.id));
              return (
                <div key={phase} style={{ marginBottom: 22, border: `1px solid ${color}33`, borderRadius: 10, padding: 14, background: `${color}08` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color, marginBottom: 12 }}>{phase}（{minutes}分）</div>
                  {orderedCols.length === 0 && <div style={{ fontSize: 12, color: "#778" }}>上で項目を選んでください。</div>}
                  {orderedCols.map(it => (
                    <SeqBuilder key={it.id} phase={phase} item={it}
                      options={ITEM_OPTIONS[it.id]?.[phase] || []}
                      seq={form.cells[phase]?.[it.id] || []}
                      onAdd={v => seqAdd(phase, it.id, v)}
                      onInsert={(idx, v) => seqInsert(phase, it.id, idx, v)}
                      onRemove={idx => seqRemove(phase, it.id, idx)}
                      onMove={(from, to) => seqMove(phase, it.id, from, to)} />
                  ))}
                </div>
              );
            })}

            <Divider />
            <SectionTitle>🧮 本時で扱う問題・例題（{form.unit}）</SectionTitle>
            <Hint>この単元でよく扱う問題例です。選ぶと指導案に「本時で扱う問題」として載ります。自由記述で追記もできます。</Hint>
            <BankPicker options={UNIT_BANK[form.unit]?.problems || []} selected={form.problems}
              onToggle={v => toggleArr("problems", v)} color="#3498db"
              custom={form.problemsCustom} onCustom={v => update("problemsCustom", v)}
              emptyNote="この単元の問題例は準備中です。自由記述をご利用ください。" />

            <Divider />
            <SectionTitle>⚠️ 予想されるつまずき・誤答と手立て（{form.unit}）</SectionTitle>
            <Hint>初任者がつまずきの予想を書きやすいよう、典型例を用意しました。選ぶと指導案に専用欄として載ります。</Hint>
            <BankPicker options={UNIT_BANK[form.unit]?.mistakes || []} selected={form.mistakes}
              onToggle={v => toggleArr("mistakes", v)} color="#e67e22"
              custom={form.mistakesCustom} onCustom={v => update("mistakesCustom", v)}
              emptyNote="この単元の誤答例は準備中です。自由記述をご利用ください。" />

            <Divider />
            <SectionTitle>🧰 準備物・教材（任意）</SectionTitle>
            <TextInput value={form.materials} onChange={v => update("materials", v)}
              placeholder="例：教科書p.52、ワークシート、定規・コンパス、GeoGebra" />
            <div style={{ marginTop: 12 }}>
              <label style={S.checkLabel}>
                <input type="checkbox" checked={form.useICT} onChange={e => update("useICT", e.target.checked)} />
                <span style={{ fontSize: 13, color: "#ccd6dd" }}>ICT活用あり（タブレット・電子黒板など）</span>
              </label>
            </div>

            <Divider />
            <SectionTitle>🖊 板書計画（任意）</SectionTitle>
            <textarea value={form.boardPlan} onChange={e => update("boardPlan", e.target.value)}
              placeholder="例）左：課題提示・本時のめあて　中央：生徒の考え・解法の比較　右：本時のまとめ"
              style={{ ...S.textarea, minHeight: 70 }} />

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <BackBtn onClick={() => setStep(2)} />
              <NextBtn onClick={() => setStep(4)} />
            </div>
          </Card>
        )}

        {/* ====================== STEP 4 評価規準 ====================== */}
        {step === 4 && (
          <Card title="📊 本時の評価規準（観点別3観点）">
            <Hint>各観点について、本時で見取る評価規準を1つ選ぶか、自由入力で記述してください。「〇〇」は単元名に置き換えると具体的になります。</Hint>
            <EvalSection label="① 知識・技能" color="#3498db" templates={EVAL_TEMPLATES.知識技能}
              value={form.eval1} customValue={form.eval1Custom} onChange={v => update("eval1", v)} onCustomChange={v => update("eval1Custom", v)} />
            <EvalSection label="② 思考・判断・表現" color="#e67e22" templates={EVAL_TEMPLATES.思考判断表現}
              value={form.eval2} customValue={form.eval2Custom} onChange={v => update("eval2", v)} onCustomChange={v => update("eval2Custom", v)} />
            <EvalSection label="③ 主体的に学習に取り組む態度" color="#2ecc71" templates={EVAL_TEMPLATES.主体的態度}
              value={form.eval3} customValue={form.eval3Custom} onChange={v => update("eval3", v)} onCustomChange={v => update("eval3Custom", v)} />
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <BackBtn onClick={() => setStep(3)} />
              <NextBtn onClick={() => setStep(5)} label="指導案を完成させる →" />
            </div>
          </Card>
        )}

        {/* ====================== STEP 5 プレビュー ====================== */}
        {step === 5 && (
          <div>
            <Card title="📄 学習指導案">
              <PreviewDoc form={form} mainAuto={mainAuto} getEval={getEval} getUnitGoal={getUnitGoal} getGoal={getGoal} />
              <Divider />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => copyText(buildAIPrompt(form, buildPlainText(form, mainAuto, getEval, getUnitGoal, getGoal)), "AI清書用プロンプトをコピーしました。ChatGPTなどに貼り付けて送信してください。")} style={{ ...S.btn, background: "linear-gradient(135deg, #6b2fae, #9b59b6)", flex: 1, minWidth: 160 }}>🤖 AI清書プロンプトをコピー</button>
                <button onClick={() => downloadDoc(form, mainAuto)} style={{ ...S.btn, background: "linear-gradient(135deg, #1a6b3a, #2ecc71)", flex: 1, minWidth: 140 }}>📄 Wordで保存（.doc）</button>
                <button onClick={() => window.print()} style={{ ...S.btn, background: "linear-gradient(135deg, #2d5a8e, #3d7ab5)", flex: 1, minWidth: 130 }}>🖨 印刷 / PDF</button>
                <button onClick={() => copyText(buildPlainText(form, mainAuto, getEval, getUnitGoal, getGoal), "指導案のテキストをコピーしました。")} style={{ ...S.btn, background: "rgba(255,255,255,0.06)", border: "1px solid #2a3a4a", color: "#9aa", flex: 1, minWidth: 130 }}>📋 テキストをコピー</button>
              </div>
            </Card>
            <div style={{ marginTop: 10 }}><BackBtn onClick={() => setStep(4)} /></div>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// 指導案プレビュー
// =====================================================================
function PreviewDoc({ form, mainAuto, getEval, getUnitGoal, getGoal }) {
  const goal = getGoal() || "（本時の目標を選択または入力してください）";
  const unitGoal = getUnitGoal();
  const td = { border: "1px solid #999", padding: "6px 10px", verticalAlign: "top", fontSize: 11, lineHeight: 1.8 };
  const th = { ...td, background: "#eef1f4", fontWeight: 700, textAlign: "center", whiteSpace: "nowrap" };

  // 通し番号を動的に
  let no = 0;
  const N = () => ++no;

  return (
    <div style={S.doc}>
      {/* タイトル */}
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: 2 }}>第{form.grade}　数学科　学習指導案</div>
      </div>
      {(form.date || form.school || form.teacher || form.classroom || form.studentCount) && (
        <table style={{ marginLeft: "auto", fontSize: 11, borderCollapse: "collapse", marginBottom: 14 }}>
          <tbody>
            {form.date && <tr><td style={S.metaK}>日　　時</td><td>{form.date}</td></tr>}
            {form.classroom && <tr><td style={S.metaK}>場　　所</td><td>{form.classroom}</td></tr>}
            {form.studentCount && <tr><td style={S.metaK}>学　　級</td><td>{form.studentCount}</td></tr>}
            {form.school && <tr><td style={S.metaK}>学　　校</td><td>{form.school}</td></tr>}
            {form.teacher && <tr><td style={S.metaK}>授 業 者</td><td>{form.teacher}</td></tr>}
          </tbody>
        </table>
      )}

      <HRule />

      <InfoBlock label={`${N()}　単元名`} value={`${form.unit}　（${UNIT_DOMAIN[form.unit] || ""}）`} />
      {unitGoal && <InfoBlock label={`${N()}　単元の目標`} value={unitGoal} />}

      {/* 単元について（チェックした観のみ・自由記述を含む） */}
      {(() => {
        const views = [
          form.useUnitView && { label: "単元観（教材観）", items: [...form.unitView, ...(form.unitViewCustom ? [form.unitViewCustom] : [])] },
          form.useStudentView && { label: "生徒観", items: [...form.studentView, ...(form.studentViewCustom ? [form.studentViewCustom] : [])] },
          form.useTeachingView && { label: "指導観", items: [...form.teachingView, ...(form.teachingViewCustom ? [form.teachingViewCustom] : [])] },
        ].filter(v => v && v.items.length > 0);
        if (views.length === 0) return null;
        return (
          <div style={{ marginBottom: 16 }}>
            <div style={S.docH}>{N()}　単元について</div>
            {views.map((v, i) => (
              <div key={i} style={{ marginBottom: 10, paddingLeft: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>{`(${i + 1}) ${v.label}`}</div>
                <div style={{ paddingLeft: 12, textIndent: "1em", lineHeight: 1.95 }}>{joinProse(v.items)}</div>
              </div>
            ))}
          </div>
        );
      })()}

      <InfoBlock label={`${N()}　本時の位置`} value={`全${form.totalLessons}時間扱い　本時は第${form.lessonNum}時（${form.duration}分）`} />

      {/* 本時の目標 */}
      <div style={{ marginBottom: 16 }}>
        <div style={S.docH}>{N()}　本時の目標</div>
        <div style={{ paddingLeft: 16 }}>・{goal}</div>
      </div>

      {/* 本時で扱う問題 */}
      {(() => {
        const probs = [...form.problems, ...(form.problemsCustom ? [form.problemsCustom] : [])];
        if (probs.length === 0) return null;
        return (
          <div style={{ marginBottom: 16 }}>
            <div style={S.docH}>{N()}　本時で扱う問題・例題</div>
            <div style={{ paddingLeft: 16 }}>{probs.map((p, i) => <div key={i}>・{p}</div>)}</div>
          </div>
        );
      })()}

      {/* 評価規準 */}
      <div style={{ marginBottom: 18 }}>
        <div style={S.docH}>{N()}　本時の評価規準</div>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", wordBreak: "break-word" }}>
          <thead>
            <tr>
              <th style={{ ...th, width: "33%" }}>知識・技能</th>
              <th style={{ ...th, width: "33%" }}>思考・判断・表現</th>
              <th style={{ ...th, width: "34%" }}>主体的に学習に<br />取り組む態度</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={td}>{getEval("eval1", "eval1Custom") || "―"}</td>
              <td style={td}>{getEval("eval2", "eval2Custom") || "―"}</td>
              <td style={td}>{getEval("eval3", "eval3Custom") || "―"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 準備物 */}
      {form.materials && (
        <InfoBlock label={`${N()}　準備物`} value={`${form.materials}${form.useICT ? "　／　ICT活用（タブレット・電子黒板等）" : ""}`} />
      )}

      {/* 本時の展開（選択した項目を列に） */}
      <div style={{ marginBottom: 16 }}>
        <div style={S.docH}>{N()}　本時の展開</div>
        {(() => {
          const cols = ITEM_TYPES.filter(it => form.columns.includes(it.id));
          const rows = [
            { phase: "導入", minutes: form.introMin, bg: "#fff7f6" },
            { phase: "展開", minutes: mainAuto, bg: "#f5fdf7" },
            { phase: "まとめ", minutes: form.closingMin, bg: "#faf7fd" },
          ];
          return (
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", wordBreak: "break-word" }}>
              <thead>
                <tr>
                  <th style={{ ...th, width: 64 }}>段階</th>
                  {cols.map(c => <th key={c.id} style={th}>{c.label}</th>)}
                  {cols.length === 0 && <th style={th}>（項目未選択）</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ phase, minutes, bg }) => (
                  <tr key={phase}>
                    <td style={{ ...td, background: bg, textAlign: "center", fontWeight: 700 }}>{phase}<br />（{minutes}分）</td>
                    {cols.map(c => {
                      const sel = form.cells[phase]?.[c.id] || [];
                      return <td key={c.id} style={td}>{sel.length ? sel.map((x, i) => <div key={i}>・{x}</div>) : <span style={{ color: "#bbb" }}>―</span>}</td>;
                    })}
                    {cols.length === 0 && <td style={td}><span style={{ color: "#bbb" }}>―</span></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          );
        })()}
      </div>

      {/* 予想されるつまずき・誤答と手立て */}
      {(() => {
        const mis = [...form.mistakes, ...(form.mistakesCustom ? [form.mistakesCustom] : [])];
        if (mis.length === 0) return null;
        return (
          <div style={{ marginBottom: 16 }}>
            <div style={S.docH}>{N()}　予想されるつまずき・誤答と手立て</div>
            <div style={{ paddingLeft: 16 }}>{mis.map((m, i) => <div key={i}>・{m}</div>)}</div>
          </div>
        );
      })()}

      {/* 板書計画 */}
      {form.boardPlan && (
        <div>
          <div style={S.docH}>{N()}　板書計画</div>
          <div style={{ border: "1px solid #ccc", borderRadius: 4, padding: "10px 14px", background: "#fafafa", whiteSpace: "pre-wrap", lineHeight: 1.9 }}>{form.boardPlan}</div>
        </div>
      )}
    </div>
  );
}

// プレーンテキスト生成（コピー用）
function buildPlainText(form, mainAuto, getEval, getUnitGoal, getGoal) {
  const L = [];
  L.push(`第${form.grade}　数学科　学習指導案`);
  if (form.date) L.push(`日時：${form.date}`);
  if (form.school) L.push(`学校：${form.school}`);
  if (form.teacher) L.push(`授業者：${form.teacher}`);
  L.push("");
  let n = 0;
  L.push(`${++n}　単元名　${form.unit}（${UNIT_DOMAIN[form.unit] || ""}）`);
  const ug = getUnitGoal();
  if (ug) L.push(`${++n}　単元の目標\n　${ug}`);
  const views = [
    form.useUnitView && { label: "単元観（教材観）", items: [...form.unitView, ...(form.unitViewCustom ? [form.unitViewCustom] : [])] },
    form.useStudentView && { label: "生徒観", items: [...form.studentView, ...(form.studentViewCustom ? [form.studentViewCustom] : [])] },
    form.useTeachingView && { label: "指導観", items: [...form.teachingView, ...(form.teachingViewCustom ? [form.teachingViewCustom] : [])] },
  ].filter(v => v && v.items.length > 0);
  if (views.length) {
    L.push(`${++n}　単元について`);
    views.forEach((v, i) => { L.push(`(${i + 1}) ${v.label}`); L.push(`　${joinProse(v.items)}`); });
  }
  L.push(`${++n}　本時の位置　全${form.totalLessons}時間扱い　本時は第${form.lessonNum}時（${form.duration}分）`);
  L.push(`${++n}　本時の目標\n　・${getGoal() || ""}`);
  const probs = [...form.problems, ...(form.problemsCustom ? [form.problemsCustom] : [])];
  if (probs.length) { L.push(`${++n}　本時で扱う問題・例題`); probs.forEach(p => L.push(`　・${p}`)); }
  L.push(`${++n}　本時の評価規準`);
  L.push(`　知識・技能：${getEval("eval1", "eval1Custom") || "―"}`);
  L.push(`　思考・判断・表現：${getEval("eval2", "eval2Custom") || "―"}`);
  L.push(`　主体的に学習に取り組む態度：${getEval("eval3", "eval3Custom") || "―"}`);
  if (form.materials) L.push(`${++n}　準備物　${form.materials}${form.useICT ? "／ICT活用" : ""}`);
  L.push(`${++n}　本時の展開`);
  const cols = ITEM_TYPES.filter(it => form.columns.includes(it.id));
  [["導入", form.introMin], ["展開", mainAuto], ["まとめ", form.closingMin]].forEach(([p, m]) => {
    L.push(`【${p}（${m}分）】`);
    cols.forEach(c => {
      const sel = form.cells[p]?.[c.id] || [];
      sel.forEach(x => L.push(`　${c.label}：${x}`));
    });
  });
  const mis = [...form.mistakes, ...(form.mistakesCustom ? [form.mistakesCustom] : [])];
  if (mis.length) { L.push(`${++n}　予想されるつまずき・誤答と手立て`); mis.forEach(x => L.push(`　・${x}`)); }
  if (form.boardPlan) L.push(`${++n}　板書計画\n　${form.boardPlan}`);
  return L.join("\n");
}

function copyText(text, msg) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => alert(msg || "コピーしました。"));
  } else {
    alert("コピーに対応していない環境です。");
  }
}

// 生成AIへ渡す「清書用プロンプト」を組み立てる（選択内容＝素材＋指示）
function buildAIPrompt(form, materials) {
  return [
    `あなたは中学校数学の指導教官です。下の【素材】は、ある教員が作成支援ツールで選んだ学習指導案の骨格です。`,
    `これを、そのまま提出できる完成度の高い「中学校第${form.grade} 数学科 学習指導案」に清書・加筆してください。`,
    ``,
    `【守ること】`,
    `1. 平成29年告示の中学校学習指導要領（数学）に沿うこと。3観点（知識・技能／思考・判断・表現／主体的に学習に取り組む態度）の整合をとること。`,
    `2. 本時の目標・評価規準・学習活動・評価場面が一本の筋で対応するようにすること。`,
    `3. 「本時で扱う問題・例題」を具体的な数値・式で示し、模範解答と想定される複数の解法を書くこと。`,
    `4. 「予想されるつまずき・誤答」それぞれに、教師の具体的な手立て（発問・支援）を対応づけること。`,
    `5. 本時の展開は「学習活動／予想される生徒の反応／指導上の留意点・評価」を縦に対応させた表にすること。時間配分も明記。`,
    `6. 板書計画を、課題・生徒の考え・まとめが分かるレイアウトで具体化すること。`,
    `7. 教科書のページ番号や固有名詞は推測で創作せず、未確定の箇所は「（教科書○ページ／要確認）」と明示すること。`,
    `8. 数学的活動と「主体的・対話的で深い学び」が本時のどこで実現するかを一言添えること。`,
    ``,
    `【出力形式】 見出し付きの指導案本文（単元名／単元の目標／単元について／本時の位置／本時の目標／本時で扱う問題／評価規準／本時の展開（表）／つまずきと手立て／板書計画）。`,
    ``,
    `【素材】`,
    materials,
  ].join("\n");
}

// =====================================================================
// Word出力（HTML→.doc 方式：マクロ不要・ライブラリ不要）
//   A4縦・余白・明朝・表組みを保持したWord互換HTMLを生成しダウンロード
// =====================================================================
function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildWordHtml(form, mainAuto) {
  const topicWord = (form.topic && form.topic.trim()) || form.unit;
  const fb = (s) => (s || "").replace(/〇〇/g, topicWord);
  const ev = (k, c) => fb(form[k] === "自由入力" ? form[c] : form[k]);
  const unitGoal = fb(form.unitGoal === "自由入力" ? form.unitGoalCustom : form.unitGoal);
  const goal = fb(form.goalText === "自由入力" ? form.goalCustom : form.goalText);
  const cols = ITEM_TYPES.filter(it => form.columns.includes(it.id));
  const probs = [...form.problems, ...(form.problemsCustom ? [form.problemsCustom] : [])];
  const mis = [...form.mistakes, ...(form.mistakesCustom ? [form.mistakesCustom] : [])];
  const views = [
    form.useUnitView && { label: "単元観（教材観）", items: [...form.unitView, ...(form.unitViewCustom ? [form.unitViewCustom] : [])] },
    form.useStudentView && { label: "生徒観", items: [...form.studentView, ...(form.studentViewCustom ? [form.studentViewCustom] : [])] },
    form.useTeachingView && { label: "指導観", items: [...form.teachingView, ...(form.teachingViewCustom ? [form.teachingViewCustom] : [])] },
  ].filter(v => v && v.items.length > 0);

  let n = 0;
  const parts = [];

  // タイトル
  parts.push(`<p class=title>第${esc(form.grade)}　数学科　学習指導案</p>`);

  // メタ情報（右寄せ）
  const meta = [
    ["日　　時", form.date], ["場　　所", form.classroom], ["学　　級", form.studentCount],
    ["学　　校", form.school], ["授 業 者", form.teacher],
  ].filter(([, v]) => v);
  if (meta.length) {
    parts.push(`<table class=meta align=right>${meta.map(([k, v]) => `<tr><td class=metak>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</table><div style='clear:both'></div>`);
  }

  parts.push(`<p class=h>${++n}　単元名</p><p class=b>${esc(form.unit)}　（${esc(UNIT_DOMAIN[form.unit] || "")}）</p>`);
  if (unitGoal) parts.push(`<p class=h>${++n}　単元の目標</p><p class=b>${esc(unitGoal)}</p>`);

  if (views.length) {
    parts.push(`<p class=h>${++n}　単元について</p>`);
    views.forEach((v, i) => {
      parts.push(`<p class=sub>(${i + 1}) ${esc(v.label)}</p><p class=bi>${esc(joinProse(v.items))}</p>`);
    });
  }

  parts.push(`<p class=h>${++n}　本時の位置</p><p class=b>全${esc(form.totalLessons)}時間扱い　本時は第${esc(form.lessonNum)}時（${esc(form.duration)}分）</p>`);
  parts.push(`<p class=h>${++n}　本時の目標</p><p class=b>・${esc(goal || "")}</p>`);

  if (probs.length) parts.push(`<p class=h>${++n}　本時で扱う問題・例題</p>` + probs.map(p => `<p class=b>・${esc(p)}</p>`).join(""));

  // 評価規準
  parts.push(`<p class=h>${++n}　本時の評価規準</p>`);
  parts.push(`<table class=grid width="100%"><tr>` +
    `<th width="33%">知識・技能</th><th width="33%">思考・判断・表現</th><th width="34%">主体的に学習に取り組む態度</th></tr>` +
    `<tr><td>${esc(ev("eval1", "eval1Custom") || "―")}</td><td>${esc(ev("eval2", "eval2Custom") || "―")}</td><td>${esc(ev("eval3", "eval3Custom") || "―")}</td></tr></table>`);

  if (form.materials) parts.push(`<p class=h>${++n}　準備物</p><p class=b>${esc(form.materials)}${form.useICT ? "　／　ICT活用（タブレット・電子黒板等）" : ""}</p>`);

  // 本時の展開
  parts.push(`<p class=h>${++n}　本時の展開</p>`);
  if (cols.length === 0) {
    parts.push(`<p class=b>（表示する項目が選択されていません）</p>`);
  } else {
    const head = `<th width="48">段階</th>` + cols.map(c => `<th>${esc(c.label)}</th>`).join("");
    const rows = [["導入", form.introMin], ["展開", mainAuto], ["まとめ", form.closingMin]].map(([p, m]) => {
      const cells = cols.map(c => {
        const sel = form.cells[p]?.[c.id] || [];
        return `<td>${sel.length ? sel.map(x => `・${esc(x)}`).join("<br>") : "―"}</td>`;
      }).join("");
      return `<tr><td class=phase>${esc(p)}<br>（${esc(m)}分）</td>${cells}</tr>`;
    }).join("");
    parts.push(`<table class=grid width="100%"><tr>${head}</tr>${rows}</table>`);
  }

  if (mis.length) parts.push(`<p class=h>${++n}　予想されるつまずき・誤答と手立て</p>` + mis.map(m => `<p class=b>・${esc(m)}</p>`).join(""));

  if (form.boardPlan) parts.push(`<p class=h>${++n}　板書計画</p><p class=board>${esc(form.boardPlan).replace(/\n/g, "<br>")}</p>`);

  const styles = `
    @page { size: A4 portrait; margin: 20mm 18mm; }
    body { font-family: "Yu Mincho","MS Mincho",serif; font-size: 10.5pt; line-height: 1.9; color:#000; }
    p { margin: 0 0 6pt; }
    .title { text-align:center; font-size:15pt; font-weight:bold; letter-spacing:2pt; margin-bottom:10pt; }
    .h { font-weight:bold; font-size:11pt; margin-top:8pt; border-bottom:1px solid #000; }
    .b { margin-left:1em; }
    .bi { margin-left:1.5em; text-indent:1em; }
    .sub { font-weight:bold; margin-left:1em; }
    .board { margin-left:1em; border:1px solid #888; padding:6pt; }
    table.meta { font-size:10pt; margin-bottom:8pt; }
    table.meta td { padding:0 8pt 0 0; border:none; }
    .metak { color:#333; white-space:nowrap; }
    table.grid { border-collapse:collapse; margin:4pt 0 10pt; }
    table.grid th, table.grid td { border:1px solid #000; padding:4pt 6pt; vertical-align:top; font-size:10pt; }
    table.grid th { background:#eee; text-align:center; font-weight:bold; }
    td.phase { text-align:center; font-weight:bold; background:#f6f6f6; }
  `;
  return `﻿<!DOCTYPE html><html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>` +
    `<head><meta charset="utf-8"><title>学習指導案</title><style>${styles}</style></head><body>${parts.join("\n")}</body></html>`;
}

function downloadDoc(form, mainAuto) {
  const html = buildWordHtml(form, mainAuto);
  const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const fname = `指導案_中${(form.grade || "").replace("年", "")}_${(form.unit || "数学").replace(/[\\/:*?"<>|（）()]/g, "")}.doc`;
  const a = document.createElement("a");
  a.href = url; a.download = fname;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
}

// =====================================================================
// 小コンポーネント
// =====================================================================
function InfoBlock({ label, value }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={S.docH}>{label}</div>
      <div style={{ paddingLeft: 16, lineHeight: 1.9 }}>{value}</div>
    </div>
  );
}
// 選んだ文を、文末を整えて1つの文章につなげる
function joinProse(items) {
  return items
    .map(s => (s || "").trim())
    .filter(Boolean)
    .map(s => (/[。．.！？]$/.test(s) ? s : s + "。"))
    .join("");
}

function HRule() { return <div style={{ borderTop: "2px solid #333", marginBottom: 14 }} />; }

function Card({ title, children }) {
  return (
    <div style={S.card}>
      <div style={S.cardTitle}>{title}</div>
      {children}
    </div>
  );
}
function Row({ label, children }) {
  return (
    <div style={{ display: "flex", gap: 16, marginBottom: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ ...S.rowLabel, paddingTop: 6 }}>{label}</div>
      <div style={{ flex: 1, minWidth: 200, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>{children}</div>
    </div>
  );
}
function SectionTitle({ children }) { return <div style={S.sectionTitle}>{children}</div>; }
function Hint({ children }) { return <div style={S.hint}>💡 {children}</div>; }

function ToggleGroup({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)} style={{
          ...S.toggle,
          border: value === o ? "1px solid #3d7ab5" : "1px solid #2a3a4a",
          background: value === o ? "rgba(61,122,181,0.3)" : "rgba(255,255,255,0.04)",
          color: value === o ? "#9fd0ec" : "#8aa",
        }}>{o}</button>
      ))}
    </div>
  );
}
function Select({ options, value, onChange, small }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ ...S.select, minWidth: small ? 64 : 220 }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
function TextInput({ value, onChange, placeholder }) {
  return <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={S.input} />;
}

function RadioList({ items, value, onChange, customValue, onCustomChange, radioName = "radio", emptyNote }) {
  const isCustom = value === "自由入力";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      {items.map((g, i) => (
        <label key={i} style={S.radioRow}>
          <input type="radio" name={radioName} checked={value === g} onChange={() => onChange(g)} style={{ marginTop: 3 }} />
          <span style={{ fontSize: 13, lineHeight: 1.6, color: value === g ? "#9fd0ec" : "#ccd6dd" }}>{g}</span>
        </label>
      ))}
      <label style={S.radioRow}>
        <input type="radio" name={radioName} checked={isCustom} onChange={() => onChange("自由入力")} style={{ marginTop: 3 }} />
        <span style={{ fontSize: 13, color: "#ccd6dd" }}>自由入力</span>
      </label>
      {isCustom && (
        <textarea value={customValue || ""} onChange={e => onCustomChange(e.target.value)}
          placeholder="文章を入力してください" style={{ ...S.textarea, marginTop: 4 }} rows={2} />
      )}
      {items.length === 0 && emptyNote && <div style={{ fontSize: 12, color: "#e0a458" }}>{emptyNote}</div>}
    </div>
  );
}

function ViewSection({ title, color, desc, templates, selected, onToggle, enabled, onToggleEnabled, custom, onCustom }) {
  return (
    <div style={{ marginBottom: 16, border: `1px solid ${enabled ? color + "55" : "rgba(255,255,255,0.08)"}`, borderRadius: 10, padding: enabled ? 14 : "10px 14px", background: enabled ? `${color}0d` : "transparent", transition: "all 0.15s" }}>
      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <input type="checkbox" checked={enabled} onChange={onToggleEnabled} style={{ width: 16, height: 16, accentColor: color }} />
        <div style={{ width: 4, height: 18, background: enabled ? color : "#445", borderRadius: 2 }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: enabled ? color : "#8aa" }}>{title}</span>
        <span style={{ fontSize: 11, color: "#67737d" }}>を記載する</span>
      </label>

      {enabled && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, color: "#7a8a96", marginBottom: 8, paddingLeft: 2 }}>{desc}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {templates.map(t => {
              const on = selected.includes(t);
              return (
                <label key={t} onClick={() => onToggle(t)} style={{
                  ...S.checkChip,
                  border: on ? `1px solid ${color}` : "1px solid #2a3a4a",
                  background: on ? `${color}1f` : "rgba(255,255,255,0.03)",
                }}>
                  <span style={{ color: on ? color : "#556", fontWeight: 700 }}>{on ? "✓" : "＋"}</span>
                  <span style={{ fontSize: 12.5, lineHeight: 1.6, color: on ? "#dfe8ee" : "#9aa" }}>{t}</span>
                </label>
              );
            })}
          </div>
          <textarea value={custom} onChange={e => onCustom(e.target.value)} placeholder="（任意）自由記述で補足・具体化"
            style={{ ...S.textarea, minHeight: 50, marginTop: 8 }} />
        </div>
      )}
    </div>
  );
}

function TimeSlider({ label, value, onChange, min, max, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 11, color, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color, marginBottom: 4 }}>{value}分</div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(parseInt(e.target.value))} style={{ width: 100, accentColor: color }} />
    </div>
  );
}

// バンク選択（複数選択チェック＋自由記述）
function BankPicker({ options, selected, onToggle, color, custom, onCustom, emptyNote }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {options.length === 0 && <div style={{ fontSize: 12, color: "#e0a458" }}>{emptyNote}</div>}
      {options.map(o => {
        const on = selected.includes(o);
        return (
          <label key={o} onClick={() => onToggle(o)} style={{
            ...S.checkChip,
            border: on ? `1px solid ${color}` : "1px solid #2a3a4a",
            background: on ? `${color}1f` : "rgba(255,255,255,0.03)",
          }}>
            <span style={{ color: on ? color : "#556", fontWeight: 700 }}>{on ? "✓" : "＋"}</span>
            <span style={{ fontSize: 12.5, lineHeight: 1.6, color: on ? "#dfe8ee" : "#9aa" }}>{o}</span>
          </label>
        );
      })}
      <textarea value={custom} onChange={e => onCustom(e.target.value)} placeholder="（任意）自由記述で追記"
        style={{ ...S.textarea, minHeight: 46, marginTop: 4 }} />
    </div>
  );
}

// 順序つき・重複可・ドラッグ＆ドロップ対応の組み立てパネル
function SeqBuilder({ phase, item, options, seq, onAdd, onInsert, onRemove, onMove }) {
  const color = item.color;
  const readPayload = (e) => { try { return JSON.parse(e.dataTransfer.getData("text/plain")); } catch { return null; } };
  const setPayload = (e, data) => { e.dataTransfer.setData("text/plain", JSON.stringify(data)); e.dataTransfer.effectAllowed = "copyMove"; };

  // ゾーン末尾へドロップ
  const onDropZone = (e) => {
    e.preventDefault();
    const p = readPayload(e); if (!p) return;
    if (p.kind === "palette") onAdd(p.val);
    else if (p.kind === "seq") onMove(p.from, seq.length - 1);
  };
  // 既存項目の前へドロップ
  const onDropItem = (e, idx) => {
    e.preventDefault(); e.stopPropagation();
    const p = readPayload(e); if (!p) return;
    if (p.kind === "palette") onInsert(idx, p.val);
    else if (p.kind === "seq") { const to = p.from < idx ? idx - 1 : idx; onMove(p.from, to); }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11.5, color, marginBottom: 6, fontWeight: 600 }}>{item.label}</div>
      <div style={{ display: "flex", gap: 10, alignItems: "stretch", flexWrap: "wrap" }}>
        {/* 左：組み込み済み（順番） */}
        <div style={{ flex: "1 1 240px", minWidth: 220 }}>
          <div style={{ fontSize: 10, color: "#7a8a96", marginBottom: 4 }}>組み込み済み（上から順に表示）</div>
          <div onDragOver={e => e.preventDefault()} onDrop={onDropZone}
            style={{ minHeight: 54, border: `1px dashed ${color}66`, borderRadius: 8, padding: 6, background: "rgba(255,255,255,0.02)", display: "flex", flexDirection: "column", gap: 4 }}>
            {seq.length === 0 && <div style={{ fontSize: 11, color: "#556", padding: "8px 4px" }}>ここへドラッグ、または右の項目をクリック</div>}
            {seq.map((s, i) => (
              <div key={i} draggable onDragStart={e => setPayload(e, { kind: "seq", from: i })} onDragOver={e => e.preventDefault()} onDrop={e => onDropItem(e, i)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: `${color}1c`, border: `1px solid ${color}55`, borderRadius: 6, padding: "5px 8px", cursor: "grab" }}>
                <span style={{ fontSize: 10, color, fontWeight: 700, minWidth: 16 }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: 12, color: "#dfe8ee", lineHeight: 1.5 }}>{s}</span>
                <button onClick={() => onMove(i, i - 1)} title="上へ" style={S.seqBtn}>↑</button>
                <button onClick={() => onMove(i, i + 1)} title="下へ" style={S.seqBtn}>↓</button>
                <button onClick={() => onRemove(i)} title="削除" style={{ ...S.seqBtn, color: "#e07a7a" }}>✕</button>
              </div>
            ))}
          </div>
        </div>
        {/* 右：選択肢リスト（パレット） */}
        <div style={{ flex: "1 1 240px", minWidth: 220 }}>
          <div style={{ fontSize: 10, color: "#7a8a96", marginBottom: 4 }}>選択肢リスト（クリックで追加）</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {options.map(o => (
              <div key={o} draggable onDragStart={e => setPayload(e, { kind: "palette", val: o })} onClick={() => onAdd(o)}
                style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #2a3a4a", borderRadius: 6, padding: "5px 8px", cursor: "pointer", background: "rgba(255,255,255,0.03)" }}>
                <span style={{ color, fontWeight: 700 }}>＋</span>
                <span style={{ flex: 1, fontSize: 12, color: "#9aa", lineHeight: 1.5 }}>{o}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EvalSection({ label, color, templates, value, customValue, onChange, onCustomChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {templates.map((t, i) => (
          <label key={i} style={S.radioRow}>
            <input type="radio" name={label} checked={value === t} onChange={() => onChange(t)} style={{ marginTop: 3 }} />
            <span style={{ fontSize: 12.5, lineHeight: 1.6, color: value === t ? color : "#aab" }}>{t}</span>
          </label>
        ))}
        {value === "自由入力" && (
          <textarea value={customValue} onChange={e => onCustomChange(e.target.value)} placeholder="評価規準を入力してください" style={{ ...S.textarea, marginTop: 4 }} rows={2} />
        )}
      </div>
    </div>
  );
}

function Divider() { return <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "20px 0" }} />; }
function NextBtn({ onClick, label }) {
  return <button onClick={onClick} style={{ ...S.btn, background: "linear-gradient(135deg, #2d5a8e, #3d7ab5)", marginTop: 24, width: "100%" }}>{label || "次へ →"}</button>;
}
function BackBtn({ onClick }) {
  return <button onClick={onClick} style={{ ...S.btn, background: "rgba(255,255,255,0.05)", border: "1px solid #2a3a4a", color: "#8aa" }}>← 戻る</button>;
}

// =====================================================================
// スタイル
// =====================================================================
const S = {
  app: { minHeight: "100vh", background: "linear-gradient(135deg, #0f1923 0%, #1a2a3a 50%, #0f1923 100%)", fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif", color: "#e8edf2" },
  header: { background: "linear-gradient(90deg, #1e3a5f 0%, #2d5a8e 100%)", borderBottom: "2px solid #3d7ab5", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
  headerKicker: { fontSize: 11, color: "#7ab3d4", letterSpacing: 3, textTransform: "uppercase", marginBottom: 2 },
  headerTitle: { fontSize: 20, fontWeight: 700, color: "#e8f4fd" },
  versionBadge: { background: "rgba(46,204,113,0.15)", border: "1px solid rgba(46,204,113,0.4)", borderRadius: 6, padding: "4px 12px", fontSize: 11, color: "#2ecc71", fontWeight: 600 },
  stepBar: { padding: "20px 24px 0", display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap", justifyContent: "center" },
  stepDot: { width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, marginRight: 6 },
  stepLabel: { fontSize: 11, whiteSpace: "nowrap" },
  stepLine: { width: 20, height: 1, margin: "0 6px" },
  container: { padding: "20px 24px", maxWidth: 880, margin: "0 auto" },
  card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 24, marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#e8f4fd", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.08)" },
  rowLabel: { width: 100, fontSize: 12, color: "#8aabb8", flexShrink: 0 },
  inlineText: { fontSize: 13, color: "#aab" },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: "#7ab3d4", marginBottom: 10 },
  hint: { fontSize: 12, color: "#9fb4c0", background: "rgba(61,122,181,0.1)", border: "1px solid rgba(61,122,181,0.25)", borderRadius: 8, padding: "10px 12px", marginBottom: 18, lineHeight: 1.7 },
  tag: { fontSize: 10, color: "#7ab3d4", background: "rgba(61,122,181,0.2)", border: "1px solid rgba(61,122,181,0.35)", borderRadius: 4, padding: "2px 8px" },
  toggle: { padding: "5px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer", transition: "all 0.15s" },
  select: { background: "#1a2a3a", border: "1px solid #2d4a6a", borderRadius: 6, color: "#e8edf2", padding: "6px 10px", fontSize: 13, cursor: "pointer" },
  input: { background: "#1a2a3a", border: "1px solid #2d4a6a", borderRadius: 6, color: "#e8edf2", padding: "6px 12px", fontSize: 13, width: "100%", boxSizing: "border-box" },
  radioRow: { display: "flex", gap: 8, cursor: "pointer", alignItems: "flex-start" },
  checkChip: { display: "flex", gap: 8, alignItems: "flex-start", cursor: "pointer", borderRadius: 8, padding: "8px 12px", transition: "all 0.15s" },
  chip: { padding: "5px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer", transition: "all 0.15s" },
  seqBtn: { background: "rgba(255,255,255,0.06)", border: "1px solid #2a3a4a", borderRadius: 4, color: "#9aa", cursor: "pointer", fontSize: 11, width: 22, height: 22, lineHeight: 1, padding: 0 },
  checkLabel: { display: "flex", gap: 8, alignItems: "center", cursor: "pointer" },
  timeBox: { background: "rgba(61,122,181,0.1)", borderRadius: 10, padding: 16, marginBottom: 24, border: "1px solid rgba(61,122,181,0.3)" },
  timeBoxTitle: { fontSize: 13, fontWeight: 600, color: "#7ab3d4", marginBottom: 12 },
  mainTimeBox: { background: "rgba(46,204,113,0.15)", border: "1px solid rgba(46,204,113,0.4)", borderRadius: 8, padding: "8px 20px", textAlign: "center" },
  plus: { fontSize: 20, color: "#445" },
  warn: { marginTop: 10, fontSize: 12, color: "#e74c3c" },
  btn: { padding: "12px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", color: "#fff", transition: "all 0.2s" },
  textarea: { width: "100%", boxSizing: "border-box", background: "#1a2a3a", border: "1px solid #2d4a6a", borderRadius: 6, color: "#e8edf2", padding: "8px 12px", fontSize: 13, lineHeight: 1.6, resize: "vertical", fontFamily: "inherit" },
  // プレビュー（白紙）
  doc: { background: "#fff", color: "#111", borderRadius: 8, padding: "32px 36px", fontSize: 11, lineHeight: 1.9, fontFamily: "'Noto Serif JP', 'Yu Mincho', 'MS Mincho', serif" },
  docH: { fontWeight: 700, fontSize: 12.5, marginBottom: 6 },
  metaK: { paddingRight: 16, color: "#555", whiteSpace: "nowrap" },
};
