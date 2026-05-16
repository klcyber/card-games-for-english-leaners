#!/usr/bin/env node
// NGSL v1.01 builder — fetches English definitions from Free Dictionary API
// Credit: Browne, C. & Culligan, B. (2013). New General Service List v1.01. CC BY-SA 4.0.
// http://www.newgeneralservicelist.org/ngsl-1

const fs   = require('fs');
const path = require('path');
const https = require('https');

// NGSL words — skip the top ~100 function words (the, be, and...) that are too basic for vocab cards
// Keeping meaningful content words from rank ~80 onward, capped at 900 for playability
const WORDS = ["people","year","work","time","thing","make","way","find","come","know","think","take","look","want","give","back","say","well","right","how","more","good","need","use","just","first","new","long","great","feel","try","tell","here","something","many","such","last","call","still","leave","lot","help","ask","start","meet","talk","put","another","become","interest","country","old","each","school","high","different","end","live","play","home","include","course","house","group","woman","around","book","family","seem","let","keep","hear","system","question","always","big","small","study","follow","begin","important","run","turn","bring","hand","state","move","money","fact","area","provide","name","read","friend","month","large","business","without","information","open","order","government","word","issue","market","pay","build","hold","service","believe","second","love","increase","job","plan","result","offer","young","close","program","lead","buy","understand","thank","today","student","face","hope","idea","cost","room","reason","form","spend","head","learn","level","person","experience","once","member","enough","bad","city","night","support","whether","line","present","side","quite","although","term","low","speak","process","public","often","possible","actually","rather","view","together","consider","price","parent","hard","party","local","control","concern","product","lose","story","continue","stand","whole","rate","care","expect","effect","sort","cause","fall","deal","water","send","allow","watch","base","suggest","past","power","test","visit","center","grow","return","mother","walk","matter","mind","value","office","record","stay","force","stop","light","develop","remember","share","real","answer","sit","figure","letter","decide","language","subject","class","development","town","half","minute","food","break","clear","future","remain","top","among","win","color","involve","reach","social","period","note","history","create","drive","type","sound","eye","music","game","free","receive","moment","sale","policy","body","require","wait","appear","team","easy","individual","full","sense","add","rule","pass","produce","sell","short","agree","law","research","cover","paper","position","near","human","computer","situation","staff","activity","film","morning","war","account","shop","major","design","event","special","condition","carry","choose","father","decision","table","forward","main","cut","describe","available","strong","rise","girl","community","particular","role","join","difficult","detail","difference","action","health","eat","step","true","phone","draw","practice","model","raise","customer","front","explain","door","outside","behind","economic","approach","teacher","land","charge","finally","sign","claim","relationship","travel","enjoy","death","amount","improve","picture","boy","organization","happy","couple","act","range","quality","project","round","opportunity","road","list","wish","wear","fund","rest","industry","education","measure","kill","serve","likely","national","teach","field","security","air","benefit","trade","risk","news","standard","vote","percent","focus","stage","space","instead","realize","usually","data","single","address","performance","chance","accept","society","technology","mention","choice","save","common","culture","total","demand","material","limit","listen","wrong","foot","effort","attention","check","complete","pick","reduce","personal","ground","animal","arrive","patient","current","century","evidence","exist","similar","fight","leader","fine","street","contact","wife","sport","prepare","discuss","response","voice","piece","finish","apply","president","fire","compare","court","police","store","poor","knowledge","laugh","arm","heart","source","employee","manage","bank","firm","cell","article","attack","foreign","surprise","feature","factor","pretty","recently","affect","drop","relate","official","financial","miss","art","campaign","private","everyone","forget","page","worry","summer","drink","opinion","park","represent","key","inside","manager","international","contain","notice","wonder","nature","structure","section","exactly","plant","worker","press","necessary","region","growth","evening","influence","respect","various","catch","skill","attempt","son","simple","average","stock","management","character","bed","hit","establish","final","economy","fit","function","image","size","behavior","addition","determine","station","population","fail","environment","production","contract","player","comment","enter","occur","alone","significant","drug","wall","series","direct","success","director","clearly","lack","review","depend","race","recognize","window","purpose","department","gain","tree","college","argue","board","holiday","mark","church","machine","achieve","item","prove","season","floor","wide","method","analysis","election","military","hotel","club","movie","doctor","discussion","sorry","challenge","nation","nearly","statement","link","despite","introduce","advantage","ready","marry","strike","seek","ability","unit","card","hospital","quickly","interview","agreement","release","tax","solution","capital","popular","specific","beautiful","fear","aim","television","serious","target","degree","pull","husband","access","movement","treat","identify","loss","modern","pressure","treatment","supply","village","worth","natural","express","indicate","attend","brother","investment","score","organize","trip","sleep","fish","promise","potential","energy","trouble","relation","touch","file","middle","bar","suffer","strategy","deep","clean","fill","star","network","generally","operation","match","avoid","seat","throw","task","normal","goal","associate","positive","option","box","huge","message","instance","style","refer","cold","push","quarter","assume","baby","successful","sing","doubt","competition","theory","propose","reference","argument","adult","fly","document","pattern","application","obviously","bill","search","separate","central","career","speech","officer","throughout","oil","dress","profit","guess","fun","protect","resource","science","disease","balance","damage","basis","author","basic","encourage","hair","operate","reflect","exercise","useful","restaurant","income","property","previous","dark","imagine","earn","daughter","post","newspaper","define","conclusion","everybody","weekend","perform","professional","debate","memory","green","song","object","maintain","credit","ring","discover","dead","afternoon","prefer","extend","possibility","direction","facility","variety","daily","clothes","screen","track","dance","female","responsibility","original","sister","rock","dream","university","easily","agency","dollar","garden","fix","cross","weight","legal","proposal","version","conversation","pound","magazine","shape","sea","immediately","welcome","smile","communication","agent","traditional","replace","judge","suddenly","generation","estimate","favorite","difficulty","purchase","shoot","announce","unless","independent","recommend","survey","majority","stick","request","rich","wind","exchange","budget","famous","blood","appropriate","block","warm","count","scene","writer","content","prevent","safe","invite","mix","element","effective","correct","medical","admit","beat","telephone","copy","committee","aware","advice","handle","glass","trial","stress","radio","administration","complex","text","context","ride","heavy","remove","conduct","equipment","title","extra","executive","chair","expensive","sample","sex","deliver","video","connection","primary","weather","collect","inform","principle","straight","appeal","trust","wonderful","flat","absolutely","flow","fair","additional","responsible","farm","collection","hang","negative","band","relative","tour","alternative","software","pair","ship","attitude","cheap","double","leg","observe","sentence","print","progress","truth","examine","speed","politics","reply","display","transfer","perfect","slightly","overall","intend","user","respond","dinner","slow","regular","physical","apart","suit","federal","reveal","percentage","peace","status","crime","decline","decade","launch","warn","consumer","favor","dry","partner","institution","spot","horse","eventually","heat","reader","importance","distance","guide","grant","taxi","feed","pain","sector","mistake","ensure","satisfy","chief","cool","expert","wave","south","labor","surface","library","excellent","edge","camp","audience","lift","procedure","email","global","struggle","advertise","select","surround","extent","river","annual","fully","contrast","roll","reality","photograph","artist","conflict","entire","presence","crowd","corner","gas","shift","net","category","secretary","defense","quick","cook","spread","nuclear","scale","driver","ball","cry","introduction","requirement","north","confirm","senior","refuse","transport","emerge","map","concept","island","reform","football","survive","flight","solve","background","technique","traffic","improvement","tool","consequence","circumstance","smoke","reaction","rain","busy","lesson","brain","mass","funny","contribute","failure","schedule","speaker","bottom","adopt","combine","mountain","waste","hide","marriage","ticket","meal","colleague","bag","repeat","equal","expression","extremely","owner","plane","commercial","lady","duty","strength","connect","cultural","arrange","scheme","payment","unfortunately","brief","bird","demonstrate","contribution","appreciate","chapter","secret","apparently","novel","union","burn","trend","initial","pleasure","suggestion","critical","gather","earth","essential","desire","promote","currently","employ","path","topic","beach","attract","engage","powerful","flower","crisis","settle","boat","aid","fan","kitchen","twice","fresh","delay","safety","engineer","quiet","insurance","nurse","divide","length","investigation","package","expand","commit","obvious","jump","weapon","relatively","host","winter","district","broad","spring","spirit","lunch","actual","pool","battle","tradition","cash","hardly","award","coach","experiment","consideration","strange","code","possibly","threat","accident","impossible","revenue","enable","afraid","active","conclude","religious","cancer","convince","vary","environmental","sun","healthy","blow","volume","location","invest","proceed","wash","actor","glad","tape","opposite","stone","sum","murder","monitor","soldier","finance","hate","egg","concert","shock","comfortable","usual","carefully","pack","recall","wine","camera","swim","manufacture","theater","cycle","coffee","museum","visitor","freedom","construction","dear","objective","moreover","historical","oppose","branch","vehicle","scientist","route","belong","taste","tonight","fashion","danger","bomb","army","dangerous","decrease","hurt","council","editor","normally","sight","generate","gift","delivery","deny","guest","bedroom","climb","violence","minister","mainly","mouth","noise","manner","gun","square","familiar","ignore","destroy","affair","civil","citizen","temperature","gold","domestic","belief","technical","remind","arrangement","skin","prison","switch","acquire","corporate","fairly","participate","tough","tear","representative","capacity","border","shake","assessment","shoe","fee","hall","regulation","escape","studio","proper","relax","tourist","component","afford","lawyer","suspect","cup","description","confidence","industrial","complain","perspective","error","arrest","assess","register","asset","signal","finger","relevant","explore","leadership","commitment","wake","bright","frame","slowly","bond","hire","hole","tie","internal","chain","literature","victim","threaten","division","secure","device","birth","forest","label","root","factory","expense","channel","investigate","recommendation","rank","typical","friendly","resident","provision","concentrate","plenty","export","entirely","strongly","bridge","consist","graduate","brand","moral","insist","combination","abuse","ice","master","definitely","session","grade","predict","protection","largely","rent","shot","appearance","reasonable","guarantee","theme","judgment","odd","approve","loan","definition","elect","atmosphere","farmer","comparison","characteristic","license","rely","narrow","succeed","identity","desk","permit","seriously","wild","empty","commission","unique","association","instrument","investor","practical","tea","lovely","soft","row","youth","lock","fuel","expectation","employment","celebrate","sexual","shoulder","breath","increasingly","import","bottle","sheet","engine","cast","notion","journey","opposition","relief","debt","honor","outcome","blame","explanation","arise","recover","stretch","declare","retire","tiny","careful","suitable","native","fruit","analyze","witness","mail","terrible","researcher","ordinary","selection","mental","participant","vision","personality","specifically","fat","entry","fellow","chemical","capture","tip","discount","peak","proportion","ear","disappear","shout","yard","constant","significantly","hill","considerable","instruction","intelligence","ideal","surely","guard","somewhat","kiss","presentation","joint","compete","poll","weak","faith","reduction","reserve","complaint","mission","somehow","tone","neighborhood","passenger","justice","phase","thin","rush","formal","religion","employer","reject","latter","plate","ban","steal","protest","index","sad","frequently","circle","helpful","command","attractive","sick","impression","joke","sky","column","electronic","impose","criminal","besides","properly","ancient","coast","ill","kick","closely","multiple","yield","legislation","county","unlike","mobile","assistant","implement","chart","attach","everywhere","advise","household","acknowledge","reward","east","hat","academic","voter","meanwhile","retire","vacation","festival","celebrate","memory","prepare","announce","compete","award"];

// Japanese translations for key NGSL content words
const JP = {
  "people":"人々","year":"年","work":"働く","time":"時間","thing":"もの","make":"作る",
  "way":"方法","find":"見つける","come":"来る","know":"知る","think":"考える","take":"取る",
  "look":"見る","want":"望む","give":"与える","back":"戻る","say":"言う","well":"よく",
  "right":"正しい","good":"良い","need":"必要とする","use":"使う","just":"ただ","first":"最初の",
  "new":"新しい","long":"長い","great":"素晴らしい","feel":"感じる","try":"試みる","tell":"伝える",
  "here":"ここ","something":"何か","many":"多くの","such":"そのような","last":"最後の",
  "call":"呼ぶ","still":"まだ","leave":"去る","lot":"多く","help":"助ける","ask":"尋ねる",
  "start":"始める","meet":"会う","talk":"話す","put":"置く","another":"別の","become":"なる",
  "interest":"興味","country":"国","old":"古い","school":"学校","high":"高い","different":"異なる",
  "end":"終わり","live":"生きる","play":"遊ぶ","home":"家","include":"含む","course":"コース",
  "house":"家","group":"グループ","woman":"女性","around":"周りに","book":"本","family":"家族",
  "seem":"思われる","let":"させる","keep":"保つ","hear":"聞く","system":"システム",
  "question":"質問","always":"いつも","big":"大きい","small":"小さい","study":"勉強する",
  "follow":"従う","begin":"始める","important":"重要な","run":"走る","turn":"回る",
  "bring":"持ってくる","hand":"手","state":"状態","move":"動く","money":"お金","fact":"事実",
  "area":"地域","provide":"提供する","name":"名前","read":"読む","friend":"友人","month":"月",
  "large":"大きい","business":"ビジネス","without":"〜なしで","information":"情報",
  "open":"開く","order":"注文","government":"政府","word":"言葉","issue":"問題","market":"市場",
  "pay":"払う","build":"建てる","hold":"保持する","service":"サービス","believe":"信じる",
  "second":"2番目","love":"愛する","increase":"増加する","job":"仕事","plan":"計画","result":"結果",
  "offer":"提供する","young":"若い","close":"閉じる","program":"プログラム","lead":"導く",
  "buy":"買う","understand":"理解する","thank":"感謝する","today":"今日","student":"学生",
  "face":"顔","hope":"希望","idea":"アイデア","cost":"費用","room":"部屋","reason":"理由",
  "form":"形","spend":"費やす","head":"頭","learn":"学ぶ","level":"レベル","person":"人",
  "experience":"経験","once":"一度","member":"メンバー","enough":"十分な","bad":"悪い",
  "city":"都市","night":"夜","support":"支援する","whether":"〜かどうか","line":"線",
  "present":"現在の","side":"側","quite":"かなり","although":"〜だけれども","term":"期間",
  "low":"低い","speak":"話す","process":"プロセス","public":"公共の","often":"よく",
  "possible":"可能な","actually":"実際に","rather":"むしろ","view":"見方","together":"一緒に",
  "consider":"考慮する","price":"価格","parent":"親","hard":"難しい","party":"パーティー",
  "local":"地元の","control":"制御する","concern":"心配","product":"製品","lose":"失う",
  "story":"物語","continue":"続ける","stand":"立つ","whole":"全体の","rate":"割合",
  "care":"気にする","expect":"期待する","effect":"効果","sort":"種類","cause":"原因",
  "fall":"落ちる","deal":"取引","water":"水","send":"送る","allow":"許可する","watch":"見る",
  "base":"基礎","suggest":"提案する","past":"過去","power":"力","test":"テスト","visit":"訪問する",
  "center":"中心","grow":"成長する","return":"戻る","mother":"母","walk":"歩く","matter":"問題",
  "mind":"心","value":"価値","office":"オフィス","record":"記録","stay":"滞在する","force":"力",
  "stop":"止まる","light":"光","develop":"開発する","remember":"覚えている","share":"共有する",
  "real":"本物の","answer":"答え","sit":"座る","figure":"数字","letter":"手紙","decide":"決める",
  "language":"言語","subject":"科目","class":"クラス","development":"発展","town":"町",
  "half":"半分","minute":"分","food":"食べ物","break":"休憩","clear":"明確な","future":"未来",
  "remain":"残る","top":"上部","win":"勝つ","color":"色","involve":"含む","reach":"到達する",
  "social":"社会的な","period":"時期","note":"メモ","history":"歴史","create":"作る",
  "drive":"運転する","type":"種類","sound":"音","eye":"目","music":"音楽","game":"ゲーム",
  "free":"自由な","receive":"受け取る","moment":"瞬間","sale":"販売","policy":"方針",
  "body":"体","require":"必要とする","wait":"待つ","appear":"現れる","team":"チーム",
  "easy":"簡単な","individual":"個人","full":"満杯の","sense":"感覚","add":"加える",
  "rule":"ルール","pass":"合格する","produce":"生産する","sell":"売る","short":"短い",
  "agree":"同意する","law":"法律","research":"研究","cover":"カバーする","paper":"紙",
  "position":"位置","near":"近い","human":"人間","computer":"コンピューター","situation":"状況",
  "staff":"スタッフ","activity":"活動","film":"映画","morning":"朝","war":"戦争","account":"口座",
  "shop":"店","major":"主要な","design":"デザイン","event":"イベント","special":"特別な",
  "condition":"条件","carry":"運ぶ","choose":"選ぶ","father":"父","decision":"決断",
  "table":"テーブル","forward":"前方へ","main":"主な","cut":"切る","describe":"説明する",
  "available":"利用可能な","strong":"強い","rise":"上がる","girl":"少女","community":"コミュニティ",
  "particular":"特定の","role":"役割","join":"参加する","difficult":"難しい","detail":"詳細",
  "difference":"違い","action":"行動","health":"健康","eat":"食べる","step":"ステップ",
  "true":"本当の","phone":"電話","draw":"描く","practice":"練習","model":"モデル",
  "raise":"上げる","customer":"顧客","front":"前","explain":"説明する","door":"ドア",
  "outside":"外","behind":"後ろに","economic":"経済的な","approach":"アプローチ","teacher":"先生",
  "land":"土地","charge":"料金","finally":"最終的に","sign":"サイン","claim":"主張する",
  "relationship":"関係","travel":"旅行する","enjoy":"楽しむ","death":"死","amount":"量",
  "improve":"改善する","picture":"写真","boy":"少年","organization":"組織","happy":"幸せな",
  "couple":"カップル","act":"行動する","range":"範囲","quality":"質","project":"プロジェクト",
  "round":"丸い","opportunity":"機会","road":"道路","list":"リスト","wish":"望む","wear":"着る",
  "fund":"資金","rest":"休む","industry":"産業","education":"教育","measure":"測る",
  "kill":"殺す","serve":"奉仕する","likely":"ありそうな","national":"国家の","teach":"教える",
  "field":"分野","security":"安全","air":"空気","benefit":"利益","trade":"貿易","risk":"リスク",
  "news":"ニュース","standard":"標準","vote":"投票する","percent":"パーセント","focus":"集中する",
  "stage":"段階","space":"空間","instead":"代わりに","realize":"気づく","usually":"通常",
  "data":"データ","single":"単一の","address":"住所","performance":"パフォーマンス",
  "chance":"チャンス","accept":"受け入れる","society":"社会","technology":"技術",
  "mention":"言及する","choice":"選択","save":"保存する","common":"一般的な","culture":"文化",
  "total":"合計","demand":"要求","material":"材料","limit":"制限する","listen":"聞く",
  "wrong":"間違った","foot":"足","effort":"努力","attention":"注意","check":"確認する",
  "complete":"完了する","pick":"選ぶ","reduce":"減らす","personal":"個人的な","ground":"地面",
  "animal":"動物","arrive":"到着する","patient":"患者","current":"現在の","century":"世紀",
  "evidence":"証拠","exist":"存在する","similar":"似た","fight":"戦う","leader":"リーダー",
  "fine":"罰金","street":"通り","contact":"連絡","wife":"妻","sport":"スポーツ",
  "prepare":"準備する","discuss":"議論する","response":"反応","voice":"声","piece":"部分",
  "finish":"終える","apply":"申し込む","president":"大統領","fire":"火","compare":"比べる",
  "court":"裁判所","police":"警察","store":"店","poor":"貧しい","knowledge":"知識",
  "laugh":"笑う","arm":"腕","heart":"心臓","source":"源","employee":"従業員","manage":"管理する",
  "bank":"銀行","firm":"会社","cell":"細胞","article":"記事","attack":"攻撃","foreign":"外国の",
  "surprise":"驚き","feature":"特徴","factor":"要因","pretty":"かわいい","recently":"最近",
  "affect":"影響する","drop":"落とす","relate":"関連する","official":"公式の","financial":"財政の",
  "miss":"逃す","art":"芸術","campaign":"キャンペーン","private":"私的な","everyone":"全員",
  "forget":"忘れる","page":"ページ","worry":"心配する","summer":"夏","drink":"飲む",
  "opinion":"意見","park":"公園","represent":"代表する","key":"鍵","inside":"内側",
  "manager":"マネージャー","international":"国際的な","contain":"含む","notice":"気づく",
  "wonder":"不思議に思う","nature":"自然","structure":"構造","section":"セクション",
  "exactly":"正確に","plant":"植物","worker":"労働者","press":"押す","necessary":"必要な",
  "region":"地域","growth":"成長","evening":"夕方","influence":"影響","respect":"尊重する",
  "various":"様々な","catch":"捕まえる","skill":"スキル","attempt":"試みる","son":"息子",
  "simple":"簡単な","average":"平均","stock":"在庫","management":"管理","character":"キャラクター",
  "bed":"ベッド","hit":"打つ","establish":"設立する","final":"最終の","economy":"経済",
  "fit":"合う","function":"機能","image":"イメージ","size":"サイズ","behavior":"行動",
  "addition":"追加","determine":"決定する","station":"駅","population":"人口","fail":"失敗する",
  "environment":"環境","production":"生産","contract":"契約","player":"選手","comment":"コメント",
  "enter":"入る","occur":"起きる","alone":"一人で","significant":"重要な","drug":"薬",
  "wall":"壁","series":"シリーズ","direct":"直接の","success":"成功","director":"ディレクター",
  "clearly":"はっきりと","lack":"欠如","review":"レビュー","depend":"依存する","race":"人種",
  "recognize":"認識する","window":"窓","purpose":"目的","department":"部署","gain":"得る",
  "tree":"木","college":"大学","argue":"議論する","board":"ボード","holiday":"休日",
  "mark":"マーク","church":"教会","machine":"機械","achieve":"達成する","item":"アイテム",
  "prove":"証明する","season":"季節","floor":"床","wide":"広い","method":"方法",
  "analysis":"分析","election":"選挙","military":"軍事","hotel":"ホテル","club":"クラブ",
  "movie":"映画","doctor":"医者","discussion":"議論","sorry":"申し訳ない","challenge":"挑戦",
  "nation":"国家","nearly":"ほぼ","statement":"声明","link":"リンク","despite":"〜にもかかわらず",
  "introduce":"紹介する","advantage":"利点","ready":"準備完了","marry":"結婚する",
  "strike":"打つ","seek":"探す","ability":"能力","unit":"単位","card":"カード",
  "hospital":"病院","quickly":"素早く","interview":"面接","agreement":"合意","release":"リリース",
  "tax":"税金","solution":"解決策","capital":"資本","popular":"人気の","specific":"特定の",
  "beautiful":"美しい","fear":"恐怖","aim":"目標","television":"テレビ","serious":"深刻な",
  "target":"目標","degree":"学位","pull":"引っ張る","husband":"夫","access":"アクセス",
  "movement":"動き","treat":"扱う","identify":"識別する","loss":"損失","modern":"現代の",
  "pressure":"圧力","treatment":"治療","supply":"供給する","village":"村","worth":"価値のある",
  "natural":"自然な","express":"表現する","indicate":"示す","attend":"出席する","brother":"兄弟",
  "investment":"投資","score":"スコア","organize":"整理する","trip":"旅行","sleep":"眠る",
  "fish":"魚","promise":"約束する","potential":"潜在的な","energy":"エネルギー","trouble":"問題",
  "relation":"関係","touch":"触れる","file":"ファイル","middle":"中央","bar":"バー",
  "suffer":"苦しむ","strategy":"戦略","deep":"深い","clean":"きれいな","fill":"満たす",
  "star":"星","network":"ネットワーク","generally":"一般的に","operation":"手術","match":"試合",
  "avoid":"避ける","seat":"席","throw":"投げる","task":"タスク","normal":"普通の","goal":"目標",
  "associate":"関連する","positive":"ポジティブな","option":"オプション","box":"箱",
  "huge":"巨大な","message":"メッセージ","instance":"例","style":"スタイル","refer":"参照する",
  "cold":"冷たい","push":"押す","quarter":"四分の一","assume":"仮定する","baby":"赤ちゃん",
  "successful":"成功した","sing":"歌う","doubt":"疑う","competition":"競争","theory":"理論",
  "propose":"提案する","reference":"参照","argument":"議論","adult":"大人","fly":"飛ぶ",
  "document":"文書","pattern":"パターン","application":"申請","obviously":"明らかに","bill":"請求書",
  "search":"検索する","separate":"分ける","central":"中央の","career":"キャリア","speech":"スピーチ",
  "officer":"将校","throughout":"〜を通じて","oil":"石油","dress":"ドレス","profit":"利益",
  "guess":"推測する","fun":"楽しみ","protect":"保護する","resource":"資源","science":"科学",
  "disease":"病気","balance":"バランス","damage":"ダメージ","basis":"基礎","author":"著者",
  "basic":"基本的な","encourage":"励ます","hair":"髪","operate":"操作する","reflect":"反映する",
  "exercise":"運動","useful":"役立つ","restaurant":"レストラン","income":"収入","property":"財産",
  "previous":"以前の","dark":"暗い","imagine":"想像する","earn":"稼ぐ","daughter":"娘",
  "post":"投稿","newspaper":"新聞","define":"定義する","conclusion":"結論","everybody":"全員",
  "weekend":"週末","perform":"実行する","professional":"専門家","debate":"議論","memory":"記憶",
  "green":"緑","song":"歌","object":"物体","maintain":"維持する","credit":"クレジット",
  "ring":"リング","discover":"発見する","dead":"死んだ","afternoon":"午後","prefer":"好む",
  "extend":"延長する","possibility":"可能性","direction":"方向","facility":"施設",
  "variety":"多様性","daily":"毎日の","clothes":"服","screen":"スクリーン","track":"追跡する",
  "dance":"踊る","female":"女性の","responsibility":"責任","original":"元の","sister":"姉妹",
  "rock":"岩","dream":"夢","university":"大学","easily":"簡単に","agency":"機関",
  "dollar":"ドル","garden":"庭","fix":"修正する","cross":"渡る","weight":"重さ","legal":"法的な",
  "proposal":"提案","version":"バージョン","conversation":"会話","pound":"ポンド","magazine":"雑誌",
  "shape":"形","sea":"海","immediately":"すぐに","welcome":"歓迎する","smile":"笑顔",
  "communication":"コミュニケーション","agent":"代理人","traditional":"伝統的な","replace":"置き換える",
  "judge":"裁判官","suddenly":"突然","generation":"世代","estimate":"推定する","favorite":"お気に入り",
  "difficulty":"困難","purchase":"購入する","shoot":"撃つ","announce":"発表する","unless":"〜でない限り",
  "independent":"独立した","recommend":"勧める","survey":"調査","majority":"多数","stick":"棒",
  "request":"要求","rich":"裕福な","wind":"風","exchange":"交換する","budget":"予算",
  "famous":"有名な","blood":"血","appropriate":"適切な","block":"ブロック","warm":"暖かい",
  "count":"数える","scene":"場面","writer":"作家","content":"内容","prevent":"防ぐ","safe":"安全な",
  "invite":"招待する","mix":"混ぜる","element":"要素","effective":"効果的な","correct":"正しい",
  "medical":"医療の","admit":"認める","beat":"打つ","telephone":"電話","copy":"コピー",
  "committee":"委員会","aware":"気づいている","advice":"アドバイス","handle":"取り扱う",
  "glass":"ガラス","trial":"裁判","stress":"ストレス","radio":"ラジオ","administration":"管理",
  "complex":"複雑な","text":"テキスト","context":"文脈","ride":"乗る","heavy":"重い",
  "remove":"取り除く","conduct":"行う","equipment":"機器","title":"タイトル","extra":"余分な",
  "executive":"役員","chair":"椅子","expensive":"高い","sample":"サンプル","sex":"性",
  "deliver":"配達する","video":"ビデオ","connection":"接続","primary":"主な","weather":"天気",
  "collect":"集める","inform":"知らせる","principle":"原則","straight":"まっすぐな",
  "appeal":"訴える","trust":"信頼する","wonderful":"素晴らしい","flat":"平らな","absolutely":"絶対に",
  "flow":"流れる","fair":"公平な","additional":"追加の","responsible":"責任のある","farm":"農場",
  "collection":"コレクション","hang":"掛ける","negative":"否定的な","band":"バンド",
  "relative":"親戚","tour":"ツアー","alternative":"代替","software":"ソフトウェア","pair":"ペア",
  "ship":"船","attitude":"態度","cheap":"安い","double":"2倍","leg":"脚","observe":"観察する",
  "sentence":"文","print":"印刷する","progress":"進歩","truth":"真実","examine":"調べる",
  "speed":"速度","politics":"政治","reply":"返答する","display":"表示する","transfer":"転送する",
  "perfect":"完璧な","slightly":"わずかに","overall":"全体的な","intend":"意図する","user":"ユーザー",
  "respond":"応答する","dinner":"夕食","slow":"遅い","regular":"定期的な","physical":"物理的な",
  "apart":"離れて","suit":"スーツ","federal":"連邦の","reveal":"明らかにする","percentage":"割合",
  "peace":"平和","status":"地位","crime":"犯罪","decline":"減少する","decade":"10年",
  "launch":"開始する","warn":"警告する","consumer":"消費者","favor":"好む","dry":"乾いた",
  "partner":"パートナー","institution":"機関","spot":"スポット","horse":"馬","eventually":"最終的に",
  "heat":"熱","reader":"読者","importance":"重要性","distance":"距離","guide":"ガイド",
  "grant":"助成金","taxi":"タクシー","feed":"養う","pain":"痛み","sector":"セクター",
  "mistake":"間違い","ensure":"確実にする","satisfy":"満足させる","chief":"主要な","cool":"涼しい",
  "expert":"専門家","wave":"波","south":"南","labor":"労働","surface":"表面","library":"図書館",
  "excellent":"優れた","edge":"端","camp":"キャンプ","audience":"観客","lift":"持ち上げる",
  "procedure":"手順","email":"メール","global":"グローバルな","struggle":"闘う","advertise":"広告する",
  "select":"選択する","surround":"囲む","extent":"程度","river":"川","annual":"年次の",
  "fully":"完全に","contrast":"対比","roll":"転がる","reality":"現実","photograph":"写真",
  "artist":"芸術家","conflict":"衝突","entire":"全体の","presence":"存在","crowd":"群衆",
  "corner":"角","gas":"ガス","shift":"シフト","net":"ネット","category":"カテゴリー",
  "secretary":"秘書","defense":"防御","quick":"素早い","cook":"料理する","spread":"広がる",
  "nuclear":"核の","scale":"規模","driver":"ドライバー","ball":"ボール","cry":"泣く",
  "introduction":"紹介","requirement":"要件","north":"北","confirm":"確認する","senior":"上級の",
  "refuse":"断る","transport":"輸送する","emerge":"出現する","map":"地図","concept":"概念",
  "island":"島","reform":"改革","football":"サッカー","survive":"生き残る","flight":"飛行",
  "solve":"解決する","background":"背景","technique":"技術","traffic":"交通","improvement":"改善",
  "tool":"道具","consequence":"結果","circumstance":"状況","smoke":"煙","reaction":"反応",
  "rain":"雨","busy":"忙しい","lesson":"授業","brain":"脳","mass":"大衆","funny":"面白い",
  "contribute":"貢献する","failure":"失敗","schedule":"スケジュール","speaker":"スピーカー",
  "bottom":"底","adopt":"採用する","combine":"組み合わせる","mountain":"山","waste":"廃棄物",
  "hide":"隠す","marriage":"結婚","ticket":"チケット","meal":"食事","colleague":"同僚",
  "bag":"バッグ","repeat":"繰り返す","equal":"等しい","expression":"表現","extremely":"非常に",
  "owner":"オーナー","plane":"飛行機","commercial":"商業の","lady":"女性","duty":"義務",
  "strength":"強さ","connect":"接続する","cultural":"文化的な","arrange":"手配する","scheme":"計画",
  "payment":"支払い","unfortunately":"残念ながら","brief":"簡単な","bird":"鳥",
  "demonstrate":"証明する","contribution":"貢献","appreciate":"感謝する","chapter":"章",
  "secret":"秘密","apparently":"明らかに","novel":"小説","union":"組合","burn":"燃える",
  "trend":"トレンド","initial":"最初の","pleasure":"喜び","suggestion":"提案","critical":"重要な",
  "gather":"集める","earth":"地球","essential":"必須の","desire":"欲望","promote":"促進する",
  "currently":"現在","employ":"雇用する","path":"道","topic":"トピック","beach":"ビーチ",
  "attract":"引き付ける","engage":"携わる","powerful":"力強い","flower":"花","crisis":"危機",
  "settle":"解決する","boat":"ボート","aid":"援助","fan":"ファン","kitchen":"キッチン",
  "twice":"2度","fresh":"新鮮な","delay":"遅延","safety":"安全","engineer":"エンジニア",
  "quiet":"静かな","insurance":"保険","nurse":"看護師","divide":"分ける","length":"長さ",
  "investigation":"調査","package":"パッケージ","expand":"拡大する","commit":"コミットする",
  "obvious":"明らかな","jump":"跳ぶ","weapon":"武器","relatively":"比較的","host":"ホスト",
  "winter":"冬","district":"地区","broad":"広い","spring":"春","spirit":"精神","lunch":"昼食",
  "actual":"実際の","pool":"プール","battle":"戦い","tradition":"伝統","cash":"現金",
  "hardly":"ほとんど〜しない","award":"賞","coach":"コーチ","experiment":"実験",
  "consideration":"考慮","strange":"奇妙な","code":"コード","possibly":"おそらく","threat":"脅威",
  "accident":"事故","impossible":"不可能な","revenue":"収益","enable":"可能にする",
  "afraid":"恐れている","active":"積極的な","conclude":"結論を出す","religious":"宗教的な",
  "cancer":"がん","convince":"説得する","vary":"変化する","environmental":"環境的な","sun":"太陽",
  "healthy":"健康的な","blow":"吹く","volume":"量","location":"場所","invest":"投資する",
  "proceed":"進む","wash":"洗う","actor":"俳優","glad":"嬉しい","tape":"テープ",
  "opposite":"反対の","stone":"石","sum":"合計","murder":"殺人","monitor":"監視する",
  "soldier":"兵士","finance":"財政","hate":"嫌う","egg":"卵","concert":"コンサート",
  "shock":"ショック","comfortable":"快適な","usual":"普通の","carefully":"注意深く",
  "pack":"荷造りする","recall":"思い出す","wine":"ワイン","camera":"カメラ","swim":"泳ぐ",
  "manufacture":"製造する","theater":"劇場","cycle":"サイクル","coffee":"コーヒー",
  "museum":"博物館","visitor":"訪問者","freedom":"自由","construction":"建設","dear":"親愛な",
  "objective":"目的","moreover":"さらに","historical":"歴史的な","oppose":"反対する",
  "branch":"支部","vehicle":"乗り物","scientist":"科学者","route":"ルート","belong":"属する",
  "taste":"味","tonight":"今夜","fashion":"ファッション","danger":"危険","bomb":"爆弾",
  "army":"軍隊","dangerous":"危険な","decrease":"減少する","hurt":"傷つける","council":"評議会",
  "editor":"編集者","normally":"通常","sight":"視野","generate":"生成する","gift":"贈り物",
  "delivery":"配達","deny":"否定する","guest":"ゲスト","bedroom":"寝室","climb":"登る",
  "violence":"暴力","minister":"大臣","mainly":"主に","mouth":"口","noise":"騒音","manner":"方法",
  "gun":"銃","square":"広場","familiar":"親しみのある","ignore":"無視する","destroy":"破壊する",
  "affair":"事件","civil":"市民の","citizen":"市民","temperature":"温度","gold":"金",
  "domestic":"国内の","belief":"信念","technical":"技術的な","remind":"思い出させる",
  "arrangement":"手配","skin":"皮膚","prison":"刑務所","switch":"切り替える","acquire":"取得する",
  "corporate":"企業の","fairly":"かなり","participate":"参加する","tough":"厳しい",
  "tear":"涙","representative":"代表","capacity":"能力","border":"国境","shake":"振る",
  "assessment":"評価","shoe":"靴","fee":"料金","hall":"ホール","regulation":"規制",
  "escape":"逃げる","studio":"スタジオ","proper":"適切な","relax":"リラックスする",
  "tourist":"観光客","component":"コンポーネント","afford":"余裕がある","lawyer":"弁護士",
  "suspect":"疑う","cup":"カップ","description":"説明","confidence":"自信","industrial":"産業の",
  "complain":"不満を言う","perspective":"視点","error":"エラー","arrest":"逮捕する",
  "assess":"評価する","register":"登録する","asset":"資産","signal":"信号","finger":"指",
  "relevant":"関連する","explore":"探る","leadership":"リーダーシップ","commitment":"コミットメント",
  "wake":"起きる","bright":"明るい","frame":"フレーム","slowly":"ゆっくり","bond":"絆",
  "hire":"雇う","hole":"穴","tie":"ネクタイ","internal":"内部の","chain":"チェーン",
  "literature":"文学","victim":"被害者","threaten":"脅す","division":"分割","secure":"安全な",
  "device":"デバイス","birth":"誕生","forest":"森林","label":"ラベル","root":"根",
  "factory":"工場","expense":"費用","channel":"チャンネル","investigate":"調査する",
  "recommendation":"推薦","rank":"ランク","typical":"典型的な","friendly":"親しみやすい",
  "resident":"居住者","provision":"規定","concentrate":"集中する","plenty":"たくさん",
  "export":"輸出する","entirely":"完全に","strongly":"強く","bridge":"橋","consist":"構成される",
  "graduate":"卒業する","brand":"ブランド","moral":"道徳的な","insist":"主張する",
  "combination":"組み合わせ","abuse":"乱用","ice":"氷","master":"マスター","definitely":"絶対に",
  "session":"セッション","grade":"成績","predict":"予測する","protection":"保護",
  "largely":"主に","rent":"家賃","shot":"ショット","appearance":"外見","reasonable":"合理的な",
  "guarantee":"保証する","theme":"テーマ","judgment":"判断","odd":"奇妙な","approve":"承認する",
  "loan":"ローン","definition":"定義","elect":"選出する","atmosphere":"雰囲気","farmer":"農民",
  "comparison":"比較","characteristic":"特徴","license":"ライセンス","rely":"頼る","narrow":"狭い",
  "succeed":"成功する","identity":"アイデンティティ","desk":"デスク","permit":"許可する",
  "seriously":"真剣に","wild":"野生の","empty":"空の","commission":"委員会","unique":"ユニークな",
  "association":"協会","instrument":"楽器","investor":"投資家","practical":"実用的な","tea":"お茶",
  "lovely":"素敵な","soft":"柔らかい","row":"列","youth":"若者","lock":"鍵をかける",
  "fuel":"燃料","expectation":"期待","employment":"雇用","celebrate":"祝う","sexual":"性的な",
  "shoulder":"肩","breath":"息","increasingly":"ますます","import":"輸入する","bottle":"ボトル",
  "sheet":"シート","engine":"エンジン","cast":"キャスト","notion":"概念","journey":"旅",
  "opposition":"反対","relief":"安堵","debt":"借金","honor":"名誉","outcome":"結果",
  "blame":"非難する","explanation":"説明","arise":"生じる","recover":"回復する",
  "stretch":"伸ばす","declare":"宣言する","retire":"退職する","tiny":"小さな","careful":"注意深い",
  "suitable":"適切な","native":"ネイティブの","fruit":"果物","analyze":"分析する","witness":"目撃者",
  "mail":"メール","terrible":"ひどい","researcher":"研究者","ordinary":"普通の","selection":"選択",
  "mental":"精神的な","participant":"参加者","vision":"ビジョン","personality":"個性",
  "specifically":"特に","fat":"脂肪","entry":"入場","fellow":"仲間","chemical":"化学的な",
  "capture":"捉える","tip":"ヒント","discount":"割引","peak":"ピーク","proportion":"割合",
  "ear":"耳","disappear":"消える","shout":"叫ぶ","yard":"庭","constant":"定数",
  "significantly":"大幅に","hill":"丘","considerable":"かなりの","instruction":"指示",
  "intelligence":"知性","ideal":"理想的な","surely":"確かに","guard":"守る",
  "somewhat":"やや","kiss":"キスする","presentation":"プレゼンテーション","joint":"関節",
  "compete":"競争する","poll":"世論調査","weak":"弱い","faith":"信仰","reduction":"削減",
  "reserve":"予約する","complaint":"不満","mission":"使命","somehow":"どうにかして",
  "tone":"トーン","neighborhood":"近所","passenger":"乗客","justice":"正義","phase":"段階",
  "thin":"薄い","rush":"急ぐ","formal":"公式の","religion":"宗教","employer":"雇用者",
  "reject":"拒否する","latter":"後者の","plate":"皿","ban":"禁止する","steal":"盗む",
  "protest":"抗議する","index":"索引","sad":"悲しい","frequently":"頻繁に","circle":"円",
  "helpful":"役立つ","command":"命令する","attractive":"魅力的な","sick":"病気の",
  "impression":"印象","joke":"冗談","sky":"空","column":"列","electronic":"電子の",
  "impose":"課す","criminal":"犯罪者","besides":"さらに","properly":"適切に","ancient":"古代の",
  "coast":"海岸","ill":"病気の","kick":"蹴る","closely":"密接に","multiple":"複数の",
  "yield":"生産する","legislation":"法律","county":"郡","unlike":"〜とは異なり","mobile":"携帯の",
  "assistant":"アシスタント","implement":"実施する","chart":"チャート","attach":"添付する",
  "everywhere":"どこでも","advise":"助言する","household":"世帯","acknowledge":"認める",
  "reward":"報酬","east":"東","hat":"帽子","academic":"学術的な","voter":"有権者",
  "meanwhile":"一方","vacation":"休暇","festival":"祭り","celebrate":"祝う",
  "memory":"記憶","prepare":"準備する","announce":"発表する","compete":"競争する","award":"賞"
};

const PROGRESS_FILE = path.join(__dirname, '..', 'data', '.ngsl-build-progress.json');
const OUTPUT_FILE   = path.join(__dirname, '..', 'data', 'daily.json');

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

// Deduplicate while preserving order
const UNIQUE_WORDS = [...new Set(WORDS)];

async function main() {
  let progress = {};
  if (fs.existsSync(PROGRESS_FILE)) {
    try { progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8')); }
    catch { progress = {}; }
    console.log(`Resuming: ${Object.keys(progress).length} words already done`);
  }

  const total = UNIQUE_WORDS.length;
  let saved = 0;

  for (let i = 0; i < total; i++) {
    const word = UNIQUE_WORDS[i];
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

  // Level split by thirds (frequency-based: level 1 = most common/easiest)
  const third = Math.floor(UNIQUE_WORDS.length / 3);
  const words = UNIQUE_WORDS.map((word, i) => ({
    id: `ngsl${String(i+1).padStart(4,'0')}`,
    word,
    translation: JP[word] || '',
    definition: progress[word] || '',
    level: i < third ? 1 : i < third * 2 ? 2 : 3
  }));

  const output = {
    category: 'daily',
    credit: 'New General Service List v1.01 — Browne, C. & Culligan, B. (2013). CC BY-SA 4.0. http://www.newgeneralservicelist.org',
    words
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\n✅ Done! ${words.length} words written to data/daily.json`);
  fs.unlinkSync(PROGRESS_FILE);
}

main().catch(console.error);
