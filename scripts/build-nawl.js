#!/usr/bin/env node
// NAWL v1.0 builder — fetches English definitions from Free Dictionary API
// Credit: Browne, C., Culligan, B. & Phillips, J. (2013). New Academic Word List v1.0. CC BY-SA 4.0.
// http://www.newgeneralservicelist.org/nawl-new-academic-word-list

const fs   = require('fs');
const path = require('path');
const https = require('https');

// 963 NAWL headwords (sorted alphabetically)
const WORDS = ["abdominal","absorb","absorption","accelerate","acceleration","accent","accumulate","accumulation","accuracy","accurately","acid","acidic","activate","actively","acute","adaptation","adaptive","adjacent","admission","adolescent","adverse","aerosol","aesthetic","affirm","afterward","aggregate","agriculture","airplane","algebra","algorithm","alien","alliance","allocate","allocation","altitude","aluminum","amino","amongst","amplitude","analogy","ancestor","anthropology","anti","antibiotic","antibody","antiquity","appendix","applause","apple","approximate","approximation","arbitrary","archaeology","architect","array","arrow","articulate","artifact","artificial","artistic","artwork","aspect","assembly","assert","assignment","athletic","atom","atomic","auction","audio","audit","authority","autonomy","availability","axiom","axis","backward","bacteria","bacterial","bang","bargain","barrel","basin","bat","beam","behavioral","bilingual","binary","biodiversity","biologist","biology","bizarre","blank","bleed","bodily","bonus","bound","bracket","breakdown","broadly","bubble","bucket","bulk","bullet","bundle","calcium","calculation","calculator","calculus","campus","candidate","capillary","capitalism","capitalist","carrier","cattle","censor","characterization","cheat","cheer","chemistry","chemotherapy","chess","chloride","chromosome","chronic","chunk","cinema","circa","circulate","circulation","civilization","clarify","classification","classify","classroom","clay","clever","click","client","clinic","clip","clone","closure","clue","coefficient","cognitive","coherent","collective","colonial","colony","comma","commentary","commodity","commonly","communicative","communist","compact","comparable","comparative","compensate","competence","competent","complement","complication","comply","composer","composite","comprehension","computation","conceive","conception","conceptual","conditional","conduction","cone","conference","configuration","confine","confound","congruent","connector","connotation","conscious","consciousness","consensus","consent","conservation","conserve","consonant","constitution","constrain","consultation","consumption","container","continent","continuity","contour","contradict","contradiction","contradictory","contrary","controversy","converge","convergence","coordinate","coordination","cord","coronary","corpus","correction","correctly","correlate","correlation","correspondence","corruption","cortex","credibility","criteria","critically","critique","crude","crystal","cue","cure","curriculum","cyclic","cylinder","damp","deadline","decay","deceive","defect","deficiency","definite","deflection","degrade","deliberately","delta","demonstrator","denominator","denote","dense","dependence","depict","derivative","descendent","descriptor","destination","detection","developmental","deviation","diagnose","diagnosis","diagnostic","diagram","dialect","diameter","diary","dictate","dictionary","differential","differentiate","differentiation","diffusion","dilemma","dilute","dimensional","dioxide","directive","disability","disadvantage","discharge","discourse","discrete","discrimination","displacement","dissection","dissertation","dissolve","distribution","disturbance","diverse","domain","dominance","dominant","domination","donor","dose","drain","drift","duration","dye","dynamic","ecological","ecology","economically","economist","effectiveness","elaborate","elastic","elasticity","electron","elementary","elevate","elevation","elimination","elite","embed","emergence","emission","emit","emperor","empirical","encode","enforcement","enormously","entity","entrant","enzyme","epidemic","epidemiology","equality","equilibrium","equivalence","erase","essence","essentially","estimation","ethical","ethics","evident","evolutionary","ex","execute","execution","exit","expertise","explicit","explicitly","exploit","exponential","fabric","facet","facilitate","factorial","faculty","fatigue","feedback","fertility","fetal","fever","fiber","fin","finite","flesh","flexibility","flip","fluid","flux","footnote","formally","formulation","forum","fossil","founds","fraction","fracture","freely","friction","fringe","fundamentally","fungus","fusion","gauge","generalization","generalize","genetically","genetics","ghost","globalization","goat","goodness","goods","gradient","gram","grammatical","graph","grasp","gravity","grid","gross","gut","habitat","halfway","handout","harvest","hawk","headquarter","hedge","helix","hepatitis","herbicide","hierarchy","hip","historically","homework","horizon","horizontal","hormone","hydrogen","identical","identification","ideology","illusion","immune","impact","implicit","importantly","impulse","incidence","incline","inclusion","incredible","incredibly","incumbent","independently","indicator","indifference","indigenous","indirect","individually","induce","induction","industrialization","industrialize","inequality","inevitably","infect","infectious","inference","inferior","infinite","infinity","influential","informal","inhibit","inhibition","initiate","initiation","inject","injection","innate","insect","insert","instability","instinct","integral","integration","intensity","intensive","interact","interestingly","interface","interfere","intermediate","interrupt","interval","intervene","interviewer","invade","invasion","inversion","invert","ion","irrelevant","irrigation","jazz","junior","justification","kidney","kilometer","lab","lateral","layout","leaf","lecturer","legend","legitimate","leisure","lever","lexical","liable","lifestyle","lifetime","likelihood","likewise","limb","linear","linguistic","linguistics","liter","liver","locally","locus","logical","longitudinal","loop","lump","lung","machinery","magnetic","magnitude","mall","manipulate","manipulation","manual","manuscript","marble","marginal","marker","marrow","maternal","mathematical","matrix","maximize","meaningful","mechanic","mechanical","media","mediate","membrane","memorize","mentor","mercury","merge","messenger","metabolism","metaphor","methodology","micro","mid","migrate","migration","millimeter","mineral","minimal","minimize","minus","missile","mobility","modification","mole","molecular","molecule","momentum","monetary","monkey","monopoly","morality","morphological","morphology","mortality","motif","motive","multi","multinational","multiply","mutation","myth","naked","namely","nasty","nationalism","neat","necessity","neo","nest","neural","neuron","neutral","nicely","niche","nitrogen","noble","node","noisy","nominal","non","nonetheless","nonlinear","norm","notation","novice","nucleus","null","numerical","nutrient","objection","obscure","observer","obtain","occupation","occurrence","offspring","onset","onwards","optical","optimal","optimum","oral","organ","organism","orient","orientation","oscillation","outer","outlet","overhead","overlap","overview","oxidize","oxygen","painful","par","paradigm","paradox","parameter","parcel","pardon","parental","parenthesis","partial","partially","particle","partition","pathway","peasant","periodic","peripheral","pest","pesticide","phenomenal","philosopher","philosophical","phonological","phosphate","photographic","physically","physician","physics","physiological","pi","planner","plantation","plausible","plug","plural","polar","pole","politically","portfolio","portray","portrayal","positively","poster","postgraduate","potassium","powder","practitioner","pragmatic","pre","precede","precipitate","precipitation","predator","prediction","predominantly","prejudice","preliminary","presume","prevalence","prey","primer","primitive","probe","problematic","processor","productive","productivity","profound","progression","progressive","projection","prominent","pronounce","proposition","protocol","proton","psychiatric","psychologist","psychology","publish","pulse","punch","punish","punishment","purely","puzzle","qualitative","quantitative","quantum","questionnaire","quiz","quotation","rack","radar","radiation","radius","rainfall","randomize","randomly","rational","rationality","ray","reactive","reactor","readily","realism","realistic","realm","receptor","recipe","reconstruct","regime","regression","rehabilitation","reinforce","rejection","reliability","render","repertoire","replacement","replicate","replication","reproduce","reproduction","republic","resemble","reservoir","residual","residue","resistant","respiratory","retrieve","revolutionary","rewrite","rhetoric","rhythm","ridiculous","ritual","robot","rope","rotate","rotation","rub","ruler","scatter","scenario","scholarship","scripture","scroll","secrete","sediment","selective","semantic","semester","semi","seminar","sensation","sensible","sensitivity","sensory","separately","separation","sexuality","shallow","shortly","shuttle","similarity","simplify","simulate","simulation","simultaneously","sin","singular","sketch","skip","slab","slash","slavery","slot","snake","sneeze","sniff","socialize","socially","sodium","solar","soluble","solute","solvent","sometime","sophisticate","span","spatial","specialty","specification","specimen","spectrum","sperm","sphere","splice","sponsorship","spontaneous","spray","stabilize","stack","stadium","stance","standardize","static","statistical","statistically","statistics","stereotype","stimulus","straightforward","strand","strategic","strictly","stripe","sub","subjective","subset","substitution","substrate","subtle","subtract","sufficiently","suicide","super","superior","supposedly","surgeon","surgical","surplus","susceptible","sustainable","swap","swell","sword","syllable","syllabus","symbolic","syndrome","syntactic","syntax","synthesis","synthetic","systematic","tech","technically","temporal","tempt","tense","terminal","terminology","terribly","textbook","theorem","theorist","thereby","thermal","thesis","thickness","thread","threshold","thumb","tolerance","ton","toxic","tract","traditionally","trait","trajectory","trans","transaction","transcribe","transcription","transformation","translation","transmission","transmit","transparency","transplant","trauma","treaty","tremendous","triangle","tribe","tricky","trivial","tropical","tumor","turbulent","tutor","ultimate","undergraduate","undermine","underneath","unemployed","unify","unintelligible","unity","unstable","uplift","upward","urine","usage","utility","utilize","utterance","vague","valid","validity","valve","variability","variance","variant","vector","vegetation","vein","velocity","verbal","vertical","viable","virtue","vitamin","vocabulary","volition","vowel","watershed","wavelength","weave","wheat","whereby","whichever","whoever","widespread","wisdom","workshop","yeast"];

// Japanese translations for academic vocabulary
const JP = {
  "abdominal":"腹部の","absorb":"吸収する","absorption":"吸収","accelerate":"加速する",
  "acceleration":"加速","accent":"アクセント","accumulate":"蓄積する","accumulation":"蓄積",
  "accuracy":"正確さ","accurately":"正確に","acid":"酸","acidic":"酸性の",
  "activate":"活性化する","actively":"積極的に","acute":"急性の","adaptation":"適応",
  "adaptive":"適応的な","adjacent":"隣接した","admission":"入学","adolescent":"青年",
  "adverse":"不利な","aerosol":"エアロゾル","aesthetic":"美的な","affirm":"断言する",
  "afterward":"その後","aggregate":"集合体","agriculture":"農業","algebra":"代数",
  "algorithm":"アルゴリズム","alien":"外来の","alliance":"同盟","allocate":"割り当てる",
  "allocation":"割り当て","altitude":"高度","aluminum":"アルミニウム","amino":"アミノ",
  "amongst":"〜の中で","amplitude":"振幅","analogy":"類推","ancestor":"祖先",
  "anthropology":"人類学","anti":"反〜","antibiotic":"抗生物質","antibody":"抗体",
  "antiquity":"古代","appendix":"付録","applause":"拍手","approximate":"おおよその",
  "approximation":"近似","arbitrary":"恣意的な","archaeology":"考古学","architect":"建築家",
  "array":"配列","arrow":"矢印","articulate":"明確に述べる","artifact":"人工物",
  "artificial":"人工の","artistic":"芸術的な","artwork":"芸術作品","aspect":"側面",
  "assembly":"集会","assert":"主張する","assignment":"課題","athletic":"運動の",
  "atom":"原子","atomic":"原子の","auction":"競売","audio":"音声の","audit":"監査",
  "authority":"権限","autonomy":"自律性","availability":"利用可能性","axiom":"公理",
  "axis":"軸","backward":"後ろ向きの","bacteria":"細菌","bacterial":"細菌の",
  "bang":"衝突する","bargain":"交渉する","barrel":"バレル","basin":"盆地","bat":"コウモリ",
  "beam":"光線","behavioral":"行動の","bilingual":"二言語の","binary":"二進の",
  "biodiversity":"生物多様性","biologist":"生物学者","biology":"生物学","bizarre":"奇妙な",
  "blank":"空白","bleed":"出血する","bodily":"身体の","bonus":"ボーナス","bound":"限界",
  "bracket":"括弧","breakdown":"崩壊","broadly":"広く","bubble":"泡","bucket":"バケツ",
  "bulk":"大量","bullet":"弾丸","bundle":"束","calcium":"カルシウム","calculation":"計算",
  "calculator":"計算機","calculus":"微積分","campus":"キャンパス","candidate":"候補者",
  "capillary":"毛細管","capitalism":"資本主義","capitalist":"資本主義者","carrier":"担体",
  "cattle":"牛","censor":"検閲する","characterization":"特性化","cheat":"不正行為",
  "cheer":"歓声","chemistry":"化学","chemotherapy":"化学療法","chess":"チェス",
  "chloride":"塩化物","chromosome":"染色体","chronic":"慢性の","chunk":"かたまり",
  "cinema":"映画館","circa":"〜年頃","circulate":"循環する","circulation":"循環",
  "civilization":"文明","clarify":"明確にする","classification":"分類","classify":"分類する",
  "clay":"粘土","clever":"賢い","click":"クリックする","client":"顧客","clinic":"診療所",
  "clip":"クリップ","clone":"クローン","closure":"閉鎖","clue":"手がかり",
  "coefficient":"係数","cognitive":"認知の","coherent":"一貫した","collective":"集合的な",
  "colonial":"植民地の","colony":"植民地","comma":"コンマ","commentary":"解説",
  "commodity":"商品","commonly":"一般的に","communicative":"伝達の","communist":"共産主義の",
  "compact":"コンパクトな","comparable":"比較できる","comparative":"比較の",
  "compensate":"補償する","competence":"能力","competent":"有能な","complement":"補完する",
  "complication":"複雑化","comply":"従う","composer":"作曲家","composite":"複合の",
  "comprehension":"理解","computation":"計算","conceive":"思い描く","conception":"概念",
  "conceptual":"概念的な","conditional":"条件付きの","conduction":"伝導","cone":"円錐",
  "conference":"会議","configuration":"配置","confine":"限定する","confound":"混同する",
  "congruent":"合同の","connector":"接続詞","connotation":"含意","conscious":"意識的な",
  "consciousness":"意識","consensus":"合意","consent":"同意","conservation":"保存",
  "conserve":"保存する","consonant":"子音","constitution":"憲法","constrain":"制限する",
  "consultation":"相談","consumption":"消費","container":"容器","continent":"大陸",
  "continuity":"継続性","contour":"輪郭","contradict":"矛盾する","contradiction":"矛盾",
  "contradictory":"矛盾した","contrary":"反対の","controversy":"論争","converge":"収束する",
  "convergence":"収束","coordinate":"調整する","coordination":"調整","cord":"紐",
  "coronary":"冠状動脈の","corpus":"コーパス","correction":"訂正","correctly":"正確に",
  "correlate":"相関する","correlation":"相関","correspondence":"対応","corruption":"腐敗",
  "cortex":"皮質","credibility":"信頼性","criteria":"基準","critically":"批判的に",
  "critique":"批評","crude":"粗い","crystal":"結晶","cue":"手がかり","cure":"治療",
  "curriculum":"カリキュラム","cyclic":"循環的な","cylinder":"円柱","damp":"湿った",
  "deadline":"締め切り","decay":"崩壊","deceive":"欺く","defect":"欠陥","deficiency":"欠乏",
  "definite":"明確な","deflection":"偏向","degrade":"劣化する","deliberately":"意図的に",
  "delta":"デルタ","demonstrator":"デモ参加者","denominator":"分母","denote":"示す",
  "dense":"密度の高い","dependence":"依存","depict":"描写する","derivative":"派生物",
  "descriptor":"記述子","destination":"目的地","detection":"検出","developmental":"発達の",
  "deviation":"偏差","diagnose":"診断する","diagnosis":"診断","diagnostic":"診断の",
  "diagram":"図","dialect":"方言","diameter":"直径","diary":"日記","dictate":"指示する",
  "dictionary":"辞書","differential":"微分の","differentiate":"区別する",
  "differentiation":"分化","diffusion":"拡散","dilemma":"ジレンマ","dilute":"希釈する",
  "dimensional":"次元の","dioxide":"二酸化物","directive":"指令","disability":"障害",
  "disadvantage":"不利","discharge":"排出","discourse":"談話","discrete":"離散的な",
  "discrimination":"差別","displacement":"変位","dissection":"解剖","dissertation":"論文",
  "dissolve":"溶解する","distribution":"分布","disturbance":"妨害","diverse":"多様な",
  "domain":"領域","dominance":"優位","dominant":"優勢な","domination":"支配",
  "donor":"提供者","dose":"用量","drain":"排水する","drift":"漂流","duration":"期間",
  "dye":"染料","dynamic":"動的な","ecological":"生態学的な","ecology":"生態学",
  "economically":"経済的に","economist":"経済学者","effectiveness":"有効性",
  "elaborate":"詳細な","elastic":"弾性の","elasticity":"弾性","electron":"電子",
  "elementary":"初歩的な","elevate":"高める","elevation":"標高","elimination":"除去",
  "elite":"エリート","embed":"埋め込む","emergence":"出現","emission":"排出","emit":"放出する",
  "emperor":"皇帝","empirical":"経験的な","encode":"符号化する","enforcement":"施行",
  "enormously":"膨大に","entity":"実体","enzyme":"酵素","epidemic":"流行病",
  "epidemiology":"疫学","equality":"平等","equilibrium":"均衡","equivalence":"同等性",
  "erase":"消去する","essence":"本質","essentially":"本質的に","estimation":"推定",
  "ethical":"倫理的な","ethics":"倫理","evident":"明らかな","evolutionary":"進化の",
  "execute":"実行する","execution":"実行","exit":"出口","expertise":"専門知識",
  "explicit":"明示的な","explicitly":"明示的に","exploit":"利用する","exponential":"指数の",
  "fabric":"構造","facet":"側面","facilitate":"促進する","factorial":"階乗",
  "faculty":"教授陣","fatigue":"疲労","feedback":"フィードバック","fertility":"生殖能力",
  "fetal":"胎児の","fever":"熱","fiber":"繊維","finite":"有限の","flesh":"肉体",
  "flexibility":"柔軟性","flip":"ひっくり返す","fluid":"流体","flux":"流量",
  "footnote":"脚注","formally":"公式に","formulation":"定式化","forum":"フォーラム",
  "fossil":"化石","fraction":"分数","fracture":"骨折","freely":"自由に","friction":"摩擦",
  "fringe":"周辺","fundamentally":"根本的に","fungus":"菌類","fusion":"融合",
  "gauge":"測定する","generalization":"一般化","generalize":"一般化する","genetically":"遺伝的に",
  "genetics":"遺伝学","ghost":"幽霊","globalization":"グローバル化","goat":"ヤギ",
  "goodness":"善良さ","goods":"商品","gradient":"勾配","gram":"グラム",
  "grammatical":"文法的な","graph":"グラフ","grasp":"把握する","gravity":"重力",
  "grid":"格子","gross":"総計の","gut":"腸","habitat":"生息地","halfway":"中間",
  "handout":"配布資料","harvest":"収穫","hawk":"タカ","headquarter":"本社",
  "hedge":"生垣","helix":"螺旋","hepatitis":"肝炎","herbicide":"除草剤",
  "hierarchy":"階層","hip":"腰","historically":"歴史的に","homework":"宿題",
  "horizon":"地平線","horizontal":"水平の","hormone":"ホルモン","hydrogen":"水素",
  "identical":"同一の","identification":"識別","ideology":"イデオロギー","illusion":"幻想",
  "immune":"免疫の","impact":"影響","implicit":"暗黙の","importantly":"重要なことに",
  "impulse":"衝動","incidence":"発生率","incline":"傾ける","inclusion":"包含",
  "incredible":"信じられない","incredibly":"信じられないほど","incumbent":"現職の",
  "independently":"独立して","indicator":"指標","indifference":"無関心",
  "indigenous":"先住民の","indirect":"間接的な","individually":"個別に","induce":"誘発する",
  "induction":"誘導","industrialization":"工業化","industrialize":"工業化する",
  "inequality":"不平等","inevitably":"必然的に","infect":"感染させる","infectious":"感染性の",
  "inference":"推論","inferior":"劣った","infinite":"無限の","infinity":"無限大",
  "influential":"影響力のある","informal":"非公式の","inhibit":"抑制する",
  "inhibition":"抑制","initiate":"開始する","initiation":"開始","inject":"注射する",
  "injection":"注射","innate":"生得的な","insect":"昆虫","insert":"挿入する",
  "instability":"不安定性","instinct":"本能","integral":"積分","integration":"統合",
  "intensity":"強度","intensive":"集中的な","interact":"相互作用する","interface":"インターフェース",
  "interfere":"干渉する","intermediate":"中間の","interrupt":"中断する","interval":"間隔",
  "intervene":"介入する","invade":"侵入する","invasion":"侵入","inversion":"逆転",
  "invert":"逆にする","ion":"イオン","irrelevant":"無関係な","irrigation":"灌漑",
  "justification":"正当化","kidney":"腎臓","kilometer":"キロメートル","lab":"実験室",
  "lateral":"側面の","layout":"レイアウト","leaf":"葉","lecturer":"講師","legend":"凡例",
  "legitimate":"正当な","leisure":"余暇","lever":"てこ","lexical":"語彙の","liable":"責任のある",
  "lifestyle":"ライフスタイル","lifetime":"生涯","likelihood":"可能性","likewise":"同様に",
  "limb":"手足","linear":"線形の","linguistic":"言語的な","linguistics":"言語学",
  "liter":"リットル","liver":"肝臓","locally":"局所的に","locus":"軌跡","logical":"論理的な",
  "longitudinal":"縦断的な","loop":"ループ","lump":"塊","lung":"肺","machinery":"機械",
  "magnetic":"磁気の","magnitude":"大きさ","mall":"商業施設","manipulate":"操作する",
  "manipulation":"操作","manual":"手動の","manuscript":"原稿","marble":"大理石",
  "marginal":"周辺の","marker":"マーカー","marrow":"骨髄","maternal":"母親の",
  "mathematical":"数学的な","matrix":"行列","maximize":"最大化する","meaningful":"意味のある",
  "mechanic":"機械工","mechanical":"機械の","media":"メディア","mediate":"仲介する",
  "membrane":"膜","memorize":"暗記する","mentor":"助言者","mercury":"水銀","merge":"合併する",
  "messenger":"使者","metabolism":"代謝","metaphor":"比喩","methodology":"方法論",
  "migrate":"移動する","migration":"移住","millimeter":"ミリメートル","mineral":"鉱物",
  "minimal":"最小限の","minimize":"最小化する","minus":"マイナス","missile":"ミサイル",
  "mobility":"移動性","modification":"修正","mole":"モル","molecular":"分子の",
  "molecule":"分子","momentum":"勢い","monetary":"通貨の","monkey":"サル","monopoly":"独占",
  "morality":"道徳性","morphology":"形態論","mortality":"死亡率","motif":"モチーフ",
  "motive":"動機","multinational":"多国籍の","multiply":"増殖する","mutation":"突然変異",
  "myth":"神話","naked":"裸の","namely":"すなわち","nasty":"不快な","nationalism":"民族主義",
  "neat":"きちんとした","necessity":"必要性","neural":"神経の","neuron":"ニューロン",
  "neutral":"中立の","niche":"ニッチ","nitrogen":"窒素","noble":"高貴な","node":"節点",
  "noisy":"騒々しい","nominal":"名目上の","norm":"規範","notation":"表記","novice":"初心者",
  "nucleus":"核","null":"ゼロの","numerical":"数値の","nutrient":"栄養素",
  "objection":"反対","obscure":"不明瞭な","observer":"観察者","obtain":"得る",
  "occupation":"職業","occurrence":"発生","offspring":"子孫","onset":"開始","optical":"光学の",
  "optimal":"最適な","optimum":"最適値","oral":"口頭の","organ":"臓器","organism":"生物",
  "orient":"向ける","orientation":"方向付け","oscillation":"振動","outer":"外側の",
  "outlet":"出口","overhead":"諸経費","overlap":"重なる","overview":"概要",
  "oxidize":"酸化する","oxygen":"酸素","painful":"痛い","paradigm":"パラダイム",
  "paradox":"逆説","parameter":"パラメータ","parcel":"小包","parental":"親の",
  "partial":"部分的な","partially":"部分的に","particle":"粒子","partition":"分割",
  "pathway":"経路","peasant":"農民","periodic":"周期的な","peripheral":"周辺の",
  "pest":"害虫","pesticide":"農薬","phenomenal":"驚異的な","philosopher":"哲学者",
  "philosophical":"哲学的な","phonological":"音韻の","phosphate":"リン酸塩",
  "physically":"物理的に","physician":"内科医","physics":"物理学","physiological":"生理学的な",
  "planner":"計画者","plantation":"農園","plausible":"もっともらしい","plug":"プラグ",
  "plural":"複数の","polar":"極性の","pole":"極","politically":"政治的に",
  "portfolio":"ポートフォリオ","portray":"描写する","portrayal":"描写","positively":"肯定的に",
  "postgraduate":"大学院の","potassium":"カリウム","powder":"粉末","practitioner":"実践者",
  "pragmatic":"実用的な","precede":"先行する","precipitate":"沈殿する","precipitation":"降水量",
  "predator":"捕食者","prediction":"予測","predominantly":"主として","prejudice":"偏見",
  "preliminary":"予備の","presume":"推定する","prevalence":"有病率","prey":"獲物",
  "primer":"入門書","primitive":"原始的な","probe":"探査する","problematic":"問題のある",
  "processor":"プロセッサ","productive":"生産的な","productivity":"生産性","profound":"深い",
  "progression":"進行","progressive":"漸進的な","projection":"投影","prominent":"著名な",
  "pronounce":"発音する","proposition":"命題","protocol":"プロトコル","proton":"陽子",
  "psychiatric":"精神医学的な","psychologist":"心理学者","psychology":"心理学",
  "publish":"出版する","pulse":"脈拍","punish":"罰する","punishment":"罰","purely":"純粋に",
  "puzzle":"謎","qualitative":"定性的な","quantitative":"定量的な","quantum":"量子",
  "questionnaire":"アンケート","quotation":"引用","radar":"レーダー","radiation":"放射線",
  "radius":"半径","rainfall":"降水量","randomize":"無作為化する","randomly":"無作為に",
  "rational":"合理的な","rationality":"合理性","ray":"光線","reactive":"反応性の",
  "reactor":"原子炉","readily":"容易に","realism":"現実主義","realistic":"現実的な",
  "realm":"領域","receptor":"受容体","recipe":"レシピ","reconstruct":"再構成する",
  "regime":"体制","regression":"回帰","rehabilitation":"リハビリ","reinforce":"強化する",
  "rejection":"拒絶","reliability":"信頼性","render":"与える","repertoire":"レパートリー",
  "replacement":"交換","replicate":"複製する","replication":"複製","reproduce":"再生する",
  "reproduction":"生殖","republic":"共和国","resemble":"似ている","reservoir":"貯水池",
  "residual":"残留","residue":"残留物","resistant":"耐性のある","respiratory":"呼吸の",
  "retrieve":"取り出す","revolutionary":"革命的な","rewrite":"書き直す","rhetoric":"修辞学",
  "rhythm":"リズム","ridiculous":"ばかげた","ritual":"儀式","robot":"ロボット","rotate":"回転する",
  "rotation":"回転","ruler":"定規","scatter":"散乱する","scenario":"シナリオ",
  "scholarship":"奨学金","sediment":"堆積物","selective":"選択的な","semantic":"意味の",
  "semester":"学期","seminar":"セミナー","sensation":"感覚","sensible":"賢明な",
  "sensitivity":"感受性","sensory":"感覚の","separately":"別々に","separation":"分離",
  "sexuality":"性的指向","shallow":"浅い","shortly":"まもなく","shuttle":"シャトル",
  "similarity":"類似性","simplify":"単純化する","simulate":"シミュレートする",
  "simulation":"シミュレーション","simultaneously":"同時に","singular":"単数の",
  "sketch":"スケッチ","slavery":"奴隷制度","slot":"スロット","solar":"太陽の",
  "soluble":"溶解性の","solute":"溶質","solvent":"溶媒","sometime":"いつか",
  "spatial":"空間的な","specialty":"専門","specification":"仕様","specimen":"標本",
  "spectrum":"スペクトル","sphere":"球","spontaneous":"自発的な","spray":"スプレー",
  "stabilize":"安定させる","stack":"積み重ねる","stadium":"スタジアム","stance":"立場",
  "standardize":"標準化する","static":"静的な","statistical":"統計的な","statistically":"統計的に",
  "statistics":"統計","stereotype":"固定観念","stimulus":"刺激","straightforward":"単純明快な",
  "strand":"鎖","strategic":"戦略的な","strictly":"厳密に","stripe":"縞","subjective":"主観的な",
  "subset":"部分集合","substitution":"置換","substrate":"基質","subtle":"微妙な",
  "subtract":"引く","sufficiently":"十分に","suicide":"自殺","superior":"優れた",
  "supposedly":"推定では","surgeon":"外科医","surgical":"外科の","surplus":"余剰",
  "susceptible":"影響されやすい","sustainable":"持続可能な","swap":"交換する","swell":"膨れる",
  "syllable":"音節","syllabus":"シラバス","symbolic":"象徴的な","syndrome":"症候群",
  "syntax":"構文","synthesis":"合成","synthetic":"合成の","systematic":"体系的な",
  "technically":"技術的に","temporal":"時間的な","tempt":"誘惑する","tense":"時制",
  "terminal":"終端","terminology":"用語","textbook":"教科書","theorem":"定理",
  "theorist":"理論家","thereby":"それによって","thermal":"熱の","thesis":"論文",
  "thickness":"厚さ","thread":"糸","threshold":"閾値","tolerance":"許容度","ton":"トン",
  "toxic":"毒性の","tract":"地帯","traditionally":"伝統的に","trait":"特性","trajectory":"軌道",
  "transaction":"取引","transcribe":"転写する","transcription":"転写","transformation":"変換",
  "translation":"翻訳","transmission":"伝達","transmit":"伝送する","transparency":"透明性",
  "transplant":"移植","trauma":"トラウマ","treaty":"条約","tremendous":"巨大な",
  "triangle":"三角形","tribe":"部族","trivial":"些細な","tropical":"熱帯の","tumor":"腫瘍",
  "turbulent":"乱流の","tutor":"家庭教師","ultimate":"究極の","undergraduate":"学部生",
  "undermine":"損なう","underneath":"下に","unemployed":"失業した","unify":"統一する",
  "unity":"統一性","unstable":"不安定な","upward":"上向きの","usage":"使用法",
  "utility":"有用性","utilize":"利用する","utterance":"発話","vague":"曖昧な","valid":"有効な",
  "validity":"妥当性","valve":"弁","variability":"変動性","variance":"分散",
  "variant":"変異体","vector":"ベクトル","vegetation":"植生","vein":"静脈","velocity":"速度",
  "verbal":"言語的な","vertical":"垂直の","viable":"実行可能な","virtue":"美徳",
  "vitamin":"ビタミン","vocabulary":"語彙","vowel":"母音","watershed":"分水嶺",
  "wavelength":"波長","weave":"織る","wheat":"小麦","whereby":"それによって",
  "widespread":"広範な","wisdom":"知恵","workshop":"ワークショップ","yeast":"酵母"
};

const PROGRESS_FILE = path.join(__dirname, '..', 'data', '.nawl-build-progress.json');
const OUTPUT_FILE   = path.join(__dirname, '..', 'data', 'toefl.json');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fetchDefinition(word) {
  return new Promise((resolve) => {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    https.get(url, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (Array.isArray(data) && data[0]?.meanings?.[0]?.definitions?.[0]?.definition) {
            resolve(data[0].meanings[0].definitions[0].definition);
          } else { resolve(null); }
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

async function main() {
  let progress = {};
  if (fs.existsSync(PROGRESS_FILE)) {
    try { progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8')); }
    catch { progress = {}; }
    console.log(`Resuming: ${Object.keys(progress).length} words already done`);
  }

  const total = WORDS.length;
  let saved = 0;

  for (let i = 0; i < total; i++) {
    const word = WORDS[i];
    if (progress[word] !== undefined) { saved++; continue; }

    process.stdout.write(`[${i+1}/${total}] ${word} ... `);
    const def = await fetchDefinition(word);
    progress[word] = def || '';
    console.log(def ? def.slice(0, 60) : '(no definition)');
    saved++;

    if (saved % 50 === 0) {
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
      console.log(`  ✓ Progress saved (${saved} done)`);
    }
    await sleep(200);
  }

  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress));

  // Level split: thirds by alphabetical index (1=beginner area, 2=mid, 3=advanced)
  const third = Math.floor(WORDS.length / 3);
  const words = WORDS.map((word, i) => ({
    id: `nawl${String(i+1).padStart(4,'0')}`,
    word,
    translation: JP[word] || '',
    definition: progress[word] || '',
    level: i < third ? 1 : i < third * 2 ? 2 : 3
  }));

  const output = {
    category: 'toefl',
    credit: 'New Academic Word List v1.0 — Browne, C., Culligan, B. & Phillips, J. (2013). CC BY-SA 4.0. http://www.newgeneralservicelist.org',
    words
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\n✅ Done! ${words.length} words written to data/toefl.json`);
  fs.unlinkSync(PROGRESS_FILE);
}

main().catch(console.error);
